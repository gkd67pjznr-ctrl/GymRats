export type CoreLiftId =
  | "bench_press"
  | "squat"
  | "deadlift"
  | "overhead_press"
  | "barbell_row"
  | "pullup_weighted";

export type VerifiedTop = {
  liftId: CoreLiftId;
  displayName: string;

  /**
   * Verified top-end (hard set by you)
   * Use 1RM equivalent in kilograms for consistency.
   */
  topE1RMKg: number;
};

export const VERIFIED_TOPS: VerifiedTop[] = [
  { liftId: "bench_press", displayName: "Bench Press", topE1RMKg: 355 }, // placeholder
  { liftId: "squat", displayName: "Back Squat", topE1RMKg: 525 }, // placeholder
  { liftId: "deadlift", displayName: "Deadlift", topE1RMKg: 540 }, // placeholder
  { liftId: "overhead_press", displayName: "Overhead Press", topE1RMKg: 228 }, // placeholder
  { liftId: "barbell_row", displayName: "Barbell Row", topE1RMKg: 300 }, // placeholder
  { liftId: "pullup_weighted", displayName: "Weighted Pull-Up", topE1RMKg: 200 }, // placeholder
];
