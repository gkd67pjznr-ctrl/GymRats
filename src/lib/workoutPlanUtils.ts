import type { WorkoutPlan } from "./workoutPlanModel";

export function totalPlannedSets(plan: WorkoutPlan): number {
  return plan.exercises.reduce((sum, e) => sum + Math.max(0, e.targetSets || 0), 0);
}

export function completedPlannedSets(plan: WorkoutPlan): number {
  let sum = 0;
  for (const ex of plan.exercises) {
    sum += Math.max(0, plan.completedSetsByExerciseId[ex.exerciseId] ?? 0);
  }
  return sum;
}

export function completionPct(plan: WorkoutPlan): number {
  const total = totalPlannedSets(plan);
  if (total <= 0) return 0;
  const done = completedPlannedSets(plan);
  return Math.max(0, Math.min(1, done / total));
}

export function clampPlanIndex(plan: WorkoutPlan, index: number): number {
  return Math.max(0, Math.min(plan.exercises.length - 1, index));
}
