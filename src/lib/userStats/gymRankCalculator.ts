// src/lib/userStats/gymRankCalculator.ts
// Forge Rank calculation - composite score combining strength, consistency, progress, and variety

import type {
  GymRank,
  RankTier,
  ConsistencyMetrics,
  VarietyMetrics,
  ExerciseStats,
} from "./types";

/**
 * Component weights for Forge Rank calculation
 * Total must equal 1.0
 */
const WEIGHTS = {
  strength: 0.4, // 40% - Average exercise rank
  consistency: 0.3, // 30% - Workouts/week + streak
  progress: 0.2, // 20% - Volume trajectory
  variety: 0.1, // 10% - Muscle balance + exercise diversity
};

/**
 * Tier thresholds (score ranges)
 * Score 0-1000 maps to Rank 1-20 and these tiers
 */
const TIER_THRESHOLDS: { tier: RankTier; minScore: number; maxRank: number }[] = [
  { tier: "iron", minScore: 0, maxRank: 3 },
  { tier: "bronze", minScore: 150, maxRank: 6 },
  { tier: "silver", minScore: 300, maxRank: 9 },
  { tier: "gold", minScore: 450, maxRank: 12 },
  { tier: "platinum", minScore: 600, maxRank: 15 },
  { tier: "diamond", minScore: 750, maxRank: 18 },
  { tier: "mythic", minScore: 900, maxRank: 20 },
];

/**
 * Input for calculating Forge Rank
 */
export interface GymRankInput {
  /** Per-exercise stats (used for strength component) */
  exerciseStats: Record<string, ExerciseStats>;
  /** Consistency metrics */
  consistency: ConsistencyMetrics;
  /** Variety metrics */
  variety: VarietyMetrics;
  /** Total volume for progress calculation */
  totalVolumeKg: number;
  /** Volume from last 30 days for progress trajectory */
  recentVolumeKg?: number;
  /** Volume from 30-60 days ago for comparison */
  previousVolumeKg?: number;
}

/**
 * Calculate the strength component (0-1000)
 * Based on average exercise rank across all exercises
 */
function calculateStrengthComponent(exerciseStats: Record<string, ExerciseStats>): number {
  const stats = Object.values(exerciseStats);
  if (stats.length === 0) return 0;

  // Average rank (1-20) converted to 0-1000 scale
  const avgRank = stats.reduce((sum, s) => sum + s.rank, 0) / stats.length;

  // Rank 1 = 0, Rank 20 = 1000 (linear)
  return ((avgRank - 1) / 19) * 1000;
}

/**
 * Calculate the consistency component (0-1000)
 * Based on workouts per week and streak
 */
function calculateConsistencyComponent(consistency: ConsistencyMetrics): number {
  // Target: 4+ workouts/week is "perfect" consistency
  const workoutsScore = Math.min(1, consistency.workoutsPerWeek / 4);

  // Streak bonus: max bonus at 30+ day streak
  const streakBonus = Math.min(1, consistency.currentStreak / 30) * 0.3;

  // Recent activity: workouts in last 14 days (target: 8+)
  const recentActivityScore = Math.min(1, consistency.workoutsLast14Days / 8);

  // Combine: 50% workouts/week, 30% streak, 20% recent activity
  const combined = workoutsScore * 0.5 + streakBonus + recentActivityScore * 0.2;

  return combined * 1000;
}

/**
 * Calculate the progress component (0-1000)
 * Based on volume trajectory (are you progressing?)
 */
function calculateProgressComponent(
  totalVolumeKg: number,
  recentVolumeKg?: number,
  previousVolumeKg?: number
): number {
  // Base score from total volume (logarithmic scale)
  // 10,000 kg = 250, 100,000 kg = 500, 1,000,000 kg = 750
  const volumeScore = totalVolumeKg > 0
    ? Math.min(750, Math.log10(totalVolumeKg) * 150)
    : 0;

  // Trajectory bonus: if recent > previous, add bonus
  let trajectoryBonus = 0;
  if (recentVolumeKg !== undefined && previousVolumeKg !== undefined && previousVolumeKg > 0) {
    const growthRate = (recentVolumeKg - previousVolumeKg) / previousVolumeKg;
    // 20% growth = max bonus (250 points)
    trajectoryBonus = Math.max(0, Math.min(250, growthRate * 1250));
  }

  return Math.min(1000, volumeScore + trajectoryBonus);
}

/**
 * Calculate the variety component (0-1000)
 * Based on muscle balance and exercise diversity
 */
function calculateVarietyComponent(variety: VarietyMetrics): number {
  // Diversity: unique exercises (target: 15+ for max score)
  const diversityScore = Math.min(1, variety.uniqueExercises / 15);

  // Muscle coverage: number of muscle groups trained (17 total possible)
  const coverageScore = Math.min(1, variety.musclesCovered.length / 12);

  // Balance score is already 0-1
  const balanceScore = variety.balanceScore;

  // Combine: 40% diversity, 30% coverage, 30% balance
  const combined = diversityScore * 0.4 + coverageScore * 0.3 + balanceScore * 0.3;

  return combined * 1000;
}

/**
 * Main function to calculate Forge Rank
 */
export function calculateGymRank(input: GymRankInput): GymRank {
  const now = Date.now();

  // Calculate individual components (each 0-1000)
  const strengthScore = calculateStrengthComponent(input.exerciseStats);
  const consistencyScore = calculateConsistencyComponent(input.consistency);
  const progressScore = calculateProgressComponent(
    input.totalVolumeKg,
    input.recentVolumeKg,
    input.previousVolumeKg
  );
  const varietyScore = calculateVarietyComponent(input.variety);

  // Calculate weighted total (0-1000)
  const totalScore = Math.round(
    strengthScore * WEIGHTS.strength +
    consistencyScore * WEIGHTS.consistency +
    progressScore * WEIGHTS.progress +
    varietyScore * WEIGHTS.variety
  );

  // Convert to rank and tier
  const { rank, tier, progressToNext } = scoreToTierAndRank(totalScore);

  return {
    score: totalScore,
    rank,
    tier,
    progressToNext,
    components: {
      strength: Math.round(strengthScore),
      consistency: Math.round(consistencyScore),
      progress: Math.round(progressScore),
      variety: Math.round(varietyScore),
    },
    lastCalculatedMs: now,
  };
}

/**
 * Convert a score (0-1000) to tier, rank, and progress
 */
export function scoreToTierAndRank(score: number): {
  rank: number;
  tier: RankTier;
  progressToNext: number;
} {
  // Clamp score to valid range
  const clampedScore = Math.max(0, Math.min(1000, score));

  // Linear mapping: score 0 = rank 1, score 1000 = rank 20
  const exactRank = 1 + (clampedScore / 1000) * 19;
  const rank = Math.min(20, Math.max(1, Math.floor(exactRank)));

  // Progress to next rank
  const progressToNext = rank >= 20 ? 1 : exactRank - rank;

  // Get tier from rank
  const tier = getTierFromRank(rank);

  return { rank, tier, progressToNext };
}

/**
 * Get tier name from rank number (1-20)
 */
export function getTierFromRank(rank: number): RankTier {
  if (rank <= 3) return "iron";
  if (rank <= 6) return "bronze";
  if (rank <= 9) return "silver";
  if (rank <= 12) return "gold";
  if (rank <= 15) return "platinum";
  if (rank <= 18) return "diamond";
  return "mythic";
}

/**
 * Get tier color for display
 */
export function getTierColor(tier: RankTier): string {
  const colors: Record<RankTier, string> = {
    iron: "#8B8B8B",
    bronze: "#CD7F32",
    silver: "#C0C0C0",
    gold: "#FFD700",
    platinum: "#E5E4E2",
    diamond: "#B9F2FF",
    mythic: "#FF00FF",
  };
  return colors[tier];
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: RankTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}
