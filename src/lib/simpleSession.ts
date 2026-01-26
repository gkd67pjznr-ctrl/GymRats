import type { UnitSystem } from "./buckets";
import { bucketKeyForUser } from "./buckets";
import { cardioCue, repAtWeightCue } from "./cues";
import { estimate1RM_Epley } from "./e1rm";
import type { LoggedSet } from "./loggerTypes";
import type { Cue } from "./perSetCue";

export type ExerciseSummary = {
  bestE1RMKg: number;
  bestRepsAtWeight: Record<string, number>;
};

// [FIX 2026-01-23] Consolidated type - use Cue from perSetCue.ts
export type CueEvent = Cue;

/**
 * Pure function: given sets for ONE exercise in chronological order,
 * generate cues based on PRs within-session (and vs previous summary if provided).
 *
 * v1: only Rep PR at weight + Cardio cue. (Easy to add weight PR/e1RM PR later.)
 */
export function generateCuesForExerciseSession(args: {
  exerciseId: string;
  sets: LoggedSet[];
  unit: UnitSystem;
  previous?: ExerciseSummary;
}): CueEvent[] {
  const { exerciseId, sets, unit, previous } = args;

  const temp: ExerciseSummary = previous
    ? { bestE1RMKg: previous.bestE1RMKg, bestRepsAtWeight: { ...previous.bestRepsAtWeight } }
    : { bestE1RMKg: 0, bestRepsAtWeight: {} };

  const cues: CueEvent[] = [];

  for (const s of sets) {
    if (s.setType !== "working") continue;

    // Cardio cue
    const c = cardioCue(s.reps);
    if (c) cues.push(c);

    // Rep PR at this bucketed weight
    const key = bucketKeyForUser(s.weightKg, unit);
    const prevReps = temp.bestRepsAtWeight[key] ?? 0;
    if (s.reps > prevReps) {
      cues.push(repAtWeightCue({ weightKg: s.weightKg, reps: s.reps, unit }));
      temp.bestRepsAtWeight[key] = s.reps;
    }

    // Track best e1RM in case you want to add e1RM PR cues next
    const e1 = estimate1RM_Epley(s.weightKg, s.reps);
    if (e1 > temp.bestE1RMKg) temp.bestE1RMKg = e1;
  }

  // Session complete cue
  cues.push({
    message: `Session complete — ${cues.length} cue${cues.length === 1 ? "" : "s"}.`,
    intensity: cues.length > 1 ? "high" : "low",
  });

  return cues.map((x) => ({ ...x, message: x.message })); // return copy
}

/**
 * Utility: group sets by exerciseId
 */
export function groupSetsByExercise(sets: LoggedSet[]): Record<string, LoggedSet[]> {
  const map: Record<string, LoggedSet[]> = {};
  for (const s of sets) {
    (map[s.exerciseId] ||= []).push(s);
  }
  // keep chronological
  for (const k of Object.keys(map)) {
    map[k].sort((a, b) => a.timestampMs - b.timestampMs);
  }
  return map;
}