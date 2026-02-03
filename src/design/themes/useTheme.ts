/**
 * useTheme Hook
 *
 * Primary hook for consuming theme values in components.
 * Provides convenient accessors for colors, typography, motion, etc.
 */

import { useMemo } from 'react';
import { useThemeContext } from './ThemeContext';
import { ThemeInstallation, ThemeColors, ThemeTypography, ThemeMotion } from './types';

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useTheme() {
  const context = useThemeContext();
  return context;
}

// =============================================================================
// SPECIALIZED HOOKS
// =============================================================================

/**
 * Access just the color palette
 */
export function useThemeColors(): ThemeColors {
  const { theme } = useThemeContext();
  return theme.colors;
}

/**
 * Access just the typography system
 */
export function useThemeTypography(): ThemeTypography {
  const { theme } = useThemeContext();
  return theme.typography;
}

/**
 * Access just the motion system
 */
export function useThemeMotion(): ThemeMotion {
  const { theme } = useThemeContext();
  return theme.motion;
}

/**
 * Get the current accent color
 */
export function useAccentColor(): string {
  const { theme } = useThemeContext();
  return theme.colors.accent.primary;
}

/**
 * Get a color by path (e.g., 'surfaces.raised', 'text.primary')
 */
export function useColor(path: string): string {
  const { theme } = useThemeContext();

  return useMemo(() => {
    const parts = path.split('.');
    let value: unknown = theme.colors;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        console.warn(`Invalid color path: ${path}`);
        return '#FF00FF'; // Magenta for debugging
      }
    }

    return typeof value === 'string' ? value : '#FF00FF';
  }, [theme.colors, path]);
}

/**
 * Get rank-specific color
 */
export function useRankColor(rank: keyof ThemeColors['ranks']): string {
  const { theme } = useThemeContext();
  return theme.colors.ranks[rank];
}

/**
 * Check if current theme is premium
 */
export function useIsPremiumTheme(): boolean {
  const { theme } = useThemeContext();
  return theme.tier === 'premium' || theme.tier === 'legendary';
}

/**
 * Get spring config for animations
 */
export function useSpring(type: keyof ThemeMotion['springs']) {
  const { theme } = useThemeContext();
  return theme.motion.springs[type];
}

/**
 * Get animation duration
 */
export function useDuration(type: keyof ThemeMotion['durations']): number {
  const { theme } = useThemeContext();
  return theme.motion.durations[type];
}

/**
 * Check if animations are enabled
 */
export function useAnimationsEnabled(): boolean {
  const { theme } = useThemeContext();
  return theme.motion.enabled && !theme.motion.reducedMotion;
}

/**
 * Check if haptics are enabled
 */
export function useHapticsEnabled(): boolean {
  const { theme } = useThemeContext();
  return theme.haptics.enabled;
}

/**
 * Check if audio is enabled
 */
export function useAudioEnabled(): boolean {
  const { theme } = useThemeContext();
  return theme.audio.enabled;
}

// =============================================================================
// STYLE BUILDER HOOKS
// =============================================================================

/**
 * Build a style object with theme colors
 */
export function useThemedStyle<T extends Record<string, unknown>>(
  builder: (colors: ThemeColors) => T
): T {
  const colors = useThemeColors();
  return useMemo(() => builder(colors), [colors, builder]);
}

/**
 * Get surface color by elevation
 */
export function useSurfaceColor(
  elevation: keyof ThemeColors['surfaces']
): string {
  const { theme } = useThemeContext();
  return theme.colors.surfaces[elevation];
}

/**
 * Get text color by variant
 */
export function useTextColor(
  variant: keyof ThemeColors['text']
): string {
  const { theme } = useThemeContext();
  return theme.colors.text[variant];
}

/**
 * Get feedback color
 */
export function useFeedbackColor(
  type: keyof ThemeColors['feedback']
): string {
  const { theme } = useThemeContext();
  return theme.colors.feedback[type];
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default useTheme;
