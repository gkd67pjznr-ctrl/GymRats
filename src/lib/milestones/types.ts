/**
 * Forge Milestones - Non-repeatable lifetime achievements with tiered rarity
 * Prestige markers that show long-term dedication.
 */

/**
 * Milestone rarity tiers with visual treatment levels
 */
export type MilestoneRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Milestone condition types for checking completion
 */
export type MilestoneConditionType =
  | 'workouts'         // Total workouts completed
  | 'streak'           // Consecutive day streak
  | 'prs'              // Total PRs achieved
  | 'pr_streak'        // Consecutive workouts with PRs
  | 'prs_in_workout'   // Max PRs achieved in single workout
  | 'pr_types'         // All 3 PR types achieved (weight, rep, e1rm)
  | 'rank'             // Exercise rank achieved
  | 'level'            // User level reached
  | 'sets'             // Total sets logged
  | 'club'             // Weight club (e.g., 1000lb club)
  | 'exercises_ranked' // Number of exercises ranked
  | 'exercises_logged' // Number of different exercises logged
  | 'workout_shared';  // First workout shared to feed

/**
 * Condition for milestone completion
 */
export interface MilestoneCondition {
  /** Type of condition to check */
  type: MilestoneConditionType;
  /** Threshold value to reach */
  threshold: number;
  /** Optional exercise ID for exercise-specific milestones */
  exerciseId?: string;
  /** For rank conditions: minimum rank tier required */
  minRankTier?: number;
  /** For club conditions: total of multiple exercises */
  clubExercises?: string[];
}

/**
 * A single milestone definition
 */
export interface ForgeMilestone {
  /** Unique milestone ID */
  id: string;
  /** Display name */
  name: string;
  /** Description of what it represents */
  description: string;
  /** Rarity tier for visual treatment */
  rarity: MilestoneRarity;
  /** Icon/emoji for display */
  icon: string;
  /** Condition to check for completion */
  condition: MilestoneCondition;
  /** Forge Tokens awarded (if any) */
  tokens?: number;
}

/**
 * User's earned milestone record
 */
export interface EarnedMilestone {
  /** Milestone ID that was earned */
  milestoneId: string;
  /** User ID who earned it */
  userId: string;
  /** Timestamp when earned (ms) */
  earnedAt: number;
}

/**
 * Milestone earned celebration data
 */
export interface MilestoneCelebration {
  /** The milestone that was earned */
  milestone: ForgeMilestone;
  /** Whether this is a new milestone (just earned) */
  isNew: boolean;
  /** Timestamp when earned */
  earnedAt: number;
}

/**
 * User stats for milestone checking
 */
export interface MilestoneUserStats {
  /** Total workouts completed */
  totalWorkouts: number;
  /** Current streak (days) */
  currentStreak: number;
  /** Longest streak (days) */
  longestStreak: number;
  /** Total PRs achieved */
  totalPRs: number;
  /** Current PR streak (consecutive workouts with PRs) */
  prStreak: number;
  /** Longest PR streak ever achieved */
  longestPRStreak: number;
  /** Max PRs achieved in a single workout */
  maxPRsInWorkout: number;
  /** Whether user has achieved all 3 PR types (weight, rep, e1rm) */
  hasAllPRTypes: boolean;
  /** Current level */
  currentLevel: number;
  /** Total sets logged */
  totalSets: number;
  /** Number of different exercises logged */
  exercisesLogged: number;
  /** Number of exercises ranked (at any tier) */
  exercisesRanked: number;
  /** Exercise ID -> highest rank tier achieved */
  exerciseRanks: Record<string, number>;
  /** Total weight for each exercise (for clubs) */
  exerciseMaxWeights: Record<string, number>;
  /** Whether user has shared a workout to feed */
  hasSharedWorkout: boolean;
}

/**
 * Milestone with progress info for UI display
 */
export interface MilestoneWithProgress extends ForgeMilestone {
  /** Whether milestone is earned */
  isEarned: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current value toward threshold */
  currentValue: number;
  /** Timestamp when earned (if earned) */
  earnedAt?: number;
}
