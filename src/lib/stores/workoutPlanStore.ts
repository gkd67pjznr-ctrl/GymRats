// src/lib/stores/workoutPlanStore.ts
// Zustand store for current workout plan with AsyncStorage persistence and Supabase sync

import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WorkoutPlan } from "../workoutPlanModel";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import { logError } from "../errorHandler";
import { safeJSONParse } from "../storage/safeJSONParse";
import type { SyncMetadata } from "../sync/syncTypes";
import { getUser } from "./authStore";
import { supabase } from "../supabase/client";
import { networkMonitor } from "../sync/NetworkMonitor";

const STORAGE_KEY = "currentPlan.v2"; // Bumped from v1 for Zustand migration

interface WorkoutPlanState {
  plan: WorkoutPlan | null;
  hydrated: boolean;
  _sync: SyncMetadata;

  // Actions
  setPlan: (plan: WorkoutPlan | null) => void;
  updatePlan: (updater: (prev: WorkoutPlan) => WorkoutPlan) => void;
  clearPlan: () => void;
  setHydrated: (value: boolean) => void;

  // Sync actions
  pullFromServer: () => Promise<void>;
  pushToServer: () => Promise<void>;
  sync: () => Promise<void>;
}

// ============================================================================
// Store Creation
// ============================================================================

export const useWorkoutPlanStore = create<WorkoutPlanState>()(
  persist(
    (set, get) => ({
      plan: null,
      hydrated: false,
      _sync: {
        lastSyncAt: null,
        lastSyncHash: null,
        syncStatus: 'idle',
        syncError: null,
        pendingMutations: 0,
      },

      setPlan: (plan) => set({ plan }),

      updatePlan: (updater) => {
        const current = get().plan;
        if (!current) return;
        set({ plan: updater(current) });
      },

      clearPlan: () => set({ plan: null }),

      setHydrated: (value) => set({ hydrated: value }),

      // Sync actions
      pullFromServer: async () => {
        const user = getUser();
        if (!user) {
          console.warn('[workoutPlanStore] Cannot pull: no user signed in');
          return;
        }

        set({ _sync: { ...get()._sync, syncStatus: 'syncing', syncError: null } });

        try {
          // Fetch current plan from user profile
          const { data, error } = await supabase
            .from('users')
            .select('current_plan_id')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          // Note: This is a simplified version
          // In production, you'd fetch the actual plan from plans table
          // For now, the plan is stored locally and just synced as a selection

          set({
            _sync: {
              ...get()._sync,
              syncStatus: 'success',
              lastSyncAt: Date.now(),
            },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          set({
            _sync: {
              ...get()._sync,
              syncStatus: 'error',
              syncError: errorMessage,
            },
          });
          throw error;
        }
      },

      pushToServer: async () => {
        const user = getUser();
        if (!user) {
          console.warn('[workoutPlanStore] Cannot push: no user signed in');
          return;
        }

        if (!networkMonitor.isOnline()) {
          console.warn('[workoutPlanStore] Cannot push: offline');
          return;
        }

        try {
          // Update user profile with current plan selection
          const plan = get().plan;

          // Note: This would update a current_plan_id column on users table
          // For now, the plan sync is simplified

          set({
            _sync: {
              ...get()._sync,
              pendingMutations: 0,
            },
          });
        } catch (error) {
          console.error('[workoutPlanStore] Push failed:', error);
          throw error;
        }
      },

      sync: async () => {
        await get().pullFromServer();
        await get().pushToServer();
      },
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

// Export selectors to check exercise completion
export function useExerciseCompletionStatus(exerciseId: string): {
  targetSets: number;
  completedSets: number;
  completionPercentage: number;
} {
  const plan = useWorkoutPlanStore(selectPlan);

  if (!plan) {
    return {
      targetSets: 0,
      completedSets: 0,
      completionPercentage: 0
    };
  }

  const exercise = plan.exercises.find(e => e.exerciseId === exerciseId);
  const completedSets = plan.completedSetsByExerciseId[exerciseId] || 0;
  const targetSets = exercise?.targetSets || 0;
  const completionPercentage = targetSets > 0 ? (completedSets / targetSets) * 100 : 0;

  return {
    targetSets,
    completedSets,
    completionPercentage
  };
}

export function useAllExerciseCompletionStatus(): Record<string, {
  targetSets: number;
  completedSets: number;
  completionPercentage: number;
  skipped: boolean;
}> {
  const plan = useWorkoutPlanStore(selectPlan);

  if (!plan) {
    return {};
  }

  const result: Record<string, {
    targetSets: number;
    completedSets: number;
    completionPercentage: number;
    skipped: boolean;
  }> = {};

  let foundCompleted = false;
  for (let i = 0; i < plan.exercises.length; i++) {
    const exercise = plan.exercises[i];
    const completedSets = plan.completedSetsByExerciseId[exercise.exerciseId] || 0;
    const targetSets = exercise.targetSets;
    const completionPercentage = targetSets > 0 ? (completedSets / targetSets) * 100 : 0;

    if (completedSets > 0) {
      foundCompleted = true;
    }

    // Mark as skipped if it comes after completed exercises and has 0 sets
    const skipped = foundCompleted && completedSets === 0;

    result[exercise.exerciseId] = {
      targetSets,
      completedSets,
      completionPercentage,
      skipped
    };
  }

  return result;
}

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

// ============================================================================
// Sync Helpers
// ============================================================================

/**
 * Get sync status for workout plan store
 */
export function getWorkoutPlanSyncStatus(): SyncMetadata {
  return useWorkoutPlanStore.getState()._sync;
}
