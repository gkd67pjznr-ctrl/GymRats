/**
 * Exercise Database Types
 *
 * Types for the free-exercise-db integration.
 * Source: https://github.com/yuhonas/free-exercise-db
 */

/**
 * Raw exercise type from the free-exercise-db
 */
export type RawExercise = {
  id: string;
  name: string;
  force: 'push' | 'pull' | 'static';
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic: 'compound' | 'isolation';
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: 'strength' | 'stretching' | 'cardio' | 'plyometrics' | 'strongman' | 'powerlifting' | 'olympic weightlifting';
  images: string[];
};

/**
 * Muscle groups available in the database
 */
export type MuscleGroup =
  | 'abdominals'
  | 'abductors'
  | 'adductors'
  | 'biceps'
  | 'calves'
  | 'chest'
  | 'forearms'
  | 'glutes'
  | 'hamstrings'
  | 'lats'
  | 'lower back'
  | 'middle back'
  | 'neck'
  | 'quadriceps'
  | 'shoulders'
  | 'traps'
  | 'triceps';

/**
 * Enhanced exercise type used throughout GymRats
 */
export type GrExercise = {
  id: string;
  name: string;
  force: 'push' | 'pull' | 'static';
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic: 'compound' | 'isolation';
  equipment: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  instructions: string[];
  category: 'strength' | 'stretching' | 'cardio' | 'plyometrics' | 'strongman' | 'powerlifting' | 'olympic weightlifting';
  images: string[];

  // GymRats-specific fields
  isPopular: boolean; // Shown in quick picker
  verifiedTop?: number; // Verified e1RM in kg (if applicable)

  // Legacy ID support for backwards compatibility
  legacyIds?: string[];
};

/**
 * Verified top standard for an exercise
 */
export type VerifiedTop = {
  exerciseId: string;
  displayName: string;
  topE1RMKg: number;
  notes?: string;
};
