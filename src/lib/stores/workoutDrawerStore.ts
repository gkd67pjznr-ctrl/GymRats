// src/lib/stores/workoutDrawerStore.ts
// Global state for the collapsible workout drawer

import { create } from 'zustand';
import type { RichCue, QuickCue } from '@/src/lib/cues/cueTypes';
import { enrichCue } from '@/src/lib/cues/cueTypes';

/** Pending cue can be either rich or quick format */
export type PendingCue = RichCue | QuickCue | null;

/**
 * Drawer position states
 */
export type DrawerPosition = 'closed' | 'collapsed' | 'expanded';

/**
 * Rest timer state
 */
interface RestTimerState {
  isActive: boolean;
  totalSeconds: number;
  startedAtMs: number | null;
}

/**
 * Workout drawer store state
 */
interface WorkoutDrawerState {
  // Drawer UI state
  position: DrawerPosition;

  // Whether there's an active workout (drawer should be accessible)
  hasActiveWorkout: boolean;

  // Rest timer state (persists across drawer collapse/expand)
  restTimer: RestTimerState;

  // PR cue queue (shown when drawer expands, or on edge when collapsed)
  pendingCue: RichCue | null;
  hasPendingCue: boolean;

  // Animation progress (0 = closed, 0.1 = collapsed/edge visible, 1 = expanded)
  // This is controlled by Reanimated, store just tracks logical state

  // Actions
  openDrawer: () => void;
  collapseDrawer: () => void;
  closeDrawer: () => void;
  startWorkout: () => void;
  endWorkout: () => void;
  setPosition: (position: DrawerPosition) => void;

  // Rest timer actions
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  clearRestTimer: () => void;
  adjustRestTimer: (deltaSec: number) => void;

  // PR cue actions
  setPendingCue: (cue: RichCue | QuickCue | null, context?: {
    exerciseId?: string;
    exerciseName?: string;
    setId?: string;
    sessionId?: string;
  }) => void;
  clearPendingCue: () => void;
}

/**
 * Workout drawer store
 *
 * Manages the global state of the collapsible workout drawer.
 * The drawer can be:
 * - closed: no active workout, drawer not visible
 * - collapsed: active workout, thin edge visible on right
 * - expanded: active workout, full drawer open
 */
export const useWorkoutDrawerStore = create<WorkoutDrawerState>((set, get) => ({
  position: 'closed',
  hasActiveWorkout: false,
  restTimer: {
    isActive: false,
    totalSeconds: 0,
    startedAtMs: null,
  },
  pendingCue: null,
  hasPendingCue: false,

  /**
   * Open the drawer to expanded state
   */
  openDrawer: () => {
    set({ position: 'expanded' });
  },

  /**
   * Collapse the drawer to edge-only state
   */
  collapseDrawer: () => {
    if (get().hasActiveWorkout) {
      set({ position: 'collapsed' });
    }
  },

  /**
   * Close the drawer completely (only when no active workout)
   */
  closeDrawer: () => {
    if (!get().hasActiveWorkout) {
      set({ position: 'closed' });
    }
  },

  /**
   * Start a new workout - opens drawer and marks workout as active
   */
  startWorkout: () => {
    set({
      hasActiveWorkout: true,
      position: 'expanded'
    });
  },

  /**
   * End the workout - closes drawer and marks workout as inactive
   */
  endWorkout: () => {
    set({
      hasActiveWorkout: false,
      position: 'closed',
      restTimer: {
        isActive: false,
        totalSeconds: 0,
        startedAtMs: null,
      },
      pendingCue: null,
      hasPendingCue: false,
    });
  },

  /**
   * Direct position setter (for gesture-driven state changes)
   */
  setPosition: (position: DrawerPosition) => {
    // Don't allow expanded/collapsed without active workout
    if (!get().hasActiveWorkout && position !== 'closed') {
      return;
    }
    set({ position });
  },

  /**
   * Start rest timer with given duration
   */
  startRestTimer: (seconds: number) => {
    set({
      restTimer: {
        isActive: true,
        totalSeconds: seconds,
        startedAtMs: Date.now(),
      },
    });
  },

  /**
   * Stop rest timer (pause, but keep state)
   */
  stopRestTimer: () => {
    set((state) => ({
      restTimer: {
        ...state.restTimer,
        isActive: false,
      },
    }));
  },

  /**
   * Clear rest timer completely
   */
  clearRestTimer: () => {
    set({
      restTimer: {
        isActive: false,
        totalSeconds: 0,
        startedAtMs: null,
      },
    });
  },

  /**
   * Adjust rest timer by delta seconds (positive to add, negative to subtract)
   * Updates startedAtMs to compensate for the adjustment
   */
  adjustRestTimer: (deltaSec: number) => {
    const { restTimer } = get();
    if (!restTimer.isActive || !restTimer.startedAtMs) return;

    // Calculate new total and adjust startedAtMs to reflect the change
    const newTotal = Math.max(0, Math.min(3600, restTimer.totalSeconds + deltaSec));

    set({
      restTimer: {
        ...restTimer,
        totalSeconds: newTotal,
        // Adjust startedAtMs backward by delta to effectively add time
        startedAtMs: restTimer.startedAtMs - (deltaSec * 1000),
      },
    });
  },

  /**
   * Set a pending PR cue (shown when drawer expands or on edge)
   * Accepts both RichCue and QuickCue formats - normalizes to RichCue
   */
  setPendingCue: (cue: RichCue | QuickCue | null, context?: {
    exerciseId?: string;
    exerciseName?: string;
    setId?: string;
    sessionId?: string;
  }) => {
    if (!cue) {
      set({ pendingCue: null, hasPendingCue: false });
      return;
    }

    // If it's already a RichCue (has 'id' field), use as-is
    const richCue: RichCue = 'id' in cue && 'prType' in cue
      ? cue as RichCue
      : enrichCue(cue as QuickCue, context);

    set({
      pendingCue: richCue,
      hasPendingCue: true,
    });
  },

  /**
   * Clear pending PR cue
   */
  clearPendingCue: () => {
    set({
      pendingCue: null,
      hasPendingCue: false,
    });
  },
}));

// ============================================================================
// Convenience hooks
// ============================================================================

/**
 * Hook to get drawer position
 */
export function useDrawerPosition(): DrawerPosition {
  return useWorkoutDrawerStore((state) => state.position);
}

/**
 * Hook to check if workout is active
 */
export function useHasActiveWorkout(): boolean {
  return useWorkoutDrawerStore((state) => state.hasActiveWorkout);
}

/**
 * Hook to check if drawer is expanded
 */
export function useIsDrawerExpanded(): boolean {
  return useWorkoutDrawerStore((state) => state.position === 'expanded');
}

/**
 * Hook to check if drawer is visible (collapsed or expanded)
 */
export function useIsDrawerVisible(): boolean {
  return useWorkoutDrawerStore((state) => state.position !== 'closed');
}

/**
 * Hook to get rest timer state
 */
export function useRestTimer(): RestTimerState {
  return useWorkoutDrawerStore((state) => state.restTimer);
}

/**
 * Hook to check if rest timer is active
 */
export function useIsRestTimerActive(): boolean {
  return useWorkoutDrawerStore((state) => state.restTimer.isActive);
}

/**
 * Hook to get pending PR cue
 */
export function usePendingCue(): RichCue | null {
  return useWorkoutDrawerStore((state) => state.pendingCue);
}

/**
 * Hook to check if there's a pending cue
 */
export function useHasPendingCue(): boolean {
  return useWorkoutDrawerStore((state) => state.hasPendingCue);
}

// ============================================================================
// Imperative API for non-React code
// ============================================================================

export const workoutDrawerActions = {
  openDrawer: () => useWorkoutDrawerStore.getState().openDrawer(),
  collapseDrawer: () => useWorkoutDrawerStore.getState().collapseDrawer(),
  closeDrawer: () => useWorkoutDrawerStore.getState().closeDrawer(),
  startWorkout: () => useWorkoutDrawerStore.getState().startWorkout(),
  endWorkout: () => useWorkoutDrawerStore.getState().endWorkout(),
  getPosition: () => useWorkoutDrawerStore.getState().position,
  hasActiveWorkout: () => useWorkoutDrawerStore.getState().hasActiveWorkout,
  // Rest timer
  startRestTimer: (seconds: number) => useWorkoutDrawerStore.getState().startRestTimer(seconds),
  stopRestTimer: () => useWorkoutDrawerStore.getState().stopRestTimer(),
  clearRestTimer: () => useWorkoutDrawerStore.getState().clearRestTimer(),
  adjustRestTimer: (deltaSec: number) => useWorkoutDrawerStore.getState().adjustRestTimer(deltaSec),
  getRestTimer: () => useWorkoutDrawerStore.getState().restTimer,
  // PR cues
  setPendingCue: (cue: RichCue | QuickCue | null, context?: {
    exerciseId?: string;
    exerciseName?: string;
    setId?: string;
    sessionId?: string;
  }) => useWorkoutDrawerStore.getState().setPendingCue(cue, context),
  clearPendingCue: () => useWorkoutDrawerStore.getState().clearPendingCue(),
  getPendingCue: () => useWorkoutDrawerStore.getState().pendingCue,
};

// Re-export RestTimerState type for consumers
export type { RestTimerState };
