/**
 * Surface Elevation System
 *
 * Defines the visual depth hierarchy of the app.
 * Higher elevation = closer to the user = lighter in dark mode.
 */

import { ViewStyle, Platform } from 'react-native';
import { colors } from '../tokens/primitives';
import { surface, shadow, corners, border } from '../tokens/semantic';

// =============================================================================
// ELEVATION LEVELS
// =============================================================================

export type ElevationLevel = 'sunken' | 'base' | 'raised' | 'elevated' | 'floating' | 'spotlight';

export const elevationLevels: Record<ElevationLevel, number> = {
  sunken: -1,
  base: 0,
  raised: 1,
  elevated: 2,
  floating: 3,
  spotlight: 4,
};

// =============================================================================
// SURFACE STYLES
// =============================================================================

export type SurfaceVariant = 'solid' | 'glass' | 'gradient';

interface SurfaceConfig {
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
  shadow?: ViewStyle;
}

/**
 * Get surface styles for a given elevation level and variant
 */
export function getSurfaceStyle(
  elevation: ElevationLevel,
  variant: SurfaceVariant = 'solid'
): SurfaceConfig {
  const baseColors: Record<ElevationLevel, string> = {
    sunken: surface.sunken,
    base: surface.base,
    raised: surface.raised,
    elevated: surface.elevated,
    floating: surface.floating,
    spotlight: surface.spotlight,
  };

  const shadows: Record<ElevationLevel, ViewStyle> = {
    sunken: shadow.none,
    base: shadow.none,
    raised: shadow.sm,
    elevated: shadow.md,
    floating: shadow.lg,
    spotlight: shadow.xl,
  };

  const borders: Record<ElevationLevel, string | undefined> = {
    sunken: border.subtle,
    base: undefined,
    raised: border.subtle,
    elevated: border.default,
    floating: border.default,
    spotlight: border.strong,
  };

  if (variant === 'solid') {
    return {
      backgroundColor: baseColors[elevation],
      borderColor: borders[elevation],
      borderWidth: borders[elevation] ? border.width.thin : 0,
      shadow: shadows[elevation],
    };
  }

  if (variant === 'glass') {
    const glassOpacity: Record<ElevationLevel, string> = {
      sunken: surface.glass.light,
      base: surface.glass.light,
      raised: surface.glass.medium,
      elevated: surface.glass.medium,
      floating: surface.glass.heavy,
      spotlight: surface.glass.heavy,
    };

    return {
      backgroundColor: glassOpacity[elevation],
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: border.width.thin,
      shadow: shadows[elevation],
    };
  }

  // Gradient variant returns base color (gradient applied separately)
  return {
    backgroundColor: baseColors[elevation],
    borderColor: borders[elevation],
    borderWidth: borders[elevation] ? border.width.thin : 0,
    shadow: shadows[elevation],
  };
}

// =============================================================================
// ELEVATION PRESETS (Ready-to-use styles)
// =============================================================================

export const elevationStyles = {
  // Screen background
  screen: {
    backgroundColor: surface.base,
  } as ViewStyle,

  // Standard card
  card: {
    backgroundColor: surface.raised,
    borderColor: border.subtle,
    borderWidth: border.width.thin,
    borderRadius: corners.card,
    ...shadow.sm,
  } as ViewStyle,

  // Elevated card (more prominent)
  cardElevated: {
    backgroundColor: surface.elevated,
    borderColor: border.default,
    borderWidth: border.width.thin,
    borderRadius: corners.cardLg,
    ...shadow.md,
  } as ViewStyle,

  // Modal/sheet
  modal: {
    backgroundColor: surface.elevated,
    borderColor: border.subtle,
    borderWidth: border.width.thin,
    borderRadius: corners.modal,
    ...shadow.xl,
  } as ViewStyle,

  // Floating element (dropdown, tooltip)
  floating: {
    backgroundColor: surface.floating,
    borderColor: border.default,
    borderWidth: border.width.thin,
    borderRadius: corners.card,
    ...shadow.lg,
  } as ViewStyle,

  // Sunken/inset area
  inset: {
    backgroundColor: surface.sunken,
    borderColor: border.subtle,
    borderWidth: border.width.thin,
    borderRadius: corners.input,
  } as ViewStyle,

  // Glass panel (requires BlurView wrapper)
  glass: {
    backgroundColor: surface.glass.medium,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: border.width.thin,
    borderRadius: corners.card,
    overflow: 'hidden' as const,
  } as ViewStyle,

  // Spotlight/focused element
  spotlight: {
    backgroundColor: surface.spotlight,
    borderColor: border.strong,
    borderWidth: border.width.thin,
    borderRadius: corners.card,
    ...shadow.xl,
  } as ViewStyle,
} as const;

// =============================================================================
// GLOW EFFECTS
// =============================================================================

export type GlowColor = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'custom';

interface GlowConfig {
  color: string;
  intensity?: number;
  radius?: number;
}

/**
 * Generate glow effect styles
 */
export function getGlowStyle(config: GlowConfig): ViewStyle {
  const { color, intensity = 0.3, radius = 20 } = config;

  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: radius,
    // Android doesn't support colored shadows well, use elevation instead
    ...(Platform.OS === 'android' && { elevation: Math.min(radius / 2, 12) }),
  };
}

export const glowPresets = {
  accent: getGlowStyle({ color: colors.toxic.primary, intensity: 0.25 }),
  accentStrong: getGlowStyle({ color: colors.toxic.primary, intensity: 0.4, radius: 30 }),
  success: getGlowStyle({ color: colors.green[500], intensity: 0.25 }),
  warning: getGlowStyle({ color: colors.amber[500], intensity: 0.25 }),
  danger: getGlowStyle({ color: colors.red[500], intensity: 0.25 }),
  info: getGlowStyle({ color: colors.blue[500], intensity: 0.25 }),
  gold: getGlowStyle({ color: colors.rank.gold, intensity: 0.3 }),
  mythic: getGlowStyle({ color: colors.rank.mythic, intensity: 0.35 }),
} as const;

// =============================================================================
// OVERLAY STYLES
// =============================================================================

export const overlayStyles = {
  light: {
    backgroundColor: surface.overlay.light,
  } as ViewStyle,

  medium: {
    backgroundColor: surface.overlay.medium,
  } as ViewStyle,

  heavy: {
    backgroundColor: surface.overlay.heavy,
  } as ViewStyle,

  // For bottom sheets that dim the background
  sheet: {
    backgroundColor: surface.overlay.medium,
  } as ViewStyle,

  // For full-screen modals
  modal: {
    backgroundColor: surface.overlay.heavy,
  } as ViewStyle,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ElevationStyleKey = keyof typeof elevationStyles;
export type GlowPresetKey = keyof typeof glowPresets;
export type OverlayStyleKey = keyof typeof overlayStyles;
