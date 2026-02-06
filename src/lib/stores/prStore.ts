// src/lib/stores/prStore.ts
// Zustand store for personal records (PRs) with baseline tracking

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import { useWorkoutStore } from "./workoutStore";
import { estimate1RM_Epley } from "../e1rm";
import { bucketKeyForUser } from "../buckets";
import { getSettings } from "./settingsStore";

const STORAGE_KEY = "gymrats.prs.v1";

/**
 * User-entered baseline PR for an exercise
 * Entered during onboarding or in profile settings
 */
export interface BaselinePR {
  exerciseId: string;
  weightKg: number;
  reps: number;
  e1rmKg: number;
  enteredAt: number; // timestamp when user entered this
}

/**
 * Computed all-time best for an exercise from workout history
 */
export interface ExerciseBest {
  exerciseId: string;
  bestWeightKg: number;
  bestReps: number; // best reps at any weight
  bestE1RMKg: number;
  lastPerformedAt: number;
  totalSets: number; // total sets ever logged
  // Best reps at each weight bucket (key = bucket like "185.0" for 185 lb)
  // This enables rep PR detection: "You did 8 reps at 185 lb - PR! Your previous best was 6"
  bestRepsAtWeight: Record<string, number>;
}

interface PRState {
  // User-entered baseline PRs (from onboarding/profile)
  baselines: Record<string, BaselinePR>;

  // Computed bests from workout history (cached)
  exerciseBests: Record<string, ExerciseBest>;

  // Track which exercises have been performed in completed workouts
  exercisesWithHistory: string[];

  hydrated: boolean;

  // Actions
  setBaseline: (exerciseId: string, weightKg: number, reps: number) => void;
  setBaselines: (baselines: Record<string, BaselinePR>) => void;
  removeBaseline: (exerciseId: string) => void;
  clearBaselines: () => void;

  // Rebuild cache from workout history
  rebuildFromHistory: () => void;

  // Check if we should detect PRs for an exercise
  shouldDetectPRs: (exerciseId: string) => boolean;

  // Get baseline state for PR detection
  getBaselineState: (exerciseId: string) => {
    bestE1RMKg: number;
    bestWeightKg: number;
    bestRepsAtWeight: Record<string, number>;
  };

  setHydrated: (value: boolean) => void;
}

export const usePRStore = create<PRState>()(
  persist(
    (set, get) => ({
      baselines: {},
      exerciseBests: {},
      exercisesWithHistory: [],
      hydrated: false,

      setBaseline: (exerciseId, weightKg, reps) => {
        const e1rmKg = estimate1RM_Epley(weightKg, reps);
        set((state) => ({
          baselines: {
            ...state.baselines,
            [exerciseId]: {
              exerciseId,
              weightKg,
              reps,
              e1rmKg,
              enteredAt: Date.now(),
            },
          },
        }));
      },

      setBaselines: (baselines) => {
        set({ baselines });
      },

      removeBaseline: (exerciseId) => {
        set((state) => {
          const next = { ...state.baselines };
          delete next[exerciseId];
          return { baselines: next };
        });
      },

      clearBaselines: () => {
        set({ baselines: {} });
      },

      rebuildFromHistory: () => {
        const workoutStore = useWorkoutStore.getState();
        // IMPORTANT: Only use native (non-imported) sessions for PR tracking
        // Imported sessions should not affect rank calculations or PR detection
        const sessions = workoutStore.sessions.filter(s => !s.isImported);
        const unit = getSettings().unitSystem ?? "lb";

        const exerciseBests: Record<string, ExerciseBest> = {};
        const exerciseIdSet = new Set<string>();

        for (const session of sessions) {
          if (!session.sets) continue;

          for (const workoutSet of session.sets) {
            const exerciseId = workoutSet.exerciseId;
            exerciseIdSet.add(exerciseId);

            const e1rm = estimate1RM_Epley(workoutSet.weightKg, workoutSet.reps);
            const bucketKey = bucketKeyForUser(workoutSet.weightKg, unit);
            const existing = exerciseBests[exerciseId];

            if (!existing) {
              exerciseBests[exerciseId] = {
                exerciseId,
                bestWeightKg: workoutSet.weightKg,
                bestReps: workoutSet.reps,
                bestE1RMKg: e1rm,
                lastPerformedAt: workoutSet.timestampMs,
                totalSets: 1,
                bestRepsAtWeight: { [bucketKey]: workoutSet.reps },
              };
            } else {
              // Update best reps at this weight bucket
              const prevBestAtBucket = existing.bestRepsAtWeight[bucketKey] ?? 0;
              const newBestRepsAtWeight = {
                ...existing.bestRepsAtWeight,
                [bucketKey]: Math.max(prevBestAtBucket, workoutSet.reps),
              };

              exerciseBests[exerciseId] = {
                ...existing,
                bestWeightKg: Math.max(existing.bestWeightKg, workoutSet.weightKg),
                bestReps: Math.max(existing.bestReps, workoutSet.reps),
                bestE1RMKg: Math.max(existing.bestE1RMKg, e1rm),
                lastPerformedAt: Math.max(existing.lastPerformedAt, workoutSet.timestampMs),
                totalSets: existing.totalSets + 1,
                bestRepsAtWeight: newBestRepsAtWeight,
              };
            }
          }
        }

        set({ exerciseBests, exercisesWithHistory: Array.from(exerciseIdSet) });
      },

      shouldDetectPRs: (exerciseId) => {
        const state = get();
        // Detect PRs if:
        // 1. User entered a baseline for this exercise, OR
        // 2. Exercise has been logged in a completed workout before
        return (
          !!state.baselines[exerciseId] ||
          state.exercisesWithHistory.includes(exerciseId)
        );
      },

      getBaselineState: (exerciseId) => {
        const state = get();
        const baseline = state.baselines[exerciseId];
        const best = state.exerciseBests[exerciseId];
        const unit = getSettings().unitSystem ?? "lb";

        // Use the higher of baseline or workout history
        const baselineE1RM = baseline?.e1rmKg ?? 0;
        const historyE1RM = best?.bestE1RMKg ?? 0;
        const baselineWeight = baseline?.weightKg ?? 0;
        const historyWeight = best?.bestWeightKg ?? 0;

        // Start with historical best reps at each weight
        const bestRepsAtWeight: Record<string, number> = {
          ...(best?.bestRepsAtWeight ?? {}),
        };

        // If user entered a baseline, add that bucket too
        // (their entered weight/reps should count as a rep PR baseline)
        if (baseline) {
          const baselineBucket = bucketKeyForUser(baseline.weightKg, unit);
          const existingAtBucket = bestRepsAtWeight[baselineBucket] ?? 0;
          bestRepsAtWeight[baselineBucket] = Math.max(existingAtBucket, baseline.reps);
        }

        return {
          bestE1RMKg: Math.max(baselineE1RM, historyE1RM),
          bestWeightKg: Math.max(baselineWeight, historyWeight),
          bestRepsAtWeight,
        };
      },

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        baselines: state.baselines,
        // Don't persist exerciseBests - rebuild from workout history on hydration
        // Don't persist exercisesWithHistory - rebuild from workout history
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        // Rebuild from workout history after hydration
        setTimeout(() => {
          state?.rebuildFromHistory();
        }, 100);
      },
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectBaselines = (state: PRState) => state.baselines;
export const selectExerciseBests = (state: PRState) => state.exerciseBests;

// ============================================================================
// Hooks
// ============================================================================

export function useBaselines(): Record<string, BaselinePR> {
  return usePRStore((state) => state.baselines);
}

export function useExerciseBests(): Record<string, ExerciseBest> {
  return usePRStore((state) => state.exerciseBests);
}

export function useBaselineForExercise(exerciseId: string): BaselinePR | undefined {
  return usePRStore((state) => state.baselines[exerciseId]);
}

export function useShouldDetectPRs(exerciseId: string): boolean {
  return usePRStore((state) => state.shouldDetectPRs(exerciseId));
}

// ============================================================================
// Imperative getters
// ============================================================================

export function getBaselines(): Record<string, BaselinePR> {
  return usePRStore.getState().baselines;
}

export function getBaselineForExercise(exerciseId: string): BaselinePR | undefined {
  return usePRStore.getState().baselines[exerciseId];
}

export function shouldDetectPRsForExercise(exerciseId: string): boolean {
  return usePRStore.getState().shouldDetectPRs(exerciseId);
}

export function getBaselineStateForExercise(exerciseId: string): {
  bestE1RMKg: number;
  bestWeightKg: number;
  bestRepsAtWeight: Record<string, number>;
} {
  return usePRStore.getState().getBaselineState(exerciseId);
}

// ============================================================================
// Imperative actions
// ============================================================================

export function setBaselinePR(exerciseId: string, weightKg: number, reps: number): void {
  usePRStore.getState().setBaseline(exerciseId, weightKg, reps);
}

export function setBaselinePRs(baselines: Record<string, BaselinePR>): void {
  usePRStore.getState().setBaselines(baselines);
}

export function removeBaselinePR(exerciseId: string): void {
  usePRStore.getState().removeBaseline(exerciseId);
}

export function clearBaselinePRs(): void {
  usePRStore.getState().clearBaselines();
}

export function rebuildPRsFromHistory(): void {
  usePRStore.getState().rebuildFromHistory();
}

// ============================================================================
// Key lifts for onboarding
// ============================================================================

export const KEY_LIFTS = [
  { id: "bench", name: "Bench Press", emoji: "🏋️" },
  { id: "squat", name: "Squat", emoji: "🦵" },
  { id: "deadlift", name: "Deadlift", emoji: "💪" },
  { id: "ohp", name: "Overhead Press", emoji: "🙆" },
] as const;

export type KeyLiftId = typeof KEY_LIFTS[number]["id"];
