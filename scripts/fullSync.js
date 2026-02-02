/**
 * Full ExerciseDB Sync Script
 * Fetches all exercises from all body parts and saves to a local file
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

// Name simplifier (embedded for the script)
function simplifyName(name) {
  const variants = [
    // Grip
    'medium grip', 'narrow grip', 'wide grip', 'neutral grip', 'supinated grip',
    'pronated grip', 'mixed grip', 'reverse grip', 'close grip', 'shoulder width grip',
    'underhand grip', 'overhand grip', 'alternating grip', 'parallel grip', 'v bar grip',
    // Stance
    'narrow stance', 'wide stance', 'shoulder width stance', 'sumo stance',
    'conventional stance', 'split stance', 'single leg', 'one leg', 'unilateral',
    // Position
    'seated', 'standing', 'lying', 'incline', 'decline', 'flat', 'bent over',
    'upright', 'leaning', 'on knees',
    // Other
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

function fetchExercises(bodyPart) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/exercises?bodyPart=${encodeURIComponent(bodyPart)}`;

    const options = {
      hostname: HOST,
      path: `/exercises?bodyPart=${encodeURIComponent(bodyPart)}`,
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
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function fetchAll() {
  return BODY_PARTS.reduce(async (promise, bodyPart) => {
    return promise.then(async (results) => {
      console.log(`📥 Fetching ${bodyPart}...`);
      try {
        const exercises = await fetchExercises(bodyPart);
        console.log(`   ✅ ${exercises.length} exercises`);
        return [...results, { bodyPart, exercises }];
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return results;
      }
    });
  }, Promise.resolve([]));
}

async function main() {
  console.log('🏋️ ExerciseDB Full Sync');
  console.log('========================\n');

  const startTime = Date.now();

  const results = await fetchAll();

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

  console.log('\n========================');
  console.log(`✅ Sync complete!`);
  console.log(`📊 Total exercises: ${totalCount}`);
  console.log(`⏱️  Time taken: ${elapsed}s`);
  console.log(`📁 Body parts: ${results.filter(r => r.exercises?.length > 0).length}/${BODY_PARTS.length}`);

  // Save to file
  const outputPath = path.join(__dirname, '../src/data/exerciseDB-synced.json');
  fs.writeFileSync(outputPath, JSON.stringify(allExercises, null, 2));
  console.log(`\n💾 Saved to: ${outputPath}`);

  // Show sample exercises per body part
  console.log('\n📋 Exercises per body part:');
  results.forEach(({ bodyPart, exercises }) => {
    if (Array.isArray(exercises) && exercises.length > 0) {
      console.log(`  ${bodyPad(bodyPart)}: ${exercises.length} exercises`);
    }
  });

  // Show some sample exercises
  console.log('\n🔟 Sample exercises:');
  allExercises.slice(0, 10).forEach((ex, i) => {
    const simplified = simplifyName(ex.name);
    if (simplified !== ex.name) {
      console.log(`  ${i + 1}. ${ex.name} → "${simplified}"`);
    } else {
      console.log(`  ${i + 1}. ${ex.name}`);
    }
  });
}

function bodyPad(bodyPart) {
  return bodyPart.padEnd(15);
}

main().catch(console.error);
