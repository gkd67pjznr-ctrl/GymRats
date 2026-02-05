// src/lib/stores/dayLogStore.ts
// Zustand store for Day Log entries with AsyncStorage persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createQueuedJSONStorage } from './storage/createQueuedAsyncStorage';
import type { DayLog, DayLogDraft } from '../dayLog/types';
import { isDayLogDraftValid } from '../dayLog/types';
import { uid } from '../uid';
import { getUser } from './authStore';

const STORAGE_KEY = 'dayLogStore.v1';

interface DayLogState {
  logs: DayLog[];
  hydrated: boolean;

  // Actions
  addLog: (draft: DayLogDraft, sessionId: string) => DayLog | null;
  updateLog: (id: string, updates: Partial<DayLog>) => void;
  removeLog: (id: string) => void;
  clearLogs: () => void;
  getLogById: (id: string) => DayLog | undefined;
  getLogForSession: (sessionId: string) => DayLog | undefined;
  getLogsInRange: (startMs: number, endMs: number) => DayLog[];
  setHydrated: (value: boolean) => void;
}

export const useDayLogStore = create<DayLogState>()(
  persist(
    (set, get) => ({
      logs: [],
      hydrated: false,

      addLog: (draft, sessionId) => {
        if (!isDayLogDraftValid(draft)) {
          console.warn('[dayLogStore] Invalid draft, cannot add log');
          return null;
        }

        const user = getUser();
        const userId = user?.id ?? 'anonymous';

        const newLog: DayLog = {
          id: uid(),
          sessionId,
          userId,
          createdAt: Date.now(),
          hydration: draft.hydration!,
          nutrition: draft.nutrition!,
          carbsLevel: draft.carbsLevel!,
          hasPain: draft.hasPain!,
          painLocations: draft.hasPain ? draft.painLocations : undefined,
          energyLevel: draft.energyLevel!,
          sleepQuality: draft.sleepQuality!,
          notes: draft.notes || undefined,
        };

        set((state) => ({
          logs: [newLog, ...state.logs],
        }));

        return newLog;
      },

      updateLog: (id, updates) =>
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id ? { ...log, ...updates } : log
          ),
        })),

      removeLog: (id) =>
        set((state) => ({
          logs: state.logs.filter((log) => log.id !== id),
        })),

      clearLogs: () => set({ logs: [] }),

      getLogById: (id) => get().logs.find((log) => log.id === id),

      getLogForSession: (sessionId) =>
        get().logs.find((log) => log.sessionId === sessionId),

      getLogsInRange: (startMs, endMs) =>
        get().logs.filter(
          (log) => log.createdAt >= startMs && log.createdAt <= endMs
        ),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({ logs: state.logs }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// ============================================================================
// Helper hooks
// ============================================================================

/**
 * Hook to get all Day Log entries
 */
export const useDayLogs = () => {
  const logs = useDayLogStore((state) => state.logs);
  const hydrated = useDayLogStore((state) => state.hydrated);
  return { logs, hydrated };
};

/**
 * Hook to get a specific Day Log entry
 */
export const useDayLog = (id: string) => {
  const getLogById = useDayLogStore((state) => state.getLogById);
  return getLogById(id);
};

/**
 * Hook to get the Day Log for a specific workout session
 */
export const useDayLogForSession = (sessionId: string) => {
  const getLogForSession = useDayLogStore((state) => state.getLogForSession);
  return getLogForSession(sessionId);
};

// ============================================================================
// Imperative API for non-React code
// ============================================================================

export const addDayLog = (draft: DayLogDraft, sessionId: string) => {
  return useDayLogStore.getState().addLog(draft, sessionId);
};

export const updateDayLog = (id: string, updates: Partial<DayLog>) => {
  useDayLogStore.getState().updateLog(id, updates);
};

export const removeDayLog = (id: string) => {
  useDayLogStore.getState().removeLog(id);
};

export const getDayLogForSession = (sessionId: string) => {
  return useDayLogStore.getState().getLogForSession(sessionId);
};

export const getDayLogsInRange = (startMs: number, endMs: number) => {
  return useDayLogStore.getState().getLogsInRange(startMs, endMs);
};

export const getAllDayLogs = () => {
  return useDayLogStore.getState().logs;
};
