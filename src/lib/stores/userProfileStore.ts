// src/lib/stores/userProfileStore.ts
// Zustand store for caching user profiles with AsyncStorage persistence

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import type { ID } from "../socialModel";
import { logError } from "../errorHandler";
import { safeJSONParse } from "../storage/safeJSONParse";
import { userProfileRepository, type UserProfile } from "../sync/repositories/userProfileRepository";

const STORAGE_KEY = "userProfiles.v1";

interface UserProfileState {
  profiles: Record<string, UserProfile>; // Map userId -> UserProfile
  hydrated: boolean;

  // Actions
  setProfile: (userId: string, profile: UserProfile) => void;
  setProfiles: (profiles: UserProfile[]) => void;
  getProfile: (userId: string) => UserProfile | undefined;
  searchProfiles: (query: string, limit?: number) => Promise<UserProfile[]>;
  fetchProfile: (userId: string) => Promise<UserProfile | null>;
  fetchProfiles: (userIds: string[]) => Promise<void>;
  updateMyProfile: (updates: { displayName?: string; avatarUrl?: string }) => Promise<void>;
  clearCache: () => void;
  setHydrated: (value: boolean) => void;
}

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set, get) => ({
      profiles: {},
      hydrated: false,

      setProfile: (userId, profile) => {
        set((state) => ({
          profiles: {
            ...state.profiles,
            [userId]: profile,
          },
        }));
      },

      setProfiles: (profiles) => {
        const profileMap = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, UserProfile>);

        set((state) => ({
          profiles: {
            ...state.profiles,
            ...profileMap,
          },
        }));
      },

      getProfile: (userId) => {
        return get().profiles[userId];
      },

      searchProfiles: async (query, limit = 20) => {
        try {
          const results = await userProfileRepository.searchUsers(query, limit);

          // Cache the results
          get().setProfiles(results);

          return results;
        } catch (error) {
          logError({ context: 'UserProfileStore', error, userMessage: 'Failed to search profiles' });
          return [];
        }
      },

      fetchProfile: async (userId) => {
        // Check cache first
        const cached = get().profiles[userId];
        if (cached) {
          return cached;
        }

        try {
          const profile = await userProfileRepository.getUserProfile(userId);
          if (profile) {
            get().setProfile(userId, profile);
            return profile;
          }
          return null;
        } catch (error) {
          logError({ context: 'UserProfileStore', error, userMessage: 'Failed to fetch profile' });
          return null;
        }
      },

      fetchProfiles: async (userIds) => {
        // Filter out already cached profiles
        const uncachedIds = userIds.filter((id) => !get().profiles[id]);

        if (uncachedIds.length === 0) {
          return; // All profiles already cached
        }

        try {
          const profiles = await userProfileRepository.getUserProfiles(uncachedIds);
          get().setProfiles(profiles);
        } catch (error) {
          logError({ context: 'UserProfileStore', error, userMessage: 'Failed to fetch profiles' });
        }
      },

      updateMyProfile: async (updates) => {
        try {
          const updated = await userProfileRepository.updateUserProfile(updates);
          if (updated) {
            get().setProfile(updated.id, updated);
          }
        } catch (error) {
          logError({ context: 'UserProfileStore', error, userMessage: 'Failed to update profile' });
        }
      },

      clearCache: () => {
        set({ profiles: {} });
      },

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        profiles: state.profiles,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectUserProfile = (userId: string) => (state: UserProfileState) =>
  state.profiles[userId];

export const selectUserProfileNames = (userIds: string[]) => (state: UserProfileState) => {
  const names: Record<string, string> = {};
  for (const id of userIds) {
    const profile = state.profiles[id];
    names[id] = profile?.displayName ?? id;
  }
  return names;
};

// ============================================================================
// Hooks
// ============================================================================

export function useUserProfile(userId: string): UserProfile | undefined {
  return useUserProfileStore(selectUserProfile(userId));
}

export function useUserProfiles(userIds: string[]): Record<string, UserProfile> {
  const profiles = useUserProfileStore((state) => state.profiles);
  const result: Record<string, UserProfile> = {};

  for (const id of userIds) {
    if (profiles[id]) {
      result[id] = profiles[id];
    }
  }

  return result;
}

// ============================================================================
// Imperative getters
// ============================================================================

export function getUserProfile(userId: string): UserProfile | undefined {
  return useUserProfileStore.getState().profiles[userId];
}

export function getAllUserProfiles(): Record<string, UserProfile> {
  return useUserProfileStore.getState().profiles;
}

// ============================================================================
// Imperative actions
// ============================================================================

export function getCachedDisplayName(userId: string): string {
  const profile = getUserProfile(userId);
  return profile?.displayName ?? userId;
}

export async function searchUserProfiles(query: string, limit?: number): Promise<UserProfile[]> {
  return useUserProfileStore.getState().searchProfiles(query, limit);
}

export async function ensureUserProfile(userId: string): Promise<UserProfile | null> {
  return useUserProfileStore.getState().fetchProfile(userId);
}

export async function ensureUserProfiles(userIds: string[]): Promise<void> {
  return useUserProfileStore.getState().fetchProfiles(userIds);
}
