// src/lib/workoutReplay/replayService.ts
// Service for preparing workout data for replay

import type { WorkoutSession, WorkoutSet } from '../workoutModel';
import type { WorkoutReplay, ReplayExercise, ReplayPR, ReplayRankChange } from './replayTypes';
import { EXERCISES_V1 } from '../../data/exercises';
import { detectCueForWorkingSet } from '../perSetCue';
import { scoreForgerank, scoreFromE1rm } from '../forgerankScoring';
import { estimate1RM_Epley } from '../e1rm';
import { getCurrentBuddy } from '../buddyEngine';
import { formatCueMessage } from '../buddyEngine';
import type { CueMessage } from '../buddyTypes';

// Helper to get exercise name
function getExerciseName(exerciseId: string): string {
  return EXERCISES_V1.find(e => e.id === exerciseId)?.name || exerciseId;
}

// Helper to group sets by exercise
function groupSetsByExercise(sets: WorkoutSet[]): Record<string, WorkoutSet[]> {
  return sets.reduce((acc, set) => {
    if (!acc[set.exerciseId]) {
      acc[set.exerciseId] = [];
    }
    acc[set.exerciseId].push(set);
    return acc;
  }, {} as Record<string, WorkoutSet[]>);
}

// Helper to detect PRs in a workout
function detectPRsInWorkout(sets: WorkoutSet[]): ReplayPR[] {
  const prs: ReplayPR[] = [];
  const exerciseState: Record<string, { bestWeightKg: number; bestE1RMKg: number; bestRepsAtWeight: Record<string, number> }> = {};

  // Initialize state for each exercise
  const groupedSets = groupSetsByExercise(sets);
  Object.keys(groupedSets).forEach(exerciseId => {
    exerciseState[exerciseId] = {
      bestWeightKg: 0,
      bestE1RMKg: 0,
      bestRepsAtWeight: {}
    };
  });

  // Process sets in order to detect PRs
  sets.forEach((set, index) => {
    const state = exerciseState[set.exerciseId];
    if (!state) return;

    const result = detectCueForWorkingSet({
      weightKg: set.weightKg,
      reps: set.reps,
      unit: 'lb', // Default to lb for now
      exerciseName: getExerciseName(set.exerciseId),
      prev: state
    });

    // Update state with new bests
    state.bestWeightKg = result.next.bestWeightKg;
    state.bestE1RMKg = result.next.bestE1RMKg;
    state.bestRepsAtWeight = result.next.bestRepsAtWeight;

    // If this set resulted in a PR, add it to our list
    if (result.meta.type !== 'none' && result.meta.type !== 'cardio') {
      prs.push({
        exerciseId: set.exerciseId,
        type: result.meta.type,
        value: result.meta.type === 'weight' ? result.meta.weightDeltaLb :
               result.meta.type === 'e1rm' ? result.meta.e1rmDeltaLb :
               result.meta.repDeltaAtWeight,
        previousBest: 0, // This would need to be calculated from user history
        setIndex: index
      });
    }
  });

  return prs;
}

// Helper to detect rank changes (simplified for now)
function detectRankChanges(sets: WorkoutSet[]): ReplayRankChange[] {
  // In a real implementation, this would compare previous ranks with new ranks
  // For now, we'll return an empty array as rank change detection is complex
  // and would require access to user's historical data
  return [];
}

// Helper to create exercise summary
function createExerciseSummary(exerciseId: string, sets: WorkoutSet[]): ReplayExercise {
  const exerciseName = getExerciseName(exerciseId);

  // Find the best set (by e1RM)
  let bestSet = sets[0];
  let maxE1RM = estimate1RM_Epley(sets[0].weightKg, sets[0].reps);

  sets.forEach(set => {
    const e1RM = estimate1RM_Epley(set.weightKg, set.reps);
    if (e1RM > maxE1RM) {
      maxE1RM = e1RM;
      bestSet = set;
    }
  });

  // Calculate total volume (weight × reps for all sets)
  const totalVolume = sets.reduce((sum, set) => sum + (set.weightKg * set.reps), 0);

  return {
    exerciseId,
    exerciseName,
    sets: sets.length,
    bestSet: {
      weight: bestSet.weightKg,
      reps: bestSet.reps
    },
    totalVolume
  };
}

// Generate a buddy sign-off message
function generateBuddySignOff(session: WorkoutSession): string {
  const buddy = getCurrentBuddy();
  if (!buddy) {
    return "Great workout! Keep it up!";
  }

  // For now, we'll use a simple message. In a real implementation,
  // we would use the buddy engine to generate a contextually appropriate message
  return `Awesome session! You crushed it today. ${buddy.name} is proud of your effort!`;
}

// Main function to prepare workout replay data
export function prepareWorkoutReplay(session: WorkoutSession): WorkoutReplay {
  const groupedSets = groupSetsByExercise(session.sets);

  // Create exercise summaries
  const exercises: ReplayExercise[] = Object.entries(groupedSets).map(([exerciseId, sets]) =>
    createExerciseSummary(exerciseId, sets)
  );

  // Calculate total volume
  const totalVolume = session.sets.reduce((sum, set) => sum + (set.weightKg * set.reps), 0);

  // Detect PRs
  const prsAchieved = detectPRsInWorkout(session.sets);

  // Detect rank changes
  const rankChanges = detectRankChanges(session.sets);

  // Generate buddy sign-off
  const buddySignOff = generateBuddySignOff(session);
  const buddy = getCurrentBuddy();

  return {
    sessionId: session.id,
    userId: session.userId,
    startedAtMs: session.startedAtMs,
    endedAtMs: session.endedAtMs,
    durationMs: session.endedAtMs - session.startedAtMs,
    exercises,
    totalVolume,
    setCount: session.sets.length,
    prsAchieved,
    rankChanges,
    buddySignOff,
    buddyId: buddy?.id || 'coach',
    buddyName: buddy?.name || 'Coach',
    buddyTier: buddy?.tier || 'basic'
  };
}

// Helper function to format duration
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}