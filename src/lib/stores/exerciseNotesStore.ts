// src/lib/stores/exerciseNotesStore.ts
// Zustand store for per-exercise notes with AsyncStorage persistence
// Notes persist across workouts and are tied to exerciseId, not workout session

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";

const STORAGE_KEY = "exerciseNotes.v1";
const MAX_NOTE_LENGTH = 200;
const DEBOUNCE_MS = 500;

// Store schema: { [exerciseId: string]: string }
export type ExerciseNotes = Record<string, string>;

interface ExerciseNotesState {
  notes: ExerciseNotes;
  hydrated: boolean;

  // Actions
  setNote: (exerciseId: string, note: string) => void;
  getNote: (exerciseId: string) => string;
  deleteNote: (exerciseId: string) => void;
  clearAllNotes: () => void;
  setHydrated: (value: boolean) => void;
}

// Debounce tracking for saves (per exerciseId)
const pendingDebounces = new Map<string, ReturnType<typeof setTimeout>>();

export const useExerciseNotesStore = create<ExerciseNotesState>()(
  persist(
    (set, get) => ({
      notes: {},
      hydrated: false,

      setNote: (exerciseId, note) => {
        // Enforce character limit
        const trimmedNote = note.slice(0, MAX_NOTE_LENGTH);

        // Clear any pending debounce for this exerciseId
        const existingTimeout = pendingDebounces.get(exerciseId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Debounce the actual state update to avoid excessive writes
        const timeoutId = setTimeout(() => {
          set((state) => {
            // Clean up empty notes - don't store them
            if (!trimmedNote.trim()) {
              const { [exerciseId]: _, ...rest } = state.notes;
              return { notes: rest };
            }

            return {
              notes: {
                ...state.notes,
                [exerciseId]: trimmedNote.trim(),
              },
            };
          });
          pendingDebounces.delete(exerciseId);
        }, DEBOUNCE_MS);

        pendingDebounces.set(exerciseId, timeoutId);

        // Also update immediately for UI responsiveness (non-persisted)
        // This will be overwritten by the debounced update
        set((state) => {
          if (!trimmedNote.trim()) {
            const { [exerciseId]: _, ...rest } = state.notes;
            return { notes: rest };
          }
          return {
            notes: {
              ...state.notes,
              [exerciseId]: trimmedNote,
            },
          };
        });
      },

      getNote: (exerciseId) => {
        return get().notes[exerciseId] ?? "";
      },

      deleteNote: (exerciseId) => {
        set((state) => {
          const { [exerciseId]: _, ...rest } = state.notes;
          return { notes: rest };
        });
      },

      clearAllNotes: () => {
        set({ notes: {} });
      },

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({ notes: state.notes }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// ============================================================================
// Convenience Hooks & Selectors
// ============================================================================

/**
 * Hook to get note for a specific exercise
 * Use this in components to subscribe to a single exercise's note
 */
export function useExerciseNote(exerciseId: string): string {
  return useExerciseNotesStore((state) => state.notes[exerciseId] ?? "");
}

/**
 * Hook to check if an exercise has a note
 */
export function useHasExerciseNote(exerciseId: string): boolean {
  return useExerciseNotesStore((state) => !!state.notes[exerciseId]);
}

/**
 * Hook to get all notes (for debugging/export)
 */
export function useAllExerciseNotes(): ExerciseNotes {
  return useExerciseNotesStore((state) => state.notes);
}

/**
 * Check if the store has been hydrated from AsyncStorage
 */
export function useExerciseNotesHydrated(): boolean {
  return useExerciseNotesStore((state) => state.hydrated);
}

// ============================================================================
// Imperative API (for non-React code)
// ============================================================================

/**
 * Get note for an exercise (imperative, for non-React code)
 */
export function getExerciseNote(exerciseId: string): string {
  return useExerciseNotesStore.getState().getNote(exerciseId);
}

/**
 * Set note for an exercise (imperative, for non-React code)
 * Empty notes will be cleaned up automatically
 */
export function setExerciseNote(exerciseId: string, note: string): void {
  useExerciseNotesStore.getState().setNote(exerciseId, note);
}

/**
 * Delete note for an exercise (imperative, for non-React code)
 */
export function deleteExerciseNote(exerciseId: string): void {
  useExerciseNotesStore.getState().deleteNote(exerciseId);
}

/**
 * Check if an exercise has a note (imperative, for non-React code)
 */
export function hasExerciseNote(exerciseId: string): boolean {
  return !!useExerciseNotesStore.getState().notes[exerciseId];
}

/**
 * Get all notes (for export/sync)
 */
export function getAllExerciseNotes(): ExerciseNotes {
  return useExerciseNotesStore.getState().notes;
}

/**
 * Clear all notes (use with caution)
 */
export function clearAllExerciseNotes(): void {
  useExerciseNotesStore.getState().clearAllNotes();
}

// ============================================================================
// Constants Export
// ============================================================================

export { MAX_NOTE_LENGTH, DEBOUNCE_MS };
