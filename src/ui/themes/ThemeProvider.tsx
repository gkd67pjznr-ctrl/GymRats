// src/ui/themes/ThemeProvider.tsx
// Theme context provider for the visual theme system

import React, { createContext, useContext, useMemo } from 'react';
import { useSettings } from '@/src/lib/stores/settingsStore';
import { ironForgeTheme } from './ironForge';
import { toxicEnergyTheme } from './toxicEnergy';
import { neonGlowTheme } from './neonGlow';
import type { ThemeTokens, ThemeId } from './themeTokens';
import { DEFAULT_THEME_ID } from './themeTokens';

// ============================================================================
// Theme Registry
// ============================================================================

/** All available themes */
export const themes: Record<ThemeId, ThemeTokens> = {
  'iron-forge': ironForgeTheme,
  'toxic-energy': toxicEnergyTheme,
  'neon-glow': neonGlowTheme,
};

/** Get theme by ID with fallback */
export function getTheme(themeId: string): ThemeTokens {
  return themes[themeId as ThemeId] || themes[DEFAULT_THEME_ID];
}

/** Get all available theme IDs */
export function getAvailableThemeIds(): ThemeId[] {
  return Object.keys(themes) as ThemeId[];
}

// ============================================================================
// Theme Context
// ============================================================================

const ThemeContext = createContext<ThemeTokens>(themes[DEFAULT_THEME_ID]);

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Override theme ID (for previews, testing) */
  overrideThemeId?: ThemeId;
}

/**
 * Theme Provider
 *
 * Wraps the app to provide theme tokens via context.
 * Reads theme selection from settings store.
 *
 * @example
 * ```tsx
 * // In root layout
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 *
 * // In components
 * const theme = useTheme();
 * <View style={{ backgroundColor: theme.colors.card }}>
 * ```
 */
export function ThemeProvider({ children, overrideThemeId }: ThemeProviderProps) {
  const settings = useSettings();

  const theme = useMemo(() => {
    const themeId = overrideThemeId || settings.themeId || DEFAULT_THEME_ID;
    return getTheme(themeId);
  }, [overrideThemeId, settings.themeId]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access current theme tokens
 *
 * @example
 * ```tsx
 * const theme = useTheme();
 *
 * return (
 *   <View style={{
 *     backgroundColor: theme.colors.card,
 *     borderColor: theme.colors.border,
 *   }}>
 *     <Text style={{ color: theme.colors.text }}>
 *       Themed content
 *     </Text>
 *   </View>
 * );
 * ```
 */
export function useTheme(): ThemeTokens {
  return useContext(ThemeContext);
}

/**
 * Hook to get theme-aware colors only
 * Convenience hook for common color access pattern
 */
export function useThemeTokenColors() {
  const theme = useTheme();
  return theme.colors;
}

/**
 * Hook to get theme motion presets
 */
export function useThemeMotion() {
  const theme = useTheme();
  return theme.motion;
}

/**
 * Hook to get theme surface properties
 */
export function useThemeSurfaces() {
  const theme = useTheme();
  return theme.surfaces;
}
