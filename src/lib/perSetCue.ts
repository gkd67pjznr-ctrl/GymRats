import type { UnitSystem } from "./buckets";
import { bucketKeyForUser, bucketValueInUserUnit } from "./buckets";
import { estimate1RM_Epley } from "./e1rm";
import { kgToLb } from "./units"; // [FIX 2026-01-23] Use canonical implementation

export type Cue = {
  message: string;
  intensity: "low" | "med" | "high";
  detail?: string; // optional second line for PR deltas, etc.
};

// [NEW 2026-01-23] InstantCue - simpler toast-friendly type (no id/duration needed)
// Note: Toast component uses "low" | "high" only, "med" maps to "high" for display
export type InstantCue = {
  message: string;
  detail?: string;
  intensity: "low" | "high";
};

export type ExerciseSessionState = {
  bestE1RMKg: number;
  bestWeightKg: number;
  bestRepsAtWeight: Record<string, number>;
};

export function makeEmptyExerciseState(): ExerciseSessionState {
  return { bestE1RMKg: 0, bestWeightKg: 0, bestRepsAtWeight: {} };
}

/**
 * Detect a SINGLE best PR cue for a working set.
 * Cardio (16+ reps) returns as LOW intensity so it behaves like fallback.
 *
 * Priority for PR cues:
 *  - weight PR (high)
 *  - rep PR at weight bucket (high)
 *  - e1RM PR (high)
 *  - otherwise null
 *
 * meta contains deltas so caller can:
 *  - decide punchy variant thresholds
 *  - print actual PR details (+3 reps, +25 lb, +15 lb e1RM)
 */
export function detectCueForWorkingSet(args: {
  weightKg: number;
  reps: number;
  unit: UnitSystem;
  exerciseName: string;
  prev: ExerciseSessionState;
}): {
  cue: Cue | null;
  next: ExerciseSessionState;
  meta: {
    isCardio: boolean;
    repDeltaAtWeight: number; // newReps - previousBestRepsAtThatBucket (0 if not PR)
    weightDeltaLb: number; // newWeight - previousBestWeight (lb)
    e1rmDeltaLb: number; // newE1RM - previousBestE1RM (lb)
    type: "none" | "weight" | "rep" | "e1rm" | "cardio";
    weightLabel: string; // e.g., "225.0 lb"
  };
} {
  const { weightKg, reps, unit, exerciseName, prev } = args;

  const next: ExerciseSessionState = {
    bestE1RMKg: prev.bestE1RMKg,
    bestWeightKg: prev.bestWeightKg,
    bestRepsAtWeight: { ...prev.bestRepsAtWeight },
  };

  const e1rmKg = estimate1RM_Epley(weightKg, reps);
  const bucketKey = bucketKeyForUser(weightKg, unit);
  const prevRepsAtBucket = next.bestRepsAtWeight[bucketKey] ?? 0;

  const prevBestWeightKg = next.bestWeightKg;
  const prevBestE1RMKg = next.bestE1RMKg;

  const isCardio = reps >= 16;

  const isWeightPR = weightKg > prevBestWeightKg;
  const isE1RMPR = e1rmKg > prevBestE1RMKg;
  const isRepPRAtWeight = reps > prevRepsAtBucket;

  const weightDeltaLb = kgToLb(Math.max(0, weightKg - prevBestWeightKg));
  const e1rmDeltaLb = kgToLb(Math.max(0, e1rmKg - prevBestE1RMKg));
  const repDeltaAtWeight = Math.max(0, reps - prevRepsAtBucket);

  const wUser = bucketValueInUserUnit(weightKg, unit);
  const weightLabel = unit === "lb" ? `${wUser.toFixed(1)} lb` : `${Math.round(wUser)} kg`;

  // update state
  if (weightKg > next.bestWeightKg) next.bestWeightKg = weightKg;
  if (e1rmKg > next.bestE1RMKg) next.bestE1RMKg = e1rmKg;
  if (reps > prevRepsAtBucket) next.bestRepsAtWeight[bucketKey] = reps;

  if (isCardio) {
    return {
      cue: { message: "YOU JUST DID CARDIO!", intensity: "low" },
      next,
      meta: {
        isCardio: true,
        repDeltaAtWeight,
        weightDeltaLb,
        e1rmDeltaLb,
        type: "cardio",
        weightLabel,
      },
    };
  }

  if (isWeightPR) {
    return {
      cue: { message: `New weight PR on ${exerciseName}!`, intensity: "high" },
      next,
      meta: {
        isCardio: false,
        repDeltaAtWeight,
        weightDeltaLb,
        e1rmDeltaLb,
        type: "weight",
        weightLabel,
      },
    };
  }

  if (isRepPRAtWeight) {
    return {
      cue: { message: `Rep PR on ${exerciseName}!`, intensity: "high" },
      next,
      meta: {
        isCardio: false,
        repDeltaAtWeight,
        weightDeltaLb,
        e1rmDeltaLb,
        type: "rep",
        weightLabel,
      },
    };
  }

  if (isE1RMPR) {
    return {
      cue: { message: `New e1RM PR on ${exerciseName}!`, intensity: "high" },
      next,
      meta: {
        isCardio: false,
        repDeltaAtWeight,
        weightDeltaLb,
        e1rmDeltaLb,
        type: "e1rm",
        weightLabel,
      },
    };
  }

  return {
    cue: null,
    next,
    meta: {
      isCardio: false,
      repDeltaAtWeight: 0,
      weightDeltaLb: 0,
      e1rmDeltaLb: 0,
      type: "none",
      weightLabel,
    },
  };
}

/** Fallback hype lines (low intensity) */
const FALLBACKS = [
  "Strong set 💪",
  "Locked in.",
  "Clean reps.",
  "That moved.",
  "Stay sharp.",
  "Nice control.",
  "Big energy.",
  "You’re cooking.",
  "Let’s go.",
  "Keep climbing.",
];

export function randomFallbackCue(): Cue {
  const i = Math.floor(Math.random() * FALLBACKS.length);
  return { message: FALLBACKS[i], intensity: "low" };
}

/** Punchy variants for BIG PRs */
const PUNCHY_REP = [
  "That’s a LEAP. 🔥",
  "You just leveled up.",
  "Big jump. Respect.",
  "That’s not luck — that’s work.",
  "Okay… you’re dangerous now.",
];

const PUNCHY_WEIGHT = [
  "HEAVY DAY. 😤",
  "New bracket unlocked.",
  "That’s a statement set.",
  "Plate math got real today.",
  "That’s how it’s done.",
];

const PUNCHY_E1RM = [
  "New ceiling unlocked.",
  "Strength is showing.",
  "That’s real progress.",
  "You’re building something serious.",
  "Engine upgrade.",
];

export function pickPunchyVariant(kind: "rep" | "weight" | "e1rm"): string {
  const pool = kind === "rep" ? PUNCHY_REP : kind === "weight" ? PUNCHY_WEIGHT : PUNCHY_E1RM;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Random int between min and max (ms) */
function randMs(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Fallback cues: 1.5–3.0s */
export function randomFallbackDurationMs(): number {
  return randMs(1500, 3000);
}

/** PR/highlight cues: 2–4s */
export function randomHighlightDurationMs(): number {
  return randMs(2000, 4000);
}

/** Random threshold: show fallback every 2–4 non-PR sets */
export function randomFallbackEveryN(): number {
  return 2 + Math.floor(Math.random() * 3); // 2,3,4
}
