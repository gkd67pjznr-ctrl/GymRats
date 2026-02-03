// src/ui/GrStyle.ts
import type { TextStyle, ViewStyle } from "react-native";

/**
 * GymRats Visual Style System
 *
 * Single source of truth for the GymRats aesthetic.
 * Based on docs/visual-style/visual-style-guide.md
 *
 * Design Philosophy:
 * - Layered approach: Emotional personality over functional efficiency
 * - Dark foundation with vibrant accent colors
 * - Bold typography with clear hierarchy
 * - 8px base grid system
 *
 * NOTE: React Native only supports fontWeight up to "900".
 */

// =============================================================================
// Spacing Scale (8px base unit)
// =============================================================================

export const space = {
  /** 4px - Extra extra small */
  xxs: 4,
  /** 8px - Extra small (base unit) */
  xs: 8,
  /** 16px - Small */
  s: 16,
  /** 24px - Medium */
  m: 24,
  /** 32px - Large */
  l: 32,
  /** 48px - Extra large */
  xl: 48,
  /** 64px - Extra extra large */
  xxl: 64,
} as const;

// =============================================================================
// Border Radii
// =============================================================================

export const radius = {
  /** 0px - Sharp corners */
  sharp: 0,
  /** 4px - Soft corners */
  soft: 4,
  /** 8px - Rounded corners */
  rounded: 8,
  /** 9999px - Pill shape */
  pill: 9999,
} as const;

// =============================================================================
// Typography Scale
// =============================================================================

export const type = {
  /** 32px Bold - Display Large */
  displayLarge: {
    fontSize: 32,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
  /** 24px Bold - Display Medium */
  displayMedium: {
    fontSize: 24,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
  /** 20px Bold - Display Small */
  displaySmall: {
    fontSize: 20,
    fontWeight: "700" as const,
    letterSpacing: 0.15,
  },
  /** 18px Semi-Bold - Headline */
  headline: {
    fontSize: 18,
    fontWeight: "600" as const,
    letterSpacing: 0.15,
  },
  /** 16px Regular - Body Large */
  bodyLarge: {
    fontSize: 16,
    fontWeight: "400" as const,
    letterSpacing: 0.1,
  },
  /** 14px Regular - Body Medium */
  bodyMedium: {
    fontSize: 14,
    fontWeight: "400" as const,
    letterSpacing: 0.1,
  },
  /** 12px Regular - Body Small */
  bodySmall: {
    fontSize: 12,
    fontWeight: "400" as const,
    letterSpacing: 0.1,
  },
  /** 10px Light - Caption */
  caption: {
    fontSize: 10,
    fontWeight: "300" as const,
    letterSpacing: 0.2,
  },
  /** Monospace for data/metrics */
  mono: {
    fontSize: 14,
    fontWeight: "500" as const,
    letterSpacing: 0.5,
    fontFamily: undefined, // Will use system monospace
  },
} satisfies Record<string, TextStyle>;

// =============================================================================
// Opacity Levels
// =============================================================================

export const opacity = {
  /** 40% - Disabled state */
  disabled: 0.4,
  /** 60% - Overlay */
  overlay: 0.6,
  /** 80% - Hover/pressed state */
  hover: 0.8,
  /** 100% - Focus/active state */
  focus: 1.0,
} as const;

// =============================================================================
// Animation Timing
// =============================================================================

export const timing = {
  /** 150ms - Micro-interactions */
  quick: 150,
  /** 300ms - Transitions */
  moderate: 300,
  /** 500ms - Celebratory moments */
  slow: 500,
} as const;

// =============================================================================
// Component Spacing Guidelines
// =============================================================================

export const component = {
  /** Button minimum height */
  buttonMinHeight: 48,
  /** Button horizontal padding */
  buttonPaddingH: 24,
  /** Card padding */
  cardPadding: 16,
  /** Card gap (between cards) */
  cardGap: 24,
  /** Form field minimum height */
  formFieldMinHeight: 48,
  /** Form field vertical spacing */
  formFieldGap: 16,
  /** Main navigation height */
  navHeight: 48,
  /** Secondary navigation height */
  navSecondaryHeight: 32,
} as const;

// =============================================================================
// Legacy FR Object (backward compatibility)
// =============================================================================

/**
 * @deprecated Use individual exports (space, radius, type) instead.
 * Kept for backward compatibility with existing components.
 */
export const FR = {
  // Legacy spacing (mapped to new scale)
  space: {
    x1: space.xxs,    // 4px
    x2: space.xs,     // 8px
    x3: space.xs + space.xxs, // 12px (compromise)
    x4: space.s,      // 16px
    x5: space.s + space.xxs,  // 20px (compromise)
    x6: space.m,      // 24px
  },

  // Legacy radii (mapped to new scale)
  radius: {
    card: space.s,        // 16px - use rounded + xs
    pill: radius.pill,    // 9999px
    soft: radius.soft,    // 4px
    input: radius.rounded, // 8px
    button: radius.rounded, // 8px
    sm: radius.soft,      // 4px
  },

  // Legacy typography (mapped to new scale)
  type: {
    h1: type.displayMedium,  // 24px Bold
    h2: type.headline,       // 18px Semi-Bold
    h3: type.bodyLarge,      // 16px Regular
    body: type.bodyMedium,   // 14px Regular
    sub: { ...type.bodySmall, opacity: opacity.hover }, // 12px with opacity
    mono: type.mono,         // 14px Mono
  } satisfies Record<string, TextStyle>,

  // Component recipes (colors come from useThemeColors)
  card(c: { card: string; border: string }): ViewStyle {
    return {
      backgroundColor: c.card,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: space.s,
      padding: space.s,
    };
  },

  pillButton(c: { card: string; border: string }): ViewStyle {
    return {
      backgroundColor: c.card,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: radius.pill,
      paddingVertical: space.xs + space.xxs, // 12px
      paddingHorizontal: space.s,
      alignItems: "center",
      justifyContent: "center",
    };
  },
};

// =============================================================================
// Type Exports
// =============================================================================

export type Space = typeof space;
export type Radius = typeof radius;
export type Type = typeof type;
export type Opacity = typeof opacity;
export type Timing = typeof timing;
export type Component = typeof component;
