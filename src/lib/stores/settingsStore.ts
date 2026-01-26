// src/lib/stores/settingsStore.ts
// Zustand store for app settings with AsyncStorage persistence
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";

const STORAGE_KEY = "forgerank.settings.v2"; // New key for Zustand version

export interface Settings {
  hapticsEnabled: boolean;
  soundsEnabled: boolean;
  unitSystem: "lb" | "kg";
  defaultRestSeconds: number;
}

const DEFAULTS: Settings = {
  hapticsEnabled: true,
  soundsEnabled: true,
  unitSystem: "lb",
  defaultRestSeconds: 90,
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
});

// Hook for accessing settings (matches old API)
export function useSettings(): Settings {
  return useSettingsStore(selectSettings);
}

// Imperative getter for non-React code
export function getSettings(): Settings {
  const state = useSettingsStore.getState();
  return {
    hapticsEnabled: state.hapticsEnabled,
    soundsEnabled: state.soundsEnabled,
    unitSystem: state.unitSystem,
    defaultRestSeconds: state.defaultRestSeconds,
  };
}

// Imperative action for non-React code
export function updateSettings(patch: Partial<Settings>): void {
  useSettingsStore.getState().updateSettings(patch);
}
