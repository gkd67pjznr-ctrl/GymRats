// src/lib/perSetCueTypes.ts
// Type definitions for PR detection in perSetCue module

import type { UnitSystem } from './buckets';
import type { LoggedSet } from './loggerTypes';

/**
 * Parameters for PR detection calculation
 *
 * These are the inputs required to detect a personal record for a working set.
 */
export interface DetectCueParams {
  /** Weight in kilograms (internal unit) */
  weightKg: number;
  /** Number of reps performed */
  reps: number;
  /** Unit system for display (lb or kg) */
  unit: UnitSystem;
  /** Display name of the exercise */
  exerciseName: string;
  /** Previous session state for this exercise */
  prev: ExerciseSessionState;
}

/**
 * Result of PR detection calculation
 *
 * Contains the detected cue, updated session state, and metadata about
 * what type of PR (if any) was achieved.
 */
export interface DetectCueResult {
  /** The PR cue, or null if no PR detected */
  cue: Cue | null;
  /** Updated exercise session state */
  next: ExerciseSessionState;
  /** Metadata about the detection */
  meta: DetectCueMeta;
}

/**
 * Celebration tier based on PR magnitude
 *
 * Tier 1: Small PR (0-5 lb delta)
 * Tier 2: Medium PR (5-10 lb delta)
 * Tier 3: Big PR (10-20 lb delta)
 * Tier 4: Massive PR (20+ lb delta)
 */
export type CelebrationTier = 1 | 2 | 3 | 4;

/**
 * Metadata about PR detection
 *
 * Provides detailed information about what was detected, including deltas
 * for PR values and the type of achievement.
 */
export interface DetectCueMeta {
  /** Whether this set is cardio (16+ reps) */
  isCardio: boolean;
  /** Rep count increase at current weight bucket */
  repDeltaAtWeight: number;
  /** Weight increase from previous best (in lb) */
  weightDeltaLb: number;
  /** e1RM increase from previous best (in lb) */
  e1rmDeltaLb: number;
  /** Type of achievement detected */
  type: PRType;
  /** Formatted weight label for display */
  weightLabel: string;
  /** Celebration tier based on delta magnitude (1-4) */
  tier: CelebrationTier;
}

/**
 * Types of personal records
 */
export type PRType = 'none' | 'weight' | 'rep' | 'e1rm' | 'cardio' | 'recovery';

/**
 * Exercise session state for PR tracking
 *
 * Tracks the best performance metrics for a single exercise during a workout session.
 */
export interface ExerciseSessionState {
  /** Best estimated 1-rep max achieved (in kg) */
  bestE1RMKg: number;
  /** Heaviest weight lifted (in kg) */
  bestWeightKg: number;
  /** Best reps at each weight bucket */
  bestRepsAtWeight: Record<string, number>;
}

/**
 * PR Cue for display
 *
 * Represents a personal record notification with intensity level.
 */
export interface Cue {
  /** Main message to display */
  message: string;
  /** Intensity level for UI styling */
  intensity: 'low' | 'med' | 'high';
  /** Optional second line with details */
  detail?: string;
}

/**
 * Instant cue for toast display
 *
 * Simplified version of Cue optimized for toast notifications.
 * Note: Toast component uses only "low" | "high" intensities.
 */
export interface InstantCue {
  /** Main message to display */
  message: string;
  /** Optional detail text */
  detail?: string;
  /** Intensity for toast styling (only low/high supported) */
  intensity: 'low' | 'high';
}

/**
 * Parameters for detecting all cues in an exercise session
 *
 * Used when generating end-of-workout recap cues.
 */
export interface ExerciseSessionParams {
  /** Exercise identifier */
  exerciseId: string;
  /** All sets performed for this exercise */
  sets: LoggedSet[];
  /** Unit system for display */
  unit: UnitSystem;
  /** Previous personal records for this exercise */
  previous: ExerciseSessionState;
}

/**
 * Result of exercise session analysis
 *
 * Contains all cues generated for an exercise session.
 */
export interface ExerciseSessionResult {
  /** All cues for the session */
  cues: Cue[];
  /** Final session state */
  finalState: ExerciseSessionState;
}
