/**
 * Tests for Forge Lab Store
 */
import { act, renderHook } from '@testing-library/react-native';
import { useForgeLabStore } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetGlobalPersistQueue } from '../../utils/PersistQueue';

// Mock the dependencies
jest.mock('@/src/lib/stores/workoutStore', () => ({
  getWorkoutHistory: jest.fn().mockResolvedValue([])
}));

jest.mock('@/src/lib/stores/settingsStore', () => ({
  getUserBodyweight: jest.fn().mockReturnValue(70),
  getUserWeightHistory: jest.fn().mockReturnValue([])
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock the queued storage to avoid PersistQueue complexity
jest.mock('@/src/lib/stores/storage/createQueuedAsyncStorage', () => ({
  createQueuedJSONStorage: () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

describe('Forge Lab Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGlobalPersistQueue();
    // Reset store state between tests using setState wrapped in act
    act(() => {
      useForgeLabStore.setState({
        data: null,
        loading: false,
        error: null,
        dateRange: '3M',
        lastHash: undefined
      }, true);
    });
  });

  afterEach(() => {
    // Clean up after each test
    act(() => {
      useForgeLabStore.setState({
        data: null,
        loading: false,
        error: null,
        dateRange: '3M',
        lastHash: undefined
      });
    });
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useForgeLabStore());
    const state = result.current;

    expect(state.data).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.dateRange).toBe('3M');
  });

  it('should update date range via setState', () => {
    const { result } = renderHook(() => useForgeLabStore());

    act(() => {
      useForgeLabStore.setState({ dateRange: '1M' });
    });

    const newState = result.current;
    expect(newState.dateRange).toBe('1M');
  });

  it('should maintain loading state initially', () => {
    const { result } = renderHook(() => useForgeLabStore());
    const state = result.current;

    expect(state.loading).toBe(false);
  });

  it('should support loading state updates', () => {
    const { result } = renderHook(() => useForgeLabStore());

    act(() => {
      useForgeLabStore.setState({ loading: true });
    });

    expect(result.current.loading).toBe(true);

    act(() => {
      useForgeLabStore.setState({ loading: false });
    });

    expect(result.current.loading).toBe(false);
  });

  it('should support error state updates', () => {
    const { result } = renderHook(() => useForgeLabStore());

    act(() => {
      useForgeLabStore.setState({ error: 'Test error' });
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      useForgeLabStore.setState({ error: null });
    });

    expect(result.current.error).toBeNull();
  });

  it('should support data updates', () => {
    const { result } = renderHook(() => useForgeLabStore());

    const mockData = {
      weightHistory: [{ date: '2026-01-01', weightKg: 75 }],
      exerciseStats: [],
      muscleGroupVolume: []
    };

    act(() => {
      useForgeLabStore.setState({ data: mockData });
    });

    expect(result.current.data).toEqual(mockData);
  });
});