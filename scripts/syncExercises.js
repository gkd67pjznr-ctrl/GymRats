/**
 * ExerciseDB API Sync Script
 * Run with: node scripts/syncExercises.js
 */

const https = require('https');

const API_KEY = '44fd4a9fecmsh502ff3c161ed2e0p1d49c5jsn9443a4b4b98a';
const BASE_URL = 'https://exercisedb.p.rapidapi.com';

function fetchExercises(bodyPart) {
  return new Promise((resolve, reject) => {
    const url = bodyPart
      ? `${BASE_URL}/exercises?bodyPart=${encodeURIComponent(bodyPart)}&limit=50`
      : `${BASE_URL}/exercises?limit=50`;

    https.get(url, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

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

async function sync() {
  console.log('🏋️ ExerciseDB API Sync');
  console.log('===================\n');

  const BODY_PARTS = [
    'back',
    'cardio',
    'chest',
    'core',
    'forearms',
    'lower arms',
    'lower legs',
    'lower back',
    'neck',
    'shoulders',
    'upper arms',
    'upper legs',
    'upper back',
    'waist',
  ];

  // Test connection first
  console.log('Testing API connection...');
  try {
    const test = await fetchExercises('chest');
    if (Array.isArray(test) && test.length > 0) {
      console.log('✅ API Connected successfully!\n');
      console.log(`Sample exercise: "${test[0].name}"`);
      console.log(`Body part: ${test[0].bodyPart}`);
      console.log(`Equipment: ${test[0].equipment}`);
    } else {
      console.log('❌ API returned unexpected response');
      return;
    }
  } catch (error) {
    console.log('❌ API Connection failed:', error.message);
    return;
  }

  console.log('\nStarting sync...\n');
  let totalExercises = 0;

  // Sync first body part (chest) as example
  console.log(`Syncing: chest...`);
  try {
    const exercises = await fetchExercises('chest');
    console.log(`✅ Fetched ${exercises.length} exercises from chest`);

    // Show sample exercises
    console.log('\nSample exercises:');
    exercises.slice(0, 5).forEach((ex, i) => {
      console.log(`  ${i + 1}. ${ex.name}`);
    });

    totalExercises += exercises.length;
  } catch (error) {
    console.log(`❌ Failed to sync chest:`, error.message);
  }

  console.log('\n===================');
  console.log(`Total exercises fetched: ${totalExercises}`);
  console.log('\n💡 To sync all body parts, run the script multiple times');
  console.log('💡 Or integrate the syncService into your app for incremental sync');
}

sync().catch(console.error);
