// src/lib/userStats/index.ts
// Central export for user statistics module

// Types
export type {
  ExerciseStats,
  LifetimeStats,
  ConsistencyMetrics,
  VarietyMetrics,
  ForgeRank,
  RankTier,
  DerivedAvatarGrowth,
  ProcessWorkoutResult,
  UserStatsState,
} from "./types";

export {
  DEFAULT_LIFETIME_STATS,
  DEFAULT_CONSISTENCY_METRICS,
  DEFAULT_VARIETY_METRICS,
  DEFAULT_FORGE_RANK,
  DEFAULT_USER_STATS_STATE,
} from "./types";

// Forge Rank Calculator
export {
  calculateForgeRank,
  scoreToTierAndRank,
  getTierFromRank,
  getTierColor,
  getTierDisplayName,
  type ForgeRankInput,
} from "./forgeRankCalculator";

// Avatar Growth
export {
  deriveAvatarGrowth,
  isGrowthMilestone,
  getGrowthStageDescription,
  getGrowthStagePercentage,
  calculateWorkoutGrowthContribution,
} from "./deriveAvatarGrowth";

// Stats Calculators
export {
  updateExerciseStats,
  updateVolumeByMuscle,
  calculateVariety,
  groupSetsByExercise,
  calculateAverageRank,
  getVolumeInPeriod,
  calculateConsistencyFromSessions,
  type DetectedPRs,
} from "./statsCalculators";
