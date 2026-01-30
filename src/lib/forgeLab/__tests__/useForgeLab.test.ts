/**
 * Tests for Forge Lab Hook
 */
import { renderHook } from '@testing-library/react-native';
import * as useForgeLabModule from '../useForgeLab';

// Mock the store implementation
const mockForgeLabStore = {
  data: {
    weightHistory: [],
    exerciseStats: [
      {
        exerciseId: 'bench',
        name: 'Bench Press',
        e1rmHistory: [],
        volumeHistory: [],
        rankHistory: []
      }
    ],
    muscleGroupVolume: []
  },
  loading: false,
  error: null,
  dateRange: '3M',
  loadData: jest.fn(),
  setDateRange: jest.fn(),
  refreshData: jest.fn()
};

// Mock the store hooks
jest.mock('../store', () => ({
  useForgeLabStore: () => mockForgeLabStore,
  useForgeLabData: () => ({
    data: mockForgeLabStore.data,
    loading: mockForgeLabStore.loading,
    error: mockForgeLabStore.error
  }),
  useForgeLabActions: () => ({
    loadData: mockForgeLabStore.loadData,
    setDateRange: mockForgeLabStore.setDateRange,
    refreshData: mockForgeLabStore.refreshData
  }),
  useForgeLabDateRange: () => mockForgeLabStore.dateRange
}));

describe('Forge Lab Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return forge lab data', () => {
    const { result } = renderHook(() => useForgeLabModule.useForgeLab());

    expect(result.current.data).toEqual(mockForgeLabStore.data);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.dateRange).toBe('3M');
  });

  it('should return exercise stats', () => {
    const { result } = renderHook(() => useForgeLabModule.useExerciseStats('bench'));

    expect(result.current).toEqual(mockForgeLabStore.data?.exerciseStats[0]);
  });

  it('should return null for non-existent exercise stats', () => {
    const { result } = renderHook(() => useForgeLabModule.useExerciseStats('squat'));

    expect(result.current).toBeNull();
  });

  it('should return weight history', () => {
    const { result } = renderHook(() => useForgeLabModule.useWeightHistory());

    expect(result.current).toEqual(mockForgeLabStore.data?.weightHistory);
  });

  it('should return muscle group volume', () => {
    const { result } = renderHook(() => useForgeLabModule.useMuscleGroupVolume());

    expect(result.current).toEqual(mockForgeLabStore.data?.muscleGroupVolume);
  });

  it('should check premium user status', () => {
    const { result } = renderHook(() => useForgeLabModule.useIsPremiumUser());

    // For now, we're just testing that it returns a boolean
    expect(typeof result.current).toBe('boolean');
  });
});