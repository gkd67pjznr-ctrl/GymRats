// src/lib/migration/dataMigrator.ts
// Tools for migrating data from local storage to cloud and importing from other apps

import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../supabase/client";
import { logError } from "../errorHandler";

// Import the new CSV modules for improved import functionality
import {
  parseCSV,
  rowsToSessions,
  importFromCSVContent,
  type CSVImportResult,
} from "../csvImport";

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
 * This uses the new csvImport module for better parsing and validation.
 *
 * @param csvContent CSV file content
 * @param userId User ID for the import
 * @param onProgress Optional progress callback
 * @returns Import result with stats
 *
 * @deprecated Use importFromCSVContent from csvImport.ts for local-only import,
 *             or this function if you need to also sync to cloud.
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

    // Use the new CSV parsing module
    const parseResult = parseCSV(csvContent);

    if (!parseResult.success && parseResult.rows.length === 0) {
      const errorMsg = parseResult.errors.length > 0
        ? parseResult.errors[0].message
        : "Failed to parse CSV";
      return {
        success: false,
        error: errorMsg,
      };
    }

    // Convert to workout sessions
    const sessions = rowsToSessions(parseResult.rows, userId);

    onProgress?.({
      stage: "uploading",
      current: 20,
      total: 100,
      message: `Importing ${sessions.length} workouts...`,
    });

    let importedCount = 0;
    for (const session of sessions) {
      // Upload to cloud with isImported flag
      await uploadWorkoutToCloud(userId, {
        ...session,
        isImported: true,
        importedAt: Date.now(),
        importSource: "csv",
      });
      importedCount++;

      onProgress?.({
        stage: "uploading",
        current: 20 + Math.floor((importedCount / sessions.length) * 80),
        total: 100,
        message: `Importing workout ${importedCount}/${sessions.length}...`,
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

/**
 * Import workouts from CSV to local storage only (no cloud sync)
 * This is the preferred method for most use cases.
 *
 * @param csvContent CSV file content
 * @param userId User ID for the import
 * @returns Import result with detailed statistics
 */
export function importFromCSVLocal(
  csvContent: string,
  userId: string
): CSVImportResult {
  return importFromCSVContent(csvContent, userId);
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
    // Read workouts - try new key first, then fall back to old
    let workoutsJson = await AsyncStorage.getItem("workoutSessions.v2");
    if (!workoutsJson) {
      workoutsJson = await AsyncStorage.getItem("workoutStore.v1");
    }
    if (workoutsJson) {
      const parsed = JSON.parse(workoutsJson);
      data.workouts = parsed.state?.sessions || parsed.state?.workouts || [];
    }

    // Read routines
    const routinesJson = await AsyncStorage.getItem("routinesStore.v1");
    if (routinesJson) {
      const parsed = JSON.parse(routinesJson);
      data.routines = parsed.state?.routines || [];
    }
  } catch (err) {
    if (__DEV__) {
      console.error("[DataMigrator] Error reading local data:", err);
    }
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
    // Include import tracking fields
    is_imported: workout.isImported || false,
    imported_at: workout.importedAt || null,
    import_source: workout.importSource || null,
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

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { importFromCSVContent, pickAndImportCSV } from "../csvImport";
export { exportAndShareCurrentUserWorkouts, sessionsToCSV } from "../csvExport";
export type { CSVImportResult } from "../csvImport";
export type { CSVExportResult } from "../csvSchema";
