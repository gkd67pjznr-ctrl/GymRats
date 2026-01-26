// src/lib/stores/workoutPlanStore.ts
// Zustand store for current workout plan with AsyncStorage persistence

import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WorkoutPlan } from "../workoutPlanModel";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import { logError } from "../errorHandler";
import { safeJSONParse } from "../storage/safeJSONParse";

const STORAGE_KEY = "currentPlan.v2"; // Bumped from v1 for Zustand migration

interface WorkoutPlanState {
  plan: WorkoutPlan | null;
  hydrated: boolean;

  // Actions
  setPlan: (plan: WorkoutPlan | null) => void;
  updatePlan: (updater: (prev: WorkoutPlan) => WorkoutPlan) => void;
  clearPlan: () => void;
  setHydrated: (value: boolean) => void;
}

// ============================================================================
// Store Creation
// ============================================================================

export const useWorkoutPlanStore = create<WorkoutPlanState>()(
  persist(
    (set, get) => ({
      plan: null,
      hydrated: false,

      setPlan: (plan) => set({ plan }),

      updatePlan: (updater) => {
        const current = get().plan;
        if (!current) return;
        set({ plan: updater(current) });
      },

      clearPlan: () => set({ plan: null }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({ plan: state.plan }),
      onRehydrateStorage: () => (state) => {
        // V1 to V2 migration
        // Check for legacy data and migrate if found
        AsyncStorage.getItem("currentPlan.v1")
          .then((v1Data) => {
            if (v1Data && state) {
              const parsed = safeJSONParse<WorkoutPlan>(v1Data, null);
              if (parsed) {
                state.plan = parsed;
              }
              // Clean up V1 data after successful migration
              AsyncStorage.removeItem("currentPlan.v1").catch((err) => {
                logError({ context: 'WorkoutPlanStore', error: err, userMessage: 'Failed to remove old plan data' });
              });
            }
            // Mark as hydrated
            state?.setHydrated(true);
          })
          .catch((err) => {
            logError({ context: 'WorkoutPlanStore', error: err, userMessage: 'Failed to read old plan data' });
            state?.setHydrated(true);
          });
      },
    }
  )
);

// ============================================================================
// Convenience Selectors
// ============================================================================

export const selectPlan = (state: WorkoutPlanState) => state.plan;
export const selectIsHydrated = (state: WorkoutPlanState) => state.hydrated;

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for accessing current workout plan.
 * Reactively updates when plan changes.
 *
 * @example
 * ```tsx
 * const plan = useCurrentPlan();
 * if (!plan) return <EmptyState />;
 * return <PlanView plan={plan} />;
 * ```
 */
export function useCurrentPlan(): WorkoutPlan | null {
  return useWorkoutPlanStore(selectPlan);
}

/**
 * Hook for checking if the store has been hydrated.
 * Use this to gate UI components that depend on persisted state.
 *
 * @example
 * ```tsx
 * const hydrated = useIsHydrated();
 * if (!hydrated) return <LoadingSpinner />;
 * ```
 */
export function useIsHydrated(): boolean {
  return useWorkoutPlanStore(selectIsHydrated);
}

// ============================================================================
// Imperative Getters
// ============================================================================

/**
 * Get current plan synchronously (for non-React code).
 *
 * @example
 * ```ts
 * const plan = getCurrentPlan();
 * if (plan) {
 *   console.log('Current plan:', plan.id);
 * }
 * ```
 */
export function getCurrentPlan(): WorkoutPlan | null {
  return useWorkoutPlanStore.getState().plan;
}

/**
 * Check if store has been hydrated (for non-React code).
 */
export function getIsHydrated(): boolean {
  return useWorkoutPlanStore.getState().hydrated;
}

// ============================================================================
// Imperative Actions
// ============================================================================

/**
 * Set current workout plan.
 *
 * @example
 * ```ts
 * setCurrentPlan(newPlan);
 * ```
 */
export function setCurrentPlan(plan: WorkoutPlan | null): void {
  useWorkoutPlanStore.getState().setPlan(plan);
}

/**
 * Update current workout plan using a callback.
 *
 * @example
 * ```ts
 * updateCurrentPlan((prev) => ({
 *   ...prev,
 *   currentExerciseIndex: prev.currentExerciseIndex + 1,
 * }));
 * ```
 */
export function updateCurrentPlan(updater: (prev: WorkoutPlan) => WorkoutPlan): void {
  useWorkoutPlanStore.getState().updatePlan(updater);
}

/**
 * Clear current workout plan.
 *
 * @example
 * ```ts
 * clearCurrentPlan();
 * ```
 */
export function clearCurrentPlan(): void {
  useWorkoutPlanStore.getState().clearPlan();
}

// ============================================================================
// Legacy Compatibility Functions
// ============================================================================

/**
 * Legacy hydrate function - now a no-op.
 * Zustand handles hydration automatically via persist middleware.
 *
 * @deprecated No longer needed - Zustand handles hydration automatically
 */
export async function hydrateWorkoutPlanStore(): Promise<void> {
  // Zustand handles hydration automatically via persist middleware
  // This function is kept for backward compatibility
}

/**
 * Legacy subscribe function - now a no-op.
 * Zustand handles reactivity automatically via hooks.
 *
 * @deprecated Use useCurrentPlan() hook instead
 * @returns A no-op cleanup function
 */
export function subscribeCurrentPlan(listener: () => void): () => void {
  // Zustand handles reactivity automatically via hooks
  // This function is kept for backward compatibility
  return () => {};
}
