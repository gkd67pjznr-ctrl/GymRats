// src/data/syncExample.ts
// Example of how to handle external database syncs

import {
  updateMuscleGroupsFromExternal,
  updateExerciseMapsFromExternal,
  validateExternalMuscleGroup,
  validateExternalExerciseMap,
  getDataVersions
} from './muscleGroupsManager';

// Example external API response types
interface ExternalMuscleGroupApiResponse {
  id: string;
  name: string;
  display_name: string;
  region?: string;
  side?: string;
  svg_path?: string;
}

interface ExternalExerciseMapApiResponse {
  exercise_id: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  tertiary_muscles: string[];
}

// Last sync timestamps
let lastMuscleSync = 0;
let lastExerciseSync = 0;

/**
 * Sync muscle groups from external API
 * This function can be called daily or as needed
 */
export async function syncMuscleGroupsFromExternalApi(): Promise<void> {
  try {
    // In a real implementation, this would be an actual API call
    // const response = await fetch('https://external-api.com/muscle-groups');
    // const externalData: ExternalMuscleGroupApiResponse[] = await response.json();

    // Mock data for demonstration
    const externalData: ExternalMuscleGroupApiResponse[] = [
      {
        id: 'new_muscle',
        name: 'New Muscle',
        display_name: 'New Muscle',
        region: 'upper_front',
        side: 'front'
      },
      // This would be ignored since 'upper_chest' is a core definition
      {
        id: 'upper_chest',
        name: 'Hacked Chest',
        display_name: 'Hacked Chest'
      }
    ];

    // Validate and transform external data
    const validExternalGroups = externalData
      .filter(rawGroup => {
        // Basic validation
        const isValid = rawGroup.id && rawGroup.name && rawGroup.display_name;
        if (!isValid) {
          console.warn('Invalid external muscle group data:', rawGroup);
          return false;
        }
        return true;
      })
      .map(rawGroup => ({
        id: rawGroup.id,
        name: rawGroup.name,
        displayName: rawGroup.display_name,
        region: rawGroup.region as any,
        side: rawGroup.side as any,
        svgPath: rawGroup.svg_path
      }));

    // Update muscle groups from external data
    updateMuscleGroupsFromExternal(validExternalGroups, 'external-api');

    // Update last sync timestamp
    lastMuscleSync = Date.now();

    console.log('Successfully synced muscle groups from external API');
  } catch (error) {
    console.error('Failed to sync muscle groups from external API:', error);
    // In a real implementation, you might want to retry or notify
  }
}

/**
 * Sync exercise mappings from external API
 * This function can be called daily or as needed
 */
export async function syncExerciseMapsFromExternalApi(): Promise<void> {
  try {
    // In a real implementation, this would be an actual API call
    // const response = await fetch('https://external-api.com/exercise-mappings');
    // const externalData: ExternalExerciseMapApiResponse[] = await response.json();

    // Mock data for demonstration
    const externalData: ExternalExerciseMapApiResponse[] = [
      {
        exercise_id: 'new_exercise',
        primary_muscles: ['upper_chest'],
        secondary_muscles: ['traps'],
        tertiary_muscles: []
      }
    ];

    // Validate and transform external data
    const validExternalMaps = externalData
      .filter(rawMap => {
        // Basic validation
        const isValid = rawMap.exercise_id && Array.isArray(rawMap.primary_muscles);
        if (!isValid) {
          console.warn('Invalid external exercise map data:', rawMap);
          return false;
        }
        return true;
      })
      .map(rawMap => ({
        exerciseId: rawMap.exercise_id,
        primary: rawMap.primary_muscles,
        secondary: rawMap.secondary_muscles,
        tertiary: rawMap.tertiary_muscles
      }));

    // Update exercise maps from external data
    updateExerciseMapsFromExternal(validExternalMaps, 'external-api');

    // Update last sync timestamp
    lastExerciseSync = Date.now();

    console.log('Successfully synced exercise mappings from external API');
  } catch (error) {
    console.error('Failed to sync exercise mappings from external API:', error);
    // In a real implementation, you might want to retry or notify
  }
}

/**
 * Check if sync is needed based on time or data changes
 */
export function isSyncNeeded(): { muscleGroups: boolean; exerciseMaps: boolean } {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  return {
    muscleGroups: now - lastMuscleSync > oneDay,
    exerciseMaps: now - lastExerciseSync > oneDay
  };
}

/**
 * Perform sync if needed
 */
export async function syncIfNeeded(): Promise<void> {
  const syncStatus = isSyncNeeded();

  if (syncStatus.muscleGroups) {
    await syncMuscleGroupsFromExternalApi();
  }

  if (syncStatus.exerciseMaps) {
    await syncExerciseMapsFromExternalApi();
  }
}

/**
 * Get sync status for monitoring
 */
export function getSyncStatus(): {
  lastMuscleSync: number;
  lastExerciseSync: number;
  dataVersions: { muscleGroups: number; exerciseMaps: number };
} {
  return {
    lastMuscleSync,
    lastExerciseSync,
    dataVersions: getDataVersions()
  };
}

// Example usage:
// syncIfNeeded().then(() => {
//   console.log('Sync completed');
//   console.log('Current sync status:', getSyncStatus());
// });