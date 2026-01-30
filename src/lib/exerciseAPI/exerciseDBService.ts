/**
 * ExerciseDB API Service
 * Integration with RapidAPI ExerciseDB API
 *
 * API: https://rapidapi.com/developer10/api/exercisedb
 * Free tier: 500 requests/day
 */

// API configuration
const EXERCISEDB_API_CONFIG = {
  baseUrl: 'https://exercisedb.p.rapidapi.com',
  apiKey: process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY || '',
  headers: {
    'X-RapidAPI-Key': process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY || '',
    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
  },
};

/**
 * ExerciseDB API Exercise Type (partial - fields we care about)
 */
export interface ExerciseDBExercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

/**
 * Simplified exercise for our database
 */
export interface SimplifiedExercise {
  id: string;
  name: string;
  originalName: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  gifUrl?: string;
  instructions: string[];
}

/**
 * Fetch all exercises from ExerciseDB API
 * Note: API returns 50-100 per page, need to paginate
 */
export async function fetchAllExercisesFromAPI(
  options?: {
    bodyPart?: string;
    equipment?: string;
    limit?: number;
  }
): Promise<ExerciseDBExercise[]> {
  const apiKey = process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY;

  if (!apiKey) {
    console.warn('[ExerciseDB] No API key found. Set EXPO_PUBLIC_EXERCISEDB_API_KEY in .env');
    return [];
  }

  try {
    const url = new URL(`${EXERCISEDB_API_CONFIG.baseUrl}/exercises`);

    if (options?.bodyPart) {
      url.searchParams.append('bodyPart', options.bodyPart);
    }
    if (options?.equipment) {
      url.searchParams.append('equipment', options.equipment);
    }
    if (options?.limit) {
      url.searchParams.append('limit', options.limit.toString());
    }

    const response = await fetch(url.toString(), {
      headers: EXERCISEDB_API_CONFIG.headers,
    });

    if (!response.ok) {
      console.error('[ExerciseDB] API error:', response.status, response.statusText);
      return [];
    }

    const data: ExerciseDBExercise[] = await response.json();
    return data;
  } catch (error) {
    console.error('[ExerciseDB] Fetch error:', error);
    return [];
  }
}

/**
 * Fetch exercises by body part (for incremental sync)
 */
export async function fetchExercisesByBodyPart(
  bodyPart: string
): Promise<ExerciseDBExercise[]> {
  return fetchAllExercisesFromAPI({ bodyPart });
}

/**
 * Get all body parts available in the API
 */
export async function getBodyParts(): Promise<string[]> {
  const apiKey = process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY;

  if (!apiKey) {
    console.warn('[ExerciseDB] No API key found');
    return [];
  }

  try {
    const response = await fetch(`${EXERCISEDB_API_CONFIG.baseUrl}/bodyPartList`, {
      headers: EXERCISEDB_API_CONFIG.headers,
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ExerciseDB] Body parts error:', error);
    return [];
  }
}

/**
 * Available body parts in ExerciseDB
 */
export const BODY_PARTS = [
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

/**
 * Available equipment types (for filtering)
 */
export const EQUIPMENT_TYPES = [
  'assisted',
  'band',
  'barbell',
  'body weight',
  'bosu ball',
  'cable',
  'dumbbell',
  'elliptical',
  'ez barbell',
  'hammer',
  'kettlebell',
  'leverage machine',
  'medicine ball',
  'olympic barbell',
  'resistance band',
  'roller',
  'rope',
  'skierg machine',
  'sled machine',
  'smith machine',
  'stability ball',
  'stationary bike',
  'stepmill machine',
  'tire',
  'trap bar',
  'upper body ergometer',
  'weighted',
  'wheel roller',
];
