/**
 * Default Theme Installation
 *
 * The "Toxic" theme - GymRats' signature look.
 * Dark mode with electric lime accents.
 */

import { ThemeInstallation, ThemeColors, ThemeTypography, ThemeMotion, ThemeAudio, ThemeHaptics, ThemeGradients } from './types';
import { colors, fontSizes, fontWeights, lineHeights, letterSpacing, duration } from '../tokens/primitives';
import { surface, text, border, feedback } from '../tokens/semantic';
import { backgroundGradients, cardGradients, celebrationGradients } from '../surfaces/gradients';

// =============================================================================
// TOXIC THEME COLORS
// =============================================================================

const toxicColors: ThemeColors = {
  surfaces: {
    base: surface.base,
    sunken: surface.sunken,
    raised: surface.raised,
    elevated: surface.elevated,
    floating: surface.floating,
    spotlight: surface.spotlight,
  },

  text: {
    primary: text.primary,
    secondary: text.secondary,
    muted: text.muted,
    inverse: text.inverse,
    accent: colors.toxic.primary,
  },

  borders: {
    subtle: border.subtle,
    default: border.default,
    strong: border.strong,
    focus: colors.blue[500],
  },

  accent: {
    primary: colors.toxic.primary,
    secondary: colors.toxic.secondary,
    soft: colors.toxic.soft,
    glow: colors.toxic.glow,
  },

  feedback: {
    success: colors.green[500],
    warning: colors.amber[500],
    danger: colors.red[500],
    info: colors.blue[500],
  },

  ranks: {
    iron: colors.rank.iron,
    bronze: colors.rank.bronze,
    silver: colors.rank.silver,
    gold: colors.rank.gold,
    platinum: colors.rank.platinum,
    diamond: colors.rank.diamond,
    mythic: colors.rank.mythic,
  },

  overlays: {
    light: surface.overlay.light,
    medium: surface.overlay.medium,
    heavy: surface.overlay.heavy,
  },
};

// =============================================================================
// TOXIC THEME TYPOGRAPHY
// =============================================================================

const toxicTypography: ThemeTypography = {
  display: {
    fontSize: fontSizes['8xl'], // 40
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  h1: {
    fontSize: fontSizes['5xl'], // 28
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSizes['4xl'], // 24
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  },
  h3: {
    fontSize: fontSizes['3xl'], // 20
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontSize: fontSizes['2xl'], // 18
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodyLarge: {
    fontSize: fontSizes.lg, // 15
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontSize: fontSizes.base, // 14
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontSize: fontSizes.sm, // 12
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  label: {
    fontSize: fontSizes.sm, // 12
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacing.wide,
  },
  caption: {
    fontSize: fontSizes.xs, // 11
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: fontSizes.base, // 14
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
};

// =============================================================================
// TOXIC THEME MOTION
// =============================================================================

const toxicMotion: ThemeMotion = {
  springs: {
    gentle: { damping: 20, stiffness: 100 },
    responsive: { damping: 15, stiffness: 200 },
    bouncy: { damping: 10, stiffness: 250 },
    stiff: { damping: 25, stiffness: 400 },
  },
  durations: {
    instant: duration.instant,
    fast: duration.fast,
    normal: duration.normal,
    slow: duration.slow,
    dramatic: duration.dramatic,
  },
  enabled: true,
  reducedMotion: false,
};

// =============================================================================
// TOXIC THEME AUDIO
// =============================================================================

const toxicAudio: ThemeAudio = {
  sounds: {
    tap: null, // Path to sound file when implemented
    success: null,
    error: null,
    celebration: null,
    rankUp: null,
    pr: null,
    setLogged: null,
    workoutStart: null,
    workoutEnd: null,
  },
  volume: 0.7,
  enabled: true,
};

// =============================================================================
// TOXIC THEME HAPTICS
// =============================================================================

const toxicHaptics: ThemeHaptics = {
  patterns: {
    light: true,
    medium: true,
    heavy: true,
    success: true,
    warning: true,
    error: true,
    selection: true,
  },
  enabled: true,
};

// =============================================================================
// TOXIC THEME GRADIENTS
// =============================================================================

const toxicGradients: ThemeGradients = {
  backgrounds: {
    primary: backgroundGradients.screenDepth,
    secondary: backgroundGradients.topGlow,
  },
  cards: {
    shine: cardGradients.shine,
    accent: cardGradients.accentTint,
  },
  celebrations: {
    pr: celebrationGradients.prCelebration,
    rankUp: celebrationGradients.rankUp,
  },
};

// =============================================================================
// TOXIC THEME INSTALLATION (COMPLETE)
// =============================================================================

export const toxicTheme: ThemeInstallation = {
  id: 'toxic',
  name: 'Toxic',
  description: 'Electric lime accents on deep black. The signature GymRats look.',
  tier: 'free',

  colors: toxicColors,
  typography: toxicTypography,
  motion: toxicMotion,
  audio: toxicAudio,
  haptics: toxicHaptics,
  gradients: toxicGradients,

  metadata: {
    author: 'GymRats',
    version: '1.0.0',
  },
};

// =============================================================================
// ELECTRIC THEME (Purple/Cyan variant)
// =============================================================================

export const electricTheme: ThemeInstallation = {
  ...toxicTheme,
  id: 'electric',
  name: 'Electric',
  description: 'Purple to cyan gradients. Cyberpunk energy.',
  tier: 'premium',

  colors: {
    ...toxicColors,
    accent: {
      primary: colors.electric.primary,
      secondary: colors.electric.secondary,
      soft: `${colors.electric.primary}15`,
      glow: `${colors.electric.primary}30`,
    },
    text: {
      ...toxicColors.text,
      accent: colors.electric.primary,
    },
  },
};

// =============================================================================
// EMBER THEME (Pink/Orange variant)
// =============================================================================

export const emberTheme: ThemeInstallation = {
  ...toxicTheme,
  id: 'ember',
  name: 'Ember',
  description: 'Warm pink and orange. Passionate intensity.',
  tier: 'premium',

  colors: {
    ...toxicColors,
    accent: {
      primary: colors.ember.primary,
      secondary: colors.ember.secondary,
      soft: `${colors.ember.primary}15`,
      glow: `${colors.ember.primary}30`,
    },
    text: {
      ...toxicColors.text,
      accent: colors.ember.primary,
    },
  },
};

// =============================================================================
// ICE THEME (Teal/Cyan variant)
// =============================================================================

export const iceTheme: ThemeInstallation = {
  ...toxicTheme,
  id: 'ice',
  name: 'Ice',
  description: 'Cool teal and cyan. Crisp and focused.',
  tier: 'premium',

  colors: {
    ...toxicColors,
    accent: {
      primary: colors.ice.primary,
      secondary: colors.ice.secondary,
      soft: `${colors.ice.primary}15`,
      glow: `${colors.ice.primary}30`,
    },
    text: {
      ...toxicColors.text,
      accent: colors.ice.primary,
    },
  },
};

// =============================================================================
// ALL DEFAULT THEMES
// =============================================================================

export const defaultThemes: ThemeInstallation[] = [
  toxicTheme,
  electricTheme,
  emberTheme,
  iceTheme,
];

export default toxicTheme;
