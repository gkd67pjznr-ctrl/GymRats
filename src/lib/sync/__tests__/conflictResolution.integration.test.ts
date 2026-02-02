// Integration tests for conflict resolution with real Supabase data
// Tests that conflict resolution strategies work correctly with real backend data

import type { FriendEdge } from '../../socialModel';
import { resolveFriendConflict } from '../ConflictResolver';
import { describeWithSupabase, testWithSupabase } from './integrationTestHelpers';

// We'll use the real repository to create test data
let friendRepository: any;

describeWithSupabase('Conflict Resolution Integration', () => {
  beforeAll(async () => {
    // Setup: Mock the supabase client with test credentials
    const { url, anonKey } = await import('./integrationTestHelpers').then(m => m.getTestSupabaseCredentials());

    jest.doMock('../../../supabase/client', () => {
      const actual = jest.requireActual('../../../supabase/client');
      const { createClient } = require('@supabase/supabase-js');
      return {
        ...actual,
        supabase: createClient(url, anonKey),
      };
    });

    // Import the repository
    friendRepository = (await import('../repositories/friendRepository')).friendRepository;
  });

  afterEach(async () => {
    // Clean up test data
    const testUser = 'test-user-conflict';
    const testFriend = 'test-friend-conflict';
    try {
      await friendRepository.delete(testUser, testFriend);
      await friendRepository.delete(testFriend, testUser);
    } catch (error) {
      // Ignore
    }
  });

  describe('resolveFriendConflict with real data', () => {
    testWithSupabase('should merge friend status with priority', async () => {
      const userId = 'test-user-conflict';
      const friendId = 'test-friend-conflict';

      // Create remote edge with status 'requested'
      const remoteEdge: FriendEdge = {
        userId,
        otherUserId: friendId,
        status: 'requested',
        updatedAtMs: Date.now() - 5000, // Older
      };

      await friendRepository.upsert(remoteEdge);

      // Simulate local edge with status 'friends' (newer)
      const localEdge: FriendEdge = {
        userId,
        otherUserId: friendId,
        status: 'friends',
        updatedAtMs: Date.now(), // Newer
      };

      // Resolve conflict
      const result = resolveFriendConflict(localEdge, remoteEdge);

      // Expect merged status to be 'friends' (higher priority)
      expect(result.hasConflict).toBe(true);
      expect(result.merged).toBeDefined();
      expect(result.merged!.status).toBe('friends');
      expect(result.merged!.updatedAtMs).toBe(localEdge.updatedAtMs); // Newer timestamp
    });

    testWithSupabase('should prioritize blocked status', async () => {
      const userId = 'test-user-conflict';
      const friendId = 'test-friend-conflict';

      // Create remote edge with status 'friends'
      const remoteEdge: FriendEdge = {
        userId,
        otherUserId: friendId,
        status: 'friends',
        updatedAtMs: Date.now(),
      };

      await friendRepository.upsert(remoteEdge);

      // Simulate local edge with status 'blocked' (higher priority)
      const localEdge: FriendEdge = {
        userId,
        otherUserId: friendId,
        status: 'blocked',
        updatedAtMs: Date.now() - 5000, // Older but higher priority
      };

      const result = resolveFriendConflict(localEdge, remoteEdge);

      // Blocked should win even if older
      expect(result.merged!.status).toBe('blocked');
      expect(result.merged!.updatedAtMs).toBe(remoteEdge.updatedAtMs); // Max timestamp
    });

    testWithSupabase('should handle concurrent edits with same timestamp', async () => {
      const userId = 'test-user-conflict';
      const friendId = 'test-friend-conflict';
      const timestamp = Date.now();

      // Create remote edge
      const remoteEdge: FriendEdge = {
        userId,
        otherUserId: friendId,
        status: 'requested',
        updatedAtMs: timestamp,
      };

      await friendRepository.upsert(remoteEdge);

      // Local edge with same timestamp but different status
      const localEdge: FriendEdge = {
        userId,
        otherUserId: friendId,
        status: 'friends',
        updatedAtMs: timestamp,
      };

      const result = resolveFriendConflict(localEdge, remoteEdge);

      // Remote priority >= local? remote priority = 3 (requested), local = 4 (friends)
      // Since remotePriority (3) < localPriority (4), local wins
      expect(result.merged!.status).toBe('friends');
    });
  });

  describe('mergeFriendEdges integration', () => {
    testWithSupabase('should merge local and remote edges correctly', async () => {
      // This test simulates what the store does during pullFromServer
      const userId = 'test-user-conflict';
      const friendId = 'test-friend-conflict';

      // Create two remote edges
      const remoteEdges: FriendEdge[] = [
        {
          userId,
          otherUserId: friendId,
          status: 'requested',
          updatedAtMs: Date.now() - 2000,
        },
        {
          userId: friendId,
          otherUserId: userId,
          status: 'pending',
          updatedAtMs: Date.now() - 2000,
        },
      ];

      for (const edge of remoteEdges) {
        await friendRepository.upsert(edge);
      }

      // Simulate local edges with different status
      const localEdges: FriendEdge[] = [
        {
          userId,
          otherUserId: friendId,
          status: 'friends', // Local changed to friends
          updatedAtMs: Date.now(),
        },
        // Keep the reciprocal edge as pending (no local change)
      ];

      // Fetch remote edges from repository
      const fetchedRemote = await friendRepository.fetchAll(userId);

      // Merge using the same logic as store (simplified)
      const edgeMap = new Map<string, FriendEdge>();
      const getEdgeKey = (u: string, o: string) => `${u}_${o}`;

      // Add remote edges
      for (const edge of fetchedRemote) {
        edgeMap.set(getEdgeKey(edge.userId, edge.otherUserId), edge);
      }

      // Merge local edges
      for (const localEdge of localEdges) {
        const key = getEdgeKey(localEdge.userId, localEdge.otherUserId);
        const remoteEdge = edgeMap.get(key);

        if (!remoteEdge) {
          edgeMap.set(key, localEdge);
        } else {
          const result = resolveFriendConflict(localEdge, remoteEdge);
          edgeMap.set(key, result.merged ?? remoteEdge);
        }
      }

      const merged = Array.from(edgeMap.values());

      // Expect merged to contain both edges with resolved status
      expect(merged).toHaveLength(2);

      const userEdge = merged.find(e => e.userId === userId && e.otherUserId === friendId);
      expect(userEdge).toBeDefined();
      expect(userEdge!.status).toBe('friends'); // Local change wins

      const friendEdge = merged.find(e => e.userId === friendId && e.otherUserId === userId);
      expect(friendEdge).toBeDefined();
      expect(friendEdge!.status).toBe('pending'); // No local change, remote remains
    });
  });
});