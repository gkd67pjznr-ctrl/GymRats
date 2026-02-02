/**
 * Tests for Forge Lab Store
 */
import { useForgeLabStore } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetGlobalPersistQueue } from '../../utils/PersistQueue';

// Mock the dependencies
jest.mock('@/src/lib/stores/workoutStore', () => ({
  getWorkoutHistory: jest.fn().mockResolvedValue([])
}));

jest.mock('@/src/lib/stores/settingsStore', () => ({
  getUserBodyweight: jest.fn().mockReturnValue(70),
  getUserWeightHistory: jest.fn().mockReturnValue([]),
}));

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

describe('Forge Lab Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGlobalPersistQueue();
    // Reset store state between tests (merge mode to preserve actions)
    useForgeLabStore.setState({
      data: null,
      loading: false,
      error: null,
      dateRange: '3M',
      lastHash: undefined,
    });
  });

  it('should have initial state', () => {
    const state = useForgeLabStore.getState();
    expect(state.data).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.dateRange).toBe('3M');
  });

  it('should set date range', () => {
    useForgeLabStore.getState().setDateRange('1M');

    const state = useForgeLabStore.getState();
    expect(state.dateRange).toBe('1M');
  });

  it('should maintain loading state initially', () => {
    const state = useForgeLabStore.getState();
    expect(state.loading).toBe(false);
  });
});