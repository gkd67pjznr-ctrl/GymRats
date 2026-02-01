/**
 * Custom hook for managing exercise picker state in live workout
 *
 * Extracted from live-workout.tsx to reduce component complexity
 *
 * State managed:
 * - pickerMode: null | "changeSelected" | "addBlock"
 * - selectedExerciseId: Currently selected exercise
 * - exerciseBlocks: Array of exercise IDs in the workout
 * - Plan mode: Whether following a planned workout
 */

import { useEffect, useState } from "react";
import { EXERCISES_V1 } from "@/src/data/exercises";
import type { WorkoutPlan } from "@/src/lib/workoutPlanModel";

export type PickerMode = null | "changeSelected" | "addBlock";

export interface UseExercisePickerStateResult {
  // State
  pickerMode: PickerMode;
  selectedExerciseId: string;
  exerciseBlocks: string[];
  planMode: boolean;
  plannedExerciseIds: string[];
  currentPlannedExerciseId: string | null;

  // Actions
  setPickerMode: (mode: PickerMode) => void;
  setSelectedExerciseId: (id: string) => void;
  setExerciseBlocks: (blocks: string[] | ((prev: string[]) => string[])) => void;
  openPickerToAdd: () => void;
  openPickerToChange: () => void;
  closePicker: () => void;
  handleExerciseSelect: (id: string) => void;
}

export interface UseExercisePickerStateOptions {
  plan?: WorkoutPlan | null;
  persisted?: {
    selectedExerciseId?: string | null;
    exerciseBlocks?: string[] | null;
  } | null;
}

export function useExercisePickerState({
  plan,
  persisted,
}: UseExercisePickerStateOptions): UseExercisePickerStateResult {
  const planMode = !!plan && plan.exercises.length > 0;
  const plannedExerciseIds = plan?.exercises.map((x) => x.exerciseId) ?? [];
  const currentPlannedExerciseId = planMode
    ? plan!.exercises[plan!.currentExerciseIndex]?.exerciseId ?? null
    : null;

  // Initialize selected exercise from persisted state, plan, or default
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(() => {
    if (persisted?.selectedExerciseId) {
      return persisted.selectedExerciseId;
    }
    if (currentPlannedExerciseId) {
      return currentPlannedExerciseId;
    }
    return EXERCISES_V1[0]?.id ?? "bench";
  });

  // Initialize exercise blocks from persisted state, plan, or empty
  const [exerciseBlocks, setExerciseBlocks] = useState<string[]>(() => {
    if (persisted?.exerciseBlocks && persisted.exerciseBlocks.length > 0) {
      return persisted.exerciseBlocks;
    }
    if (planMode) {
      return plannedExerciseIds;
    }
    return [];
  });

  // Picker mode state
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  // Sync selected exercise with plan changes
  useEffect(() => {
    if (planMode && currentPlannedExerciseId) {
      setSelectedExerciseId(currentPlannedExerciseId);
    }
  }, [planMode, currentPlannedExerciseId]);

  // Sync exercise blocks with plan changes
  useEffect(() => {
    if (!planMode) return;
    setExerciseBlocks((prev) => (prev.length ? prev : plannedExerciseIds.slice()));
  }, [planMode, plannedExerciseIds]);

  // Open picker to add an exercise to the block (free workout mode only)
  const openPickerToAdd = () => {
    if (planMode) {
      if (__DEV__) console.log("Cannot add exercises during a planned workout");
      return;
    }
    setPickerMode("addBlock");
  };

  // Open picker to change the currently selected exercise
  const openPickerToChange = () => {
    setPickerMode("changeSelected");
  };

  const closePicker = () => {
    setPickerMode(null);
  };

  // Handle exercise selection from picker
  const handleExerciseSelect = (id: string) => {
    if (pickerMode === "changeSelected") {
      setSelectedExerciseId(id);
    } else if (pickerMode === "addBlock") {
      setExerciseBlocks((prev) =>
        prev.includes(id) ? prev : [...prev, id]
      );
      setSelectedExerciseId(id);
    }
    setPickerMode(null);
  };

  return {
    // State
    pickerMode,
    selectedExerciseId,
    exerciseBlocks,
    planMode,
    plannedExerciseIds,
    currentPlannedExerciseId,

    // Actions
    setPickerMode,
    setSelectedExerciseId,
    setExerciseBlocks,
    openPickerToAdd,
    openPickerToChange,
    closePicker,
    handleExerciseSelect,
  };
}
