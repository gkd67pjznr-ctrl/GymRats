/**
 * Themes - Unified Export
 *
 * Complete theme installation system.
 */

// Types
export * from './types';

// Context and Provider
export { ThemeProvider, ThemeContext, useThemeContext } from './ThemeContext';
export type { ThemeProviderProps } from './ThemeContext';

// Hooks
export {
  useTheme,
  useThemeColors,
  useThemeTypography,
  useThemeMotion,
  useAccentColor,
  useColor,
  useRankColor,
  useIsPremiumTheme,
  useSpring,
  useDuration,
  useAnimationsEnabled,
  useHapticsEnabled,
  useAudioEnabled,
  useThemedStyle,
  useSurfaceColor,
  useTextColor,
  useFeedbackColor,
} from './useTheme';

// Default themes
export {
  toxicTheme,
  electricTheme,
  emberTheme,
  iceTheme,
  defaultThemes,
} from './default';
