// src/lib/csvSchema.ts
// CSV format definitions and types for workout data export/import

import { getAllExercises, getExerciseById, resolveExerciseId } from "@/src/data/exerciseDatabase";
import type { WorkoutSession, WorkoutSet } from "./workoutModel";

// ============================================================================
// CSV Column Definitions
// ============================================================================

/**
 * CSV column names for workout export
 * This is the canonical format for GymRats CSV exports
 */
export const CSV_COLUMNS = [
  "session_id",
  "session_start",
  "session_start_ms",
  "session_end",
  "session_end_ms",
  "set_id",
  "exercise_id",
  "exercise_name",
  "weight_kg",
  "reps",
  "set_timestamp",
  "set_timestamp_ms",
  "routine_id",
  "routine_name",
  "plan_id",
  "notes",
] as const;

export type CSVColumn = (typeof CSV_COLUMNS)[number];

/**
 * CSV header string
 */
export const CSV_HEADER = CSV_COLUMNS.join(",");

// ============================================================================
// Types
// ============================================================================

/**
 * A single row in the CSV file (denormalized: one row per set)
 */
export interface CSVRow {
  session_id: string;
  session_start: string; // ISO 8601
  session_start_ms: number;
  session_end: string; // ISO 8601
  session_end_ms: number;
  set_id: string;
  exercise_id: string;
  exercise_name: string;
  weight_kg: number;
  reps: number;
  set_timestamp: string; // ISO 8601
  set_timestamp_ms: number;
  routine_id: string;
  routine_name: string;
  plan_id: string;
  notes: string;
}

/**
 * Parsed CSV data before transformation to WorkoutSession
 */
export interface ParsedCSVRow {
  sessionId: string;
  sessionStartMs: number;
  sessionEndMs: number;
  setId: string;
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  setTimestampMs: number;
  routineId?: string;
  routineName?: string;
  planId?: string;
  notes?: string;
}

/**
 * Result of CSV parsing/validation
 */
export interface CSVParseResult {
  success: boolean;
  rows: ParsedCSVRow[];
  errors: CSVParseError[];
  warnings: string[];
}

/**
 * CSV parsing error
 */
export interface CSVParseError {
  line: number;
  column?: string;
  message: string;
  raw?: string;
}

/**
 * Import result with statistics
 */
export interface CSVImportResult {
  success: boolean;
  sessionsImported: number;
  setsImported: number;
  sessionsSkipped: number;
  errors: CSVParseError[];
  warnings: string[];
}

/**
 * Export result
 */
export interface CSVExportResult {
  success: boolean;
  csvContent: string;
  sessionsExported: number;
  setsExported: number;
  error?: string;
}

// ============================================================================
// Exercise Name Normalization
// ============================================================================

/**
 * Common exercise name variations mapped to canonical IDs
 */
const EXERCISE_NAME_MAP: Record<string, string> = {
  // Bench Press variations
  "bench press": "Barbell_Bench_Press_-_Medium_Grip",
  "barbell bench press": "Barbell_Bench_Press_-_Medium_Grip",
  "flat bench press": "Barbell_Bench_Press_-_Medium_Grip",
  "flat bench": "Barbell_Bench_Press_-_Medium_Grip",
  "bench": "bench", // Legacy ID

  // Squat variations
  "squat": "Barbell_Full_Squat",
  "back squat": "Barbell_Full_Squat",
  "barbell squat": "Barbell_Full_Squat",
  "barbell back squat": "Barbell_Full_Squat",

  // Deadlift variations
  "deadlift": "Barbell_Deadlift",
  "conventional deadlift": "Barbell_Deadlift",
  "barbell deadlift": "Barbell_Deadlift",

  // Overhead Press variations
  "overhead press": "Standing_Military_Press",
  "ohp": "Standing_Military_Press",
  "military press": "Standing_Military_Press",
  "standing press": "Standing_Military_Press",
  "shoulder press": "Standing_Military_Press",

  // Row variations
  "barbell row": "Bent_Over_Barbell_Row",
  "bent over row": "Bent_Over_Barbell_Row",
  "row": "Bent_Over_Barbell_Row",
  "bb row": "Bent_Over_Barbell_Row",

  // Pull-up variations
  "pullup": "Pullups",
  "pull-up": "Pullups",
  "pull up": "Pullups",
  "chin up": "Pullups",
  "chin-up": "Pullups",
  "chinup": "Pullups",

  // Incline Bench
  "incline bench": "Barbell_Incline_Bench_Press_-_Medium_Grip",
  "incline bench press": "Barbell_Incline_Bench_Press_-_Medium_Grip",
  "incline press": "Barbell_Incline_Bench_Press_-_Medium_Grip",

  // RDL
  "rdl": "Romanian_Deadlift",
  "romanian deadlift": "Romanian_Deadlift",
  "stiff leg deadlift": "Romanian_Deadlift",

  // Leg Press
  "leg press": "Leg_Press",

  // Lat Pulldown
  "lat pulldown": "Wide-Grip_Lat_Pulldown",
  "pulldown": "Wide-Grip_Lat_Pulldown",
  "lat pull down": "Wide-Grip_Lat_Pulldown",
};

/**
 * Normalize an exercise name to a canonical ID
 * Uses fuzzy matching for common variations
 *
 * @param name Exercise name from CSV
 * @returns Resolved exercise ID or original name if no match
 */
export function normalizeExerciseName(name: string): string {
  if (!name) return "";

  // Trim and lowercase for matching
  const normalized = name.trim().toLowerCase();

  // Direct match in our custom map
  if (EXERCISE_NAME_MAP[normalized]) {
    // Resolve legacy IDs to new IDs
    return resolveExerciseId(EXERCISE_NAME_MAP[normalized]);
  }

  // Check if it's already a valid exercise ID
  const existing = getExerciseById(name);
  if (existing) {
    return existing.id;
  }

  // Try resolving as a legacy ID
  const resolved = resolveExerciseId(name);
  if (resolved !== name) {
    return resolved;
  }

  // Try matching against all exercises in database
  const allExercises = getAllExercises();

  // Exact name match (case-insensitive)
  const exactMatch = allExercises.find(
    (e) => e.name.toLowerCase() === normalized
  );
  if (exactMatch) {
    return exactMatch.id;
  }

  // Partial name match (contains)
  const partialMatch = allExercises.find(
    (e) =>
      e.name.toLowerCase().includes(normalized) ||
      normalized.includes(e.name.toLowerCase())
  );
  if (partialMatch) {
    return partialMatch.id;
  }

  // No match found - return the original name as ID
  // (will be treated as a custom exercise)
  return name.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Get display name for an exercise ID
 */
export function getExerciseDisplayName(exerciseId: string): string {
  const exercise = getExerciseById(exerciseId);
  if (exercise) {
    return exercise.name;
  }

  // Try resolving legacy ID first
  const resolved = resolveExerciseId(exerciseId);
  if (resolved !== exerciseId) {
    const resolvedExercise = getExerciseById(resolved);
    if (resolvedExercise) {
      return resolvedExercise.name;
    }
  }

  // Fall back to converting ID to title case
  return exerciseId
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
export function escapeCSV(value: string | number | undefined | null): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);

  // Check if escaping is needed
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    // Escape double quotes by doubling them
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Parse a CSV value (unescape quotes)
 */
export function unescapeCSV(value: string): string {
  if (!value) return "";

  let str = value.trim();

  // Remove surrounding quotes
  if (str.startsWith('"') && str.endsWith('"')) {
    str = str.slice(1, -1);
    // Unescape doubled quotes
    str = str.replace(/""/g, '"');
  }

  return str;
}

/**
 * Parse a CSV line into columns, handling quoted values
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current);

  return result;
}

/**
 * Convert ISO 8601 date string to milliseconds timestamp
 */
export function isoToMs(isoString: string): number {
  if (!isoString) return 0;

  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return 0;
  }

  return date.getTime();
}

/**
 * Convert milliseconds timestamp to ISO 8601 date string
 */
export function msToIso(ms: number): string {
  if (!ms || ms <= 0) return "";
  return new Date(ms).toISOString();
}

/**
 * Validate that a row has all required fields
 */
export function validateRow(columns: string[], lineNumber: number): CSVParseError | null {
  // At minimum, we need exercise_id, weight_kg, and reps
  // Other fields can be inferred or defaulted

  if (columns.length < CSV_COLUMNS.length) {
    // Be lenient - allow missing optional columns
    if (columns.length < 10) {
      return {
        line: lineNumber,
        message: `Row has only ${columns.length} columns, expected at least 10`,
      };
    }
  }

  return null;
}

/**
 * Validate numeric value
 */
export function parseNumeric(value: string, defaultValue: number = 0): number {
  if (!value) return defaultValue;

  const parsed = parseFloat(value);
  if (isNaN(parsed)) return defaultValue;

  return parsed;
}

/**
 * Check if a session appears to be imported (based on isImported flag or source detection)
 */
export function isSessionImported(session: WorkoutSession): boolean {
  return session.isImported === true;
}

/**
 * Filter sessions to only include native (non-imported) sessions
 */
export function getNativeSessions(sessions: WorkoutSession[]): WorkoutSession[] {
  return sessions.filter((s) => !isSessionImported(s));
}

/**
 * Filter sessions to only include imported sessions
 */
export function getImportedSessions(sessions: WorkoutSession[]): WorkoutSession[] {
  return sessions.filter((s) => isSessionImported(s));
}
