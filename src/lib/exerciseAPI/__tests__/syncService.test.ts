/**
 * Unit tests for ExerciseDB sync service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getSyncState,
  getCachedExercises,
  syncBodyPart,
  initialSync,
  getSyncedExercises,
  resetSync,
  isSyncComplete,
  getSyncProgress,
} from '../syncService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock the API service
jest.mock('../exerciseDBService', () => ({
  fetchAllExercisesFromAPI: jest.fn(),
  fetchExercisesByBodyPart: jest.fn(),
  getBodyParts: jest.fn(),
  BODY_PARTS: ['back', 'chest', 'shoulders'],
}));

// Mock the name simplifier
jest.mock('../nameSimplifier', () => ({
  simplifyExerciseName: jest.fn((name) => ({
    simplified: name.split(' - ')[0],
    removed: [],
  })),
  areSameExercise: jest.fn(() => false),
}));

describe('Sync State Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSyncState', () => {
    it('should return default state when no data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const state = await getSyncState();

      expect(state).toEqual({
        lastSyncAt: null,
        completedBodyParts: [],
        totalExercises: 0,
        syncInProgress: false,
      });
    });

    it('should return saved state', async () => {
      const savedState = {
        lastSyncAt: Date.now(),
        completedBodyParts: ['back', 'chest'],
        totalExercises: 150,
        syncInProgress: false,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(savedState));

      const state = await getSyncState();

      expect(state.lastSyncAt).toBe(savedState.lastSyncAt);
      expect(state.completedBodyParts).toEqual(['back', 'chest']);
      expect(state.totalExercises).toBe(150);
    });
  });

  describe('resetSync', () => {
    it('should remove sync state and cached exercises', async () => {
      await resetSync();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'exerciseDB_sync_state',
        'exerciseDB_cached_exercises',
      ]);
    });
  });
});

describe('Exercise Caching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCachedExercises', () => {
    it('should return empty array when no cache exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const cached = await getCachedExercises();

      expect(cached).toEqual([]);
    });

    it('should return cached exercises', async () => {
      const exercises = [
        { id: '1', name: 'Bench Press', bodyPart: 'chest', target: 'pectorals', equipment: 'barbell' },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(exercises));

      const cached = await getCachedExercises();

      expect(cached).toEqual(exercises);
    });
  });
});

describe('Sync Progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isSyncComplete', () => {
    it('should return false when no body parts completed', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
        lastSyncAt: null,
        completedBodyParts: [],
        totalExercises: 0,
        syncInProgress: false,
      }));

      const complete = await isSyncComplete();

      expect(complete).toBe(false);
    });

    it('should return false when some body parts completed', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
        lastSyncAt: Date.now(),
        completedBodyParts: ['back', 'chest'],
        totalExercises: 100,
        syncInProgress: false,
      }));

      const complete = await isSyncComplete();

      expect(complete).toBe(false);
    });

    it('should return true when all body parts completed', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
        lastSyncAt: Date.now(),
        completedBodyParts: ['back', 'chest', 'shoulders'],
        totalExercises: 150,
        syncInProgress: false,
      }));

      const complete = await isSyncComplete();

      expect(complete).toBe(true);
    });
  });

  describe('getSyncProgress', () => {
    it('should return correct progress', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
        lastSyncAt: Date.now(),
        completedBodyParts: ['back', 'chest'],
        totalExercises: 100,
        syncInProgress: false,
      }));

      const progress = await getSyncProgress();

      expect(progress.completed).toBe(2);
      expect(progress.total).toBe(3);
      expect(progress.percent).toBe(67);
    });
  });
});
