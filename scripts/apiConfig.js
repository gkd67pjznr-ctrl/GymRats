/**
 * Shared API config for ExerciseDB sync scripts
 * Reads from .env file
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse .env file and return value for a key
 */
function getEnvValue(key) {
  const envPath = path.join(__dirname, '../.env');

  if (!fs.existsSync(envPath)) {
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const [envKey, ...valueParts] = trimmed.split('=');
    if (envKey.trim() === key) {
      return valueParts.join('=').trim();
    }
  }

  return null;
}

const EXERCISEDB_API_KEY = getEnvValue('EXPO_PUBLIC_EXERCISEDB_API_KEY');

if (!EXERCISEDB_API_KEY) {
  console.error('⚠️  Warning: EXPO_PUBLIC_EXERCISEDB_API_KEY not found in .env file');
  console.error('   Please add your API key to the .env file:');
  console.error('   EXPO_PUBLIC_EXERCISEDB_API_KEY=your_api_key_here');
  console.error('');
  console.error('   Get your key at: https://rapidapi.com/developer10/api/exercisedb');
  process.exit(1);
}

module.exports = {
  EXERCISEDB_API_KEY,
  BASE_URL: 'https://exercisedb.p.rapidapi.com',
  HOST: 'exercisedb.p.rapidapi.com',
};
