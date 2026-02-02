// src/lib/stores/__tests__/settingsStore.test.ts
// Tests for settingsStore - Zustand settings store with weight tracking

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useSettingsStore, getUserBodyweight, getUserWeightHistory, updateSettings , useSettings } from '../settingsStore';

// Mock AsyncStorage for Zustand persistence
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('settingsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to default state
    useSettingsStore.setState({
      hapticsEnabled: true,
      soundsEnabled: true,
      unitSystem: 'lb',
      defaultRestSeconds: 90,
      displayName: 'Lifter',
      bodyweight: 70, // default kg (~154 lb)
      experienceLevel: 'intermediate',
      personalityId: 'coach',
      goal: 'general',
      accent: 'toxic',
      replayAutoPlay: true,
      weightHistory: [],
      notificationPrefs: {
        friendRequests: true,
        directMessages: true,
        competitionResults: true,
        restTimer: true,
        reactions: true,
        comments: true,
      },
      audioCues: {
        prCelebration: true,
        restTimerStart: true,
        restTimerEnd: true,
        workoutComplete: true,
        rankUp: true,
        levelUp: true,
      },
      restTimerFeedback: {
        audio: true,
        haptic: true,
        voice: true,
        notification: true,
        visualProgress: true,
      },
      hydrated: false,
    });
  });

  describe('initial state', () => {
    test('has default bodyweight of 70kg', () => {
      const { result } = renderHook(() => useSettingsStore());
      expect(result.current.bodyweight).toBe(70);
    });

    test('has empty weightHistory array', () => {
      const { result } = renderHook(() => useSettingsStore());
      expect(result.current.weightHistory).toEqual([]);
    });

    test('useSettings hook returns settings object', () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.bodyweight).toBe(70);
      expect(result.current.weightHistory).toEqual([]);
    });
  });

  describe('addWeightEntry', () => {
    test('adds new weight entry with specified date', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addWeightEntry(75, '2024-01-01');
      });

      expect(result.current.weightHistory).toHaveLength(1);
      expect(result.current.weightHistory[0]).toEqual({
        date: '2024-01-01',
        weightKg: 75,
      });
      // Bodyweight should not change since entry is not for today
      expect(result.current.bodyweight).toBe(70);
    });

    test('adds new weight entry without date (uses today)', () => {
      const { result } = renderHook(() => useSettingsStore());
      const today = new Date().toISOString().split('T')[0];

      act(() => {
        result.current.addWeightEntry(75);
      });

      expect(result.current.weightHistory).toHaveLength(1);
      expect(result.current.weightHistory[0].date).toBe(today);
      expect(result.current.weightHistory[0].weightKg).toBe(75);
      // Bodyweight should update since entry is for today
      expect(result.current.bodyweight).toBe(75);
    });

    test('updates existing entry for same date', () => {
      const { result } = renderHook(() => useSettingsStore());

      // Add initial entry
      act(() => {
        result.current.addWeightEntry(75, '2024-01-01');
      });

      // Update same date
      act(() => {
        result.current.addWeightEntry(76.5, '2024-01-01');
      });

      expect(result.current.weightHistory).toHaveLength(1); // Still only one entry
      expect(result.current.weightHistory[0]).toEqual({
        date: '2024-01-01',
        weightKg: 76.5,
      });
    });

    test('sorts entries by date (newest first)', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addWeightEntry(70, '2024-01-01');
        result.current.addWeightEntry(71, '2024-01-03');
        result.current.addWeightEntry(72, '2024-01-02');
      });

      expect(result.current.weightHistory).toHaveLength(3);
      expect(result.current.weightHistory[0].date).toBe('2024-01-03');
      expect(result.current.weightHistory[0].weightKg).toBe(71);
      expect(result.current.weightHistory[1].date).toBe('2024-01-02');
      expect(result.current.weightHistory[1].weightKg).toBe(72);
      expect(result.current.weightHistory[2].date).toBe('2024-01-01');
      expect(result.current.weightHistory[2].weightKg).toBe(70);
    });

    test('updates current bodyweight when entry is for today', () => {
      const { result } = renderHook(() => useSettingsStore());
      const today = new Date().toISOString().split('T')[0];

      act(() => {
        result.current.addWeightEntry(75, today);
      });

      expect(result.current.bodyweight).toBe(75);
      expect(result.current.weightHistory[0].date).toBe(today);
      expect(result.current.weightHistory[0].weightKg).toBe(75);
    });
  });

  describe('updateCurrentWeight', () => {
    test('updates bodyweight and adds today entry', () => {
      const { result } = renderHook(() => useSettingsStore());
      const today = new Date().toISOString().split('T')[0];

      act(() => {
        result.current.updateCurrentWeight(75);
      });

      expect(result.current.bodyweight).toBe(75);
      expect(result.current.weightHistory).toHaveLength(1);
      expect(result.current.weightHistory[0]).toEqual({
        date: today,
        weightKg: 75,
      });
    });

    test('updates existing today entry if it exists', () => {
      const { result } = renderHook(() => useSettingsStore());
      const today = new Date().toISOString().split('T')[0];

      // Add initial entry for today
      act(() => {
        result.current.addWeightEntry(70, today);
      });

      // Update current weight
      act(() => {
        result.current.updateCurrentWeight(75);
      });

      expect(result.current.bodyweight).toBe(75);
      expect(result.current.weightHistory).toHaveLength(1); // Still only one entry
      expect(result.current.weightHistory[0]).toEqual({
        date: today,
        weightKg: 75,
      });
    });

    test('maintains other historical entries', () => {
      const { result } = renderHook(() => useSettingsStore());
      const today = new Date().toISOString().split('T')[0];

      // Add historical entries
      act(() => {
        result.current.addWeightEntry(70, '2024-01-01');
        result.current.addWeightEntry(71, '2024-01-02');
      });

      // Update current weight
      act(() => {
        result.current.updateCurrentWeight(75);
      });

      expect(result.current.bodyweight).toBe(75);
      expect(result.current.weightHistory).toHaveLength(3);
      expect(result.current.weightHistory[0].date).toBe(today);
      expect(result.current.weightHistory[0].weightKg).toBe(75);
      expect(result.current.weightHistory[1].date).toBe('2024-01-02');
      expect(result.current.weightHistory[1].weightKg).toBe(71);
      expect(result.current.weightHistory[2].date).toBe('2024-01-01');
      expect(result.current.weightHistory[2].weightKg).toBe(70);
    });
  });

  describe('getUserBodyweight', () => {
    test('returns current bodyweight', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.updateCurrentWeight(75);
      });

      expect(getUserBodyweight()).toBe(75);
    });
  });

  describe('getUserWeightHistory', () => {
    test('returns sorted weight history (newest first)', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addWeightEntry(70, '2024-01-01');
        result.current.addWeightEntry(71, '2024-01-03');
        result.current.addWeightEntry(72, '2024-01-02');
      });

      const history = getUserWeightHistory();
      expect(history).toHaveLength(3);
      expect(history[0].date).toBe('2024-01-03');
      expect(history[1].date).toBe('2024-01-02');
      expect(history[2].date).toBe('2024-01-01');
    });

    test('returns empty array when no history', () => {
      expect(getUserWeightHistory()).toEqual([]);
    });
  });

  describe('updateSettings', () => {
    test('updates bodyweight via updateSettings', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        updateSettings({ bodyweight: 75 });
      });

      expect(result.current.bodyweight).toBe(75);
    });

    test('updates unitSystem via updateSettings', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        updateSettings({ unitSystem: 'kg' });
      });

      expect(result.current.unitSystem).toBe('kg');
    });
  });

  describe('integration', () => {
    test('weightHistory persists when bodyweight changes', () => {
      const { result } = renderHook(() => useSettingsStore());

      // Add historical entries
      act(() => {
        result.current.addWeightEntry(70, '2024-01-01');
        result.current.addWeightEntry(71, '2024-01-02');
        result.current.updateCurrentWeight(75); // Adds today
      });

      expect(result.current.bodyweight).toBe(75);
      expect(result.current.weightHistory).toHaveLength(3);

      // Change bodyweight again
      act(() => {
        result.current.updateCurrentWeight(76);
      });

      expect(result.current.bodyweight).toBe(76);
      expect(result.current.weightHistory).toHaveLength(3); // Today's entry updated, not added
    });
  });
});