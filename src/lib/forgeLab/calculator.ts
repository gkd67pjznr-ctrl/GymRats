/**
 * Forge Lab Calculator - Processes workout data into analytics
 */
import { EXERCISES_V1 } from '@/src/data/exercises';
import { estimate1RM_Epley as calculateE1RM } from '@/src/lib/e1rm';
import { MuscleGroup, ExerciseStat, MuscleGroupVolumeData } from './types';
import { WorkoutSession, WorkoutSet } from '@/src/lib/workoutModel';
import { scoreFromE1rm } from '@/src/lib/GrScoring';

/**
 * Calculate e1RM history for an exercise
 */
export function calculateE1RMHistory(
  sessions: WorkoutSession[],
  exerciseId: string
): { date: string; e1rm: number }[] {
  const e1rmHistory: { date: string; e1rm: number }[] = [];

  // Filter sets for this exercise
  const exerciseSets: WorkoutSet[] = [];
  sessions.forEach(session => {
    session.sets.forEach(set => {
      if (set.exerciseId === exerciseId) {
        exerciseSets.push(set);
      }
    });
  });

  // Group sets by date and find max e1RM per day
  const setsByDate: Record<string, WorkoutSet[]> = {};
  exerciseSets.forEach(set => {
    const date = new Date(set.timestampMs).toISOString().split('T')[0];
    if (!setsByDate[date]) {
      setsByDate[date] = [];
    }
    setsByDate[date].push(set);
  });

  // Calculate max e1RM for each date
  Object.keys(setsByDate).forEach(date => {
    let maxE1RM = 0;
    setsByDate[date].forEach(set => {
      const e1rm = calculateE1RM(set.weightKg, set.reps);
      if (e1rm > maxE1RM) {
        maxE1RM = e1rm;
      }
    });
    if (maxE1RM > 0) {
      e1rmHistory.push({ date, e1rm: Math.round(maxE1RM * 100) / 100 });
    }
  });

  // Sort by date
  return e1rmHistory.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate volume history for an exercise
 */
export function calculateVolumeHistory(
  sessions: WorkoutSession[],
  exerciseId: string
): { week: string; volume: number }[] {
  const volumeHistory: { week: string; volume: number }[] = [];

  // Group sets by week
  const setsByWeek: Record<string, WorkoutSet[]> = {};
  sessions.forEach(session => {
    session.sets.forEach(set => {
      if (set.exerciseId === exerciseId) {
        // Get week string (ISO week: 2026-W04)
        const date = new Date(session.startedAtMs);
        const year = date.getUTCFullYear();
        const startOfYear = new Date(Date.UTC(year, 0, 1));
        const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getUTCDay() + 1) / 7);
        const weekString = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

        if (!setsByWeek[weekString]) {
          setsByWeek[weekString] = [];
        }
        setsByWeek[weekString].push(set);
      }
    });
  });

  // Calculate volume for each week
  Object.keys(setsByWeek).forEach(week => {
    let volume = 0;
    setsByWeek[week].forEach(set => {
      volume += set.weightKg * set.reps;
    });
    volumeHistory.push({ week, volume: Math.round(volume * 100) / 100 });
  });

  // Sort by week
  return volumeHistory.sort((a, b) => a.week.localeCompare(b.week));
}

/**
 * Calculate rank history for an exercise
 */
export function calculateRankHistory(
  sessions: WorkoutSession[],
  exerciseId: string,
  bodyweightKg: number
): { date: string; rank: number; score: number }[] {
  const rankHistory: { date: string; rank: number; score: number }[] = [];

  // Get unique dates with workouts for this exercise
  const datesWithWorkouts: string[] = [];
  const setsByDate: Record<string, WorkoutSet[]> = {};

  sessions.forEach(session => {
    const date = new Date(session.startedAtMs).toISOString().split('T')[0];
    let hasExercise = false;

    session.sets.forEach(set => {
      if (set.exerciseId === exerciseId) {
        hasExercise = true;
        if (!setsByDate[date]) {
          setsByDate[date] = [];
        }
        setsByDate[date].push(set);
      }
    });

    if (hasExercise && !datesWithWorkouts.includes(date)) {
      datesWithWorkouts.push(date);
    }
  });

  // Calculate rank/score for each date
  datesWithWorkouts.forEach(date => {
    // Find the best set for this exercise on this date
    let bestSet: WorkoutSet | null = null;
    let bestE1RM = 0;

    setsByDate[date].forEach(set => {
      const e1rm = calculateE1RM(set.weightKg, set.reps);
      if (e1rm > bestE1RM) {
        bestE1RM = e1rm;
        bestSet = set;
      }
    });

    if (bestSet) {
      const scoreResult = scoreFromE1rm(exerciseId, bestE1RM, bodyweightKg);
      // For now, we'll use a simple approach to determine rank
      // In a real implementation, we'd need to properly convert score to rank
      const rank = Math.min(20, Math.max(1, Math.floor(scoreResult.total / 50))); // Simple conversion
      rankHistory.push({
        date,
        rank: rank,
        score: Math.round(scoreResult.total)
      });
    }
  });

  // Sort by date
  return rankHistory.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate muscle group volume distribution
 */
export function calculateMuscleGroupVolume(
  sessions: WorkoutSession[]
): MuscleGroupVolumeData[] {
  const muscleGroupVolume: MuscleGroupVolumeData[] = [];

  // Group sessions by week
  const sessionsByWeek: Record<string, WorkoutSession[]> = {};
  sessions.forEach(session => {
    const date = new Date(session.startedAtMs);
    const year = date.getUTCFullYear();
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getUTCDay() + 1) / 7);
    const weekString = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

    if (!sessionsByWeek[weekString]) {
      sessionsByWeek[weekString] = [];
    }
    sessionsByWeek[weekString].push(session);
  });

  // Calculate volume per muscle group for each week
  Object.keys(sessionsByWeek).forEach(week => {
    const muscleGroups: Record<MuscleGroup, number> = {
      chest: 0, back: 0, shoulders: 0, legs: 0, arms: 0, core: 0,
      upper_chest: 0, lower_chest: 0, front_delt: 0, side_delt: 0, rear_delt: 0,
      lats: 0, mid_back: 0, traps: 0, biceps: 0, triceps: 0, forearms: 0,
      quads: 0, hamstrings: 0, glutes: 0, calves: 0, abs: 0, obliques: 0
    };

    sessionsByWeek[week].forEach(session => {
      session.sets.forEach(set => {
        const exercise = EXERCISES_V1.find(ex => ex.id === set.exerciseId);
        if (exercise && exercise.muscleGroups) {
          const volume = set.weightKg * set.reps;
          exercise.muscleGroups.forEach(group => {
            // Add to primary, secondary, and tertiary groups
            if (group.primary) {
              muscleGroups[group.name] = (muscleGroups[group.name] || 0) + volume * 0.6;
            }
            if (group.secondary) {
              muscleGroups[group.name] = (muscleGroups[group.name] || 0) + volume * 0.3;
            }
            if (group.tertiary) {
              muscleGroups[group.name] = (muscleGroups[group.name] || 0) + volume * 0.1;
            }
          });
        }
      });
    });

    // Round values
    Object.keys(muscleGroups).forEach(key => {
      muscleGroups[key as MuscleGroup] = Math.round(muscleGroups[key as MuscleGroup] * 100) / 100;
    });

    muscleGroupVolume.push({ period: week, groups: muscleGroups });
  });

  // Sort by week
  return muscleGroupVolume.sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Compile all Forge Lab data
 */
export function compileForgeLabData(
  sessions: WorkoutSession[],
  bodyweightKg: number,
  weightHistory: { date: string; weightKg: number }[] = []
): any {
  // Get all unique exercise IDs from the sessions
  const exerciseIds: string[] = [];
  sessions.forEach(session => {
    session.sets.forEach(set => {
      if (!exerciseIds.includes(set.exerciseId)) {
        exerciseIds.push(set.exerciseId);
      }
    });
  });

  // Calculate stats for each exercise
  const exerciseStats: ExerciseStat[] = exerciseIds.map(exerciseId => {
    const exercise = EXERCISES_V1.find(ex => ex.id === exerciseId);
    return {
      exerciseId,
      name: exercise?.name || exerciseId,
      e1rmHistory: calculateE1RMHistory(sessions, exerciseId),
      volumeHistory: calculateVolumeHistory(sessions, exerciseId),
      rankHistory: calculateRankHistory(sessions, exerciseId, bodyweightKg)
    };
  });

  // Calculate muscle group volume distribution
  const muscleGroupVolume = calculateMuscleGroupVolume(sessions);

  // Weight history from user settings or integration data
  // Uses the weightHistory parameter passed from store

  return {
    weightHistory,
    exerciseStats,
    muscleGroupVolume
  };
}