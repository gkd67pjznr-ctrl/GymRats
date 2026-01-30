/**
 * Unit tests for milestonesRepository
 */

import {
  dbRowToEarnedMilestone,
  earnedMilestoneToDbInsert,
  mergeMilestones,
} from '../milestonesRepository';

// Mock Supabase client
jest.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      upsert: jest.fn(() => ({ error: null })),
    })),
    removeChannel: jest.fn(),
  },
}));

describe('milestonesRepository', () => {
  describe('dbRowToEarnedMilestone', () => {
    it('should convert database row to EarnedMilestone', () => {
      const dbRow = {
        id: '123',
        user_id: 'user-abc',
        milestone_id: 'first_workout',
        earned_at: 1706659200000,
        created_at: '2024-01-30T12:00:00Z',
      };

      const result = dbRowToEarnedMilestone(dbRow);

      expect(result).toEqual({
        userId: 'user-abc',
        milestoneId: 'first_workout',
        earnedAt: 1706659200000,
      });
    });
  });

  describe('earnedMilestoneToDbInsert', () => {
    it('should convert EarnedMilestone to database insert format', () => {
      const milestone = {
        userId: 'user-abc',
        milestoneId: 'first_workout',
        earnedAt: 1706659200000,
      };

      const result = earnedMilestoneToDbInsert(milestone);

      expect(result).toEqual({
        user_id: 'user-abc',
        milestone_id: 'first_workout',
        earned_at: 1706659200000,
      });
      // Should not include id or created_at
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('created_at');
    });
  });

  describe('mergeMilestones', () => {
    it('should merge empty local with empty server', () => {
      const result = mergeMilestones({}, {});
      expect(result).toEqual({});
    });

    it('should merge local milestones with empty server', () => {
      const local = {
        first_workout: 1706659200000,
        streak_7: 1706745600000,
      };

      const result = mergeMilestones(local, {});
      expect(result).toEqual(local);
    });

    it('should merge empty local with server milestones', () => {
      const server = {
        first_workout: 1706659200000,
        pr_10: 1706832000000,
      };

      const result = mergeMilestones({}, server);
      expect(result).toEqual(server);
    });

    it('should merge local and server with union of milestones', () => {
      const local = {
        first_workout: 1706659200000,
        streak_7: 1706745600000,
      };

      const server = {
        first_workout: 1706659000000, // Earlier timestamp
        pr_10: 1706832000000,
      };

      const result = mergeMilestones(local, server);

      // Should have all milestones
      expect(result).toHaveProperty('first_workout');
      expect(result).toHaveProperty('streak_7');
      expect(result).toHaveProperty('pr_10');

      // first_workout should use earlier timestamp (server)
      expect(result.first_workout).toBe(1706659000000);

      // streak_7 should use local (only in local)
      expect(result.streak_7).toBe(1706745600000);

      // pr_10 should use server (only in server)
      expect(result.pr_10).toBe(1706832000000);
    });

    it('should keep earlier timestamp when milestone exists in both', () => {
      const local = {
        first_workout: 1706659200000, // Later
      };

      const server = {
        first_workout: 1706659000000, // Earlier
      };

      const result = mergeMilestones(local, server);
      expect(result.first_workout).toBe(1706659000000);
    });

    it('should keep later timestamp when server is newer', () => {
      const local = {
        first_workout: 1706659000000, // Earlier
      };

      const server = {
        first_workout: 1706659200000, // Later
      };

      const result = mergeMilestones(local, server);
      expect(result.first_workout).toBe(1706659000000); // Still keeps earlier
    });

    it('should handle multiple milestones with different timestamps', () => {
      const local = {
        first_workout: 1706659200000,
        streak_7: 1706745600000,
        level_5: 1706918400000,
      };

      const server = {
        first_workout: 1706659000000,
        pr_10: 1706832000000,
        level_5: 1706918200000,
      };

      const result = mergeMilestones(local, server);

      expect(Object.keys(result)).toHaveLength(4);
      expect(result.first_workout).toBe(1706659000000); // Earlier (server)
      expect(result.streak_7).toBe(1706745600000); // Only local
      expect(result.pr_10).toBe(1706832000000); // Only server
      expect(result.level_5).toBe(1706918200000); // Earlier (server)
    });
  });
});
