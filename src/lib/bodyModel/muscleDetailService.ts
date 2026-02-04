// src/lib/bodyModel/muscleDetailService.ts
// Service for getting detailed muscle group information

import type { MuscleGroup } from '@/src/data/exerciseTypes';
import type { WorkoutSession } from '../workoutModel';
import { getExerciseById, resolveExerciseId, getAllExercises } from '@/src/data/exerciseDatabase';
import { calculateVolumeForSessions } from '../volumeCalculator';
import {
  type MuscleDetail,
  type VolumeDataPoint,
  type TimePeriod,
  type CompactBodyData,
  MUSCLE_MOVEMENT_PATTERNS,
  MUSCLE_BODY_SIDES,
  MUSCLE_BODY_REGIONS,
} from './bodyModelTypes';

/**
 * Muscle group display names
 */
const MUSCLE_DISPLAY_NAMES: Record<MuscleGroup, string> = {
  'chest': 'Chest',
  'shoulders': 'Shoulders',
  'triceps': 'Triceps',
  'biceps': 'Biceps',
  'forearms': 'Forearms',
  'lats': 'Lats',
  'middle back': 'Middle Back',
  'lower back': 'Lower Back',
  'traps': 'Traps',
  'neck': 'Neck',
  'abdominals': 'Abs',
  'quadriceps': 'Quads',
  'hamstrings': 'Hamstrings',
  'glutes': 'Glutes',
  'calves': 'Calves',
  'adductors': 'Adductors',
  'abductors': 'Abductors',
};

/**
 * Convert time period to milliseconds
 */
export function timePeriodToMs(period: TimePeriod): number | null {
  const DAY_MS = 24 * 60 * 60 * 1000;

  switch (period) {
    case 'week':
      return 7 * DAY_MS;
    case 'month':
      return 30 * DAY_MS;
    case '3months':
      return 90 * DAY_MS;
    case 'year':
      return 365 * DAY_MS;
    case 'all':
      return null;
  }
}

/**
 * Filter sessions by time period
 */
export function filterSessionsByPeriod(
  sessions: WorkoutSession[],
  period: TimePeriod
): WorkoutSession[] {
  const periodMs = timePeriodToMs(period);

  if (periodMs === null) {
    return sessions;
  }

  const cutoffMs = Date.now() - periodMs;
  return sessions.filter(s => s.startedAtMs >= cutoffMs);
}

/**
 * Get volume data points for trend visualization
 */
export function getVolumeDataPoints(
  sessions: WorkoutSession[],
  muscleGroup: MuscleGroup,
  period: TimePeriod = 'month'
): VolumeDataPoint[] {
  const filteredSessions = filterSessionsByPeriod(sessions, period);

  // Group sessions by day
  const dayMap = new Map<string, { volumeKg: number; sets: number }>();

  for (const session of filteredSessions) {
    const dayKey = new Date(session.startedAtMs).toISOString().split('T')[0];

    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, { volumeKg: 0, sets: 0 });
    }

    const dayData = dayMap.get(dayKey)!;

    for (const set of session.sets) {
      const exerciseId = resolveExerciseId(set.exerciseId);
      const exercise = getExerciseById(exerciseId);

      if (!exercise) continue;

      const setVolume = set.weightKg * set.reps;
      let attribution = 0;

      if (exercise.primaryMuscles.includes(muscleGroup)) {
        attribution = 1.0;
      } else if (exercise.secondaryMuscles.includes(muscleGroup)) {
        attribution = 0.5;
      }

      if (attribution > 0) {
        dayData.volumeKg += setVolume * attribution;
        dayData.sets += 1;
      }
    }
  }

  // Convert to array and sort by date
  const dataPoints: VolumeDataPoint[] = Array.from(dayMap.entries())
    .map(([dayKey, data]) => ({
      dateMs: new Date(dayKey).getTime(),
      volumeKg: data.volumeKg,
      sets: data.sets,
    }))
    .sort((a, b) => a.dateMs - b.dateMs);

  return dataPoints;
}

/**
 * Get top exercises for a muscle group
 */
export function getTopExercisesForMuscle(
  sessions: WorkoutSession[],
  muscleGroup: MuscleGroup,
  limit: number = 5
): Array<{ exerciseId: string; exerciseName: string; volumeKg: number; sets: number }> {
  const exerciseMap = new Map<string, { volumeKg: number; sets: number }>();

  for (const session of sessions) {
    for (const set of session.sets) {
      const exerciseId = resolveExerciseId(set.exerciseId);
      const exercise = getExerciseById(exerciseId);

      if (!exercise) continue;

      let attribution = 0;
      if (exercise.primaryMuscles.includes(muscleGroup)) {
        attribution = 1.0;
      } else if (exercise.secondaryMuscles.includes(muscleGroup)) {
        attribution = 0.5;
      }

      if (attribution > 0) {
        if (!exerciseMap.has(exerciseId)) {
          exerciseMap.set(exerciseId, { volumeKg: 0, sets: 0 });
        }

        const data = exerciseMap.get(exerciseId)!;
        data.volumeKg += set.weightKg * set.reps * attribution;
        data.sets += 1;
      }
    }
  }

  return Array.from(exerciseMap.entries())
    .map(([exerciseId, data]) => ({
      exerciseId,
      exerciseName: getExerciseById(exerciseId)?.name || exerciseId,
      volumeKg: data.volumeKg,
      sets: data.sets,
    }))
    .sort((a, b) => b.volumeKg - a.volumeKg)
    .slice(0, limit);
}

/**
 * Get days since a muscle was last trained
 */
export function getDaysSinceLastTrained(
  sessions: WorkoutSession[],
  muscleGroup: MuscleGroup
): number | null {
  // Find most recent session that trained this muscle
  const sortedSessions = [...sessions].sort((a, b) => b.startedAtMs - a.startedAtMs);

  for (const session of sortedSessions) {
    for (const set of session.sets) {
      const exerciseId = resolveExerciseId(set.exerciseId);
      const exercise = getExerciseById(exerciseId);

      if (!exercise) continue;

      if (
        exercise.primaryMuscles.includes(muscleGroup) ||
        exercise.secondaryMuscles.includes(muscleGroup)
      ) {
        const daysDiff = (Date.now() - session.startedAtMs) / (24 * 60 * 60 * 1000);
        return Math.floor(daysDiff);
      }
    }
  }

  return null; // Never trained
}

/**
 * Get detailed information for a muscle group
 */
export function getMuscleDetail(
  sessions: WorkoutSession[],
  muscleGroup: MuscleGroup,
  period: TimePeriod = 'month'
): MuscleDetail {
  const filteredSessions = filterSessionsByPeriod(sessions, period);
  const volumeResult = calculateVolumeForSessions(filteredSessions);

  const totalVolumeKg = volumeResult.volumeByMuscleGroup[muscleGroup] || 0;
  const totalSystemVolume = volumeResult.totalVolumeKg;
  const volumePercentage = totalSystemVolume > 0 ? (totalVolumeKg / totalSystemVolume) * 100 : 0;

  // Calculate total sets for this muscle
  let totalSets = 0;
  let sessionCount = 0;
  const sessionsWithMuscle = new Set<string>();

  for (const session of filteredSessions) {
    for (const set of session.sets) {
      const exerciseId = resolveExerciseId(set.exerciseId);
      const exercise = getExerciseById(exerciseId);

      if (!exercise) continue;

      if (
        exercise.primaryMuscles.includes(muscleGroup) ||
        exercise.secondaryMuscles.includes(muscleGroup)
      ) {
        totalSets++;
        sessionsWithMuscle.add(session.id);
      }
    }
  }

  sessionCount = sessionsWithMuscle.size;

  // Calculate normalized intensity
  const maxVolume = Math.max(...Object.values(volumeResult.volumeByMuscleGroup));
  const normalizedIntensity = maxVolume > 0 ? totalVolumeKg / maxVolume : 0;

  return {
    muscleGroup,
    name: MUSCLE_DISPLAY_NAMES[muscleGroup] || muscleGroup,
    totalVolumeKg,
    totalSets,
    sessionCount,
    volumeTrend: getVolumeDataPoints(sessions, muscleGroup, period),
    topExercises: getTopExercisesForMuscle(filteredSessions, muscleGroup),
    volumePercentage,
    normalizedIntensity,
    daysSinceLastTrained: getDaysSinceLastTrained(sessions, muscleGroup),
    movementPattern: MUSCLE_MOVEMENT_PATTERNS[muscleGroup],
    bodySide: MUSCLE_BODY_SIDES[muscleGroup],
    bodyRegion: MUSCLE_BODY_REGIONS[muscleGroup],
  };
}

/**
 * Get all muscle details
 */
export function getAllMuscleDetails(
  sessions: WorkoutSession[],
  period: TimePeriod = 'month'
): MuscleDetail[] {
  const muscleGroups = Object.keys(MUSCLE_DISPLAY_NAMES) as MuscleGroup[];

  return muscleGroups.map(muscle => getMuscleDetail(sessions, muscle, period));
}

/**
 * Get exercises that target a specific muscle group
 */
export function getExercisesForMuscle(
  muscleGroup: MuscleGroup
): Array<{ exerciseId: string; exerciseName: string; isPrimary: boolean }> {
  const allExercises = getAllExercises();
  const results: Array<{ exerciseId: string; exerciseName: string; isPrimary: boolean }> = [];

  for (const exercise of allExercises) {
    if (exercise.primaryMuscles.includes(muscleGroup)) {
      results.push({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        isPrimary: true,
      });
    } else if (exercise.secondaryMuscles.includes(muscleGroup)) {
      results.push({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        isPrimary: false,
      });
    }
  }

  // Sort: primary first, then by name
  return results.sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) {
      return a.isPrimary ? -1 : 1;
    }
    return a.exerciseName.localeCompare(b.exerciseName);
  });
}

/**
 * Format volume for display
 */
export function formatVolume(volumeKg: number): string {
  if (volumeKg >= 1000000) {
    return `${(volumeKg / 1000000).toFixed(1)}m kg`;
  }
  if (volumeKg >= 1000) {
    return `${(volumeKg / 1000).toFixed(1)}k kg`;
  }
  return `${Math.round(volumeKg)} kg`;
}

/**
 * Generate compact body data for social posts
 */
export function generateCompactBodyData(
  session: WorkoutSession
): CompactBodyData {
  const volumeResult = calculateVolumeForSessions([session]);

  // Calculate normalized intensities
  const maxVolume = Math.max(...Object.values(volumeResult.volumeByMuscleGroup), 1);
  const muscleIntensities: Record<string, number> = {};

  for (const [muscle, volume] of Object.entries(volumeResult.volumeByMuscleGroup)) {
    muscleIntensities[muscle] = volume / maxVolume;
  }

  // Get top 3 muscles
  const topMuscles = Object.entries(volumeResult.volumeByMuscleGroup)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([muscle]) => MUSCLE_DISPLAY_NAMES[muscle as MuscleGroup] || muscle);

  // Calculate duration in minutes
  const durationMs = session.endedAtMs - session.startedAtMs;
  const durationMin = Math.round(durationMs / 60000);

  // Count unique exercises
  const exerciseIds = new Set(session.sets.map(s => s.exerciseId));

  return {
    muscleIntensities,
    totalVolumeFormatted: formatVolume(volumeResult.totalVolumeKg),
    primaryMuscles: topMuscles,
    durationMin,
    exerciseCount: exerciseIds.size,
  };
}

/**
 * Get muscle groups sorted by training priority (least trained first)
 */
export function getMusclesByTrainingPriority(
  sessions: WorkoutSession[],
  period: TimePeriod = 'month'
): Array<{ muscle: MuscleGroup; priority: 'high' | 'medium' | 'low'; daysSinceLastTrained: number | null }> {
  const details = getAllMuscleDetails(sessions, period);

  return details
    .map(detail => {
      let priority: 'high' | 'medium' | 'low';

      if (detail.daysSinceLastTrained === null || detail.daysSinceLastTrained > 14) {
        priority = 'high';
      } else if (detail.daysSinceLastTrained > 7 || detail.normalizedIntensity < 0.3) {
        priority = 'medium';
      } else {
        priority = 'low';
      }

      return {
        muscle: detail.muscleGroup,
        priority,
        daysSinceLastTrained: detail.daysSinceLastTrained,
      };
    })
    .sort((a, b) => {
      // Sort by priority first (high > medium > low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Then by days since last trained (longer = higher priority)
      const aDays = a.daysSinceLastTrained ?? Infinity;
      const bDays = b.daysSinceLastTrained ?? Infinity;
      return bDays - aDays;
    });
}
