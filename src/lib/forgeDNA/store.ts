import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ForgeDNA, ForgeDNAForDisplay, ForgeDNAHistoryEntry } from "./types";
import type { WorkoutSession } from "../workoutModel";
import { createQueuedJSONStorage } from "../stores/storage/createQueuedAsyncStorage";
import { calculateForgeDNA, processWorkoutHistory } from "./calculator";
import { useWorkoutStore } from "../stores/workoutStore";
import { saveDNASnapshot, getDNAHistory } from "./repository";
import { calculateAverageUserDNA, generateComparisonInsights } from "./averageCalculator";
import { shareDNAToFeed } from "./sharingService";
import { analyzeMuscleImbalances, analyzeTrainingStyle, generateProgressionSuggestions } from "./imbalanceAnalyzer";
import { ForgeDNASyncRepository } from "./syncRepository";

/**
 * Forge DNA Store - Zustand store for Forge DNA state management
 */

interface ForgeDNAState {
  // Current user's DNA
  dna: ForgeDNA | null;

  // Display-ready DNA (with premium blur handling)
  displayDNA: ForgeDNAForDisplay | null;

  // Historical DNA data
  history: ForgeDNAHistoryEntry[] | null;
  isHistoryLoading: boolean;
  historyError: string | null;

  // Comparison data
  averageUserDNA: ForgeDNA | null;
  isComparisonLoading: boolean;
  comparisonError: string | null;

  // Sharing state
  isSharing: boolean;
  shareError: string | null;

  // Sync state
  isSyncing: boolean;
  syncError: string | null;
  lastSynced: number | null;

  // Loading states
  isLoading: boolean;
  lastGeneratedAt: number | null;
  error: string | null;

  // Actions
  generateDNA: (userId: string) => Promise<void>;
  loadDNAHistory: (userId: string) => Promise<void>;
  loadUserComparison: (userId: string) => Promise<void>;
  shareDNA: (userId: string, caption?: string, privacy?: 'public' | 'friends') => Promise<{ success: boolean; error?: string; postId?: string }>;
  syncWithServer: (userId: string) => Promise<void>;
  getDisplayDNA: (isPremium: boolean) => ForgeDNAForDisplay | null;
  clearDNA: () => void;
}

const initialState = {
  dna: null,
  displayDNA: null,
  history: null,
  isHistoryLoading: false,
  historyError: null,
  averageUserDNA: null,
  isComparisonLoading: false,
  comparisonError: null,
  isSharing: false,
  shareError: null,
  isSyncing: false,
  syncError: null,
  lastSynced: null,
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
            // Save to history
            await saveDNASnapshot(userId, dna);

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
       * Load historical DNA data for the current user
       */
      loadDNAHistory: async (userId: string) => {
        set({ isHistoryLoading: true, historyError: null });

        try {
          const { data, error } = await getDNAHistory(userId, 10);

          if (error) {
            set({
              isHistoryLoading: false,
              historyError: error
            });
            return;
          }

          set({
            history: data,
            isHistoryLoading: false,
            historyError: null
          });
        } catch (error) {
          console.error("Error loading DNA history:", error);
          set({
            isHistoryLoading: false,
            historyError: "Failed to load DNA history. Please try again."
          });
        }
      },

      /**
       * Load user comparison data (average user DNA)
       */
      loadUserComparison: async (userId: string) => {
        set({ isComparisonLoading: true, comparisonError: null });

        try {
          const { data, error } = await calculateAverageUserDNA(userId);

          if (error) {
            set({
              isComparisonLoading: false,
              comparisonError: error
            });
            return;
          }

          set({
            averageUserDNA: data,
            isComparisonLoading: false,
            comparisonError: null
          });
        } catch (error) {
          console.error("Error loading user comparison data:", error);
          set({
            isComparisonLoading: false,
            comparisonError: "Failed to load comparison data. Please try again."
          });
        }
      },

      /**
       * Share DNA to social feed
       */
      shareDNA: async (userId: string, caption?: string, privacy?: 'public' | 'friends') => {
        const { dna } = get();

        if (!dna) {
          return { success: false, error: "No DNA data available to share" };
        }

        set({ isSharing: true, shareError: null });

        try {
          const result = await shareDNAToFeed({ userId, dna, caption, privacy });

          if (result.success) {
            set({ isSharing: false, shareError: null });
          } else {
            set({ isSharing: false, shareError: result.error || "Failed to share DNA" });
          }

          return result;
        } catch (error) {
          console.error("Error sharing DNA:", error);
          const errorMessage = error instanceof Error ? error.message : "Failed to share DNA";
          set({ isSharing: false, shareError: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      /**
       * Sync DNA history with server
       */
      syncWithServer: async (userId: string) => {
        const { isSyncing } = get();

        if (isSyncing) {
          return;
        }

        set({ isSyncing: true, syncError: null });

        try {
          const syncRepository = new ForgeDNASyncRepository();

          // Fetch latest data from server
          const { success, data, error } = await syncRepository.fetchFromServer(userId);

          if (success && data) {
            // Update local history with server data
            set({
              history: data,
              isSyncing: false,
              syncError: null,
              lastSynced: Date.now()
            });
          } else {
            set({
              isSyncing: false,
              syncError: error || "Failed to sync with server"
            });
          }
        } catch (error) {
          console.error("Error syncing with server:", error);
          const errorMessage = error instanceof Error ? error.message : "Failed to sync with server";
          set({
            isSyncing: false,
            syncError: errorMessage
          });
        }
      },

      /**
       * Get display-ready DNA with premium blur handling
       */
      getDisplayDNA: (isPremium: boolean) => {
        const { dna, history, averageUserDNA } = get();

        if (!dna) return null;

        // For free users, we'll blur premium sections in the UI
        // For premium users, return full data
        return {
          basic: dna,
          premium: isPremium ? {
            historicalComparison: history || [],
            userComparison: averageUserDNA ? {
              averageUser: averageUserDNA,
              differences: [],
            } : {
              averageUser: dna, // Fallback to current user data
              differences: [],
            },
            detailedAnalysis: dna ? {
              imbalanceRecommendations: [],
              trainingStyleInsights: [],
              progressionSuggestions: [],
            } : {
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
export const useForgeDNAHistory = () => useForgeDNAStore(state => state.history);
export const useForgeDNAHistoryLoading = () => useForgeDNAStore(state => state.isHistoryLoading);
export const useForgeDNAHistoryError = () => useForgeDNAStore(state => state.historyError);
export const useAverageUserDNA = () => useForgeDNAStore(state => state.averageUserDNA);
export const useComparisonLoading = () => useForgeDNAStore(state => state.isComparisonLoading);
export const useComparisonError = () => useForgeDNAStore(state => state.comparisonError);
export const useIsSharing = () => useForgeDNAStore(state => state.isSharing);
export const useShareError = () => useForgeDNAStore(state => state.shareError);
export const useIsSyncing = () => useForgeDNAStore(state => state.isSyncing);
export const useSyncError = () => useForgeDNAStore(state => state.syncError);
export const useLastSynced = () => useForgeDNAStore(state => state.lastSynced);
export const useDisplayDNA = (isPremium: boolean) =>
  useForgeDNAStore(state => state.getDisplayDNA(isPremium));
export const useLoadDNAHistory = () => useForgeDNAStore(state => state.loadDNAHistory);
export const useLoadUserComparison = () => useForgeDNAStore(state => state.loadUserComparison);
export const useShareDNA = () => useForgeDNAStore(state => state.shareDNA);
export const useSyncWithServer = () => useForgeDNAStore(state => state.syncWithServer);