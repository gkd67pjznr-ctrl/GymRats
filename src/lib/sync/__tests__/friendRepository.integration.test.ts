// Integration tests for friendRepository with real Supabase backend
// These tests require a live Supabase test instance with friendships table

import type { FriendEdge } from '../../socialModel';
import type { FriendRepository } from '../repositories/friendRepository';
import { describeWithSupabase, testWithSupabase } from './integrationTestHelpers';

// We'll dynamically import the repository after setting up mocks
let friendRepository: FriendRepository;

// Test user IDs - using UUID-like strings to avoid collisions
const TEST_USER_ID = 'test-user-123';
const TEST_FRIEND_ID = 'test-friend-456';
const TEST_OTHER_ID = 'test-other-789';

describeWithSupabase('friendRepository Integration', () => {
  beforeAll(async () => {
    // Setup: Mock the supabase client with test credentials
    // We need to override the supabase client before importing the repository
    const { url, anonKey } = await import('./integrationTestHelpers').then(m => m.getTestSupabaseCredentials());

    // Mock the supabase client module to return a client with test credentials
    // Preserve the original healthCheck function (it will use the mocked supabase)
    jest.doMock('../../../supabase/client', () => {
      const actual = jest.requireActual('../../../supabase/client');
      const { createClient } = require('@supabase/supabase-js');
      return {
        ...actual,
        supabase: createClient(url, anonKey),
      };
    });

    // Now import the repository (after mocking)
    friendRepository = (await import('../repositories/friendRepository')).friendRepository;
  });

  afterEach(async () => {
    // Clean up test data after each test
    try {
      // Delete any test friendships involving our test users
      await friendRepository.delete(TEST_USER_ID, TEST_FRIEND_ID);
      await friendRepository.delete(TEST_USER_ID, TEST_OTHER_ID);
      await friendRepository.delete(TEST_FRIEND_ID, TEST_USER_ID);
      await friendRepository.delete(TEST_FRIEND_ID, TEST_OTHER_ID);
      await friendRepository.delete(TEST_OTHER_ID, TEST_USER_ID);
      await friendRepository.delete(TEST_OTHER_ID, TEST_FRIEND_ID);
    } catch (error) {
      // Ignore errors if rows don't exist
      console.warn('Cleanup error (likely missing rows):', error);
    }
  });

  describe('fetchAll', () => {
    testWithSupabase('should return empty array when no friendships exist', async () => {
      const edges = await friendRepository.fetchAll(TEST_USER_ID);
      expect(edges).toEqual([]);
    });

    testWithSupabase('should return friendships where user is user_id or friend_id', async () => {
      // Create test friendships
      const edge1: FriendEdge = {
        userId: TEST_USER_ID,
        otherUserId: TEST_FRIEND_ID,
        status: 'friends',
        updatedAtMs: Date.now(),
      };
      const edge2: FriendEdge = {
        userId: TEST_FRIEND_ID,
        otherUserId: TEST_OTHER_ID,
        status: 'requested',
        updatedAtMs: Date.now(),
      };

      await friendRepository.upsert(edge1);
      await friendRepository.upsert(edge2);

      // Fetch for TEST_USER_ID - should get edge1 (both directions)
      const edges = await friendRepository.fetchAll(TEST_USER_ID);
      expect(edges).toHaveLength(1);
      expect(edges[0].userId).toBe(TEST_USER_ID);
      expect(edges[0].otherUserId).toBe(TEST_FRIEND_ID);

      // Fetch for TEST_FRIEND_ID - should get both edges (since friend_id in edge1, user_id in edge2)
      const edges2 = await friendRepository.fetchAll(TEST_FRIEND_ID);
      expect(edges2).toHaveLength(2);
      // Should contain both relationships
      const hasEdge1 = edges2.some(e => e.userId === TEST_USER_ID && e.otherUserId === TEST_FRIEND_ID);
      const hasEdge2 = edges2.some(e => e.userId === TEST_FRIEND_ID && e.otherUserId === TEST_OTHER_ID);
      expect(hasEdge1).toBe(true);
      expect(hasEdge2).toBe(true);
    });
  });

  describe('upsert', () => {
    testWithSupabase('should create new friendship', async () => {
      const edge: FriendEdge = {
        userId: TEST_USER_ID,
        otherUserId: TEST_FRIEND_ID,
        status: 'friends',
        updatedAtMs: Date.now(),
      };

      await friendRepository.upsert(edge);

      // Verify by fetching
      const edges = await friendRepository.fetchAll(TEST_USER_ID);
      expect(edges).toHaveLength(1);
      expect(edges[0].userId).toBe(TEST_USER_ID);
      expect(edges[0].otherUserId).toBe(TEST_FRIEND_ID);
      expect(edges[0].status).toBe('friends');
    });

    testWithSupabase('should update existing friendship', async () => {
      const edge1: FriendEdge = {
        userId: TEST_USER_ID,
        otherUserId: TEST_FRIEND_ID,
        status: 'requested',
        updatedAtMs: Date.now(),
      };

      await friendRepository.upsert(edge1);

      // Update status
      const edge2: FriendEdge = {
        ...edge1,
        status: 'friends',
        updatedAtMs: Date.now() + 1000,
      };

      await friendRepository.upsert(edge2);

      const edges = await friendRepository.fetchAll(TEST_USER_ID);
      expect(edges).toHaveLength(1);
      expect(edges[0].status).toBe('friends');
    });
  });

  describe('delete', () => {
    testWithSupabase('should delete friendship between two users', async () => {
      const edge: FriendEdge = {
        userId: TEST_USER_ID,
        otherUserId: TEST_FRIEND_ID,
        status: 'friends',
        updatedAtMs: Date.now(),
      };

      await friendRepository.upsert(edge);

      // Verify exists
      let edges = await friendRepository.fetchAll(TEST_USER_ID);
      expect(edges).toHaveLength(1);

      // Delete
      await friendRepository.delete(TEST_USER_ID, TEST_FRIEND_ID);

      // Verify deleted
      edges = await friendRepository.fetchAll(TEST_USER_ID);
      expect(edges).toHaveLength(0);
    });

    testWithSupabase('should delete both directions', async () => {
      // Create friendship in both directions (shouldn't normally happen but test)
      const edge1: FriendEdge = {
        userId: TEST_USER_ID,
        otherUserId: TEST_FRIEND_ID,
        status: 'friends',
        updatedAtMs: Date.now(),
      };
      const edge2: FriendEdge = {
        userId: TEST_FRIEND_ID,
        otherUserId: TEST_USER_ID,
        status: 'friends',
        updatedAtMs: Date.now(),
      };

      await friendRepository.upsert(edge1);
      await friendRepository.upsert(edge2);

      // Delete - should remove both
      await friendRepository.delete(TEST_USER_ID, TEST_FRIEND_ID);

      const edges1 = await friendRepository.fetchAll(TEST_USER_ID);
      const edges2 = await friendRepository.fetchAll(TEST_FRIEND_ID);
      expect(edges1).toHaveLength(0);
      expect(edges2).toHaveLength(0);
    });
  });

  describe('syncUp', () => {
    testWithSupabase('should batch upsert multiple friendships', async () => {
      const edges: FriendEdge[] = [
        {
          userId: TEST_USER_ID,
          otherUserId: TEST_FRIEND_ID,
          status: 'friends',
          updatedAtMs: Date.now(),
        },
        {
          userId: TEST_USER_ID,
          otherUserId: TEST_OTHER_ID,
          status: 'requested',
          updatedAtMs: Date.now() + 1000,
        },
      ];

      await friendRepository.syncUp(edges);

      const fetched = await friendRepository.fetchAll(TEST_USER_ID);
      expect(fetched).toHaveLength(2);

      const friendIds = fetched.map(e => e.otherUserId);
      expect(friendIds).toContain(TEST_FRIEND_ID);
      expect(friendIds).toContain(TEST_OTHER_ID);
    });

    testWithSupabase('should handle empty array', async () => {
      await expect(friendRepository.syncUp([])).resolves.not.toThrow();
    });
  });
});