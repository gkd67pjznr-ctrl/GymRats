/**
 * Theme Context
 *
 * React context for providing theme throughout the app.
 * Integrates with Zustand for persistence.
 */

import React, { createContext, useContext, useCallback, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContextValue, ThemeInstallation } from './types';
import { toxicTheme, defaultThemes } from './default';

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

// =============================================================================
// PROVIDER PROPS
// =============================================================================

export interface ThemeProviderProps {
  /** Initial theme ID */
  initialThemeId?: string;
  /** Custom themes to add */
  customThemes?: ThemeInstallation[];
  /** Override available themes entirely */
  themes?: ThemeInstallation[];
  /** Unlocked theme IDs (for premium themes) */
  unlockedThemeIds?: string[];
  /** Children */
  children: ReactNode;
  /** External theme state (for Zustand integration) */
  currentThemeId?: string;
  /** External setter (for Zustand integration) */
  onThemeChange?: (themeId: string) => void;
  /** External color scheme */
  colorScheme?: 'light' | 'dark';
  /** External color scheme setter */
  onColorSchemeChange?: (scheme: 'light' | 'dark') => void;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export function ThemeProvider({
  initialThemeId = 'toxic',
  customThemes = [],
  themes,
  unlockedThemeIds = ['toxic'], // Free themes always unlocked
  children,
  currentThemeId,
  onThemeChange,
  colorScheme: externalColorScheme,
  onColorSchemeChange,
}: ThemeProviderProps) {
  // Use system color scheme as fallback
  const systemColorScheme = useColorScheme() ?? 'dark';
  const colorScheme = externalColorScheme ?? systemColorScheme;

  // Combine default and custom themes
  const availableThemes = useMemo(() => {
    if (themes) return themes;
    return [...defaultThemes, ...customThemes];
  }, [themes, customThemes]);

  // Get current theme
  const activeThemeId = currentThemeId ?? initialThemeId;
  const theme = useMemo(() => {
    return availableThemes.find(t => t.id === activeThemeId) ?? toxicTheme;
  }, [availableThemes, activeThemeId]);

  // Theme change handler
  const setTheme = useCallback((themeId: string) => {
    if (onThemeChange) {
      onThemeChange(themeId);
    }
  }, [onThemeChange]);

  // Check if theme is unlocked
  const isThemeUnlocked = useCallback((themeId: string) => {
    const targetTheme = availableThemes.find(t => t.id === themeId);
    if (!targetTheme) return false;
    if (targetTheme.tier === 'free') return true;
    return unlockedThemeIds.includes(themeId);
  }, [availableThemes, unlockedThemeIds]);

  // Color scheme toggle
  const toggleColorScheme = useCallback(() => {
    if (onColorSchemeChange) {
      onColorSchemeChange(colorScheme === 'dark' ? 'light' : 'dark');
    }
  }, [colorScheme, onColorSchemeChange]);

  // Context value
  const contextValue: ThemeContextValue = useMemo(() => ({
    theme,
    setTheme,
    availableThemes,
    isThemeUnlocked,
    colorScheme,
    toggleColorScheme,
  }), [theme, setTheme, availableThemes, isThemeUnlocked, colorScheme, toggleColorScheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// =============================================================================
// CONTEXT HOOK
// =============================================================================

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

// =============================================================================
// EXPORTS
// =============================================================================

export { ThemeContext };
export default ThemeProvider;
