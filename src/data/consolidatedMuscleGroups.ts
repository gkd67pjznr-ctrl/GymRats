// src/data/consolidatedMuscleGroups.ts
// Consolidated muscle group definitions with SVG paths

/**
 * Muscle group identifiers
 *
 * These IDs map to specific regions on the body model visualization.
 */
export type MuscleId =
  // Upper body front
  | 'upper_chest'
  | 'lower_chest'
  | 'front_delt'
  | 'side_delt'
  | 'rear_delt'
  | 'upper_abs'
  | 'lower_abs'
  | 'obliques'
  | 'biceps'
  | 'forearms'
  | 'traps'
  // Upper body back
  | 'lats'
  | 'mid_back'
  | 'lower_back'
  // Lower body
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'adductors'
  | 'abductors';

export const CORE_MUSCLE_IDS: MuscleId[] = [
  'upper_chest',
  'lower_chest',
  'front_delt',
  'side_delt',
  'rear_delt',
  'upper_abs',
  'lower_abs',
  'obliques',
  'biceps',
  'forearms',
  'traps',
  'lats',
  'mid_back',
  'lower_back',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'adductors',
  'abductors'
];

/**
 * Muscle group metadata with SVG paths
 */
export interface MuscleGroup {
  id: MuscleId;
  name: string;
  displayName: string;
  region: 'upper_front' | 'upper_back' | 'lower_body';
  side: 'front' | 'back';
  svgPath: string;
}

/**
 * All muscle groups in order of display priority
 */
export const MUSCLE_GROUPS: MuscleGroup[] = [
  // Upper body front
  {
    id: 'upper_chest',
    name: 'Upper Chest',
    displayName: 'Upper Chest',
    region: 'upper_front',
    side: 'front',
    svgPath: 'M 0 0 L 1 1' // Placeholder - will be updated with actual SVG paths
  },
  {
    id: 'lower_chest',
    name: 'Lower Chest',
    displayName: 'Lower Chest',
    region: 'upper_front',
    side: 'front',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'front_delt',
    name: 'Front Delts',
    displayName: 'Front Shoulders',
    region: 'upper_front',
    side: 'front',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'side_delt',
    name: 'Side Delts',
    displayName: 'Side Shoulders',
    region: 'upper_front',
    side: 'front',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'rear_delt',
    name: 'Rear Delts',
    displayName: 'Rear Shoulders',
    region: 'upper_front',
    side: 'back',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'traps',
    name: 'Traps',
    displayName: 'Traps',
    region: 'upper_front',
    side: 'back',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'biceps',
    name: 'Biceps',
    displayName: 'Biceps',
    region: 'upper_front',
    side: 'front',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'forearms',
    name: 'Forearms',
    displayName: 'Forearms',
    region: 'upper_front',
    side: 'front',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'upper_abs',
    name: 'Upper Abs',
    displayName: 'Upper Abs',
    region: 'upper_front',
    side: 'front',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'lower_abs',
    name: 'Lower Abs',
    displayName: 'Lower Abs',
    region: 'upper_front',
    side: 'front',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'obliques',
    name: 'Obliques',
    displayName: 'Obliques',
    region: 'upper_front',
    side: 'front',
    svgPath: 'M 0 0 L 1 1'
  },

  // Upper body back
  {
    id: 'lats',
    name: 'Lats',
    displayName: 'Lats',
    region: 'upper_back',
    side: 'back',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'mid_back',
    name: 'Mid Back',
    displayName: 'Mid Back',
    region: 'upper_back',
    side: 'back',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'lower_back',
    name: 'Lower Back',
    displayName: 'Lower Back',
    region: 'upper_back',
    side: 'back',
    svgPath: 'M 0 0 L 1 1'
  },

  // Lower body
  {
    id: 'quads',
    name: 'Quads',
    displayName: 'Quadriceps',
    region: 'lower_body',
    side: 'front',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'hamstrings',
    name: 'Hamstrings',
    displayName: 'Hamstrings',
    region: 'lower_body',
    side: 'back',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'glutes',
    name: 'Glutes',
    displayName: 'Glutes',
    region: 'lower_body',
    side: 'back',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'calves',
    name: 'Calves',
    displayName: 'Calves',
    region: 'lower_body',
    side: 'back',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'adductors',
    name: 'Adductors',
    displayName: 'Adductors',
    region: 'lower_body',
    side: 'front',
    svgPath: 'M 0 0 L 1 1'
  },
  {
    id: 'abductors',
    name: 'Abductors',
    displayName: 'Abductors',
    region: 'lower_body',
    side: 'front',
    svgPath: 'M 0 0 L 1 1'
  },
];

/**
 * Exercise to muscle mapping
 *
 * Maps each exercise to its primary, secondary, and tertiary muscle groups.
 * Primary muscles get 100% credit, secondary 50%, tertiary 25%.
 */
export interface ExerciseMuscleMap {
  exerciseId: string;
  primary: MuscleId[];
  secondary: MuscleId[];
  tertiary: MuscleId[];
}

/**
 * Exercise muscle mappings
 *
 * Based on standard biomechanics and EMG studies.
 */
export const EXERCISE_MUSCLE_MAPS: Record<string, ExerciseMuscleMap> = {
  // Chest exercises
  bench: {
    exerciseId: 'bench',
    primary: ['lower_chest', 'front_delt', 'triceps'],
    secondary: ['upper_chest', 'traps'],
    tertiary: [],
  },
  incline_bench: {
    exerciseId: 'incline_bench',
    primary: ['upper_chest', 'front_delt', 'triceps'],
    secondary: ['lower_chest', 'traps'],
    tertiary: [],
  },
  dumbbell_bench: {
    exerciseId: 'dumbbell_bench',
    primary: ['lower_chest', 'front_delt', 'triceps'],
    secondary: ['upper_chest', 'traps'],
    tertiary: [],
  },
  dumbbell_incline: {
    exerciseId: 'dumbbell_incline',
    primary: ['upper_chest', 'front_delt', 'triceps'],
    secondary: ['lower_chest', 'traps'],
    tertiary: [],
  },
  dumbbell_fly: {
    exerciseId: 'dumbbell_fly',
    primary: ['upper_chest', 'lower_chest'],
    secondary: ['front_delt'],
    tertiary: [],
  },
  cable_fly: {
    exerciseId: 'cable_fly',
    primary: ['upper_chest', 'lower_chest'],
    secondary: ['front_delt'],
    tertiary: [],
  },
  pushup: {
    exerciseId: 'pushup',
    primary: ['lower_chest', 'front_delt', 'triceps'],
    secondary: ['upper_chest', 'traps'],
    tertiary: [],
  },
  dip: {
    exerciseId: 'dip',
    primary: ['lower_chest', 'triceps', 'front_delt'],
    secondary: ['upper_chest'],
    tertiary: [],
  },

  // Back exercises
  deadlift: {
    exerciseId: 'deadlift',
    primary: ['lower_back', 'glutes', 'hamstrings'],
    secondary: ['traps', 'lats', 'quads'],
    tertiary: ['forearms', 'abductors'],
  },
  conventional_deadlift: {
    exerciseId: 'conventional_deadlift',
    primary: ['lower_back', 'glutes', 'hamstrings'],
    secondary: ['traps', 'lats', 'quads'],
    tertiary: ['forearms', 'abductors'],
  },
  sumo_deadlift: {
    exerciseId: 'sumo_deadlift',
    primary: ['glutes', 'quads', 'hamstrings'],
    secondary: ['lower_back', 'traps', 'adductors'],
    tertiary: ['forearms', 'abductors'],
  },
  rdl: {
    exerciseId: 'rdl',
    primary: ['hamstrings', 'glutes', 'lower_back'],
    secondary: ['traps', 'abductors'],
    tertiary: ['forearms'],
  },
  lat_pulldown: {
    exerciseId: 'lat_pulldown',
    primary: ['lats', 'biceps'],
    secondary: ['mid_back', 'rear_delt', 'forearms'],
    tertiary: ['traps'],
  },
  pullup: {
    exerciseId: 'pullup',
    primary: ['lats', 'biceps'],
    secondary: ['mid_back', 'rear_delt', 'forearms'],
    tertiary: ['traps', 'lower_chest'],
  },
  chinup: {
    exerciseId: 'chinup',
    primary: ['lats', 'biceps'],
    secondary: ['mid_back', 'rear_delt', 'forearms'],
    tertiary: ['traps', 'lower_chest'],
  },
  seated_cable_row: {
    exerciseId: 'seated_cable_row',
    primary: ['mid_back', 'lats', 'biceps'],
    secondary: ['rear_delt', 'traps', 'forearms'],
    tertiary: [],
  },
  bent_over_row: {
    exerciseId: 'bent_over_row',
    primary: ['mid_back', 'lats', 'rear_delt'],
    secondary: ['traps', 'biceps', 'forearms'],
    tertiary: ['lower_back'],
  },
  t_bar_row: {
    exerciseId: 't_bar_row',
    primary: ['mid_back', 'lats'],
    secondary: ['traps', 'rear_delt', 'biceps'],
    tertiary: ['forearms', 'lower_back'],
  },
  face_pull: {
    exerciseId: 'face_pull',
    primary: ['rear_delt', 'mid_back', 'traps'],
    secondary: ['side_delt', 'biceps'],
    tertiary: [],
  },

  // Shoulder exercises
  ohp: {
    exerciseId: 'ohp',
    primary: ['front_delt', 'side_delt', 'triceps'],
    secondary: ['traps', 'upper_chest'],
    tertiary: ['rear_delt'],
  },
  dumbbell_press: {
    exerciseId: 'dumbbell_press',
    primary: ['front_delt', 'side_delt', 'triceps'],
    secondary: ['traps', 'upper_chest'],
    tertiary: [],
  },
  arnold_press: {
    exerciseId: 'arnold_press',
    primary: ['front_delt', 'side_delt'],
    secondary: ['traps', 'triceps'],
    tertiary: ['rear_delt'],
  },
  lateral_raise: {
    exerciseId: 'lateral_raise',
    primary: ['side_delt'],
    secondary: ['front_delt', 'traps'],
    tertiary: ['rear_delt'],
  },
  front_raise: {
    exerciseId: 'front_raise',
    primary: ['front_delt'],
    secondary: ['side_delt', 'traps', 'upper_chest'],
    tertiary: [],
  },
  rear_delt_fly: {
    exerciseId: 'rear_delt_fly',
    primary: ['rear_delt', 'mid_back'],
    secondary: ['traps', 'side_delt'],
    tertiary: [],
  },
  shrug: {
    exerciseId: 'shrug',
    primary: ['traps'],
    secondary: ['mid_back', 'side_delt'],
    tertiary: [],
  },
  upright_row: {
    exerciseId: 'upright_row',
    primary: ['traps', 'side_delt'],
    secondary: ['front_delt', 'biceps'],
    tertiary: [],
  },

  // Arm exercises
  barbell_curl: {
    exerciseId: 'barbell_curl',
    primary: ['biceps'],
    secondary: ['forearms', 'front_delt'],
    tertiary: [],
  },
  dumbbell_curl: {
    exerciseId: 'dumbbell_curl',
    primary: ['biceps'],
    secondary: ['forearms', 'front_delt'],
    tertiary: [],
  },
  hammer_curl: {
    exerciseId: 'hammer_curl',
    primary: ['biceps', 'forearms'],
    secondary: ['side_delt'],
    tertiary: [],
  },
  preacher_curl: {
    exerciseId: 'preacher_curl',
    primary: ['biceps'],
    secondary: ['forearms'],
    tertiary: [],
  },
  tricep_pushdown: {
    exerciseId: 'tricep_pushdown',
    primary: ['triceps'],
    secondary: ['forearms', 'front_delt'],
    tertiary: [],
  },
  skullcrusher: {
    exerciseId: 'skullcrusher',
    primary: ['triceps'],
    secondary: ['forearms', 'front_delt'],
    tertiary: [],
  },
  overhead_extension: {
    exerciseId: 'overhead_extension',
    primary: ['triceps'],
    secondary: ['front_delt', 'forearms', 'traps'],
    tertiary: [],
  },

  // Leg exercises
  squat: {
    exerciseId: 'squat',
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'adductors', 'abductors', 'lower_back'],
    tertiary: ['calves'],
  },
  front_squat: {
    exerciseId: 'front_squat',
    primary: ['quads'],
    secondary: ['glutes', 'adductors', 'abductors'],
    tertiary: ['hamstrings', 'lower_back'],
  },
  leg_press: {
    exerciseId: 'leg_press',
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'adductors', 'abductors'],
    tertiary: [],
  },
  hack_squat: {
    exerciseId: 'hack_squat',
    primary: ['quads'],
    secondary: ['glutes', 'adductors', 'abductors'],
    tertiary: ['hamstrings'],
  },
  bulgarian_split_squat: {
    exerciseId: 'bulgarian_split_squat',
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'adductors', 'abductors'],
    tertiary: [],
  },
  lunge: {
    exerciseId: 'lunge',
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'adductors', 'abductors'],
    tertiary: [],
  },
  leg_extension: {
    exerciseId: 'leg_extension',
    primary: ['quads'],
    secondary: ['adductors', 'abductors'],
    tertiary: [],
  },
  leg_curl: {
    exerciseId: 'leg_curl',
    primary: ['hamstrings'],
    secondary: ['glutes'],
    tertiary: [],
  },
  calf_raise: {
    exerciseId: 'calf_raise',
    primary: ['calves'],
    secondary: [],
    tertiary: [],
  },
  hip_thrust: {
    exerciseId: 'hip_thrust',
    primary: ['glutes', 'hamstrings'],
    secondary: ['quads', 'abductors'],
    tertiary: ['lower_back'],
  },

  // Core exercises
  crunch: {
    exerciseId: 'crunch',
    primary: ['upper_abs'],
    secondary: ['lower_abs'],
    tertiary: [],
  },
  situp: {
    exerciseId: 'situp',
    primary: ['upper_abs', 'lower_abs'],
    secondary: ['hip_flexors'],
    tertiary: [],
  },
  leg_raise: {
    exerciseId: 'leg_raise',
    primary: ['lower_abs'],
    secondary: ['upper_abs', 'hip_flexors'],
    tertiary: [],
  },
  plank: {
    exerciseId: 'plank',
    primary: ['upper_abs', 'lower_abs'],
    secondary: ['lower_back', 'shoulders'],
    tertiary: ['obliques'],
  },
  russian_twist: {
    exerciseId: 'russian_twist',
    primary: ['obliques', 'upper_abs', 'lower_abs'],
    secondary: [],
    tertiary: [],
  },
  cable_crunch: {
    exerciseId: 'cable_crunch',
    primary: ['upper_abs', 'lower_abs'],
    secondary: ['obliques'],
    tertiary: [],
  },
  hanging_knee_raise: {
    exerciseId: 'hanging_knee_raise',
    primary: ['lower_abs', 'upper_abs'],
    secondary: ['obliques', 'hip_flexors'],
    tertiary: ['forearms'],
  },
};

/**
 * Get muscle map for an exercise
 */
export function getMuscleMap(exerciseId: string): ExerciseMuscleMap | null {
  return EXERCISE_MUSCLE_MAPS[exerciseId] || null;
}

/**
 * Get all muscles targeted by an exercise
 */
export function getMusclesForExercise(exerciseId: string): {
  primary: MuscleId[];
  secondary: MuscleId[];
  tertiary: MuscleId[];
} {
  const map = EXERCISE_MUSCLE_MAPS[exerciseId];
  if (!map) return { primary: [], secondary: [], tertiary: [] };
  return {
    primary: map.primary,
    secondary: map.secondary,
    tertiary: map.tertiary,
  };
}

/**
 * Calculate muscle contribution from a set
 *
 * Returns a map of muscle IDs to contribution scores.
 * Primary muscles get 1.0, secondary 0.5, tertiary 0.25.
 */
export function calculateMuscleContribution(
  exerciseId: string,
  weightKg: number,
  reps: number
): Record<MuscleId, number> {
  const contributions: Record<MuscleId, number> = {} as any;
  const volume = weightKg * reps;
  const map = EXERCISE_MUSCLE_MAPS[exerciseId];

  if (!map) return contributions;

  // Primary muscles: 100% contribution
  for (const muscle of map.primary) {
    contributions[muscle] = (contributions[muscle] || 0) + volume * 1.0;
  }

  // Secondary muscles: 50% contribution
  for (const muscle of map.secondary) {
    contributions[muscle] = (contributions[muscle] || 0) + volume * 0.5;
  }

  // Tertiary muscles: 25% contribution
  for (const muscle of map.tertiary) {
    contributions[muscle] = (contributions[muscle] || 0) + volume * 0.25;
  }

  return contributions;
}