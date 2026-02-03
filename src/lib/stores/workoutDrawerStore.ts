// src/lib/stores/workoutDrawerStore.ts
// Global state for the collapsible workout drawer

import { create } from 'zustand';

/**
 * Drawer position states
 */
export type DrawerPosition = 'closed' | 'collapsed' | 'expanded';

/**
 * Workout drawer store state
 */
interface WorkoutDrawerState {
  // Drawer UI state
  position: DrawerPosition;

  // Whether there's an active workout (drawer should be accessible)
  hasActiveWorkout: boolean;

  // Animation progress (0 = closed, 0.1 = collapsed/edge visible, 1 = expanded)
  // This is controlled by Reanimated, store just tracks logical state

  // Actions
  openDrawer: () => void;
  collapseDrawer: () => void;
  closeDrawer: () => void;
  startWorkout: () => void;
  endWorkout: () => void;
  setPosition: (position: DrawerPosition) => void;
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
      position: 'closed'
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
};
