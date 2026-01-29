// src/data/exerciseMuscleMapping.ts
export interface ExerciseMuscleMapping {
  exerciseId: string;
  primary: string[];    // muscle group IDs
  secondary: string[];  // muscle group IDs
}

export const EXERCISE_MUSCLE_MAPPING: ExerciseMuscleMapping[] = [
  {
    exerciseId: 'bench',
    primary: ['chest'],
    secondary: ['shoulders_front', 'triceps'],
  },
  {
    exerciseId: 'squat',
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'lower_back', 'adductors'],
  },
  {
    exerciseId: 'deadlift',
    primary: ['glutes', 'hamstrings', 'lower_back'],
    secondary: ['traps', 'quads', 'forearms_back'],
  },
  {
    exerciseId: 'ohp',
    primary: ['shoulders_front', 'shoulders_mid'],
    secondary: ['triceps'],
  },
  {
    exerciseId: 'row',
    primary: ['lats', 'traps'],
    secondary: ['biceps', 'shoulders_rear', 'forearms_back'],
  },
  {
    exerciseId: 'pullup',
    primary: ['lats'],
    secondary: ['biceps', 'traps', 'abs'],
  },
  {
    exerciseId: 'incline_bench',
    primary: ['chest', 'shoulders_front'],
    secondary: ['triceps'],
  },
  {
    exerciseId: 'rdl',
    primary: ['hamstrings', 'glutes'],
    secondary: ['lower_back'],
  },
  {
    exerciseId: 'leg_press',
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'adductors'],
  },
  {
    exerciseId: 'lat_pulldown',
    primary: ['lats'],
    secondary: ['biceps'],
  },
];
