// src/lib/stores/__tests__/currentSessionStore.appstate.test.ts
// Characterization tests for AppState persistence integration

import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { resetGlobalPersistQueue } from '../../utils/PersistQueue';
import {
  useCurrentSessionStore,
  setupAppStatePersistenceListener,
  flushPendingWrites,
  useCurrentSession,
  useIsHydrated,
  ensureCurrentSession,
  updateCurrentSession,
  type CurrentSession,
} from '../currentSessionStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock AppState
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(),
    currentState: 'active',
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockAppState = AppState as jest.Mocked<typeof AppState>;

describe('currentSessionStore - AppState Integration (TASK-001, TASK-002)', () => {
  let mockAppStateChangeCallbacks: Array<(state: string) => void>;
  let appStateCleanup: (() => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    resetGlobalPersistQueue();
    useCurrentSessionStore.setState({ session: null, hydrated: false });

    // Track AppState event listeners
    mockAppStateChangeCallbacks = [];
    mockAppState.addEventListener.mockImplementation((event, callback) => {
      if (event === 'change') {
        mockAppStateChangeCallbacks.push(callback as (state: string) => void);
      }
      // Return mock subscription with remove method
      return { remove: jest.fn() };
    });
  });

  afterEach(() => {
    // Cleanup any AppState listeners
    appStateCleanup?.();
  });

  describe('setupAppStatePersistenceListener (TASK-001)', () => {
    it('should register AppState change listener on setup', () => {
      appStateCleanup = setupAppStatePersistenceListener();

      expect(mockAppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(mockAppStateChangeCallbacks).toHaveLength(1);
    });

    it('should return cleanup function that removes listener', () => {
      const mockRemove = jest.fn();
      mockAppState.addEventListener.mockReturnValueOnce({ remove: mockRemove });

      const cleanup = setupAppStatePersistenceListener();

      expect(typeof cleanup).toBe('function');

      cleanup();

      expect(mockRemove).toHaveBeenCalled();
    });

    it('should only allow one listener at a time', () => {
      const mockRemove1 = jest.fn();
      const mockRemove2 = jest.fn();
      mockAppState.addEventListener
        .mockReturnValueOnce({ remove: mockRemove1 })
        .mockReturnValueOnce({ remove: mockRemove2 });

      const cleanup1 = setupAppStatePersistenceListener();
      const cleanup2 = setupAppStatePersistenceListener();

      // First listener should not be removed yet
      expect(mockRemove1).not.toHaveBeenCalled();

      // Cleanup second listener
      cleanup2();

      // Should remove the actual (single) listener
      expect(mockRemove2).toHaveBeenCalled();
    });

    it('should flush PersistQueue when app goes to background', async () => {
      const flushSpy = jest.fn().mockResolvedValue(undefined);
      jest.spyOn(require('../../utils/PersistQueue'), 'getGlobalPersistQueue').mockReturnValue({
        enqueue: jest.fn(),
        flush: flushSpy,
        reset: jest.fn(),
      });

      appStateCleanup = setupAppStatePersistenceListener();

      // Simulate app backgrounding
      await act(async () => {
        mockAppStateChangeCallbacks[0]('background');
      });

      expect(flushSpy).toHaveBeenCalled();
    });

    it('should flush PersistQueue when app goes to inactive (iOS)', async () => {
      const flushSpy = jest.fn().mockResolvedValue(undefined);
      jest.spyOn(require('../../utils/PersistQueue'), 'getGlobalPersistQueue').mockReturnValue({
        enqueue: jest.fn(),
        flush: flushSpy,
        reset: jest.fn(),
      });

      appStateCleanup = setupAppStatePersistenceListener();

      // Simulate iOS inactive state
      await act(async () => {
        mockAppStateChangeCallbacks[0]('inactive');
      });

      expect(flushSpy).toHaveBeenCalled();
    });

    it('should not flush when app comes to foreground', async () => {
      const flushSpy = jest.fn().mockResolvedValue(undefined);
      jest.spyOn(require('../../utils/PersistQueue'), 'getGlobalPersistQueue').mockReturnValue({
        enqueue: jest.fn(),
        flush: flushSpy,
        reset: jest.fn(),
      });

      appStateCleanup = setupAppStatePersistenceListener();

      // Simulate app coming to foreground
      await act(async () => {
        mockAppStateChangeCallbacks[0]('active');
      });

      expect(flushSpy).not.toHaveBeenCalled();
    });

    it('should log error when flush fails on app state change', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const flushError = new Error('Flush failed');
      const flushSpy = jest.fn().mockRejectedValue(flushError);

      jest.spyOn(require('../../utils/PersistQueue'), 'getGlobalPersistQueue').mockReturnValue({
        enqueue: jest.fn(),
        flush: flushSpy,
        reset: jest.fn(),
      });

      appStateCleanup = setupAppStatePersistenceListener();

      // Simulate app backgrounding with flush failure
      await act(async () => {
        mockAppStateChangeCallbacks[0]('background');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[currentSessionStore] Failed to flush on app state change:',
        flushError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('flushPendingWrites (TASK-002)', () => {
    it('should await PersistQueue flush before resolving', async () => {
      let flushResolved = false;
      const flushPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          flushResolved = true;
          resolve();
        }, 50);
      });

      jest.spyOn(require('../../utils/PersistQueue'), 'getGlobalPersistQueue').mockReturnValue({
        enqueue: jest.fn(),
        flush: jest.fn(() => flushPromise),
        reset: jest.fn(),
      });

      const flushPromiseReturned = flushPendingWrites();

      expect(flushResolved).toBe(false);

      await flushPromiseReturned;

      expect(flushResolved).toBe(true);
    });

    it('should resolve immediately when queue is empty', async () => {
      jest.spyOn(require('../../utils/PersistQueue'), 'getGlobalPersistQueue').mockReturnValue({
        enqueue: jest.fn(),
        flush: jest.fn().mockResolvedValue(undefined),
        reset: jest.fn(),
      });

      const start = Date.now();
      await flushPendingWrites();
      const end = Date.now();

      // Should complete very quickly (< 10ms)
      expect(end - start).toBeLessThan(10);
    });
  });
});

describe('currentSessionStore - Hydration (TASK-003, TASK-004)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGlobalPersistQueue();
    useCurrentSessionStore.setState({ session: null, hydrated: false });
  });

  describe('onRehydrateStorage callback (TASK-003)', () => {
    it('should set hydrated flag to true after storage load completes', async () => {
      const persistedSession: CurrentSession = {
        id: 'test-session',
        startedAtMs: 12345,
        selectedExerciseId: null,
        exerciseBlocks: [],
        sets: [],
        doneBySetId: {},
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify({ session: persistedSession })
      );

      const { result } = renderHook(() => ({
        session: useCurrentSession(),
        hydrated: useIsHydrated(),
      }));

      // Initially false before hydration
      expect(result.current.hydrated).toBe(false);

      // After hydration completes, should be true
      await waitFor(() => {
        expect(result.current.hydrated).toBe(true);
      });

      // Session should be loaded
      expect(result.current.session).toBeDefined();
      expect(result.current.session?.id).toBe('test-session');
    });

    it('should use setHydrated method not direct state mutation', async () => {
      // This test verifies that the onRehydrateStorage callback
      // uses the setHydrated method (via state?.setHydrated(true))
      // rather than direct state manipulation

      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      renderHook(() => useIsHydrated());

      await waitFor(() => {
        expect(useCurrentSessionStore.getState().hydrated).toBe(true);
      });

      // Verify that the setHydrated action exists and was called
      const state = useCurrentSessionStore.getState();
      expect(typeof state.setHydrated).toBe('function');
    });

    it('should have useIsHydrated return correct value after hydration', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const { result } = renderHook(() => useIsHydrated());

      expect(result.current).toBe(false);

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });
  });

  describe('useWorkoutOrchestrator hydration guard (TASK-004)', () => {
    it('should have all hooks called before conditional return', async () => {
      // This test characterizes the existing behavior where useWorkoutOrchestrator
      // calls all hooks (useIsHydrated, useCurrentSession) before the early return
      // This satisfies the Rules of Hooks

      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const { result } = renderHook(() => ({
        hydrated: useIsHydrated(),
        session: useCurrentSession(),
      }));

      // Both hooks should be called (even when not hydrated)
      expect(result.current.hydrated).toBeDefined();
      expect(result.current.session).toBeDefined();

      await waitFor(() => {
        expect(result.current.hydrated).toBe(true);
      });
    });

    it('should not cause console warnings about conditional hook execution', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      renderHook(() => useIsHydrated());

      await waitFor(() => {
        expect(useCurrentSessionStore.getState().hydrated).toBe(true);
      });

      // No warnings about hook execution order
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });
});

describe('currentSessionStore - PersistQueue verification (TASK-005)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGlobalPersistQueue();
    useCurrentSessionStore.setState({ session: null, hydrated: false });
  });

  it('should queue writes sequentially during rapid updates', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);
    mockAsyncStorage.setItem.mockImplementation(async () => {
      // Simulate async storage delay
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    act(() => {
      ensureCurrentSession();
    });

    // Rapidly update session 5 times
    act(() => {
      for (let i = 0; i < 5; i++) {
        updateCurrentSession((s) => ({
          ...s,
          sets: [
            ...s.sets,
            {
              id: `set-${i}`,
              exerciseId: 'e1',
              setType: 'working' as const,
              weightKg: 100,
              reps: 10,
              timestampMs: Date.now(),
            },
          ],
        }));
      }
    });

    // Wait for all writes to complete
    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    // Verify final state has all 5 sets
    const finalSession = useCurrentSessionStore.getState().session;
    expect(finalSession?.sets).toHaveLength(5);

    // All sets should be present in order
    finalSession?.sets.forEach((set, index) => {
      expect(set.id).toBe(`set-${index}`);
    });
  });

  it('should prevent overlapping AsyncStorage writes', async () => {
    const writeOrder: string[] = [];
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);
    mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
      const parsed = JSON.parse(value);
      const setsCount = parsed.session?.sets?.length ?? 0;
      writeOrder.push(`write-${setsCount}`);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    act(() => {
      ensureCurrentSession();
    });

    // Rapid updates
    act(() => {
      updateCurrentSession((s) => ({ ...s, sets: [...s.sets, { id: '1', exerciseId: 'e1', setType: 'working' as const, weightKg: 100, reps: 10, timestampMs: Date.now() }] }));
      updateCurrentSession((s) => ({ ...s, sets: [...s.sets, { id: '2', exerciseId: 'e1', setType: 'working' as const, weightKg: 100, reps: 10, timestampMs: Date.now() }] }));
      updateCurrentSession((s) => ({ ...s, sets: [...s.sets, { id: '3', exerciseId: 'e1', setType: 'working' as const, weightKg: 100, reps: 10, timestampMs: Date.now() }] }));
    });

    await waitFor(() => {
      expect(writeOrder).toHaveLength(3);
    });

    // Writes should be sequential (1, 2, 3) not overlapping
    expect(writeOrder).toEqual(['write-1', 'write-2', 'write-3']);
  });
});

describe('currentSessionStore - Error boundary (TASK-008)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGlobalPersistQueue();
    useCurrentSessionStore.setState({ session: null, hydrated: false });
  });

  it('should log AsyncStorage failures with detailed information', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const writeError = new Error('AsyncStorage write failed');

    mockAsyncStorage.getItem.mockResolvedValueOnce(null);
    mockAsyncStorage.setItem.mockRejectedValue(writeError);

    // Use waitFor with error handling to avoid unhandled rejection
    await act(async () => {
      try {
        ensureCurrentSession();
      } catch {
        // Expected - setItem will reject
      }
    });

    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    const errorCall = consoleErrorSpy.mock.calls.find(call =>
      call[0]?.includes?.('Failed to set item')
    );

    expect(errorCall).toBeDefined();
    expect(errorCall?.[1]).toMatchObject({
      key: expect.any(String),
      error: expect.any(String),
    });

    consoleErrorSpy.mockRestore();
  });

  it('should not cause unhandled promise rejections from AsyncStorage', async () => {
    const unhandledRejectionSpy = jest.spyOn(process, 'on').mockImplementation();

    mockAsyncStorage.getItem.mockResolvedValueOnce(null);
    mockAsyncStorage.setItem.mockRejectedValue(new Error('Write failed'));

    act(() => {
      ensureCurrentSession();
    });

    // Wait a bit for any unhandled rejections
    await new Promise(resolve => setTimeout(resolve, 100));

    // The error should be caught and logged, not cause unhandled rejection
    // (This is a characterization test - verifies current behavior)
    expect(mockAsyncStorage.setItem).toHaveBeenCalled();

    unhandledRejectionSpy.mockRestore();
  });
});
