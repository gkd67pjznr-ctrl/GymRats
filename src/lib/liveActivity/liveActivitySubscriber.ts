// src/lib/liveActivity/liveActivitySubscriber.ts
// Observer pattern - subscribes to Zustand stores to manage Live Activity state

import { Platform, AppState, AppStateStatus } from 'react-native';
import { useCurrentSessionStore } from '../stores/currentSessionStore';
import { useWorkoutDrawerStore } from '../stores/workoutDrawerStore';
import { useSettingsStore } from '../stores/settingsStore';
import {
  isLiveActivityAvailable,
  startWorkoutActivity,
  updateWorkoutActivity,
  endWorkoutActivity,
  hasActiveActivity,
} from './liveActivityService';
import type { WorkoutActivityState } from './liveActivityTypes';
import { EXERCISES_V1 } from '../../data/exercises';

// ============================================================================
// App State Tracking
// ============================================================================

let isAppActive = true;
let appStateSubscription: { remove: () => void } | null = null;

// ============================================================================
// Debouncing
// ============================================================================

let updateTimeout: ReturnType<typeof setTimeout> | null = null;
const UPDATE_DEBOUNCE_MS = 500;

function debouncedUpdate(state: WorkoutActivityState): void {
  // Don't update if app is backgrounded
  if (!isAppActive) return;

  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  updateTimeout = setTimeout(() => {
    // Double-check app is still active before updating
    if (!isAppActive) return;

    updateWorkoutActivity(state).catch((err) => {
      if (__DEV__) {
        console.error('[liveActivitySubscriber] Debounced update failed:', err);
      }
    });
    updateTimeout = null;
  }, UPDATE_DEBOUNCE_MS);
}

// ============================================================================
// State Building
// ============================================================================

/**
 * Get exercise name by ID
 */
function getExerciseName(exerciseId: string | null): string | null {
  if (!exerciseId) return null;
  try {
    const exercise = EXERCISES_V1.find((e) => e.id === exerciseId);
    return exercise?.name ?? exerciseId;
  } catch {
    return exerciseId;
  }
}

/**
 * Build WorkoutActivityState from current store values
 */
function buildActivityState(): WorkoutActivityState | null {
  try {
    const session = useCurrentSessionStore.getState().session;
    if (!session) return null;

    const drawerState = useWorkoutDrawerStore.getState();
    const { restTimer } = drawerState;

    // Calculate rest timer end time if active
    let restTimerEndAtMs: number | null = null;
    let restTimerTotalSec: number | null = null;

    if (restTimer.isActive && restTimer.startedAtMs) {
      restTimerTotalSec = restTimer.totalSeconds;
      restTimerEndAtMs = restTimer.startedAtMs + (restTimer.totalSeconds * 1000);
    }

    return {
      workoutStartedAtMs: session.startedAtMs,
      setCount: session.sets?.length ?? 0,
      exerciseName: getExerciseName(session.selectedExerciseId),
      restTimerEndAtMs,
      restTimerTotalSec,
      prCount: session.prCount ?? 0,
      lastUpdatedAtMs: Date.now(),
    };
  } catch (err) {
    if (__DEV__) {
      console.error('[liveActivitySubscriber] Failed to build activity state:', err);
    }
    return null;
  }
}

// ============================================================================
// Subscription Handlers
// ============================================================================

/**
 * Handle session changes (workout start/end)
 */
function handleSessionChange(hasSession: boolean): void {
  // Don't process if app is backgrounded
  if (!isAppActive) return;

  try {
    if (!isLiveActivityAvailable()) {
      return;
    }

    if (hasSession) {
      const session = useCurrentSessionStore.getState().session;
      if (session && !hasActiveActivity()) {
        startWorkoutActivity({
          workoutStartedAtMs: session.startedAtMs,
          initialExerciseName: getExerciseName(session.selectedExerciseId) ?? undefined,
        }).catch((err) => {
          if (__DEV__) {
            console.error('[liveActivitySubscriber] Failed to start activity:', err);
          }
        });
      }
    } else {
      if (hasActiveActivity()) {
        endWorkoutActivity().catch((err) => {
          if (__DEV__) {
            console.error('[liveActivitySubscriber] Failed to end activity:', err);
          }
        });
      }
    }
  } catch (err) {
    if (__DEV__) {
      console.error('[liveActivitySubscriber] handleSessionChange error:', err);
    }
  }
}

/**
 * Handle workout state changes (sets logged, rest timer, etc.)
 */
function handleStateChange(): void {
  // Don't process if app is backgrounded
  if (!isAppActive) return;

  try {
    if (!hasActiveActivity()) {
      return;
    }

    const state = buildActivityState();
    if (state) {
      debouncedUpdate(state);
    }
  } catch (err) {
    if (__DEV__) {
      console.error('[liveActivitySubscriber] handleStateChange error:', err);
    }
  }
}

/**
 * Handle settings changes (Live Activity toggled on/off)
 */
function handleSettingsChange(liveActivityEnabled: boolean): void {
  // Don't process if app is backgrounded
  if (!isAppActive) return;

  try {
    const session = useCurrentSessionStore.getState().session;

    if (liveActivityEnabled && session && !hasActiveActivity()) {
      // Setting enabled while workout is active - start activity
      startWorkoutActivity({
        workoutStartedAtMs: session.startedAtMs,
        initialExerciseName: getExerciseName(session.selectedExerciseId) ?? undefined,
      }).catch((err) => {
        if (__DEV__) {
          console.error('[liveActivitySubscriber] Failed to start activity on setting enable:', err);
        }
      });
    } else if (!liveActivityEnabled && hasActiveActivity()) {
      // Setting disabled - end activity
      endWorkoutActivity().catch((err) => {
        if (__DEV__) {
          console.error('[liveActivitySubscriber] Failed to end activity on setting disable:', err);
        }
      });
    }
  } catch (err) {
    if (__DEV__) {
      console.error('[liveActivitySubscriber] handleSettingsChange error:', err);
    }
  }
}

// ============================================================================
// Subscription Setup
// ============================================================================

let unsubscribeSession: (() => void) | null = null;
let unsubscribeDrawer: (() => void) | null = null;
let unsubscribeSettings: (() => void) | null = null;

/**
 * Initialize all Live Activity subscriptions
 * Call this once at app startup
 *
 * @returns Cleanup function to remove all subscriptions
 */
export function initializeLiveActivitySubscriptions(): () => void {
  // Early exit for non-iOS platforms
  if (Platform.OS !== 'ios') {
    return () => {}; // No-op cleanup
  }

  if (__DEV__) {
    console.log('[liveActivitySubscriber] Initializing subscriptions...');
  }

  // Set up AppState listener to track when app is active
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    isAppActive = nextAppState === 'active';

    if (__DEV__) {
      console.log('[liveActivitySubscriber] App state changed:', nextAppState, 'isActive:', isAppActive);
    }

    // Cancel pending updates if app is backgrounding
    if (!isAppActive && updateTimeout) {
      clearTimeout(updateTimeout);
      updateTimeout = null;
    }
  };

  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

  // Track previous values for change detection
  let prevHasSession = useCurrentSessionStore.getState().session !== null;
  let prevSetCount = useCurrentSessionStore.getState().session?.sets?.length ?? 0;
  let prevPrCount = useCurrentSessionStore.getState().session?.prCount ?? 0;
  let prevSelectedExerciseId = useCurrentSessionStore.getState().session?.selectedExerciseId ?? null;
  let prevRestTimerActive = useWorkoutDrawerStore.getState().restTimer.isActive;
  let prevLiveActivityEnabled = useSettingsStore.getState().liveActivityEnabled;

  // Subscribe to current session store
  unsubscribeSession = useCurrentSessionStore.subscribe((state) => {
    // Skip if app is backgrounded
    if (!isAppActive) return;

    try {
      const hasSession = state.session !== null;
      const setCount = state.session?.sets?.length ?? 0;
      const prCount = state.session?.prCount ?? 0;
      const selectedExerciseId = state.session?.selectedExerciseId ?? null;

      // Session created or destroyed
      if (hasSession !== prevHasSession) {
        handleSessionChange(hasSession);
        prevHasSession = hasSession;
      }

      // State changed (sets, PRs, exercise)
      if (
        hasSession &&
        (setCount !== prevSetCount ||
          prCount !== prevPrCount ||
          selectedExerciseId !== prevSelectedExerciseId)
      ) {
        handleStateChange();
        prevSetCount = setCount;
        prevPrCount = prCount;
        prevSelectedExerciseId = selectedExerciseId;
      }
    } catch (err) {
      if (__DEV__) {
        console.error('[liveActivitySubscriber] Session subscription error:', err);
      }
    }
  });

  // Subscribe to workout drawer store (rest timer changes)
  unsubscribeDrawer = useWorkoutDrawerStore.subscribe((state) => {
    // Skip if app is backgrounded
    if (!isAppActive) return;

    try {
      const restTimerActive = state.restTimer.isActive;

      if (restTimerActive !== prevRestTimerActive) {
        handleStateChange();
        prevRestTimerActive = restTimerActive;
      }
    } catch (err) {
      if (__DEV__) {
        console.error('[liveActivitySubscriber] Drawer subscription error:', err);
      }
    }
  });

  // Subscribe to settings store (Live Activity toggle)
  unsubscribeSettings = useSettingsStore.subscribe((state) => {
    // Skip if app is backgrounded
    if (!isAppActive) return;

    try {
      const liveActivityEnabled = state.liveActivityEnabled;

      if (liveActivityEnabled !== prevLiveActivityEnabled) {
        handleSettingsChange(liveActivityEnabled);
        prevLiveActivityEnabled = liveActivityEnabled;
      }
    } catch (err) {
      if (__DEV__) {
        console.error('[liveActivitySubscriber] Settings subscription error:', err);
      }
    }
  });

  // Check if we need to restore an activity on app start
  // (e.g., if app was killed mid-workout and session was restored)
  // Delay this to ensure stores are hydrated
  setTimeout(() => {
    try {
      const initialSession = useCurrentSessionStore.getState().session;
      if (initialSession && useCurrentSessionStore.getState().hydrated && isAppActive) {
        handleSessionChange(true);
      }
    } catch (err) {
      if (__DEV__) {
        console.error('[liveActivitySubscriber] Initial session check error:', err);
      }
    }
  }, 1000);

  // Return cleanup function
  return () => {
    if (__DEV__) {
      console.log('[liveActivitySubscriber] Cleaning up subscriptions...');
    }

    if (updateTimeout) {
      clearTimeout(updateTimeout);
      updateTimeout = null;
    }

    appStateSubscription?.remove();
    appStateSubscription = null;

    unsubscribeSession?.();
    unsubscribeDrawer?.();
    unsubscribeSettings?.();

    unsubscribeSession = null;
    unsubscribeDrawer = null;
    unsubscribeSettings = null;
  };
}
