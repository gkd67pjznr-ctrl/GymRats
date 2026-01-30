/**
 * Profile Stats Utilities
 *
 * Calculates user stats from workout history including:
 * - Exercise ranks (based on e1RM)
 * - Personal Records (weight, rep, e1RM)
 * - Best lifts for key exercises
 */

import type { WorkoutSession, WorkoutSet } from '../workoutModel';
import { estimate1RM_Epley } from '../e1rm';
import { buildAllThresholds, getRankFromE1RMKg } from '../ranks';
import { RANK_TOPS } from '../../data/rankTops';
import type { VerifiedTop } from '../../data/rankTops';

// ============================================================================
// Types
// ============================================================================

export interface ExercisePR {
  exerciseId: string;
  bestWeightKg: number;
  bestWeightReps: number;
  bestE1RMKg: number;
  bestE1RMSet: WorkoutSet | null;
  lastUpdatedMs: number;
}

export interface ExerciseRank {
  exerciseId: string;
  rankIndex: number; // 0-19 (0 = Rank 1, 19 = Rank 20)
  rankNumber: number; // 1-20 (human readable)
  currentE1RMKg: number;
  progressToNext: number; // 0-1
  tier: RankTier;
}

export type RankTier = 'iron' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'mythic';

export interface ProfileStats {
  // PR counts
  totalWeightPRs: number;
  totalRepPRs: number;
  totalE1RMPRs: number;
  totalPRs: number;

  // Exercise stats
  exercisePRs: Record<string, ExercisePR>;
  exerciseRanks: Record<string, ExerciseRank>;

  // Totals
  totalSets: number;
  totalVolume: number; // kg * reps
}

// ============================================================================
// Rank Tier Calculation
// ============================================================================

function getRankTier(rankIndex: number, numRanks: number): RankTier {
  const normalized = rankIndex / (numRanks - 1); // 0-1

  if (normalized < 0.1) return 'iron';
  if (normalized < 0.25) return 'bronze';
  if (normalized < 0.4) return 'silver';
  if (normalized < 0.55) return 'gold';
  if (normalized < 0.7) return 'platinum';
  if (normalized < 0.85) return 'diamond';
  return 'mythic';
}

// ============================================================================
// Exercise PR Calculation
// ============================================================================

/**
 * Calculate best PRs for a single exercise from workout sets
 */
function calculateExercisePR(sets: WorkoutSet[]): ExercisePR {
  let bestWeightKg = 0;
  let bestWeightReps = 0;
  let bestE1RMKg = 0;
  let bestE1RMSet: WorkoutSet | null = null;
  let lastUpdatedMs = 0;

  for (const set of sets) {
    const e1rmKg = estimate1RM_Epley(set.weightKg, set.reps);

    // Track best weight
    if (set.weightKg > bestWeightKg) {
      bestWeightKg = set.weightKg;
      bestWeightReps = set.reps;
    }

    // Track best e1RM
    if (e1rmKg > bestE1RMKg) {
      bestE1RMKg = e1rmKg;
      bestE1RMSet = set;
    }

    // Track last updated
    if (set.timestampMs > lastUpdatedMs) {
      lastUpdatedMs = set.timestampMs;
    }
  }

  return {
    exerciseId: sets[0]?.exerciseId || '',
    bestWeightKg,
    bestWeightReps,
    bestE1RMKg,
    bestE1RMSet,
    lastUpdatedMs,
  };
}

// ============================================================================
// Exercise Rank Calculation
// ============================================================================

/**
 * Calculate rank for an exercise based on e1RM
 */
function calculateExerciseRank(
  exerciseId: string,
  e1rmKg: number,
  thresholds: Record<string, number[]>
): ExerciseRank | null {
  const exerciseThresholds = thresholds[exerciseId];

  if (!exerciseThresholds || exerciseThresholds.length === 0) {
    return null; // Exercise not in rank system
  }

  const { rankIndex, progressToNext } = getRankFromE1RMKg(e1rmKg, exerciseThresholds);
  const rankNumber = rankIndex + 1;
  const tier = getRankTier(rankIndex, exerciseThresholds.length);

  return {
    exerciseId,
    rankIndex,
    rankNumber,
    currentE1RMKg: e1rmKg,
    progressToNext,
    tier,
  };
}

// ============================================================================
// Main Profile Stats Calculation
// ============================================================================

/**
 * Calculate all profile stats from workout sessions
 */
export function calculateProfileStats(sessions: WorkoutSession[]): ProfileStats {
  // Initialize stats
  const stats: ProfileStats = {
    totalWeightPRs: 0,
    totalRepPRs: 0,
    totalE1RMPRs: 0,
    totalPRs: 0,
    exercisePRs: {},
    exerciseRanks: {},
    totalSets: 0,
    totalVolume: 0,
  };

  // Group sets by exercise
  const setsByExercise: Record<string, WorkoutSet[]> = {};

  // First pass: collect all sets by exercise and calculate totals
  for (const session of sessions) {
    for (const set of session.sets) {
      // Group by exercise
      if (!setsByExercise[set.exerciseId]) {
        setsByExercise[set.exerciseId] = [];
      }
      setsByExercise[set.exerciseId].push(set);

      // Count sets
      stats.totalSets++;

      // Count volume (kg * reps)
      stats.totalVolume += set.weightKg * set.reps;
    }
  }

  // Calculate PRs for each exercise
  for (const [exerciseId, sets] of Object.entries(setsByExercise)) {
    stats.exercisePRs[exerciseId] = calculateExercisePR(sets);
  }

  // Build rank thresholds
  const thresholds = buildAllThresholds(RANK_TOPS);

  // Calculate ranks for each exercise
  for (const [exerciseId, pr] of Object.entries(stats.exercisePRs)) {
    if (pr.bestE1RMKg > 0) {
      const rank = calculateExerciseRank(exerciseId, pr.bestE1RMKg, thresholds);
      if (rank) {
        stats.exerciseRanks[exerciseId] = rank;
      }
    }
  }

  // Count PRs (this is simplified - real PR counting would need historical tracking)
  // For now, we count unique exercises with any PR data
  stats.totalPRs = Object.keys(stats.exercisePRs).length;

  return stats;
}

/**
 * Get top N exercises by rank (highest rank index first)
 */
export function getTopExercisesByRank(
  stats: ProfileStats,
  limit: number = 5
): Array<{ exerciseId: string; rank: ExerciseRank; pr: ExercisePR }> {
  const entries = Object.entries(stats.exerciseRanks);

  // Sort by rank index (highest first), then by e1RM (highest first)
  entries.sort(([, a], [, b]) => {
    if (a.rankIndex !== b.rankIndex) {
      return b.rankIndex - a.rankIndex; // Higher rank first
    }
    return b.currentE1RMKg - a.currentE1RMKg; // Higher e1RM first
  });

  return entries
    .slice(0, limit)
    .map(([exerciseId, rank]) => ({
      exerciseId,
      rank,
      pr: stats.exercisePRs[exerciseId],
    }))
    .filter((item) => item.pr); // Filter out exercises without PR data
}

/**
 * Get exercise display name from ID
 */
export function getExerciseDisplayName(exerciseId: string): string {
  const names: Record<string, string> = {
    'bench': 'Bench Press',
    'squat': 'Squat',
    'deadlift': 'Deadlift',
    'ohp': 'Overhead Press',
    'row': 'Barbell Row',
    'pullup': 'Pull-Up',
    'incline_bench': 'Incline Bench',
    'rdl': 'Romanian Deadlift',
    'leg_press': 'Leg Press',
    'lat_pulldown': 'Lat Pulldown',
  };

  return names[exerciseId] || exerciseId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get rank tier color
 */
export function getRankTierColor(tier: RankTier): string {
  const colors: Record<RankTier, string> = {
    'iron': '#8B8B8B',
    'bronze': '#CD7F32',
    'silver': '#C0C0C0',
    'gold': '#FFD700',
    'platinum': '#E5E4E2',
    'diamond': '#B9F2FF',
    'mythic': '#FF6B9D',
  };

  return colors[tier];
}
