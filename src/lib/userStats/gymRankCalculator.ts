// src/lib/userStats/gymRankCalculator.ts
// Forge Rank calculation - composite score combining strength, consistency, progress, and variety

import type {
  GymRank,
  RankTier,
  RankLevel,
  ConsistencyMetrics,
  VarietyMetrics,
  ExerciseStats,
} from "./types";
import { getRankDisplayName, RANK_TIER_DISPLAY } from "./types";

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
 * Score 0-1000 maps to Rank 1-28 and these tiers
 * Each tier has 3 levels (I, II, III) except G.O.A.T which has 1
 *
 * Tiers (10 total, 28 ranks):
 * - Copper I-III (ranks 1-3): 0-179
 * - Bronze I-III (ranks 4-6): 180-359
 * - Iron I-III (ranks 7-9): 360-539
 * - Silver I-III (ranks 10-12): 540-719
 * - Gold I-III (ranks 13-15): 720-899
 * - Master I-III (ranks 16-18): 900-979
 * - Legendary I-III (ranks 19-21): 980-997
 * - Mythic I-III (ranks 22-24): 997-999.5
 * - Supreme Being I-III (ranks 25-27): 999.5-999.99
 * - G.O.A.T (rank 28): 999.99+
 */
const TIER_THRESHOLDS: { tier: RankTier; minScore: number; maxRank: number }[] = [
  { tier: "copper", minScore: 0, maxRank: 3 },
  { tier: "bronze", minScore: 180, maxRank: 6 },
  { tier: "iron", minScore: 360, maxRank: 9 },
  { tier: "silver", minScore: 540, maxRank: 12 },
  { tier: "gold", minScore: 720, maxRank: 15 },
  { tier: "master", minScore: 900, maxRank: 18 },
  { tier: "legendary", minScore: 980, maxRank: 21 },
  { tier: "mythic", minScore: 997, maxRank: 24 },
  { tier: "supreme_being", minScore: 999.5, maxRank: 27 },
  { tier: "goat", minScore: 999.99, maxRank: 28 },
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

  // Average rank (1-28) converted to 0-1000 scale
  const avgRank = stats.reduce((sum, s) => sum + s.rank, 0) / stats.length;

  // Rank 1 = 0, Rank 28 = 1000 (linear)
  return ((avgRank - 1) / 27) * 1000;
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
  level: RankLevel | null;
} {
  // Clamp score to valid range
  const clampedScore = Math.max(0, Math.min(1000, score));

  // Linear mapping: score 0 = rank 1, score 1000 = rank 28
  const exactRank = 1 + (clampedScore / 1000) * 27;
  const rank = Math.min(28, Math.max(1, Math.floor(exactRank)));

  // Progress to next rank
  const progressToNext = rank >= 28 ? 1 : exactRank - rank;

  // Get tier and level from rank
  const tier = getTierFromRank(rank);
  const level = getLevelFromRank(rank);

  return { rank, tier, progressToNext, level };
}

/**
 * Get tier name from rank number (1-28)
 */
export function getTierFromRank(rank: number): RankTier {
  if (rank <= 3) return "copper";
  if (rank <= 6) return "bronze";
  if (rank <= 9) return "iron";
  if (rank <= 12) return "silver";
  if (rank <= 15) return "gold";
  if (rank <= 18) return "master";
  if (rank <= 21) return "legendary";
  if (rank <= 24) return "mythic";
  if (rank <= 27) return "supreme_being";
  return "goat";
}

/**
 * Get level (I, II, III) from rank number (1-28)
 * Returns null for G.O.A.T (rank 28)
 */
export function getLevelFromRank(rank: number): RankLevel | null {
  if (rank >= 28) return null; // G.O.A.T has no level
  const positionInTier = ((rank - 1) % 3) + 1;
  return positionInTier as RankLevel;
}

/**
 * Get tier color for display
 */
export function getTierColor(tier: RankTier): string {
  const colors: Record<RankTier, string> = {
    copper: "#B87333",
    bronze: "#CD7F32",
    iron: "#6B6B6B",
    silver: "#C0C0C0",
    gold: "#FFD700",
    master: "#FFF8DC", // Bright white-gold
    legendary: "#9B30FF", // Royal purple
    mythic: "#00CED1", // Ethereal cyan
    supreme_being: "#FF4500", // Cosmic fire (placeholder)
    goat: "#FFFFFF", // Pure white (placeholder - may be rainbow/prismatic)
  };
  return colors[tier];
}

/**
 * Get tier display name (uses RANK_TIER_DISPLAY from types)
 */
export function getTierDisplayName(tier: RankTier): string {
  return RANK_TIER_DISPLAY[tier];
}

/**
 * Get full rank display name (e.g., "Gold II", "G.O.A.T")
 */
export function getFullRankDisplayName(rank: number): string {
  const tier = getTierFromRank(rank);
  const level = getLevelFromRank(rank);
  return getRankDisplayName(tier, level);
}
