// src/lib/liveActivity/liveActivityService.ts
// Core Live Activity service for iOS Dynamic Island / Lock Screen workout display

import { Platform } from 'react-native';
import type {
  WorkoutActivityState,
  StartActivityConfig,
  LiveActivityManagerState,
  LiveActivityResult,
} from './liveActivityTypes';
import { getSettings } from '../stores/settingsStore';

// ============================================================================
// Internal State
// ============================================================================

let managerState: LiveActivityManagerState = {
  activityId: null,
  isTransitioning: false,
  lastError: null,
  isAvailable: false,
};

// Lazy-loaded module reference (to avoid Android crashes)
let liveActivityModule: typeof import('expo-live-activity') | null = null;

// ============================================================================
// Module Loading
// ============================================================================

/**
 * Lazily load the expo-live-activity module
 * This prevents crashes on Android where the native module doesn't exist
 */
async function getModule(): Promise<typeof import('expo-live-activity') | null> {
  if (Platform.OS !== 'ios') {
    return null;
  }

  if (liveActivityModule) {
    return liveActivityModule;
  }

  try {
    liveActivityModule = await import('expo-live-activity');
    return liveActivityModule;
  } catch (err) {
    if (__DEV__) {
      console.error('[liveActivityService] Failed to load expo-live-activity:', err);
    }
    return null;
  }
}

// ============================================================================
// Availability Check
// ============================================================================

/**
 * Check if Live Activities are available on this device
 * Requirements: iOS 16.2+, Live Activities enabled in settings
 */
export function isLiveActivityAvailable(): boolean {
  // Platform check
  if (Platform.OS !== 'ios') {
    return false;
  }

  // Version check - Live Activities require iOS 16.2+
  const version = Platform.Version;
  if (typeof version === 'string') {
    const [major, minor] = version.split('.').map(Number);
    if (major < 16 || (major === 16 && (minor ?? 0) < 2)) {
      return false;
    }
  } else if (typeof version === 'number') {
    if (version < 16) {
      return false;
    }
  }

  // User setting check
  const settings = getSettings();
  if (!settings.liveActivityEnabled) {
    return false;
  }

  return true;
}

// ============================================================================
// Activity Lifecycle
// ============================================================================

/**
 * Format elapsed time as MM:SS or H:MM:SS
 */
function formatElapsedTime(startMs: number): string {
  const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
  const hours = Math.floor(elapsedSec / 3600);
  const minutes = Math.floor((elapsedSec % 3600) / 60);
  const seconds = elapsedSec % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Build the title string for the Live Activity
 */
function buildTitle(state: WorkoutActivityState): string {
  return `Workout - ${state.setCount} ${state.setCount === 1 ? 'set' : 'sets'}`;
}

/**
 * Build the subtitle string for the Live Activity
 */
function buildSubtitle(state: WorkoutActivityState): string {
  const parts: string[] = [];

  // Add elapsed time
  parts.push(formatElapsedTime(state.workoutStartedAtMs));

  // Add current exercise if available
  if (state.exerciseName) {
    parts.push(state.exerciseName);
  }

  // Add PR count if any
  if (state.prCount > 0) {
    parts.push(`${state.prCount} PR${state.prCount > 1 ? 's' : ''}`);
  }

  return parts.join(' • ');
}

/**
 * Start a new Live Activity for the workout
 */
export async function startWorkoutActivity(
  config: StartActivityConfig
): Promise<LiveActivityResult> {
  if (!isLiveActivityAvailable()) {
    return { success: false, error: 'Live Activity not available' };
  }

  if (managerState.activityId) {
    // Already have an active activity
    return { success: true, activityId: managerState.activityId };
  }

  if (managerState.isTransitioning) {
    return { success: false, error: 'Activity transition in progress' };
  }

  managerState.isTransitioning = true;

  try {
    const module = await getModule();
    if (!module) {
      managerState.isTransitioning = false;
      return { success: false, error: 'Module not available' };
    }

    const initialState: WorkoutActivityState = {
      workoutStartedAtMs: config.workoutStartedAtMs,
      setCount: 0,
      exerciseName: config.initialExerciseName || null,
      restTimerEndAtMs: null,
      restTimerTotalSec: null,
      prCount: 0,
      lastUpdatedAtMs: Date.now(),
    };

    const activityId = module.startActivity(
      {
        title: buildTitle(initialState),
        subtitle: buildSubtitle(initialState),
      },
      {
        backgroundColor: '#000000',
        titleColor: '#FFFFFF',
        subtitleColor: '#AAAAAA',
        progressViewTint: '#BFFF00', // Toxic accent color
      }
    );

    if (activityId) {
      managerState.activityId = activityId;
      managerState.isAvailable = true;
      managerState.lastError = null;

      if (__DEV__) {
        console.log('[liveActivityService] Started activity:', activityId);
      }

      managerState.isTransitioning = false;
      return { success: true, activityId };
    } else {
      managerState.isTransitioning = false;
      return { success: false, error: 'Failed to start activity' };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    managerState.lastError = errorMessage;
    managerState.isTransitioning = false;

    if (__DEV__) {
      console.error('[liveActivityService] Failed to start activity:', err);
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Update the Live Activity with new workout state
 */
export async function updateWorkoutActivity(
  state: WorkoutActivityState
): Promise<LiveActivityResult> {
  if (!managerState.activityId) {
    return { success: false, error: 'No active Live Activity' };
  }

  try {
    const module = await getModule();
    if (!module) {
      return { success: false, error: 'Module not available' };
    }

    // Calculate progress for rest timer if active
    let progress: number | undefined;
    if (state.restTimerEndAtMs && state.restTimerTotalSec) {
      const now = Date.now();
      const remainingMs = state.restTimerEndAtMs - now;
      const elapsedMs = (state.restTimerTotalSec * 1000) - remainingMs;
      progress = Math.max(0, Math.min(1, elapsedMs / (state.restTimerTotalSec * 1000)));
    }

    module.updateActivity(managerState.activityId, {
      title: buildTitle(state),
      subtitle: buildSubtitle(state),
      progressBar: progress !== undefined ? { progress } : undefined,
    });

    if (__DEV__) {
      console.log('[liveActivityService] Updated activity:', {
        sets: state.setCount,
        prs: state.prCount,
        hasRestTimer: !!state.restTimerEndAtMs,
      });
    }

    return { success: true, activityId: managerState.activityId };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    managerState.lastError = errorMessage;

    if (__DEV__) {
      console.error('[liveActivityService] Failed to update activity:', err);
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * End the Live Activity
 */
export async function endWorkoutActivity(): Promise<LiveActivityResult> {
  if (!managerState.activityId) {
    return { success: true }; // Nothing to end
  }

  if (managerState.isTransitioning) {
    return { success: false, error: 'Activity transition in progress' };
  }

  managerState.isTransitioning = true;

  try {
    const module = await getModule();
    if (!module) {
      managerState.activityId = null;
      managerState.isTransitioning = false;
      return { success: true };
    }

    module.stopActivity(managerState.activityId, {
      title: 'Workout Complete',
      subtitle: 'Great job!',
    });

    if (__DEV__) {
      console.log('[liveActivityService] Ended activity:', managerState.activityId);
    }

    const endedId = managerState.activityId;
    managerState.activityId = null;
    managerState.isTransitioning = false;

    return { success: true, activityId: endedId };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    managerState.lastError = errorMessage;

    // Clear the activity ID even on error - it's likely stale
    managerState.activityId = null;
    managerState.isTransitioning = false;

    if (__DEV__) {
      console.error('[liveActivityService] Failed to end activity:', err);
    }

    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// State Getters
// ============================================================================

/**
 * Get current manager state
 */
export function getManagerState(): LiveActivityManagerState {
  return { ...managerState };
}

/**
 * Check if there's an active Live Activity
 */
export function hasActiveActivity(): boolean {
  return managerState.activityId !== null;
}
