// src/lib/stores/settingsStore.ts
// Zustand store for app settings with AsyncStorage persistence
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import { useMemo } from "react";
import { Accent } from "@/src/ui/designSystem";

const STORAGE_KEY = "forgerank.settings.v2"; // New key for Zustand version

export interface Settings {
  hapticsEnabled: boolean;
  soundsEnabled: boolean;
  unitSystem: "lb" | "kg";
  defaultRestSeconds: number;
  accent: Accent;
}

const DEFAULTS: Settings = {
  hapticsEnabled: true,
  soundsEnabled: true,
  unitSystem: "lb",
  defaultRestSeconds: 90,
  accent: "toxic",
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
        accent: state.accent,
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
  accent: state.accent,
});

// Hook for accessing settings (matches old API)
export function useSettings(): Settings {
  // Use individual state properties to avoid infinite loop
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);
  const soundsEnabled = useSettingsStore((state) => state.soundsEnabled);
  const unitSystem = useSettingsStore((state) => state.unitSystem);
  const defaultRestSeconds = useSettingsStore((state) => state.defaultRestSeconds);
  const accent = useSettingsStore((state) => state.accent);

  // Memoize the settings object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      hapticsEnabled,
      soundsEnabled,
      unitSystem,
      defaultRestSeconds,
      accent,
    }),
    [hapticsEnabled, soundsEnabled, unitSystem, defaultRestSeconds, accent]
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
    accent: state.accent,
  };
}

// Imperative action for non-React code
export function updateSettings(patch: Partial<Settings>): void {
  useSettingsStore.getState().updateSettings(patch);
}
