/**
 * Exercise Database
 *
 * Integration with free-exercise-db (873 exercises)
 * Source: https://github.com/yuhonas/free-exercise-db
 *
 * This module provides:
 * - Full exercise database with 873 exercises
 * - Popular exercises list for quick picker
 * - Legacy ID support for backwards compatibility
 * - Verified top standards for scoring
 */

import type { GrExercise, MuscleGroup, VerifiedTop } from './exerciseTypes';

// Re-export the type for consumers
export type { GrExercise };

// Import raw exercise data
const RAW_EXERCISES: RawExercise[] = require('./exercises-raw.json');

type RawExercise = {
  id: string;
  name: string;
  force: 'push' | 'pull' | 'static';
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic: 'compound' | 'isolation';
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: 'strength' | 'stretching' | 'cardio' | 'plyometrics';
  images: string[];
};

// === Popular Exercises ===
// These are shown in the quick picker and have legacy ID support
const POPULAR_EXERCISE_IDS = new Set<string>([
  'Barbell_Bench_Press_-_Medium_Grip',
  'Barbell_Full_Squat',
  'Barbell_Deadlift',
  'Standing_Military_Press',
  'Bent_Over_Barbell_Row',
  'Pullups',
  'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'Romanian_Deadlift',
  'Leg_Press',
  'Wide-Grip_Lat_Pulldown',
]);

// === Legacy ID Mappings ===
// Maps old GymRats IDs to new exercise database IDs
const LEGACY_ID_MAP: Record<string, string> = {
  // Core lifts
  'bench': 'Barbell_Bench_Press_-_Medium_Grip',
  'bench_press': 'Barbell_Bench_Press_-_Medium_Grip',
  'squat': 'Barbell_Full_Squat',
  'deadlift': 'Barbell_Deadlift',
  'ohp': 'Standing_Military_Press',
  'overhead_press': 'Standing_Military_Press',
  'row': 'Bent_Over_Barbell_Row',
  'barbell_row': 'Bent_Over_Barbell_Row',
  'pullup': 'Pullups',
  'pullup_weighted': 'Pullups',

  // Secondary lifts
  'incline_bench': 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'rdl': 'Romanian_Deadlift',
  'leg_press': 'Leg_Press',
  'lat_pulldown': 'Wide-Grip_Lat_Pulldown',
};

// === Verified Top Standards ===
// These are the world-class, verified e1RM standards used for scoring
export const VERIFIED_TOPS: VerifiedTop[] = [
  {
    exerciseId: 'Barbell_Bench_Press_-_Medium_Grip',
    displayName: 'Bench Press',
    topE1RMKg: 355, // ~782 lbs - Julius Maddox territory
    notes: 'Raw bench press, competition standard',
  },
  {
    exerciseId: 'Barbell_Full_Squat',
    displayName: 'Back Squat',
    topE1RMKg: 525, // ~1157 lbs - Ray Williams territory
    notes: 'Raw squat, competition depth',
  },
  {
    exerciseId: 'Barbell_Deadlift',
    displayName: 'Deadlift',
    topE1RMKg: 540, // ~1190 lbs - Hafthor/Eddie Hall territory
    notes: 'Conventional or sumo, competition standard',
  },
  {
    exerciseId: 'Standing_Military_Press',
    displayName: 'Overhead Press',
    topE1RMKg: 228, // ~502 lbs - strict press world class
    notes: 'Strict press, no leg drive',
  },
  {
    exerciseId: 'Bent_Over_Barbell_Row',
    displayName: 'Barbell Row',
    topE1RMKg: 300, // ~661 lbs - estimated world class
    notes: 'Strict form, chest-supported reference',
  },
  {
    exerciseId: 'Pullups',
    displayName: 'Weighted Pull-Up',
    topE1RMKg: 200, // ~440 lbs total (BW + added weight)
    notes: 'Total weight (bodyweight + added), full ROM',
  },
];

// === Process Exercises ===
// Convert raw exercises to GymRats exercises with metadata
const EXERCISE_MAP = new Map<string, GrExercise>();
const VERIFIED_TOP_MAP = new Map<string, VerifiedTop>();

// Build verified top map
VERIFIED_TOPS.forEach(top => {
  VERIFIED_TOP_MAP.set(top.exerciseId, top);
});

// Build reverse legacy ID map (new ID -> legacy IDs)
const NEW_TO_LEGACY: Record<string, string[]> = {};
for (const [legacyId, newId] of Object.entries(LEGACY_ID_MAP)) {
  if (!NEW_TO_LEGACY[newId]) {
    NEW_TO_LEGACY[newId] = [];
  }
  NEW_TO_LEGACY[newId].push(legacyId);
}

// Process all exercises
RAW_EXERCISES.forEach(raw => {
  const isPopular = POPULAR_EXERCISE_IDS.has(raw.id);
  const legacyIds = NEW_TO_LEGACY[raw.id];
  const verifiedTop = VERIFIED_TOP_MAP.get(raw.id);

  const exercise: GrExercise = {
    id: raw.id,
    name: raw.name,
    force: raw.force,
    level: raw.level,
    mechanic: raw.mechanic,
    equipment: raw.equipment,
    primaryMuscles: raw.primaryMuscles as MuscleGroup[],
    secondaryMuscles: raw.secondaryMuscles as MuscleGroup[],
    instructions: raw.instructions,
    category: raw.category,
    images: raw.images,
    isPopular,
    verifiedTop: verifiedTop?.topE1RMKg,
    legacyIds,
  };

  EXERCISE_MAP.set(raw.id, exercise);
});

// === Public API ===

/**
 * Get all exercises in the database
 */
export function getAllExercises(): GrExercise[] {
  return Array.from(EXERCISE_MAP.values());
}

/**
 * Get exercise by ID
 */
export function getExerciseById(id: string): GrExercise | undefined {
  return EXERCISE_MAP.get(id);
}

/**
 * Get popular exercises (shown in quick picker)
 */
export function getPopularExercises(): GrExercise[] {
  return Array.from(EXERCISE_MAP.values()).filter(ex => ex.isPopular);
}

/**
 * Resolve legacy ID to new exercise ID
 * Returns the new ID if found, otherwise returns the input ID
 */
export function resolveExerciseId(legacyId: string): string {
  return LEGACY_ID_MAP[legacyId] || legacyId;
}

/**
 * Get verified top for an exercise
 */
export function getVerifiedTop(exerciseId: string): VerifiedTop | undefined {
  return VERIFIED_TOP_MAP.get(exerciseId);
}

/**
 * Check if an exercise has a verified top standard
 */
export function hasVerifiedTop(exerciseId: string): boolean {
  return VERIFIED_TOP_MAP.has(exerciseId);
}

/**
 * Get all verified tops
 */
export function getAllVerifiedTops(): VerifiedTop[] {
  return VERIFIED_TOPS;
}

/**
 * Get exercise IDs that have verified tops
 */
export function getVerifiedExerciseIds(): string[] {
  return VERIFIED_TOPS.map(t => t.exerciseId);
}

/**
 * Search exercises by name or muscle group
 */
export function searchExercises(query: string): GrExercise[] {
  const q = query.toLowerCase();
  return Array.from(EXERCISE_MAP.values()).filter(ex =>
    ex.name.toLowerCase().includes(q) ||
    ex.primaryMuscles.some(m => m.toLowerCase().includes(q)) ||
    ex.secondaryMuscles.some(m => m.toLowerCase().includes(q))
  );
}

/**
 * Get exercises by muscle group
 */
export function getExercisesByMuscleGroup(muscle: MuscleGroup): GrExercise[] {
  return Array.from(EXERCISE_MAP.values()).filter(ex =>
    ex.primaryMuscles.includes(muscle) || ex.secondaryMuscles.includes(muscle)
  );
}

/**
 * Get exercises by equipment
 */
export function getExercisesByEquipment(equipment: string): GrExercise[] {
  return Array.from(EXERCISE_MAP.values()).filter(ex =>
    ex.equipment.toLowerCase() === equipment.toLowerCase()
  );
}
