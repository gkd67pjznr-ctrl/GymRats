// Integration tests for friends store sync with real Supabase backend
// Tests the store's pullFromServer and pushToServer methods

import { useFriendsStore } from '../friendsStore';
import { describeWithSupabase, testWithSupabase } from '../../sync/__tests__/integrationTestHelpers';

// Mock authStore
jest.mock('../authStore', () => ({
  getUser: jest.fn(() => ({ id: 'test-user-store' })),
}));

// Mock network monitor
jest.mock('../../sync/NetworkMonitor', () => ({
  networkMonitor: {
    isOnline: jest.fn(() => true),
  },
  useNetworkState: jest.fn(),
  useIsOnline: jest.fn(),
}));

describeWithSupabase('friendsStore Sync Integration', () => {
  let friendRepository: any;

  beforeAll(async () => {
    // Setup test Supabase client
    const { url, anonKey } = await import('../../sync/__tests__/integrationTestHelpers').then(m => m.getTestSupabaseCredentials());

    jest.doMock('../../../supabase/client', () => {
      const actual = jest.requireActual('../../../supabase/client');
      const { createClient } = require('@supabase/supabase-js');
      return {
        ...actual,
        supabase: createClient(url, anonKey),
      };
    });

    // Import repository for direct operations
    friendRepository = (await import('../../sync/repositories/friendRepository')).friendRepository;
  });

  beforeEach(() => {
    // Clear store state before each test
    useFriendsStore.setState({
      edges: [],
      _sync: {
        lastSyncAt: null,
        lastSyncHash: null,
        syncStatus: 'idle',
        syncError: null,
        pendingMutations: 0,
      },
    });
  });

  afterEach(async () => {
    // Clean up test data
    const testUser = 'test-user-store';
    const testFriend = 'test-friend-store';
    try {
      await friendRepository.delete(testUser, testFriend);
      await friendRepository.delete(testFriend, testUser);
    } catch (error) {
      // Ignore
    }
  });

  testWithSupabase('pullFromServer should fetch and merge remote edges', async () => {
    const userId = 'test-user-store';
    const friendId = 'test-friend-store';

    // Create remote edge
    await friendRepository.upsert({
      userId,
      otherUserId: friendId,
      status: 'friends',
      updatedAtMs: Date.now(),
    });

    // Mock getUser to return our test user
    const { getUser } = require('../authStore');
    getUser.mockReturnValue({ id: userId });

    // Call pullFromServer
    await useFriendsStore.getState().pullFromServer();

    // Verify store has the edge
    const edges = useFriendsStore.getState().edges;
    expect(edges).toHaveLength(1);
    expect(edges[0].userId).toBe(userId);
    expect(edges[0].otherUserId).toBe(friendId);
    expect(edges[0].status).toBe('friends');

    // Verify sync metadata updated
    const sync = useFriendsStore.getState()._sync;
    expect(sync.syncStatus).toBe('success');
    expect(sync.lastSyncAt).toBeGreaterThan(0);
  });

  testWithSupabase('pullFromServer should handle empty remote data', async () => {
    const userId = 'test-user-store';
    const { getUser } = require('../authStore');
    getUser.mockReturnValue({ id: userId });

    // Add local edge (not yet synced)
    useFriendsStore.setState({
      edges: [{
        userId,
        otherUserId: 'some-friend',
        status: 'requested',
        updatedAtMs: Date.now(),
      }],
    });

    await useFriendsStore.getState().pullFromServer();

    // Local edge should remain (no remote conflict)
    const edges = useFriendsStore.getState().edges;
    expect(edges).toHaveLength(1);
    expect(edges[0].otherUserId).toBe('some-friend');
  });

  testWithSupabase('pushToServer should upload local edges', async () => {
    const userId = 'test-user-store';
    const friendId = 'test-friend-store';

    // Mock getUser
    const { getUser } = require('../authStore');
    getUser.mockReturnValue({ id: userId });

    // Add local edge
    useFriendsStore.setState({
      edges: [{
        userId,
        otherUserId: friendId,
        status: 'friends',
        updatedAtMs: Date.now(),
      }],
    });

    // Call pushToServer
    await useFriendsStore.getState().pushToServer();

    // Verify edge exists in Supabase
    const remoteEdges = await friendRepository.fetchAll(userId);
    expect(remoteEdges).toHaveLength(1);
    expect(remoteEdges[0].userId).toBe(userId);
    expect(remoteEdges[0].otherUserId).toBe(friendId);
  });

  testWithSupabase('sync should pull then push', async () => {
    const userId = 'test-user-store';
    const friendId = 'test-friend-store';

    // Create remote edge
    await friendRepository.upsert({
      userId,
      otherUserId: friendId,
      status: 'requested',
      updatedAtMs: Date.now() - 5000,
    });

    // Mock getUser
    const { getUser } = require('../authStore');
    getUser.mockReturnValue({ id: userId });

    // Add local edge with newer status
    useFriendsStore.setState({
      edges: [{
        userId,
        otherUserId: friendId,
        status: 'friends',
        updatedAtMs: Date.now(),
      }],
    });

    // Call sync (pull + push)
    await useFriendsStore.getState().sync();

    // Verify remote edge was updated with merged status
    const remoteEdges = await friendRepository.fetchAll(userId);
    expect(remoteEdges).toHaveLength(1);
    expect(remoteEdges[0].status).toBe('friends'); // Higher priority wins

    // Verify store has merged edge
    const edges = useFriendsStore.getState().edges;
    expect(edges[0].status).toBe('friends');
  });
});