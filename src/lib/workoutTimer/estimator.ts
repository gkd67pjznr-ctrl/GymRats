import type { PlanExercise } from "../premadePlans/types";
import type { LoggedSet } from "../loggerTypes";

/**
 * Workout time estimation and tracking
 */

export interface TimeEstimate {
  totalMinutes: number;
  breakdown: {
    workSets: number; // Time actually lifting
    restTime: number; // Rest between sets
    equipmentChanges: number; // Buffer for switching exercises
    setupBuffer: number; // Water, chalk, etc.
  };
}

export interface WorkoutTimer {
  startedAtMs: number;
  elapsedSeconds: number;
  estimatedTotalSeconds: number;
  estimatedFinishTime: Date;
  paceStatus: 'ahead' | 'on-pace' | 'behind' | 'way-behind';
  paceDeltaSeconds: number; // + means ahead, - means behind
  currentSetRestStartMs: number | null;
}

/**
 * Calculate estimated workout duration
 */
export function calculateWorkoutEstimate(exercises: PlanExercise[]): TimeEstimate {
  let workSets = 0;
  let restTime = 0;
  let equipmentChanges = 0;
  
  // Count total sets and rest time
  exercises.forEach((ex, idx) => {
    const totalSets = ex.targetSets;
    workSets += totalSets * 30; // Assume 30 seconds per set
    
    // Rest time (between sets, not after last set of exercise)
    const restSeconds = ex.restSeconds || 90;
    restTime += (totalSets - 1) * restSeconds;
    
    // Equipment change buffer (1 min between different exercises)
    if (idx > 0) {
      equipmentChanges += 60;
    }
  });
  
  // Base setup buffer: 5 minutes for water, chalk, warming up
  const setupBuffer = 300;
  
  const totalSeconds = workSets + restTime + equipmentChanges + setupBuffer;
  
  return {
    totalMinutes: Math.round(totalSeconds / 60),
    breakdown: {
      workSets: Math.round(workSets / 60),
      restTime: Math.round(restTime / 60),
      equipmentChanges: Math.round(equipmentChanges / 60),
      setupBuffer: Math.round(setupBuffer / 60),
    },
  };
}

/**
 * Calculate estimated duration from logged sets
 * (for free workouts without a plan)
 */
export function estimateFromLoggedSets(sets: LoggedSet[]): TimeEstimate {
  // Group by exercise
  const byExercise = new Map<string, LoggedSet[]>();
  sets.forEach(set => {
    if (!byExercise.has(set.exerciseId)) {
      byExercise.set(set.exerciseId, []);
    }
    byExercise.get(set.exerciseId)!.push(set);
  });
  
  let workSets = sets.length * 30; // 30 sec per set
  let restTime = 0;
  let equipmentChanges = (byExercise.size - 1) * 60; // 1 min between exercises
  
  // Estimate rest time: 90 seconds between sets within same exercise
  byExercise.forEach(exerciseSets => {
    restTime += (exerciseSets.length - 1) * 90;
  });
  
  const setupBuffer = 300; // 5 min base
  const totalSeconds = workSets + restTime + equipmentChanges + setupBuffer;
  
  return {
    totalMinutes: Math.round(totalSeconds / 60),
    breakdown: {
      workSets: Math.round(workSets / 60),
      restTime: Math.round(restTime / 60),
      equipmentChanges: Math.round(equipmentChanges / 60),
      setupBuffer: Math.round(setupBuffer / 60),
    },
  };
}

/**
 * Calculate current pace status
 */
export function calculatePaceStatus(
  elapsedSeconds: number,
  completedSets: number,
  totalEstimatedSets: number,
  totalEstimatedSeconds: number
): {
  status: 'ahead' | 'on-pace' | 'behind' | 'way-behind';
  deltaSeconds: number;
  percentComplete: number;
} {
  if (totalEstimatedSets === 0) {
    return { status: 'on-pace', deltaSeconds: 0, percentComplete: 0 };
  }
  
  const percentComplete = completedSets / totalEstimatedSets;
  const expectedElapsed = totalEstimatedSeconds * percentComplete;
  const deltaSeconds = expectedElapsed - elapsedSeconds;
  
  // Determine status
  let status: 'ahead' | 'on-pace' | 'behind' | 'way-behind';
  if (deltaSeconds > 180) status = 'ahead'; // More than 3 min ahead
  else if (deltaSeconds < -180) status = 'way-behind'; // More than 3 min behind
  else if (deltaSeconds < -60) status = 'behind'; // 1-3 min behind
  else status = 'on-pace';
  
  return {
    status,
    deltaSeconds: Math.round(deltaSeconds),
    percentComplete,
  };
}

/**
 * Format time for display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format duration in minutes
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Get estimated finish time
 */
export function getEstimatedFinishTime(
  startedAtMs: number,
  totalEstimatedSeconds: number,
  elapsedSeconds: number,
  paceAdjustment: number = 0
): Date {
  const remainingSeconds = totalEstimatedSeconds - elapsedSeconds + paceAdjustment;
  return new Date(Date.now() + remainingSeconds * 1000);
}

/**
 * Format estimated finish time for display
 */
export function formatFinishTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get pace message for user
 */
export function getPaceMessage(
  status: 'ahead' | 'on-pace' | 'behind' | 'way-behind',
  deltaSeconds: number
): string {
  switch (status) {
    case 'ahead':
      return `${Math.abs(Math.round(deltaSeconds / 60))} min ahead of schedule`;
    case 'on-pace':
      return 'On pace';
    case 'behind':
      return `${Math.abs(Math.round(deltaSeconds / 60))} min behind schedule`;
    case 'way-behind':
      return `${Math.abs(Math.round(deltaSeconds / 60))} min behind - speed up!`;
  }
}

/**
 * Get color for pace status
 */
export function getPaceColor(status: 'ahead' | 'on-pace' | 'behind' | 'way-behind'): string {
  switch (status) {
    case 'ahead': return '#4ECDC4'; // Green
    case 'on-pace': return '#FFA07A'; // Orange
    case 'behind': return '#FFD700'; // Yellow
    case 'way-behind': return '#FF6B6B'; // Red
  }
}
