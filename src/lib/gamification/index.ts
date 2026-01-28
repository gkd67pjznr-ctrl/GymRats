/**
 * Gamification system main exports.
 *
 * Provides XP, leveling, streaks, currency, and celebrations
 * for the Forgerank workout tracking app.
 */

// ========== Types ==========
export type {
  GamificationProfile,
  LevelUpCelebration,
  LevelUpContent,
  Milestone,
  MilestoneId,
  StreakResult,
  TokenReward,
  CurrencyRewardType,
  WorkoutCalendarEntry,
  WorkoutForCalculation,
  WorkoutXPBreakdown,
  GamificationStats,
} from './types';

export { DEFAULT_GAMIFICATION_PROFILE } from './types';

// ========== XP & Leveling ==========
export {
  getThresholdForLevel,
  getLevelFromXP,
  getLevelProgress,
  getLevelUpReward,
  getLevelTierName,
  getLevelTierColor,
  LEVEL_THRESHOLDS,
} from './xp/levels';

export {
  calculateWorkoutXP,
  calculateSetXP,
  calculateProjectedXP,
  getMinimumWorkoutXP,
  getBonusMultiplier,
} from './xp/calculator';

// ========== Streak ==========
export {
  getTodayISO,
  daysBetween,
  isWithinStreakThreshold,
  updateStreak,
  updateWorkoutCalendar,
  getWorkoutIntensity,
  checkStreakMilestone,
  getAllStreakMilestones,
  recalculateStreakFromCalendar,
  getStreakBreakDate,
  getDaysRemainingInStreak,
} from './streak/tracker';

// ========== Currency ==========
export {
  calculatePRReward,
  calculateLevelUpReward,
  calculateRankUpReward,
  calculateStreakReward,
  getWorkoutCompletionReward,
  calculateWorkoutTokenRewards,
  canAfford,
  spendTokens,
  getRewardTypeName,
  calculatePRTierFromProgression,
  formatTokenAmount,
  getRewardEmoji,
} from './currency/manager';

export {
  MILESTONES,
  getMilestone,
  getMilestonesByType,
  getNextMilestone,
  isMilestoneComplete,
  getCompletedMilestones,
  getNewMilestones,
  calculateMilestoneTokens,
} from './currency/milestones';

// ========== Level Up Celebrations ==========
export {
  createLevelUpCelebration,
  shouldShowLevelUpCelebration,
  calculateLevelsGained,
  getLevelTierName as getLevelUpTierName,
  getLevelTierColor as getLevelUpTierColor,
} from './levelUp/celebration';

export {
  getLevelUpContent,
  getAllCelebrationContent,
} from './levelUp/content';

// ========== Selectors ==========
export {
  selectLevelProgress,
  selectXPProgressPercent,
  selectCurrentLevel,
  selectTotalXP,
  selectCurrentStreak,
  selectLongestStreak,
  selectTokenBalance,
  selectStreakDaysRemaining,
  selectWorkoutCalendar,
  selectCompletedMilestonesCount,
  selectGamificationStats,
  selectHasPendingLevelUp,
  selectNextLevelThreshold,
  selectXPIntoCurrentLevel,
  selectIsMilestoneCompleted,
  selectTokenEfficiency,
  selectLevelTierColor,
  selectLevelTierName,
} from './levelUp/selector';
