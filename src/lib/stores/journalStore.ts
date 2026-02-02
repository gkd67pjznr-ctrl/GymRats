// src/lib/stores/journalStore.ts
// Zustand store for journal entries with AsyncStorage persistence

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import type { JournalEntry } from "../journalModel";
import type { SyncMetadata } from "../sync/syncTypes";
import { getUser } from "./authStore";

const STORAGE_KEY = "journalEntries.v1";

interface SearchFilters {
  mood?: { min?: number; max?: number };
  energy?: { min?: number; max?: number };
  dateRange?: { start: string; end: string };
  hasSoreness?: boolean;
}

interface JournalState {
  entries: JournalEntry[];
  hydrated: boolean;
  _sync: SyncMetadata;

  // Actions
  addEntry: (entry: JournalEntry) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  removeEntry: (id: string) => void;
  clearEntries: () => void;
  getEntryById: (id: string) => JournalEntry | undefined;
  getEntriesByDateRange: (startDate: string, endDate: string) => JournalEntry[];
  searchEntries: (query: string, filters?: SearchFilters) => JournalEntry[];
  getEntryForSession: (sessionId: string) => JournalEntry | undefined;
  getEntriesForDate: (date: string) => JournalEntry[];
  setHydrated: (value: boolean) => void;

  // Sync actions (optional for premium)
  pullFromServer: () => Promise<void>;
  pushToServer: () => Promise<void>;
  sync: () => Promise<void>;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      hydrated: false,
      _sync: {
        lastSyncAt: null,
        lastSyncHash: null,
        syncStatus: "idle",
        syncError: null,
        pendingMutations: 0,
      },

      addEntry: (entry) =>
        set((state) => ({
          entries: [entry, ...state.entries],
          _sync: {
            ...state._sync,
            pendingMutations: state._sync.pendingMutations + 1,
          },
        })),

      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates, updatedAt: Date.now() } : entry
          ),
          _sync: {
            ...state._sync,
            pendingMutations: state._sync.pendingMutations + 1,
          },
        })),

      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
          _sync: {
            ...state._sync,
            pendingMutations: state._sync.pendingMutations + 1,
          },
        })),

      clearEntries: () => set({ entries: [] }),

      getEntryById: (id) => get().entries.find((entry) => entry.id === id),

      getEntriesByDateRange: (startDate, endDate) => {
        const entries = get().entries;
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        return entries.filter((entry) => {
          const entryDate = new Date(entry.date).getTime();
          return entryDate >= start && entryDate <= end;
        });
      },

      searchEntries: (query, filters) => {
        let results = get().entries;

        // Text search
        if (query.trim()) {
          const searchTerm = query.toLowerCase();
          results = results.filter((entry) =>
            entry.text.toLowerCase().includes(searchTerm)
          );
        }

        // Mood filter
        if (filters?.mood) {
          const { min, max } = filters.mood;
          results = results.filter((entry) => {
            if (entry.mood === undefined) return false;
            if (min !== undefined && entry.mood < min) return false;
            if (max !== undefined && entry.mood > max) return false;
            return true;
          });
        }

        // Energy filter
        if (filters?.energy) {
          const { min, max } = filters.energy;
          results = results.filter((entry) => {
            if (entry.energy === undefined) return false;
            if (min !== undefined && entry.energy < min) return false;
            if (max !== undefined && entry.energy > max) return false;
            return true;
          });
        }

        // Date range filter
        if (filters?.dateRange) {
          const { start, end } = filters.dateRange;
          const startTime = new Date(start).getTime();
          const endTime = new Date(end).getTime();

          results = results.filter((entry) => {
            const entryDate = new Date(entry.date).getTime();
            return entryDate >= startTime && entryDate <= endTime;
          });
        }

        // Soreness filter
        if (filters?.hasSoreness !== undefined) {
          results = results.filter((entry) => {
            const hasSoreness = entry.soreness && entry.soreness.length > 0;
            return filters.hasSoreness ? hasSoreness : !hasSoreness;
          });
        }

        return results;
      },

      getEntryForSession: (sessionId) =>
        get().entries.find((entry) => entry.sessionId === sessionId),

      getEntriesForDate: (date) =>
        get().entries.filter((entry) => entry.date === date),

      setHydrated: (value) => set({ hydrated: value }),

      // Sync actions (stub implementations - can be extended for premium)
      pullFromServer: async () => {
        const user = getUser();
        if (!user) {
          console.warn("[journalStore] Cannot pull: no user signed in");
          return;
        }

        set({ _sync: { ...get()._sync, syncStatus: "syncing", syncError: null } });

        try {
          // TODO: Implement server fetch when backend is ready
          // const remoteEntries = await journalRepository.fetchAll(user.id);
          // set({ entries: remoteEntries });

          set({
            _sync: {
              ...get()._sync,
              syncStatus: "success",
              lastSyncAt: Date.now(),
            },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          set({
            _sync: {
              ...get()._sync,
              syncStatus: "error",
              syncError: errorMessage,
            },
          });
          throw error;
        }
      },

      pushToServer: async () => {
        const user = getUser();
        if (!user) {
          console.warn("[journalStore] Cannot push: no user signed in");
          return;
        }

        try {
          // TODO: Implement server sync when backend is ready
          // const entries = get().entries;
          // await journalRepository.syncUp(entries, user.id);

          set({
            _sync: {
              ...get()._sync,
              pendingMutations: 0,
            },
          });
        } catch (error) {
          console.error("[journalStore] Push failed:", error);
          throw error;
        }
      },

      sync: async () => {
        await get().pullFromServer();
        await get().pushToServer();
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({ entries: state.entries }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Helper hooks
export const useJournalEntries = () => {
  const entries = useJournalStore((state) => state.entries);
  const hydrated = useJournalStore((state) => state.hydrated);
  return { entries, hydrated };
};

export const useJournalEntry = (id: string) => {
  const getEntryById = useJournalStore((state) => state.getEntryById);
  return getEntryById(id);
};

export const useJournalEntriesForDate = (date: string) => {
  const getEntriesForDate = useJournalStore((state) => state.getEntriesForDate);
  return getEntriesForDate(date);
};

export const useJournalEntryForSession = (sessionId: string) => {
  const getEntryForSession = useJournalStore((state) => state.getEntryForSession);
  return getEntryForSession(sessionId);
};

// Utility functions
export const addJournalEntry = (entry: JournalEntry) => {
  useJournalStore.getState().addEntry(entry);
};

export const updateJournalEntry = (id: string, updates: Partial<JournalEntry>) => {
  useJournalStore.getState().updateEntry(id, updates);
};

export const removeJournalEntry = (id: string) => {
  useJournalStore.getState().removeEntry(id);
};