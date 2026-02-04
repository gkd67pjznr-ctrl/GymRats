// src/lib/stores/settingsStore.ts
// Zustand store for app settings with AsyncStorage persistence
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import { useMemo } from "react";

// Import experience level type from onboarding store
import type { ExperienceLevel, TrainingGoal } from "./onboardingStore";
import type { Accent } from "@/src/ui/designSystem";
import type { ThemeId } from "@/src/ui/themes/themeTokens";

const STORAGE_KEY = "gymrats.settings.v2"; // New key for Zustand version

// Audio cue preferences for different types of sounds
export interface AudioCuePreferences {
  prCelebration: boolean;
  restTimerStart: boolean;
  restTimerEnd: boolean;
  workoutComplete: boolean;
  rankUp: boolean;
  levelUp: boolean;
}

// Rest timer feedback preferences
export interface RestTimerFeedbackPreferences {
  audio: boolean;
  haptic: boolean;
  voice: boolean;
  notification: boolean;
  visualProgress: boolean;
}

// Rank-related settings
export interface RankSettings {
  showFriendComparison: boolean;
  enableRankUpNotifications: boolean;
  allowRankSharing: boolean;
}

// Location data for regional leaderboards
export interface LocationData {
  zipCode: string;
  region: string; // State/province
  country: string;
}

export interface Settings {
  hapticsEnabled: boolean;
  soundsEnabled: boolean;
  buddyVoiceEnabled: boolean;
  unitSystem: "lb" | "kg";
  defaultRestSeconds: number;
  // User profile from onboarding
  displayName: string;
  bodyweight: number; // Always stored in kg internally
  experienceLevel: ExperienceLevel;
  personalityId: string;
  goal: TrainingGoal;
  accent: Accent;
  themeId: ThemeId; // Visual theme selection
  replayAutoPlay: boolean;
  // Weight tracking
  weightHistory: { date: string; weightKg: number }[];
  // Notification preferences
  notificationPrefs: {
    friendRequests: boolean;
    directMessages: boolean;
    competitionResults: boolean;
    restTimer: boolean;
    reactions: boolean;
    comments: boolean;
  };
  // Audio cue preferences for different types of sounds
  audioCues: AudioCuePreferences;
  // Rest timer feedback preferences
  restTimerFeedback: RestTimerFeedbackPreferences;
  // Rank-related settings
  rankSettings: RankSettings;
  // Location data for regional leaderboards
  location: LocationData;
}

const DEFAULTS: Settings = {
  hapticsEnabled: true,
  soundsEnabled: true,
  buddyVoiceEnabled: true,
  unitSystem: "lb",
  defaultRestSeconds: 90,
  displayName: "Lifter",
  bodyweight: 70, // default kg (~154 lb)
  experienceLevel: "intermediate",
  personalityId: "coach",
  goal: "general",
  accent: "toxic",
  themeId: "toxic-energy", // Default visual theme
  replayAutoPlay: true,
  weightHistory: [],
  notificationPrefs: {
    friendRequests: true,
    directMessages: true,
    competitionResults: true,
    restTimer: true,
    reactions: true,
    comments: true,
  },
  audioCues: {
    prCelebration: true,
    restTimerStart: true,
    restTimerEnd: true,
    workoutComplete: true,
    rankUp: true,
    levelUp: true,
  },
  restTimerFeedback: {
    audio: true,
    haptic: true,
    voice: true,
    notification: true,
    visualProgress: true,
  },
  rankSettings: {
    showFriendComparison: true,
    enableRankUpNotifications: true,
    allowRankSharing: true,
  },
  location: {
    zipCode: '',
    region: '',
    country: '',
  },
};

interface SettingsState extends Settings {
  hydrated: boolean;

  // Actions
  updateSettings: (patch: Partial<Settings>) => void;
  resetSettings: () => void;
  setHydrated: (value: boolean) => void;
  // Weight tracking actions
  addWeightEntry: (weightKg: number, date?: string) => void;
  updateCurrentWeight: (weightKg: number) => void;
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

      // Weight tracking actions
      addWeightEntry: (weightKg, date) => set((state) => {
        const entryDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const newEntry = { date: entryDate, weightKg };

        // Check if entry for this date already exists
        const existingIndex = state.weightHistory.findIndex(entry => entry.date === entryDate);
        let newHistory;
        if (existingIndex >= 0) {
          // Update existing entry
          newHistory = [...state.weightHistory];
          newHistory[existingIndex] = newEntry;
        } else {
          // Add new entry
          newHistory = [...state.weightHistory, newEntry];
        }

        // Sort by date (newest first)
        newHistory.sort((a, b) => b.date.localeCompare(a.date));

        return {
          ...state,
          weightHistory: newHistory,
          // Also update current bodyweight if this is today's entry
          bodyweight: entryDate === new Date().toISOString().split('T')[0] ? weightKg : state.bodyweight
        };
      }),

      updateCurrentWeight: (weightKg) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const newEntry = { date: today, weightKg };

        // Check if entry for today already exists
        const existingIndex = state.weightHistory.findIndex(entry => entry.date === today);
        let newHistory;
        if (existingIndex >= 0) {
          // Update existing entry
          newHistory = [...state.weightHistory];
          newHistory[existingIndex] = newEntry;
        } else {
          // Add new entry
          newHistory = [...state.weightHistory, newEntry];
        }

        // Sort by date (newest first)
        newHistory.sort((a, b) => b.date.localeCompare(a.date));

        return {
          ...state,
          bodyweight: weightKg,
          weightHistory: newHistory
        };
      }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        hapticsEnabled: state.hapticsEnabled,
        soundsEnabled: state.soundsEnabled,
        buddyVoiceEnabled: state.buddyVoiceEnabled,
        unitSystem: state.unitSystem,
        defaultRestSeconds: state.defaultRestSeconds,
        displayName: state.displayName,
        bodyweight: state.bodyweight,
        experienceLevel: state.experienceLevel,
        personalityId: state.personalityId,
        goal: state.goal,
        accent: state.accent,
        themeId: state.themeId,
        replayAutoPlay: state.replayAutoPlay,
        weightHistory: state.weightHistory,
        notificationPrefs: state.notificationPrefs,
        audioCues: state.audioCues,
        restTimerFeedback: state.restTimerFeedback,
        rankSettings: state.rankSettings,
        location: state.location,
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
  buddyVoiceEnabled: state.buddyVoiceEnabled,
  unitSystem: state.unitSystem,
  defaultRestSeconds: state.defaultRestSeconds,
  displayName: state.displayName,
  bodyweight: state.bodyweight,
  experienceLevel: state.experienceLevel,
  personalityId: state.personalityId,
  goal: state.goal,
  accent: state.accent,
  themeId: state.themeId,
  replayAutoPlay: state.replayAutoPlay,
  weightHistory: state.weightHistory,
  notificationPrefs: state.notificationPrefs,
  audioCues: state.audioCues,
  restTimerFeedback: state.restTimerFeedback,
  rankSettings: state.rankSettings,
  location: state.location,
});

// Hook for accessing settings (matches old API)
export function useSettings(): Settings {
  // Use individual state properties to avoid infinite loop
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);
  const soundsEnabled = useSettingsStore((state) => state.soundsEnabled);
  const buddyVoiceEnabled = useSettingsStore((state) => state.buddyVoiceEnabled);
  const unitSystem = useSettingsStore((state) => state.unitSystem);
  const defaultRestSeconds = useSettingsStore((state) => state.defaultRestSeconds);
  const displayName = useSettingsStore((state) => state.displayName);
  const bodyweight = useSettingsStore((state) => state.bodyweight);
  const experienceLevel = useSettingsStore((state) => state.experienceLevel);
  const personalityId = useSettingsStore((state) => state.personalityId);
  const goal = useSettingsStore((state) => state.goal);
  const accent = useSettingsStore((state) => state.accent);
  const themeId = useSettingsStore((state) => state.themeId);
  const replayAutoPlay = useSettingsStore((state) => state.replayAutoPlay);
  const weightHistory = useSettingsStore((state) => state.weightHistory);
  const notificationPrefs = useSettingsStore((state) => state.notificationPrefs);
  const audioCues = useSettingsStore((state) => state.audioCues);
  const restTimerFeedback = useSettingsStore((state) => state.restTimerFeedback);
  const rankSettings = useSettingsStore((state) => state.rankSettings);
  const location = useSettingsStore((state) => state.location);

  // Memoize the settings object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      hapticsEnabled,
      soundsEnabled,
      buddyVoiceEnabled,
      unitSystem,
      defaultRestSeconds,
      displayName,
      bodyweight,
      experienceLevel,
      personalityId,
      goal,
      accent,
      themeId,
      replayAutoPlay,
      weightHistory,
      notificationPrefs,
      audioCues,
      restTimerFeedback,
      rankSettings,
      location,
    }),
    [hapticsEnabled, soundsEnabled, buddyVoiceEnabled, unitSystem, defaultRestSeconds, displayName, bodyweight, experienceLevel, personalityId, goal, accent, themeId, replayAutoPlay, weightHistory, notificationPrefs, audioCues, restTimerFeedback, rankSettings, location]
  );
}

// Imperative getter for non-React code
export function getSettings(): Settings {
  const state = useSettingsStore.getState();
  return {
    hapticsEnabled: state.hapticsEnabled,
    soundsEnabled: state.soundsEnabled,
    buddyVoiceEnabled: state.buddyVoiceEnabled,
    unitSystem: state.unitSystem,
    defaultRestSeconds: state.defaultRestSeconds,
    displayName: state.displayName,
    bodyweight: state.bodyweight,
    experienceLevel: state.experienceLevel,
    personalityId: state.personalityId,
    goal: state.goal,
    accent: state.accent,
    themeId: state.themeId,
    replayAutoPlay: state.replayAutoPlay,
    weightHistory: state.weightHistory,
    notificationPrefs: state.notificationPrefs,
    audioCues: state.audioCues,
    restTimerFeedback: state.restTimerFeedback,
    rankSettings: state.rankSettings,
    location: state.location,
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

/**
 * Get user weight history for analytics
 */
export function getUserWeightHistory(): { date: string; weightKg: number }[] {
  const history = useSettingsStore.getState().weightHistory;
  // Return sorted by date (newest first)
  return [...history].sort((a, b) => b.date.localeCompare(a.date));
}
