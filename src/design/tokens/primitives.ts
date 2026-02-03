/**
 * Primitive Design Tokens
 *
 * Raw values that form the foundation of the design system.
 * These should NEVER be used directly in components - use semantic tokens instead.
 *
 * Naming: Descriptive of the value, not the usage
 */

// =============================================================================
// COLOR PRIMITIVES
// =============================================================================

export const colors = {
  // Neutral scale (dark mode optimized)
  gray: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    850: '#1F1F23',
    900: '#18181B',
    925: '#141417',
    950: '#0A0A0D',
    975: '#050508',
  },

  // Brand colors
  forge: {
    lime: '#A6FF00',
    cyan: '#00FFB3',
    limeDark: '#203018',
  },

  // Accent palettes
  toxic: {
    primary: '#A6FF00',
    secondary: '#00FFB3',
    soft: '#203018',
    glow: 'rgba(166, 255, 0, 0.15)',
  },

  electric: {
    primary: '#6D5BFF',
    secondary: '#00D5FF',
    soft: '#1C1B2C',
    glow: 'rgba(109, 91, 255, 0.15)',
  },

  ember: {
    primary: '#FF3D7F',
    secondary: '#FF9F0A',
    soft: '#2B1520',
    glow: 'rgba(255, 61, 127, 0.15)',
  },

  ice: {
    primary: '#00F5D4',
    secondary: '#7DF9FF',
    soft: '#142528',
    glow: 'rgba(0, 245, 212, 0.15)',
  },

  ultra: {
    primary: '#B8FF5A',
    secondary: '#FF4DFF',
    soft: '#22162B',
    glow: 'rgba(184, 255, 90, 0.15)',
  },

  // Semantic raw colors
  green: {
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    glow: 'rgba(34, 197, 94, 0.2)',
  },

  red: {
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    glow: 'rgba(239, 68, 68, 0.2)',
  },

  amber: {
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    glow: 'rgba(245, 158, 11, 0.2)',
  },

  blue: {
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    glow: 'rgba(59, 130, 246, 0.2)',
  },

  // Rank colors (these are semantic but kept here for reference)
  rank: {
    iron: '#7B7E8A',
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#64E6C2',
    diamond: '#B9F2FF',
    mythic: '#FF4DFF',
  },

  // Pure colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// =============================================================================
// SPACING PRIMITIVES
// =============================================================================

export const spacing = {
  // Numeric scale
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,

  // Named aliases (semantic convenience)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  24: 96,
} as const;

// =============================================================================
// RADIUS PRIMITIVES
// =============================================================================

export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 9999,
} as const;

// =============================================================================
// TYPOGRAPHY PRIMITIVES
// =============================================================================

export const fontSizes = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  '2xl': 18,
  '3xl': 20,
  '4xl': 24,
  '5xl': 28,
  '6xl': 32,
  '7xl': 36,
  '8xl': 40,
} as const;

export const lineHeights = {
  none: 1,
  tight: 1.15,
  snug: 1.25,
  normal: 1.35,
  relaxed: 1.5,
  loose: 1.75,
} as const;

export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
} as const;

export const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.2,
  wider: 0.4,
} as const;

// =============================================================================
// OPACITY PRIMITIVES
// =============================================================================

export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  15: 0.15,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
} as const;

// =============================================================================
// BLUR PRIMITIVES
// =============================================================================

export const blur = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 40,
} as const;

// =============================================================================
// DURATION PRIMITIVES (ms)
// =============================================================================

export const duration = {
  instant: 0,
  fastest: 50,
  faster: 100,
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 400,
  slowest: 500,
  deliberate: 700,
  dramatic: 1000,
} as const;

// =============================================================================
// Z-INDEX PRIMITIVES
// =============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
  tooltip: 700,
  max: 9999,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ColorPrimitive = typeof colors;
export type SpacingPrimitive = typeof spacing;
export type RadiusPrimitive = typeof radius;
export type FontSizePrimitive = typeof fontSizes;
export type FontWeightPrimitive = typeof fontWeights;
export type OpacityPrimitive = typeof opacity;
export type BlurPrimitive = typeof blur;
export type DurationPrimitive = typeof duration;
export type ZIndexPrimitive = typeof zIndex;
