// src/lib/stores/__tests__/friendsStore.test.ts
// Unit tests for friendsStore with Zustand

import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FriendStatus, ID } from '../../socialModel';
import {
  useFriendsStore,
  useFriendEdges,
  useFriendStatus,
  getFriendEdges,
  getFriendStatus,
  areFriends,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  blockUser,
  hydrateFriends,
  subscribeFriends,
} from '../friendsStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('friendsStore', () => {
  const MY_USER_ID: ID = 'u_test_me';
  const OTHER_USER_ID: ID = 'u_test_other';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Reset store state between tests
    useFriendsStore.setState({ edges: [], hydrated: false });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with empty edges and false hydrated', () => {
      const { result } = renderHook(() => ({
        edges: useFriendsStore((s) => s.edges),
        hydrated: useFriendsStore((s) => s.hydrated),
      }));

      expect(result.current.edges).toEqual([]);
      expect(result.current.hydrated).toBe(false);
    });
  });

  describe('sendFriendRequest', () => {
    it('should create friend request edges', () => {
      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      const edges = getFriendEdges(MY_USER_ID);
      expect(edges).toHaveLength(1);
      expect(edges[0].status).toBe('requested');
    });

    it('should create pending edge for recipient', () => {
      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      const theirEdges = getFriendEdges(OTHER_USER_ID);
      expect(theirEdges).toHaveLength(1);
      expect(theirEdges[0].status).toBe('pending');
    });

    it('should update existing edge if request already exists', () => {
      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      const firstEdges = getFriendEdges(MY_USER_ID);
      const firstTimestamp = firstEdges[0].updatedAtMs;

      // Wait a bit to ensure timestamp changes
      act(() => {
        jest.advanceTimersByTime(100);
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      const secondEdges = getFriendEdges(MY_USER_ID);
      expect(secondEdges).toHaveLength(1);
      expect(secondEdges[0].updatedAtMs).toBeGreaterThanOrEqual(firstTimestamp);
    });

    it('should not allow request if blocked', () => {
      // First block the user
      act(() => {
        blockUser(MY_USER_ID, OTHER_USER_ID);
      });

      const beforeEdges = getFriendEdges(MY_USER_ID);
      expect(beforeEdges).toHaveLength(1);
      expect(beforeEdges[0].status).toBe('blocked');

      // Try to send request
      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      // Should still be blocked, not requested
      const afterEdges = getFriendEdges(MY_USER_ID);
      expect(afterEdges).toHaveLength(1);
      expect(afterEdges[0].status).toBe('blocked');
    });
  });

  describe('acceptFriendRequest', () => {
    it('should update both edges to friends status', () => {
      // First send a request
      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      expect(getFriendStatus(MY_USER_ID, OTHER_USER_ID)).toBe('requested');
      expect(getFriendStatus(OTHER_USER_ID, MY_USER_ID)).toBe('pending');

      // Accept the request
      act(() => {
        acceptFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      expect(getFriendStatus(MY_USER_ID, OTHER_USER_ID)).toBe('friends');
      expect(getFriendStatus(OTHER_USER_ID, MY_USER_ID)).toBe('friends');
    });

    it('should update areFriends helper after acceptance', () => {
      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      expect(areFriends(MY_USER_ID, OTHER_USER_ID)).toBe(false);

      act(() => {
        acceptFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      expect(areFriends(MY_USER_ID, OTHER_USER_ID)).toBe(true);
    });
  });

  describe('removeFriend', () => {
    it('should remove both friendship edges', () => {
      // Create friendship
      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
        acceptFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      expect(areFriends(MY_USER_ID, OTHER_USER_ID)).toBe(true);

      // Remove friend
      act(() => {
        removeFriend(MY_USER_ID, OTHER_USER_ID);
      });

      expect(getFriendStatus(MY_USER_ID, OTHER_USER_ID)).toBe('none');
      expect(getFriendStatus(OTHER_USER_ID, MY_USER_ID)).toBe('none');
      expect(areFriends(MY_USER_ID, OTHER_USER_ID)).toBe(false);
    });
  });

  describe('blockUser', () => {
    it('should remove existing edges and create blocked edge', () => {
      // Create friendship first
      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
        acceptFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      expect(areFriends(MY_USER_ID, OTHER_USER_ID)).toBe(true);

      // Block user
      act(() => {
        blockUser(MY_USER_ID, OTHER_USER_ID);
      });

      const myEdges = getFriendEdges(MY_USER_ID);
      expect(myEdges).toHaveLength(1);
      expect(myEdges[0].status).toBe('blocked');

      // Other user's edge should be removed
      const theirEdges = getFriendEdges(OTHER_USER_ID);
      const edgeToMe = theirEdges.find((e) => e.otherUserId === MY_USER_ID);
      expect(edgeToMe).toBeUndefined();
    });

    it('should block user even if no prior relationship', () => {
      act(() => {
        blockUser(MY_USER_ID, OTHER_USER_ID);
      });

      expect(getFriendStatus(MY_USER_ID, OTHER_USER_ID)).toBe('blocked');
    });
  });

  describe('useFriendEdges hook', () => {
    it('should return edges sorted by updatedAtMs descending', () => {
      const user1: ID = 'u_test_user1';
      const user2: ID = 'u_test_user2';
      const user3: ID = 'u_test_user3';

      act(() => {
        sendFriendRequest(MY_USER_ID, user1);
        sendFriendRequest(MY_USER_ID, user2);
        sendFriendRequest(MY_USER_ID, user3);
      });

      const { result } = renderHook(() => useFriendEdges(MY_USER_ID));
      const edges = result.current;

      expect(edges).toHaveLength(3);
      // Should be sorted by updatedAtMs descending (most recent first)
      expect(edges[0].updatedAtMs).toBeGreaterThanOrEqual(edges[1].updatedAtMs);
      expect(edges[1].updatedAtMs).toBeGreaterThanOrEqual(edges[2].updatedAtMs);
    });

    it('should only return edges for the specified user', () => {
      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      // Use imperative getter since useFriendEdges is a hook
      const myEdges = getFriendEdges(MY_USER_ID);
      const otherEdges = getFriendEdges(OTHER_USER_ID);

      expect(myEdges).toHaveLength(1);
      expect(myEdges[0].userId).toBe(MY_USER_ID);

      expect(otherEdges).toHaveLength(1);
      expect(otherEdges[0].userId).toBe(OTHER_USER_ID);
    });
  });

  describe('useFriendStatus hook', () => {
    it('should return friend status between two users', () => {
      const { result } = renderHook(() => useFriendStatus(MY_USER_ID, OTHER_USER_ID));

      expect(result.current).toBe('none');

      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      expect(result.current).toBe('requested');

      act(() => {
        acceptFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      expect(result.current).toBe('friends');
    });

    it('should return "none" for non-existent relationship', () => {
      const { result } = renderHook(() => useFriendStatus('u_nonexistent1', 'u_nonexistent2'));
      expect(result.current).toBe('none');
    });
  });

  describe('imperative getters', () => {
    it('getFriendEdges should return edges without React', () => {
      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      const edges = getFriendEdges(MY_USER_ID);
      expect(edges).toHaveLength(1);
      expect(edges[0].userId).toBe(MY_USER_ID);
    });

    it('getFriendStatus should return status without React', () => {
      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      const status = getFriendStatus(MY_USER_ID, OTHER_USER_ID);
      expect(status).toBe('requested');
    });

    it('areFriends should check friendship status without React', () => {
      expect(areFriends(MY_USER_ID, OTHER_USER_ID)).toBe(false);

      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
        acceptFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      expect(areFriends(MY_USER_ID, OTHER_USER_ID)).toBe(true);
    });
  });

  describe('legacy API compatibility', () => {
    it('hydrateFriends should resolve without error', async () => {
      await expect(hydrateFriends()).resolves.toBeUndefined();
    });

    it('subscribeFriends should return unsubscribe function', () => {
      const unsubscribe = subscribeFriends(() => {});
      expect(typeof unsubscribe).toBe('function');

      // Calling unsubscribe should not throw
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('hydration', () => {
    it('should set hydrated flag after rehydration', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      // Manually trigger rehydration
      await act(async () => {
        await useFriendsStore.persist.rehydrate();
      });

      await waitFor(() => {
        expect(useFriendsStore.getState().hydrated).toBe(true);
      });
    });
  });

  describe('persistence', () => {
    it('should persist state to AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      // Clear calls from beforeEach's setState which persists empty edges
      mockAsyncStorage.setItem.mockClear();

      act(() => {
        sendFriendRequest(MY_USER_ID, OTHER_USER_ID);
      });

      // Wait for async persistence
      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      });

      const calls = mockAsyncStorage.setItem.mock.calls;
      // Find the last call with the friends key (most recent persistence write)
      const matchingCalls = calls.filter((call) => call[0] === 'friends.v2');
      const setItemCall = matchingCalls[matchingCalls.length - 1];
      expect(setItemCall).toBeDefined();

      const persistedValue = JSON.parse(setItemCall![1]);
      // Zustand persist wraps state in { state: { ... }, version: N }
      const stateData = persistedValue.state ?? persistedValue;
      expect(stateData.edges).toBeDefined();
      expect(stateData.edges.length).toBeGreaterThan(0);
    });
  });
});
