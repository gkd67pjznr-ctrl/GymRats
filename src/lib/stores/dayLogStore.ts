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

/**
 * Session-level UI state for the Day Log prompt flow
 * This state is NOT persisted - resets each session
 */
interface DayLogUIState {
  // Whether the user has been shown the initial text bubble this session
  hasSeenPrompt: boolean;
  // Whether the user dismissed the prompt (said "No")
  promptDismissed: boolean;
  // Whether the user has completed logging this session
  hasLoggedThisSession: boolean;
  // Whether the form is currently visible
  formVisible: boolean;
  // Whether the confirmation prompt is visible
  confirmPromptVisible: boolean;
  // Current session ID for tracking
  currentSessionId: string | null;
}

interface DayLogState {
  logs: DayLog[];
  hydrated: boolean;

  // Session-level UI state (not persisted)
  ui: DayLogUIState;

  // Actions
  addLog: (draft: DayLogDraft, sessionId: string) => DayLog | null;
  updateLog: (id: string, updates: Partial<DayLog>) => void;
  removeLog: (id: string) => void;
  clearLogs: () => void;
  getLogById: (id: string) => DayLog | undefined;
  getLogForSession: (sessionId: string) => DayLog | undefined;
  getLogsInRange: (startMs: number, endMs: number) => DayLog[];
  setHydrated: (value: boolean) => void;

  // UI Actions
  startSession: (sessionId: string) => void;
  markPromptSeen: () => void;
  dismissPrompt: () => void;
  showConfirmPrompt: () => void;
  hideConfirmPrompt: () => void;
  showForm: () => void;
  hideForm: () => void;
  resetUIState: () => void;
}

const DEFAULT_UI_STATE: DayLogUIState = {
  hasSeenPrompt: false,
  promptDismissed: false,
  hasLoggedThisSession: false,
  formVisible: false,
  confirmPromptVisible: false,
  currentSessionId: null,
};

export const useDayLogStore = create<DayLogState>()(
  persist(
    (set, get) => ({
      logs: [],
      hydrated: false,
      ui: DEFAULT_UI_STATE,

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
          ui: {
            ...state.ui,
            hasLoggedThisSession: true,
            formVisible: false,
          },
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

      // UI Actions

      /**
       * Start a new workout session - resets UI state
       */
      startSession: (sessionId) =>
        set({
          ui: {
            ...DEFAULT_UI_STATE,
            currentSessionId: sessionId,
          },
        }),

      /**
       * Mark that the user has seen the initial prompt bubble
       */
      markPromptSeen: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            hasSeenPrompt: true,
          },
        })),

      /**
       * User dismissed the prompt (said "No")
       */
      dismissPrompt: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            promptDismissed: true,
            confirmPromptVisible: false,
          },
        })),

      /**
       * Show the yes/no confirmation prompt
       */
      showConfirmPrompt: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            confirmPromptVisible: true,
            hasSeenPrompt: true,
          },
        })),

      /**
       * Hide the confirmation prompt
       */
      hideConfirmPrompt: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            confirmPromptVisible: false,
          },
        })),

      /**
       * Show the full Day Log form
       */
      showForm: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            formVisible: true,
            confirmPromptVisible: false,
          },
        })),

      /**
       * Hide the form (cancel without saving)
       */
      hideForm: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            formVisible: false,
          },
        })),

      /**
       * Reset UI state (for when workout ends)
       */
      resetUIState: () =>
        set({
          ui: DEFAULT_UI_STATE,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      // Only persist logs, not UI state
      partialize: (state) => ({ logs: state.logs }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        // Ensure UI state is reset on rehydrate
        if (state) {
          state.ui = DEFAULT_UI_STATE;
        }
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
 * Hook to get the Day Log UI state for the prompt flow
 */
export const useDayLogUI = () => {
  return useDayLogStore((state) => state.ui);
};

/**
 * Hook to check if the text bubble should be shown
 * Shows when: session started, not yet seen prompt, not dismissed, not already logged
 */
export const useShouldShowBubble = () => {
  const ui = useDayLogStore((state) => state.ui);
  return (
    ui.currentSessionId !== null &&
    !ui.hasSeenPrompt &&
    !ui.promptDismissed &&
    !ui.hasLoggedThisSession
  );
};

/**
 * Hook to check if user can still access Day Log (icon tappable)
 * Always accessible during a workout session, even after dismissing
 */
export const useCanAccessDayLog = () => {
  const ui = useDayLogStore((state) => state.ui);
  return ui.currentSessionId !== null && !ui.hasLoggedThisSession;
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

// UI Actions (imperative)
export const startDayLogSession = (sessionId: string) => {
  useDayLogStore.getState().startSession(sessionId);
};

export const showDayLogConfirmPrompt = () => {
  useDayLogStore.getState().showConfirmPrompt();
};

export const dismissDayLogPrompt = () => {
  useDayLogStore.getState().dismissPrompt();
};

export const showDayLogForm = () => {
  useDayLogStore.getState().showForm();
};

export const hideDayLogForm = () => {
  useDayLogStore.getState().hideForm();
};

export const resetDayLogUI = () => {
  useDayLogStore.getState().resetUIState();
};
