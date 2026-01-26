import type { Routine } from "../../routinesModel";
import type { LoggedSet } from "../../loggerTypes";
import type { WorkoutPlan } from "../../workoutPlanModel";

/**
 * Calculate routine progress based on completed sets vs target sets
 *
 * @param routine - The routine with target sets per exercise
 * @param loggedSets - Sets logged during the workout
 * @returns Progress metrics with completed count, total target, and percentage
 */
export function calculateRoutineProgress(
  routine: Routine,
  loggedSets: LoggedSet[]
): { completed: number; total: number; percent: number } {
  const total = routine.exercises.reduce((sum, ex) => sum + (ex.targetSets || 0), 0);

  const completed = loggedSets.filter((set) =>
    routine.exercises.some((ex) => ex.id === set.exerciseId)
  ).length;

  const percent = total > 0 ? completed / total : 0;

  return { completed, total, percent };
}

/**
 * Calculate workout plan progress
 *
 * @param plan - The workout plan with exercises and targets
 * @param loggedSets - Sets logged during the workout
 * @returns Progress metrics with completed count, total target, and percentage
 */
export function calculatePlanProgress(
  plan: WorkoutPlan | null,
  loggedSets: LoggedSet[]
): { completed: number; total: number; percent: number } {
  if (!plan || plan.exercises.length === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }

  const total = plan.exercises.reduce((sum, ex) => sum + (ex.targetSets || 0), 0);

  const completed = loggedSets.filter((set) =>
    plan.exercises.some((ex) => ex.exerciseId === set.exerciseId)
  ).length;

  const percent = total > 0 ? completed / total : 0;

  return { completed, total, percent };
}

/**
 * Calculate exercise-specific progress
 *
 * @param exerciseId - The exercise ID to calculate progress for
 * @param targetSets - Target number of sets for this exercise
 * @param loggedSets - All logged sets (will be filtered by exerciseId)
 * @returns Progress metrics for this specific exercise
 */
export function calculateExerciseProgress(
  exerciseId: string,
  targetSets: number,
  loggedSets: LoggedSet[]
): { completed: number; total: number; percent: number } {
  const completed = loggedSets.filter((s) => s.exerciseId === exerciseId).length;
  const total = targetSets;
  const percent = total > 0 ? Math.min(completed / total, 1) : 0;

  return { completed, total, percent };
}

/**
 * Format progress as a percentage string
 *
 * @param percent - Progress value between 0 and 1
 * @returns Formatted percentage string (e.g., "50%")
 */
export function formatProgressPercent(percent: number): string {
  return `${Math.round(percent * 100)}%`;
}
