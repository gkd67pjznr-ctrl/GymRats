// src/ui/theme/ThemeProvider.tsx
/**
 * Forgerank Theme Provider
 *
 * React context provider for theme management.
 * Implements the layered approach: PURE's emotional personality over LIFTOFF's functional efficiency.
 *
 * For complete visual style documentation, see docs/visual-style/
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useThemeStore, useActivePalette, useActiveTypography, useActiveIllustration } from '../../lib/stores/themeStore';
import type { ThemePalette, ThemeTypography, ThemeIllustration } from '../../lib/themeDatabase';

interface ThemeContextType {
  palette: ThemePalette | null;
  typography: ThemeTypography | null;
  illustration: ThemeIllustration | null;
  setActiveTheme: (configId: string) => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const palette = useActivePalette();
  const typography = useActiveTypography();
  const illustration = useActiveIllustration();
  const isLoaded = useThemeStore(state => state.isThemeLoaded);
  const setActiveTheme = useThemeStore(state => state.setActiveTheme);

  const contextValue = useMemo(() => ({
    palette,
    typography,
    illustration,
    setActiveTheme,
    isLoaded,
  }), [palette, typography, illustration, setActiveTheme, isLoaded]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;