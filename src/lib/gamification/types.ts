/**
 * Core type definitions for the gamification system.
 */

/**
 * A single day's workout entry for the contribution calendar.
 */
export interface WorkoutCalendarEntry {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Number of workouts completed on this day */
  count: number;
  /** Total XP earned on this day */
  xp: number;
}

/**
 * Milestone IDs for tracking completed achievements.
 * Format: 'milestone_{type}_{value}'
 */
export type MilestoneId =
  | `streak_${number}`
  | `total_workouts_${number}`
  | `total_xp_${number}`
  | `level_${number}`
  | 'first_pr'
  | 'ten_prs'
  | 'hundred_prs';

/**
 * The main gamification profile for a user.
 * Stored in AsyncStorage and synced to Supabase.
 */
export interface GamificationProfile {
  // ========== XP & Leveling ==========
  /** Total XP earned across all workouts */
  totalXP: number;
  /** Current user level (starts at 1) */
  currentLevel: number;
  /** XP needed to reach the next level */
  xpToNextLevel: number;
  /** Timestamp of the last level-up celebration shown */
  levelUpCelebrationShown?: number;

  // ========== Streak ==========
  /** Current consecutive workout streak (days) */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** ISO date string of the last workout (YYYY-MM-DD) */
  lastWorkoutDate?: string;
  /** Last 365 days of workout activity for contribution calendar */
  workoutCalendar: WorkoutCalendarEntry[];

  // ========== Currency ==========
  /** Current Forge Token balance */
  forgeTokens: number;
  /** Lifetime tokens earned */
  tokensEarnedTotal: number;
  /** Lifetime tokens spent */
  tokensSpentTotal: number;

  // ========== Milestones ==========
  /** IDs of completed milestones */
  milestonesCompleted: MilestoneId[];

  // ========== Sync ==========
  /** Last update timestamp (ms) for conflict resolution */
  updatedAt: number;
}

/**
 * Default profile for new users.
 */
export const DEFAULT_GAMIFICATION_PROFILE: GamificationProfile = {
  totalXP: 0,
  currentLevel: 1,
  xpToNextLevel: 100,
  currentStreak: 0,
  longestStreak: 0,
  workoutCalendar: [],
  forgeTokens: 0,
  tokensEarnedTotal: 0,
  tokensSpentTotal: 0,
  milestonesCompleted: [],
  updatedAt: Date.now(),
};

/**
 * Level-up celebration data shown in the modal.
 */
export interface LevelUpCelebration {
  /** The new level achieved */
  level: number;
  /** Previous level before level-up */
  previousLevel: number;
  /** Forge Tokens awarded for this level-up */
  tokensAwarded: number;
  /** Celebration content variant */
  content: LevelUpContent;
}

/**
 * Level up celebration message content.
 * Selected from 60 variations based on level tier.
 */
export interface LevelUpContent {
  /** Main headline text */
  headline: string;
  /** Subtitle/body text */
  subtitle: string;
  /** Motivational flavor text */
  flavorText: string;
}

/**
 * XP breakdown for a single workout.
 */
export interface WorkoutXPBreakdown {
  /** Total XP earned */
  total: number;
  /** Base XP: sets × 10 */
  base: number;
  /** Volume bonus: sqrt(weight × reps) × 2 */
  volume: number;
  /** Exercise variety bonus */
  exercise: number;
  /** Streak bonus */
  streak: number;
  /** Completion bonus (for 100% plan completion) */
  completion: number;
}

/**
 * Currency reward types.
 */
export type CurrencyRewardType =
  | 'pr_weight_tier1' // Weight PR (lower tier)
  | 'pr_weight_tier4' // Weight PR (higher tier)
  | 'pr_rep' // Rep PR
  | 'pr_e1rm' // e1RM PR
  | 'rank_up' // Rank advancement
  | 'level_up' // Level advancement
  | 'streak_7' // 7-day streak milestone
  | 'streak_30' // 30-day streak milestone
  | 'streak_100' // 100-day streak milestone
  | 'workout_complete' // Base workout completion
  | 'plan_complete' // 100% plan completion
  | 'milestone'; // General milestone completion

/**
 * Token reward calculation result.
 */
export interface TokenReward {
  /** Type of reward */
  type: CurrencyRewardType;
  /** Tokens awarded */
  amount: number;
  /** Optional context (e.g., rank name, milestone ID) */
  context?: string;
}

/**
 * Workout data for XP calculation.
 */
export interface WorkoutForCalculation {
  /** All sets logged in the workout */
  sets: {
    exerciseId: string;
    weightKg: number;
    reps: number;
  }[];
  /** Whether the workout was 100% completed (for planned workouts) */
  fullyCompleted?: boolean;
  /** Current streak at workout time */
  currentStreak: number;
}

/**
 * Streak calculation result.
 */
export interface StreakResult {
  /** New streak count */
  streak: number;
  /** Whether streak was broken and reset */
  wasReset: boolean;
  /** Whether streak is new personal best */
  isNewRecord: boolean;
  /** Previous streak (before update) */
  previousStreak: number;
}

/**
 * Level thresholds configuration.
 * XP required for each level (1-indexed).
 */
export type LevelThresholds = readonly number[];

/**
 * Milestone definition.
 */
export interface Milestone {
  /** Unique milestone ID */
  id: MilestoneId;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Token reward */
  tokens: number;
  /** Icon/name for display */
  icon: string;
}

/**
 * Gamification statistics for profile display.
 */
export interface GamificationStats {
  totalWorkouts: number;
  totalSets: number;
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  forgeTokens: number;
}
