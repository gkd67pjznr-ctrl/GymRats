// src/lib/csvImport.ts
// Import workout data from CSV files

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

import type { WorkoutSession, WorkoutSet } from "./workoutModel";
import { uid } from "./uid";
import {
  CSV_COLUMNS,
  parseCSVLine,
  isoToMs,
  parseNumeric,
  normalizeExerciseName,
  type ParsedCSVRow,
  type CSVParseResult,
  type CSVParseError,
  type CSVImportResult,
} from "./csvSchema";

// Re-export types for convenience
export type { CSVImportResult, CSVParseResult, CSVParseError, ParsedCSVRow } from "./csvSchema";
import { addWorkoutSessions, getWorkoutSessions } from "./stores/workoutStore";
import { getUser } from "./stores/authStore";

// ============================================================================
// CSV Parsing
// ============================================================================

/**
 * Detect if CSV is in Strong/Hevy format vs GymRats format
 *
 * Strong/Hevy format: Date,Exercise,Set,Weight,Reps,Notes
 * GymRats format: session_id,session_start,session_start_ms,...
 */
function detectCSVFormat(headerLine: string): "gymrats" | "strong" | "unknown" {
  const lower = headerLine.toLowerCase();

  if (lower.includes("session_id") && lower.includes("session_start")) {
    return "gymrats";
  }

  if (lower.includes("date") && lower.includes("exercise") && lower.includes("weight") && lower.includes("reps")) {
    return "strong";
  }

  return "unknown";
}

/**
 * Parse GymRats CSV format
 */
function parseGymRatsCSV(lines: string[]): CSVParseResult {
  const rows: ParsedCSVRow[] = [];
  const errors: CSVParseError[] = [];
  const warnings: string[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const columns = parseCSVLine(line);

      if (columns.length < 10) {
        errors.push({
          line: i + 1,
          message: `Insufficient columns (${columns.length}), expected at least 10`,
          raw: line,
        });
        continue;
      }

      const [
        sessionId,
        sessionStart,
        sessionStartMs,
        sessionEnd,
        sessionEndMs,
        setId,
        exerciseId,
        exerciseName,
        weightKg,
        reps,
        setTimestamp,
        setTimestampMs,
        routineId,
        routineName,
        planId,
        notes,
      ] = columns;

      // Parse timestamps - prefer ms, fall back to ISO
      let startMs = parseNumeric(sessionStartMs);
      if (!startMs || startMs <= 0) {
        startMs = isoToMs(sessionStart);
      }

      let endMs = parseNumeric(sessionEndMs);
      if (!endMs || endMs <= 0) {
        endMs = isoToMs(sessionEnd);
      }

      let setTs = parseNumeric(setTimestampMs);
      if (!setTs || setTs <= 0) {
        setTs = isoToMs(setTimestamp);
      }

      // Validate required numeric fields
      const weight = parseNumeric(weightKg);
      const repCount = parseNumeric(reps);

      if (repCount <= 0) {
        errors.push({
          line: i + 1,
          column: "reps",
          message: "Invalid reps value",
          raw: line,
        });
        continue;
      }

      // Normalize exercise ID
      const normalizedExerciseId = normalizeExerciseName(exerciseId || exerciseName);

      if (!normalizedExerciseId) {
        errors.push({
          line: i + 1,
          column: "exercise_id",
          message: "Missing exercise identifier",
          raw: line,
        });
        continue;
      }

      rows.push({
        sessionId: sessionId || uid(),
        sessionStartMs: startMs || Date.now(),
        sessionEndMs: endMs || Date.now(),
        setId: setId || uid(),
        exerciseId: normalizedExerciseId,
        exerciseName: exerciseName || normalizedExerciseId,
        weightKg: weight,
        reps: repCount,
        setTimestampMs: setTs || startMs || Date.now(),
        routineId: routineId || undefined,
        routineName: routineName || undefined,
        planId: planId || undefined,
        notes: notes || undefined,
      });
    } catch (err) {
      errors.push({
        line: i + 1,
        message: err instanceof Error ? err.message : "Parse error",
        raw: line,
      });
    }
  }

  return { success: errors.length === 0, rows, errors, warnings };
}

/**
 * Parse Strong/Hevy CSV format
 * Expected format: Date,Exercise,Set,Weight,Reps,Notes (and variations)
 */
function parseStrongCSV(lines: string[]): CSVParseResult {
  const rows: ParsedCSVRow[] = [];
  const errors: CSVParseError[] = [];
  const warnings: string[] = [];

  // Parse header to find column indices
  const header = parseCSVLine(lines[0].toLowerCase());
  const dateIdx = header.findIndex(h => h.includes("date") || h.includes("time"));
  const exerciseIdx = header.findIndex(h => h.includes("exercise") || h.includes("name"));
  const weightIdx = header.findIndex(h => h.includes("weight") && !h.includes("body"));
  const repsIdx = header.findIndex(h => h.includes("reps") || h.includes("rep"));
  const notesIdx = header.findIndex(h => h.includes("notes") || h.includes("note"));

  if (dateIdx === -1 || exerciseIdx === -1 || weightIdx === -1 || repsIdx === -1) {
    errors.push({
      line: 1,
      message: "Could not find required columns (date, exercise, weight, reps)",
    });
    return { success: false, rows, errors, warnings };
  }

  // Track sessions by date to group sets
  const sessionMap = new Map<string, { startMs: number; rows: ParsedCSVRow[] }>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const columns = parseCSVLine(line);

      const dateStr = columns[dateIdx]?.trim();
      const exerciseName = columns[exerciseIdx]?.trim();
      const weightStr = columns[weightIdx]?.trim();
      const repsStr = columns[repsIdx]?.trim();
      const notes = notesIdx >= 0 ? columns[notesIdx]?.trim() : undefined;

      if (!dateStr || !exerciseName) {
        errors.push({
          line: i + 1,
          message: "Missing date or exercise",
          raw: line,
        });
        continue;
      }

      // Parse date
      const dateMs = isoToMs(dateStr) || new Date(dateStr).getTime();
      if (!dateMs || isNaN(dateMs)) {
        errors.push({
          line: i + 1,
          column: "date",
          message: `Invalid date format: ${dateStr}`,
          raw: line,
        });
        continue;
      }

      // Parse weight - handle different unit markers (kg, lb, lbs)
      let weightKg = parseNumeric(weightStr.replace(/[^\d.]/g, ""));
      const hasLbs = weightStr.toLowerCase().includes("lb");
      if (hasLbs && weightKg > 0) {
        // Convert lbs to kg
        weightKg = weightKg * 0.45359237;
      }

      // Parse reps
      const repCount = parseNumeric(repsStr);
      if (repCount <= 0) {
        errors.push({
          line: i + 1,
          column: "reps",
          message: "Invalid reps value",
          raw: line,
        });
        continue;
      }

      // Normalize exercise ID
      const exerciseId = normalizeExerciseName(exerciseName);

      // Use date as session key (group all sets from same date into one session)
      const dateKey = new Date(dateMs).toISOString().split("T")[0];

      if (!sessionMap.has(dateKey)) {
        sessionMap.set(dateKey, {
          startMs: dateMs,
          rows: [],
        });
      }

      const session = sessionMap.get(dateKey)!;
      session.rows.push({
        sessionId: "", // Will be assigned later
        sessionStartMs: session.startMs,
        sessionEndMs: session.startMs + 3600000, // Default 1 hour
        setId: uid(),
        exerciseId,
        exerciseName,
        weightKg,
        reps: repCount,
        setTimestampMs: dateMs,
        notes,
      });
    } catch (err) {
      errors.push({
        line: i + 1,
        message: err instanceof Error ? err.message : "Parse error",
        raw: line,
      });
    }
  }

  // Convert session map to rows with proper session IDs
  for (const [dateKey, session] of sessionMap) {
    const sessionId = uid();
    for (const row of session.rows) {
      rows.push({
        ...row,
        sessionId,
      });
    }
  }

  if (rows.length > 0 && lines.length > 1) {
    warnings.push(`Detected Strong/Hevy format. Imported ${rows.length} sets from ${sessionMap.size} sessions.`);
  }

  return { success: errors.length === 0 || rows.length > 0, rows, errors, warnings };
}

/**
 * Parse CSV content and return structured data
 */
export function parseCSV(content: string): CSVParseResult {
  const lines = content.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    return {
      success: false,
      rows: [],
      errors: [{ line: 0, message: "Empty CSV file" }],
      warnings: [],
    };
  }

  if (lines.length === 1) {
    return {
      success: true,
      rows: [],
      errors: [],
      warnings: ["CSV file contains only header row, no data to import"],
    };
  }

  const format = detectCSVFormat(lines[0]);

  if (format === "gymrats") {
    return parseGymRatsCSV(lines);
  }

  if (format === "strong") {
    return parseStrongCSV(lines);
  }

  // Try Strong format as fallback (most common external format)
  const result = parseStrongCSV(lines);
  if (result.rows.length > 0) {
    result.warnings.push("CSV format was auto-detected. If data looks incorrect, ensure your CSV has proper headers.");
    return result;
  }

  return {
    success: false,
    rows: [],
    errors: [{ line: 1, message: "Unrecognized CSV format. Ensure headers match GymRats or Strong/Hevy format." }],
    warnings: [],
  };
}

// ============================================================================
// Transformation to WorkoutSession
// ============================================================================

/**
 * Convert parsed CSV rows to WorkoutSession objects
 */
export function rowsToSessions(rows: ParsedCSVRow[], userId: string): WorkoutSession[] {
  if (rows.length === 0) return [];

  // Group rows by session ID
  const sessionMap = new Map<string, { row: ParsedCSVRow; sets: ParsedCSVRow[] }>();

  for (const row of rows) {
    if (!sessionMap.has(row.sessionId)) {
      sessionMap.set(row.sessionId, { row, sets: [] });
    }
    sessionMap.get(row.sessionId)!.sets.push(row);
  }

  // Convert to WorkoutSession objects
  const sessions: WorkoutSession[] = [];
  const now = Date.now();

  for (const [sessionId, { row, sets }] of sessionMap) {
    // Calculate session times from sets if not provided
    const setTimes = sets.map(s => s.setTimestampMs).filter(t => t > 0);
    const startMs = row.sessionStartMs || Math.min(...setTimes) || now;
    const endMs = row.sessionEndMs || Math.max(...setTimes) || startMs + 3600000;

    const workoutSets: WorkoutSet[] = sets.map(s => ({
      id: s.setId || uid(),
      exerciseId: s.exerciseId,
      weightKg: s.weightKg,
      reps: s.reps,
      timestampMs: s.setTimestampMs || startMs,
    }));

    // Sort sets by timestamp
    workoutSets.sort((a, b) => a.timestampMs - b.timestampMs);

    sessions.push({
      id: sessionId,
      userId,
      startedAtMs: startMs,
      endedAtMs: endMs,
      sets: workoutSets,
      routineId: row.routineId,
      routineName: row.routineName,
      planId: row.planId,
      notes: row.notes,
      // Mark as imported
      isImported: true,
      importedAt: now,
      importSource: "csv",
    });
  }

  // Sort sessions by start time
  sessions.sort((a, b) => a.startedAtMs - b.startedAtMs);

  return sessions;
}

// ============================================================================
// Import Functions
// ============================================================================

/**
 * Import workout sessions from CSV content
 *
 * @param csvContent CSV file content as string
 * @param userId User ID for the imported sessions
 * @returns Import result with statistics
 */
export function importFromCSVContent(csvContent: string, userId: string): CSVImportResult {
  // Parse CSV
  const parseResult = parseCSV(csvContent);

  if (!parseResult.success && parseResult.rows.length === 0) {
    return {
      success: false,
      sessionsImported: 0,
      setsImported: 0,
      sessionsSkipped: 0,
      errors: parseResult.errors,
      warnings: parseResult.warnings,
    };
  }

  // Convert to sessions
  const sessions = rowsToSessions(parseResult.rows, userId);

  if (sessions.length === 0) {
    return {
      success: true,
      sessionsImported: 0,
      setsImported: 0,
      sessionsSkipped: 0,
      errors: parseResult.errors,
      warnings: [...parseResult.warnings, "No valid sessions to import"],
    };
  }

  // Check for duplicates
  const existingSessions = getWorkoutSessions();
  const existingIds = new Set(existingSessions.map(s => s.id));

  const newSessions = sessions.filter(s => !existingIds.has(s.id));
  const skippedCount = sessions.length - newSessions.length;

  if (skippedCount > 0) {
    parseResult.warnings.push(`Skipped ${skippedCount} duplicate sessions`);
  }

  // Add to store
  if (newSessions.length > 0) {
    addWorkoutSessions(newSessions);
  }

  const setsImported = newSessions.reduce((acc, s) => acc + s.sets.length, 0);

  return {
    success: true,
    sessionsImported: newSessions.length,
    setsImported,
    sessionsSkipped: skippedCount,
    errors: parseResult.errors,
    warnings: parseResult.warnings,
  };
}

/**
 * Import for current user from CSV content
 */
export function importForCurrentUser(csvContent: string): CSVImportResult {
  const user = getUser();

  if (!user) {
    return {
      success: false,
      sessionsImported: 0,
      setsImported: 0,
      sessionsSkipped: 0,
      errors: [{ line: 0, message: "No user signed in" }],
      warnings: [],
    };
  }

  return importFromCSVContent(csvContent, user.id);
}

// ============================================================================
// File Picker Integration
// ============================================================================

/**
 * Pick a CSV file using document picker
 *
 * @returns File content or null if cancelled/error
 */
export async function pickCSVFile(): Promise<{
  success: boolean;
  content?: string;
  filename?: string;
  error?: string;
}> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["text/csv", "text/comma-separated-values", "application/csv", "*/*"],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { success: false, error: "File selection cancelled" };
    }

    const file = result.assets[0];

    // Read file content
    const content = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return {
      success: true,
      content,
      filename: file.name,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to pick file",
    };
  }
}

/**
 * Pick a CSV file and import for current user
 *
 * @returns Import result
 */
export async function pickAndImportCSV(): Promise<CSVImportResult> {
  const pickResult = await pickCSVFile();

  if (!pickResult.success || !pickResult.content) {
    return {
      success: false,
      sessionsImported: 0,
      setsImported: 0,
      sessionsSkipped: 0,
      errors: [{ line: 0, message: pickResult.error || "No file selected" }],
      warnings: [],
    };
  }

  const importResult = importForCurrentUser(pickResult.content);

  // Add filename to warnings for context
  if (pickResult.filename) {
    importResult.warnings.unshift(`Importing from: ${pickResult.filename}`);
  }

  return importResult;
}
