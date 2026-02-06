/**
 * Estimate 1-rep max using the Epley formula
 *
 * Formula: e1RM = weight * (1 + reps/30)
 *
 * @param weightKg - Weight lifted in kilograms
 * @param reps - Number of repetitions performed
 * @returns Estimated 1-rep max in kilograms, or 0 for invalid inputs
 */
export function estimate1RM_Epley(weightKg: number, reps: number): number {
  // Guard against invalid inputs
  if (weightKg <= 0 || reps <= 0) return 0;
  if (!Number.isFinite(weightKg) || !Number.isFinite(reps)) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}
