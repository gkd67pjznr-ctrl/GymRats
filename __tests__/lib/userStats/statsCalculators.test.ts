// __tests__/lib/userStats/statsCalculators.test.ts
// Tests for user stats calculators including PR recovery detection

import { updateExerciseStats, DetectedPRs } from '@/src/lib/userStats/statsCalculators';
import type { ExerciseStats } from '@/src/lib/userStats/types';
import type { WorkoutSet } from '@/src/lib/workoutModel';

describe('updateExerciseStats', () => {
  const makeSet = (weightKg: number, reps: number): WorkoutSet => ({
    id: `set-${Date.now()}-${Math.random()}`,
    exerciseId: 'bench',
    weightKg,
    reps,
    timestampMs: Date.now(),
  });

  describe('basic PR detection', () => {
    it('detects weight PR on first set', () => {
      const sets = [makeSet(100, 5)];
      const { stats, prs } = updateExerciseStats(undefined, 'bench', sets);

      expect(stats.bestWeightKg).toBe(100);
      expect(prs.length).toBe(1);
      expect(prs[0].weightPR).toBe(true);
    });

    it('detects e1RM PR', () => {
      const existing: ExerciseStats = {
        exerciseId: 'bench',
        bestE1RMKg: 100,
        peakE1RMKg: 100,
        peakAchievedAtMs: Date.now() - 86400000,
        bestWeightKg: 90,
        bestRepsAtWeight: { '90.0': 5 },
        rank: 5,
        progressToNext: 0.5,
        totalVolumeKg: 1000,
        totalSets: 20,
        lastUpdatedMs: Date.now() - 86400000,
      };

      // Higher e1RM but same weight bucket
      const sets = [makeSet(90, 8)]; // e1RM ≈ 114kg
      const { stats, prs } = updateExerciseStats(existing, 'bench', sets);

      expect(stats.bestE1RMKg).toBeGreaterThan(100);
      expect(prs.some(p => p.e1rmPR)).toBe(true);
    });
  });

  describe('recovery PR detection', () => {
    it('detects recovery PR when matching historical peak after decline', () => {
      // Simulate: user had a peak of 120kg e1RM, then declined to 100kg, now back to 120kg
      const existing: ExerciseStats = {
        exerciseId: 'bench',
        bestE1RMKg: 100, // Current best is below peak
        peakE1RMKg: 120, // Historical peak was higher
        peakAchievedAtMs: Date.now() - 30 * 86400000, // Peak was 30 days ago
        bestWeightKg: 100,
        bestRepsAtWeight: { '100.0': 5 },
        rank: 8,
        progressToNext: 0.3,
        totalVolumeKg: 5000,
        totalSets: 100,
        lastUpdatedMs: Date.now() - 86400000,
      };

      // Set that brings e1RM back to peak level (110kg × 5 reps ≈ 128kg e1RM)
      const sets = [makeSet(110, 5)];
      const { stats, prs } = updateExerciseStats(existing, 'bench', sets);

      // Should detect e1RM PR
      expect(prs.some(p => p.e1rmPR)).toBe(true);

      // Should detect recovery PR
      const recoveryPR = prs.find(p => p.isRecoveryPR);
      expect(recoveryPR).toBeDefined();
      expect(recoveryPR?.peakE1RM).toBe(120);
      expect(recoveryPR?.peakAgeMs).toBeGreaterThan(0);
    });

    it('does not mark as recovery when no prior peak existed', () => {
      // First time working out - no historical peak
      const sets = [makeSet(100, 5)];
      const { prs } = updateExerciseStats(undefined, 'bench', sets);

      // Should have e1RM PR but not recovery
      expect(prs.some(p => p.e1rmPR)).toBe(true);
      expect(prs.some(p => p.isRecoveryPR)).toBe(false);
    });

    it('does not mark as recovery when already at peak', () => {
      // User is already at their peak - not a recovery
      const existing: ExerciseStats = {
        exerciseId: 'bench',
        bestE1RMKg: 120,
        peakE1RMKg: 120, // Current = Peak
        peakAchievedAtMs: Date.now() - 7 * 86400000,
        bestWeightKg: 110,
        bestRepsAtWeight: { '110.0': 5 },
        rank: 10,
        progressToNext: 0.5,
        totalVolumeKg: 8000,
        totalSets: 150,
        lastUpdatedMs: Date.now() - 86400000,
      };

      // Higher e1RM - new peak, not recovery
      const sets = [makeSet(115, 5)]; // ≈ 134kg e1RM
      const { prs } = updateExerciseStats(existing, 'bench', sets);

      // Should be a new PR but not a recovery
      expect(prs.some(p => p.e1rmPR)).toBe(true);
      expect(prs.some(p => p.isRecoveryPR)).toBe(false);
    });

    it('updates peak when setting new all-time high', () => {
      const existing: ExerciseStats = {
        exerciseId: 'bench',
        bestE1RMKg: 100,
        peakE1RMKg: 100,
        peakAchievedAtMs: Date.now() - 7 * 86400000,
        bestWeightKg: 90,
        bestRepsAtWeight: {},
        rank: 5,
        progressToNext: 0,
        totalVolumeKg: 1000,
        totalSets: 20,
        lastUpdatedMs: Date.now(),
      };

      const sets = [makeSet(110, 5)]; // ≈ 128kg e1RM (new peak)
      const { stats } = updateExerciseStats(existing, 'bench', sets);

      // Peak should be updated
      expect(stats.peakE1RMKg).toBeGreaterThan(100);
      expect(stats.peakAchievedAtMs).toBeGreaterThan(existing.peakAchievedAtMs);
    });
  });
});
