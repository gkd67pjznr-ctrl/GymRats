import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ForgeDNA, ForgeDNAForDisplay } from "./types";
import type { WorkoutSession } from "../workoutModel";
import { createQueuedJSONStorage } from "../stores/storage/createQueuedAsyncStorage";
import { calculateForgeDNA, processWorkoutHistory } from "./calculator";
import { useWorkoutStore } from "../stores/workoutStore";

/**
 * Forge DNA Store - Zustand store for Forge DNA state management
 */

interface ForgeDNAState {
  // Current user's DNA
  dna: ForgeDNA | null;

  // Display-ready DNA (with premium blur handling)
  displayDNA: ForgeDNAForDisplay | null;

  // Loading states
  isLoading: boolean;
  lastGeneratedAt: number | null;
  error: string | null;

  // Actions
  generateDNA: (userId: string) => Promise<void>;
  getDisplayDNA: (isPremium: boolean) => ForgeDNAForDisplay | null;
  clearDNA: () => void;
}

const initialState = {
  dna: null,
  displayDNA: null,
  isLoading: false,
  lastGeneratedAt: null,
  error: null,
};

export const useForgeDNAStore = create<ForgeDNAState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Generate Forge DNA for the current user
       */
      generateDNA: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          // Get workout history from workout store
          const workoutHistory = useWorkoutStore.getState().sessions;

          // Process workout history into input format
          const input = processWorkoutHistory(workoutHistory);

          // Calculate DNA
          const dna = calculateForgeDNA(input, userId);

          if (dna) {
            set({
              dna,
              displayDNA: { basic: dna }, // For now, just basic data
              isLoading: false,
              lastGeneratedAt: Date.now(),
              error: null,
            });
          } else {
            set({
              dna: null,
              displayDNA: null,
              isLoading: false,
              lastGeneratedAt: null,
              error: "Not enough workout data to generate DNA. Complete at least 5 workouts.",
            });
          }
        } catch (error) {
          console.error("Error generating Forge DNA:", error);
          set({
            isLoading: false,
            error: "Failed to generate Forge DNA. Please try again.",
          });
        }
      },

      /**
       * Get display-ready DNA with premium blur handling
       */
      getDisplayDNA: (isPremium: boolean) => {
        const { dna } = get();

        if (!dna) return null;

        // For free users, we'll blur premium sections in the UI
        // For premium users, return full data
        return {
          basic: dna,
          premium: isPremium ? {
            historicalComparison: [], // Would fetch historical data
            userComparison: {
              averageUser: dna, // Would fetch average user data
              differences: [],
            },
            detailedAnalysis: {
              imbalanceRecommendations: [],
              trainingStyleInsights: [],
              progressionSuggestions: [],
            },
          } : undefined,
        };
      },

      /**
       * Clear DNA data
       */
      clearDNA: () => {
        set({ ...initialState });
      },
    }),
    {
      name: "forge-dna.v1",
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        dna: state.dna,
        lastGeneratedAt: state.lastGeneratedAt,
      }),
    }
  )
);

// Selectors
export const useForgeDNA = () => useForgeDNAStore(state => state.dna);
export const useForgeDNALoading = () => useForgeDNAStore(state => state.isLoading);
export const useForgeDNAError = () => useForgeDNAStore(state => state.error);
export const useDisplayDNA = (isPremium: boolean) =>
  useForgeDNAStore(state => state.getDisplayDNA(isPremium));