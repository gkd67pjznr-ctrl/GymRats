import { kgToLb, lbToKg, roundToStep } from "./units";

export type UnitSystem = "kg" | "lb";

export const KG_BUCKET_STEP = 1.0;
export const LB_BUCKET_STEP = 2.5;

export function bucketValueInUserUnit(weightKg: number, userUnit: UnitSystem): number {
  if (userUnit === "kg") return roundToStep(weightKg, KG_BUCKET_STEP);
  return roundToStep(kgToLb(weightKg), LB_BUCKET_STEP);
}

export function bucketKeyForUser(weightKg: number, userUnit: UnitSystem): string {
  const v = bucketValueInUserUnit(weightKg, userUnit);
  return userUnit === "kg" ? String(Math.round(v)) : v.toFixed(1);
}

export function bucketWeightKgForUser(weightKg: number, userUnit: UnitSystem): number {
  if (userUnit === "kg") return roundToStep(weightKg, KG_BUCKET_STEP);
  const bucketLb = roundToStep(kgToLb(weightKg), LB_BUCKET_STEP);
  return lbToKg(bucketLb);
}
