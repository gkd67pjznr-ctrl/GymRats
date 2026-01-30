// src/lib/avatar/growthCalculator.ts
// Avatar growth calculation algorithms

import type { AvatarGrowth } from "./avatarTypes";

/**
 * Calculate avatar growth stage based on workout metrics
 *
 * Growth Philosophy:
 * Inspired by the Finch app. The avatar's growth represents the user sticking to their
 * fitness journey and caring about themselves. It's inspirational and emotional — not
 * just a game mechanic. Users should feel proud watching their avatar grow.
 *
 * @param currentGrowth - Current avatar growth data
 * @param newVolumeKg - Volume from latest workout
 * @param newSets - Sets from latest workout
 * @param newAvgRank - Average rank from latest workout
 * @returns Updated avatar growth data
 */
export function calculateAvatarGrowth(
  currentGrowth: AvatarGrowth,
  newVolumeKg: number,
  newSets: number,
  newAvgRank: number
): AvatarGrowth {
  // Update cumulative metrics
  const updatedVolumeTotal = currentGrowth.volumeTotal + newVolumeKg;
  const updatedSetsTotal = currentGrowth.setsTotal + newSets;

  // Calculate new average rank (weighted by sets)
  const totalSetsSoFar = currentGrowth.setsTotal;
  const newTotalSets = totalSetsSoFar + newSets;
  const updatedAvgRank = newTotalSets > 0
    ? (currentGrowth.avgRank * totalSetsSoFar + newAvgRank * newSets) / newTotalSets
    : newAvgRank;

  // Calculate growth stage based on cumulative metrics
  // Stage progression is based on a combination of factors to make growth feel meaningful
  const volumeProgress = updatedVolumeTotal / 10000; // 10,000 kg per stage
  const setProgress = updatedSetsTotal / 100; // 100 sets per stage
  const rankProgress = updatedAvgRank / 5; // 5 ranks per stage

  // Combine progress factors with different weights
  const combinedProgress = (volumeProgress * 0.4) + (setProgress * 0.4) + (rankProgress * 0.2);

  // Calculate new stage (1-20)
  const newStage = Math.min(20, Math.max(1, Math.floor(combinedProgress) + 1));

  // Calculate height scale (0.3 to 1.0)
  // This creates a non-linear growth curve that feels more satisfying
  const progressRatio = (newStage - 1) / 19; // 0.0 to 1.0
  const newHeightScale = 0.3 + (0.7 * Math.pow(progressRatio, 0.8));

  return {
    stage: newStage,
    heightScale: parseFloat(newHeightScale.toFixed(3)),
    volumeTotal: updatedVolumeTotal,
    setsTotal: updatedSetsTotal,
    avgRank: parseFloat(updatedAvgRank.toFixed(2)),
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
  // Milestones at stages 5, 10, 15, and 20
  const milestoneStages = [5, 10, 15, 20];

  // Check if we've crossed any milestone stage
  for (const milestone of milestoneStages) {
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