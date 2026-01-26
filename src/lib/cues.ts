import type { UnitSystem } from "./buckets";
import { bucketValueInUserUnit } from "./buckets";
import type { Cue } from "./perSetCue";

// [FIX 2026-01-23] Consolidated type - use Cue from perSetCue.ts
// CueEvent is kept as alias for backwards compatibility
export type CueEvent = Cue;

export function cardioCue(reps: number): CueEvent | null {
  if (reps >= 16) {
    return { message: "Did you just do cardio?", intensity: "med" };
  }
  return null;
}

export function repAtWeightCue(args: {
  weightKg: number;
  reps: number;
  unit: UnitSystem;
}): CueEvent {
  const w = bucketValueInUserUnit(args.weightKg, args.unit);
  const label = args.unit === "lb" ? `${w.toFixed(1)} lb` : `${Math.round(w)} kg`;
  return { message: `Rep PR at ${label}!`, intensity: "high" };
}
