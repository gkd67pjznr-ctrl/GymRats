// src/data/muscleGroupsManager.ts
// Manager for muscle group definitions with external sync protection

import {
  MUSCLE_GROUPS as CORE_MUSCLE_GROUPS,
  EXERCISE_MUSCLE_MAPS as CORE_EXERCISE_MUSCLE_MAPS,
  MuscleGroup,
  ExerciseMuscleMap,
  MuscleId
} from './consolidatedMuscleGroups';

// Type for externally synced data
export interface ExternalMuscleGroup {
  id: string;
  name?: string;
  displayName?: string;
  region?: 'upper_front' | 'upper_back' | 'lower_body';
  side?: 'front' | 'back';
  svgPath?: string;
  source?: string;
  lastSynced?: number;
}

export interface ExternalExerciseMap {
  exerciseId: string;
  primary?: string[];
  secondary?: string[];
  tertiary?: string[];
  source?: string;
  lastSynced?: number;
}

// Storage for externally synced data
let externalMuscleGroups: Record<string, ExternalMuscleGroup> = {};
let externalExerciseMaps: Record<string, ExternalExerciseMap> = {};

// Version tracking
let muscleGroupsVersion = 1;
let exerciseMapsVersion = 1;

/**
 * Get muscle groups with priority given to core definitions
 * Falls back to external data if core doesn't have it
 */
export function getMuscleGroups(): MuscleGroup[] {
  // Start with core definitions
  const result: Record<string, MuscleGroup> = {};

  // Add all core muscle groups
  for (const muscle of CORE_MUSCLE_GROUPS) {
    result[muscle.id] = muscle;
  }

  // Add external muscle groups that aren't in core
  for (const [id, externalMuscle] of Object.entries(externalMuscleGroups)) {
    if (!result[id]) {
      // Only use external data if it has the required properties
      if (externalMuscle.id && externalMuscle.name && externalMuscle.displayName) {
        result[id] = {
          id: externalMuscle.id as MuscleId,
          name: externalMuscle.name,
          displayName: externalMuscle.displayName,
          region: externalMuscle.region || 'upper_front',
          side: externalMuscle.side || 'front',
          svgPath: externalMuscle.svgPath || 'M 0 0 L 1 1'
        };
      }
    }
  }

  return Object.values(result);
}

/**
 * Get exercise muscle maps with priority given to core definitions
 * Falls back to external data if core doesn't have it
 */
export function getExerciseMuscleMaps(): Record<string, ExerciseMuscleMap> {
  // Start with core definitions
  const result: Record<string, ExerciseMuscleMap> = { ...CORE_EXERCISE_MUSCLE_MAPS };

  // Add external exercise maps that aren't in core
  for (const [exerciseId, externalMap] of Object.entries(externalExerciseMaps)) {
    if (!result[exerciseId]) {
      // Only use external data if it has the required properties
      if (externalMap.exerciseId && (externalMap.primary || externalMap.secondary)) {
        result[exerciseId] = {
          exerciseId: externalMap.exerciseId,
          primary: (externalMap.primary as MuscleId[]) || [],
          secondary: (externalMap.secondary as MuscleId[]) || [],
          tertiary: (externalMap.tertiary as MuscleId[]) || []
        };
      }
    }
  }

  return result;
}

/**
 * Update muscle groups from external sync
 * Preserves core definitions, only adds new items or updates external items
 */
export function updateMuscleGroupsFromExternal(
  externalGroups: ExternalMuscleGroup[],
  source: string
): void {
  const timestamp = Date.now();

  for (const externalGroup of externalGroups) {
    // Never override core definitions
    const isCore = CORE_MUSCLE_GROUPS.some(m => m.id === externalGroup.id);

    if (!isCore) {
      // Add or update external muscle group
      externalMuscleGroups[externalGroup.id] = {
        ...externalGroup,
        source,
        lastSynced: timestamp
      };
    }
  }

  muscleGroupsVersion++;
}

/**
 * Update exercise muscle maps from external sync
 * Preserves core definitions, only adds new items or updates external items
 */
export function updateExerciseMapsFromExternal(
  externalMaps: ExternalExerciseMap[],
  source: string
): void {
  const timestamp = Date.now();

  for (const externalMap of externalMaps) {
    // Never override core definitions
    const isCore = CORE_EXERCISE_MUSCLE_MAPS[externalMap.exerciseId] !== undefined;

    if (!isCore) {
      // Add or update external exercise map
      externalExerciseMaps[externalMap.exerciseId] = {
        ...externalMap,
        source,
        lastSynced: timestamp
      };
    }
  }

  exerciseMapsVersion++;
}

/**
 * Get core muscle groups (for reference/comparison)
 */
export function getCoreMuscleGroups(): MuscleGroup[] {
  return [...CORE_MUSCLE_GROUPS];
}

/**
 * Get core exercise muscle maps (for reference/comparison)
 */
export function getCoreExerciseMuscleMaps(): Record<string, ExerciseMuscleMap> {
  return { ...CORE_EXERCISE_MUSCLE_MAPS };
}

/**
 * Get external-only muscle groups (for debugging/monitoring)
 */
export function getExternalMuscleGroups(): Record<string, ExternalMuscleGroup> {
  return { ...externalMuscleGroups };
}

/**
 * Get external-only exercise maps (for debugging/monitoring)
 */
export function getExternalExerciseMaps(): Record<string, ExternalExerciseMap> {
  return { ...externalExerciseMaps };
}

/**
 * Get data versions (for cache invalidation)
 */
export function getDataVersions(): { muscleGroups: number; exerciseMaps: number } {
  return {
    muscleGroups: muscleGroupsVersion,
    exerciseMaps: exerciseMapsVersion
  };
}

/**
 * Clear external data (for testing or recovery)
 */
export function clearExternalData(): void {
  externalMuscleGroups = {};
  externalExerciseMaps = {};
  muscleGroupsVersion++;
  exerciseMapsVersion++;
}

/**
 * Validate external muscle group data
 */
export function validateExternalMuscleGroup(group: ExternalMuscleGroup): boolean {
  return (
    typeof group.id === 'string' &&
    group.id.length > 0 &&
    typeof group.name === 'string' &&
    typeof group.displayName === 'string'
  );
}

/**
 * Validate external exercise map data
 */
export function validateExternalExerciseMap(map: ExternalExerciseMap): boolean {
  return (
    typeof map.exerciseId === 'string' &&
    map.exerciseId.length > 0 &&
    Array.isArray(map.primary || []) &&
    Array.isArray(map.secondary || [])
  );
}

// Export the enhanced versions for use in the app
export const MUSCLE_GROUPS = getMuscleGroups();
export const EXERCISE_MUSCLE_MAPS = getExerciseMuscleMaps();