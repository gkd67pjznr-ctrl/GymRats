// src/lib/userStats/deriveAvatarGrowth.ts
// Avatar growth derivation from user statistics
// Uses same algorithm as growthCalculator.ts but works from unified stats

import type { DerivedAvatarGrowth, LifetimeStats, ExerciseStats } from "./types";

/**
 * Growth Philosophy (from growthCalculator.ts):
 * Inspired by the Finch app. The avatar's growth represents the user sticking to their
 * fitness journey and caring about themselves. It's inspirational and emotional — not
 * just a game mechanic. Users should feel proud watching their avatar grow.
 */

/**
 * Milestone stages for celebration
 */
const MILESTONE_STAGES = [5, 10, 15, 20];

/**
 * Derive avatar growth from user statistics
 *
 * @param lifetimeStats - Lifetime statistics
 * @param exerciseStats - Per-exercise statistics (for avg rank)
 * @param previousStage - Previous stage for milestone detection
 * @returns Derived avatar growth data
 */
export function deriveAvatarGrowth(
  lifetimeStats: LifetimeStats,
  exerciseStats: Record<string, ExerciseStats>,
  previousStage?: number
): DerivedAvatarGrowth {
  const { totalVolumeKg, totalSets } = lifetimeStats;

  // Calculate average rank from exercise stats
  const exerciseStatsList = Object.values(exerciseStats);
  const avgRank = exerciseStatsList.length > 0
    ? exerciseStatsList.reduce((sum, s) => sum + s.rank, 0) / exerciseStatsList.length
    : 0;

  // Calculate growth stage based on cumulative metrics
  // Stage progression is based on a combination of factors to make growth feel meaningful
  const volumeProgress = totalVolumeKg / 10000; // 10,000 kg per stage
  const setProgress = totalSets / 100; // 100 sets per stage
  const rankProgress = avgRank / 5; // 5 ranks per stage

  // Combine progress factors with different weights (same as growthCalculator.ts)
  const combinedProgress = (volumeProgress * 0.4) + (setProgress * 0.4) + (rankProgress * 0.2);

  // Calculate new stage (1-20)
  const stage = Math.min(20, Math.max(1, Math.floor(combinedProgress) + 1));

  // Calculate height scale (0.3 to 1.0)
  // This creates a non-linear growth curve that feels more satisfying
  const progressRatio = (stage - 1) / 19; // 0.0 to 1.0
  const heightScale = 0.3 + (0.7 * Math.pow(progressRatio, 0.8));

  // Check for milestone
  const milestoneReached = previousStage !== undefined
    ? isGrowthMilestone(previousStage, stage)
    : false;

  return {
    stage,
    heightScale: parseFloat(heightScale.toFixed(3)),
    volumeTotal: totalVolumeKg,
    setsTotal: totalSets,
    avgRank: parseFloat(avgRank.toFixed(2)),
    milestoneReached,
    previousStage,
  };
}

/**
 * Determine if avatar has reached a milestone growth stage
 *
 * @param oldStage - Previous growth stage
 * @param newStage - New growth stage
 * @returns Boolean indicating if a milestone was reached
 */
export function isGrowthMilestone(oldStage: number, newStage: number): boolean {
  // Check if we've crossed any milestone stage
  for (const milestone of MILESTONE_STAGES) {
    if (oldStage < milestone && newStage >= milestone) {
      return true;
    }
  }
  return false;
}

/**
 * Get growth stage description for UI display
 *
 * @param stage - Growth stage (1-20)
 * @returns Descriptive text for the growth stage
 */
export function getGrowthStageDescription(stage: number): string {
  if (stage <= 3) return "Just Starting";
  if (stage <= 6) return "Making Progress";
  if (stage <= 9) return "Building Consistency";
  if (stage <= 12) return "Gaining Strength";
  if (stage <= 15) return "True Commitment";
  if (stage <= 18) return "Fitness Champion";
  if (stage <= 20) return "Legend Status";
  return "Beginner";
}

/**
 * Get growth stage percentage for progress bar
 *
 * @param stage - Growth stage (1-20)
 * @returns Percentage (0-100)
 */
export function getGrowthStagePercentage(stage: number): number {
  return Math.min(100, Math.max(0, (stage - 1) * 5)); // 5% per stage
}

/**
 * Calculate growth from a single workout's contribution
 * Used to preview what growth a workout would add
 *
 * @param currentGrowth - Current derived growth
 * @param workoutVolumeKg - Volume from new workout
 * @param workoutSets - Sets from new workout
 * @param workoutAvgRank - Average rank from new workout
 * @returns Updated growth data
 */
export function calculateWorkoutGrowthContribution(
  currentGrowth: DerivedAvatarGrowth,
  workoutVolumeKg: number,
  workoutSets: number,
  workoutAvgRank: number
): DerivedAvatarGrowth {
  // Calculate new totals
  const newVolumeTotal = currentGrowth.volumeTotal + workoutVolumeKg;
  const newSetsTotal = currentGrowth.setsTotal + workoutSets;

  // Calculate new weighted average rank
  const currentTotalSets = currentGrowth.setsTotal;
  const newTotalSets = currentTotalSets + workoutSets;
  const newAvgRank = newTotalSets > 0
    ? (currentGrowth.avgRank * currentTotalSets + workoutAvgRank * workoutSets) / newTotalSets
    : workoutAvgRank;

  // Calculate growth stage
  const volumeProgress = newVolumeTotal / 10000;
  const setProgress = newSetsTotal / 100;
  const rankProgress = newAvgRank / 5;

  const combinedProgress = (volumeProgress * 0.4) + (setProgress * 0.4) + (rankProgress * 0.2);
  const newStage = Math.min(20, Math.max(1, Math.floor(combinedProgress) + 1));

  // Calculate height scale
  const progressRatio = (newStage - 1) / 19;
  const newHeightScale = 0.3 + (0.7 * Math.pow(progressRatio, 0.8));

  // Check for milestone
  const milestoneReached = isGrowthMilestone(currentGrowth.stage, newStage);

  return {
    stage: newStage,
    heightScale: parseFloat(newHeightScale.toFixed(3)),
    volumeTotal: newVolumeTotal,
    setsTotal: newSetsTotal,
    avgRank: parseFloat(newAvgRank.toFixed(2)),
    milestoneReached,
    previousStage: currentGrowth.stage,
  };
}
