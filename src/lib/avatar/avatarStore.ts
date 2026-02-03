// src/lib/avatar/avatarStore.ts
// Zustand store for avatar customization (art style and cosmetics)
// NOTE: Growth metrics are now managed by userStatsStore - use getGrowthFromStats() for growth data

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "../stores/storage/createQueuedAsyncStorage";
import type { AvatarArtStyle, AvatarCosmetics } from "./avatarTypes";
import { updateAvatarStyle, updateAvatarCosmetics, getUserAvatarData } from "./avatarRepository";
import { getUser } from "../stores/authStore";
import { logError } from "../errorHandler";
import { getAvatarGrowth as getUserStatsAvatarGrowth, type DerivedAvatarGrowth } from "../stores/userStatsStore";

const STORAGE_KEY = "avatar.v1";

export interface AvatarStoreState {
  // Avatar customization properties (non-growth)
  artStyle: AvatarArtStyle | null;
  cosmetics: AvatarCosmetics | null;

  // Loading state
  hydrated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AvatarStoreActions {
  // Avatar customization
  setArtStyle: (style: AvatarArtStyle) => Promise<boolean>;
  setCosmetics: (cosmetics: AvatarCosmetics) => Promise<boolean>;

  // State management
  hydrate: () => Promise<void>;
  setHydrated: (value: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: AvatarStoreState = {
  artStyle: null,
  cosmetics: {
    top: null,
    bottom: null,
    shoes: null,
    accessory: null,
  },
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
              cosmetics: result.data.avatarCosmetics || {
                top: null,
                bottom: null,
                shoes: null,
                accessory: null,
              },
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
        cosmetics: state.cosmetics,
      }),
    }
  )
);

// ========== Selectors ==========

export const useAvatarData = () => useAvatarStore((state) => ({
  artStyle: state.artStyle,
  cosmetics: state.cosmetics,
}));

export const useAvatarLoading = () => useAvatarStore((state) => state.loading);
export const useAvatarError = () => useAvatarStore((state) => state.error);
export const useIsAvatarHydrated = () => useAvatarStore((state) => state.hydrated);

// ========== Growth Integration ==========

/**
 * Get avatar growth data from the unified userStatsStore
 * This is the recommended way to access growth data
 */
export function getGrowthFromStats(): DerivedAvatarGrowth {
  return getUserStatsAvatarGrowth();
}

/**
 * Hook to get avatar growth from userStatsStore
 * @deprecated Use useAvatarGrowth from '@/src/lib/stores' instead
 */
export const useAvatarGrowth = () => {
  // Return growth data from userStatsStore for backward compatibility
  const growth = getUserStatsAvatarGrowth();
  return {
    stage: growth.stage,
    heightScale: growth.heightScale,
    volumeTotal: growth.volumeTotal,
    setsTotal: growth.setsTotal,
    avgRank: growth.avgRank,
  };
};

// Re-export DerivedAvatarGrowth type for consumers
export type { DerivedAvatarGrowth };
