/**
 * Theme Pack System - Public API
 *
 * This module exports all theme pack functionality for use throughout the app.
 *
 * Usage:
 * ```typescript
 * import {
 *   useEquippedPack,
 *   useThemePackColors,
 *   useResolvedTheme,
 *   equipThemePack,
 * } from '@/src/lib/themes';
 * ```
 */

// Types
export type {
  ThemePack,
  ThemePackTier,
  ThemePackColors,
  ThemePackTypography,
  ThemePackMotion,
  ThemePackAudio,
  ThemePackParticles,
  ThemePackCelebrations,
  ParticleConfig,
  ParticleShape,
  BuddyOverrides,
  ResolvedTheme,
  ThemeContextValue,
  ThemePackState,
  ThemePackActions,
} from './types';

// Store and hooks
export {
  useThemePackStore,
  useEquippedPack,
  useAvailablePacks,
  usePurchasedPackIds,
  useIsPackOwned,
  useThemePackLoading,
  useResolvedTheme,
  useThemePackColors,
  useThemePackMotion,
  resolveThemePack,
  equipThemePack,
  getEquippedThemePack,
  getResolvedTheme,
} from './themePackStore';

// Default packs
export {
  DEFAULT_THEME_PACKS,
  DEFAULT_PACK_ID,
  getPackById,
  getFreePacks,
  getPremiumPacks,
  getLegendaryPacks,
} from './defaultPacks';
