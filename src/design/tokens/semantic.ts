/**
 * Semantic Design Tokens
 *
 * Purpose-based tokens that reference primitives.
 * These describe WHAT a token is used for, not what it looks like.
 *
 * Naming: Describes the purpose/intent
 */

import { colors, spacing, radius, fontSizes, fontWeights, lineHeights, letterSpacing, opacity, blur, duration } from './primitives';

// =============================================================================
// SURFACE TOKENS (Backgrounds & Containers)
// =============================================================================

export const surface = {
  // Depth levels (darkest to lightest in dark mode)
  sunken: colors.gray[975],      // Below base - input wells, inset areas
  base: colors.gray[950],        // Screen background
  raised: colors.gray[925],      // Cards, containers
  elevated: colors.gray[900],    // Modals, sheets
  floating: colors.gray[850],    // Dropdowns, popovers
  spotlight: colors.gray[800],   // Focused/highlighted elements

  // Glass variants (for blur effects)
  glass: {
    light: `rgba(255, 255, 255, 0.05)`,
    medium: `rgba(255, 255, 255, 0.08)`,
    heavy: `rgba(255, 255, 255, 0.12)`,
  },

  // Overlay
  overlay: {
    light: 'rgba(0, 0, 0, 0.4)',
    medium: 'rgba(0, 0, 0, 0.6)',
    heavy: 'rgba(0, 0, 0, 0.8)',
  },
} as const;

// =============================================================================
// TEXT TOKENS
// =============================================================================

export const text = {
  // Hierarchy
  primary: colors.gray[50],      // Main text
  secondary: colors.gray[300],   // Supporting text
  muted: colors.gray[500],       // Disabled/hint text
  inverse: colors.gray[950],     // Text on light backgrounds

  // Accent
  accent: colors.toxic.primary,  // Brand accent text

  // Semantic
  success: colors.green[400],
  warning: colors.amber[400],
  danger: colors.red[400],
  info: colors.blue[400],

  // Interactive
  link: colors.blue[400],
  linkHover: colors.blue[500],
} as const;

// =============================================================================
// BORDER TOKENS
// =============================================================================

export const border = {
  // Visibility levels
  subtle: colors.gray[850],      // Barely visible
  default: colors.gray[800],     // Normal borders
  strong: colors.gray[700],      // Emphasized borders

  // Semantic
  focus: colors.blue[500],
  success: colors.green[500],
  warning: colors.amber[500],
  danger: colors.red[500],

  // Widths
  width: {
    hairline: 0.5,
    thin: 1,
    medium: 1.5,
    thick: 2,
  },
} as const;

// =============================================================================
// FEEDBACK TOKENS (Success, Error, Warning, Info)
// =============================================================================

export const feedback = {
  success: {
    bg: `rgba(34, 197, 94, 0.1)`,
    border: colors.green[600],
    text: colors.green[400],
    icon: colors.green[500],
    glow: colors.green.glow,
  },
  warning: {
    bg: `rgba(245, 158, 11, 0.1)`,
    border: colors.amber[600],
    text: colors.amber[400],
    icon: colors.amber[500],
    glow: colors.amber.glow,
  },
  danger: {
    bg: `rgba(239, 68, 68, 0.1)`,
    border: colors.red[600],
    text: colors.red[400],
    icon: colors.red[500],
    glow: colors.red.glow,
  },
  info: {
    bg: `rgba(59, 130, 246, 0.1)`,
    border: colors.blue[600],
    text: colors.blue[400],
    icon: colors.blue[500],
    glow: colors.blue.glow,
  },
} as const;

// =============================================================================
// INTERACTIVE TOKENS
// =============================================================================

export const interactive = {
  // States
  hover: {
    opacity: 0.9,
    scale: 1.02,
  },
  pressed: {
    opacity: 0.7,
    scale: 0.98,
  },
  disabled: {
    opacity: 0.4,
  },
  focus: {
    ringColor: colors.blue[500],
    ringWidth: 2,
    ringOffset: 2,
  },
} as const;

// =============================================================================
// TYPOGRAPHY SEMANTIC TOKENS
// =============================================================================

export const typography = {
  // Display (huge headlines)
  display: {
    size: fontSizes['8xl'],
    lineHeight: lineHeights.tight,
    weight: fontWeights.black,
    tracking: letterSpacing.tighter,
  },

  // Headings
  h1: {
    size: fontSizes['5xl'],
    lineHeight: lineHeights.tight,
    weight: fontWeights.black,
    tracking: letterSpacing.tight,
  },
  h2: {
    size: fontSizes['3xl'],
    lineHeight: lineHeights.snug,
    weight: fontWeights.extrabold,
    tracking: letterSpacing.tight,
  },
  h3: {
    size: fontSizes.xl,
    lineHeight: lineHeights.snug,
    weight: fontWeights.bold,
    tracking: letterSpacing.normal,
  },
  h4: {
    size: fontSizes.lg,
    lineHeight: lineHeights.snug,
    weight: fontWeights.bold,
    tracking: letterSpacing.normal,
  },

  // Body
  bodyLarge: {
    size: fontSizes.lg,
    lineHeight: lineHeights.normal,
    weight: fontWeights.medium,
    tracking: letterSpacing.normal,
  },
  body: {
    size: fontSizes.base,
    lineHeight: lineHeights.normal,
    weight: fontWeights.normal,
    tracking: letterSpacing.normal,
  },
  bodySmall: {
    size: fontSizes.md,
    lineHeight: lineHeights.normal,
    weight: fontWeights.normal,
    tracking: letterSpacing.normal,
  },

  // UI
  label: {
    size: fontSizes.sm,
    lineHeight: lineHeights.tight,
    weight: fontWeights.semibold,
    tracking: letterSpacing.wide,
  },
  caption: {
    size: fontSizes.xs,
    lineHeight: lineHeights.tight,
    weight: fontWeights.medium,
    tracking: letterSpacing.wide,
  },

  // Special
  mono: {
    size: fontSizes.md,
    lineHeight: lineHeights.normal,
    weight: fontWeights.medium,
    tracking: letterSpacing.normal,
  },
} as const;

// =============================================================================
// SPACING SEMANTIC TOKENS
// =============================================================================

export const space = {
  // Component internal spacing
  componentXs: spacing[1],      // 4px
  componentSm: spacing[2],      // 8px
  componentMd: spacing[3],      // 12px
  componentLg: spacing[4],      // 16px
  componentXl: spacing[6],      // 24px

  // Section spacing
  sectionSm: spacing[6],        // 24px
  sectionMd: spacing[8],        // 32px
  sectionLg: spacing[12],       // 48px
  sectionXl: spacing[16],       // 64px

  // Screen padding
  screenX: spacing[4],          // 16px horizontal
  screenY: spacing[4],          // 16px vertical
  screenTop: spacing[6],        // 24px from top

  // Card padding
  cardSm: spacing[3],           // 12px
  cardMd: spacing[4],           // 16px
  cardLg: spacing[6],           // 24px

  // List item spacing
  listGap: spacing[2],          // 8px between items
  listGapLg: spacing[3],        // 12px between items
} as const;

// =============================================================================
// RADIUS SEMANTIC TOKENS
// =============================================================================

export const corners = {
  none: radius.none,
  button: radius.lg,            // 12px
  input: radius.md,             // 8px
  card: radius.xl,              // 16px
  cardLg: radius['2xl'],        // 20px
  modal: radius['3xl'],         // 24px
  pill: radius.full,            // 9999px
  avatar: radius.full,          // 9999px
  badge: radius.sm,             // 6px
} as const;

// =============================================================================
// SHADOW SEMANTIC TOKENS
// =============================================================================

export const shadow = {
  none: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: (color: string, intensity: number = 0.3) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: 20,
    elevation: 0,
  }),
} as const;

// =============================================================================
// MOTION SEMANTIC TOKENS
// =============================================================================

export const motion = {
  // Durations
  instant: duration.instant,
  fast: duration.fast,
  normal: duration.normal,
  slow: duration.slow,

  // Spring configs (for Reanimated)
  spring: {
    snappy: { damping: 20, stiffness: 300 },
    bouncy: { damping: 12, stiffness: 200 },
    gentle: { damping: 25, stiffness: 150 },
    stiff: { damping: 30, stiffness: 400 },
  },

  // Easing
  easing: {
    easeIn: [0.4, 0, 1, 1] as const,
    easeOut: [0, 0, 0.2, 1] as const,
    easeInOut: [0.4, 0, 0.2, 1] as const,
    spring: [0.175, 0.885, 0.32, 1.275] as const,
  },
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type SurfaceToken = typeof surface;
export type TextToken = typeof text;
export type BorderToken = typeof border;
export type FeedbackToken = typeof feedback;
export type InteractiveToken = typeof interactive;
export type TypographyToken = typeof typography;
export type SpaceToken = typeof space;
export type CornersToken = typeof corners;
export type ShadowToken = typeof shadow;
export type MotionToken = typeof motion;
