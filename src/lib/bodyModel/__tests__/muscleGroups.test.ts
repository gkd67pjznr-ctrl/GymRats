// src/lib/bodyModel/__tests__/muscleGroups.test.ts
// Tests for muscle group mappings and volume calculations

import {
  MUSCLE_GROUPS,
  EXERCISE_MUSCLE_MAPS,
  getMuscleMap,
  getMusclesForExercise,
  calculateMuscleContribution,
  type MuscleId,
} from '../muscleGroups';

describe('Muscle Groups', () => {
  describe('MUSCLE_GROUPS', () => {
    it('should have all defined muscle groups', () => {
      expect(MUSCLE_GROUPS.length).toBeGreaterThan(0);

      // Check for key muscle groups
      const muscleIds = MUSCLE_GROUPS.map(m => m.id);
      expect(muscleIds).toContain('upper_chest');
      expect(muscleIds).toContain('lower_chest');
      expect(muscleIds).toContain('quads');
      expect(muscleIds).toContain('hamstrings');
      expect(muscleIds).toContain('biceps');
    });

    it('should have proper muscle group structure', () => {
      for (const muscle of MUSCLE_GROUPS) {
        expect(muscle).toHaveProperty('id');
        expect(muscle).toHaveProperty('name');
        expect(muscle).toHaveProperty('displayName');
        expect(muscle).toHaveProperty('region');
        expect(['upper_front', 'upper_back', 'lower_body']).toContain(muscle.region);
      }
    });
  });

  describe('Exercise Muscle Maps', () => {
    it('should have bench press mapping', () => {
      const benchMap = getMuscleMap('bench');
      expect(benchMap).toBeDefined();
      expect(benchMap?.primary).toContain('lower_chest');
      expect(benchMap?.primary).toContain('front_delt');
      expect(benchMap?.primary).toContain('triceps');
    });

    it('should have squat mapping', () => {
      const squatMap = getMuscleMap('squat');
      expect(squatMap).toBeDefined();
      expect(squatMap?.primary).toContain('quads');
      expect(squatMap?.primary).toContain('glutes');
      expect(squatMap?.secondary).toContain('hamstrings');
    });

    it('should have deadlift mapping', () => {
      const deadliftMap = getMuscleMap('deadlift');
      expect(deadliftMap).toBeDefined();
      expect(deadliftMap?.primary).toContain('lower_back');
      expect(deadliftMap?.primary).toContain('glutes');
      expect(deadliftMap?.primary).toContain('hamstrings');
      expect(deadliftMap?.secondary).toContain('traps');
      expect(deadliftMap?.secondary).toContain('lats');
    });

    it('should have pullup mapping', () => {
      const pullupMap = getMuscleMap('pullup');
      expect(pullupMap).toBeDefined();
      expect(pullupMap?.primary).toContain('lats');
      expect(pullupMap?.primary).toContain('biceps');
    });

    it('should return null for unknown exercise', () => {
      const unknownMap = getMuscleMap('unknown_exercise');
      expect(unknownMap).toBeNull();
    });
  });

  describe('getMusclesForExercise', () => {
    it('should return muscle lists for bench press', () => {
      const muscles = getMusclesForExercise('bench');

      expect(muscles.primary).toContain('lower_chest');
      expect(muscles.primary).toContain('front_delt');
      expect(muscles.primary).toContain('triceps');
      expect(muscles.secondary).toContain('upper_chest');
    });

    it('should return empty arrays for unknown exercise', () => {
      const muscles = getMusclesForExercise('unknown_exercise');
      expect(muscles.primary).toEqual([]);
      expect(muscles.secondary).toEqual([]);
      expect(muscles.tertiary).toEqual([]);
    });
  });

  describe('calculateMuscleContribution', () => {
    it('should calculate contribution for bench press', () => {
      const contributions = calculateMuscleContribution('bench', 100, 10);

      // Volume = 100 * 10 = 1000
      // Primary muscles get 100% = 1000 each
      expect(contributions['lower_chest']).toBe(1000);
      expect(contributions['front_delt']).toBe(1000);
      expect(contributions['triceps']).toBe(1000);

      // Secondary muscles get 50% = 500 each
      expect(contributions['upper_chest']).toBe(500);
      expect(contributions['traps']).toBe(500);
    });

    it('should calculate contribution for squat', () => {
      const contributions = calculateMuscleContribution('squat', 120, 8);

      // Volume = 120 * 8 = 960
      expect(contributions['quads']).toBe(960); // Primary
      expect(contributions['glutes']).toBe(960); // Primary

      // Secondary muscles get 50%
      expect(contributions['hamstrings']).toBe(480);
      expect(contributions['adductors']).toBe(480);
      expect(contributions['abductors']).toBe(480);
      expect(contributions['lower_back']).toBe(480);
    });

    it('should calculate contribution for deadlift', () => {
      const contributions = calculateMuscleContribution('deadlift', 180, 5);

      // Volume = 180 * 5 = 900
      expect(contributions['lower_back']).toBe(900); // Primary
      expect(contributions['glutes']).toBe(900); // Primary
      expect(contributions['hamstrings']).toBe(900); // Primary

      // Secondary muscles get 50%
      expect(contributions['traps']).toBe(450);
      expect(contributions['lats']).toBe(450);
      expect(contributions['quads']).toBe(450);

      // Tertiary muscles get 25%
      expect(contributions['forearms']).toBe(225);
      expect(contributions['abductors']).toBe(225);
    });

    it('should return empty object for unknown exercise', () => {
      const contributions = calculateMuscleContribution('unknown_exercise', 100, 10);
      expect(Object.keys(contributions)).toHaveLength(0);
    });

    it('should handle zero reps', () => {
      const contributions = calculateMuscleContribution('bench', 100, 0);
      expect(contributions['lower_chest']).toBe(0);
    });

    it('should handle zero weight', () => {
      const contributions = calculateMuscleContribution('bench', 0, 10);
      expect(contributions['lower_chest']).toBe(0);
    });
  });

  describe('Exercise Coverage', () => {
    it('should have mappings for major exercises', () => {
      const majorExercises = [
        'bench', 'incline_bench', 'deadlift', 'squat',
        'ohp', 'pullup', 'lat_pulldown', 'barbell_curl',
        'leg_press', 'leg_curl', 'calf_raise'
      ];

      for (const exerciseId of majorExercises) {
        const map = getMuscleMap(exerciseId);
        expect(map).toBeDefined();
        expect(map?.primary.length).toBeGreaterThan(0);
      }
    });

    it('should have OHP mapping', () => {
      const ohpMap = getMuscleMap('ohp');
      expect(ohpMap?.primary).toContain('front_delt');
      expect(ohpMap?.primary).toContain('side_delt');
      expect(ohpMap?.primary).toContain('triceps');
    });

    it('should have barbell curl mapping', () => {
      const curlMap = getMuscleMap('barbell_curl');
      expect(curlMap?.primary).toContain('biceps');
    });

    it('should have leg curl mapping', () => {
      const curlMap = getMuscleMap('leg_curl');
      expect(curlMap?.primary).toContain('hamstrings');
    });
  });
});
