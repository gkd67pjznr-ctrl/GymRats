import type { ForgeDNA, ForgeDNAInput, TrainingStyle, LiftPreference } from "./types";
import type { MuscleGroup } from "../../data/exerciseTypes";
import type { WorkoutSession, WorkoutSet } from "../workoutModel";
import { getExerciseById } from "../../data/exerciseDatabase";
import { estimate1RM_Epley } from "../e1rm";

/**
 * Forge DNA Calculator - Generates training identity fingerprint
 */

const MIN_WORKOUTS_FOR_DNA = 5; // Minimum workouts needed to generate meaningful DNA

/**
 * Calculate Forge DNA from workout history
 */
export function calculateForgeDNA(input: ForgeDNAInput, userId: string): ForgeDNA | null {
  const { workoutHistory, exerciseStats, muscleGroupVolume, trainingDays } = input;

  // Check minimum requirements
  if (workoutHistory.length < MIN_WORKOUTS_FOR_DNA) {
    return null;
  }

  // Calculate muscle balance (0-100 for each muscle group)
  const muscleBalance = calculateMuscleBalance(muscleGroupVolume);

  // Calculate training style distribution
  const trainingStyle = calculateTrainingStyle(workoutHistory);

  // Get top exercises
  const topExercises = getTopExercises(exerciseStats);

  // Determine lift preferences
  const liftPreferences = determineLiftPreferences(exerciseStats, muscleGroupVolume);

  return {
    userId,
    generatedAt: Date.now(),
    muscleBalance,
    trainingStyle,
    topExercises,
    liftPreferences,
    totalDataPoints: workoutHistory.length,
    trainingDays,
  };
}

/**
 * Calculate muscle balance scores (0-100) for each muscle group
 */
function calculateMuscleBalance(muscleGroupVolume: Record<MuscleGroup, number>): Record<MuscleGroup, number> {
  // Find the maximum volume to normalize against
  const maxVolume = Math.max(...Object.values(muscleGroupVolume));

  if (maxVolume === 0) {
    // If no volume, return balanced distribution
    const balanced: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;
    const muscleGroups: MuscleGroup[] = [
      'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest',
      'forearms', 'glutes', 'hamstrings', 'lats', 'lower back', 'middle back',
      'neck', 'quadriceps', 'shoulders', 'traps', 'triceps'
    ];

    muscleGroups.forEach(muscle => {
      balanced[muscle] = 50; // Neutral balance
    });

    return balanced;
  }

  // Normalize each muscle group to 0-100 scale
  const normalized: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;
  for (const [muscle, volume] of Object.entries(muscleGroupVolume)) {
    normalized[muscle as MuscleGroup] = Math.min(100, Math.round((volume / maxVolume) * 100));
  }

  return normalized;
}

/**
 * Calculate training style distribution based on set characteristics
 */
function calculateTrainingStyle(workoutHistory: WorkoutSession[]): ForgeDNA['trainingStyle'] {
  let totalSets = 0;
  let strengthScore = 0;
  let volumeScore = 0;
  let enduranceScore = 0;

  // Analyze all sets across all workouts
  for (const session of workoutHistory) {
    for (const set of session.sets) {
      totalSets++;

      // Classify set based on reps and relative weight
      if (set.reps <= 5) {
        // Low reps - strength focus
        strengthScore += set.weightKg * set.reps; // Weighted by volume
      } else if (set.reps <= 12) {
        // Moderate reps - volume focus
        volumeScore += set.weightKg * set.reps;
      } else {
        // High reps - endurance focus
        enduranceScore += set.weightKg * set.reps;
      }
    }
  }

  if (totalSets === 0) {
    return { strength: 33, volume: 33, endurance: 34 }; // Balanced default
  }

  // Calculate total volume for normalization
  const totalVolume = strengthScore + volumeScore + enduranceScore;

  if (totalVolume === 0) {
    return { strength: 33, volume: 33, endurance: 34 }; // Balanced default
  }

  // Convert to percentages
  return {
    strength: Math.round((strengthScore / totalVolume) * 100),
    volume: Math.round((volumeScore / totalVolume) * 100),
    endurance: Math.round((enduranceScore / totalVolume) * 100),
  };
}

/**
 * Get top 5 exercised based on volume
 */
function getTopExercises(exerciseStats: ForgeDNAInput['exerciseStats']): string[] {
  // Sort by total volume descending
  const sorted = [...exerciseStats].sort((a, b) => b.totalVolume - a.totalVolume);

  // Return top 5 exercise IDs
  return sorted.slice(0, 5).map(stat => stat.exerciseId);
}

/**
 * Determine lift preferences based on exercise stats and muscle distribution
 */
function determineLiftPreferences(
  exerciseStats: ForgeDNAInput['exerciseStats'],
  muscleGroupVolume: Record<MuscleGroup, number>
): string[] {
  const preferences: string[] = [];

  // Check for compound vs isolation preference
  let compoundVolume = 0;
  let isolationVolume = 0;

  for (const stat of exerciseStats) {
    const exercise = getExerciseById(stat.exerciseId);
    if (exercise) {
      if (exercise.mechanic === 'compound') {
        compoundVolume += stat.totalVolume;
      } else if (exercise.mechanic === 'isolation') {
        isolationVolume += stat.totalVolume;
      }
    }
  }

  if (compoundVolume > isolationVolume * 1.5) {
    preferences.push('compound-heavy');
  } else if (isolationVolume > compoundVolume * 1.5) {
    preferences.push('isolation-focused');
  } else {
    preferences.push('balanced-compound-isolation');
  }

  // Check for upper vs lower body dominance
  const upperBodyMuscles: MuscleGroup[] = ['chest', 'shoulders', 'triceps', 'biceps', 'lats', 'traps', 'middle back', 'neck'];
  const lowerBodyMuscles: MuscleGroup[] = ['quadriceps', 'hamstrings', 'glutes', 'calves', 'abductors', 'adductors'];

  let upperBodyVolume = 0;
  let lowerBodyVolume = 0;

  for (const muscle of upperBodyMuscles) {
    upperBodyVolume += muscleGroupVolume[muscle] || 0;
  }

  for (const muscle of lowerBodyMuscles) {
    lowerBodyVolume += muscleGroupVolume[muscle] || 0;
  }

  if (upperBodyVolume > lowerBodyVolume * 1.3) {
    preferences.push('upper-body-dominant');
  } else if (lowerBodyVolume > upperBodyVolume * 1.3) {
    preferences.push('lower-body-dominant');
  } else {
    preferences.push('balanced-upper-lower');
  }

  // Check for push vs pull dominance
  const pushMuscles: MuscleGroup[] = ['chest', 'shoulders', 'triceps'];
  const pullMuscles: MuscleGroup[] = ['lats', 'middle back', 'biceps', 'traps'];

  let pushVolume = 0;
  let pullVolume = 0;

  for (const muscle of pushMuscles) {
    pushVolume += muscleGroupVolume[muscle] || 0;
  }

  for (const muscle of pullMuscles) {
    pullVolume += muscleGroupVolume[muscle] || 0;
  }

  if (pushVolume > pullVolume * 1.2) {
    preferences.push('push-focused');
  } else if (pullVolume > pushVolume * 1.2) {
    preferences.push('pull-focused');
  } else {
    preferences.push('balanced-push-pull');
  }

  return preferences.slice(0, 3); // Return top 3 preferences
}

/**
 * Process workout history into ForgeDNAInput format
 */
export function processWorkoutHistory(workouts: WorkoutSession[]): ForgeDNAInput {
  const muscleGroupVolume: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;
  const exerciseStatsMap: Record<string, {
    totalVolume: number;
    totalSets: number;
    bestE1RM: number;
    repCounts: number[];
  }> = {};

  const trainingDaysSet = new Set<number>();

  // Initialize muscle groups
  const muscleGroups: MuscleGroup[] = [
    'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest',
    'forearms', 'glutes', 'hamstrings', 'lats', 'lower back', 'middle back',
    'neck', 'quadriceps', 'shoulders', 'traps', 'triceps'
  ];

  muscleGroups.forEach(muscle => {
    muscleGroupVolume[muscle] = 0;
  });

  // Process all workouts and sets
  for (const workout of workouts) {
    // Track unique training days
    const workoutDay = startOfDayMs(workout.startedAtMs);
    trainingDaysSet.add(workoutDay);

    for (const set of workout.sets) {
      processSet(set, muscleGroupVolume, exerciseStatsMap);
    }
  }

  // Convert exercise stats map to array
  const exerciseStats = Object.entries(exerciseStatsMap).map(([exerciseId, stats]) => ({
    exerciseId,
    totalVolume: stats.totalVolume,
    totalSets: stats.totalSets,
    bestE1RM: stats.bestE1RM,
    avgReps: stats.repCounts.length > 0
      ? stats.repCounts.reduce((sum, reps) => sum + reps, 0) / stats.repCounts.length
      : 0,
    frequency: 0, // Would need more data for frequency calculation
  }));

  return {
    workoutHistory: workouts,
    exerciseStats,
    muscleGroupVolume,
    trainingDays: trainingDaysSet.size,
  };
}

/**
 * Process a single set and update stats
 */
function processSet(
  set: WorkoutSet,
  muscleGroupVolume: Record<MuscleGroup, number>,
  exerciseStatsMap: Record<string, any>
): void {
  const volume = set.weightKg * set.reps;

  // Update muscle group volumes
  const exercise = getExerciseById(set.exerciseId);
  if (exercise) {
    // Add volume to primary muscles
    exercise.primaryMuscles.forEach(muscle => {
      muscleGroupVolume[muscle] = (muscleGroupVolume[muscle] || 0) + volume;
    });

    // Add partial volume to secondary muscles
    exercise.secondaryMuscles.forEach(muscle => {
      muscleGroupVolume[muscle] = (muscleGroupVolume[muscle] || 0) + (volume * 0.5);
    });
  }

  // Update exercise stats
  if (!exerciseStatsMap[set.exerciseId]) {
    exerciseStatsMap[set.exerciseId] = {
      totalVolume: 0,
      totalSets: 0,
      bestE1RM: 0,
      repCounts: [],
    };
  }

  const stats = exerciseStatsMap[set.exerciseId];
  stats.totalVolume += volume;
  stats.totalSets += 1;
  stats.repCounts.push(set.reps);

  // Calculate e1RM for this set and update best if better
  const e1rm = estimate1RM_Epley(set.weightKg, set.reps);
  if (e1rm > stats.bestE1RM) {
    stats.bestE1RM = e1rm;
  }
}

/**
 * Helper to get start of day in milliseconds
 */
function startOfDayMs(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}