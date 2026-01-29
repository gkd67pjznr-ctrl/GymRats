// src/data/muscleGroups.ts
export interface MuscleGroup {
  id: string;
  name: string;
  region: 'upper' | 'lower' | 'core';
  side: 'front' | 'back';
  svgPath: string;
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  // Upper Body - Front
  { id: 'chest', name: 'Pectoralis', region: 'upper', side: 'front', svgPath: 'M 0 0 L 1 1' }, // Placeholder
  { id: 'shoulders_front', name: 'Anterior Deltoid', region: 'upper', side: 'front', svgPath: 'M 0 0 L 1 1' },
  { id: 'biceps', name: 'Biceps', region: 'upper', side: 'front', svgPath: 'M 0 0 L 1 1' },
  { id: 'forearms_front', name: 'Forearms', region: 'upper', side: 'front', svgPath: 'M 0 0 L 1 1' },

  // Upper Body - Back
  { id: 'traps', name: 'Trapezius', region: 'upper', side: 'back', svgPath: 'M 0 0 L 1 1' },
  { id: 'lats', name: 'Latissimus Dorsi', region: 'upper', side: 'back', svgPath: 'M 0 0 L 1 1' },
  { id: 'shoulders_mid', name: 'Lateral Deltoid', region: 'upper', side: 'back', svgPath: 'M 0 0 L 1 1' },
  { id: 'shoulders_rear', name: 'Posterior Deltoid', region: 'upper', side: 'back', svgPath: 'M 0 0 L 1 1' },
  { id: 'triceps', name: 'Triceps', region: 'upper', side: 'back', svgPath: 'M 0 0 L 1 1' },
  { id: 'forearms_back', name: 'Forearms', region: 'upper', side: 'back', svgPath: 'M 0 0 L 1 1' },

  // Core - Front
  { id: 'abs', name: 'Abdominals', region: 'core', side: 'front', svgPath: 'M 0 0 L 1 1' },
  { id: 'obliques', name: 'Obliques', region: 'core', side: 'front', svgPath: 'M 0 0 L 1 1' },

  // Core - Back
  { id: 'lower_back', name: 'Erector Spinae', region: 'core', side: 'back', svgPath: 'M 0 0 L 1 1' },

  // Lower Body - Front
  { id: 'quads', name: 'Quadriceps', region: 'lower', side: 'front', svgPath: 'M 0 0 L 1 1' },
  { id: 'adductors', name: 'Adductors', region: 'lower', side: 'front', svgPath: 'M 0 0 L 1 1' },

  // Lower Body - Back
  { id: 'glutes', name: 'Glutes', region: 'lower', side: 'back', svgPath: 'M 0 0 L 1 1' },
  { id: 'abductors', name: 'Abductors', region: 'lower', side: 'back', svgPath: 'M 0 0 L 1 1' },
  { id: 'hamstrings', name: 'Hamstrings', region: 'lower', side: 'back', svgPath: 'M 0 0 L 1 1' },
  { id: 'calves', name: 'Calves', region: 'lower', side: 'back', svgPath: 'M 0 0 L 1 1' },
];
