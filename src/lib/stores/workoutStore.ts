// src/lib/stores/workoutStore.ts
// Zustand store for workout sessions with AsyncStorage persistence
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WorkoutSession } from "../workoutModel";

const STORAGE_KEY = "workoutSessions.v2"; // New key for Zustand version

interface WorkoutState {
  sessions: WorkoutSession[];
  hydrated: boolean;

  // Actions
  addSession: (session: WorkoutSession) => void;
  clearSessions: () => void;
  getSessionById: (id: string) => WorkoutSession | undefined;
  setHydrated: (value: boolean) => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      sessions: [],
      hydrated: false,

      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        })),

      clearSessions: () => set({ sessions: [] }),

      getSessionById: (id) => get().sessions.find((s) => s.id === id),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ sessions: state.sessions }), // Only persist sessions
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Convenience selectors
export const selectWorkoutSessions = (state: WorkoutState) => state.sessions;
export const selectIsHydrated = (state: WorkoutState) => state.hydrated;

// Hook for accessing sessions (matches old API)
export function useWorkoutSessions(): WorkoutSession[] {
  return useWorkoutStore(selectWorkoutSessions);
}

// Imperative getters for non-React code
export function getWorkoutSessions(): WorkoutSession[] {
  return useWorkoutStore.getState().sessions;
}

export function getWorkoutSessionById(id: string): WorkoutSession | undefined {
  return useWorkoutStore.getState().getSessionById(id);
}

// Imperative actions for non-React code
export function addWorkoutSession(session: WorkoutSession): void {
  useWorkoutStore.getState().addSession(session);
}

export function clearWorkoutSessions(): void {
  useWorkoutStore.getState().clearSessions();
}
