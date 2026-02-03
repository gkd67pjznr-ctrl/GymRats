// src/lib/workoutPostGenerator.ts
// Generate social posts from workout sessions

import type { WorkoutSession } from './workoutModel';
import type { WorkoutPost, WorkoutSnapshot } from './socialModel';
import { EXERCISES_V1 } from '@/src/data/exercises';
import { scoreGymRank, type Tier } from './GrScoring';
import { buildRankLadderFromTop } from './ranks';
import { VERIFIED_TOPS, type VerifiedTop } from '@/src/data/exerciseDatabase';

/**
 * Generate a workout snapshot from a workout session
 * This creates a compact representation of the workout for feed display
 */
export function generateWorkoutSnapshot(session: WorkoutSession): WorkoutSnapshot {
  // Group sets by exercise
  const exerciseSets = new Map<string, typeof session.sets>();

  for (const set of session.sets) {
    if (!exerciseSets.has(set.exerciseId)) {
      exerciseSets.set(set.exerciseId, []);
    }
    exerciseSets.get(set.exerciseId)!.push(set);
  }

  // Find top exercises by best e1RM
  const topLines: WorkoutSnapshot['topLines'] = [];

  for (const [exerciseId, sets] of exerciseSets.entries()) {
    // Find best set for this exercise
    let bestSet = sets[0];
    let bestE1RM = 0;

    for (const set of sets) {
      const e1rmKg = set.weightKg * (1 + set.reps / 30);
      if (e1rmKg > bestE1RM) {
        bestE1RM = e1rmKg;
        bestSet = set;
      }
    }

    // Get exercise name
    const exercise = EXERCISES_V1.find(e => e.id === exerciseId);
    const exerciseName = exercise?.name ?? exerciseId;

    // Format weight label (simplified - would use user's unit preference)
    const weightLabel = `${bestSet.weightKg}kg`;
    const reps = bestSet.reps;

    topLines.push({
      exerciseName,
      bestSet: {
        weightLabel,
        reps,
        e1rmLabel: `${Math.round(bestE1RM)}kg`,
      },
    });
  }

  // Sort by e1RM descending and take top 3
  topLines.sort((a, b) => {
    const aE1rm = parseFloat(a.bestSet?.e1rmLabel?.replace('kg', '') ?? '0');
    const bE1rm = parseFloat(b.bestSet?.e1rmLabel?.replace('kg', '') ?? '0');
    return bE1rm - aE1rm;
  });

  return {
    routineName: session.routineName,
    topLines: topLines.slice(0, 3),
  };
}

/**
 * Generate a title for the workout post
 */
export function generateWorkoutTitle(session: WorkoutSession): string {
  const exerciseCount = new Set(session.sets.map(s => s.exerciseId)).size;
  const setCount = session.sets.length;

  if (session.routineName) {
    return session.routineName;
  }

  const exercises = Array.from(new Set(session.sets.map(s => s.exerciseId)));
  const primaryExercise = exercises[0];
  const exercise = EXERCISES_V1.find(e => e.id === primaryExercise);

  if (exercise) {
    return `${exercise.name} Session`;
  }

  return `${exerciseCount} Exercise${exerciseCount > 1 ? 's' : ''}`;
}

/**
 * Generate a caption for the workout post
 */
export function generateWorkoutCaption(session: WorkoutSession): string {
  const exerciseCount = new Set(session.sets.map(s => s.exerciseId)).size;
  const setCount = session.sets.length;
  const durationMin = Math.round((session.endedAtMs - session.startedAtMs) / 60000);

  const parts: string[] = [];

  if (exerciseCount > 0) {
    parts.push(`${exerciseCount} exercise${exerciseCount > 1 ? 's' : ''}`);
  }

  if (setCount > 0) {
    parts.push(`${setCount} set${setCount > 1 ? 's' : ''}`);
  }

  if (durationMin > 0) {
    parts.push(`${durationMin} minutes`);
  }

  return parts.length > 0 ? parts.join(' • ') : 'Just finished a workout!';
}

/**
 * Calculate the best tier achieved in a workout session
 */
export function calculateBestTierForSession(
  session: WorkoutSession,
  bodyweightKg?: number
): Tier | null {
  let bestTier: Tier = 'Iron';
  let bestScore = 0;

  // Get unique exercises
  const exerciseIds = Array.from(new Set(session.sets.map(s => s.exerciseId)));

  for (const exerciseId of exerciseIds) {
    // Find best set for this exercise
    const exerciseSets = session.sets.filter(s => s.exerciseId === exerciseId);
    let bestSet = exerciseSets[0];
    let bestE1RM = 0;

    for (const set of exerciseSets) {
      const e1rmKg = set.weightKg * (1 + set.reps / 30);
      if (e1rmKg > bestE1RM) {
        bestE1RM = e1rmKg;
        bestSet = set;
      }
    }

    // Get the verified top for this exercise
    const rankTop = VERIFIED_TOPS.find(t => t.exerciseId === exerciseId);
    if (!rankTop) continue;

    // Build rank ladder
    const ladder = buildRankLadderFromTop({
      exerciseId,
      topE1RMKg: rankTop.topE1RMKg,
    });

    // Calculate score
    const score = bestE1RM / rankTop.topE1RMKg * 1000;

    if (score > bestScore) {
      bestScore = score;
      // GymRank scoring would be more accurate here
      const breakdown = scoreGymRank({
        exerciseId,
        weight: bestSet.weightKg,
        reps: bestSet.reps,
        unit: 'kg',
        bodyweightKg,
      });
      bestTier = breakdown.tier;
    }
  }

  return bestTier;
}

/**
 * Create a WorkoutPost from a WorkoutSession
 * This is used when sharing a workout to the feed
 */
export function createWorkoutPostFromSession(args: {
  session: WorkoutSession;
  authorUserId: string;
  authorDisplayName: string;
  authorAvatarUrl?: string;
  privacy: 'public' | 'friends';
  caption?: string; // Optional custom caption
  bodyweightKg?: number;
}): Omit<WorkoutPost, 'id' | 'likeCount' | 'commentCount'> {
  const { session, authorUserId, authorDisplayName, authorAvatarUrl, privacy, caption, bodyweightKg } = args;

  const workoutSnapshot = generateWorkoutSnapshot(session);
  const title = generateWorkoutTitle(session);
  const defaultCaption = generateWorkoutCaption(session);

  return {
    authorUserId,
    authorDisplayName,
    authorAvatarUrl,
    privacy,
    createdAtMs: session.endedAtMs,
    title,
    caption: caption || defaultCaption,
    durationSec: Math.round((session.endedAtMs - session.startedAtMs) / 1000),
    exerciseCount: new Set(session.sets.map(s => s.exerciseId)).size,
    setCount: session.sets.length,
    completionPct: session.completionPct,
    workoutSnapshot,
  };
}

/**
 * Detect milestones achieved in a workout session
 * Used for auto-posting celebrations
 */
export interface WorkoutMilestone {
  type: 'rank_up' | 'weight_pr' | 'rep_pr' | 'e1rm_pr' | 'streak' | 'volume';
  exerciseId?: string;
  exerciseName?: string;
  message: string;
  tier?: Tier;
}

export function detectWorkoutMilestones(args: {
  session: WorkoutSession;
  previousBests?: Record<string, { weightKg: number; reps: number; e1rmKg: number }>;
  currentStreak?: number;
}): WorkoutMilestone[] {
  const { session, previousBests = {}, currentStreak = 0 } = args;
  const milestones: WorkoutMilestone[] = [];

  // Check for PRs
  for (const set of session.sets) {
    const e1rmKg = set.weightKg * (1 + set.reps / 30);
    const previous = previousBests[set.exerciseId];

    if (previous) {
      // Weight PR
      if (set.weightKg > previous.weightKg) {
        const exercise = EXERCISES_V1.find(e => e.id === set.exerciseId);
        milestones.push({
          type: 'weight_pr',
          exerciseId: set.exerciseId,
          exerciseName: exercise?.name,
          message: `New weight PR on ${exercise?.name || set.exerciseId}! 🏋️`,
        });
      }

      // Rep PR at same or higher weight
      if (set.weightKg >= previous.weightKg && set.reps > previous.reps) {
        const exercise = EXERCISES_V1.find(e => e.id === set.exerciseId);
        if (!milestones.find(m => m.type === 'rep_pr' && m.exerciseId === set.exerciseId)) {
          milestones.push({
            type: 'rep_pr',
            exerciseId: set.exerciseId,
            exerciseName: exercise?.name,
            message: `New rep PR on ${exercise?.name || set.exerciseId}! 💪`,
          });
        }
      }

      // e1RM PR
      if (e1rmKg > previous.e1rmKg) {
        const exercise = EXERCISES_V1.find(e => e.id === set.exerciseId);
        if (!milestones.find(m => m.type === 'e1rm_pr' && m.exerciseId === set.exerciseId)) {
          milestones.push({
            type: 'e1rm_pr',
            exerciseId: set.exerciseId,
            exerciseName: exercise?.name,
            message: `New e1RM PR on ${exercise?.name || set.exerciseId}! ⚡`,
          });
        }
      }
    }
  }

  // Streak milestone
  if (currentStreak > 0 && currentStreak % 7 === 0) {
    milestones.push({
      type: 'streak',
      message: `${currentStreak} day workout streak! Keep it up! 🔥`,
    });
  }

  // Volume milestone (total volume > X kg)
  const totalVolume = session.sets.reduce((sum, set) => sum + (set.weightKg * set.reps), 0);
  if (totalVolume > 10000) { // 10,000 kg volume
    milestones.push({
      type: 'volume',
      message: `Crushed ${Math.round(totalVolume / 1000)}k kg volume today! 💎`,
    });
  }

  return milestones;
}
