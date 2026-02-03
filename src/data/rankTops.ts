/**
 * Verified Top Standards for Forgerank Scoring
 *
 * These are the world-class, verified e1RM standards used to calculate
 * Forgerank scores. They are STATIC and based on verified, video'd lifts.
 *
 * This is a core differentiator: users compare against REAL standards,
 * not inflated user-submitted data.
 *
 * The verified tops are now sourced from the exercise database.
 * Use the exerciseDatabase module for direct access.
 */

// Re-export from exerciseDatabase for backwards compatibility
export {
  VERIFIED_TOPS,
  VERIFIED_TOPS as RANK_TOPS,
  getVerifiedTop,
  hasVerifiedTop,
  getAllVerifiedTops,
  getVerifiedExerciseIds,
} from './exerciseDatabase';

// Re-export types
export type { VerifiedTop } from './exerciseTypes';

// === Legacy Type Export (for backwards compatibility) ===
// These old IDs are still supported via the exerciseDatabase's legacy ID resolution
export type CoreLiftId =
  // New exercise database IDs
  | 'Barbell_Bench_Press_-_Medium_Grip'
  | 'Barbell_Full_Squat'
  | 'Barbell_Deadlift'
  | 'Standing_Military_Press'
  | 'Bent_Over_Barbell_Row'
  | 'Pullups'
  // Legacy IDs still supported
  | 'bench_press'
  | 'squat'
  | 'deadlift'
  | 'overhead_press'
  | 'barbell_row'
  | 'pullup_weighted'
  | 'bench'
  | 'ohp'
  | 'row'
  | 'pullup';
