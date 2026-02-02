/**
 * Full ExerciseDB Sync Script - Paginated
 * Fetches ALL exercises by paginating through results
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { EXERCISEDB_API_KEY, HOST } = require('./apiConfig');

const BODY_PARTS = [
  'back', 'cardio', 'chest', 'core', 'forearms', 'lower arms',
  'lower legs', 'lower back', 'neck', 'shoulders', 'upper arms',
  'upper legs', 'upper back', 'waist'
];

// Name simplifier
function simplifyName(name) {
  const variants = [
    'medium grip', 'narrow grip', 'wide grip', 'neutral grip', 'supinated grip',
    'pronated grip', 'mixed grip', 'reverse grip', 'close grip', 'shoulder width grip',
    'underhand grip', 'overhand grip', 'alternating grip', 'parallel grip',
    'narrow stance', 'wide stance', 'shoulder width stance', 'sumo stance',
    'conventional stance', 'split stance', 'single leg', 'one leg', 'unilateral',
    'seated', 'standing', 'lying', 'incline', 'decline', 'flat', 'bent over',
    'upright', 'leaning', 'on knees',
    'with bands', 'with chains', 'with dumbbells', 'with barbell', 'with cable',
    'with ez bar', 'with machine', 'behind neck', 'behind head', 'to chest',
    'to chin', 'to floor', 'to hip', 'to knees',
  ];

  let simplified = name;
  for (const variant of variants) {
    const regex = new RegExp(`\\s*[-–—]?\\s*${variant}\\s*`, 'gi');
    simplified = simplified.replace(regex, ' ');
  }
  return simplified.replace(/\s+/g, ' ').trim();
}

function fetchExercisesPaginated(bodyPart) {
  return new Promise((resolve, reject) => {
    let offset = 0;
    const limit = 50; // Max per request
    let allExercises = [];

    const fetchPage = (offset) => {
      const options = {
        hostname: HOST,
        path: `/exercises?bodyPart=${encodeURIComponent(bodyPart)}&offset=${offset}&limit=${limit}`,
        method: 'GET',
        headers: {
          'x-rapidapi-key': EXERCISEDB_API_KEY,
          'x-rapidapi-host': HOST,
        }
      };

      https.get(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);

            if (!Array.isArray(json)) {
              resolve(allExercises);
              return;
            }

            if (json.length === 0) {
              resolve(allExercises);
              return;
            }

            allExercises.push(...json);
            console.log(`   📦 Page ${Math.floor(offset/limit) + 1}: +${json.length} exercises`);

            // Fetch next page
            fetchPage(offset + json.length);
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', (err) => {
        console.log(`   ❌ Error at offset ${offset}: ${err.message}`);
        resolve(allExercises); // Return what we have so far
      });
    };

    fetchPage(0);
  });
}

async function fetchAllBodyParts(onProgress) {
  const results = [];

  for (let i = 0; i < BODY_PARTS.length; i++) {
    const bodyPart = BODY_PARTS[i];

    console.log(`📥 Fetching ${bodyPart}...`);

    if (onProgress) {
      onProgress(i + 1, BODY_PARTS.length, bodyPart);
    }

    try {
      const exercises = await fetchExercisesPaginated(bodyPart);
      console.log(`   ✅ Total: ${exercises.length} exercises`);
      results.push({ bodyPart, exercises });
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // Small delay between body parts (rate limit courtesy)
    if (i < BODY_PARTS.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return results;
}

async function main() {
  console.log('🏋️ ExerciseDB Full Sync (Paginated)');
  console.log('====================================\n');

  const startTime = Date.now();

  const results = await fetchAllBodyParts((current, total, bodyPart) => {
    console.log(`\n[Progress: ${current}/${total}]`);
  });

  // Flatten all exercises
  const allExercises = [];
  let totalCount = 0;

  results.forEach(({ bodyPart, exercises }) => {
    if (Array.isArray(exercises)) {
      allExercises.push(...exercises.map(ex => ({
        ...ex,
        simplifiedName: simplifyName(ex.name)
      })));
      totalCount += exercises.length;
    }
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n====================================');
  console.log(`✅ Sync complete!`);
  console.log(`📊 Total exercises: ${totalCount}`);
  console.log(`⏱️  Time taken: ${elapsed}s`);
  console.log(`📁 Body parts: ${results.filter(r => r.exercises?.length > 0).length}/${BODY_PARTS.length}`);

  // Save to file
  const outputPath = path.join(__dirname, '../src/data/exerciseDB-synced.json');
  fs.writeFileSync(outputPath, JSON.stringify(allExercises, null, 2));
  console.log(`\n💾 Saved to: ${outputPath}`);

  // Show exercises per body part
  console.log('\n📋 Exercises per body part:');
  results.forEach(({ bodyPart, exercises }) => {
    if (Array.isArray(exercises)) {
      const total = exercises.length;
      console.log(`  ${bodyPad(bodyPart)}: ${total} exercises`);
    }
  });

  // Show name simplification examples
  console.log('\n🔟 Name simplification examples:');
  const simplifiedExamples = allExercises
    .filter(ex => ex.simplifiedName !== ex.name)
    .slice(0, 15);

  simplifiedExamples.forEach((ex, i) => {
    console.log(`  "${ex.name}" → "${ex.simplifiedName}"`);
  });
}

function bodyPad(bodyPart) {
  return bodyPart.padEnd(15);
}

main().catch(console.error);
