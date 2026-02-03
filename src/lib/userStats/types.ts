// src/lib/userStats/types.ts
// Type definitions for the unified user statistics system

import type { MuscleGroup } from "../../data/exerciseTypes";

/**
 * Statistics for a single exercise
 */
export interface ExerciseStats {
  exerciseId: string;
  /** Best estimated 1-rep max in kg */
  bestE1RMKg: number;
  /** Best weight lifted in kg */
  bestWeightKg: number;
  /** Best reps at each weight bucket (kg string key) */
  bestRepsAtWeight: Record<string, number>;
  /** Current rank (1-20) */
  rank: number;
  /** Progress towards next rank (0-1) */
  progressToNext: number;
  /** Total volume for this exercise (kg) */
  totalVolumeKg: number;
  /** Total sets for this exercise */
  totalSets: number;
  /** Last updated timestamp */
  lastUpdatedMs: number;
}

/**
 * Lifetime aggregate statistics
 */
export interface LifetimeStats {
  /** Total volume lifted (kg) */
  totalVolumeKg: number;
  /** Total sets completed */
  totalSets: number;
  /** Total workouts completed */
  totalWorkouts: number;
  /** Total PRs achieved */
  totalPRs: number;
  /** Weight PRs achieved */
  weightPRs: number;
  /** Rep PRs achieved */
  repPRs: number;
  /** e1RM PRs achieved */
  e1rmPRs: number;
  /** First workout timestamp */
  firstWorkoutMs: number | null;
  /** Last workout timestamp */
  lastWorkoutMs: number | null;
}

/**
 * Consistency metrics for tracking workout frequency
 */
export interface ConsistencyMetrics {
  /** Average workouts per week (last 4 weeks) */
  workoutsPerWeek: number;
  /** Current streak (days) */
  currentStreak: number;
  /** Longest streak ever */
  longestStreak: number;
  /** Workouts in the last 7 days */
  workoutsLast7Days: number;
  /** Workouts in the last 14 days */
  workoutsLast14Days: number;
  /** Workouts in the last 30 days */
  workoutsLast30Days: number;
}

/**
 * Variety metrics for tracking exercise diversity
 */
export interface VarietyMetrics {
  /** Number of unique exercises performed */
  uniqueExercises: number;
  /** Muscle groups coverage (which muscles have been trained) */
  musclesCovered: MuscleGroup[];
  /** Balance score (0-1): how evenly muscles are trained */
  balanceScore: number;
  /** Volume per muscle group */
  volumeByMuscle: Record<MuscleGroup, number>;
}

/**
 * Rank tier names (7 tiers)
 */
export type RankTier =
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "mythic";

/**
 * Forge Rank - composite score combining all aspects
 */
export interface ForgeRank {
  /** Total score (0-1000) */
  score: number;
  /** Rank number (1-20) */
  rank: number;
  /** Rank tier name */
  tier: RankTier;
  /** Progress to next rank (0-1) */
  progressToNext: number;
  /** Component breakdown */
  components: {
    /** Strength component (40% weight) - average exercise rank */
    strength: number;
    /** Consistency component (30% weight) - workouts/week + streak */
    consistency: number;
    /** Progress component (20% weight) - volume trajectory */
    progress: number;
    /** Variety component (10% weight) - muscle balance + diversity */
    variety: number;
  };
  /** Last calculated timestamp */
  lastCalculatedMs: number;
}

/**
 * Derived avatar growth data (not stored, calculated from stats)
 */
export interface DerivedAvatarGrowth {
  /** Growth stage (1-20) */
  stage: number;
  /** Height scale (0.3-1.0) */
  heightScale: number;
  /** Total volume for display */
  volumeTotal: number;
  /** Total sets for display */
  setsTotal: number;
  /** Average rank for display */
  avgRank: number;
  /** Whether a milestone was reached */
  milestoneReached: boolean;
  /** Previous stage (for milestone detection) */
  previousStage?: number;
}

/**
 * Result from processing a workout
 */
export interface ProcessWorkoutResult {
  /** PRs detected in this workout */
  prs: {
    type: "weight" | "rep" | "e1rm";
    exerciseId: string;
    exerciseName: string;
    value: number;
    previousValue?: number;
  }[];
  /** Rank ups achieved */
  rankUps: {
    exerciseId: string;
    exerciseName: string;
    oldRank: number;
    newRank: number;
    tier: RankTier;
  }[];
  /** Updated Forge Rank */
  forgeRank: ForgeRank;
  /** Avatar growth information */
  avatarGrowth: DerivedAvatarGrowth;
  /** Volume added in this workout */
  volumeAddedKg: number;
  /** Sets added in this workout */
  setsAdded: number;
}

/**
 * Complete state shape for the UserStatsStore
 */
export interface UserStatsState {
  /** Lifetime aggregate stats */
  lifetimeStats: LifetimeStats;
  /** Per-exercise statistics */
  exerciseStats: Record<string, ExerciseStats>;
  /** Volume accumulated by muscle group */
  volumeByMuscle: Partial<Record<MuscleGroup, number>>;
  /** Consistency metrics */
  consistency: ConsistencyMetrics;
  /** Variety metrics */
  variety: VarietyMetrics;
  /** Composite Forge Rank */
  forgeRank: ForgeRank;
  /** Store version for migrations */
  version: number;
  /** Last synced to backend timestamp */
  lastSyncedMs: number | null;
  /** Hydration state */
  hydrated: boolean;
}

/**
 * Default values for initializing state
 */
export const DEFAULT_LIFETIME_STATS: LifetimeStats = {
  totalVolumeKg: 0,
  totalSets: 0,
  totalWorkouts: 0,
  totalPRs: 0,
  weightPRs: 0,
  repPRs: 0,
  e1rmPRs: 0,
  firstWorkoutMs: null,
  lastWorkoutMs: null,
};

export const DEFAULT_CONSISTENCY_METRICS: ConsistencyMetrics = {
  workoutsPerWeek: 0,
  currentStreak: 0,
  longestStreak: 0,
  workoutsLast7Days: 0,
  workoutsLast14Days: 0,
  workoutsLast30Days: 0,
};

export const DEFAULT_VARIETY_METRICS: VarietyMetrics = {
  uniqueExercises: 0,
  musclesCovered: [],
  balanceScore: 0,
  volumeByMuscle: {} as Record<MuscleGroup, number>,
};

export const DEFAULT_FORGE_RANK: ForgeRank = {
  score: 0,
  rank: 1,
  tier: "iron",
  progressToNext: 0,
  components: {
    strength: 0,
    consistency: 0,
    progress: 0,
    variety: 0,
  },
  lastCalculatedMs: 0,
};

export const DEFAULT_USER_STATS_STATE: UserStatsState = {
  lifetimeStats: DEFAULT_LIFETIME_STATS,
  exerciseStats: {},
  volumeByMuscle: {},
  consistency: DEFAULT_CONSISTENCY_METRICS,
  variety: DEFAULT_VARIETY_METRICS,
  forgeRank: DEFAULT_FORGE_RANK,
  version: 1,
  lastSyncedMs: null,
  hydrated: false,
};
