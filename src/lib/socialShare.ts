// src/lib/socialShare.ts
import { EXERCISES_V1 } from "../data/exercises";
import type { WorkoutSession } from "./workoutModel";
import { kgToLb } from "./units";
import type { PrivacyLevel, WorkoutSnapshot, WorkoutPost } from "./socialModel";
import { createPost } from "./socialStore";

function exerciseName(exerciseId: string): string {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

function estimateE1RMlb(weightLb: number, reps: number): number {
  if (!weightLb || reps <= 0) return 0;
  // Epley
  return weightLb * (1 + reps / 30);
}

function bestSetForExercise(session: WorkoutSession, exerciseId: string) {
  const sets = session.sets.filter((s) => s.exerciseId === exerciseId);
  if (sets.length === 0) return null;

  let best = sets[0];
  let bestE1 = estimateE1RMlb(kgToLb(best.weightKg), best.reps);

  for (const s of sets) {
    const e1 = estimateE1RMlb(kgToLb(s.weightKg), s.reps);
    if (e1 > bestE1) {
      best = s;
      bestE1 = e1;
    }
  }

  const wLb = kgToLb(best.weightKg);
  return {
    weightLabel: `${Math.round(wLb)} lb`,
    reps: best.reps,
    e1rmLabel: bestE1 > 0 ? `${Math.round(bestE1)} lb` : undefined,
  };
}

function buildSnapshot(session: WorkoutSession): WorkoutSnapshot {
  const seen = new Set<string>();
  const orderedExerciseIds: string[] = [];

  for (const s of session.sets) {
    if (!seen.has(s.exerciseId)) {
      seen.add(s.exerciseId);
      orderedExerciseIds.push(s.exerciseId);
    }
  }

  const topLines = orderedExerciseIds.slice(0, 6).map((exerciseId) => ({
    exerciseName: exerciseName(exerciseId),
    bestSet: bestSetForExercise(session, exerciseId) ?? undefined,
  }));

  return {
    routineName: session.routineName,
    topLines,
  };
}

export type CreateWorkoutPostOptions = {
  myUserId: string;
  myDisplayName: string;
  myAvatarUrl?: string;

  privacy: PrivacyLevel; // "public" | "friends"
  title?: string;
  caption?: string;

  includeSnapshot?: boolean; // default true
};

export function postWorkoutSessionToFeed(session: WorkoutSession, opts: CreateWorkoutPostOptions): WorkoutPost {
  const durationSec = Math.max(0, Math.round((session.endedAtMs - session.startedAtMs) / 1000));

  const uniqueExercises = new Set(session.sets.map((s) => s.exerciseId));
  const exerciseCount = uniqueExercises.size;
  const setCount = session.sets.length;

  const post = createPost({
    authorUserId: opts.myUserId,
    authorDisplayName: opts.myDisplayName,
    authorAvatarUrl: opts.myAvatarUrl,

    privacy: opts.privacy,
    createdAtMs: Date.now(),

    title: opts.title ?? session.routineName ?? "Workout",
    caption: opts.caption,

    durationSec,
    completionPct: session.completionPct,
    exerciseCount,
    setCount,

    workoutSnapshot: opts.includeSnapshot === false ? undefined : buildSnapshot(session),
  });

  return post;
}
