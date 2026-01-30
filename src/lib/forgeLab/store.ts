/**
 * Forge Lab Store - Zustand store for Forge Lab analytics
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ForgeLabState } from './types';
import { compileForgeLabData } from './calculator';
import { getWorkoutHistory } from '@/src/lib/stores/workoutStore';
import { getUserBodyweight } from '@/src/lib/stores/settingsStore';

const initialState: ForgeLabState = {
  data: null,
  loading: false,
  error: null,
  dateRange: '3M'
};

export const useForgeLabStore = create<ForgeLabState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Load analytics data
       */
      loadData: async () => {
        set({ loading: true, error: null });
        try {
          // Get workout history
          const sessions = await getWorkoutHistory();

          // Get user bodyweight
          const bodyweightKg = getUserBodyweight();

          // Get current date range
          const { dateRange } = get();

          // Compile data
          const data = compileForgeLabData(sessions, bodyweightKg, dateRange);

          set({ data, loading: false });
        } catch (error) {
          if (__DEV__) {
            console.error('Error loading Forge Lab data:', error);
          }
          set({
            error: error instanceof Error ? error.message : 'Failed to load analytics data',
            loading: false
          });
        }
      },

      /**
       * Set date range filter
       */
      setDateRange: (dateRange) => {
        set({ dateRange });
        // Reload data with new date range
        get().loadData();
      },

      /**
       * Refresh data
       */
      refreshData: () => {
        get().loadData();
      },

      /**
       * Clear data
       */
      clearData: () => {
        set(initialState);
      }
    }),
    {
      name: 'forgeLabStore',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

/**
 * Selector hooks for easier data access
 */
export const useForgeLabData = () => {
  const { data, loading, error } = useForgeLabStore();
  return { data, loading, error };
};

export const useForgeLabActions = () => {
  const { loadData, setDateRange, refreshData, clearData } = useForgeLabStore();
  return { loadData, setDateRange, refreshData, clearData };
};

export const useForgeLabDateRange = () => {
  return useForgeLabStore(state => state.dateRange);
};