// src/lib/hooks/useExerciseRanks.ts
// Hook for computing exercise rank summaries from user stats

import { useMemo } from 'react';
import { useExerciseStats } from '../stores/userStatsStore';
import { useWorkoutSessions } from '../stores/workoutStore';
import { EXERCISES_V1 } from '../../data/exercises';
import type {
  ExerciseRankSummary,
  SparklineTimeframe,
  SparklineDataPoint,
  ExerciseRankSortOption,
} from '../types/rankTypes';
import type { RankTier } from '../userStats/types';

/**
 * Get tier name from rank number (1-28)
 */
function getTierFromRank(rank: number): RankTier {
  if (rank <= 3) return 'copper';
  if (rank <= 6) return 'bronze';
  if (rank <= 9) return 'iron';
  if (rank <= 12) return 'silver';
  if (rank <= 15) return 'gold';
  if (rank <= 18) return 'master';
  if (rank <= 21) return 'legendary';
  if (rank <= 24) return 'mythic';
  if (rank <= 27) return 'supreme_being';
  return 'goat';
}

/**
 * Get exercise display name from ID
 */
function getExerciseName(exerciseId: string): string {
  const exercise = EXERCISES_V1.find((e) => e.id === exerciseId);
  return exercise?.name ?? exerciseId;
}

/**
 * Get timeframe start timestamp
 */
function getTimeframeStart(timeframe: SparklineTimeframe): number {
  const now = Date.now();
  switch (timeframe) {
    case '30d':
      return now - 30 * 24 * 60 * 60 * 1000;
    case '90d':
      return now - 90 * 24 * 60 * 60 * 1000;
    case '1y':
      return now - 365 * 24 * 60 * 60 * 1000;
    case 'all':
    default:
      return 0;
  }
}

/**
 * Sort exercise summaries based on sort option
 */
function sortSummaries(
  summaries: ExerciseRankSummary[],
  sortOption: ExerciseRankSortOption
): ExerciseRankSummary[] {
  const sorted = [...summaries];

  switch (sortOption) {
    case 'rank':
      // Sort by rank descending (highest rank first)
      return sorted.sort((a, b) => b.currentRank - a.currentRank);
    case 'recent':
      // Sort by most recently logged
      return sorted.sort((a, b) => b.lastLoggedAt - a.lastLoggedAt);
    case 'alphabetical':
      // Sort by name A-Z
      return sorted.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
    case 'volume':
      // Sort by total volume descending
      return sorted.sort((a, b) => b.totalVolumeKg - a.totalVolumeKg);
    default:
      return sorted;
  }
}

/**
 * Hook to get all exercise rank summaries
 */
export function useExerciseRanks(sortOption: ExerciseRankSortOption = 'rank'): ExerciseRankSummary[] {
  const exerciseStats = useExerciseStats();

  return useMemo(() => {
    const summaries: ExerciseRankSummary[] = [];

    for (const [exerciseId, stats] of Object.entries(exerciseStats)) {
      // Find best weight and reps from bestRepsAtWeight
      let bestWeightKg = stats.bestWeightKg || 0;
      let bestReps = 1;

      // Look through bestRepsAtWeight to find actual best
      if (stats.bestRepsAtWeight) {
        for (const [weightStr, reps] of Object.entries(stats.bestRepsAtWeight)) {
          const weight = parseFloat(weightStr);
          if (weight === bestWeightKg && reps > bestReps) {
            bestReps = reps;
          }
        }
      }

      summaries.push({
        exerciseId,
        exerciseName: getExerciseName(exerciseId),
        currentRank: stats.rank || 1,
        currentTier: getTierFromRank(stats.rank || 1),
        progressToNextRank: stats.progressToNext || 0,
        bestWeightKg,
        bestReps,
        bestE1rm: stats.bestE1RMKg || 0,
        lastLoggedAt: stats.lastUpdatedMs || 0,
        totalSets: stats.totalSets || 0,
        totalVolumeKg: stats.totalVolumeKg || 0,
      });
    }

    return sortSummaries(summaries, sortOption);
  }, [exerciseStats, sortOption]);
}

/**
 * Hook to get sparkline data for a specific exercise
 */
export function useExerciseSparkline(
  exerciseId: string,
  timeframe: SparklineTimeframe = '90d'
): SparklineDataPoint[] {
  const sessions = useWorkoutSessions();

  return useMemo(() => {
    const startTime = getTimeframeStart(timeframe);
    const dataPoints: SparklineDataPoint[] = [];

    // Track running best e1RM to show progression
    let runningBestE1rm = 0;

    // Sort sessions by time ascending
    const sortedSessions = [...sessions]
      .filter((s) => s.startedAtMs >= startTime)
      .sort((a, b) => a.startedAtMs - b.startedAtMs);

    for (const session of sortedSessions) {
      // Find sets for this exercise
      const exerciseSets = session.sets.filter((s) => s.exerciseId === exerciseId);

      if (exerciseSets.length > 0) {
        // Calculate best e1RM from this session
        let sessionBestE1rm = 0;
        for (const set of exerciseSets) {
          const e1rm = set.weightKg * (1 + set.reps / 30);
          if (e1rm > sessionBestE1rm) {
            sessionBestE1rm = e1rm;
          }
        }

        // Update running best
        if (sessionBestE1rm > runningBestE1rm) {
          runningBestE1rm = sessionBestE1rm;
        }

        // Add data point with running best (shows progression)
        dataPoints.push({
          timestampMs: session.startedAtMs,
          e1rmKg: runningBestE1rm,
        });
      }
    }

    return dataPoints;
  }, [sessions, exerciseId, timeframe]);
}

/**
 * Hook to get a single exercise rank summary
 */
export function useExerciseRank(exerciseId: string): ExerciseRankSummary | null {
  const exerciseStats = useExerciseStats();

  return useMemo(() => {
    const stats = exerciseStats[exerciseId];
    if (!stats) return null;

    let bestWeightKg = stats.bestWeightKg || 0;
    let bestReps = 1;

    if (stats.bestRepsAtWeight) {
      for (const [weightStr, reps] of Object.entries(stats.bestRepsAtWeight)) {
        const weight = parseFloat(weightStr);
        if (weight === bestWeightKg && reps > bestReps) {
          bestReps = reps;
        }
      }
    }

    return {
      exerciseId,
      exerciseName: getExerciseName(exerciseId),
      currentRank: stats.rank || 1,
      currentTier: getTierFromRank(stats.rank || 1),
      progressToNextRank: stats.progressToNext || 0,
      bestWeightKg,
      bestReps,
      bestE1rm: stats.bestE1RMKg || 0,
      lastLoggedAt: stats.lastUpdatedMs || 0,
      totalSets: stats.totalSets || 0,
      totalVolumeKg: stats.totalVolumeKg || 0,
    };
  }, [exerciseStats, exerciseId]);
}

// Re-export types for convenience
export type { ExerciseRankSummary, SparklineTimeframe, SparklineDataPoint, ExerciseRankSortOption };
