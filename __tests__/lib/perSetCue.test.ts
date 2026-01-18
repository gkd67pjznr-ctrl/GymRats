import { 
  detectCueForWorkingSet, 
  makeEmptyExerciseState,
  type ExerciseSessionState 
} from '../../src/lib/perSetCue';

describe('perSetCue - PR Detection', () => {
  describe('Weight PR Detection', () => {
    it('detects weight PR on first working set', () => {
      const prev = makeEmptyExerciseState();
      
      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 5,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.cue).toBeDefined();
      expect(result.cue?.message).toContain('weight PR');
      expect(result.next.bestWeightKg).toBe(100);
    });

    it('detects weight PR when exceeding previous best', () => {
      const prev = makeEmptyExerciseState();
      prev.bestWeightKg = 100;

      const result = detectCueForWorkingSet({
        weightKg: 110,
        reps: 5,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.cue).toBeDefined();
      expect(result.cue?.message).toContain('weight PR');
      expect(result.next.bestWeightKg).toBe(110);
    });

    it('does not trigger weight PR when weight is lower', () => {
      const prev = makeEmptyExerciseState();
      prev.bestWeightKg = 100;

      const result = detectCueForWorkingSet({
        weightKg: 90,
        reps: 5,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.cue).toBeUndefined();
      expect(result.next.bestWeightKg).toBe(100); // Unchanged
    });
  });

  describe('Rep PR Detection', () => {
    it('detects rep PR at same weight', () => {
      const prev = makeEmptyExerciseState();
      prev.bestWeightKg = 100;
      prev.bestRepsAtWeight['100'] = 5;

      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 6,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.cue).toBeDefined();
      expect(result.cue?.message).toContain('Rep PR');
      expect(result.next.bestRepsAtWeight['100']).toBe(6);
    });

    it('updates rep record when exceeding previous', () => {
      const prev = makeEmptyExerciseState();
      prev.bestRepsAtWeight['100'] = 8;

      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 10,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.next.bestRepsAtWeight['100']).toBe(10);
    });
  });

  describe('e1RM PR Detection', () => {
    it('detects e1RM PR with higher estimated max', () => {
      const prev = makeEmptyExerciseState();
      prev.bestE1RMKg = 120;

      // 100kg x 10 reps = ~133kg e1RM (using Epley formula)
      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 10,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.cue).toBeDefined();
      expect(result.cue?.message).toContain('e1RM PR');
      expect(result.next.bestE1RMKg).toBeGreaterThan(120);
    });
  });

  describe('Cardio Set Detection', () => {
    it('detects cardio sets with 16+ reps', () => {
      const prev = makeEmptyExerciseState();

      const result = detectCueForWorkingSet({
        weightKg: 50,
        reps: 20,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.cue).toBeDefined();
      expect(result.cue?.message).toContain('CARDIO');
      expect(result.meta.isCardio).toBe(true);
    });

    it('does not detect cardio for sets under 16 reps', () => {
      const prev = makeEmptyExerciseState();

      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 10,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.meta.isCardio).toBe(false);
    });
  });

  describe('State Updates', () => {
    it('updates all relevant state fields on PR', () => {
      const prev = makeEmptyExerciseState();

      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 8,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.next.bestWeightKg).toBe(100);
      expect(result.next.bestRepsAtWeight['100']).toBe(8);
      expect(result.next.bestE1RMKg).toBeGreaterThan(0);
      expect(result.next.workingSetsThisSession).toBe(1);
    });

    it('increments working set counter', () => {
      const prev = makeEmptyExerciseState();
      prev.workingSetsThisSession = 3;

      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 5,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.next.workingSetsThisSession).toBe(4);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero weight gracefully', () => {
      const prev = makeEmptyExerciseState();

      const result = detectCueForWorkingSet({
        weightKg: 0,
        reps: 10,
        unit: 'kg',
        exerciseName: 'Bodyweight Exercise',
        prev,
      });

      expect(result.next.bestWeightKg).toBe(0);
      expect(result.next.workingSetsThisSession).toBe(1);
    });

    it('handles zero reps gracefully', () => {
      const prev = makeEmptyExerciseState();

      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 0,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.next.workingSetsThisSession).toBe(1);
    });

    it('handles negative values by clamping to zero', () => {
      const prev = makeEmptyExerciseState();

      const result = detectCueForWorkingSet({
        weightKg: -50,
        reps: -10,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      // Should handle gracefully without crashing
      expect(result.next).toBeDefined();
    });
  });
});
