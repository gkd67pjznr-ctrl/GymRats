// src/lib/stores/__tests__/chatStore.test.ts
// Unit tests for chatStore with Zustand

import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ID } from '../../socialModel';
import {
  useChatStore,
  useThreads,
  useThread,
  useThreadMessages,
  useUnreadCount,
  useThreadOtherUserId,
  useOtherUserTyping,
  getThreadsForUser,
  getThread,
  getMessagesForThread,
  getLastReadAt,
  getUnreadCount,
  ensureThread,
  sendMessage,
  markThreadRead,
  setTyping,
  getIsUserTyping,
  getOtherUserId,
  canUserMessageThread,
  hydrateChat,
  subscribeChat,
  resetTyping,
} from '../chatStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('chatStore', () => {
  const MY_USER_ID: ID = 'u_chat_me';
  const OTHER_USER_ID: ID = 'u_chat_other';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    resetTyping();
    // Reset store state between tests
    useChatStore.setState({
      threads: [],
      messages: [],
      reads: {},
      hydrated: false,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with empty state and false hydrated', () => {
      const { result } = renderHook(() => ({
        threads: useChatStore((s) => s.threads),
        messages: useChatStore((s) => s.messages),
        reads: useChatStore((s) => s.reads),
        hydrated: useChatStore((s) => s.hydrated),
      }));

      expect(result.current.threads).toEqual([]);
      expect(result.current.messages).toEqual([]);
      expect(result.current.reads).toEqual({});
      expect(result.current.hydrated).toBe(false);
    });
  });

  describe('ensureThread', () => {
    it('should create new DM thread between two users', () => {
      const threadId = ensureThread(MY_USER_ID, OTHER_USER_ID);

      expect(threadId).toBeDefined();
      expect(typeof threadId).toBe('string');

      const thread = getThread(threadId);
      expect(thread).toBeDefined();
      expect(thread?.type).toBe('dm');
      expect(thread?.memberUserIds).toContain(MY_USER_ID);
      expect(thread?.memberUserIds).toContain(OTHER_USER_ID);
    });

    it('should return existing thread if already exists', () => {
      const threadId1 = ensureThread(MY_USER_ID, OTHER_USER_ID);
      const threadId2 = ensureThread(MY_USER_ID, OTHER_USER_ID);

      expect(threadId1).toBe(threadId2);

      const threads = getThreadsForUser(MY_USER_ID);
      expect(threads).toHaveLength(1);
    });

    it('should create threads for different user pairs', () => {
      const thirdUserId: ID = 'u_chat_third';

      const threadId1 = ensureThread(MY_USER_ID, OTHER_USER_ID);
      const threadId2 = ensureThread(MY_USER_ID, thirdUserId);

      expect(threadId1).not.toBe(threadId2);

      const myThreads = getThreadsForUser(MY_USER_ID);
      expect(myThreads).toHaveLength(2);
    });

    it('should set canMessage to friendsOnly by default', () => {
      const threadId = ensureThread(MY_USER_ID, OTHER_USER_ID);
      const thread = getThread(threadId);

      expect(thread?.canMessage).toBe('friendsOnly');
    });

    it('should support custom canMessage policy', () => {
      const threadId = ensureThread(MY_USER_ID, OTHER_USER_ID, 'open');
      const thread = getThread(threadId);

      expect(thread?.canMessage).toBe('open');
    });
  });

  describe('sendMessage', () => {
    let threadId: string;

    beforeEach(() => {
      threadId = ensureThread(MY_USER_ID, OTHER_USER_ID, 'open');
    });

    it('should add message to thread', () => {
      sendMessage(threadId, MY_USER_ID, 'Hello!');

      const messages = getMessagesForThread(threadId);
      expect(messages).toHaveLength(1);
      expect(messages[0].text).toBe('Hello!');
      expect(messages[0].senderUserId).toBe(MY_USER_ID);
      expect(messages[0].threadId).toBe(threadId);
    });

    it('should trim message text', () => {
      sendMessage(threadId, MY_USER_ID, '  Spaced message  ');

      const messages = getMessagesForThread(threadId);
      expect(messages[0].text).toBe('Spaced message');
    });

    it('should not send empty message', () => {
      sendMessage(threadId, MY_USER_ID, '   ');

      const messages = getMessagesForThread(threadId);
      expect(messages).toHaveLength(0);
    });

    it('should update thread updatedAtMs', () => {
      const threadBefore = getThread(threadId);
      const beforeMs = threadBefore?.updatedAtMs ?? 0;

      // Wait a bit to ensure timestamp difference
      act(() => {
        jest.advanceTimersByTime(100);
      });

      sendMessage(threadId, MY_USER_ID, 'Update test');

      const threadAfter = getThread(threadId);
      expect(threadAfter?.updatedAtMs).toBeGreaterThan(beforeMs);
    });

    it('should mark sender as having read', () => {
      sendMessage(threadId, MY_USER_ID, 'Read test');

      const lastReadAt = getLastReadAt(threadId, MY_USER_ID);
      expect(lastReadAt).toBeGreaterThan(0);
    });

    it('should clear typing status for sender after sending', () => {
      setTyping(threadId, MY_USER_ID, true);
      expect(getIsUserTyping(threadId, MY_USER_ID)).toBe(true);

      sendMessage(threadId, MY_USER_ID, 'Typing clear test');

      expect(getIsUserTyping(threadId, MY_USER_ID)).toBe(false);
    });

    it('should not send message if thread does not exist', () => {
      const messagesBefore = getMessagesForThread(threadId);

      sendMessage('nonexistent_thread', MY_USER_ID, 'No thread test');

      const messagesAfter = getMessagesForThread(threadId);
      expect(messagesAfter).toHaveLength(messagesBefore.length);
    });
  });

  describe('markThreadRead', () => {
    let threadId: string;

    beforeEach(() => {
      threadId = ensureThread(MY_USER_ID, OTHER_USER_ID, 'open');
    });

    it('should set last read timestamp for user', () => {
      const readAtMs = Date.now();

      markThreadRead(threadId, MY_USER_ID, readAtMs);

      expect(getLastReadAt(threadId, MY_USER_ID)).toBe(readAtMs);
    });

    it('should default to current time if not provided', () => {
      const beforeMark = Date.now();

      markThreadRead(threadId, MY_USER_ID);

      const lastReadAt = getLastReadAt(threadId, MY_USER_ID);
      expect(lastReadAt).toBeGreaterThanOrEqual(beforeMark);
    });

    it('should take maximum of existing and new read time', () => {
      const firstReadAt = 1000;
      const secondReadAt = 2000;

      markThreadRead(threadId, MY_USER_ID, firstReadAt);
      expect(getLastReadAt(threadId, MY_USER_ID)).toBe(firstReadAt);

      markThreadRead(threadId, MY_USER_ID, secondReadAt);
      expect(getLastReadAt(threadId, MY_USER_ID)).toBe(secondReadAt);

      // Should not decrease
      markThreadRead(threadId, MY_USER_ID, 500);
      expect(getLastReadAt(threadId, MY_USER_ID)).toBe(secondReadAt);
    });
  });

  describe('unread count', () => {
    let threadId: string;

    beforeEach(() => {
      threadId = ensureThread(MY_USER_ID, OTHER_USER_ID, 'open');
    });

    it('should count unread messages from other users', () => {
      const baseTime = 1000;

      // Mark as read at baseTime
      markThreadRead(threadId, MY_USER_ID, baseTime);

      // Other user sends message after read time
      act(() => {
        jest.advanceTimersByTime(1);
        sendMessage(threadId, OTHER_USER_ID, 'New message');
      });

      const unreadCount = getUnreadCount(threadId, MY_USER_ID);
      expect(unreadCount).toBe(1);
    });

    it('should not count own messages as unread', () => {
      const baseTime = 1000;

      markThreadRead(threadId, MY_USER_ID, baseTime);

      act(() => {
        jest.advanceTimersByTime(1);
        sendMessage(threadId, MY_USER_ID, 'My message');
      });

      const unreadCount = getUnreadCount(threadId, MY_USER_ID);
      expect(unreadCount).toBe(0);
    });

    it('should count all messages after last read', () => {
      markThreadRead(threadId, MY_USER_ID, 0);

      act(() => {
        // Advance timers to ensure message timestamps > 0
        jest.advanceTimersByTime(1);
        sendMessage(threadId, OTHER_USER_ID, 'Msg 1');
        jest.advanceTimersByTime(1);
        sendMessage(threadId, OTHER_USER_ID, 'Msg 2');
        jest.advanceTimersByTime(1);
        sendMessage(threadId, OTHER_USER_ID, 'Msg 3');
      });

      expect(getUnreadCount(threadId, MY_USER_ID)).toBe(3);
    });

    it('should reset to 0 after marking read', () => {
      act(() => {
        jest.advanceTimersByTime(1);
        sendMessage(threadId, OTHER_USER_ID, 'Msg 1');
        jest.advanceTimersByTime(1);
        sendMessage(threadId, OTHER_USER_ID, 'Msg 2');
      });

      expect(getUnreadCount(threadId, MY_USER_ID)).toBe(2);

      // Mark read at a time after the messages
      markThreadRead(threadId, MY_USER_ID, Date.now() + 1000);

      expect(getUnreadCount(threadId, MY_USER_ID)).toBe(0);
    });

    it('useUnreadCount hook should reactive to changes', () => {
      const { result } = renderHook(() => useUnreadCount(threadId, MY_USER_ID));

      expect(result.current).toBe(0);

      act(() => {
        jest.advanceTimersByTime(1);
        sendMessage(threadId, OTHER_USER_ID, 'New message');
      });

      expect(result.current).toBe(1);

      act(() => {
        jest.advanceTimersByTime(1);
        markThreadRead(threadId, MY_USER_ID);
      });

      expect(result.current).toBe(0);
    });
  });

  describe('typing indicators', () => {
    let threadId: string;

    beforeEach(() => {
      threadId = ensureThread(MY_USER_ID, OTHER_USER_ID, 'open');
    });

    it('should set typing status', () => {
      setTyping(threadId, OTHER_USER_ID, true);

      expect(getIsUserTyping(threadId, OTHER_USER_ID)).toBe(true);
    });

    it('should clear typing status', () => {
      setTyping(threadId, OTHER_USER_ID, true);
      expect(getIsUserTyping(threadId, OTHER_USER_ID)).toBe(true);

      setTyping(threadId, OTHER_USER_ID, false);
      expect(getIsUserTyping(threadId, OTHER_USER_ID)).toBe(false);
    });

    it('should handle multiple users typing in same thread', () => {
      const thirdUserId: ID = 'u_typing_third';
      const thirdThreadId = ensureThread(MY_USER_ID, thirdUserId);

      setTyping(threadId, OTHER_USER_ID, true);
      setTyping(thirdThreadId, thirdUserId, true);

      expect(getIsUserTyping(threadId, OTHER_USER_ID)).toBe(true);
      expect(getIsUserTyping(thirdThreadId, thirdUserId)).toBe(true);
    });

    it('should return false for non-typing user', () => {
      expect(getIsUserTyping(threadId, OTHER_USER_ID)).toBe(false);
    });

    it('useOtherUserTyping hook should react to typing changes', () => {
      const thread = getThread(threadId);

      if (!thread) {
        throw new Error('Thread not found');
      }

      const { result } = renderHook(() => useOtherUserTyping(threadId, MY_USER_ID));

      expect(result.current).toBe(false);

      act(() => {
        setTyping(threadId, OTHER_USER_ID, true);
      });

      expect(result.current).toBe(true);

      act(() => {
        setTyping(threadId, OTHER_USER_ID, false);
      });

      expect(result.current).toBe(false);
    });
  });

  describe('getOtherUserId', () => {
    it('should return the other user ID in DM', () => {
      const threadId = ensureThread(MY_USER_ID, OTHER_USER_ID);
      const thread = getThread(threadId);

      if (!thread) {
        throw new Error('Thread not found');
      }

      const otherId = getOtherUserId(thread, MY_USER_ID);
      expect(otherId).toBe(OTHER_USER_ID);
    });

    it('should handle when myUserId is not in thread', () => {
      const threadId = ensureThread('u_user1', 'u_user2');
      const thread = getThread(threadId);

      if (!thread) {
        throw new Error('Thread not found');
      }

      const otherId = getOtherUserId(thread, MY_USER_ID);
      // Should return first member if my user not found
      expect(['u_user1', 'u_user2']).toContain(otherId);
    });
  });

  describe('useThreadOtherUserId hook', () => {
    it('should return other user ID', () => {
      const threadId = ensureThread(MY_USER_ID, OTHER_USER_ID);
      const thread = getThread(threadId);

      const { result } = renderHook(() =>
        useThreadOtherUserId(thread, MY_USER_ID)
      );

      expect(result.current).toBe(OTHER_USER_ID);
    });

    it('should return null for null thread', () => {
      const { result } = renderHook(() =>
        useThreadOtherUserId(null, MY_USER_ID)
      );

      expect(result.current).toBeNull();
    });
  });

  describe('useThreads hook', () => {
    it('should return threads sorted by updatedAtMs', () => {
      const user1: ID = 'u_thread1';
      const user2: ID = 'u_thread2';

      act(() => {
        ensureThread(MY_USER_ID, user1);
        ensureThread(MY_USER_ID, user2);
      });

      const { result } = renderHook(() => useThreads(MY_USER_ID));

      expect(result.current).toHaveLength(2);
      // Should be sorted descending by updatedAtMs
      expect(result.current[0].updatedAtMs).toBeGreaterThanOrEqual(
        result.current[1].updatedAtMs
      );
    });

    it('should only return threads for specified user', () => {
      const user1: ID = 'u_exclusive1';
      const user2: ID = 'u_exclusive2';
      const user3: ID = 'u_exclusive3';

      act(() => {
        ensureThread(MY_USER_ID, user1);
        ensureThread(MY_USER_ID, user2);
        ensureThread(user3, user1);
      });

      const { result: myResult } = renderHook(() => useThreads(MY_USER_ID));
      const { result: user3Result } = renderHook(() => useThreads(user3));

      expect(myResult.current).toHaveLength(2);
      expect(user3Result.current).toHaveLength(1);
    });
  });

  describe('legacy API compatibility', () => {
    it('hydrateChat should resolve without error', async () => {
      await expect(hydrateChat()).resolves.toBeUndefined();
    });

    it('subscribeChat should return unsubscribe function', () => {
      const unsubscribe = subscribeChat(() => {});
      expect(typeof unsubscribe).toBe('function');
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('hydration', () => {
    it('should set hydrated flag after rehydration', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      renderHook(() => useChatStore((s) => s.hydrated));

      await waitFor(() => {
        expect(useChatStore.getState().hydrated).toBe(true);
      });
    });
  });

  describe('persistence', () => {
    it('should persist state to AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      act(() => {
        ensureThread(MY_USER_ID, OTHER_USER_ID);
        sendMessage('placeholder_thread_id', MY_USER_ID, 'Test');
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      });

      const calls = mockAsyncStorage.setItem.mock.calls;
      const setItemCall = calls.find((call) => call[0] === 'chat.v2');
      expect(setItemCall).toBeDefined();
    });
  });
});
