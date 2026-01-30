// src/lib/stores/__tests__/liveWorkoutStore.test.ts
import { useLiveWorkoutStore, getLiveWorkoutSummary } from "../liveWorkoutStore";

describe('liveWorkoutStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useLiveWorkoutStore.setState({
      sets: [],
      doneBySetId: {},
      weightLb: 135,
      reps: 8,
      weightLbText: "135",
      repsText: "8",
      weightStep: 2.5,
      defaultsByExerciseId: {},
    });
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const state = useLiveWorkoutStore.getState();

      expect(state.sets).toEqual([]);
      expect(state.doneBySetId).toEqual({});
      expect(state.weightLb).toBe(135);
      expect(state.reps).toBe(8);
      expect(state.weightLbText).toBe("135");
      expect(state.repsText).toBe("8");
      expect(state.weightStep).toBe(2.5);
      expect(state.defaultsByExerciseId).toEqual({});
    });
  });

  describe('addSet', () => {
    it('should add a set with correct values', () => {
      const { addSet } = useLiveWorkoutStore.getState();

      const result = addSet('bench');

      expect(result.weightLb).toBe(135);
      expect(result.reps).toBe(8);
      expect(result.set).toEqual({
        id: expect.any(String),
        exerciseId: 'bench',
        setType: 'working',
        weightKg: 135 * 0.45359237, // Converted from lb to kg using KG_PER_LB
        reps: 8,
        timestampMs: expect.any(Number),
      });

      const state = useLiveWorkoutStore.getState();
      expect(state.sets).toHaveLength(1);
      expect(state.defaultsByExerciseId).toEqual({
        bench: { weightLb: 135, reps: 8 },
      });
    });

    it('should add multiple sets for different exercises', () => {
      const { addSet } = useLiveWorkoutStore.getState();

      addSet('bench');
      addSet('squat');

      const state = useLiveWorkoutStore.getState();
      expect(state.sets).toHaveLength(2);
      expect(state.defaultsByExerciseId).toHaveProperty('bench');
      expect(state.defaultsByExerciseId).toHaveProperty('squat');
    });
  });

  describe('weight management', () => {
    it('should increment and decrement weight', () => {
      const { incWeight, decWeight } = useLiveWorkoutStore.getState();

      incWeight();
      let state = useLiveWorkoutStore.getState();
      expect(state.weightLb).toBe(137.5);
      expect(state.weightLbText).toBe("137.5");

      decWeight();
      state = useLiveWorkoutStore.getState();
      expect(state.weightLb).toBe(135);
      expect(state.weightLbText).toBe("135.0");
    });

    it('should handle weight text input with validation', () => {
      const { onWeightText } = useLiveWorkoutStore.getState();

      onWeightText("150");
      let state = useLiveWorkoutStore.getState();
      expect(state.weightLb).toBe(150);
      expect(state.weightLbText).toBe("150");

      onWeightText("invalid");
      state = useLiveWorkoutStore.getState();
      expect(state.weightLb).toBe(150); // Should not change
      expect(state.weightLbText).toBe("invalid");
    });

    it('should commit weight on blur', () => {
      const { onWeightCommit } = useLiveWorkoutStore.getState();

      // Set invalid text
      useLiveWorkoutStore.setState({ weightLbText: "invalid" });

      onWeightCommit();

      const state = useLiveWorkoutStore.getState();
      expect(state.weightLbText).toBe("135.0"); // Should reset to valid value
    });
  });

  describe('reps management', () => {
    it('should increment and decrement reps', () => {
      const { incReps, decReps } = useLiveWorkoutStore.getState();

      incReps();
      let state = useLiveWorkoutStore.getState();
      expect(state.reps).toBe(9);
      expect(state.repsText).toBe("9");

      decReps();
      state = useLiveWorkoutStore.getState();
      expect(state.reps).toBe(8);
      expect(state.repsText).toBe("8");
    });

    it('should handle reps text input with validation', () => {
      const { onRepsText } = useLiveWorkoutStore.getState();

      onRepsText("12");
      let state = useLiveWorkoutStore.getState();
      expect(state.reps).toBe(12);
      expect(state.repsText).toBe("12");

      onRepsText("invalid");
      state = useLiveWorkoutStore.getState();
      expect(state.reps).toBe(12); // Should not change
      expect(state.repsText).toBe("invalid");
    });

    it('should commit reps on blur', () => {
      const { onRepsCommit } = useLiveWorkoutStore.getState();

      // Set invalid text
      useLiveWorkoutStore.setState({ repsText: "invalid" });

      onRepsCommit();

      const state = useLiveWorkoutStore.getState();
      expect(state.repsText).toBe("8"); // Should reset to valid value
    });
  });

  describe('set management', () => {
    it('should toggle done status for sets', () => {
      const { addSet, toggleDone, isDone } = useLiveWorkoutStore.getState();

      const { set } = addSet('bench');

      expect(isDone(set.id)).toBe(false);

      toggleDone(set.id);
      expect(isDone(set.id)).toBe(true);

      toggleDone(set.id);
      expect(isDone(set.id)).toBe(false);
    });

    it('should update set properties', () => {
      const { addSet, updateSet } = useLiveWorkoutStore.getState();

      const { set } = addSet('bench');

      updateSet(set.id, { reps: 10 });

      const state = useLiveWorkoutStore.getState();
      const updatedSet = state.sets.find(s => s.id === set.id);
      expect(updatedSet?.reps).toBe(10);
    });

    it('should set weight for a specific set with validation', () => {
      const { addSet, setWeightForSet } = useLiveWorkoutStore.getState();

      const { set } = addSet('bench');

      setWeightForSet(set.id, "150");

      const state = useLiveWorkoutStore.getState();
      const updatedSet = state.sets.find(s => s.id === set.id);
      expect(updatedSet?.weightKg).toBeCloseTo(150 * 0.45359237, 5);
    });

    it('should set reps for a specific set with validation', () => {
      const { addSet, setRepsForSet } = useLiveWorkoutStore.getState();

      const { set } = addSet('bench');

      setRepsForSet(set.id, "12");

      const state = useLiveWorkoutStore.getState();
      const updatedSet = state.sets.find(s => s.id === set.id);
      expect(updatedSet?.reps).toBe(12);
    });
  });

  describe('exercise defaults', () => {
    it('should get defaults for an exercise', () => {
      const { getDefaultsForExercise, setDefaultsForExercise } = useLiveWorkoutStore.getState();

      // Initially should return global defaults
      expect(getDefaultsForExercise('bench')).toEqual({ weightLb: 135, reps: 8 });

      // Set exercise-specific defaults
      setDefaultsForExercise('bench', { weightLb: 225, reps: 5 });

      expect(getDefaultsForExercise('bench')).toEqual({ weightLb: 225, reps: 5 });
    });

    it('should sync quick add inputs to exercise defaults', () => {
      const { setDefaultsForExercise, syncQuickAddToExercise } = useLiveWorkoutStore.getState();

      // Set exercise defaults
      setDefaultsForExercise('bench', { weightLb: 225, reps: 5 });

      // Change current inputs
      useLiveWorkoutStore.setState({ weightLb: 135, reps: 8 });

      // Sync to exercise defaults
      syncQuickAddToExercise('bench');

      const state = useLiveWorkoutStore.getState();
      expect(state.weightLb).toBe(225);
      expect(state.reps).toBe(5);
    });
  });

  describe('exercise history', () => {
    it('should get last set for an exercise', () => {
      const { addSet, getLastSetForExercise } = useLiveWorkoutStore.getState();

      expect(getLastSetForExercise('bench')).toBeNull();

      addSet('bench', 'working');
      addSet('squat', 'working');
      addSet('bench', 'working');

      const lastSet = getLastSetForExercise('bench');
      expect(lastSet).not.toBeNull();
      expect(lastSet?.exerciseId).toBe('bench');
    });

    it('should copy from last set', () => {
      const { addSet, copyFromLastSet } = useLiveWorkoutStore.getState();

      const { set: firstSet } = addSet('bench');
      const { set: secondSet } = addSet('bench');

      // Modify the second set
      useLiveWorkoutStore.getState().updateSet(secondSet.id, { reps: 10 });

      // Copy from last set to first set
      copyFromLastSet('bench', firstSet.id);

      const state = useLiveWorkoutStore.getState();
      const updatedFirstSet = state.sets.find(s => s.id === firstSet.id);
      expect(updatedFirstSet?.reps).toBe(10);
    });
  });

  describe('reset', () => {
    it('should reset the session to initial state', () => {
      const { addSet, resetSession } = useLiveWorkoutStore.getState();

      addSet('bench');
      addSet('squat');

      useLiveWorkoutStore.setState({ weightLb: 200, reps: 10 });

      resetSession();

      const state = useLiveWorkoutStore.getState();
      expect(state.sets).toEqual([]);
      expect(state.doneBySetId).toEqual({});
      expect(state.defaultsByExerciseId).toEqual({});
      expect(state.weightLb).toBe(135);
      expect(state.reps).toBe(8);
      expect(state.weightLbText).toBe("135");
      expect(state.repsText).toBe("8");
      expect(state.weightStep).toBe(2.5);
    });
  });

  describe('utility functions', () => {
    it('should convert kg to lb', () => {
      const { kgToLb } = useLiveWorkoutStore.getState();

      expect(kgToLb(100)).toBeCloseTo(220.462, 2);
    });

    it('should estimate 1RM in lb', () => {
      const { estimateE1RMLb } = useLiveWorkoutStore.getState();

      // 225 lbs x 5 reps using Epley formula: weight * (1 + reps/30)
      // 225 * (1 + 5/30) = 225 * 1.166666... = 262.5
      const e1rm = estimateE1RMLb(225, 5);
      expect(e1rm).toBeCloseTo(262.5, 0);
    });
  });

  describe('summary', () => {
    it('should calculate workout summary', () => {
      const { addSet } = useLiveWorkoutStore.getState();

      addSet('bench'); // 135 x 8
      addSet('bench'); // 135 x 8
      addSet('squat'); // 135 x 8

      const summary = getLiveWorkoutSummary();

      expect(summary.setCount).toBe(3);
      expect(summary.totalVolumeLb).toBeCloseTo(135 * 8 * 3, 0);
    });
  });
});
