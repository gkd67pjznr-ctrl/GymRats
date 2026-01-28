// src/lib/migration/dataMigrator.ts
// Tools for migrating data from local storage to cloud and importing from other apps

import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../supabase/client";
import { logError } from "../errorHandler";

// ============================================================================
// Types
// ============================================================================

/**
 * Migration progress callback
 */
export type MigrationProgressCallback = (progress: MigrationProgress) => void;

/**
 * Migration progress status
 */
export interface MigrationProgress {
  stage: "starting" | "reading" | "uploading" | "syncing" | "complete" | "error";
  current: number;
  total: number;
  message: string;
}

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  error?: string;
  stats?: {
    workouts: number;
    routines: number;
  };
}

/**
 * Local storage data structure
 */
interface LocalData {
  workouts?: any[];
  routines?: any[];
}

// ============================================================================
// Local to Cloud Migration
// ============================================================================

/**
 * Migrate data from AsyncStorage to Supabase cloud
 * Preserves all existing data while syncing to the cloud
 *
 * @param userId User ID for the migration
 * @param onProgress Optional progress callback
 * @returns Migration result with stats
 */
export async function migrateLocalToCloud(
  userId: string,
  onProgress?: MigrationProgressCallback
): Promise<MigrationResult> {
  try {
    onProgress?.({
      stage: "starting",
      current: 0,
      total: 100,
      message: "Preparing migration...",
    });

    // Step 1: Read local data
    onProgress?.({
      stage: "reading",
      current: 10,
      total: 100,
      message: "Reading local data...",
    });

    const localData = await readLocalData();

    const workoutCount = localData.workouts?.length ?? 0;
    const routineCount = localData.routines?.length ?? 0;
    const totalItems = workoutCount + routineCount;

    if (totalItems === 0) {
      return {
        success: true,
        stats: { workouts: 0, routines: 0 },
      };
    }

    // Step 2: Upload data to Supabase
    onProgress?.({
      stage: "uploading",
      current: 20,
      total: 100,
      message: `Uploading ${totalItems} items...`,
    });

    let uploadedCount = 0;

    // Upload workouts
    if (localData.workouts && workoutCount > 0) {
      for (const workout of localData.workouts) {
        await uploadWorkoutToCloud(userId, workout);
        uploadedCount++;

        onProgress?.({
          stage: "uploading",
          current: 20 + Math.floor((uploadedCount / totalItems) * 60),
          total: 100,
          message: `Uploading workouts (${uploadedCount}/${totalItems})...`,
        });
      }
    }

    // Upload routines
    if (localData.routines && routineCount > 0) {
      for (const routine of localData.routines) {
        await uploadRoutineToCloud(userId, routine);
        uploadedCount++;

        onProgress?.({
          stage: "uploading",
          current: 20 + Math.floor((uploadedCount / totalItems) * 60),
          total: 100,
          message: `Uploading routines (${uploadedCount}/${totalItems})...`,
        });
      }
    }

    // Step 3: Trigger sync
    onProgress?.({
      stage: "syncing",
      current: 90,
      total: 100,
      message: "Syncing with cloud...",
    });

    // Sync will be handled automatically by the sync orchestrator
    // We just need to make sure the data is in the database

    onProgress?.({
      stage: "complete",
      current: 100,
      total: 100,
      message: "Migration complete!",
    });

    return {
      success: true,
      stats: {
        workouts: workoutCount,
        routines: routineCount,
      },
    };
  } catch (err) {
    logError({ context: "DataMigrator.migrateLocalToCloud", error: err, userMessage: "Migration failed" });
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ============================================================================
// CSV Import (Strong, Hevy format)
// ============================================================================

/**
 * Import workouts from CSV file (Strong, Hevy format)
 *
 * @param csvContent CSV file content
 * @param userId User ID for the import
 * @param onProgress Optional progress callback
 * @returns Import result with stats
 */
export async function importFromCSV(
  csvContent: string,
  userId: string,
  onProgress?: MigrationProgressCallback
): Promise<MigrationResult> {
  try {
    onProgress?.({
      stage: "starting",
      current: 0,
      total: 100,
      message: "Parsing CSV...",
    });

    const lines = csvContent.split("\n").filter((line) => line.trim());
    const workouts = parseCSVWorkouts(lines);

    onProgress?.({
      stage: "uploading",
      current: 20,
      total: 100,
      message: `Importing ${workouts.length} workouts...`,
    });

    let importedCount = 0;
    for (const workout of workouts) {
      await uploadWorkoutToCloud(userId, workout);
      importedCount++;

      onProgress?.({
        stage: "uploading",
        current: 20 + Math.floor((importedCount / workouts.length) * 80),
        total: 100,
        message: `Importing workout ${importedCount}/${workouts.length}...`,
      });
    }

    onProgress?.({
      stage: "complete",
      current: 100,
      total: 100,
      message: `Imported ${importedCount} workouts!`,
    });

    return {
      success: true,
      stats: { workouts: importedCount, routines: 0 },
    };
  } catch (err) {
    logError({ context: "DataMigrator.importFromCSV", error: err, userMessage: "Import failed" });
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Read all local data from AsyncStorage
 */
async function readLocalData(): Promise<LocalData> {
  const data: LocalData = {};

  try {
    // Read workouts
    const workoutsJson = await AsyncStorage.getItem("workoutStore.v1");
    if (workoutsJson) {
      const parsed = JSON.parse(workoutsJson);
      data.workouts = parsed.state?.workouts || [];
    }

    // Read routines
    const routinesJson = await AsyncStorage.getItem("routinesStore.v1");
    if (routinesJson) {
      const parsed = JSON.parse(routinesJson);
      data.routines = parsed.state?.routines || [];
    }
  } catch (err) {
    console.error("[DataMigrator] Error reading local data:", err);
  }

  return data;
}

/**
 * Upload a workout to Supabase
 */
async function uploadWorkoutToCloud(userId: string, workout: any): Promise<void> {
  const { error } = await supabase.from("workouts").insert({
    user_id: userId,
    started_at: workout.startedAtMs || Date.now(),
    ended_at: workout.endedAtMs || Date.now(),
    sets: workout.sets || [],
    routine_id: workout.routineId || null,
    routine_name: workout.routineName || null,
    plan_id: workout.planId || null,
    completion_pct: workout.completionPct || null,
  });

  if (error) {
    throw error;
  }
}

/**
 * Upload a routine to Supabase
 */
async function uploadRoutineToCloud(userId: string, routine: any): Promise<void> {
  const { error } = await supabase.from("routines").insert({
    user_id: userId,
    name: routine.name || "Imported Routine",
    exercises: routine.exercises || [],
    source_plan_id: routine.sourcePlanId || null,
    source_plan_category: routine.sourcePlanCategory || null,
  });

  if (error) {
    throw error;
  }
}

/**
 * Parse CSV workouts (Strong/Hevy format)
 * Expected format: Date,Exercise,Set,Weight,Reps,Notes
 */
function parseCSVWorkouts(lines: string[]): any[] {
  const workouts: any[] = [];
  const currentWorkoutMap = new Map<string, any>();

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(",");
    if (columns.length < 5) continue;

    const [dateStr, exercise, setStr, weightStr, repsStr] = columns;

    // Create workout key (date + exercise group)
    const key = dateStr;

    if (!currentWorkoutMap.has(key)) {
      currentWorkoutMap.set(key, {
        startedAtMs: new Date(dateStr).getTime(),
        endedAtMs: new Date(dateStr).getTime() + 3600000, // Default 1 hour
        sets: [],
      });
    }

    const workout = currentWorkoutMap.get(key);

    // Add set
    workout.sets.push({
      exerciseId: exercise.toLowerCase().replace(/\s+/g, "_"),
      weightKg: parseFloat(weightStr) || 0,
      reps: parseInt(repsStr) || 0,
      timestampMs: new Date(dateStr).getTime(),
    });
  }

  return Array.from(currentWorkoutMap.values());
}
