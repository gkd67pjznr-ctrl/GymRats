/**
 * GymRats Theme System - Compatibility Layer
 *
 * @deprecated Use the new design system directly: import { useThemeColors, colors, surface } from '@/src/design';
 *
 * This file maintains backwards compatibility with existing code while redirecting
 * to the new design system under the hood.
 */

import { useColorScheme } from "react-native";
import { surface, text, border, corners } from "../design/tokens/semantic";
import { colors as primitiveColors } from "../design/tokens/primitives";

// =============================================================================
// LEGACY INTERFACE (maintained for compatibility)
// =============================================================================

export interface ThemeColors {
  bg: string;
  card: string;
  card2: string;
  border: string;
  text: string;
  textSecondary: string;
  muted: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  warn: string;
  danger: string;
  error: string;
  accent: string;
  info: string;
}

export interface ThemeRadius {
  card: number;
  pill: number;
  soft: number;
  button: number;
  input: number;
}

// =============================================================================
// LEGACY COLORS (now powered by new design system)
// =============================================================================

const darkColors: ThemeColors = {
  bg: surface.base,
  card: surface.raised,
  card2: surface.elevated,
  border: border.default,
  text: text.primary,
  textSecondary: text.secondary,
  muted: text.muted,
  primary: primitiveColors.toxic.primary,
  secondary: primitiveColors.electric.primary,
  success: text.success,
  warning: text.warning,
  warn: text.warning,
  danger: text.danger,
  error: text.danger,
  accent: primitiveColors.toxic.primary,
  info: text.info,
};

// Light mode - still supported but app is dark-mode focused
const lightColors: ThemeColors = {
  bg: "#ffffff",
  card: "#f9fafb",
  card2: "#f3f4f6",
  border: "#e5e7eb",
  text: "#111827",
  textSecondary: "#374151",
  muted: "#6b7280",
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  warn: "#f59e0b",
  danger: "#ef4444",
  error: "#ef4444",
  accent: "#3b82f6",
  info: "#3b82f6",
};

// =============================================================================
// LEGACY RADIUS (now powered by new design system)
// =============================================================================

const radius: ThemeRadius = {
  card: corners.card,
  pill: corners.pill,
  soft: 8,
  button: corners.button,
  input: corners.input,
};

// =============================================================================
// LEGACY HOOKS (maintained for compatibility)
// =============================================================================

/**
 * @deprecated Use useThemeColors from '@/src/design' instead
 */
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  // Always return dark colors in this app (dark-mode focused)
  return scheme === "light" ? lightColors : darkColors;
}

/**
 * @deprecated Use useTheme from '@/src/design/themes' instead
 * Legacy hook for theme store compatibility
 */
export function useTheme() {
  // Return a minimal interface for backwards compatibility
  // The actual theme data comes from the new design system
  return {
    palette: {
      id: 'toxic-energy',
      name: 'Toxic Energy',
      colors: {
        background: surface.base,
        card: surface.raised,
        text: text.primary,
        muted: text.muted,
        border: border.default,
        accent: primitiveColors.toxic.primary,
        accent2: primitiveColors.toxic.secondary,
        soft: primitiveColors.toxic.soft,
        success: text.success,
        warning: text.warning,
        danger: text.danger,
        info: text.info,
      },
    },
    typography: null,
    isLoaded: true,
  };
}

/**
 * @deprecated Use corners from '@/src/design' instead
 */
export function useThemeRadius(): ThemeRadius {
  return radius;
}

// =============================================================================
// LEGACY EXPORTS (maintained for compatibility)
// =============================================================================

/**
 * @deprecated Use the new design system directly
 */
export const theme = {
  light: lightColors,
  dark: darkColors,
  radius,
};

// =============================================================================
// NEW DESIGN SYSTEM RE-EXPORTS
// =============================================================================

// Re-export new design system for gradual migration
export {
  surface,
  text as textColors,
  border as borderColors,
  corners,
} from "../design/tokens/semantic";

export { colors } from "../design/tokens/primitives";
