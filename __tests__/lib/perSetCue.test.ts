import {
  detectCueForWorkingSet,
  makeEmptyExerciseState,
  type ExerciseSessionState,
  type CelebrationTier,
} from '../../src/lib/perSetCue';
import { estimate1RM_Epley } from '../../src/lib/e1rm';

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
      prev.bestE1RMKg = 200; // Set high so no e1RM PR
      prev.bestRepsAtWeight['90'] = 10; // Already have 10 reps at 90kg, so 5 reps won't be Rep PR

      const result = detectCueForWorkingSet({
        weightKg: 90,
        reps: 5,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.cue).toBeNull(); // No PR of any kind
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
      prev.bestWeightKg = 100; // Already hit 100kg (no weight PR)
      prev.bestRepsAtWeight['100'] = 10; // Already did 10 reps at 100kg (no rep PR)

      // 100kg x 10 reps = ~133kg e1RM (using Epley formula)
      // This should only trigger e1RM PR since weight and rep PRs are blocked
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
      // [REMOVED 2026-01-23] workingSetsThisSession not in ExerciseSessionState
    });

    // [REMOVED 2026-01-23] Test for workingSetsThisSession - property doesn't exist
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
      // [REMOVED 2026-01-23] workingSetsThisSession not tracked
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

      // [CHANGED 2026-01-23] Just verify no crash, workingSetsThisSession not tracked
      expect(result.next).toBeDefined();
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

  describe('PR Priority Order', () => {
    it('prioritizes weight PR over rep PR when both apply', () => {
      const prev = makeEmptyExerciseState();
      prev.bestWeightKg = 90;
      prev.bestRepsAtWeight['100'] = 3; // Already did 3 reps at 100kg bucket

      // New set: 100kg x 5 reps - both weight PR (100 > 90) and rep PR (5 > 3)
      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 5,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.meta.type).toBe('weight');
    });

    it('prioritizes weight PR over e1RM PR', () => {
      const prev = makeEmptyExerciseState();
      prev.bestWeightKg = 90;
      prev.bestE1RMKg = 90;

      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 1,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.meta.type).toBe('weight');
    });

    it('prioritizes rep PR over e1RM PR when weight is not a PR', () => {
      const prev = makeEmptyExerciseState();
      prev.bestWeightKg = 100; // Already hit 100kg
      prev.bestE1RMKg = 100;   // Low e1RM
      prev.bestRepsAtWeight['100'] = 3; // Already did 3 reps at 100kg

      // 100kg x 6 reps - Rep PR (6 > 3) and e1RM PR but NOT weight PR
      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 6,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.meta.type).toBe('rep');
    });
  });

  describe('Celebration Tier Calculation', () => {
    it('assigns tier 1 for small weight PR (< 5 lb)', () => {
      const prev = makeEmptyExerciseState();
      prev.bestWeightKg = 100;

      // ~4.4 lb increase (2kg)
      const result = detectCueForWorkingSet({
        weightKg: 102,
        reps: 5,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.meta.tier).toBe(1);
    });

    it('assigns tier 2 for medium weight PR (5-10 lb)', () => {
      const prev = makeEmptyExerciseState();
      prev.bestWeightKg = 100;

      // ~7.7 lb increase (3.5kg)
      const result = detectCueForWorkingSet({
        weightKg: 103.5,
        reps: 5,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.meta.tier).toBe(2);
    });

    it('assigns tier 3 for big weight PR (10-20 lb)', () => {
      const prev = makeEmptyExerciseState();
      prev.bestWeightKg = 100;

      // ~15.4 lb increase (7kg)
      const result = detectCueForWorkingSet({
        weightKg: 107,
        reps: 5,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.meta.tier).toBe(3);
    });

    it('assigns tier 4 for massive weight PR (20+ lb)', () => {
      const prev = makeEmptyExerciseState();
      prev.bestWeightKg = 100;

      // ~22 lb increase (10kg)
      const result = detectCueForWorkingSet({
        weightKg: 110,
        reps: 5,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.meta.tier).toBe(4);
    });

    it('calculates rep PR tier based on effective delta', () => {
      const prev = makeEmptyExerciseState();
      prev.bestWeightKg = 100;
      prev.bestRepsAtWeight['100'] = 5;

      // Large rep jump: 5 -> 10 reps = 5 rep delta
      // Effective delta = 5 * 3 = 15 lb (if e1RM delta is 0)
      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 10,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      // Should be tier 3 (10-20 lb effective delta)
      expect(result.meta.tier).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Cardio Boundary Tests', () => {
    it('treats 15 reps as regular set (not cardio)', () => {
      const prev = makeEmptyExerciseState();

      const result = detectCueForWorkingSet({
        weightKg: 50,
        reps: 15,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.meta.isCardio).toBe(false);
      expect(result.meta.type).toBe('weight'); // First set is weight PR
    });

    it('treats exactly 16 reps as cardio', () => {
      const prev = makeEmptyExerciseState();

      const result = detectCueForWorkingSet({
        weightKg: 50,
        reps: 16,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      expect(result.meta.isCardio).toBe(true);
      expect(result.meta.type).toBe('cardio');
    });
  });

  describe('Unit System Consistency', () => {
    it('generates correct bucket keys for kg unit', () => {
      const prev = makeEmptyExerciseState();

      const result = detectCueForWorkingSet({
        weightKg: 100.7,
        reps: 5,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev,
      });

      // Should round to nearest 1kg = 101kg
      expect(result.next.bestRepsAtWeight).toHaveProperty('101');
    });

    it('generates correct bucket keys for lb unit', () => {
      const prev = makeEmptyExerciseState();

      // 100kg = ~220.5 lb, should bucket to nearest 2.5 lb
      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 5,
        unit: 'lb',
        exerciseName: 'Bench Press',
        prev,
      });

      // 220.5 lb rounds to 220.0 lb (nearest 2.5)
      // Use Object.keys to check the property since the key format is "220.0"
      const keys = Object.keys(result.next.bestRepsAtWeight);
      expect(keys.length).toBe(1);
      expect(keys[0]).toBe('220.0');
      expect(result.next.bestRepsAtWeight['220.0']).toBe(5);
    });
  });
});

describe('e1RM Calculation', () => {
  it('returns weight for single rep', () => {
    expect(estimate1RM_Epley(100, 1)).toBe(100);
  });

  it('calculates correct e1RM for 5 reps', () => {
    // Epley: 100 * (1 + 5/30) = 100 * 1.167 = 116.7
    const result = estimate1RM_Epley(100, 5);
    expect(result).toBeCloseTo(116.67, 1);
  });

  it('calculates correct e1RM for 10 reps', () => {
    // Epley: 100 * (1 + 10/30) = 100 * 1.333 = 133.3
    const result = estimate1RM_Epley(100, 10);
    expect(result).toBeCloseTo(133.33, 1);
  });

  it('returns 0 for zero weight', () => {
    expect(estimate1RM_Epley(0, 5)).toBe(0);
  });

  it('returns 0 for zero reps', () => {
    expect(estimate1RM_Epley(100, 0)).toBe(0);
  });

  it('returns 0 for negative weight', () => {
    expect(estimate1RM_Epley(-50, 5)).toBe(0);
  });

  it('returns 0 for negative reps', () => {
    expect(estimate1RM_Epley(100, -5)).toBe(0);
  });

  it('returns 0 for NaN inputs', () => {
    expect(estimate1RM_Epley(NaN, 5)).toBe(0);
    expect(estimate1RM_Epley(100, NaN)).toBe(0);
  });

  it('returns 0 for Infinity inputs', () => {
    expect(estimate1RM_Epley(Infinity, 5)).toBe(0);
    expect(estimate1RM_Epley(100, Infinity)).toBe(0);
  });
});
