/**
 * ExerciseDB Sync Service
 * Periodically syncs exercises from ExerciseDB API to local database
 *
 * Strategy:
 * 1. Fetch body parts from API
 * 2. For each body part, fetch exercises (rate limited)
 * 3. Simplify exercise names
 * 4. Merge with existing local database
 * 5. Save to local JSON file for app bundling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchAllExercisesFromAPI,
  fetchExercisesByBodyPart,
  getBodyParts,
  BODY_PARTS,
  type ExerciseDBExercise,
} from './exerciseDBService';
import {
  simplifyExerciseName,
  areSameExercise,
} from './nameSimplifier';
import type { ForgerankExercise, MuscleGroup } from '../../data/exerciseTypes';

const SYNC_STATE_KEY = 'exerciseDB_sync_state';
const EXERCISE_CACHE_KEY = 'exerciseDB_cached_exercises';

/**
 * Sync state tracking
 */
interface SyncState {
  lastSyncAt: number | null;
  completedBodyParts: string[];
  totalExercises: number;
  syncInProgress: boolean;
}

/**
 * Default sync state
 */
const DEFAULT_SYNC_STATE: SyncState = {
  lastSyncAt: null,
  completedBodyParts: [],
  totalExercises: 0,
  syncInProgress: false,
};

/**
 * Get current sync state from AsyncStorage
 */
export async function getSyncState(): Promise<SyncState> {
  try {
    const data = await AsyncStorage.getItem(SYNC_STATE_KEY);
    if (data) {
      return { ...DEFAULT_SYNC_STATE, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('[ExerciseDB Sync] Failed to get sync state:', error);
  }
  return DEFAULT_SYNC_STATE;
}

/**
 * Save sync state to AsyncStorage
 */
async function setSyncState(state: SyncState): Promise<void> {
  try {
    await AsyncStorage.setItem(SYNC_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[ExerciseDB Sync] Failed to save sync state:', error);
  }
}

/**
 * Get cached exercises from AsyncStorage
 */
export async function getCachedExercises(): Promise<ExerciseDBExercise[]> {
  try {
    const data = await AsyncStorage.getItem(EXERCISE_CACHE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[ExerciseDB Sync] Failed to get cached exercises:', error);
  }
  return [];
}

/**
 * Save exercises to AsyncStorage cache
 */
async function setCachedExercises(exercises: ExerciseDBExercise[]): Promise<void> {
  try {
    await AsyncStorage.setItem(EXERCISE_CACHE_KEY, JSON.stringify(exercises));
  } catch (error) {
    console.error('[ExerciseDB Sync] Failed to cache exercises:', error);
  }
}

/**
 * Convert ExerciseDB exercise to Forgerank exercise format
 */
function convertToForgerankExercise(
  apiExercise: ExerciseDBExercise,
  isPopular: boolean = false
): ForgerankExercise {
  const { simplified } = simplifyExerciseName(apiExercise.name);

  return {
    id: apiExercise.id,
    name: simplified,
    force: getForceFromBodyPart(apiExercise.bodyPart),
    level: 'intermediate', // ExerciseDB doesn't provide this, default to intermediate
    mechanic: apiExercise.equipment === 'body weight' ? 'compound' : 'isolation',
    equipment: mapEquipment(apiExercise.equipment),
    primaryMuscles: mapToMuscleGroups([apiExercise.target]),
    secondaryMuscles: mapToMuscleGroups(apiExercise.secondaryMuscles || []),
    instructions: apiExercise.instructions || [],
    category: mapToCategory(apiExercise.bodyPart),
    images: apiExercise.gifUrl ? [apiExercise.gifUrl] : [],
    isPopular: isPopular,
    // Note: verifiedTop would need to be set separately based on known standards
  };
}

/**
 * Map body part to force (push/pull/static)
 */
function getForceFromBodyPart(bodyPart: string): 'push' | 'pull' | 'static' {
  const pushParts = ['chest', 'shoulders', 'triceps', 'quadriceps', 'glutes', 'calves'];
  const pullParts = ['back', 'biceps', 'hamstrings', 'traps', 'lats', 'forearms'];
  const staticParts = ['core', 'abs', 'obliques', 'cardio'];

  const lowerBodyPart = bodyPart.toLowerCase();

  if (pushParts.some(p => lowerBodyPart.includes(p))) return 'push';
  if (pullParts.some(p => lowerBodyPart.includes(p))) return 'pull';
  return 'static';
}

/**
 * Map API equipment to our equipment types
 */
function mapEquipment(equipment: string): string {
  const mapping: Record<string, string> = {
    'barbell': 'barbell',
    'dumbbell': 'dumbbell',
    'ez barbell': 'ez bar',
    'olympic barbell': 'barbell',
    'trap bar': 'trap bar',
    'kettlebell': 'kettlebell',
    'cable': 'cable',
    'machine': 'machine',
    'smith machine': 'smith machine',
    'body weight': 'bodyweight',
    'assisted': 'machine',
    'band': 'band',
    'resistance band': 'band',
    'medicine ball': 'medicine ball',
    'stability ball': 'stability ball',
    'bosu ball': 'bosu ball',
  };

  return mapping[equipment.toLowerCase()] || equipment;
}

/**
 * Map body part to category
 */
function mapToCategory(bodyPart: string): 'strength' | 'stretching' | 'cardio' | 'plyometrics' {
  const lowerBodyPart = bodyPart.toLowerCase();

  if (lowerBodyPart.includes('cardio')) return 'cardio';
  if (lowerBodyPart.includes('stretch')) return 'stretching';
  if (lowerBodyPart.includes('plyo') || lowerBodyPart.includes('jump')) return 'plyometrics';

  return 'strength';
}

/**
 * Map API muscle strings to MuscleGroup types
 */
function mapToMuscleGroups(muscles: string[]): MuscleGroup[] {
  const mapping: Record<string, MuscleGroup> = {
    'abs': 'abdominals',
    'abdominals': 'abdominals',
    'biceps': 'biceps',
    'bicep': 'biceps',
    'calves': 'calves',
    'calf': 'calves',
    'chest': 'chest',
    'pectorals': 'chest',
    'pectorals major': 'chest',
    'forearms': 'forearms',
    'forearm': 'forearms',
    'glutes': 'glutes',
    'glute': 'glutes',
    'gluteal': 'glutes',
    'hamstrings': 'hamstrings',
    'hamstring': 'hamstrings',
    'lats': 'lats',
    'latissimus dorsi': 'lats',
    'quadriceps': 'quadriceps',
    'quads': 'quadriceps',
    'quad': 'quadriceps',
    'shoulders': 'shoulders',
    'deltoids': 'shoulders',
    'traps': 'traps',
    'trapezius': 'traps',
    'triceps': 'triceps',
    'tricep': 'triceps',
    'adductors': 'adductors',
    'abductors': 'abductors',
    'lower back': 'lower back',
    'spine': 'lower back',
    'erector spinae': 'lower back',
    'middle back': 'middle back',
    'rhomboids': 'middle back',
    'teres major': 'middle back',
    'teres minor': 'middle back',
    'neck': 'neck',
    'trapezius': 'traps',
  };

  const mapped: MuscleGroup[] = [];

  for (const muscle of muscles) {
    const lower = muscle.toLowerCase().trim();

    // Direct match
    if (mapping[lower]) {
      mapped.push(mapping[lower]);
      continue;
    }

    // Partial match
    for (const [key, value] of Object.entries(mapping)) {
      if (lower.includes(key) || key.includes(lower)) {
        mapped.push(value);
        break;
      }
    }
  }

  // Remove duplicates
  return Array.from(new Set(mapped));
}

/**
 * Sync exercises from API for a specific body part
 */
export async function syncBodyPart(
  bodyPart: string,
  onProgress?: (current: number, total: number, exerciseName: string) => void
): Promise<ExerciseDBExercise[]> {
  const state = await getSyncState();

  if (state.syncInProgress) {
    console.warn('[ExerciseDB Sync] Sync already in progress');
    return [];
  }

  try {
    await setSyncState({ ...state, syncInProgress: true });

    const exercises = await fetchExercisesByBodyPart(bodyPart);
    const cached = await getCachedExercises();

    // Filter out duplicates based on simplified names
    const newExercises = exercises.filter(apiExercise => {
      const simplified = simplifyExerciseName(apiExercise.name).simplified;

      // Check if we already have this exercise (by simplified name)
      const isDuplicate = cached.some(cached =>
        simplifyExerciseName(cached.name).simplified.toLowerCase() === simplified.toLowerCase()
      );

      if (!isDuplicate && onProgress) {
        onProgress(cached.length + 1, cached.length + exercises.length, apiExercise.name);
      }

      return !isDuplicate;
    });

    // Merge with cache
    const mergedExercises = [...cached, ...newExercises];
    await setCachedExercises(mergedExercises);

    // Update sync state
    const newState = await getSyncState();
    await setSyncState({
      ...newState,
      lastSyncAt: Date.now(),
      completedBodyParts: [...new Set([...newState.completedBodyParts, bodyPart])],
      totalExercises: mergedExercises.length,
      syncInProgress: false,
    });

    return newExercises;
  } catch (error) {
    console.error(`[ExerciseDB Sync] Failed to sync ${bodyPart}:`, error);

    // Reset sync state
    const currentState = await getSyncState();
    await setSyncState({ ...currentState, syncInProgress: false });

    return [];
  }
}

/**
 * Initial sync - fetch all body parts
 * Call this once to bootstrap the exercise database
 */
export async function initialSync(
  onProgress?: (current: number, total: number, bodyPart: string) => void
): Promise<{ total: number; new: number }> {
  const state = await getSyncState();

  if (state.syncInProgress) {
    console.warn('[ExerciseDB Sync] Sync already in progress');
    return { total: state.totalExercises, new: 0 };
  }

  const bodyPartsToSync = BODY_PARTS.filter(bp => !state.completedBodyParts.includes(bp));
  let totalNew = 0;

  for (let i = 0; i < bodyPartsToSync.length; i++) {
    const bodyPart = bodyPartsToSync[i];

    if (onProgress) {
      onProgress(i + 1, bodyPartsToSync.length, bodyPart);
    }

    const newExercises = await syncBodyPart(bodyPart);
    totalNew += newExercises.length;

    // Small delay between body parts to be respectful of rate limits
    if (i < bodyPartsToSync.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  const finalState = await getSyncState();
  return { total: finalState.totalExercises, new: totalNew };
}

/**
 * Get all synced exercises as Forgerank format
 */
export async function getSyncedExercises(): Promise<ForgerankExercise[]> {
  const cached = await getCachedExercises();
  return cached.map(convertToForgerankExercise);
}

/**
 * Reset sync state (for testing or starting over)
 */
export async function resetSync(): Promise<void> {
  await AsyncStorage.multiRemove([SYNC_STATE_KEY, EXERCISE_CACHE_KEY]);
}

/**
 * Check if initial sync is complete
 */
export async function isSyncComplete(): Promise<boolean> {
  const state = await getSyncState();
  return BODY_PARTS.every(bp => state.completedBodyParts.includes(bp));
}

/**
 * Get sync progress percentage
 */
export async function getSyncProgress(): Promise<{ completed: number; total: number; percent: number }> {
  const state = await getSyncState();
  const completed = state.completedBodyParts.length;
  const total = BODY_PARTS.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percent };
}
