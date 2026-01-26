import { uid as routineUid, type Routine, type RoutineExercise } from "../routinesModel";
// [MIGRATED 2026-01-23] Using Zustand stores
import { upsertRoutine } from "../stores";
import type { PremadePlan } from "./types";

/**
 * Active plan progress tracking
 */
export interface PlanProgress {
  planId: string;
  routineId: string; // The routine created from this plan
  startedAtMs: number;
  currentDay: number;
  totalDays: number;
  completedDays: number;
  lastWorkoutAtMs: number | null;
  completionPct: number; // 0-1
}

/**
 * Convert a premade plan to a user routine
 * This creates a "My Routines" entry that tracks progress
 */
export function convertPlanToRoutine(plan: PremadePlan): { routine: Routine; progress: PlanProgress } {
  const now = Date.now();
  
  // Convert plan exercises to routine exercises
  const exercises: RoutineExercise[] = plan.exercises.map(ex => ({
    id: routineUid(),
    exerciseId: ex.exerciseId,
    targetSets: ex.targetSets,
    targetRepsMin: ex.targetRepsMin,
    targetRepsMax: ex.targetRepsMax,
    notes: ex.notes,
  }));

  // Create the routine
  const routine: Routine = {
    id: routineUid(),
    name: plan.name,
    createdAtMs: now,
    updatedAtMs: now,
    exercises,
    
    // Track source plan
    sourcePlanId: plan.id,
    sourcePlanCategory: plan.category,
  };

  // Calculate total days
  const totalDays = plan.durationWeeks * plan.daysPerWeek;

  // Create progress tracker
  const progress: PlanProgress = {
    planId: plan.id,
    routineId: routine.id,
    startedAtMs: now,
    currentDay: 1,
    totalDays,
    completedDays: 0,
    lastWorkoutAtMs: null,
    completionPct: 0,
  };

  return { routine, progress };
}

/**
 * Start a premade plan
 * - Converts to routine
 * - Saves to "My Routines"
 * - Initializes progress tracking
 */
export function startPremadePlan(plan: PremadePlan): { routine: Routine; progress: PlanProgress } {
  const { routine, progress } = convertPlanToRoutine(plan);
  
  // Save to user's routines
  upsertRoutine(routine);
  
  // Save progress (we'll add progress store in next step)
  savePlanProgress(progress);
  
  return { routine, progress };
}

/**
 * Update progress after completing a workout
 */
export function updatePlanProgress(routineId: string): void {
  const progress = getPlanProgressByRoutineId(routineId);
  if (!progress) return;

  const now = Date.now();
  const updatedProgress: PlanProgress = {
    ...progress,
    completedDays: progress.completedDays + 1,
    currentDay: Math.min(progress.currentDay + 1, progress.totalDays),
    lastWorkoutAtMs: now,
    completionPct: Math.min((progress.completedDays + 1) / progress.totalDays, 1),
  };

  savePlanProgress(updatedProgress);
}

/**
 * Calculate days remaining
 */
export function getDaysRemaining(progress: PlanProgress): number {
  return Math.max(0, progress.totalDays - progress.completedDays);
}

/**
 * Check if plan is complete
 */
export function isPlanComplete(progress: PlanProgress): boolean {
  return progress.completedDays >= progress.totalDays;
}

/**
 * Format progress for UI display
 */
export function formatProgress(progress: PlanProgress): {
  percentage: number;
  daysCompleted: number;
  totalDays: number;
  daysRemaining: number;
  displayText: string;
} {
  const percentage = Math.round(progress.completionPct * 100);
  const daysRemaining = getDaysRemaining(progress);
  
  return {
    percentage,
    daysCompleted: progress.completedDays,
    totalDays: progress.totalDays,
    daysRemaining,
    displayText: `${progress.completedDays}/${progress.totalDays} days • ${percentage}% complete`,
  };
}

// ============= Progress Storage (temporary, will create proper store next) =============

let progressMap: Record<string, PlanProgress> = {};

function savePlanProgress(progress: PlanProgress): void {
  progressMap[progress.routineId] = progress;
  // TODO: Persist to AsyncStorage
}

function getPlanProgressByRoutineId(routineId: string): PlanProgress | undefined {
  return progressMap[routineId];
}

export function getAllPlanProgress(): PlanProgress[] {
  return Object.values(progressMap);
}
