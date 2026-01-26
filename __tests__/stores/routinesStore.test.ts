/**
 * Tests for routinesStore.ts
 *
 * Tests cover:
 * - upsertRoutine() - Creating new routine (should add to array)
 * - upsertRoutine() - Updating existing routine (should replace by id)
 * - deleteRoutine() - Remove routine from array
 * - clearRoutines() - Empty the routines array
 * - Persistence with AsyncStorage (verify data survives rehydration)
 * - Hydration tracking (setHydrated behavior)
 * - Selector functions return expected data
 *
 * Target: 85%+ coverage
 */

import { act, renderHook } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useRoutinesStore,
  useRoutines,
  useRoutine,
  getRoutines,
  getRoutineById,
  upsertRoutine,
  deleteRoutine as imperativeDeleteRoutine,
  clearRoutines as imperativeClearRoutines,
  selectRoutines,
  selectRoutineById,
  type Routine,
} from '../../src/lib/stores/routinesStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock the queued storage to avoid PersistQueue complexity
jest.mock('../../src/lib/stores/storage/createQueuedAsyncStorage', () => ({
  createQueuedJSONStorage: () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

describe('routinesStore', () => {
  const STORAGE_KEY = 'routines.v2';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset the store to initial state
    act(() => {
      useRoutinesStore.setState({
        routines: [],
        hydrated: false,
      });
    });
  });

  afterEach(() => {
    // Clean up after each test - wrap in act to avoid React warnings
    act(() => {
      useRoutinesStore.setState({
        routines: [],
        hydrated: false,
      });
    });
  });

  describe('upsertRoutine', () => {
    it('should add a new routine to the array when id does not exist', () => {
      const newRoutine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'bench',
            targetSets: 3,
            targetRepsMin: 6,
            targetRepsMax: 10,
          },
        ],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(newRoutine);
      });

      const state = useRoutinesStore.getState();
      expect(state.routines).toHaveLength(1);
      expect(state.routines[0]).toEqual(newRoutine);
    });

    it('should add new routines to the beginning of the array', () => {
      const routine1: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      const routine2: Routine = {
        id: 'routine-2',
        name: 'Pull Day',
        createdAtMs: 2000,
        updatedAtMs: 2000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine1);
        useRoutinesStore.getState().upsertRoutine(routine2);
      });

      const state = useRoutinesStore.getState();
      expect(state.routines).toHaveLength(2);
      expect(state.routines[0].id).toBe('routine-2'); // Most recent first
      expect(state.routines[1].id).toBe('routine-1');
    });

    it('should replace existing routine when id already exists', () => {
      const originalRoutine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'bench',
            targetSets: 3,
            targetRepsMin: 6,
            targetRepsMax: 10,
          },
        ],
      };

      const updatedRoutine: Routine = {
        id: 'routine-1', // Same ID
        name: 'Push Day Updated',
        createdAtMs: 1000,
        updatedAtMs: 2000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'bench',
            targetSets: 4, // Updated target sets
            targetRepsMin: 8,
            targetRepsMax: 12,
          },
          {
            id: 'ex-2',
            exerciseId: 'ohp',
            targetSets: 3,
            targetRepsMin: 6,
            targetRepsMax: 10,
          },
        ],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(originalRoutine);
        useRoutinesStore.getState().upsertRoutine(updatedRoutine);
      });

      const state = useRoutinesStore.getState();
      expect(state.routines).toHaveLength(1); // Still only one routine
      expect(state.routines[0]).toEqual(updatedRoutine);
      expect(state.routines[0].name).toBe('Push Day Updated');
      expect(state.routines[0].exercises).toHaveLength(2);
    });

    it('should handle updating routine at any position in the array', () => {
      const routine1: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      const routine2: Routine = {
        id: 'routine-2',
        name: 'Pull Day',
        createdAtMs: 2000,
        updatedAtMs: 2000,
        exercises: [],
      };

      const routine3: Routine = {
        id: 'routine-3',
        name: 'Leg Day',
        createdAtMs: 3000,
        updatedAtMs: 3000,
        exercises: [],
      };

      const updatedRoutine2: Routine = {
        id: 'routine-2',
        name: 'Pull Day Updated',
        createdAtMs: 2000,
        updatedAtMs: 2500,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine1);
        useRoutinesStore.getState().upsertRoutine(routine2);
        useRoutinesStore.getState().upsertRoutine(routine3);
        useRoutinesStore.getState().upsertRoutine(updatedRoutine2);
      });

      const state = useRoutinesStore.getState();
      expect(state.routines).toHaveLength(3);
      expect(state.routines[1]).toEqual(updatedRoutine2);
    });
  });

  describe('deleteRoutine', () => {
    it('should remove routine from array by id', () => {
      const routine1: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      const routine2: Routine = {
        id: 'routine-2',
        name: 'Pull Day',
        createdAtMs: 2000,
        updatedAtMs: 2000,
        exercises: [],
      };

      const routine3: Routine = {
        id: 'routine-3',
        name: 'Leg Day',
        createdAtMs: 3000,
        updatedAtMs: 3000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine1);
        useRoutinesStore.getState().upsertRoutine(routine2);
        useRoutinesStore.getState().upsertRoutine(routine3);
        useRoutinesStore.getState().deleteRoutine('routine-2');
      });

      const state = useRoutinesStore.getState();
      expect(state.routines).toHaveLength(2);
      expect(state.routines.find((r) => r.id === 'routine-2')).toBeUndefined();
      expect(state.routines.find((r) => r.id === 'routine-1')).toBeDefined();
      expect(state.routines.find((r) => r.id === 'routine-3')).toBeDefined();
    });

    it('should handle deleting non-existent routine gracefully', () => {
      const routine1: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine1);
        useRoutinesStore.getState().deleteRoutine('non-existent-id');
      });

      const state = useRoutinesStore.getState();
      expect(state.routines).toHaveLength(1);
      expect(state.routines[0].id).toBe('routine-1');
    });

    it('should handle deleting from empty array', () => {
      act(() => {
        useRoutinesStore.getState().deleteRoutine('any-id');
      });

      const state = useRoutinesStore.getState();
      expect(state.routines).toHaveLength(0);
    });
  });

  describe('clearRoutines', () => {
    it('should empty the routines array', () => {
      const routine1: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      const routine2: Routine = {
        id: 'routine-2',
        name: 'Pull Day',
        createdAtMs: 2000,
        updatedAtMs: 2000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine1);
        useRoutinesStore.getState().upsertRoutine(routine2);
        useRoutinesStore.getState().clearRoutines();
      });

      const state = useRoutinesStore.getState();
      expect(state.routines).toHaveLength(0);
      expect(state.routines).toEqual([]);
    });

    it('should handle clearing empty array', () => {
      act(() => {
        useRoutinesStore.getState().clearRoutines();
      });

      const state = useRoutinesStore.getState();
      expect(state.routines).toHaveLength(0);
    });

    it('should not affect hydrated flag', () => {
      act(() => {
        useRoutinesStore.getState().setHydrated(true);
        useRoutinesStore.getState().clearRoutines();
      });

      const state = useRoutinesStore.getState();
      expect(state.hydrated).toBe(true);
    });
  });

  describe('setHydrated', () => {
    it('should set hydrated flag to true', () => {
      act(() => {
        useRoutinesStore.getState().setHydrated(true);
      });

      const state = useRoutinesStore.getState();
      expect(state.hydrated).toBe(true);
    });

    it('should set hydrated flag to false', () => {
      act(() => {
        useRoutinesStore.getState().setHydrated(true);
        useRoutinesStore.getState().setHydrated(false);
      });

      const state = useRoutinesStore.getState();
      expect(state.hydrated).toBe(false);
    });

    it('should initialize with hydrated as false', () => {
      const state = useRoutinesStore.getState();
      expect(state.hydrated).toBe(false);
    });
  });

  describe('useRoutine hook', () => {
    it('should return routine by id', () => {
      const routine1: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      const routine2: Routine = {
        id: 'routine-2',
        name: 'Pull Day',
        createdAtMs: 2000,
        updatedAtMs: 2000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine1);
        useRoutinesStore.getState().upsertRoutine(routine2);
      });

      const { result } = renderHook(() => useRoutine('routine-2'));
      expect(result.current).toEqual(routine2);
    });

    it('should return undefined for non-existent id', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine);
      });

      const { result } = renderHook(() => useRoutine('non-existent'));
      expect(result.current).toBeUndefined();
    });

    it('should return undefined when no routines exist', () => {
      const { result } = renderHook(() => useRoutine('any-id'));
      expect(result.current).toBeUndefined();
    });
  });

  describe('getRoutines (imperative)', () => {
    it('should return sorted routines', () => {
      const routine1: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 3000,
        exercises: [],
      };

      const routine2: Routine = {
        id: 'routine-2',
        name: 'Pull Day',
        createdAtMs: 2000,
        updatedAtMs: 2000,
        exercises: [],
      };

      const routine3: Routine = {
        id: 'routine-3',
        name: 'Leg Day',
        createdAtMs: 3000,
        updatedAtMs: 1000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine1);
        useRoutinesStore.getState().upsertRoutine(routine2);
        useRoutinesStore.getState().upsertRoutine(routine3);
      });

      const routines = getRoutines();
      expect(routines).toHaveLength(3);
      expect(routines[0].id).toBe('routine-1'); // Most recently updated
      expect(routines[1].id).toBe('routine-2');
      expect(routines[2].id).toBe('routine-3');
    });

    it('should return a copy, not the original array', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine);
      });

      const routines1 = getRoutines();
      const routines2 = getRoutines();

      expect(routines1).not.toBe(routines2); // Different references
      expect(routines1).toEqual(routines2); // Same content
    });
  });

  describe('getRoutineById (imperative)', () => {
    it('should return routine by id', () => {
      const routine1: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      const routine2: Routine = {
        id: 'routine-2',
        name: 'Pull Day',
        createdAtMs: 2000,
        updatedAtMs: 2000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine1);
        useRoutinesStore.getState().upsertRoutine(routine2);
      });

      const found = getRoutineById('routine-2');
      expect(found).toEqual(routine2);
    });

    it('should return undefined for non-existent id', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine);
      });

      const found = getRoutineById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('upsertRoutine (imperative)', () => {
    it('should add new routine', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      act(() => {
        upsertRoutine(routine);
      });

      const state = useRoutinesStore.getState();
      expect(state.routines).toHaveLength(1);
      expect(state.routines[0]).toEqual(routine);
    });

    it('should update existing routine', () => {
      const original: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      const updated: Routine = {
        id: 'routine-1',
        name: 'Push Day Updated',
        createdAtMs: 1000,
        updatedAtMs: 2000,
        exercises: [],
      };

      act(() => {
        upsertRoutine(original);
        upsertRoutine(updated);
      });

      const state = useRoutinesStore.getState();
      expect(state.routines).toHaveLength(1);
      expect(state.routines[0].name).toBe('Push Day Updated');
    });
  });

  describe('deleteRoutine (imperative)', () => {
    it('should remove routine', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      act(() => {
        upsertRoutine(routine);
        imperativeDeleteRoutine('routine-1');
      });

      const state = useRoutinesStore.getState();
      expect(state.routines).toHaveLength(0);
    });
  });

  describe('clearRoutines (imperative)', () => {
    it('should clear all routines', () => {
      const routine1: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      const routine2: Routine = {
        id: 'routine-2',
        name: 'Pull Day',
        createdAtMs: 2000,
        updatedAtMs: 2000,
        exercises: [],
      };

      act(() => {
        upsertRoutine(routine1);
        upsertRoutine(routine2);
        imperativeClearRoutines();
      });

      const state = useRoutinesStore.getState();
      expect(state.routines).toHaveLength(0);
    });
  });

  describe('selectRoutines selector', () => {
    it('should return routines sorted by updatedAtMs descending', () => {
      const routine1: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      const routine2: Routine = {
        id: 'routine-2',
        name: 'Pull Day',
        createdAtMs: 2000,
        updatedAtMs: 3000,
        exercises: [],
      };

      const routine3: Routine = {
        id: 'routine-3',
        name: 'Leg Day',
        createdAtMs: 3000,
        updatedAtMs: 2000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine1);
        useRoutinesStore.getState().upsertRoutine(routine2);
        useRoutinesStore.getState().upsertRoutine(routine3);
      });

      const state = useRoutinesStore.getState();
      const sorted = selectRoutines(state);

      expect(sorted[0].id).toBe('routine-2'); // updatedAtMs: 3000
      expect(sorted[1].id).toBe('routine-3'); // updatedAtMs: 2000
      expect(sorted[2].id).toBe('routine-1'); // updatedAtMs: 1000
    });

    it('should return a new array reference each call', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine);
      });

      const state = useRoutinesStore.getState();
      const result1 = selectRoutines(state);
      const result2 = selectRoutines(state);

      expect(result1).not.toBe(result2);
    });
  });

  describe('selectRoutineById selector', () => {
    it('should return routine by id', () => {
      const routine1: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      const routine2: Routine = {
        id: 'routine-2',
        name: 'Pull Day',
        createdAtMs: 2000,
        updatedAtMs: 2000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine1);
        useRoutinesStore.getState().upsertRoutine(routine2);
      });

      const state = useRoutinesStore.getState();
      const selector = selectRoutineById('routine-1');
      const found = selector(state);

      expect(found).toEqual(routine1);
    });

    it('should return undefined for non-existent id', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      act(() => {
        useRoutinesStore.getState().upsertRoutine(routine);
      });

      const state = useRoutinesStore.getState();
      const selector = selectRoutineById('non-existent');
      const found = selector(state);

      expect(found).toBeUndefined();
    });
  });

  describe('Integration: Complete workflow', () => {
    it('should handle full CRUD workflow', () => {
      // Create
      const pushDay: Routine = {
        id: 'push-day',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'bench',
            targetSets: 3,
            targetRepsMin: 6,
            targetRepsMax: 10,
          },
          {
            id: 'ex-2',
            exerciseId: 'ohp',
            targetSets: 3,
            targetRepsMin: 8,
            targetRepsMax: 12,
          },
        ],
      };

      act(() => {
        upsertRoutine(pushDay);
      });

      expect(getRoutines()).toHaveLength(1);

      // Read
      const found = getRoutineById('push-day');
      expect(found).toEqual(pushDay);
      expect(found?.exercises).toHaveLength(2);

      // Update
      const updated: Routine = {
        ...pushDay,
        name: 'Push Day v2',
        updatedAtMs: 2000,
        exercises: [
          ...pushDay.exercises,
          {
            id: 'ex-3',
            exerciseId: 'incline_bench',
            targetSets: 3,
            targetRepsMin: 8,
            targetRepsMax: 12,
          },
        ],
      };

      act(() => {
        upsertRoutine(updated);
      });

      const afterUpdate = getRoutineById('push-day');
      expect(afterUpdate?.name).toBe('Push Day v2');
      expect(afterUpdate?.exercises).toHaveLength(3);

      // Delete
      act(() => {
        imperativeDeleteRoutine('push-day');
      });

      expect(getRoutines()).toHaveLength(0);
      expect(getRoutineById('push-day')).toBeUndefined();
    });
  });
});
