/**
 * Theme Installation Type System
 *
 * A theme is more than colors - it's a complete sensory experience.
 * Each theme "installation" includes colors, typography, motion, audio, and haptics.
 */

import { ViewStyle, TextStyle } from 'react-native';
import { GradientConfig } from '../surfaces/gradients';

// =============================================================================
// COLOR PALETTE TYPES
// =============================================================================

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface AccentPalette {
  primary: string;
  secondary: string;
  soft: string;
  glow: string;
}

export interface ThemeColors {
  /** Background colors at different elevation levels */
  surfaces: {
    base: string;
    sunken: string;
    raised: string;
    elevated: string;
    floating: string;
    spotlight: string;
  };

  /** Text colors */
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
    accent: string;
  };

  /** Border colors */
  borders: {
    subtle: string;
    default: string;
    strong: string;
    focus: string;
  };

  /** Primary accent palette */
  accent: AccentPalette;

  /** Semantic feedback colors */
  feedback: {
    success: string;
    warning: string;
    danger: string;
    info: string;
  };

  /** Rank-specific colors (10 tiers - can be customized per theme) */
  ranks: {
    copper: string;
    bronze: string;
    iron: string;
    silver: string;
    gold: string;
    master: string;
    legendary: string;
    mythic: string;
    supreme_being: string;
    goat: string;
  };

  /** Overlay/scrim colors */
  overlays: {
    light: string;
    medium: string;
    heavy: string;
  };
}

// =============================================================================
// TYPOGRAPHY TYPES
// =============================================================================

export interface TypographyVariant {
  fontFamily?: string;
  fontSize: number;
  fontWeight: TextStyle['fontWeight'];
  lineHeight: number;
  letterSpacing: number;
}

export interface ThemeTypography {
  display: TypographyVariant;
  h1: TypographyVariant;
  h2: TypographyVariant;
  h3: TypographyVariant;
  h4: TypographyVariant;
  bodyLarge: TypographyVariant;
  body: TypographyVariant;
  bodySmall: TypographyVariant;
  label: TypographyVariant;
  caption: TypographyVariant;
  mono: TypographyVariant;
}

// =============================================================================
// MOTION TYPES
// =============================================================================

export interface SpringConfig {
  damping: number;
  stiffness: number;
  mass?: number;
}

export interface ThemeMotion {
  /** Spring presets for different interaction types */
  springs: {
    gentle: SpringConfig;
    responsive: SpringConfig;
    bouncy: SpringConfig;
    stiff: SpringConfig;
  };

  /** Duration presets in ms */
  durations: {
    instant: number;
    fast: number;
    normal: number;
    slow: number;
    dramatic: number;
  };

  /** Whether animations should be enabled (respects accessibility) */
  enabled: boolean;

  /** Reduced motion version */
  reducedMotion: boolean;
}

// =============================================================================
// AUDIO TYPES
// =============================================================================

export type SoundEffect =
  | 'tap'
  | 'success'
  | 'error'
  | 'celebration'
  | 'rankUp'
  | 'pr'
  | 'setLogged'
  | 'workoutStart'
  | 'workoutEnd';

export interface ThemeAudio {
  /** Sound effect file paths or references */
  sounds: Partial<Record<SoundEffect, string | null>>;

  /** Global volume (0-1) */
  volume: number;

  /** Whether audio is enabled */
  enabled: boolean;
}

// =============================================================================
// HAPTICS TYPES
// =============================================================================

export type HapticPattern =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

export interface ThemeHaptics {
  /** Haptic patterns for different interactions */
  patterns: Record<HapticPattern, boolean>;

  /** Whether haptics are enabled */
  enabled: boolean;
}

// =============================================================================
// GRADIENT TYPES
// =============================================================================

export interface ThemeGradients {
  /** Background screen gradients */
  backgrounds: {
    primary: GradientConfig;
    secondary?: GradientConfig;
  };

  /** Card overlay gradients */
  cards: {
    shine?: GradientConfig;
    accent?: GradientConfig;
  };

  /** Celebration/special effect gradients */
  celebrations: {
    pr?: GradientConfig;
    rankUp?: GradientConfig;
  };
}

// =============================================================================
// ILLUSTRATION TYPES
// =============================================================================

export interface ThemeIllustrations {
  /** Empty state illustrations */
  emptyStates: {
    noWorkouts?: string | React.ComponentType;
    noHistory?: string | React.ComponentType;
    noFriends?: string | React.ComponentType;
  };

  /** Decorative elements */
  decorations: {
    cardCorner?: string | React.ComponentType;
    headerAccent?: string | React.ComponentType;
  };

  /** Achievement/celebration visuals */
  achievements: {
    rankUp?: string | React.ComponentType;
    pr?: string | React.ComponentType;
    streak?: string | React.ComponentType;
  };
}

// =============================================================================
// THEME INSTALLATION (Complete Theme Package)
// =============================================================================

export interface ThemeInstallation {
  /** Unique theme identifier */
  id: string;

  /** Display name */
  name: string;

  /** Theme description */
  description?: string;

  /** Theme tier (affects availability) */
  tier: 'free' | 'premium' | 'legendary';

  /** Color system */
  colors: ThemeColors;

  /** Typography system */
  typography: ThemeTypography;

  /** Motion/animation system */
  motion: ThemeMotion;

  /** Audio feedback */
  audio: ThemeAudio;

  /** Haptic feedback */
  haptics: ThemeHaptics;

  /** Gradient definitions */
  gradients: ThemeGradients;

  /** Illustration assets */
  illustrations?: ThemeIllustrations;

  /** Additional theme-specific metadata */
  metadata?: {
    author?: string;
    version?: string;
    releaseDate?: string;
  };
}

// =============================================================================
// THEME CONTEXT TYPES
// =============================================================================

export interface ThemeContextValue {
  /** Current active theme */
  theme: ThemeInstallation;

  /** Change the current theme */
  setTheme: (themeId: string) => void;

  /** Available themes */
  availableThemes: ThemeInstallation[];

  /** Check if a theme is unlocked */
  isThemeUnlocked: (themeId: string) => boolean;

  /** Current color scheme preference */
  colorScheme: 'light' | 'dark';

  /** Toggle color scheme */
  toggleColorScheme: () => void;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Partial theme for overrides */
export type PartialTheme = Partial<ThemeInstallation>;

/** Theme color accessor */
export type ThemeColorPath = keyof ThemeColors | `${keyof ThemeColors}.${string}`;
