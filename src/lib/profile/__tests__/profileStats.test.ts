/**
 * Unit tests for profileStats
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateProfileStats,
  getTopExercisesByRank,
  getExerciseDisplayName,
  getRankTierColor,
  type ProfileStats,
} from '../profileStats';
import type { WorkoutSession } from '../../workoutModel';

// Mock the rankTops data
jest.mock('../../../data/rankTops', () => ({
  RANK_TOPS: [
    { liftId: 'bench', topE1RMKg: 225, lifter: 'Julius Maddox' },
    { liftId: 'squat', topE1RMKg: 265, lifter: 'Ray Williams' },
    { liftId: 'deadlift', topE1RMKg: 360, lifter: 'Hafthor Bjornsson' },
  ],
}));

describe('profileStats', () => {
  describe('calculateProfileStats', () => {
    it('should return empty stats for no sessions', () => {
      const stats = calculateProfileStats([]);

      expect(stats.totalSets).toBe(0);
      expect(stats.totalVolume).toBe(0);
      expect(stats.exercisePRs).toEqual({});
      expect(stats.exerciseRanks).toEqual({});
    });

    it('should calculate stats from workout sessions', () => {
      const sessions: WorkoutSession[] = [
        {
          id: '1',
          userId: 'user1',
          startedAtMs: 1000000,
          endedAtMs: 2000000,
          sets: [
            { id: 's1', exerciseId: 'bench', weightKg: 100, reps: 5, timestampMs: 1100000 },
            { id: 's2', exerciseId: 'squat', weightKg: 120, reps: 5, timestampMs: 1200000 },
          ],
        },
      ];

      const stats = calculateProfileStats(sessions);

      expect(stats.totalSets).toBe(2);
      expect(stats.totalVolume).toBe(100 * 5 + 120 * 5); // 500 + 600 = 1100
      expect(stats.exercisePRs['bench']).toBeDefined();
      expect(stats.exercisePRs['squat']).toBeDefined();
    });

    it('should track best e1RM per exercise', () => {
      const sessions: WorkoutSession[] = [
        {
          id: '1',
          userId: 'user1',
          startedAtMs: 1000000,
          endedAtMs: 2000000,
          sets: [
            { id: 's1', exerciseId: 'bench', weightKg: 100, reps: 5, timestampMs: 1100000 },
            { id: 's2', exerciseId: 'bench', weightKg: 110, reps: 3, timestampMs: 1200000 },
          ],
        },
      ];

      const stats = calculateProfileStats(sessions);

      const benchPR = stats.exercisePRs['bench'];
      expect(benchPR.bestWeightKg).toBe(110);
      // Best e1RM is from 110kg x 3 = 110 * (1 + 3/30) = 121
      expect(benchPR.bestE1RMKg).toBeCloseTo(110 * (1 + 3 / 30)); // ~121
    });

    it('should calculate exercise ranks for tracked exercises', () => {
      const sessions: WorkoutSession[] = [
        {
          id: '1',
          userId: 'user1',
          startedAtMs: 1000000,
          endedAtMs: 2000000,
          sets: [
            { id: 's1', exerciseId: 'bench', weightKg: 100, reps: 5, timestampMs: 1100000 },
          ],
        },
      ];

      const stats = calculateProfileStats(sessions);

      expect(stats.exerciseRanks['bench']).toBeDefined();
      expect(stats.exerciseRanks['bench'].rankNumber).toBeGreaterThan(0);
    });
  });

  describe('getTopExercisesByRank', () => {
    it('should return empty array for no stats', () => {
      const stats: ProfileStats = {
        totalWeightPRs: 0,
        totalRepPRs: 0,
        totalE1RMPRs: 0,
        totalPRs: 0,
        exercisePRs: {},
        exerciseRanks: {},
        totalSets: 0,
        totalVolume: 0,
      };

      const top = getTopExercisesByRank(stats, 5);
      expect(top).toEqual([]);
    });

    it('should return exercises sorted by rank', () => {
      const stats: ProfileStats = {
        totalWeightPRs: 0,
        totalRepPRs: 0,
        totalE1RMPRs: 0,
        totalPRs: 2,
        exercisePRs: {
          bench: {
            exerciseId: 'bench',
            bestWeightKg: 100,
            bestWeightReps: 5,
            bestE1RMKg: 120,
            bestE1RMSet: null,
            lastUpdatedMs: 1000000,
          },
          squat: {
            exerciseId: 'squat',
            bestWeightKg: 140,
            bestWeightReps: 5,
            bestE1RMKg: 160,
            bestE1RMSet: null,
            lastUpdatedMs: 1000000,
          },
        },
        exerciseRanks: {
          bench: {
            exerciseId: 'bench',
            rankIndex: 5,
            rankNumber: 6,
            currentE1RMKg: 120,
            progressToNext: 0.5,
            tier: 'silver',
          },
          squat: {
            exerciseId: 'squat',
            rankIndex: 8,
            rankNumber: 9,
            currentE1RMKg: 160,
            progressToNext: 0.3,
            tier: 'gold',
          },
        },
        totalSets: 10,
        totalVolume: 5000,
      };

      const top = getTopExercisesByRank(stats, 5);

      expect(top.length).toBe(2);
      expect(top[0].exerciseId).toBe('squat'); // Higher rank first
      expect(top[1].exerciseId).toBe('bench');
    });

    it('should limit results', () => {
      const stats: ProfileStats = {
        totalWeightPRs: 0,
        totalRepPRs: 0,
        totalE1RMPRs: 0,
        totalPRs: 5,
        exercisePRs: {
          bench: {
            exerciseId: 'bench',
            bestWeightKg: 100,
            bestWeightReps: 5,
            bestE1RMKg: 120,
            bestE1RMSet: null,
            lastUpdatedMs: 1000000,
          },
          squat: {
            exerciseId: 'squat',
            bestWeightKg: 140,
            bestWeightReps: 5,
            bestE1RMKg: 160,
            bestE1RMSet: null,
            lastUpdatedMs: 1000000,
          },
          deadlift: {
            exerciseId: 'deadlift',
            bestWeightKg: 180,
            bestWeightReps: 5,
            bestE1RMKg: 200,
            bestE1RMSet: null,
            lastUpdatedMs: 1000000,
          },
        },
        exerciseRanks: {
          bench: {
            exerciseId: 'bench',
            rankIndex: 2,
            rankNumber: 3,
            currentE1RMKg: 120,
            progressToNext: 0.5,
            tier: 'bronze',
          },
          squat: {
            exerciseId: 'squat',
            rankIndex: 5,
            rankNumber: 6,
            currentE1RMKg: 160,
            progressToNext: 0.3,
            tier: 'silver',
          },
          deadlift: {
            exerciseId: 'deadlift',
            rankIndex: 8,
            rankNumber: 9,
            currentE1RMKg: 200,
            progressToNext: 0.2,
            tier: 'gold',
          },
        },
        totalSets: 15,
        totalVolume: 10000,
      };

      const top = getTopExercisesByRank(stats, 2);

      expect(top.length).toBe(2);
      expect(top[0].exerciseId).toBe('deadlift');
      expect(top[1].exerciseId).toBe('squat');
    });
  });

  describe('getExerciseDisplayName', () => {
    it('should return known exercise names', () => {
      expect(getExerciseDisplayName('bench')).toBe('Bench Press');
      expect(getExerciseDisplayName('squat')).toBe('Squat');
      expect(getExerciseDisplayName('deadlift')).toBe('Deadlift');
      expect(getExerciseDisplayName('ohp')).toBe('Overhead Press');
    });

    it('should format unknown exercise IDs', () => {
      expect(getExerciseDisplayName('leg_press')).toBe('Leg Press');
      expect(getExerciseDisplayName('lat_pulldown')).toBe('Lat Pulldown');
    });

    it('should handle multi-word exercises', () => {
      expect(getExerciseDisplayName('incline_bench')).toBe('Incline Bench');
    });
  });

  describe('getRankTierColor', () => {
    it('should return correct colors for each tier', () => {
      expect(getRankTierColor('iron')).toBe('#8B8B8B');
      expect(getRankTierColor('bronze')).toBe('#CD7F32');
      expect(getRankTierColor('silver')).toBe('#C0C0C0');
      expect(getRankTierColor('gold')).toBe('#FFD700');
      expect(getRankTierColor('platinum')).toBe('#E5E4E2');
      expect(getRankTierColor('diamond')).toBe('#B9F2FF');
      expect(getRankTierColor('mythic')).toBe('#FF6B9D');
    });
  });
});
