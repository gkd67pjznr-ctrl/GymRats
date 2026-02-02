/**
 * XP calculation logic for workouts.
 */

import type { WorkoutForCalculation, WorkoutXPBreakdown } from '../types';

/**
 * Calculate XP earned from a single workout.
 *
 * Formula:
 * - baseXP = sets × 10
 * - volumeBonus = sqrt(total_weight_kg × reps) × 2
 * - exerciseBonus = unique_exercises × 15
 * - streakBonus = current_streak × 5
 * - completionBonus = 50 (if 100% plan completion)
 *
 * @param workout - Workout data for calculation
 * @returns XP breakdown and total
 */
export function calculateWorkoutXP(workout: WorkoutForCalculation): WorkoutXPBreakdown {
  const { sets, fullyCompleted = false, currentStreak } = workout;

  // Base XP: 10 XP per set
  const baseXP = sets.length * 10;

  // Volume bonus: rewards heavier weights and more reps
  // Formula: sqrt(sum of (weight × reps)) × 2
  const totalVolume = sets.reduce((sum, set) => sum + set.weightKg * set.reps, 0);
  const volumeBonus = Math.floor(Math.sqrt(totalVolume) * 2);

  // Exercise variety bonus: rewards doing different exercises
  const uniqueExercises = new Set(sets.map((s) => s.exerciseId)).size;
  const exerciseBonus = uniqueExercises * 15;

  // Streak bonus: rewards consistency
  const streakBonus = currentStreak * 5;

  // Completion bonus: rewards finishing planned workouts
  const completionBonus = fullyCompleted ? 50 : 0;

  // Calculate total
  const total = baseXP + volumeBonus + exerciseBonus + streakBonus + completionBonus;

  return {
    total,
    base: baseXP,
    volume: volumeBonus,
    exercise: exerciseBonus,
    streak: streakBonus,
    completion: completionBonus,
  };
}

/**
 * Calculate XP for a single set.
 * Used for real-time XP display during workouts.
 *
 * @param weightKg - Weight in kilograms
 * @param reps - Number of reps
 * @returns XP for this set
 */
export function calculateSetXP(weightKg: number, reps: number): number {
  // Base: 10 XP per set
  const base = 10;

  // Volume contribution: sqrt(weight × reps) / 10
  const volume = Math.sqrt(weightKg * reps) / 10;

  return Math.floor(base + volume);
}

/**
 * Calculate projected XP for an in-progress workout.
 * Uses current sets without applying bonuses that require completion.
 *
 * @param sets - Current workout sets
 * @param currentStreak - Current streak count
 * @returns Projected XP breakdown
 */
export function calculateProjectedXP(
  sets: { exerciseId: string; weightKg: number; reps: number }[],
  currentStreak: number
): Omit<WorkoutXPBreakdown, 'completion' | 'total'> & { total: number } {
  const workout: WorkoutForCalculation = {
    sets,
    currentStreak,
    fullyCompleted: false,
  };

  const breakdown = calculateWorkoutXP(workout);
  const { completion, ...rest } = breakdown;

  return rest;
}

/**
 * Get the XP reward for completing a workout (minimum reward).
 * This ensures users always get some XP even for small workouts.
 *
 * @param setCount - Number of sets completed
 * @returns Minimum guaranteed XP
 */
export function getMinimumWorkoutXP(setCount: number): number {
  // Minimum 10 XP for at least one set
  if (setCount === 0) return 0;
  return Math.max(10, setCount * 5);
}

/**
 * Calculate bonus multiplier for exceptional workouts.
 * Applies for workouts with:
 * - High volume (20+ sets)
 * - High intensity (multiple heavy sets)
 * - Exercise variety (5+ unique exercises)
 *
 * @param breakdown - XP breakdown from calculateWorkoutXP
 * @returns Multiplier (1.0 - 1.5)
 */
export function getBonusMultiplier(breakdown: WorkoutXPBreakdown): number {
  let multiplier = 1.0;

  // Volume bonus: 20+ sets = 1.1x, 30+ sets = 1.15x
  if (breakdown.base >= 200) multiplier += 0.1;
  if (breakdown.base >= 300) multiplier += 0.05;

  // Exercise variety: 5+ unique = 1.1x, 8+ unique = 1.2x
  // (exerciseBonus is unique × 15, so 75 = 5 exercises, 120 = 8 exercises)
  if (breakdown.exercise >= 75) multiplier += 0.1;
  if (breakdown.exercise >= 120) multiplier += 0.1;

  // Cap multiplier at 1.5x
  return Math.min(1.5, multiplier);
}
