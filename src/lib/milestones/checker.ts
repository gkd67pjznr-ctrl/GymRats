/**
 * Milestone Checker
 * Determines which milestones are earned based on user stats.
 */

import type { ForgeMilestone, EarnedMilestone, MilestoneUserStats, MilestoneWithProgress } from './types';
import { getMilestoneById } from './definitions';

/**
 * Check if a single milestone condition is met
 */
function checkCondition(condition: ForgeMilestone['condition'], stats: MilestoneUserStats): boolean {
  switch (condition.type) {
    case 'workouts':
      return stats.totalWorkouts >= condition.threshold;

    case 'streak':
      return stats.longestStreak >= condition.threshold;

    case 'prs':
      return stats.totalPRs >= condition.threshold;

    case 'pr_streak':
      return (stats.longestPRStreak ?? 0) >= condition.threshold;

    case 'prs_in_workout':
      return (stats.maxPRsInWorkout ?? 0) >= condition.threshold;

    case 'pr_types':
      return stats.hasAllPRTypes === true;

    case 'level':
      return stats.currentLevel >= condition.threshold;

    case 'sets':
      return stats.totalSets >= condition.threshold;

    case 'exercises_ranked':
      if (condition.minRankTier) {
        // Count exercises at or above the specified rank tier
        const count = Object.values(stats.exerciseRanks).filter(rank => rank >= condition.minRankTier!).length;
        return count >= condition.threshold;
      }
      return stats.exercisesRanked >= condition.threshold;

    case 'exercises_logged':
      return stats.exercisesLogged >= condition.threshold;

    case 'workout_shared':
      return stats.hasSharedWorkout;

    case 'rank':
      if (condition.exerciseId === 'any') {
        // Check if any exercise has reached this rank
        return Object.values(stats.exerciseRanks).some(rank => rank >= condition.threshold);
      }
      // Specific exercise rank check
      const exerciseRank = stats.exerciseRanks[condition.exerciseId || ''];
      return (exerciseRank ?? 0) >= condition.threshold;

    case 'club':
      if (!condition.clubExercises || condition.clubExercises.length === 0) {
        return false;
      }
      // Sum max weights for specified exercises
      const total = condition.clubExercises.reduce((sum, exerciseId) => {
        return sum + (stats.exerciseMaxWeights[exerciseId] || 0);
      }, 0);
      return total >= condition.threshold;

    default:
      return false;
  }
}

/**
 * Calculate progress percentage for a milestone condition
 */
function calculateProgress(condition: ForgeMilestone['condition'], stats: MilestoneUserStats): {
  current: number;
  max: number;
  percentage: number;
} {
  let current = 0;
  let max = condition.threshold;

  switch (condition.type) {
    case 'workouts':
      current = stats.totalWorkouts;
      break;
    case 'streak':
      current = stats.longestStreak;
      break;
    case 'prs':
      current = stats.totalPRs;
      break;
    case 'pr_streak':
      current = stats.longestPRStreak ?? 0;
      break;
    case 'prs_in_workout':
      current = stats.maxPRsInWorkout ?? 0;
      break;
    case 'pr_types':
      current = stats.hasAllPRTypes ? 3 : 0;
      max = 3;
      break;
    case 'level':
      current = stats.currentLevel;
      break;
    case 'sets':
      current = stats.totalSets;
      break;
    case 'exercises_ranked':
      if (condition.minRankTier) {
        current = Object.values(stats.exerciseRanks).filter(rank => rank >= condition.minRankTier!).length;
      } else {
        current = stats.exercisesRanked;
      }
      break;
    case 'exercises_logged':
      current = stats.exercisesLogged;
      break;
    case 'workout_shared':
      current = stats.hasSharedWorkout ? 1 : 0;
      max = 1;
      break;
    case 'rank':
      if (condition.exerciseId === 'any') {
        // For "any exercise" rank, use the highest rank achieved
        current = Math.max(0, ...Object.values(stats.exerciseRanks));
      } else {
        current = stats.exerciseRanks[condition.exerciseId || ''] || 0;
      }
      break;
    case 'club':
      if (condition.clubExercises) {
        current = condition.clubExercises.reduce((sum, exerciseId) => {
          return sum + (stats.exerciseMaxWeights[exerciseId] || 0);
        }, 0);
      } else {
        current = 0;
      }
      break;
  }

  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  return { current, max, percentage };
}

/**
 * Get all earned milestone IDs based on current stats
 */
export function getEarnedMilestoneIds(stats: MilestoneUserStats): string[] {
  const earned: string[] = [];

  // Check against all milestone definitions
  // We'll import ALL_MILESTONES from definitions to avoid circular deps
  const { ALL_MILESTONES } = require('./definitions');

  for (const milestone of ALL_MILESTONES) {
    if (checkCondition(milestone.condition, stats)) {
      earned.push(milestone.id);
    }
  }

  return earned;
}

/**
 * Get newly earned milestones (not previously earned)
 */
export function getNewlyEarnedMilestones(
  stats: MilestoneUserStats,
  previouslyEarnedIds: string[]
): ForgeMilestone[] {
  const nowEarned = getEarnedMilestoneIds(stats);
  const newIds = nowEarned.filter(id => !previouslyEarnedIds.includes(id));

  return newIds.map(id => getMilestoneById(id)).filter((m): m is ForgeMilestone => m !== undefined);
}

/**
 * Check if a specific milestone is earned
 */
export function isMilestoneEarned(milestoneId: string, stats: MilestoneUserStats): boolean {
  const milestone = getMilestoneById(milestoneId);
  if (!milestone) return false;
  return checkCondition(milestone.condition, stats);
}

/**
 * Get all milestones with progress information
 */
export function getMilestonesWithProgress(
  stats: MilestoneUserStats,
  earnedMilestones: Record<string, number> // milestoneId -> earnedAt timestamp
): MilestoneWithProgress[] {
  const { ALL_MILESTONES } = require('./definitions');

  return ALL_MILESTONES.map(milestone => {
    const isEarned = earnedMilestones[milestone.id] !== undefined;
    const progress = calculateProgress(milestone.condition, stats);

    return {
      ...milestone,
      isEarned,
      progress: progress.percentage,
      currentValue: progress.current,
      earnedAt: earnedMilestones[milestone.id],
    };
  });
}

/**
 * Get milestones grouped by rarity with progress
 */
export function getMilestonesByRarityWithProgress(
  stats: MilestoneUserStats,
  earnedMilestones: Record<string, number>
): Record<string, MilestoneWithProgress[]> {
  const withProgress = getMilestonesWithProgress(stats, earnedMilestones);

  return {
    common: withProgress.filter(m => m.rarity === 'common'),
    rare: withProgress.filter(m => m.rarity === 'rare'),
    epic: withProgress.filter(m => m.rarity === 'epic'),
    legendary: withProgress.filter(m => m.rarity === 'legendary'),
  };
}

/**
 * Calculate milestone stats summary
 */
export function getMilestoneStats(stats: MilestoneUserStats, earnedIds: string[]): {
  total: number;
  earned: number;
  byRarity: Record<string, { total: number; earned: number }>;
  completionPercent: number;
} {
  const { ALL_MILESTONES } = require('./definitions');

  const byRarity: Record<string, { total: number; earned: number }> = {
    common: { total: 0, earned: 0 },
    rare: { total: 0, earned: 0 },
    epic: { total: 0, earned: 0 },
    legendary: { total: 0, earned: 0 },
  };

  for (const milestone of ALL_MILESTONES) {
    byRarity[milestone.rarity].total++;
    if (earnedIds.includes(milestone.id)) {
      byRarity[milestone.rarity].earned++;
    }
  }

  const total = ALL_MILESTONES.length;
  const earned = earnedIds.length;
  const completionPercent = total > 0 ? (earned / total) * 100 : 0;

  return { total, earned, byRarity, completionPercent };
}
