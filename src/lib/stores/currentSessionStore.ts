// src/lib/stores/currentSessionStore.ts
// Zustand store for current active workout session with AsyncStorage persistence
import { AppState, AppStateStatus } from 'react-native';
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LoggedSet } from "../loggerTypes";
import type { ExerciseSessionState } from "../perSetCueTypes";
import { uid } from "../uid";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import { getGlobalPersistQueue } from "../utils/PersistQueue";
import { useHangoutStore } from "../hangout/hangoutStore";
import { updatePresenceStatus, realtimePresence } from "../hangout/realtimePresence";

const STORAGE_KEY = "currentSession.v2"; // New key for Zustand version

export type CurrentSession = {
  id: string;
  startedAtMs: number;

  // UX state
  selectedExerciseId: string | null;
  exerciseBlocks: string[];

  // Data
  sets: LoggedSet[];
  doneBySetId: Record<string, boolean>;

  // PR detection state per exercise
  exerciseStates: Record<string, ExerciseSessionState>;

  // PR tracking during this session
  prCount: number;
  weightPRs: number;
  repPRs: number;
  e1rmPRs: number;

  // Optional: link to plan/routine
  planId?: string;
  routineId?: string;
  routineName?: string;
};

interface CurrentSessionState {
  session: CurrentSession | null;
  hydrated: boolean;

  // Actions
  ensureSession: (seed?: Partial<Pick<CurrentSession, "selectedExerciseId" | "exerciseBlocks" | "sets">>) => CurrentSession;
  updateSession: (updater: (s: CurrentSession) => CurrentSession) => void;
  setSession: (session: CurrentSession | null) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
}

// ============================================================================
// AppState Change Handler
// ============================================================================

/**
 * Setup AppState change listener to flush pending writes on app background/termination.
 * This ensures all AsyncStorage operations complete before the app is killed.
 *
 * @returns Cleanup function to remove the AppState listener
 */
let appStateSubscription: { remove: () => void } | null = null;

function setupAppStateListener(): () => void {
  if (appStateSubscription) {
    // Already setup - return cleanup function that will remove the existing subscription
    return () => {
      appStateSubscription?.remove();
      appStateSubscription = null;
    };
  }

  const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App is backgrounding or becoming inactive (iOS)
      // Flush any pending AsyncStorage writes
      const queue = getGlobalPersistQueue();
      queue.flush().catch((err) => {
        // Log but don't throw - app is backgrounding anyway
        if (__DEV__) console.error('[currentSessionStore] Failed to flush on app state change:', err);
      });
    }
  });

  appStateSubscription = subscription;

  // Return cleanup function
  return () => {
    subscription.remove();
    appStateSubscription = null;
  };
}

// ============================================================================
// Flush Pending Writes
// ============================================================================

/**
 * Flush all pending AsyncStorage writes.
 * Useful for ensuring data is persisted before app termination.
 *
 * @returns Promise that resolves when all queued writes complete
 */
export async function flushPendingWrites(): Promise<void> {
  const queue = getGlobalPersistQueue();
  await queue.flush();
}

// ============================================================================
// Store Creation
// ============================================================================

export const useCurrentSessionStore = create<CurrentSessionState>()(
  persist(
    (set, get) => ({
      session: null,
      hydrated: false,

      ensureSession: (seed) => {
        const existing = get().session;
        if (existing) return existing;

        const now = Date.now();
        const newSession: CurrentSession = {
          id: uid(),
          startedAtMs: now,
          selectedExerciseId: seed?.selectedExerciseId ?? null,
          exerciseBlocks: seed?.exerciseBlocks ?? [],
          sets: seed?.sets ?? [],
          doneBySetId: {},
          exerciseStates: {},
          prCount: 0,
          weightPRs: 0,
          repPRs: 0,
          e1rmPRs: 0,
        };

        set({ session: newSession });

        // Update hangout presence to "working_out" when workout starts
        // Use both the new real-time presence API and the database store
        updatePresenceStatus('working_out', 'Workout in progress')
          .catch(err => {
            if (__DEV__) console.error('[currentSessionStore] Failed to update realtime presence:', err);
          });

        // Also update database presence (for persistence)
        const currentRoom = useHangoutStore.getState().currentRoom;
        if (currentRoom) {
          useHangoutStore.getState().updatePresence('working_out', 'Workout in progress')
            .catch(err => {
              if (__DEV__) console.error('[currentSessionStore] Failed to update db presence:', err);
            });
        }

        return newSession;
      },

      updateSession: (updater) => {
        const base = get().ensureSession();
        set({ session: updater(base) });
      },

      setSession: (session) => set({ session }),

      clearSession: () => {
        set({ session: null });

        // Update hangout presence back to "online" when workout ends
        // Use both the new real-time presence API and the database store
        updatePresenceStatus('online', 'Available')
          .catch(err => {
            if (__DEV__) console.error('[currentSessionStore] Failed to update realtime presence:', err);
          });

        // Also update database presence (for persistence)
        const currentRoom = useHangoutStore.getState().currentRoom;
        if (currentRoom) {
          useHangoutStore.getState().updatePresence('online', 'Available')
            .catch(err => {
              if (__DEV__) console.error('[currentSessionStore] Failed to update db presence:', err);
            });
        }
      },

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: (initialState) => (state, error) => {
        if (error) {
          if (__DEV__) console.error('[currentSessionStore] Hydration failed:', error);
        } else {
          // Check if session is stale (older than 24 hours)
          const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
          const session = state?.session;

          if (session && session.startedAtMs) {
            const sessionAge = Date.now() - session.startedAtMs;
            if (sessionAge > SESSION_EXPIRY_MS) {
              if (__DEV__) {
                console.log('[currentSessionStore] Clearing stale session (older than 24 hours)');
              }
              state?.clearSession();
            }
          }

          // Mark as hydrated after loading from storage
          state?.setHydrated(true);
        }
      },
    }
  )
);

// ============================================================================
// Convenience Selectors
// ============================================================================

export const selectCurrentSession = (state: CurrentSessionState) => state.session;
export const selectIsHydrated = (state: CurrentSessionState) => state.hydrated;

// ============================================================================
// AppState Listener Setup
// ============================================================================

/**
 * Initialize AppState change listener for session persistence.
 * Call this once at app startup to ensure writes are flushed on background.
 *
 * @returns Cleanup function to remove the listener
 *
 * @example
 * ```tsx
 * // In your app root or main layout
 * useEffect(() => {
 *   const cleanup = setupAppStatePersistenceListener();
 *   return cleanup;
 * }, []);
 * ```
 */
export function setupAppStatePersistenceListener(): () => void {
  return setupAppStateListener();
}

// Hook for checking if the store has been hydrated
// Use this to gate UI components that depend on persisted state
export function useIsHydrated(): boolean {
  return useCurrentSessionStore(selectIsHydrated);
}

// Imperative getter for hydration state (for non-React code)
export function getIsHydrated(): boolean {
  return useCurrentSessionStore.getState().hydrated;
}

// Hook for accessing current session (matches old API)
export function useCurrentSession(): CurrentSession | null {
  return useCurrentSessionStore(selectCurrentSession);
}

// Imperative getters for non-React code
export function getCurrentSession(): CurrentSession | null {
  return useCurrentSessionStore.getState().session;
}

export function hasCurrentSession(): boolean {
  return useCurrentSessionStore.getState().session !== null;
}

// Imperative actions for non-React code
export function ensureCurrentSession(
  seed?: Partial<Pick<CurrentSession, "selectedExerciseId" | "exerciseBlocks" | "sets">>
): CurrentSession {
  return useCurrentSessionStore.getState().ensureSession(seed);
}

export function updateCurrentSession(updater: (s: CurrentSession) => CurrentSession): void {
  useCurrentSessionStore.getState().updateSession(updater);
}

export function setCurrentSession(session: CurrentSession | null): void {
  useCurrentSessionStore.getState().setSession(session);
}

export function clearCurrentSession(): void {
  useCurrentSessionStore.getState().clearSession();
}

// Convenience: derived stats for badges/labels
export function getCurrentSessionSummary(): {
  hasSession: boolean;
  setCount: number;
  startedAtMs: number | null;
} {
  const session = useCurrentSessionStore.getState().session;
  return {
    hasSession: !!session,
    setCount: session?.sets?.length ?? 0,
    startedAtMs: session?.startedAtMs ?? null,
  };
}
