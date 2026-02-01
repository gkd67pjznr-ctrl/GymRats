// src/lib/stores/settingsStore.ts
// Zustand store for app settings with AsyncStorage persistence
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import { useMemo } from "react";

// Import experience level type from onboarding store
import type { ExperienceLevel, TrainingGoal } from "./onboardingStore";

const STORAGE_KEY = "forgerank.settings.v2"; // New key for Zustand version

export interface Settings {
  hapticsEnabled: boolean;
  soundsEnabled: boolean;
  unitSystem: "lb" | "kg";
  defaultRestSeconds: number;
  // User profile from onboarding
  displayName: string;
  bodyweight: number; // Always stored in kg internally
  experienceLevel: ExperienceLevel;
  personalityId: string;
  goal: TrainingGoal;
  accent: Accent;
  replayAutoPlay: boolean;
  // Notification preferences
  notificationPrefs: {
    friendRequests: boolean;
    directMessages: boolean;
    competitionResults: boolean;
    restTimer: boolean;
    reactions: boolean;
    comments: boolean;
  };
}

const DEFAULTS: Settings = {
  hapticsEnabled: true,
  soundsEnabled: true,
  unitSystem: "lb",
  defaultRestSeconds: 90,
  displayName: "Lifter",
  bodyweight: 70, // default kg (~154 lb)
  experienceLevel: "intermediate",
  personalityId: "coach",
  goal: "general",
  accent: "toxic",
  replayAutoPlay: true,
  notificationPrefs: {
    friendRequests: true,
    directMessages: true,
    competitionResults: true,
    restTimer: true,
    reactions: true,
    comments: true,
  },
};

interface SettingsState extends Settings {
  hydrated: boolean;

  // Actions
  updateSettings: (patch: Partial<Settings>) => void;
  resetSettings: () => void;
  setHydrated: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      hydrated: false,

      updateSettings: (patch) =>
        set((state) => ({
          ...state,
          ...patch,
        })),

      resetSettings: () => set({ ...DEFAULTS }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        hapticsEnabled: state.hapticsEnabled,
        soundsEnabled: state.soundsEnabled,
        unitSystem: state.unitSystem,
        defaultRestSeconds: state.defaultRestSeconds,
        displayName: state.displayName,
        bodyweight: state.bodyweight,
        experienceLevel: state.experienceLevel,
        personalityId: state.personalityId,
        goal: state.goal,
        accent: state.accent,
        replayAutoPlay: state.replayAutoPlay,
        notificationPrefs: state.notificationPrefs,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Convenience selectors
export const selectSettings = (state: SettingsState): Settings => ({
  hapticsEnabled: state.hapticsEnabled,
  soundsEnabled: state.soundsEnabled,
  unitSystem: state.unitSystem,
  defaultRestSeconds: state.defaultRestSeconds,
  displayName: state.displayName,
  bodyweight: state.bodyweight,
  experienceLevel: state.experienceLevel,
  personalityId: state.personalityId,
  accent: state.accent,
  replayAutoPlay: state.replayAutoPlay,
  notificationPrefs: state.notificationPrefs,
});

// Hook for accessing settings (matches old API)
export function useSettings(): Settings {
  // Use individual state properties to avoid infinite loop
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);
  const soundsEnabled = useSettingsStore((state) => state.soundsEnabled);
  const unitSystem = useSettingsStore((state) => state.unitSystem);
  const defaultRestSeconds = useSettingsStore((state) => state.defaultRestSeconds);
  const displayName = useSettingsStore((state) => state.displayName);
  const bodyweight = useSettingsStore((state) => state.bodyweight);
  const experienceLevel = useSettingsStore((state) => state.experienceLevel);
  const personalityId = useSettingsStore((state) => state.personalityId);
  const goal = useSettingsStore((state) => state.goal);
  const accent = useSettingsStore((state) => state.accent);
  const replayAutoPlay = useSettingsStore((state) => state.replayAutoPlay);

  // Memoize the settings object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      hapticsEnabled,
      soundsEnabled,
      unitSystem,
      defaultRestSeconds,
      displayName,
      bodyweight,
      experienceLevel,
      personalityId,
      goal,
      accent,
      replayAutoPlay,
      notificationPrefs: {
        friendRequests: true,
        directMessages: true,
        competitionResults: true,
        restTimer: true,
        reactions: true,
        comments: true,
      },
    }),
    [hapticsEnabled, soundsEnabled, unitSystem, defaultRestSeconds, displayName, bodyweight, experienceLevel, personalityId, goal, accent, replayAutoPlay]
  );
}

// Imperative getter for non-React code
export function getSettings(): Settings {
  const state = useSettingsStore.getState();
  return {
    hapticsEnabled: state.hapticsEnabled,
    soundsEnabled: state.soundsEnabled,
    unitSystem: state.unitSystem,
    defaultRestSeconds: state.defaultRestSeconds,
    displayName: state.displayName,
    bodyweight: state.bodyweight,
    experienceLevel: state.experienceLevel,
    personalityId: state.personalityId,
    goal: state.goal,
    accent: state.accent,
    replayAutoPlay: state.replayAutoPlay,
    notificationPrefs: state.notificationPrefs,
  };
}

// Imperative action for non-React code
export function updateSettings(patch: Partial<Settings>): void {
  useSettingsStore.getState().updateSettings(patch);
}

/**
 * Get user bodyweight for analytics
 */
export function getUserBodyweight(): number {
  return useSettingsStore.getState().bodyweight;
}
