// src/lib/avatar/avatarStore.ts
// Zustand store for avatar state management

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "../stores/storage/createQueuedAsyncStorage";
import type { AvatarArtStyle, AvatarCosmetics, AvatarGrowth } from "./avatarTypes";
import { updateAvatarStyle, updateAvatarCosmetics, updateAvatarGrowth, getUserAvatarData } from "./avatarRepository";
import { getUser } from "../stores/authStore";
import { logError } from "../errorHandler";

const STORAGE_KEY = "avatar.v1";

export interface AvatarStoreState {
  // Avatar properties
  artStyle: AvatarArtStyle | null;
  growthStage: number | null;
  heightScale: number | null;
  cosmetics: AvatarCosmetics | null;

  // Growth metrics
  volumeTotal: number | null;
  setsTotal: number | null;
  avgRank: number | null;

  // Loading state
  hydrated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AvatarStoreActions {
  // Avatar customization
  setArtStyle: (style: AvatarArtStyle) => Promise<boolean>;
  setCosmetics: (cosmetics: AvatarCosmetics) => Promise<boolean>;

  // Growth management
  updateGrowth: (growth: AvatarGrowth) => Promise<boolean>;
  calculateGrowth: (volumeKg: number, sets: number, avgRank: number) => Promise<boolean>;

  // State management
  hydrate: () => Promise<void>;
  setHydrated: (value: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: AvatarStoreState = {
  artStyle: null,
  growthStage: 1,
  heightScale: 0.3,
  cosmetics: {
    top: null,
    bottom: null,
    shoes: null,
    accessory: null,
  },
  volumeTotal: 0,
  setsTotal: 0,
  avgRank: 0,
  hydrated: false,
  loading: false,
  error: null,
};

export const useAvatarStore = create<AvatarStoreState & AvatarStoreActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Set avatar art style
      setArtStyle: async (style: AvatarArtStyle) => {
        const user = getUser();

        // Update local state immediately
        set({ artStyle: style, error: null });

        // Only sync to backend if user is authenticated
        if (user) {
          set({ loading: true });
          try {
            const result = await updateAvatarStyle(user.id, style);
            if (result.success) {
              set({ loading: false });
              return true;
            } else {
              set({ error: result.error || "Failed to update avatar style", loading: false });
              return false;
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            set({ error: errorMessage, loading: false });
            logError({ context: "AvatarStore.setArtStyle", error: err, userMessage: "Failed to set avatar style" });
            return false;
          }
        }

        // Successfully updated locally
        return true;
      },

      // Set avatar cosmetics
      setCosmetics: async (cosmetics: AvatarCosmetics) => {
        const user = getUser();

        // Update local state immediately
        set({ cosmetics, error: null });

        // Only sync to backend if user is authenticated
        if (user) {
          set({ loading: true });
          try {
            const result = await updateAvatarCosmetics(user.id, cosmetics);
            if (result.success) {
              set({ loading: false });
              return true;
            } else {
              set({ error: result.error || "Failed to update avatar cosmetics", loading: false });
              return false;
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            set({ error: errorMessage, loading: false });
            logError({ context: "AvatarStore.setCosmetics", error: err, userMessage: "Failed to set avatar cosmetics" });
            return false;
          }
        }

        // Successfully updated locally
        return true;
      },

      // Update avatar growth
      updateGrowth: async (growth: AvatarGrowth) => {
        const user = getUser();

        // Update local state immediately
        set({
          growthStage: growth.stage,
          heightScale: growth.heightScale,
          volumeTotal: growth.volumeTotal,
          setsTotal: growth.setsTotal,
          avgRank: growth.avgRank,
          error: null
        });

        // Only sync to backend if user is authenticated
        if (user) {
          set({ loading: true });
          try {
            const result = await updateAvatarGrowth(
              user.id,
              growth.stage,
              growth.heightScale,
              growth.volumeTotal,
              growth.setsTotal
            );
            if (result.success) {
              set({ loading: false });
              return true;
            } else {
              set({ error: result.error || "Failed to update avatar growth", loading: false });
              return false;
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            set({ error: errorMessage, loading: false });
            logError({ context: "AvatarStore.updateGrowth", error: err, userMessage: "Failed to update avatar growth" });
            return false;
          }
        }

        // Successfully updated locally
        return true;
      },

      // Calculate avatar growth based on metrics
      calculateGrowth: async (volumeKg: number, sets: number, avgRank: number) => {
        // Calculate growth stage based on cumulative metrics
        // This is a simplified algorithm - in a real implementation, this would be more complex
        const totalVolume = (get().volumeTotal || 0) + volumeKg;
        const totalSets = (get().setsTotal || 0) + sets;

        // Simple growth algorithm: stage increases every 10,000 kg volume or 100 sets
        const volumeStages = Math.floor(totalVolume / 10000);
        const setStages = Math.floor(totalSets / 100);
        const rankStages = Math.floor(avgRank / 5); // Assuming ranks go up to 20+

        const newStage = Math.min(20, Math.max(1, 1 + volumeStages + setStages + rankStages));

        // Height scale increases linearly with stage
        const newHeightScale = Math.min(1.0, 0.3 + (newStage - 1) * 0.035);

        const growth: AvatarGrowth = {
          stage: newStage,
          heightScale: newHeightScale,
          volumeTotal: totalVolume,
          setsTotal: totalSets,
          avgRank: avgRank,
        };

        return await get().updateGrowth(growth);
      },

      // Hydrate avatar data from database
      hydrate: async () => {
        const user = getUser();
        if (!user) {
          set({ hydrated: true });
          return;
        }

        set({ loading: true, error: null });

        try {
          const result = await getUserAvatarData(user.id);

          if (result.success && result.data) {
            set({
              artStyle: (result.data.avatarArtStyle as AvatarArtStyle) || null,
              growthStage: result.data.avatarGrowthStage || 1,
              heightScale: result.data.avatarHeightScale || 0.3,
              cosmetics: result.data.avatarCosmetics || {
                top: null,
                bottom: null,
                shoes: null,
                accessory: null,
              },
              volumeTotal: result.data.totalVolumeKg || 0,
              setsTotal: result.data.totalSets || 0,
              loading: false,
              hydrated: true,
            });
          } else {
            set({
              loading: false,
              hydrated: true,
              error: result.error || "Failed to load avatar data"
            });
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          set({ error: errorMessage, loading: false, hydrated: true });
          logError({ context: "AvatarStore.hydrate", error: err, userMessage: "Failed to hydrate avatar data" });
        }
      },

      // Set hydrated state
      setHydrated: (value: boolean) => set({ hydrated: value }),

      // Set error state
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        artStyle: state.artStyle,
        growthStage: state.growthStage,
        heightScale: state.heightScale,
        cosmetics: state.cosmetics,
        volumeTotal: state.volumeTotal,
        setsTotal: state.setsTotal,
        avgRank: state.avgRank,
      }),
    }
  )
);

// Selectors
export const useAvatarData = () => useAvatarStore((state) => ({
  artStyle: state.artStyle,
  growthStage: state.growthStage,
  heightScale: state.heightScale,
  cosmetics: state.cosmetics,
}));

export const useAvatarGrowth = () => useAvatarStore((state) => ({
  stage: state.growthStage,
  heightScale: state.heightScale,
  volumeTotal: state.volumeTotal,
  setsTotal: state.setsTotal,
  avgRank: state.avgRank,
}));

export const useAvatarLoading = () => useAvatarStore((state) => state.loading);
export const useAvatarError = () => useAvatarStore((state) => state.error);
export const useIsAvatarHydrated = () => useAvatarStore((state) => state.hydrated);