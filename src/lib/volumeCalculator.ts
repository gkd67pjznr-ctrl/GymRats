import { getExerciseById, resolveExerciseId } from '@/src/data/exerciseDatabase';
import type { WorkoutSession, WorkoutSet } from './workoutModel';
import type { MuscleGroup } from '@/src/data/exerciseTypes';
import { MUSCLE_GROUPS } from '@/src/data/muscleGroups';

/**
 * Volume Calculator
 *
 * Calculates training volume per muscle group based on workout history.
 * Volume is calculated as: weight (kg) × reps for each set.
 *
 * This calculator uses the current exercise database with standardized muscle groups.
 */

export type VolumeByMuscleGroup = {
  [muscle in MuscleGroup]?: number;
};

export type VolumeResult = {
  totalVolumeKg: number;
  volumeByMuscleGroup: VolumeByMuscleGroup;
  volumeByExercise: Record<string, number>;
  sessionCount: number;
};

export type VolumeOptions = {
  /**
   * Time range in milliseconds for filtering sessions
   * If not provided, all sessions are included
   */
  timeRangeMs?: number;

  /**
   * Start date for filtering sessions (inclusive)
   * If not provided, no start date filter is applied
   */
  startDateMs?: number;

  /**
   * End date for filtering sessions (inclusive)
   * If not provided, no end date filter is applied
   */
  endDateMs?: number;
};

/**
 * Calculate volume for a single set
 * Volume = weight (kg) × reps
 */
export function calculateSetVolume(set: WorkoutSet): number {
  return set.weightKg * set.reps;
}

/**
 * Calculate volume for a single workout session
 */
export function calculateSessionVolume(session: WorkoutSession): VolumeResult {
  const volumeByMuscleGroup: VolumeByMuscleGroup = {};
  const volumeByExercise: Record<string, number> = {};
  let totalVolumeKg = 0;

  for (const set of session.sets) {
    const setVolume = calculateSetVolume(set);
    totalVolumeKg += setVolume;

    // Aggregate by exercise
    volumeByExercise[set.exerciseId] = (volumeByExercise[set.exerciseId] || 0) + setVolume;

    // Get exercise info to determine muscle groups
    const exerciseId = resolveExerciseId(set.exerciseId);
    const exercise = getExerciseById(exerciseId);

    if (exercise) {
      // Add volume to primary muscles (full weight)
      for (const muscle of exercise.primaryMuscles) {
        volumeByMuscleGroup[muscle] = (volumeByMuscleGroup[muscle] || 0) + setVolume;
      }

      // Add volume to secondary muscles (50% weight)
      for (const muscle of exercise.secondaryMuscles) {
        volumeByMuscleGroup[muscle] = (volumeByMuscleGroup[muscle] || 0) + (setVolume * 0.5);
      }
    }
  }

  return {
    totalVolumeKg,
    volumeByMuscleGroup,
    volumeByExercise,
    sessionCount: 1,
  };
}

/**
 * Calculate volume across multiple workout sessions
 */
export function calculateVolumeForSessions(
  sessions: WorkoutSession[],
  options: VolumeOptions = {}
): VolumeResult {
  const filteredSessions = filterSessionsByOptions(sessions, options);

  const volumeByMuscleGroup: VolumeByMuscleGroup = {};
  const volumeByExercise: Record<string, number> = {};
  let totalVolumeKg = 0;

  for (const session of filteredSessions) {
    const sessionResult = calculateSessionVolume(session);

    totalVolumeKg += sessionResult.totalVolumeKg;

    // Merge muscle group volumes
    for (const [muscle, volume] of Object.entries(sessionResult.volumeByMuscleGroup)) {
      volumeByMuscleGroup[muscle as MuscleGroup] =
        (volumeByMuscleGroup[muscle as MuscleGroup] || 0) + volume;
    }

    // Merge exercise volumes
    for (const [exerciseId, volume] of Object.entries(sessionResult.volumeByExercise)) {
      volumeByExercise[exerciseId] = (volumeByExercise[exerciseId] || 0) + volume;
    }
  }

  return {
    totalVolumeKg,
    volumeByMuscleGroup,
    volumeByExercise,
    sessionCount: filteredSessions.length,
  };
}

/**
 * Filter sessions based on time range and date options
 */
function filterSessionsByOptions(
  sessions: WorkoutSession[],
  options: VolumeOptions
): WorkoutSession[] {
  const { timeRangeMs, startDateMs, endDateMs } = options;
  const now = Date.now();

  return sessions.filter(session => {
    // Filter by time range (last X milliseconds)
    if (timeRangeMs !== undefined) {
      const sessionAge = now - session.startedAtMs;
      if (sessionAge > timeRangeMs) {
        return false;
      }
    }

    // Filter by start date
    if (startDateMs !== undefined && session.startedAtMs < startDateMs) {
      return false;
    }

    // Filter by end date
    if (endDateMs !== undefined && session.startedAtMs > endDateMs) {
      return false;
    }

    return true;
  });
}

/**
 * Get volume for a specific muscle group
 */
export function getVolumeForMuscleGroup(
  result: VolumeResult,
  muscleGroup: MuscleGroup
): number {
  return result.volumeByMuscleGroup[muscleGroup] || 0;
}

/**
 * Get volume for a specific exercise
 */
export function getVolumeForExercise(
  result: VolumeResult,
  exerciseId: string
): number {
  return result.volumeByExercise[exerciseId] || 0;
}

/**
 * Get top muscle groups by volume (sorted descending)
 */
export function getTopMuscleGroups(
  result: VolumeResult,
  limit: number = 5
): { muscle: MuscleGroup; volume: number }[] {
  return Object.entries(result.volumeByMuscleGroup)
    .map(([muscle, volume]) => ({ muscle: muscle as MuscleGroup, volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);
}

/**
 * Get top exercises by volume (sorted descending)
 */
export function getTopExercises(
  result: VolumeResult,
  limit: number = 5
): { exerciseId: string; volume: number }[] {
  return Object.entries(result.volumeByExercise)
    .map(([exerciseId, volume]) => ({ exerciseId, volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);
}

/**
 * Calculate volume balance between muscle groups
 * Returns a ratio of volume between two muscle groups
 */
export function calculateMuscleGroupRatio(
  result: VolumeResult,
  muscleGroupA: MuscleGroup,
  muscleGroupB: MuscleGroup
): number {
  const volumeA = getVolumeForMuscleGroup(result, muscleGroupA);
  const volumeB = getVolumeForMuscleGroup(result, muscleGroupB);

  if (volumeB === 0) {
    return volumeA > 0 ? Infinity : 0;
  }

  return volumeA / volumeB;
}

/**
 * Calculate weekly volume averages
 */
export function calculateWeeklyVolumeAverages(
  sessions: WorkoutSession[],
  options: VolumeOptions = {}
): VolumeResult {
  const filteredSessions = filterSessionsByOptions(sessions, options);

  if (filteredSessions.length === 0) {
    return {
      totalVolumeKg: 0,
      volumeByMuscleGroup: {},
      volumeByExercise: {},
      sessionCount: 0,
    };
  }

  // Calculate total volume
  const totalResult = calculateVolumeForSessions(filteredSessions, options);

  // Calculate number of weeks
  const startDate = Math.min(...filteredSessions.map(s => s.startedAtMs));
  const endDate = Math.max(...filteredSessions.map(s => s.startedAtMs));
  const durationWeeks = (endDate - startDate) / (1000 * 60 * 60 * 24 * 7);
  const weeks = Math.max(1, durationWeeks); // At least 1 week

  // Calculate weekly averages
  const weeklyVolumeByMuscleGroup: VolumeByMuscleGroup = {};
  const weeklyVolumeByExercise: Record<string, number> = {};

  for (const [muscle, volume] of Object.entries(totalResult.volumeByMuscleGroup)) {
    weeklyVolumeByMuscleGroup[muscle as MuscleGroup] = volume / weeks;
  }

  for (const [exerciseId, volume] of Object.entries(totalResult.volumeByExercise)) {
    weeklyVolumeByExercise[exerciseId] = volume / weeks;
  }

  return {
    totalVolumeKg: totalResult.totalVolumeKg / weeks,
    volumeByMuscleGroup: weeklyVolumeByMuscleGroup,
    volumeByExercise: weeklyVolumeByExercise,
    sessionCount: totalResult.sessionCount,
  };
}

/**
 * Calculate volume per session (average)
 */
export function calculateVolumePerSession(
  result: VolumeResult
): VolumeResult {
  if (result.sessionCount <= 0) {
    return {
      totalVolumeKg: 0,
      volumeByMuscleGroup: {},
      volumeByExercise: {},
      sessionCount: 0,
    };
  }

  const volumeByMuscleGroup: VolumeByMuscleGroup = {};
  const volumeByExercise: Record<string, number> = {};

  for (const [muscle, volume] of Object.entries(result.volumeByMuscleGroup)) {
    volumeByMuscleGroup[muscle as MuscleGroup] = volume / result.sessionCount;
  }

  for (const [exerciseId, volume] of Object.entries(result.volumeByExercise)) {
    volumeByExercise[exerciseId] = volume / result.sessionCount;
  }

  return {
    totalVolumeKg: result.totalVolumeKg / result.sessionCount,
    volumeByMuscleGroup,
    volumeByExercise,
    sessionCount: 1,
  };
}

/**
 * Get all muscle groups that have volume
 */
export function getActiveMuscleGroups(result: VolumeResult): MuscleGroup[] {
  return Object.keys(result.volumeByMuscleGroup) as MuscleGroup[];
}

/**
 * Check if a muscle group has been trained
 */
export function hasTrainedMuscleGroup(
  result: VolumeResult,
  muscleGroup: MuscleGroup
): boolean {
  return getVolumeForMuscleGroup(result, muscleGroup) > 0;
}

/**
 * Calculate normalized volumes (0-1) for visualization
 */
export function calculateNormalizedVolumes(
  result: VolumeResult
): Record<MuscleGroup, number> {
  const volumes = result.volumeByMuscleGroup;
  const maxVolume = Math.max(...Object.values(volumes));

  if (maxVolume === 0) {
    return {} as Record<MuscleGroup, number>;
  }

  const normalized: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;
  for (const [muscle, volume] of Object.entries(volumes)) {
    normalized[muscle as MuscleGroup] = volume / maxVolume;
  }

  return normalized;
}

/**
 * Calculate muscle volumes for body model visualization
 * Returns normalized volumes (0-1) for all muscle groups
 */
export function calculateMuscleVolumes(
  sessions: WorkoutSession[]
): Record<string, number> {
  const result = calculateVolumeForSessions(sessions);
  const volumes = result.volumeByMuscleGroup;
  const maxVolume = Math.max(...Object.values(volumes));

  if (maxVolume === 0) {
    return {};
  }

  const normalized: Record<string, number> = {};
  for (const [muscle, volume] of Object.entries(volumes)) {
    normalized[muscle] = volume / maxVolume;
  }

  return normalized;
}

/**
 * Calculate volume distribution percentages
 */
export function calculateVolumeDistribution(
  result: VolumeResult
): Record<MuscleGroup, number> {
  const volumes = result.volumeByMuscleGroup;
  const totalVolume = result.totalVolumeKg;

  if (totalVolume === 0) {
    return {} as Record<MuscleGroup, number>;
  }

  const distribution: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;
  for (const [muscle, volume] of Object.entries(volumes)) {
    distribution[muscle as MuscleGroup] = (volume / totalVolume) * 100;
  }

  return distribution;
}