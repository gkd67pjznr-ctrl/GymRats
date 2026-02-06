// src/lib/liveActivity/liveActivityTypes.ts
// TypeScript types for iOS Live Activity (Dynamic Island / Lock Screen)

/**
 * Workout state data displayed in the Live Activity
 * This maps to the SwiftUI views in the widget extension
 */
export interface WorkoutActivityState {
  // Core workout info
  workoutStartedAtMs: number;  // Epoch ms - iOS will calculate elapsed time
  setCount: number;            // Total sets logged in this session
  exerciseName: string | null; // Current exercise name (optional)

  // Rest timer (when active)
  restTimerEndAtMs: number | null;  // Epoch ms when timer ends - iOS handles countdown
  restTimerTotalSec: number | null; // Total seconds for progress calculation

  // PR tracking
  prCount: number;             // Total PRs detected this session

  // Last activity indicator
  lastUpdatedAtMs: number;     // For stale activity detection
}

/**
 * Configuration for starting a new Live Activity
 */
export interface StartActivityConfig {
  workoutStartedAtMs: number;
  initialExerciseName?: string;
}

/**
 * Internal manager state for tracking the active Live Activity
 */
export interface LiveActivityManagerState {
  // Current activity ID (null if no activity is active)
  activityId: string | null;

  // Whether we're in the process of starting/stopping an activity
  isTransitioning: boolean;

  // Last error (for debugging)
  lastError: string | null;

  // Platform availability
  isAvailable: boolean;
}

/**
 * Result from Live Activity operations
 */
export interface LiveActivityResult {
  success: boolean;
  activityId?: string;
  error?: string;
}
