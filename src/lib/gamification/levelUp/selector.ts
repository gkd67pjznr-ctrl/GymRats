/**
 * Selector functions for gamification data.
 * Provides efficient access to derived state.
 */

import type { GamificationProfile, GamificationStats } from '../types';
import { getLevelProgress } from '../xp/levels';
import { getDaysRemainingInStreak } from '../streak/tracker';

/**
 * Get current level progress from profile.
 */
export function selectLevelProgress(profile: GamificationProfile) {
  return getLevelProgress(profile.totalXP);
}

/**
 * Get XP progress percentage for UI.
 */
export function selectXPProgressPercent(profile: GamificationProfile): number {
  return getLevelProgress(profile.totalXP).progressPercent;
}

/**
 * Get current level from profile.
 */
export function selectCurrentLevel(profile: GamificationProfile): number {
  return profile.currentLevel;
}

/**
 * Get total XP from profile.
 */
export function selectTotalXP(profile: GamificationProfile): number {
  return profile.totalXP;
}

/**
 * Get current streak from profile.
 */
export function selectCurrentStreak(profile: GamificationProfile): number {
  return profile.currentStreak;
}

/**
 * Get longest streak from profile.
 */
export function selectLongestStreak(profile: GamificationProfile): number {
  return profile.longestStreak;
}

/**
 * Get Forge Token balance from profile.
 */
export function selectTokenBalance(profile: GamificationProfile): number {
  return profile.forgeTokens;
}

/**
 * Get days remaining before streak breaks.
 */
export function selectStreakDaysRemaining(profile: GamificationProfile): number | null {
  if (!profile.lastWorkoutDate) return null;
  return getDaysRemainingInStreak(profile.lastWorkoutDate);
}

/**
 * Get workout calendar from profile.
 */
export function selectWorkoutCalendar(profile: GamificationProfile) {
  return profile.workoutCalendar;
}

/**
 * Get completed milestones count.
 */
export function selectCompletedMilestonesCount(profile: GamificationProfile): number {
  return profile.milestonesCompleted.length;
}

/**
 * Get comprehensive stats for profile display.
 */
export function selectGamificationStats(profile: GamificationProfile): GamificationStats {
  // Calculate total workouts from calendar
  const totalWorkouts = profile.workoutCalendar.reduce((sum, day) => sum + day.count, 0);

  return {
    totalWorkouts,
    totalSets: 0, // Not tracked in profile - would need to be calculated elsewhere
    totalXP: profile.totalXP,
    currentLevel: profile.currentLevel,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    forgeTokens: profile.forgeTokens,
  };
}

/**
 * Check if profile has pending level up celebration.
 */
export function selectHasPendingLevelUp(profile: GamificationProfile): boolean {
  if (!profile.levelUpCelebrationShown) return false;

  const progress = getLevelProgress(profile.totalXP);
  return progress.currentLevel > Math.floor(profile.levelUpCelebrationShown / 1000);
}

/**
 * Get next level threshold.
 */
export function selectNextLevelThreshold(profile: GamificationProfile): number {
  const progress = getLevelProgress(profile.totalXP);
  return progress.xpToNextLevel;
}

/**
 * Get XP into current level.
 */
export function selectXPIntoCurrentLevel(profile: GamificationProfile): number {
  const progress = getLevelProgress(profile.totalXP);
  return progress.xpIntoLevel;
}

/**
 * Check if milestone is completed.
 */
export function selectIsMilestoneCompleted(
  profile: GamificationProfile,
  milestoneId: string
): boolean {
  return profile.milestonesCompleted.includes(milestoneId as any);
}

/**
 * Get token earnings vs spending ratio.
 */
export function selectTokenEfficiency(profile: GamificationProfile): number {
  if (profile.tokensEarnedTotal === 0) return 0;
  return Math.round((profile.tokensSpentTotal / profile.tokensEarnedTotal) * 100);
}

/**
 * Get level tier color key.
 */
export function selectLevelTierColor(profile: GamificationProfile): string {
  const level = profile.currentLevel;
  if (level <= 5) return 'copper';
  if (level <= 10) return 'bronze';
  if (level <= 15) return 'iron';
  if (level <= 20) return 'silver';
  if (level <= 25) return 'gold';
  if (level <= 35) return 'master';
  if (level <= 45) return 'legendary';
  if (level <= 55) return 'mythic';
  if (level <= 70) return 'supreme_being';
  return 'goat';
}

/**
 * Get level tier name.
 */
export function selectLevelTierName(profile: GamificationProfile): string {
  const level = profile.currentLevel;
  if (level <= 5) return 'Novice';
  if (level <= 10) return 'Apprentice';
  if (level <= 15) return 'Adept';
  if (level <= 20) return 'Expert';
  if (level <= 30) return 'Master';
  return 'Grandmaster';
}
