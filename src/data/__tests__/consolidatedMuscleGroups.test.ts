// src/data/__tests__/consolidatedMuscleGroups.test.ts
import {
  MUSCLE_GROUPS,
  EXERCISE_MUSCLE_MAPS,
  getMuscleMap,
  getMusclesForExercise,
  calculateMuscleContribution,
} from '../consolidatedMuscleGroups';

describe('consolidatedMuscleGroups', () => {
  it('should have muscle groups with proper structure', () => {
    expect(MUSCLE_GROUPS).toBeDefined();
    expect(MUSCLE_GROUPS.length).toBeGreaterThan(0);

    // Check that each muscle group has the required properties
    MUSCLE_GROUPS.forEach(muscle => {
      expect(muscle.id).toBeDefined();
      expect(muscle.name).toBeDefined();
      expect(muscle.displayName).toBeDefined();
      expect(muscle.region).toBeDefined();
      expect(muscle.side).toBeDefined();
      expect(muscle.svgPath).toBeDefined();
    });
  });

  it('should have exercise muscle mappings', () => {
    expect(EXERCISE_MUSCLE_MAPS).toBeDefined();
    expect(Object.keys(EXERCISE_MUSCLE_MAPS).length).toBeGreaterThan(0);
  });

  it('should get muscle map for an exercise', () => {
    const benchMap = getMuscleMap('bench');
    expect(benchMap).toBeDefined();
    expect(benchMap?.exerciseId).toBe('bench');
    expect(benchMap?.primary).toContain('lower_chest');
  });

  it('should get muscles for an exercise', () => {
    const benchMuscles = getMusclesForExercise('bench');
    expect(benchMuscles.primary).toContain('lower_chest');
    expect(benchMuscles.secondary).toContain('upper_chest');
    expect(benchMuscles.tertiary).toEqual([]);
  });

  it('should calculate muscle contribution', () => {
    const contributions = calculateMuscleContribution('bench', 100, 10);
    expect(contributions).toBeDefined();
    expect(contributions.lower_chest).toBe(1000); // 100kg * 10 reps * 1.0
    expect(contributions.upper_chest).toBe(500); // 100kg * 10 reps * 0.5
  });
});