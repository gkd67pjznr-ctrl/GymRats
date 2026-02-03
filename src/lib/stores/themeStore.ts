// src/lib/stores/themeStore.ts
/**
 * GymRats Theme Store
 *
 * Zustand store for managing UI theme state with persistence.
 * Implements the layered approach: PURE's emotional personality over LIFTOFF's functional efficiency.
 *
 * For complete visual style documentation, see docs/visual-style/
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  ThemeDatabase,
  initializeThemeDatabase,
  getActiveConfiguration,
  getPaletteById,
  getTypographyById,
  getIllustrationById,
  getAudioById,
  getMotionById,
  setActiveConfiguration,
  addConfiguration,
  updateConfiguration,
  ThemePalette,
  ThemeTypography,
  ThemeIllustration,
  ThemeAudio,
  ThemeMotion,
  ThemeConfiguration
} from '../themeDatabase';
import { createQueuedJSONStorage } from './storage/createQueuedAsyncStorage';

export interface ThemeState {
  database: ThemeDatabase;
  activePalette: ThemePalette | null;
  activeTypography: ThemeTypography | null;
  activeIllustration: ThemeIllustration | null;
  activeAudio: ThemeAudio | null;
  activeMotion: ThemeMotion | null;
  isThemeLoaded: boolean;

  // Actions
  initializeThemes: () => void;
  setActiveTheme: (configId: string) => void;
  createTheme: (config: Omit<ThemeConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'isDefault'> & { id: string }) => void;
  updateTheme: (id: string, updates: Partial<Omit<ThemeConfiguration, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  refreshActiveTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      database: initializeThemeDatabase(),
      activePalette: null,
      activeTypography: null,
      activeIllustration: null,
      activeAudio: null,
      activeMotion: null,
      isThemeLoaded: false,

      initializeThemes: () => {
        const database = initializeThemeDatabase();
        const activeConfig = getActiveConfiguration(database);

        if (activeConfig) {
          const palette = getPaletteById(database, activeConfig.paletteId);
          const typography = getTypographyById(database, activeConfig.typographyId);
          const illustration = getIllustrationById(database, activeConfig.illustrationId);
          const audio = getAudioById(database, activeConfig.audioId);
          const motion = getMotionById(database, activeConfig.motionId);

          set({
            database,
            activePalette: palette || null,
            activeTypography: typography || null,
            activeIllustration: illustration || null,
            activeAudio: audio || null,
            activeMotion: motion || null,
            isThemeLoaded: true,
          });
        } else {
          set({
            database,
            isThemeLoaded: true,
          });
        }
      },

      setActiveTheme: (configId: string) => {
        const { database } = get();
        const updatedDatabase = setActiveConfiguration(database, configId);
        const activeConfig = getActiveConfiguration(updatedDatabase);

        if (activeConfig) {
          const palette = getPaletteById(updatedDatabase, activeConfig.paletteId);
          const typography = getTypographyById(updatedDatabase, activeConfig.typographyId);
          const illustration = getIllustrationById(updatedDatabase, activeConfig.illustrationId);
          const audio = getAudioById(updatedDatabase, activeConfig.audioId);
          const motion = getMotionById(updatedDatabase, activeConfig.motionId);

          set({
            database: updatedDatabase,
            activePalette: palette || null,
            activeTypography: typography || null,
            activeIllustration: illustration || null,
            activeAudio: audio || null,
            activeMotion: motion || null,
          });
        }
      },

      createTheme: (config) => {
        const { database } = get();
        const updatedDatabase = addConfiguration(database, config);
        set({ database: updatedDatabase });
      },

      updateTheme: (id: string, updates) => {
        const { database } = get();
        const updatedDatabase = updateConfiguration(database, id, updates);
        set({ database: updatedDatabase });

        // If this was the active theme, refresh it
        const activeConfig = getActiveConfiguration(updatedDatabase);
        if (activeConfig?.id === id) {
          get().refreshActiveTheme();
        }
      },

      refreshActiveTheme: () => {
        const { database } = get();
        const activeConfig = getActiveConfiguration(database);

        if (activeConfig) {
          const palette = getPaletteById(database, activeConfig.paletteId);
          const typography = getTypographyById(database, activeConfig.typographyId);
          const illustration = getIllustrationById(database, activeConfig.illustrationId);
          const audio = getAudioById(database, activeConfig.audioId);
          const motion = getMotionById(database, activeConfig.motionId);

          set({
            activePalette: palette || null,
            activeTypography: typography || null,
            activeIllustration: illustration || null,
            activeAudio: audio || null,
            activeMotion: motion || null,
          });
        }
      },
    }),
    {
      name: 'gymrats-theme.v1',
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        database: state.database,
      }),
    }
  )
);

// Selector hooks for easier access
export const useActivePalette = () => useThemeStore(state => state.activePalette);
export const useActiveTypography = () => useThemeStore(state => state.activeTypography);
export const useActiveIllustration = () => useThemeStore(state => state.activeIllustration);
export const useActiveAudio = () => useThemeStore(state => state.activeAudio);
export const useActiveMotion = () => useThemeStore(state => state.activeMotion);
export const useThemeDatabase = () => useThemeStore(state => state.database);
export const useIsThemeLoaded = () => useThemeStore(state => state.isThemeLoaded);

// Initialize themes when the store is first created
useThemeStore.getState().initializeThemes();