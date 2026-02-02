/**
 * Forge Lab Store - Zustand store for Forge Lab analytics
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ForgeLabState } from './types';
import { compileForgeLabData } from './calculator';
import { getWorkoutHistory } from '@/src/lib/stores/workoutStore';
import { getUserBodyweight, getUserWeightHistory } from '@/src/lib/stores/settingsStore';
import type { WorkoutSession } from '@/src/lib/workoutModel';
import { createQueuedJSONStorage } from '@/src/lib/stores/storage/createQueuedAsyncStorage';

/**
 * Compute a hash of input data to detect changes
 * Uses DJB2 algorithm over session IDs, timestamps, set counts, and bodyweight
 */
function computeHash(sessions: WorkoutSession[], bodyweightKg: number, weightHistory: { date: string; weightKg: number }[] = []): string {
  // Sort sessions by startedAtMs to ensure consistent hash regardless of array order
  const sorted = [...sessions].sort((a, b) => a.startedAtMs - b.startedAtMs);
  let hash = 5381;
  for (const session of sorted) {
    const str = `${session.id}|${session.startedAtMs}|${session.sets.length}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
  }
  // Incorporate bodyweight
  const bwStr = bodyweightKg.toString();
  for (let i = 0; i < bwStr.length; i++) {
    hash = (hash * 33) ^ bwStr.charCodeAt(i);
  }
  // Incorporate weight history
  const sortedWeightHistory = [...weightHistory].sort((a, b) => a.date.localeCompare(b.date));
  for (const entry of sortedWeightHistory) {
    const str = `${entry.date}|${entry.weightKg}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
  }
  // Return as hex string
  return (hash >>> 0).toString(16);
}

/**
 * Filter sessions by date range
 */
function filterSessionsByDateRange(sessions: WorkoutSession[], dateRange: string): WorkoutSession[] {
  if (dateRange === 'ALL') return sessions;

  const now = Date.now();
  let cutoffMs: number;
  switch (dateRange) {
    case '1W': cutoffMs = now - 7 * 24 * 60 * 60 * 1000; break;
    case '1M': cutoffMs = now - 30 * 24 * 60 * 60 * 1000; break;
    case '3M': cutoffMs = now - 90 * 24 * 60 * 60 * 1000; break;
    case '6M': cutoffMs = now - 180 * 24 * 60 * 60 * 1000; break;
    case '1Y': cutoffMs = now - 365 * 24 * 60 * 60 * 1000; break;
    default: return sessions;
  }

  return sessions.filter(session => session.startedAtMs >= cutoffMs);
}

const initialState: ForgeLabState = {
  data: null,
  loading: false,
  error: null,
  dateRange: '3M',
  lastHash: undefined
};

export const useForgeLabStore = create<ForgeLabState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Load analytics data with caching
       */
      loadData: async () => {
        set({ loading: true, error: null });
        try {
          // Get workout history
          const allSessions = await getWorkoutHistory();
          // Get user bodyweight and weight history
          const bodyweightKg = getUserBodyweight();
          const weightHistory = getUserWeightHistory();
          // Get current date range
          const { dateRange } = get();

          // Filter sessions by date range
          const filteredSessions = filterSessionsByDateRange(allSessions, dateRange);

          // Compute hash of input data
          const hash = `${computeHash(filteredSessions, bodyweightKg, weightHistory)}|${dateRange}`;
          const { lastHash, data: existingData } = get();

          // Skip recomputation if hash matches and we have data
          if (lastHash === hash && existingData) {
            if (process.env.NODE_ENV !== 'production') {
              console.log('Forge Lab cache hit:', hash);
            }
            set({ loading: false });
            return;
          }

          if (process.env.NODE_ENV !== 'production') {
            console.log('Forge Lab cache miss, computing:', hash);
          }

          // Compile data with filtered sessions
          const data = compileForgeLabData(filteredSessions, bodyweightKg, weightHistory);

          set({ data, lastHash: hash, loading: false });
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
      storage: createQueuedJSONStorage()
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