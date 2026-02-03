// src/lib/userStats/statsCalculators.ts
// Helper functions for calculating user statistics

import type { WorkoutSession, WorkoutSet } from "../workoutModel";
import type { ExerciseStats, VarietyMetrics } from "./types";
import type { MuscleGroup } from "../../data/exerciseTypes";
import { estimate1RM_Epley } from "../e1rm";
import { buildRankThresholdsKg, getRankFromE1RMKg } from "../ranks";
import { getVerifiedTop } from "../../data/rankTops";
import { getExerciseById } from "../../data/exerciseDatabase";

/**
 * Weight bucket size for rep PRs (in kg)
 */
const WEIGHT_BUCKET_SIZE = 2.5;

/**
 * Create a weight bucket key from kg
 */
function weightBucketKey(weightKg: number): string {
  const bucket = Math.round(weightKg / WEIGHT_BUCKET_SIZE) * WEIGHT_BUCKET_SIZE;
  return bucket.toFixed(1);
}

/**
 * Group sets by exercise ID
 */
export function groupSetsByExercise(sets: WorkoutSet[]): Record<string, WorkoutSet[]> {
  const grouped: Record<string, WorkoutSet[]> = {};

  for (const set of sets) {
    if (!grouped[set.exerciseId]) {
      grouped[set.exerciseId] = [];
    }
    grouped[set.exerciseId].push(set);
  }

  return grouped;
}

/**
 * Detected PRs from a set
 */
export interface DetectedPRs {
  weightPR: boolean;
  repPR: boolean;
  e1rmPR: boolean;
  newBestWeight?: number;
  newBestReps?: number;
  newBestE1RM?: number;
  previousBestWeight?: number;
  previousBestReps?: number;
  previousBestE1RM?: number;
}

/**
 * Update exercise stats with new sets and return detected PRs
 *
 * @param existing - Existing stats for this exercise (or undefined)
 * @param exerciseId - Exercise ID
 * @param sets - New sets to process
 * @returns Updated stats and detected PRs
 */
export function updateExerciseStats(
  existing: ExerciseStats | undefined,
  exerciseId: string,
  sets: WorkoutSet[]
): { stats: ExerciseStats; prs: DetectedPRs[] } {
  const now = Date.now();

  // Initialize stats if not existing
  const stats: ExerciseStats = existing ? { ...existing } : {
    exerciseId,
    bestE1RMKg: 0,
    bestWeightKg: 0,
    bestRepsAtWeight: {},
    rank: 1,
    progressToNext: 0,
    totalVolumeKg: 0,
    totalSets: 0,
    lastUpdatedMs: now,
  };

  // Deep copy bestRepsAtWeight
  stats.bestRepsAtWeight = { ...stats.bestRepsAtWeight };

  const detectedPRs: DetectedPRs[] = [];

  for (const set of sets) {
    const { weightKg, reps } = set;

    // Calculate e1RM for this set
    const e1rm = estimate1RM_Epley(weightKg, reps);

    // Calculate volume for this set
    const volume = weightKg * reps;

    // Track PRs
    const prs: DetectedPRs = {
      weightPR: false,
      repPR: false,
      e1rmPR: false,
    };

    // Check weight PR
    if (weightKg > stats.bestWeightKg) {
      prs.weightPR = true;
      prs.previousBestWeight = stats.bestWeightKg;
      prs.newBestWeight = weightKg;
      stats.bestWeightKg = weightKg;
    }

    // Check rep PR at this weight bucket
    const bucketKey = weightBucketKey(weightKg);
    const prevBestReps = stats.bestRepsAtWeight[bucketKey] || 0;
    if (reps > prevBestReps) {
      prs.repPR = true;
      prs.previousBestReps = prevBestReps;
      prs.newBestReps = reps;
      stats.bestRepsAtWeight[bucketKey] = reps;
    }

    // Check e1RM PR
    if (e1rm > stats.bestE1RMKg) {
      prs.e1rmPR = true;
      prs.previousBestE1RM = stats.bestE1RMKg;
      prs.newBestE1RM = e1rm;
      stats.bestE1RMKg = e1rm;
    }

    // Update totals
    stats.totalVolumeKg += volume;
    stats.totalSets += 1;

    // Only record if at least one PR
    if (prs.weightPR || prs.repPR || prs.e1rmPR) {
      detectedPRs.push(prs);
    }
  }

  // Calculate rank from best e1RM
  const verifiedTop = getVerifiedTop(exerciseId);
  if (verifiedTop && stats.bestE1RMKg > 0) {
    const thresholds = buildRankThresholdsKg(verifiedTop.topE1RMKg);
    const { rankIndex, progressToNext } = getRankFromE1RMKg(stats.bestE1RMKg, thresholds);
    stats.rank = rankIndex + 1; // rankIndex is 0-based
    stats.progressToNext = progressToNext;
  }

  stats.lastUpdatedMs = now;

  return { stats, prs: detectedPRs };
}

/**
 * Update volume by muscle group
 *
 * @param existing - Existing volume map
 * @param sets - Sets to process
 * @returns Updated volume map
 */
export function updateVolumeByMuscle(
  existing: Partial<Record<MuscleGroup, number>>,
  sets: WorkoutSet[]
): Partial<Record<MuscleGroup, number>> {
  const volumeByMuscle = { ...existing };

  for (const set of sets) {
    const exercise = getExerciseById(set.exerciseId);
    if (!exercise) continue;

    const volume = set.weightKg * set.reps;

    // Primary muscles get full volume credit
    for (const muscle of exercise.primaryMuscles) {
      volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + volume;
    }

    // Secondary muscles get 50% volume credit
    for (const muscle of exercise.secondaryMuscles) {
      volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + volume * 0.5;
    }
  }

  return volumeByMuscle;
}

/**
 * All muscle groups for balance calculation
 */
const ALL_MAJOR_MUSCLES: MuscleGroup[] = [
  "chest",
  "lats",
  "shoulders",
  "biceps",
  "triceps",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "abdominals",
  "lower back",
];

/**
 * Calculate variety metrics from exercise stats and volume
 *
 * @param exerciseStats - Per-exercise statistics
 * @param volumeByMuscle - Volume per muscle group
 * @returns Variety metrics
 */
export function calculateVariety(
  exerciseStats: Record<string, ExerciseStats>,
  volumeByMuscle: Partial<Record<MuscleGroup, number>>
): VarietyMetrics {
  // Count unique exercises
  const uniqueExercises = Object.keys(exerciseStats).length;

  // Get covered muscles
  const musclesCovered = Object.keys(volumeByMuscle).filter(
    (muscle) => (volumeByMuscle[muscle as MuscleGroup] || 0) > 0
  ) as MuscleGroup[];

  // Calculate balance score
  const balanceScore = calculateMuscleBalance(volumeByMuscle);

  return {
    uniqueExercises,
    musclesCovered,
    balanceScore,
    volumeByMuscle: volumeByMuscle as Record<MuscleGroup, number>,
  };
}

/**
 * Calculate muscle balance score (0-1)
 * Higher score = more even distribution of volume across muscle groups
 */
function calculateMuscleBalance(volumeByMuscle: Partial<Record<MuscleGroup, number>>): number {
  // Get volumes for major muscles
  const volumes = ALL_MAJOR_MUSCLES.map((m) => volumeByMuscle[m] || 0);

  // If no volume at all, return 0
  const totalVolume = volumes.reduce((a, b) => a + b, 0);
  if (totalVolume === 0) return 0;

  // Calculate ideal volume per muscle (even distribution)
  const idealVolume = totalVolume / ALL_MAJOR_MUSCLES.length;

  // Calculate variance from ideal
  const variance = volumes.reduce((sum, v) => {
    const diff = v - idealVolume;
    return sum + diff * diff;
  }, 0);

  // Normalize variance to 0-1 score (lower variance = higher score)
  const maxVariance = idealVolume * idealVolume * ALL_MAJOR_MUSCLES.length;
  const normalizedVariance = variance / maxVariance;

  // Convert to score (1 = perfectly balanced, 0 = completely unbalanced)
  return Math.max(0, 1 - normalizedVariance);
}

/**
 * Calculate average rank from exercise stats
 */
export function calculateAverageRank(exerciseStats: Record<string, ExerciseStats>): number {
  const stats = Object.values(exerciseStats);
  if (stats.length === 0) return 0;

  return stats.reduce((sum, s) => sum + s.rank, 0) / stats.length;
}

/**
 * Get volume from a specific time period
 *
 * @param sessions - Workout sessions
 * @param fromMs - Start timestamp (inclusive)
 * @param toMs - End timestamp (exclusive)
 * @returns Total volume in kg
 */
export function getVolumeInPeriod(
  sessions: WorkoutSession[],
  fromMs: number,
  toMs: number
): number {
  return sessions
    .filter((s) => s.startedAtMs >= fromMs && s.startedAtMs < toMs)
    .reduce((total, session) => {
      return total + session.sets.reduce((sum, set) => sum + set.weightKg * set.reps, 0);
    }, 0);
}

/**
 * Calculate consistency metrics from workout sessions
 *
 * @param sessions - All workout sessions
 * @param currentStreak - Current streak from gamification store
 * @param longestStreak - Longest streak from gamification store
 * @returns Consistency metrics
 */
export function calculateConsistencyFromSessions(
  sessions: WorkoutSession[],
  currentStreak: number,
  longestStreak: number
): {
  workoutsPerWeek: number;
  workoutsLast7Days: number;
  workoutsLast14Days: number;
  workoutsLast30Days: number;
} {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * oneDay;
  const fourteenDaysAgo = now - 14 * oneDay;
  const thirtyDaysAgo = now - 30 * oneDay;
  const fourWeeksAgo = now - 28 * oneDay;

  const workoutsLast7Days = sessions.filter((s) => s.startedAtMs >= sevenDaysAgo).length;
  const workoutsLast14Days = sessions.filter((s) => s.startedAtMs >= fourteenDaysAgo).length;
  const workoutsLast30Days = sessions.filter((s) => s.startedAtMs >= thirtyDaysAgo).length;

  // Calculate workouts per week over last 4 weeks
  const workoutsLast4Weeks = sessions.filter((s) => s.startedAtMs >= fourWeeksAgo).length;
  const workoutsPerWeek = workoutsLast4Weeks / 4;

  return {
    workoutsPerWeek,
    workoutsLast7Days,
    workoutsLast14Days,
    workoutsLast30Days,
  };
}
