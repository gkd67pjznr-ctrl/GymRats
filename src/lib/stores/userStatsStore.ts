// src/lib/stores/userStatsStore.ts
// Unified store for all user statistics - single source of truth
// Consolidates avatar growth, profile stats, XP, and Forge DNA calculations

import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WorkoutSession } from "../workoutModel";
import type {
  UserStatsState,
  ExerciseStats,
  LifetimeStats,
  ConsistencyMetrics,
  VarietyMetrics,
  GymRank,
  ProcessWorkoutResult,
  DerivedAvatarGrowth,
  RankTier,
} from "../userStats/types";
import {
  DEFAULT_LIFETIME_STATS,
  DEFAULT_CONSISTENCY_METRICS,
  DEFAULT_VARIETY_METRICS,
  DEFAULT_FORGE_RANK,
} from "../userStats/types";
import {
  updateExerciseStats,
  updateVolumeByMuscle,
  calculateVariety,
  groupSetsByExercise,
  calculateConsistencyFromSessions,
} from "../userStats/statsCalculators";
import { calculateGymRank } from "../userStats/gymRankCalculator";
import { deriveAvatarGrowth } from "../userStats/deriveAvatarGrowth";
import { EXERCISES_V1 } from "../../data/exercises";

const STORAGE_KEY = "userStats.v1";
const AVATAR_STORAGE_KEY = "avatar.v1";
const WORKOUT_STORAGE_KEY = "workoutSessions.v2";

// Declare __DEV__ for TypeScript
declare const __DEV__: boolean | undefined;

/**
 * Get exercise display name
 */
function getExerciseName(exerciseId: string): string {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

export interface UserStatsStoreState extends UserStatsState {
  // Actions
  processWorkout: (session: WorkoutSession) => ProcessWorkoutResult;
  syncConsistency: (currentStreak: number, longestStreak: number) => void;
  rebuildFromHistory: (sessions: WorkoutSession[]) => void;
  getAvatarGrowth: () => DerivedAvatarGrowth;
  setHydrated: (value: boolean) => void;

  // Sync actions (for future backend integration)
  pullFromServer: () => Promise<void>;
  pushToServer: () => Promise<void>;
}

export const useUserStatsStore = create<UserStatsStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      lifetimeStats: { ...DEFAULT_LIFETIME_STATS },
      exerciseStats: {},
      volumeByMuscle: {},
      consistency: { ...DEFAULT_CONSISTENCY_METRICS },
      variety: { ...DEFAULT_VARIETY_METRICS },
      gymRank: { ...DEFAULT_FORGE_RANK },
      version: 1,
      lastSyncedMs: null,
      hydrated: false,

      /**
       * Process a completed workout - THE main entry point
       * Updates all stats, detects PRs, calculates Forge Rank
       */
      processWorkout: (session: WorkoutSession): ProcessWorkoutResult => {
        const state = get();
        const now = Date.now();

        // Track PRs and rank-ups for the result
        const prs: ProcessWorkoutResult["prs"] = [];
        const rankUps: ProcessWorkoutResult["rankUps"] = [];

        // Calculate workout volume
        const workoutVolumeKg = session.sets.reduce(
          (sum, set) => sum + set.weightKg * set.reps,
          0
        );
        const workoutSets = session.sets.length;

        // Group sets by exercise
        const setsByExercise = groupSetsByExercise(session.sets);

        // Update exercise stats
        const newExerciseStats = { ...state.exerciseStats };

        for (const [exerciseId, sets] of Object.entries(setsByExercise)) {
          const existing = newExerciseStats[exerciseId];
          const oldRank = existing?.rank ?? 1;

          const { stats: updatedStats, prs: detectedPRs } = updateExerciseStats(
            existing,
            exerciseId,
            sets
          );

          newExerciseStats[exerciseId] = updatedStats;

          // Record PRs
          for (const pr of detectedPRs) {
            if (pr.weightPR && pr.newBestWeight !== undefined) {
              prs.push({
                type: "weight",
                exerciseId,
                exerciseName: getExerciseName(exerciseId),
                value: pr.newBestWeight,
                previousValue: pr.previousBestWeight,
              });
            }
            if (pr.repPR && pr.newBestReps !== undefined) {
              prs.push({
                type: "rep",
                exerciseId,
                exerciseName: getExerciseName(exerciseId),
                value: pr.newBestReps,
                previousValue: pr.previousBestReps,
              });
            }
            if (pr.e1rmPR && pr.newBestE1RM !== undefined) {
              prs.push({
                type: "e1rm",
                exerciseId,
                exerciseName: getExerciseName(exerciseId),
                value: pr.newBestE1RM,
                previousValue: pr.previousBestE1RM,
              });
            }
          }

          // Check for rank up
          const newRank = updatedStats.rank;
          if (newRank > oldRank) {
            const tier = getTierFromRank(newRank);
            rankUps.push({
              exerciseId,
              exerciseName: getExerciseName(exerciseId),
              oldRank,
              newRank,
              tier,
            });
          }
        }

        // Update volume by muscle
        const newVolumeByMuscle = updateVolumeByMuscle(
          state.volumeByMuscle,
          session.sets
        );

        // Update variety metrics
        const newVariety = calculateVariety(newExerciseStats, newVolumeByMuscle);

        // Update lifetime stats
        const newLifetimeStats: LifetimeStats = {
          ...state.lifetimeStats,
          totalVolumeKg: state.lifetimeStats.totalVolumeKg + workoutVolumeKg,
          totalSets: state.lifetimeStats.totalSets + workoutSets,
          totalWorkouts: state.lifetimeStats.totalWorkouts + 1,
          totalPRs: state.lifetimeStats.totalPRs + prs.length,
          weightPRs: state.lifetimeStats.weightPRs + prs.filter((p) => p.type === "weight").length,
          repPRs: state.lifetimeStats.repPRs + prs.filter((p) => p.type === "rep").length,
          e1rmPRs: state.lifetimeStats.e1rmPRs + prs.filter((p) => p.type === "e1rm").length,
          firstWorkoutMs: state.lifetimeStats.firstWorkoutMs ?? session.startedAtMs,
          lastWorkoutMs: session.endedAtMs,
        };

        // Calculate new Forge Rank
        const newGymRank = calculateGymRank({
          exerciseStats: newExerciseStats,
          consistency: state.consistency,
          variety: newVariety,
          totalVolumeKg: newLifetimeStats.totalVolumeKg,
        });

        // Get avatar growth (for result)
        const previousStage = deriveAvatarGrowth(
          state.lifetimeStats,
          state.exerciseStats
        ).stage;

        const avatarGrowth = deriveAvatarGrowth(
          newLifetimeStats,
          newExerciseStats,
          previousStage
        );

        // Update state
        set({
          lifetimeStats: newLifetimeStats,
          exerciseStats: newExerciseStats,
          volumeByMuscle: newVolumeByMuscle,
          variety: newVariety,
          gymRank: newGymRank,
        });

        return {
          prs,
          rankUps,
          gymRank: newGymRank,
          avatarGrowth,
          volumeAddedKg: workoutVolumeKg,
          setsAdded: workoutSets,
        };
      },

      /**
       * Sync consistency metrics from gamification store
       * Called after gamification processes a workout
       */
      syncConsistency: (currentStreak: number, longestStreak: number) => {
        const state = get();

        set({
          consistency: {
            ...state.consistency,
            currentStreak,
            longestStreak: Math.max(state.consistency.longestStreak, longestStreak),
          },
        });

        // Recalculate Forge Rank with updated consistency
        const newGymRank = calculateGymRank({
          exerciseStats: state.exerciseStats,
          consistency: {
            ...state.consistency,
            currentStreak,
            longestStreak,
          },
          variety: state.variety,
          totalVolumeKg: state.lifetimeStats.totalVolumeKg,
        });

        set({ gymRank: newGymRank });
      },

      /**
       * Rebuild all stats from workout history
       * Used for migration or data recovery
       */
      rebuildFromHistory: (sessions: WorkoutSession[]) => {
        // Sort sessions by start time
        const sortedSessions = [...sessions].sort(
          (a, b) => a.startedAtMs - b.startedAtMs
        );

        // Reset to defaults
        let lifetimeStats: LifetimeStats = { ...DEFAULT_LIFETIME_STATS };
        let exerciseStats: Record<string, ExerciseStats> = {};
        let volumeByMuscle: Partial<Record<string, number>> = {};

        // Process each session
        for (const session of sortedSessions) {
          const workoutVolumeKg = session.sets.reduce(
            (sum, set) => sum + set.weightKg * set.reps,
            0
          );
          const workoutSets = session.sets.length;

          // Group sets by exercise
          const setsByExercise = groupSetsByExercise(session.sets);

          // Update exercise stats
          for (const [exerciseId, sets] of Object.entries(setsByExercise)) {
            const { stats: updatedStats } = updateExerciseStats(
              exerciseStats[exerciseId],
              exerciseId,
              sets
            );
            exerciseStats[exerciseId] = updatedStats;
          }

          // Update volume by muscle
          volumeByMuscle = updateVolumeByMuscle(volumeByMuscle, session.sets);

          // Update lifetime stats
          lifetimeStats = {
            ...lifetimeStats,
            totalVolumeKg: lifetimeStats.totalVolumeKg + workoutVolumeKg,
            totalSets: lifetimeStats.totalSets + workoutSets,
            totalWorkouts: lifetimeStats.totalWorkouts + 1,
            firstWorkoutMs: lifetimeStats.firstWorkoutMs ?? session.startedAtMs,
            lastWorkoutMs: session.endedAtMs,
          };
        }

        // Calculate variety
        const variety = calculateVariety(exerciseStats, volumeByMuscle);

        // Calculate consistency from sessions
        const consistencyMetrics = calculateConsistencyFromSessions(
          sortedSessions,
          0, // Streak will be synced from gamification
          0
        );

        const consistency: ConsistencyMetrics = {
          ...DEFAULT_CONSISTENCY_METRICS,
          ...consistencyMetrics,
        };

        // Calculate Forge Rank
        const gymRank = calculateGymRank({
          exerciseStats,
          consistency,
          variety,
          totalVolumeKg: lifetimeStats.totalVolumeKg,
        });

        // Set all state at once
        set({
          lifetimeStats,
          exerciseStats,
          volumeByMuscle,
          variety,
          consistency,
          gymRank,
          version: 1,
        });
      },

      /**
       * Get derived avatar growth (computed, not stored)
       */
      getAvatarGrowth: (): DerivedAvatarGrowth => {
        const state = get();
        return deriveAvatarGrowth(state.lifetimeStats, state.exerciseStats);
      },

      /**
       * Set hydration state
       */
      setHydrated: (value: boolean) => set({ hydrated: value }),

      /**
       * Pull stats from server (placeholder for future backend sync)
       */
      pullFromServer: async () => {
        // TODO: Implement backend sync
        if (__DEV__) {
          console.log("[userStatsStore] pullFromServer not yet implemented");
        }
      },

      /**
       * Push stats to server (placeholder for future backend sync)
       */
      pushToServer: async () => {
        // TODO: Implement backend sync
        if (__DEV__) {
          console.log("[userStatsStore] pushToServer not yet implemented");
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        lifetimeStats: state.lifetimeStats,
        exerciseStats: state.exerciseStats,
        volumeByMuscle: state.volumeByMuscle,
        consistency: state.consistency,
        variety: state.variety,
        gymRank: state.gymRank,
        version: state.version,
        lastSyncedMs: state.lastSyncedMs,
      }),
      onRehydrateStorage: () => async (state) => {
        if (state) {
          state.setHydrated(true);

          // Migration: check if we need to rebuild from avatar store or workout history
          // Also rebuild if workout history has more exercises than stats (data mismatch)
          const needsMigration = state.version < 1 || state.lifetimeStats.totalWorkouts === 0;

          if (needsMigration) {
            try {
              await migrateFromLegacyStores(state);
            } catch (error) {
              if (__DEV__) {
                console.error("[userStatsStore] Migration failed:", error);
              }
            }
          } else {
            // Check for mismatch - rebuild if workout history has exercises not in stats
            try {
              await checkAndRebuildIfNeeded(state);
            } catch (error) {
              if (__DEV__) {
                console.error("[userStatsStore] Rebuild check failed:", error);
              }
            }
          }
        }
      },
    }
  )
);

/**
 * Migrate data from legacy avatar and workout stores
 */
async function migrateFromLegacyStores(state: UserStatsStoreState) {
  try {
    // Try to read legacy avatar store
    const avatarDataStr = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
    const workoutDataStr = await AsyncStorage.getItem(WORKOUT_STORAGE_KEY);

    if (workoutDataStr) {
      const workoutData = JSON.parse(workoutDataStr);
      const sessions: WorkoutSession[] = workoutData.state?.sessions || [];

      if (sessions.length > 0) {
        if (__DEV__) {
          console.log(
            `[userStatsStore] Migrating from ${sessions.length} workout sessions`
          );
        }
        state.rebuildFromHistory(sessions);
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.error("[userStatsStore] Error during migration:", error);
    }
  }
}

/**
 * Check if workout history has exercises not in stats and rebuild if needed
 */
async function checkAndRebuildIfNeeded(state: UserStatsStoreState) {
  try {
    const workoutDataStr = await AsyncStorage.getItem(WORKOUT_STORAGE_KEY);
    if (!workoutDataStr) return;

    const workoutData = JSON.parse(workoutDataStr);
    const sessions: WorkoutSession[] = workoutData.state?.sessions || [];
    if (sessions.length === 0) return;

    // Get unique exercise IDs from workout history
    const historyExerciseIds = new Set<string>();
    for (const session of sessions) {
      for (const set of session.sets) {
        historyExerciseIds.add(set.exerciseId);
      }
    }

    // Get exercise IDs from stats
    const statsExerciseIds = new Set(Object.keys(state.exerciseStats));

    // Check if history has exercises not in stats
    let needsRebuild = false;
    for (const exerciseId of historyExerciseIds) {
      if (!statsExerciseIds.has(exerciseId)) {
        needsRebuild = true;
        break;
      }
    }

    if (needsRebuild) {
      if (__DEV__) {
        console.log(
          `[userStatsStore] Rebuilding stats - history has ${historyExerciseIds.size} exercises, stats has ${statsExerciseIds.size}`
        );
      }
      state.rebuildFromHistory(sessions);
    }
  } catch (error) {
    if (__DEV__) {
      console.error("[userStatsStore] Error checking for rebuild:", error);
    }
  }
}

/**
 * Get tier from rank number
 */
function getTierFromRank(rank: number): RankTier {
  if (rank <= 3) return "iron";
  if (rank <= 6) return "bronze";
  if (rank <= 9) return "silver";
  if (rank <= 12) return "gold";
  if (rank <= 15) return "platinum";
  if (rank <= 18) return "diamond";
  return "mythic";
}

// ========== Selectors ==========

export const selectLifetimeStats = (state: UserStatsStoreState) => state.lifetimeStats;
export const selectExerciseStats = (state: UserStatsStoreState) => state.exerciseStats;
export const selectGymRank = (state: UserStatsStoreState) => state.gymRank;
export const selectConsistency = (state: UserStatsStoreState) => state.consistency;
export const selectVariety = (state: UserStatsStoreState) => state.variety;
export const selectIsHydrated = (state: UserStatsStoreState) => state.hydrated;

// ========== Hooks ==========

export function useLifetimeStats(): LifetimeStats {
  return useUserStatsStore(selectLifetimeStats);
}

export function useExerciseStats(): Record<string, ExerciseStats> {
  return useUserStatsStore(selectExerciseStats);
}

export function useGymRank(): GymRank {
  return useUserStatsStore(selectGymRank);
}

export function useConsistencyMetrics(): ConsistencyMetrics {
  return useUserStatsStore(selectConsistency);
}

export function useVarietyMetrics(): VarietyMetrics {
  return useUserStatsStore(selectVariety);
}

export function useIsUserStatsHydrated(): boolean {
  return useUserStatsStore(selectIsHydrated);
}

export function useAvatarGrowth(): DerivedAvatarGrowth {
  const lifetimeStats = useUserStatsStore((state) => state.lifetimeStats);
  const exerciseStats = useUserStatsStore((state) => state.exerciseStats);

  return useMemo(
    () => deriveAvatarGrowth(lifetimeStats, exerciseStats),
    [lifetimeStats, exerciseStats]
  );
}

// ========== Imperative Getters ==========

export function getGymRank(): GymRank {
  return useUserStatsStore.getState().gymRank;
}

export function getLifetimeStats(): LifetimeStats {
  return useUserStatsStore.getState().lifetimeStats;
}

export function getExerciseStats(): Record<string, ExerciseStats> {
  return useUserStatsStore.getState().exerciseStats;
}

export function getAvatarGrowth(): DerivedAvatarGrowth {
  return useUserStatsStore.getState().getAvatarGrowth();
}

export function processUserStatsWorkout(session: WorkoutSession): ProcessWorkoutResult {
  return useUserStatsStore.getState().processWorkout(session);
}

export function syncUserStatsConsistency(
  currentStreak: number,
  longestStreak: number
): void {
  useUserStatsStore.getState().syncConsistency(currentStreak, longestStreak);
}

export function rebuildUserStatsFromHistory(sessions: WorkoutSession[]): void {
  useUserStatsStore.getState().rebuildFromHistory(sessions);
}

// Re-export for convenience
export { getGrowthStageDescription } from "../userStats/deriveAvatarGrowth";
export type {
  ExerciseStats,
  LifetimeStats,
  ConsistencyMetrics,
  VarietyMetrics,
  GymRank,
  ProcessWorkoutResult,
  DerivedAvatarGrowth,
  RankTier,
} from "../userStats/types";
