/**
 * Unit tests for milestone checker
 */

import {
  getEarnedMilestoneIds,
  getNewlyEarnedMilestones,
  isMilestoneEarned,
  getMilestonesWithProgress,
  getMilestoneStats,
} from '../checker';
import type { MilestoneUserStats } from '../types';

describe('Milestone Checker', () => {
  const baseStats: MilestoneUserStats = {
    totalWorkouts: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPRs: 0,
    currentLevel: 1,
    totalSets: 0,
    exercisesLogged: 0,
    exercisesRanked: 0,
    exerciseRanks: {},
    exerciseMaxWeights: {},
    hasSharedWorkout: false,
  };

  describe('getEarnedMilestoneIds', () => {
    it('should return empty array for new user', () => {
      const earned = getEarnedMilestoneIds(baseStats);
      expect(earned).toEqual([]);
    });

    it('should include first_workout when totalWorkouts >= 1', () => {
      const stats = { ...baseStats, totalWorkouts: 1 };
      const earned = getEarnedMilestoneIds(stats);
      expect(earned).toContain('first_workout');
    });

    it('should include workouts_10 when totalWorkouts >= 10', () => {
      const stats = { ...baseStats, totalWorkouts: 10 };
      const earned = getEarnedMilestoneIds(stats);
      expect(earned).toContain('workouts_10');
    });

    it('should include first_pr when totalPRs >= 1', () => {
      const stats = { ...baseStats, totalPRs: 1 };
      const earned = getEarnedMilestoneIds(stats);
      expect(earned).toContain('first_pr');
    });

    it('should include first_rank_up when exercisesRanked >= 1', () => {
      const stats = { ...baseStats, exercisesRanked: 1 };
      const earned = getEarnedMilestoneIds(stats);
      expect(earned).toContain('first_rank_up');
    });

    it('should include streak_7 when longestStreak >= 7', () => {
      const stats = { ...baseStats, longestStreak: 7 };
      const earned = getEarnedMilestoneIds(stats);
      expect(earned).toContain('streak_7');
    });

    it('should include exercises_5 when exercisesLogged >= 5', () => {
      const stats = { ...baseStats, exercisesLogged: 5 };
      const earned = getEarnedMilestoneIds(stats);
      expect(earned).toContain('exercises_5');
    });

    it('should include first_share when hasSharedWorkout is true', () => {
      const stats = { ...baseStats, hasSharedWorkout: true };
      const earned = getEarnedMilestoneIds(stats);
      expect(earned).toContain('first_share');
    });

    it('should include level_10 when currentLevel >= 10', () => {
      const stats = { ...baseStats, currentLevel: 10 };
      const earned = getEarnedMilestoneIds(stats);
      expect(earned).toContain('level_10');
    });

    it('should include sets_1000 when totalSets >= 1000', () => {
      const stats = { ...baseStats, totalSets: 1000 };
      const earned = getEarnedMilestoneIds(stats);
      expect(earned).toContain('sets_1000');
    });

    it('should include multiple milestones when conditions met', () => {
      const stats = {
        ...baseStats,
        totalWorkouts: 15,
        longestStreak: 10,
        totalPRs: 5,
        exercisesLogged: 8,
      };
      const earned = getEarnedMilestoneIds(stats);
      expect(earned).toContain('first_workout');
      expect(earned).toContain('workouts_10');
      expect(earned).toContain('first_pr');
      expect(earned).toContain('streak_7');
      expect(earned).toContain('exercises_5');
    });
  });

  describe('getNewlyEarnedMilestones', () => {
    it('should return newly earned milestones not in previous list', () => {
      const stats = { ...baseStats, totalWorkouts: 15 };
      const previouslyEarned = ['first_workout'];
      const newMilestones = getNewlyEarnedMilestones(stats, previouslyEarned);

      expect(newMilestones.length).toBeGreaterThan(0);
      expect(newMilestones.every(m => m.id !== 'first_workout')).toBe(true);
      expect(newMilestones.some(m => m.id === 'workouts_10')).toBe(true);
    });

    it('should return empty array when all previously earned', () => {
      const stats = { ...baseStats, totalWorkouts: 5 };
      const previouslyEarned = getEarnedMilestoneIds(stats);
      const newMilestones = getNewlyEarnedMilestones(stats, previouslyEarned);

      expect(newMilestones).toEqual([]);
    });
  });

  describe('isMilestoneEarned', () => {
    it('should return true for earned milestone', () => {
      const stats = { ...baseStats, totalWorkouts: 10 };
      expect(isMilestoneEarned('workouts_10', stats)).toBe(true);
    });

    it('should return false for unearned milestone', () => {
      const stats = { ...baseStats, totalWorkouts: 5 };
      expect(isMilestoneEarned('workouts_10', stats)).toBe(false);
    });

    it('should return false for invalid milestone', () => {
      const stats = baseStats;
      expect(isMilestoneEarned('invalid_milestone', stats)).toBe(false);
    });
  });

  describe('getMilestonesWithProgress', () => {
    it('should mark earned milestones correctly', () => {
      const stats = { ...baseStats, totalWorkouts: 10 };
      const earned = { 'first_workout': Date.now() };
      const withProgress = getMilestonesWithProgress(stats, earned);

      const firstWorkout = withProgress.find(m => m.id === 'first_workout');
      expect(firstWorkout?.isEarned).toBe(true);

      const workouts_10 = withProgress.find(m => m.id === 'workouts_10');
      expect(workouts_10?.isEarned).toBe(false);
    });

    it('should calculate progress percentage correctly', () => {
      const stats = { ...baseStats, totalWorkouts: 5 };
      const earned = {};
      const withProgress = getMilestonesWithProgress(stats, earned);

      const workouts_10 = withProgress.find(m => m.id === 'workouts_10');
      expect(workouts_10?.progress).toBe(50); // 5/10 = 50%
      expect(workouts_10?.currentValue).toBe(5);
    });

    it('should cap progress at 100%', () => {
      const stats = { ...baseStats, totalWorkouts: 20 };
      const earned = {};
      const withProgress = getMilestonesWithProgress(stats, earned);

      const workouts_10 = withProgress.find(m => m.id === 'workouts_10');
      expect(workouts_10?.progress).toBe(100);
    });
  });

  describe('getMilestoneStats', () => {
    it('should calculate correct totals and earned counts', () => {
      const stats = { ...baseStats, totalWorkouts: 10 };
      const earnedIds = ['first_workout', 'workouts_10'];
      const milestoneStats = getMilestoneStats(stats, earnedIds);

      expect(milestoneStats.earned).toBe(2);
      expect(milestoneStats.total).toBeGreaterThan(0);
      expect(milestoneStats.completionPercent).toBeGreaterThan(0);
    });

    it('should breakdown by rarity', () => {
      const stats = { ...baseStats, totalWorkouts: 10 };
      const earnedIds = ['first_workout', 'workouts_10'];
      const milestoneStats = getMilestoneStats(stats, earnedIds);

      expect(milestoneStats.byRarity.common).toBeDefined();
      expect(milestoneStats.byRarity.rare).toBeDefined();
      expect(milestoneStats.byRarity.epic).toBeDefined();
      expect(milestoneStats.byRarity.legendary).toBeDefined();
    });
  });
});
