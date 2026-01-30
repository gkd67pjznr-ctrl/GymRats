// src/lib/stores/liveWorkoutStore.ts
// Zustand store for live workout session UI state and logic
import { create } from "zustand";
import type { LoggedSet, SetType } from "../loggerTypes";
import { lbToKg, kgToLb } from "../units";
import { validateWeight, validateReps } from "../validators/workout";
import { uid } from "../uid";
import { estimate1RM_Epley } from "../e1rm";

type Defaults = { weightLb: number; reps: number };

export type LiveWorkoutState = {
  // Session data
  sets: LoggedSet[];
  doneBySetId: Record<string, boolean>;

  // Quick add controls (current inputs)
  weightLb: number;
  reps: number;
  weightLbText: string;
  repsText: string;
  weightStep: number;

  // Per-exercise defaults (last-used)
  defaultsByExerciseId: Record<string, Defaults>;

  // Actions
  setSets: (sets: LoggedSet[] | ((prev: LoggedSet[]) => LoggedSet[])) => void;
  setDoneBySetId: (doneBySetId: Record<string, boolean>) => void;
  setWeightLb: (weightLb: number) => void;
  setReps: (reps: number) => void;
  setWeightLbText: (text: string) => void;
  setRepsText: (text: string) => void;
  setWeightStep: (step: number) => void;
  setDefaultsByExerciseId: (defaultsByExerciseId: Record<string, Defaults>) => void;

  // Validation and utility functions
  kgToLb: (kg: number) => number;
  estimateE1RMLb: (weightLb: number, reps: number) => number;

  // Set management
  isDone: (setId: string) => boolean;
  toggleDone: (setId: string) => void;
  updateSet: (setId: string, patch: Partial<LoggedSet>) => void;

  // Input handlers
  onWeightText: (text: string) => void;
  onRepsText: (text: string) => void;
  onWeightCommit: () => void;
  onRepsCommit: () => void;
  onWeightStepChange: (step: number) => void;

  // Increment/decrement handlers
  decWeight: () => void;
  incWeight: () => void;
  decReps: () => void;
  incReps: () => void;

  // Set editing
  setWeightForSet: (setId: string, text: string) => void;
  setRepsForSet: (setId: string, text: string) => void;

  // Exercise history helpers
  getLastSetForExercise: (exerciseId: string) => LoggedSet | null;
  copyFromLastSet: (exerciseId: string, targetSetId: string) => void;

  // Per-exercise defaults management
  getDefaultsForExercise: (exerciseId: string) => Defaults;
  setDefaultsForExercise: (exerciseId: string, defaults: Defaults) => void;
  syncQuickAddToExercise: (exerciseId: string) => void;

  // Main actions
  addSet: (exerciseId: string, setType?: SetType) => { weightLb: number; reps: number; set: LoggedSet };
  resetSession: () => void;
};

export const useLiveWorkoutStore = create<LiveWorkoutState>()((set, get) => ({
  // Initial state
  sets: [],
  doneBySetId: {},
  weightLb: 135,
  reps: 8,
  weightLbText: "135",
  repsText: "8",
  weightStep: 2.5,
  defaultsByExerciseId: {},

  // Simple setters
  setSets: (sets) => {
    set({ sets: typeof sets === 'function' ? sets(get().sets) : sets });
  },
  setDoneBySetId: (doneBySetId) => set({ doneBySetId }),
  setWeightLb: (weightLb) => set({ weightLb }),
  setReps: (reps) => set({ reps }),
  setWeightLbText: (text) => set({ weightLbText: text }),
  setRepsText: (text) => set({ repsText: text }),
  setWeightStep: (step) => set({ weightStep: step }),
  setDefaultsByExerciseId: (defaultsByExerciseId) => set({ defaultsByExerciseId }),

  // Utility functions
  kgToLb: (kg: number) => kgToLb(kg),
  estimateE1RMLb: (weightLb: number, reps: number) => {
    if (!weightLb || reps <= 0) return 0;
    const e1rmKg = estimate1RM_Epley(lbToKg(weightLb), reps);
    return kgToLb(e1rmKg);
  },

  // Set management
  isDone: (setId: string) => !!get().doneBySetId[setId],
  toggleDone: (setId: string) => {
    const doneBySetId = { ...get().doneBySetId, [setId]: !get().doneBySetId[setId] };
    set({ doneBySetId });
  },
  updateSet: (setId: string, patch: Partial<LoggedSet>) => {
    const sets = get().sets.map((s) => (s.id === setId ? { ...s, ...patch } : s));
    set({ sets });
  },

  // Input handlers
  onWeightText: (text: string) => {
    set({ weightLbText: text });
    const result = validateWeight(text);
    if (result.valid && result.value !== undefined) {
      set({ weightLb: result.value });
    }
  },

  onRepsText: (text: string) => {
    set({ repsText: text });
    const result = validateReps(text);
    if (result.valid && result.value !== undefined) {
      set({ reps: result.value });
    }
  },

  onWeightCommit: () => {
    const { weightLbText, weightLb } = get();
    const result = validateWeight(weightLbText);
    if (!result.valid) {
      set({ weightLbText: weightLb.toFixed(1) });
      return;
    }
    if (result.value !== undefined) {
      set({ weightLb: result.value, weightLbText: result.value.toFixed(1) });
    }
  },

  onRepsCommit: () => {
    const { repsText, reps } = get();
    const result = validateReps(repsText);
    if (!result.valid) {
      set({ repsText: String(reps) });
      return;
    }
    if (result.value !== undefined) {
      set({ reps: result.value, repsText: String(result.value) });
    }
  },

  onWeightStepChange: (step: number) => {
    set({ weightStep: step });
  },

  // Increment/decrement handlers
  decWeight: () => {
    const { weightLb, weightStep } = get();
    const next = Math.max(0, weightLb - weightStep);
    set({ weightLb: next, weightLbText: next.toFixed(1) });
  },

  incWeight: () => {
    const { weightLb, weightStep } = get();
    const next = Math.min(2000, weightLb + weightStep);
    set({ weightLb: next, weightLbText: next.toFixed(1) });
  },

  decReps: () => {
    const { reps } = get();
    const next = Math.max(1, reps - 1);
    set({ reps: next, repsText: String(next) });
  },

  incReps: () => {
    const { reps } = get();
    const next = Math.min(100, reps + 1);
    set({ reps: next, repsText: String(next) });
  },

  // Set editing with validation
  setWeightForSet: (setId: string, text: string) => {
    const result = validateWeight(text);
    if (!result.valid) {
      return;
    }
    if (result.value !== undefined) {
      const { updateSet } = get();
      updateSet(setId, { weightKg: lbToKg(result.value) });
    }
  },

  setRepsForSet: (setId: string, text: string) => {
    const result = validateReps(text);
    if (!result.valid) {
      return;
    }
    if (result.value !== undefined) {
      const { updateSet } = get();
      updateSet(setId, { reps: result.value });
    }
  },

  // Exercise history helpers
  getLastSetForExercise: (exerciseId: string): LoggedSet | null => {
    const exerciseSets = get().sets.filter((s) => s.exerciseId === exerciseId);
    if (exerciseSets.length === 0) return null;
    return exerciseSets[exerciseSets.length - 1];
  },

  copyFromLastSet: (exerciseId: string, targetSetId: string) => {
    const lastSet = get().getLastSetForExercise(exerciseId);
    if (!lastSet) {
      return;
    }
    const { updateSet } = get();
    updateSet(targetSetId, {
      weightKg: lastSet.weightKg,
      reps: lastSet.reps,
    });
  },

  // Per-exercise defaults management
  getDefaultsForExercise: (exerciseId: string): Defaults => {
    return get().defaultsByExerciseId[exerciseId] ?? { weightLb: get().weightLb, reps: get().reps };
  },

  setDefaultsForExercise: (exerciseId: string, defaults: Defaults) => {
    const defaultsByExerciseId = { ...get().defaultsByExerciseId, [exerciseId]: defaults };
    set({ defaultsByExerciseId });
  },

  syncQuickAddToExercise: (exerciseId: string) => {
    const d = get().defaultsByExerciseId[exerciseId];
    if (!d) return;
    set({
      weightLb: d.weightLb,
      reps: d.reps,
      weightLbText: d.weightLb.toFixed(1),
      repsText: String(d.reps),
    });
  },

  // Main actions
  addSet: (exerciseId: string, setType: SetType = "working") => {
    const { weightLb, reps } = get();
    const newSet: LoggedSet = {
      id: uid(),
      exerciseId,
      setType,
      weightKg: lbToKg(weightLb),
      reps,
      timestampMs: Date.now(),
    };

    // Add to sets
    const sets = [...get().sets, newSet];
    set({ sets });

    // Save as defaults for this exercise
    const defaultsByExerciseId = {
      ...get().defaultsByExerciseId,
      [exerciseId]: { weightLb, reps },
    };
    set({ defaultsByExerciseId });

    return { weightLb, reps, set: newSet };
  },

  resetSession: () => {
    set({
      sets: [],
      doneBySetId: {},
      defaultsByExerciseId: {},
      weightLb: 135,
      reps: 8,
      weightLbText: "135",
      repsText: "8",
      weightStep: 2.5,
    });
  },
}));

// Selectors for React components
export const useLiveWorkoutSets = () => useLiveWorkoutStore((state) => state.sets);
export const useLiveWorkoutWeightLb = () => useLiveWorkoutStore((state) => state.weightLb);
export const useLiveWorkoutReps = () => useLiveWorkoutStore((state) => state.reps);
export const useLiveWorkoutWeightLbText = () => useLiveWorkoutStore((state) => state.weightLbText);
export const useLiveWorkoutRepsText = () => useLiveWorkoutStore((state) => state.repsText);
export const useLiveWorkoutWeightStep = () => useLiveWorkoutStore((state) => state.weightStep);
export const useLiveWorkoutDefaultsByExerciseId = () => useLiveWorkoutStore((state) => state.defaultsByExerciseId);
export const useLiveWorkoutDoneBySetId = () => useLiveWorkoutStore((state) => state.doneBySetId);

// Selector for full state (for migration/debugging)
export const useLiveWorkoutFullState = () => useLiveWorkoutStore((state) => state);

// Imperative getters for non-React code
export function getLiveWorkoutSets(): LoggedSet[] {
  return useLiveWorkoutStore.getState().sets;
}

export function getLiveWorkoutWeightLb(): number {
  return useLiveWorkoutStore.getState().weightLb;
}

export function getLiveWorkoutReps(): number {
  return useLiveWorkoutStore.getState().reps;
}

// Convenience: derived stats
export function getLiveWorkoutSummary(): {
  setCount: number;
  totalVolumeLb: number;
} {
  const state = useLiveWorkoutStore.getState();
  const totalVolumeLb = state.sets.reduce((sum, set) => sum + state.kgToLb(set.weightKg) * set.reps, 0);
  return {
    setCount: state.sets.length,
    totalVolumeLb,
  };
}
