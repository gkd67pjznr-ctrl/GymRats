// src/data/__tests__/muscleGroupsManager.test.ts
import {
  getMuscleGroups,
  getExerciseMuscleMaps,
  updateMuscleGroupsFromExternal,
  updateExerciseMapsFromExternal,
  getCoreMuscleGroups,
  getCoreExerciseMuscleMaps,
  getExternalMuscleGroups,
  getExternalExerciseMaps,
  clearExternalData,
  validateExternalMuscleGroup,
  validateExternalExerciseMap,
  getDataVersions
} from '../muscleGroupsManager';

describe('muscleGroupsManager', () => {
  beforeEach(() => {
    clearExternalData();
  });

  it('should return core muscle groups when no external data', () => {
    const muscleGroups = getMuscleGroups();
    const coreGroups = getCoreMuscleGroups();

    expect(muscleGroups.length).toBeGreaterThanOrEqual(coreGroups.length);
    expect(muscleGroups.some(m => m.id === 'upper_chest')).toBe(true);
    expect(muscleGroups.some(m => m.id === 'quads')).toBe(true);
  });

  it('should return core exercise maps when no external data', () => {
    const exerciseMaps = getExerciseMuscleMaps();
    const coreMaps = getCoreExerciseMuscleMaps();

    expect(Object.keys(exerciseMaps).length).toBeGreaterThanOrEqual(Object.keys(coreMaps).length);
    expect(exerciseMaps.bench).toBeDefined();
    expect(exerciseMaps.squat).toBeDefined();
  });

  it('should add external muscle groups without overriding core ones', () => {
    const externalGroups = [
      { id: 'new_muscle', name: 'New Muscle', displayName: 'New Muscle' },
      { id: 'upper_chest', name: 'Hacked Chest', displayName: 'Hacked Chest' } // Should not override
    ];

    updateMuscleGroupsFromExternal(externalGroups, 'test-source');

    const muscleGroups = getMuscleGroups();

    // Should have the new muscle
    expect(muscleGroups.some(m => m.id === 'new_muscle')).toBe(true);

    // Should still have the original upper_chest
    const upperChest = muscleGroups.find(m => m.id === 'upper_chest');
    expect(upperChest).toBeDefined();
    expect(upperChest?.name).toBe('Upper Chest'); // Original name, not hacked one
  });

  it('should add external exercise maps without overriding core ones', () => {
    const externalMaps = [
      { exerciseId: 'new_exercise', primary: ['upper_chest'], secondary: ['traps'] },
      { exerciseId: 'bench', primary: ['fake_muscle'], secondary: [] } // Should not override
    ];

    updateExerciseMapsFromExternal(externalMaps, 'test-source');

    const exerciseMaps = getExerciseMuscleMaps();

    // Should have the new exercise
    expect(exerciseMaps.new_exercise).toBeDefined();
    expect(exerciseMaps.new_exercise?.primary).toContain('upper_chest');

    // Should still have the original bench
    const bench = exerciseMaps.bench;
    expect(bench).toBeDefined();
    expect(bench?.primary).toContain('lower_chest'); // Original primary, not fake muscle
  });

  it('should validate external muscle group data', () => {
    const validGroup = { id: 'valid', name: 'Valid', displayName: 'Valid Muscle' };
    const invalidGroup = { id: '', name: 'Invalid', displayName: 'Invalid Muscle' };

    expect(validateExternalMuscleGroup(validGroup)).toBe(true);
    expect(validateExternalMuscleGroup(invalidGroup)).toBe(false);
  });

  it('should validate external exercise map data', () => {
    const validMap = { exerciseId: 'valid_exercise', primary: ['chest'], secondary: ['traps'] };
    const invalidMap = { exerciseId: '', primary: ['chest'], secondary: ['traps'] };

    expect(validateExternalExerciseMap(validMap)).toBe(true);
    expect(validateExternalExerciseMap(invalidMap)).toBe(false);
  });

  it('should track data versions', () => {
    const initialVersions = getDataVersions();

    updateMuscleGroupsFromExternal([{ id: 'test', name: 'Test', displayName: 'Test' }], 'test');

    const updatedVersions = getDataVersions();

    expect(updatedVersions.muscleGroups).toBeGreaterThan(initialVersions.muscleGroups);
    expect(updatedVersions.exerciseMaps).toBe(initialVersions.exerciseMaps);
  });

  it('should clear external data', () => {
    updateMuscleGroupsFromExternal([{ id: 'external', name: 'External', displayName: 'External' }], 'test');
    updateExerciseMapsFromExternal([{ exerciseId: 'external_ex', primary: [], secondary: [] }], 'test');

    expect(Object.keys(getExternalMuscleGroups()).length).toBe(1);
    expect(Object.keys(getExternalExerciseMaps()).length).toBe(1);

    clearExternalData();

    expect(Object.keys(getExternalMuscleGroups()).length).toBe(0);
    expect(Object.keys(getExternalExerciseMaps()).length).toBe(0);
  });
});