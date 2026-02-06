import type { UnitSystem } from "./buckets";
import { bucketKeyForUser, bucketValueInUserUnit } from "./buckets";
import { estimate1RM_Epley } from "./e1rm";
import { kgToLb } from "./units"; // [FIX 2026-01-23] Use canonical implementation

// Import and re-export types from centralized types file
import type {
  Cue,
  InstantCue,
  ExerciseSessionState,
  DetectCueParams,
  DetectCueResult,
  DetectCueMeta,
  PRType,
  CelebrationTier,
} from "./perSetCueTypes";

export type {
  Cue,
  InstantCue,
  ExerciseSessionState,
  DetectCueParams,
  DetectCueResult,
  DetectCueMeta,
  PRType,
  CelebrationTier,
};

/**
 * Calculate celebration tier based on delta magnitude (in lb)
 *
 * Tier 1: Small PR (0-5 lb)
 * Tier 2: Medium PR (5-10 lb)
 * Tier 3: Big PR (10-20 lb)
 * Tier 4: Massive PR (20+ lb)
 */
function calculateTier(deltaLb: number): CelebrationTier {
  if (deltaLb < 5) return 1;
  if (deltaLb < 10) return 2;
  if (deltaLb < 20) return 3;
  return 4;
}

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
}): DetectCueResult {
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
        tier: 1 as CelebrationTier, // Cardio doesn't have meaningful tier
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
        tier: calculateTier(weightDeltaLb),
      },
    };
  }

  if (isRepPRAtWeight) {
    // For rep PRs, use e1RM delta if available, otherwise scale rep delta
    // Rep delta of 2-3 is like 5-10 lb e1RM gain
    const effectiveDelta = e1rmDeltaLb > 0 ? e1rmDeltaLb : repDeltaAtWeight * 3;
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
        tier: calculateTier(effectiveDelta),
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
        tier: calculateTier(e1rmDeltaLb),
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
      tier: 1 as CelebrationTier, // No PR, default to tier 1
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
  "That's real progress.",
  "You're building something serious.",
  "Engine upgrade.",
];

/** Recovery PR variants - for comeback after decline */
const PUNCHY_RECOVERY = [
  "Welcome back to the top. 👑",
  "The comeback is REAL.",
  "You never lost it. You just took a break.",
  "Peak strength: RESTORED.",
  "That's how legends return.",
  "Stronger than before the setback.",
  "Recovery complete. 💪",
];

export function pickPunchyVariant(kind: "rep" | "weight" | "e1rm" | "recovery"): string {
  const pool =
    kind === "rep"
      ? PUNCHY_REP
      : kind === "weight"
        ? PUNCHY_WEIGHT
        : kind === "recovery"
          ? PUNCHY_RECOVERY
          : PUNCHY_E1RM;
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
