// src/lib/stores/personalityStore.ts
// Zustand store for personality selection and cue generation

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import {
  getAllPersonalities,
  getPersonalityById,
  getCueForPersonality,
  prTypeToContext,
  DEFAULT_PERSONALITY_ID,
  type Personality,
  type CueContext,
  type CueIntensity,
} from "../celebration/personalities";
import type { PRType } from "../perSetCueTypes";

const STORAGE_KEY = "forgerank.personality.v1";

interface PersonalityState {
  /** Selected personality ID */
  selectedPersonalityId: string;
  /** Hydration state */
  hydrated: boolean;

  // Actions
  setPersonality: (id: string) => void;
  setHydrated: (value: boolean) => void;

  // Getters
  getPersonality: () => Personality;
  getCue: (context: CueContext, tier?: number) => { message: string; intensity: CueIntensity } | null;
  getCueForPR: (prType: PRType, tier?: number) => { message: string; intensity: CueIntensity } | null;
}

export const usePersonalityStore = create<PersonalityState>()(
  persist(
    (set, get) => ({
      selectedPersonalityId: DEFAULT_PERSONALITY_ID,
      hydrated: false,

      setPersonality: (id) => set({ selectedPersonalityId: id }),

      setHydrated: (value) => set({ hydrated: value }),

      getPersonality: () => {
        const state = get();
        return (
          getPersonalityById(state.selectedPersonalityId) ||
          getAllPersonalities()[0]
        );
      },

      getCue: (context, tier = 1) => {
        const personality = get().getPersonality();
        const cue = getCueForPersonality(personality, context, tier);
        if (!cue) return null;
        return {
          message: cue.message,
          intensity: cue.intensity,
        };
      },

      getCueForPR: (prType, tier = 1) => {
        const context = prTypeToContext(prType);
        return get().getCue(context, tier);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        selectedPersonalityId: state.selectedPersonalityId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to get the current personality
 */
export function usePersonality(): Personality {
  return usePersonalityStore((state) => state.getPersonality());
}

/**
 * Hook to get all available personalities
 */
export function useAllPersonalities(): Personality[] {
  return getAllPersonalities();
}

/**
 * Hook to get cue for a specific context
 */
export function usePersonalityCue(context: CueContext, tier?: number) {
  const getCue = usePersonalityStore((state) => state.getCue);
  return getCue(context, tier);
}

// ============================================================================
// Imperative functions for non-React code
// ============================================================================

/**
 * Get the current personality (imperative)
 */
export function getSelectedPersonality(): Personality {
  return usePersonalityStore.getState().getPersonality();
}

/**
 * Get a cue for a specific context (imperative)
 */
export function getPersonalityCue(
  context: CueContext,
  tier?: number
): { message: string; intensity: CueIntensity } | null {
  return usePersonalityStore.getState().getCue(context, tier);
}

/**
 * Get a cue for a PR type (imperative)
 */
export function getPRCue(prType: PRType, tier?: number): {
  message: string;
  intensity: CueIntensity;
} | null {
  return usePersonalityStore.getState().getCueForPR(prType, tier);
}

/**
 * Set personality (imperative)
 */
export function setPersonality(id: string): void {
  usePersonalityStore.getState().setPersonality(id);
}

/**
 * Get all personalities (imperative)
 */
export function getAllPersonalitiesList(): Personality[] {
  return getAllPersonalities();
}
