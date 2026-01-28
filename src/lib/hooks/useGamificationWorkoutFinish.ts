/**
 * Hook to handle gamification when a workout finishes.
 *
 * Call this when the user completes a workout to:
 * - Calculate and award XP
 * - Update streak
 * - Check for level ups
 * - Award Forge Tokens
 * - Sync to server
 */

import { useCallback } from 'react';
import { useGamificationStore } from '@/src/lib/stores/gamificationStore';
import type { WorkoutForCalculation } from '@/src/lib/gamification/types';

export interface GamificationWorkoutResult {
  xpEarned: number;
  didLevelUp: boolean;
  newLevel?: number;
  tokensEarned: number;
  streakMilestoneTokens?: number;
}

export interface UseGamificationWorkoutFinishResult {
  /**
   * Process a completed workout through the gamification system.
   * Call this when the user finishes a workout.
   *
   * @param workout - Workout data for XP calculation
   * @param xpOverride - Optional override XP amount (for testing)
   * @returns Gamification results including XP, level up, and tokens
   */
  handleWorkoutFinish: (
    workout: WorkoutForCalculation,
    xpOverride?: number
  ) => GamificationWorkoutResult;

  /**
   * Dismiss the pending level up modal.
   * Call this when the user closes the level up celebration.
   */
  dismissLevelUp: () => void;

  /**
   * Sync gamification data to the server.
   * Call this after processing a workout to ensure data is saved.
   */
  syncToServer: () => Promise<void>;
}

export function useGamificationWorkoutFinish(): UseGamificationWorkoutFinishResult {
  const processWorkout = useGamificationStore((s) => s.processWorkout);
  const dismissLevelUp = useGamificationStore((s) => s.dismissLevelUp);
  const pushToServer = useGamificationStore((s) => s.pushToServer);
  const sync = useGamificationStore((s) => s.sync);

  const handleWorkoutFinish = useCallback(
    (workout: WorkoutForCalculation, xpOverride?: number): GamificationWorkoutResult => {
      const result = processWorkout(workout, xpOverride);
      return result;
    },
    [processWorkout]
  );

  const dismissLevelUpCallback = useCallback(() => {
    dismissLevelUp();
  }, [dismissLevelUp]);

  const syncToServer = useCallback(async () => {
    try {
      await sync();
    } catch (error) {
      console.error('[useGamificationWorkoutFinish] Sync failed:', error);
    }
  }, [sync]);

  return {
    handleWorkoutFinish,
    dismissLevelUp: dismissLevelUpCallback,
    syncToServer,
  };
}

/**
 * Convert a WorkoutSession to WorkoutForCalculation format.
 * Use this when finishing a workout to prepare data for gamification.
 *
 * @param sets - Workout sets
 * @param currentStreak - Current streak count
 * @param fullyCompleted - Whether workout was 100% completed
 * @returns Workout data for gamification
 */
export function toWorkoutForCalculation(
  sets: Array<{ exerciseId: string; weightKg: number; reps: number }>,
  currentStreak: number,
  fullyCompleted?: boolean
): WorkoutForCalculation {
  return {
    sets,
    currentStreak,
    fullyCompleted,
  };
}

// Imperative version for non-React code
export function handleGamificationWorkoutFinish(
  workout: WorkoutForCalculation,
  xpOverride?: number
): GamificationWorkoutResult {
  return useGamificationStore.getState().processWorkout(workout, xpOverride);
}

export function dismissGamificationLevelUp() {
  useGamificationStore.getState().dismissLevelUp();
}

export async function syncGamificationToServer() {
  try {
    await useGamificationStore.getState().sync();
  } catch (error) {
    console.error('[useGamificationWorkoutFinish] Sync failed:', error);
    throw error;
  }
}
