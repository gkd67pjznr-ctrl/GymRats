// src/lib/workoutPlanStore.ts
// RE-EXPORT: This file now re-exports from the new Zustand store location
// All functionality has been migrated to src/lib/stores/workoutPlanStore.ts

export {
  // Store
  useWorkoutPlanStore,

  // Selectors
  selectPlan,
  selectIsHydrated,

  // Hooks
  useCurrentPlan,
  useIsHydrated,

  // Imperative getters
  getCurrentPlan,
  getIsHydrated,

  // Imperative actions
  setCurrentPlan,
  updateCurrentPlan,
  clearCurrentPlan,

  // Legacy compatibility functions
  hydrateWorkoutPlanStore,
  subscribeCurrentPlan,
} from "./stores/workoutPlanStore";
