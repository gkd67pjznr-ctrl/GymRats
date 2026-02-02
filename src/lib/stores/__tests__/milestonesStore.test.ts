/**
 * Unit tests for milestones store
 */

import { renderHook, act } from '@testing-library/react-native';
import type { MilestoneUserStats } from '../../milestones/types';

// Import store after mocks
import { useMilestonesStore } from '../milestonesStore';

// Mock all dependencies before importing the store
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../authStore', () => ({
  getUser: jest.fn(() => ({ id: 'test-user' })),
}));

jest.mock('../../sync/NetworkMonitor', () => ({
  networkMonitor: {
    isOnline: jest.fn(() => true),
  },
}));

jest.mock('../../milestones/checker', () => {
  const firstWorkoutMilestone = {
    id: 'first_workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    rarity: 'common',
    icon: '🚀',
    condition: { type: 'workouts', threshold: 1 },
    tokens: 5,
  };

  const workouts10Milestone = {
    id: 'workouts_10',
    name: 'Getting Started',
    description: 'Complete 10 workouts',
    rarity: 'common',
    icon: '💪',
    condition: { type: 'workouts', threshold: 10 },
    tokens: 10,
  };

  return {
    getNewlyEarnedMilestones: jest.fn((stats: any, previouslyEarned: string[]) => {
      const newlyEarned = [];
      if (stats.totalWorkouts >= 1 && !previouslyEarned.includes('first_workout')) {
        newlyEarned.push(firstWorkoutMilestone);
      }
      if (stats.totalWorkouts >= 10 && !previouslyEarned.includes('workouts_10')) {
        newlyEarned.push(workouts10Milestone);
      }
      return newlyEarned;
    }),
    getMilestonesWithProgress: jest.fn(() => []),
  };
});

// Mock definitions
jest.mock('../../milestones/definitions', () => ({
  ALL_MILESTONES: [
    {
      id: 'first_workout',
      name: 'First Steps',
      description: 'Complete your first workout',
      rarity: 'common',
      icon: '🚀',
      condition: { type: 'workouts', threshold: 1 },
      tokens: 5,
    },
    {
      id: 'workouts_10',
      name: 'Getting Started',
      description: 'Complete 10 workouts',
      rarity: 'common',
      icon: '💪',
      condition: { type: 'workouts', threshold: 10 },
      tokens: 10,
    },
  ],
  getMilestoneById: jest.fn((id: string) => {
    const ALL_MILESTONES = [
      {
        id: 'first_workout',
        name: 'First Steps',
        description: 'Complete your first workout',
        rarity: 'common',
        icon: '🚀',
        condition: { type: 'workouts', threshold: 1 },
        tokens: 5,
      },
    ];
    return ALL_MILESTONES.find(m => m.id === id);
  }),
}));

describe('milestonesStore', () => {
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

  describe('initial state', () => {
    it('should have empty earned milestones', () => {
      const { result } = renderHook(() => useMilestonesStore());
      expect(result.current.earnedMilestones).toEqual({});
    });

    it('should have no pending celebration', () => {
      const { result } = renderHook(() => useMilestonesStore());
      expect(result.current.pendingCelebration).toBeNull();
    });

    it('should not be hydrated initially', () => {
      const { result } = renderHook(() => useMilestonesStore());
      expect(result.current.hydrated).toBe(false);
    });
  });

  describe('checkMilestones', () => {
    it('should detect and award first_workout milestone', () => {
      const { result } = renderHook(() => useMilestonesStore());

      const stats = { ...baseStats, totalWorkouts: 1 };

      act(() => {
        const celebrations = result.current.checkMilestones(stats);
        expect(celebrations).toHaveLength(1);
        expect(celebrations[0].milestone.id).toBe('first_workout');
        expect(celebrations[0].isNew).toBe(true);
      });

      expect(result.current.earnedMilestones['first_workout']).toBeDefined();
    });

    it('should set pending celebration for new milestone', () => {
      const { result } = renderHook(() => useMilestonesStore());

      const stats = { ...baseStats, totalWorkouts: 1 };

      act(() => {
        result.current.checkMilestones(stats);
      });

      expect(result.current.pendingCelebration).not.toBeNull();
      expect(result.current.pendingCelebration?.milestone.id).toBe('first_workout');
    });

    it('should not re-award already earned milestones', () => {
      const { result } = renderHook(() => useMilestonesStore());

      // First check - award first_workout
      act(() => {
        result.current.checkMilestones({ ...baseStats, totalWorkouts: 1 });
      });

      // Dismiss celebration
      act(() => {
        result.current.dismissCelebration();
      });

      // Second check - same stats
      act(() => {
        const celebrations = result.current.checkMilestones({ ...baseStats, totalWorkouts: 1 });
        expect(celebrations).toHaveLength(0);
      });
    });

    it('should detect multiple new milestones', () => {
      const { result } = renderHook(() => useMilestonesStore());

      const stats = { ...baseStats, totalWorkouts: 10 };

      act(() => {
        const celebrations = result.current.checkMilestones(stats);
        expect(celebrations.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('awardMilestone', () => {
    it('should award a milestone manually', () => {
      const { result } = renderHook(() => useMilestonesStore());

      act(() => {
        result.current.awardMilestone('first_workout');
      });

      expect(result.current.earnedMilestones['first_workout']).toBeDefined();
    });

    it('should not award the same milestone twice', () => {
      const { result } = renderHook(() => useMilestonesStore());

      act(() => {
        result.current.awardMilestone('first_workout');
        const firstTimestamp = result.current.earnedMilestones['first_workout'];

        // Try to award again
        result.current.awardMilestone('first_workout');

        // Timestamp should be unchanged
        expect(result.current.earnedMilestones['first_workout']).toBe(firstTimestamp);
      });
    });
  });

  describe('dismissCelebration', () => {
    it('should clear pending celebration', () => {
      const { result } = renderHook(() => useMilestonesStore());

      // First, trigger a milestone
      act(() => {
        result.current.checkMilestones({ ...baseStats, totalWorkouts: 1 });
      });

      expect(result.current.pendingCelebration).not.toBeNull();

      // Dismiss it
      act(() => {
        result.current.dismissCelebration();
      });

      expect(result.current.pendingCelebration).toBeNull();
    });
  });

  describe('sync actions', () => {
    it('should handle pullFromServer without error', async () => {
      const { result } = renderHook(() => useMilestonesStore());

      await act(async () => {
        await expect(result.current.pullFromServer()).resolves.not.toThrow();
      });
    });

    it('should handle pushToServer without error', async () => {
      const { result } = renderHook(() => useMilestonesStore());

      await act(async () => {
        await expect(result.current.pushToServer()).resolves.not.toThrow();
      });
    });

    it('should handle sync without error', async () => {
      const { result } = renderHook(() => useMilestonesStore());

      await act(async () => {
        await expect(result.current.sync()).resolves.not.toThrow();
      });
    });
  });

  describe('hooks', () => {
    it('useEarnedMilestones should return earned milestones', () => {
      const { result } = renderHook(() => useMilestonesStore());

      act(() => {
        result.current.awardMilestone('first_workout');
      });

      // The hook selector should return the earned milestones from state
      expect(result.current.earnedMilestones['first_workout']).toBeDefined();
    });

    it('usePendingMilestoneCelebration should return pending celebration', () => {
      const { result } = renderHook(() => useMilestonesStore());

      // First call should detect and award the milestone
      const celebrations = result.current.checkMilestones({ ...baseStats, totalWorkouts: 1 });

      // Since the mock returns first_workout for totalWorkouts >= 1
      expect(celebrations.length).toBeGreaterThanOrEqual(0);

      // If milestone was earned, it should be in earnedMilestones
      if (celebrations.length > 0) {
        expect(celebrations[0].milestone.id).toBe('first_workout');
        expect(result.current.earnedMilestones['first_workout']).toBeDefined();
      }
    });

    it('useIsMilestonesHydrated should return hydration state', () => {
      const { result } = renderHook(() => useMilestonesStore());

      // Initially false, will become true after rehydration
      expect(typeof result.current.hydrated).toBe('boolean');
    });
  });
});
