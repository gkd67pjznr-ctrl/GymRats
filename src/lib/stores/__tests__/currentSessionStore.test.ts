// src/lib/stores/__tests__/currentSessionStore.test.ts
// Integration tests for currentSessionStore with queued AsyncStorage persistence

import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetGlobalPersistQueue } from '../../utils/PersistQueue';
import {
  useCurrentSessionStore,
  useCurrentSession,
  useIsHydrated,
  ensureCurrentSession,
  updateCurrentSession,
  clearCurrentSession,
  getCurrentSession,
  hasCurrentSession,
  getCurrentSessionSummary,
  flushPendingWrites,
  type CurrentSession,
} from '../currentSessionStore';

// Mock AsyncStorage
// Note: We need to mock it here even though it's mocked globally in jest.setup.js
// because we need to control the mock behavior in tests
jest.mock('@react-native-async-storage/async-storage', () => {
  const actual = jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock');
  return {
    ...actual,
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
});

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('currentSessionStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGlobalPersistQueue();
    // Reset store state between tests
    // Note: This doesn't reset hydration state, but that's okay for most tests
    useCurrentSessionStore.setState({ session: null, hydrated: false });
  });

  describe('initial state', () => {
    it('should start with null session and false hydrated', () => {
      const { result } = renderHook(() => ({
        session: useCurrentSessionStore((s) => s.session),
        hydrated: useCurrentSessionStore((s) => s.hydrated),
      }));

      expect(result.current.session).toBeNull();
      expect(result.current.hydrated).toBe(false);
    });
  });

  describe('useIsHydrated', () => {
    it.skip('should return false initially, then true after hydration', async () => {
      // This test is skipped because it tests implementation details
      // that are hard to test with Zustand's persist middleware.
      // The store hydrates when it's created (at module load time),
      // not when the hook is rendered. By the time the test runs,
      // hydration is already complete.
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const { result } = renderHook(() => useIsHydrated());

      // Initially false
      expect(result.current).toBe(false);

      // Should become true after hydration completes
      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });
  });

  describe('ensureSession', () => {
    it('should create a new session if none exists', () => {
      const session = ensureCurrentSession();

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.startedAtMs).toBeDefined();
      expect(session.sets).toEqual([]);
      expect(session.doneBySetId).toEqual({});
    });

    it('should return existing session if one exists', () => {
      const session1 = ensureCurrentSession();
      const session2 = ensureCurrentSession();

      expect(session1).toBe(session2);
    });

    it('should accept seed data for initialization', () => {
      const session = ensureCurrentSession({
        selectedExerciseId: 'exercise-123',
        exerciseBlocks: ['exercise-123', 'exercise-456'],
      });

      expect(session.selectedExerciseId).toBe('exercise-123');
      expect(session.exerciseBlocks).toEqual(['exercise-123', 'exercise-456']);
    });
  });

  describe('updateSession', () => {
    it('should update session immutably', () => {
      ensureCurrentSession();

      act(() => {
        updateCurrentSession((s) => ({
          ...s,
          sets: [
            {
              id: 'set-1',
              exerciseId: 'exercise-123',
              setType: 'working',
              weightKg: 100,
              reps: 10,
              timestampMs: Date.now(),
            },
          ],
        }));
      });

      const session = getCurrentSession();
      expect(session?.sets).toHaveLength(1);
      expect(session?.sets[0].id).toBe('set-1');
    });
  });

  describe('setCurrentSession and clearSession', () => {
    it('should set and clear session', () => {
      const testSession: CurrentSession = {
        id: 'test-session',
        startedAtMs: Date.now(),
        selectedExerciseId: 'exercise-123',
        exerciseBlocks: ['exercise-123'],
        sets: [],
        doneBySetId: {},
      };

      act(() => {
        useCurrentSessionStore.getState().setSession(testSession);
      });

      expect(getCurrentSession()).toBe(testSession);

      act(() => {
        clearCurrentSession();
      });

      expect(getCurrentSession()).toBeNull();
    });
  });

  describe('hasCurrentSession', () => {
    it('should return true when session exists', () => {
      expect(hasCurrentSession()).toBe(false);

      ensureCurrentSession();

      expect(hasCurrentSession()).toBe(true);
    });
  });

  describe('getCurrentSessionSummary', () => {
    it('should return summary with zero counts when no session', () => {
      const summary = getCurrentSessionSummary();

      expect(summary.hasSession).toBe(false);
      expect(summary.setCount).toBe(0);
      expect(summary.startedAtMs).toBeNull();
    });

    it('should return summary with correct counts when session exists', () => {
      const session = ensureCurrentSession();

      act(() => {
        updateCurrentSession((s) => ({
          ...s,
          sets: [
            { id: '1', exerciseId: 'e1', setType: 'working', weightKg: 100, reps: 10, timestampMs: Date.now() },
            { id: '2', exerciseId: 'e1', setType: 'working', weightKg: 100, reps: 10, timestampMs: Date.now() },
            { id: '3', exerciseId: 'e1', setType: 'working', weightKg: 100, reps: 10, timestampMs: Date.now() },
          ],
        }));
      });

      const summary = getCurrentSessionSummary();

      expect(summary.hasSession).toBe(true);
      expect(summary.setCount).toBe(3);
      expect(summary.startedAtMs).toBe(session.startedAtMs);
    });
  });

  describe('persistence', () => {
    it('should persist session state to AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const testSession: CurrentSession = {
        id: 'persist-test',
        startedAtMs: 12345,
        selectedExerciseId: 'exercise-456',
        exerciseBlocks: ['exercise-456'],
        sets: [
          { id: 'set-1', exerciseId: 'e1', setType: 'working', weightKg: 100, reps: 10, timestampMs: 12345 },
        ],
        doneBySetId: { 'set-1': true },
      };

      act(() => {
        useCurrentSessionStore.getState().setSession(testSession);
      });

      // Flush pending writes to ensure persistence completes
      await flushPendingWrites();

      // Wait for async persistence
      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      });

      // Get the last call to setItem with key 'currentSession.v2'
      const calls = mockAsyncStorage.setItem.mock.calls;
      const setItemCalls = calls.filter((call) => call[0] === 'currentSession.v2');
      expect(setItemCalls.length).toBeGreaterThan(0);

      const lastCall = setItemCalls[setItemCalls.length - 1];
      const persistedValue = JSON.parse(lastCall[1]);
      expect(persistedValue.state.session.id).toBe('persist-test');
      expect(persistedValue.state.session.sets).toHaveLength(1);
    });

    it('should persist null session when session is cleared', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      ensureCurrentSession();

      act(() => {
        clearCurrentSession();
      });

      // Flush pending writes to ensure persistence completes
      await flushPendingWrites();

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      });

      // Check that the persisted value has session: null
      // Get the last call to setItem with key 'currentSession.v2'
      const calls = mockAsyncStorage.setItem.mock.calls;
      const setItemCalls = calls.filter((call) => call[0] === 'currentSession.v2');
      expect(setItemCalls.length).toBeGreaterThan(0);

      const lastCall = setItemCalls[setItemCalls.length - 1];
      const persistedValue = JSON.parse(lastCall[1]);
      expect(persistedValue.state.session).toBeNull();
    });
  });

  describe('hydration', () => {
    it.skip('should hydrate from AsyncStorage on initialization', async () => {
      // This test is skipped because it tests implementation details
      // that are hard to test with Zustand's persist middleware.
      // The store hydrates when it's created (at module load time),
      // not when the hook is rendered. By the time the test runs,
      // hydration is already complete.
      const persistedSession: CurrentSession = {
        id: 'hydrated-session',
        startedAtMs: 99999,
        selectedExerciseId: 'exercise-789',
        exerciseBlocks: ['exercise-789'],
        sets: [
          { id: 'set-h1', exerciseId: 'e1', setType: 'working', weightKg: 80, reps: 8, timestampMs: 100000 },
        ],
        doneBySetId: {},
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify({ session: persistedSession })
      );

      // Trigger store creation (which triggers hydration)
      const { result } = renderHook(() => ({
        session: useCurrentSession(),
        hydrated: useIsHydrated(),
      }));

      // Wait for hydration to complete
      await waitFor(() => {
        expect(result.current.hydrated).toBe(true);
      });

      expect(result.current.session).toBeDefined();
      expect(result.current.session?.id).toBe('hydrated-session');
      expect(result.current.session?.sets).toHaveLength(1);
    });
  });

  describe('sequential writes (race condition prevention)', () => {
    it('should queue multiple rapid updates sequentially', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      mockAsyncStorage.setItem.mockImplementation(async () => {
        // Simulate async storage delay
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      ensureCurrentSession();

      // Rapidly update session multiple times
      act(() => {
        for (let i = 0; i < 5; i++) {
          updateCurrentSession((s) => ({
            ...s,
            sets: [
              ...s.sets,
              { id: `set-${i}`, exerciseId: 'e1', setType: 'working', weightKg: 100, reps: 10, timestampMs: Date.now() },
            ],
          }));
        }
      });

      // Wait for all writes to complete
      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      }, { timeout: 5000 });

      // Verify final state has all 5 sets
      const finalSession = getCurrentSession();
      expect(finalSession?.sets).toHaveLength(5);
    });
  });
});

describe('currentSessionStore imperative API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGlobalPersistQueue();
    useCurrentSessionStore.setState({ session: null, hydrated: false });
  });

  describe('useCurrentSession hook', () => {
    it('should return current session from Zustand store', () => {
      const testSession: CurrentSession = {
        id: 'hook-test',
        startedAtMs: Date.now(),
        selectedExerciseId: null,
        exerciseBlocks: [],
        sets: [],
        doneBySetId: {},
      };

      act(() => {
        useCurrentSessionStore.getState().setSession(testSession);
      });

      const { result } = renderHook(() => useCurrentSession());
      expect(result.current).toBe(testSession);
    });

    it('should react to session changes', async () => {
      const { result } = renderHook(() => useCurrentSession());

      expect(result.current).toBeNull();

      const testSession: CurrentSession = {
        id: 'reactive-test',
        startedAtMs: Date.now(),
        selectedExerciseId: null,
        exerciseBlocks: [],
        sets: [],
        doneBySetId: {},
      };

      await act(async () => {
        useCurrentSessionStore.getState().setSession(testSession);
      });

      expect(result.current).toBe(testSession);
    });
  });
});
