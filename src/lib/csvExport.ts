// src/lib/csvExport.ts
// Export workout data to CSV format

import * as FileSystem from "expo-file-system/legacy";
import { Platform, Share } from "react-native";

import type { WorkoutSession, WorkoutSet } from "./workoutModel";
import {
  CSV_HEADER,
  escapeCSV,
  msToIso,
  getExerciseDisplayName,
  type CSVExportResult,
} from "./csvSchema";
import { getWorkoutSessions } from "./stores/workoutStore";
import { getUser } from "./stores/authStore";

// Re-export types for convenience
export type { CSVExportResult } from "./csvSchema";

// ============================================================================
// CSV Generation
// ============================================================================

/**
 * Convert a single set to a CSV row
 */
function setToCSVRow(session: WorkoutSession, set: WorkoutSet): string {
  const values = [
    escapeCSV(session.id),
    escapeCSV(msToIso(session.startedAtMs)),
    escapeCSV(session.startedAtMs),
    escapeCSV(msToIso(session.endedAtMs)),
    escapeCSV(session.endedAtMs),
    escapeCSV(set.id),
    escapeCSV(set.exerciseId),
    escapeCSV(getExerciseDisplayName(set.exerciseId)),
    escapeCSV(set.weightKg.toFixed(2)),
    escapeCSV(set.reps),
    escapeCSV(msToIso(set.timestampMs)),
    escapeCSV(set.timestampMs),
    escapeCSV(session.routineId || ""),
    escapeCSV(session.routineName || ""),
    escapeCSV(session.planId || ""),
    escapeCSV(session.notes || ""),
  ];

  return values.join(",");
}

/**
 * Convert workout sessions to CSV string
 *
 * @param sessions Array of workout sessions to export
 * @returns CSV content as a string
 */
export function sessionsToCSV(sessions: WorkoutSession[]): CSVExportResult {
  try {
    if (!sessions || sessions.length === 0) {
      // Return valid CSV with just header for empty data
      return {
        success: true,
        csvContent: CSV_HEADER + "\n",
        sessionsExported: 0,
        setsExported: 0,
      };
    }

    const lines: string[] = [CSV_HEADER];
    let setsExported = 0;

    // Sort sessions by date (oldest first) for logical reading order
    const sortedSessions = [...sessions].sort(
      (a, b) => a.startedAtMs - b.startedAtMs
    );

    for (const session of sortedSessions) {
      if (!session.sets || session.sets.length === 0) {
        continue;
      }

      for (const set of session.sets) {
        lines.push(setToCSVRow(session, set));
        setsExported++;
      }
    }

    return {
      success: true,
      csvContent: lines.join("\n") + "\n",
      sessionsExported: sortedSessions.length,
      setsExported,
    };
  } catch (error) {
    return {
      success: false,
      csvContent: "",
      sessionsExported: 0,
      setsExported: 0,
      error: error instanceof Error ? error.message : "Unknown export error",
    };
  }
}

/**
 * Export all workout data to CSV string
 *
 * @param userId Optional user ID to filter sessions (if not provided, uses current user)
 * @returns CSV export result
 */
export function exportAllWorkoutsToCSV(userId?: string): CSVExportResult {
  const sessions = getWorkoutSessions();

  // Filter by user if specified
  const userSessions = userId
    ? sessions.filter((s) => s.userId === userId)
    : sessions;

  return sessionsToCSV(userSessions);
}

/**
 * Export current user's workout data to CSV string
 */
export function exportCurrentUserWorkoutsToCSV(): CSVExportResult {
  const user = getUser();
  if (!user) {
    return {
      success: false,
      csvContent: "",
      sessionsExported: 0,
      setsExported: 0,
      error: "No user signed in",
    };
  }

  return exportAllWorkoutsToCSV(user.id);
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * Generate a timestamped filename for export
 */
function generateExportFilename(): string {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
  return `gymrats-export-${dateStr}-${timeStr}.csv`;
}

/**
 * Export result with file path
 */
export interface FileExportResult extends CSVExportResult {
  filePath?: string;
}

/**
 * Export workout data to a CSV file
 *
 * @param userId Optional user ID to filter sessions
 * @returns File export result with file path
 */
export async function exportWorkoutsToFile(
  userId?: string
): Promise<FileExportResult> {
  const csvResult = exportAllWorkoutsToCSV(userId);

  if (!csvResult.success) {
    return { ...csvResult, filePath: undefined };
  }

  try {
    const filename = generateExportFilename();
    const filePath = `${FileSystem.documentDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(filePath, csvResult.csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return {
      ...csvResult,
      filePath,
    };
  } catch (error) {
    return {
      ...csvResult,
      success: false,
      error: error instanceof Error ? error.message : "Failed to write file",
      filePath: undefined,
    };
  }
}

/**
 * Export and share workout data
 *
 * This creates a temporary file and opens the system share sheet
 * Uses React Native's Share API for cross-platform sharing
 *
 * @param userId Optional user ID to filter sessions
 * @returns Export result
 */
export async function exportAndShareWorkouts(
  userId?: string
): Promise<FileExportResult> {
  // Export to file first
  const result = await exportWorkoutsToFile(userId);

  if (!result.success || !result.filePath) {
    return result;
  }

  try {
    // On native platforms, we can share the file using React Native's Share API
    // Note: On iOS/Android, this shares the content as text (file attachment requires expo-sharing)
    // For now, we'll provide the file path and let users access it from the documents directory
    if (Platform.OS !== "web") {
      // Try to share via React Native Share API (shares as text/message)
      await Share.share({
        message: `GymRats Workout Export\n\nYour workout data has been exported to:\n${result.filePath}\n\nThe CSV file contains ${result.sessionsExported} workouts and ${result.setsExported} sets.`,
        title: "GymRats Workout Export",
      });
    }

    return result;
  } catch (error) {
    // If sharing fails, the file is still saved - just return success
    // The user can access the file from the documents directory
    if (__DEV__) {
      console.log("[csvExport] Share dialog cancelled or failed:", error);
    }
    return result;
  }
}

/**
 * Export current user's workouts and share
 */
export async function exportAndShareCurrentUserWorkouts(): Promise<FileExportResult> {
  const user = getUser();
  if (!user) {
    return {
      success: false,
      csvContent: "",
      sessionsExported: 0,
      setsExported: 0,
      error: "No user signed in",
      filePath: undefined,
    };
  }

  return exportAndShareWorkouts(user.id);
}

// ============================================================================
// Web-specific Export (Fallback)
// ============================================================================

/**
 * Trigger a download on web platforms
 * This is a no-op on native platforms (use exportAndShareWorkouts instead)
 */
export function downloadCSVWeb(csvContent: string, filename?: string): boolean {
  if (Platform.OS !== "web") {
    return false;
  }

  try {
    const name = filename || generateExportFilename();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}
