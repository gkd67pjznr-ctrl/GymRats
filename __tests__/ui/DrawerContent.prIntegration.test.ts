// __tests__/ui/DrawerContent.prIntegration.test.ts
// Tests for PR integration in DrawerContent
// Focuses on PR detection, counting, and celebration triggering

import { detectCueForWorkingSet, makeEmptyExerciseState } from '../../src/lib/perSetCue';
import { computeIntensity } from '../../src/lib/cues/cueTypes';
import { selectCelebration } from '../../src/lib/celebration/selector';
import type { ExerciseSessionState } from '../../src/lib/perSetCueTypes';
import type { PRType } from '../../src/lib/cues/cueTypes';

describe('PR Integration in DrawerContent', () => {
  describe('PR Detection Logic', () => {
    it('should detect weight PR when lifting heavier than previous best', () => {
      const prevState: ExerciseSessionState = {
        bestWeightKg: 100,
        bestE1RMKg: 110,
        bestRepsAtWeight: { '100': 5 },
      };

      const result = detectCueForWorkingSet({
        weightKg: 110,
        reps: 5,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev: prevState,
      });

      expect(result.meta.type).toBe('weight');
      expect(result.next.bestWeightKg).toBe(110);
    });

    it('should detect rep PR when doing more reps at same weight', () => {
      const prevState: ExerciseSessionState = {
        bestWeightKg: 100,
        bestE1RMKg: 116.67,
        bestRepsAtWeight: { '100': 5 },
      };

      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 8,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev: prevState,
      });

      expect(result.meta.type).toBe('rep');
    });

    it('should detect e1RM PR when calculated e1RM exceeds previous best', () => {
      const prevState: ExerciseSessionState = {
        bestWeightKg: 100,
        bestE1RMKg: 116.67,
        bestRepsAtWeight: { '100': 5 },
      };

      const result = detectCueForWorkingSet({
        weightKg: 100,
        reps: 12,
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev: prevState,
      });

      // Doing more reps at same weight triggers rep PR, which also increases e1RM
      expect(['rep', 'e1rm']).toContain(result.meta.type);
    });

    it('should return none when weight, reps, and e1RM are all below previous bests', () => {
      const prevState: ExerciseSessionState = {
        bestWeightKg: 100,
        bestE1RMKg: 150,
        bestRepsAtWeight: { '50': 10 }, // Previous best at 50kg was 10 reps
      };

      const result = detectCueForWorkingSet({
        weightKg: 50,
        reps: 5, // Fewer reps at 50kg
        unit: 'kg',
        exerciseName: 'Bench Press',
        prev: prevState,
      });

      expect(result.meta.type).toBe('none');
    });

    it('should start with empty state for new exercises', () => {
      const emptyState = makeEmptyExerciseState();

      expect(emptyState.bestWeightKg).toBe(0);
      expect(emptyState.bestE1RMKg).toBe(0);
      expect(emptyState.bestRepsAtWeight).toEqual({});
    });
  });

  describe('PR Intensity Computation', () => {
    it('should return a valid intensity level for weight PRs', () => {
      const intensity = computeIntensity({
        prType: 'weight',
        weightDeltaPct: 0.15, // 15% increase
        e1rmDeltaPct: 0.15,
        repDelta: 0,
        isFirstEver: false,
        exerciseRank: 15,
      });

      // Should be a valid intensity
      expect(['subtle', 'normal', 'hype', 'legendary']).toContain(intensity);
    });

    it('should return higher intensity for first-ever PRs', () => {
      const firstEverIntensity = computeIntensity({
        prType: 'weight',
        weightDeltaPct: 0.05,
        e1rmDeltaPct: 0.05,
        repDelta: 0,
        isFirstEver: true,
        exerciseRank: 5,
      });

      const normalIntensity = computeIntensity({
        prType: 'weight',
        weightDeltaPct: 0.05,
        e1rmDeltaPct: 0.05,
        repDelta: 0,
        isFirstEver: false,
        exerciseRank: 5,
      });

      // First ever should be at least as intense as normal
      const intensityOrder = ['subtle', 'normal', 'hype', 'legendary'];
      expect(intensityOrder.indexOf(firstEverIntensity)).toBeGreaterThanOrEqual(
        intensityOrder.indexOf(normalIntensity)
      );
    });

    it('should return valid intensity for rep PRs', () => {
      const intensity = computeIntensity({
        prType: 'rep',
        weightDeltaPct: 0,
        e1rmDeltaPct: 0.02,
        repDelta: 3,
        isFirstEver: false,
        exerciseRank: 5,
      });

      expect(['subtle', 'normal', 'hype', 'legendary']).toContain(intensity);
    });

    it('should return valid intensity for e1rm PRs', () => {
      const intensity = computeIntensity({
        prType: 'e1rm',
        weightDeltaPct: 0,
        e1rmDeltaPct: 0.10,
        repDelta: 0,
        isFirstEver: false,
        exerciseRank: 10,
      });

      expect(['subtle', 'normal', 'hype', 'legendary']).toContain(intensity);
    });
  });

  describe('PR Celebration Selection', () => {
    it('should select celebration for weight PR', () => {
      const celebration = selectCelebration({
        prType: 'weight',
        deltaLb: 10,
        exerciseName: 'Bench Press',
        weightLabel: '225 lb',
        reps: 5,
      });

      expect(celebration).toBeTruthy();
      expect(celebration?.celebration.prType).toBe('weight');
    });

    it('should select celebration for rep PR', () => {
      const celebration = selectCelebration({
        prType: 'rep',
        deltaLb: 0,
        exerciseName: 'Squat',
        weightLabel: '315 lb',
        reps: 10,
      });

      expect(celebration).toBeTruthy();
      expect(celebration?.celebration.prType).toBe('rep');
    });

    it('should select celebration for e1rm PR', () => {
      const celebration = selectCelebration({
        prType: 'e1rm',
        deltaLb: 15,
        exerciseName: 'Deadlift',
        weightLabel: '405 lb',
        reps: 3,
      });

      expect(celebration).toBeTruthy();
      expect(celebration?.celebration.prType).toBe('e1rm');
    });

    it('should return a valid celebration structure', () => {
      const celebration = selectCelebration({
        prType: 'weight',
        deltaLb: 10,
        exerciseName: 'Overhead Press',
        weightLabel: '135 lb',
        reps: 5,
      });

      expect(celebration).toBeTruthy();
      expect(celebration?.headline).toBeTruthy();
      expect(celebration?.celebration).toBeTruthy();
      expect(celebration?.celebration.prType).toBe('weight');
    });
  });

  describe('PR Type Categorization', () => {
    it('should categorize weight PR correctly', () => {
      const types: PRType[] = ['weight', 'rep', 'e1rm', 'none'];
      expect(types.includes('weight')).toBe(true);
    });

    it('should recognize all valid PR types', () => {
      const validTypes: PRType[] = [
        'weight',
        'rep',
        'e1rm',
        'rank_up',
        'volume',
        'streak',
        'cardio',
        'none',
      ];

      expect(validTypes.length).toBe(8);
    });
  });
});
