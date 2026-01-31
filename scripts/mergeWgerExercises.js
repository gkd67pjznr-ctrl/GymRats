/**
 * Fetch exercises from Wger API and merge with existing exercises
 * Wger: https://wger.de - Open source fitness tracker with ~807 exercises
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const WGER_API = 'https://wger.de/api/v2';
const INPUT_FILE = path.join(__dirname, '../src/data/exercises-raw.json');
const OUTPUT_FILE = path.join(__dirname, '../src/data/exercises-raw.json');

// Load existing exercises
const existingExercises = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
console.log(`📦 Existing exercises: ${existingExercises.length}`);

// Track existing names for deduplication
const existingNames = new Set(existingExercises.map(e => e.name.toLowerCase()));

// Muscle name mapping (wger -> our format)
const MUSCLE_MAP = {
  'Pectoralis major': 'chest',
  'Anterior deltoid': 'shoulders',
  'Posterior deltoid': 'shoulders',
  'Middle deltoid': 'shoulders',
  'Biceps brachii': 'biceps',
  'Triceps brachii': 'triceps',
  'Rectus abdominis': 'abdominals',
  'Obliquus externus abdominis': 'abdominals',
  'Latissimus dorsi': 'lats',
  'Trapezius': 'traps',
  'Rhomboids': 'middle back',
  'Erector spinae': 'lower back',
  'Gluteus maximus': 'glutes',
  'Biceps femoris': 'hamstrings',
  'Semitendinosus': 'hamstrings',
  'Semimembranosus': 'hamstrings',
  'Rectus femoris': 'quadriceps',
  'Vastus lateralis': 'quadriceps',
  'Vastus medialis': 'quadriceps',
  'Gastrocnemius': 'calves',
  'Soleus': 'calves',
  // Add more mappings as needed
};

// Category mapping
const CATEGORY_MAP = {
  'Abs': 'strength',
  'Arms': 'strength',
  'Back': 'strength',
  'Calves': 'strength',
  'Chest': 'strength',
  'Core': 'strength',
  'Forearms': 'strength',
  'Full body': 'strength',
  'Glutes': 'strength',
  'Legs': 'strength',
  'Shoulders': 'strength',
  'Cardio': 'cardio',
  'Stretching': 'stretching',
  'Plyometrics': 'plyometrics',
};

// Equipment mapping
const EQUIPMENT_MAP = {
  'barbell': 'barbell',
  'dumbbell': 'dumbbell',
  'kettlebell': 'kettlebell',
  'cable': 'cable',
  'machine': 'machine',
  'smith machine': 'smith machine',
  'bodyweight': 'bodyweight',
  'body weight': 'bodyweight',
  'pull-up bar': 'bodyweight',
  'ez-bar': 'ez bar',
  'olympic bar': 'barbell',
  'trap bar': 'trap bar',
  'resistance band': 'band',
  'medicine ball': 'medicine ball',
  'swiss ball': 'stability ball',
  'bosu ball': 'bosu ball',
};

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function mapMuscle(muscleName) {
  return MUSCLE_MAP[muscleName] || muscleName.toLowerCase();
}

function getCategoryName(categoryId, categoryMap) {
  return categoryMap[categoryId] || 'strength';
}

function determineForce(primaryMuscles) {
  const pushMuscles = ['chest', 'shoulders', 'triceps', 'quadriceps', 'glutes', 'calves'];
  const pullMuscles = ['back', 'lats', 'biceps', 'hamstrings', 'traps', 'middle back', 'lower back', 'forearms'];

  for (const muscle of primaryMuscles) {
    if (pushMuscles.includes(muscle)) return 'push';
    if (pullMuscles.includes(muscle)) return 'pull';
  }
  return 'static';
}

async function fetchAllWgerExercises() {
  console.log('🏋️ Fetching exercises from Wger API...');

  let url = `${WGER_API}/exerciseinfo/?limit=100`;
  let allExercises = [];
  let pageCount = 0;

  // First, fetch categories for mapping
  const categoriesData = await fetchUrl(`${WGER_API}/exercisecategory/`);
  const categoryMap = {};
  categoriesData.results.forEach(c => {
    categoryMap[c.id] = c.name;
  });

  while (url) {
    pageCount++;
    console.log(`   📄 Page ${pageCount}: ${url.substring(0, 60)}...`);

    const data = await fetchUrl(url);

    for (const exercise of data.results) {
      // Get English translation
      const translation = exercise.translations?.find(t => t.language === 2) || exercise.translations?.[0];
      if (!translation) continue;

      const name = translation.name;
      const lowerName = name.toLowerCase();

      // Skip if already exists
      if (existingNames.has(lowerName)) {
        continue;
      }

      // Map muscles
      const primaryMuscles = exercise.muscles?.map(m => mapMuscle(m.name_en || m.name)) || [];
      const secondaryMuscles = exercise.muscles_secondary?.map(m => mapMuscle(m.name_en || m.name)) || [];

      // Map equipment
      const equipmentNames = exercise.equipment?.map(e => EQUIPMENT_MAP[e.name.toLowerCase()] || e.name.toLowerCase()) || [];

      // Get category
      const categoryName = categoryMap[exercise.category.id] || ' strength';
      const category = CATEGORY_MAP[categoryName] || 'strength';

      // Determine level and mechanic
      const level = primaryMuscles.length > 1 ? 'intermediate' : 'beginner';
      const mechanic = primaryMuscles.length > 1 ? 'compound' : 'isolation';

      // Create exercise in our format
      const newExercise = {
        id: `wger_${exercise.id}`,
        name: name,
        force: determineForce(primaryMuscles),
        level: level,
        mechanic: mechanic,
        equipment: equipmentNames[0] || 'other',
        primaryMuscles: [...new Set(primaryMuscles)],
        secondaryMuscles: [...new Set(secondaryMuscles)],
        instructions: translation.description ? translation.description.split('\n').filter(Boolean) : [],
        category: category,
        images: exercise.images?.map(img => img.image) || [],
      };

      allExercises.push(newExercise);
      existingNames.add(lowerName);
    }

    url = data.next;
  }

  console.log(`✅ Fetched ${allExercises.length} new exercises from ${pageCount} pages`);
  return allExercises;
}

async function main() {
  console.log('🏋️ Wger Exercise Merger');
  console.log('========================\n');

  const startTime = Date.now();

  try {
    const newExercises = await fetchAllWgerExercises();

    // Merge exercises
    const mergedExercises = [...existingExercises, ...newExercises];

    // Sort by name
    mergedExercises.sort((a, b) => a.name.localeCompare(b.name));

    // Write merged file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mergedExercises, null, 2));

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n========================');
    console.log('✅ Merge complete!');
    console.log(`📊 Before: ${existingExercises.length} exercises`);
    console.log(`📊 After:  ${mergedExercises.length} exercises`);
    console.log(`➕ New:    ${newExercises.length} exercises`);
    console.log(`⏱️  Time:   ${elapsed}s`);
    console.log(`💾 Saved:  ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
