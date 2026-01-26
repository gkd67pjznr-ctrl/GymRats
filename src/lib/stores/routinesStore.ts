// src/lib/stores/routinesStore.ts
// Zustand store for user routines with AsyncStorage persistence
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import type { Routine } from "../routinesModel";

const STORAGE_KEY = "routines.v2"; // New key for Zustand version

interface RoutinesState {
  routines: Routine[];
  hydrated: boolean;

  // Actions
  upsertRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  clearRoutines: () => void;
  setHydrated: (value: boolean) => void;
}

export const useRoutinesStore = create<RoutinesState>()(
  persist(
    (set, get) => ({
      routines: [],
      hydrated: false,

      upsertRoutine: (routine) =>
        set((state) => {
          const idx = state.routines.findIndex((r) => r.id === routine.id);
          if (idx >= 0) {
            const updated = [...state.routines];
            updated[idx] = routine;
            return { routines: updated };
          }
          return { routines: [routine, ...state.routines] };
        }),

      deleteRoutine: (id) =>
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
        })),

      clearRoutines: () => set({ routines: [] }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({ routines: state.routines }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Convenience selectors
export const selectRoutines = (state: RoutinesState) =>
  state.routines.slice().sort((a, b) => b.updatedAtMs - a.updatedAtMs);

export const selectRoutineById = (id: string) => (state: RoutinesState) =>
  state.routines.find((r) => r.id === id);

// Hook for accessing routines (matches old API)
export function useRoutines(): Routine[] {
  return useRoutinesStore(selectRoutines);
}

export function useRoutine(id: string): Routine | undefined {
  return useRoutinesStore(selectRoutineById(id));
}

// Imperative getters for non-React code
export function getRoutines(): Routine[] {
  return useRoutinesStore.getState().routines.slice().sort((a, b) => b.updatedAtMs - a.updatedAtMs);
}

export function getRoutineById(id: string): Routine | undefined {
  return useRoutinesStore.getState().routines.find((r) => r.id === id);
}

// Imperative actions for non-React code
export function upsertRoutine(routine: Routine): void {
  useRoutinesStore.getState().upsertRoutine(routine);
}

export function deleteRoutine(id: string): void {
  useRoutinesStore.getState().deleteRoutine(id);
}

export function clearRoutines(): void {
  useRoutinesStore.getState().clearRoutines();
}
