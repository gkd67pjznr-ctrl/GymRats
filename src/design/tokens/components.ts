/**
 * Component Design Tokens
 *
 * Tokens specific to individual components.
 * These reference semantic tokens and provide component-level customization.
 */

import { colors } from './primitives';
import { surface, text, border, corners, shadow, space, typography, feedback, interactive } from './semantic';

// =============================================================================
// BUTTON TOKENS
// =============================================================================

export const button = {
  // Sizes
  sizes: {
    sm: {
      height: 32,
      paddingX: space.componentMd,
      fontSize: typography.label.size,
      iconSize: 16,
      radius: corners.button,
    },
    md: {
      height: 44,
      paddingX: space.componentLg,
      fontSize: typography.body.size,
      iconSize: 20,
      radius: corners.button,
    },
    lg: {
      height: 52,
      paddingX: space.componentXl,
      fontSize: typography.bodyLarge.size,
      iconSize: 24,
      radius: corners.button,
    },
  },

  // Variants
  variants: {
    primary: {
      bg: colors.toxic.primary,
      text: colors.gray[950],
      border: colors.transparent,
      shadow: shadow.md,
    },
    secondary: {
      bg: surface.raised,
      text: text.primary,
      border: border.default,
      shadow: shadow.sm,
    },
    ghost: {
      bg: colors.transparent,
      text: text.primary,
      border: colors.transparent,
      shadow: shadow.none,
    },
    danger: {
      bg: colors.red[500],
      text: colors.white,
      border: colors.transparent,
      shadow: shadow.md,
    },
    success: {
      bg: colors.green[500],
      text: colors.white,
      border: colors.transparent,
      shadow: shadow.md,
    },
  },

  // States
  states: {
    hover: interactive.hover,
    pressed: interactive.pressed,
    disabled: interactive.disabled,
    focus: interactive.focus,
  },
} as const;

// =============================================================================
// CARD TOKENS
// =============================================================================

export const card = {
  // Variants
  variants: {
    default: {
      bg: surface.raised,
      border: border.subtle,
      borderWidth: border.width.thin,
      shadow: shadow.sm,
    },
    elevated: {
      bg: surface.elevated,
      border: border.default,
      borderWidth: border.width.thin,
      shadow: shadow.md,
    },
    glass: {
      bg: surface.glass.medium,
      border: `rgba(255, 255, 255, 0.1)`,
      borderWidth: border.width.thin,
      shadow: shadow.lg,
      blur: 20,
    },
    accent: {
      bg: colors.toxic.soft,
      border: `rgba(166, 255, 0, 0.3)`,
      borderWidth: border.width.thin,
      shadow: shadow.glow(colors.toxic.primary, 0.1),
    },
    interactive: {
      bg: surface.raised,
      border: border.subtle,
      borderWidth: border.width.thin,
      shadow: shadow.sm,
      pressedBg: surface.sunken,
    },
  },

  // Sizes (padding)
  sizes: {
    sm: {
      padding: space.cardSm,
      radius: corners.card,
    },
    md: {
      padding: space.cardMd,
      radius: corners.card,
    },
    lg: {
      padding: space.cardLg,
      radius: corners.cardLg,
    },
  },
} as const;

// =============================================================================
// INPUT TOKENS
// =============================================================================

export const input = {
  // Base styles
  base: {
    bg: surface.sunken,
    border: border.default,
    borderWidth: border.width.thin,
    radius: corners.input,
    text: text.primary,
    placeholder: text.muted,
    height: 48,
    paddingX: space.componentMd,
  },

  // States
  states: {
    focus: {
      border: border.focus,
      shadow: shadow.glow(colors.blue[500], 0.2),
    },
    error: {
      border: border.danger,
      shadow: shadow.glow(colors.red[500], 0.1),
    },
    success: {
      border: border.success,
    },
    disabled: {
      opacity: interactive.disabled.opacity,
      bg: surface.sunken,
    },
  },

  // Sizes
  sizes: {
    sm: { height: 36, fontSize: typography.bodySmall.size },
    md: { height: 44, fontSize: typography.body.size },
    lg: { height: 52, fontSize: typography.bodyLarge.size },
  },
} as const;

// =============================================================================
// BADGE TOKENS
// =============================================================================

export const badge = {
  // Base
  base: {
    paddingX: space.componentSm,
    paddingY: space.componentXs,
    radius: corners.badge,
    fontSize: typography.caption.size,
    fontWeight: typography.label.weight,
  },

  // Variants
  variants: {
    default: {
      bg: surface.elevated,
      text: text.secondary,
      border: border.subtle,
    },
    primary: {
      bg: `rgba(166, 255, 0, 0.15)`,
      text: colors.toxic.primary,
      border: colors.transparent,
    },
    success: {
      bg: feedback.success.bg,
      text: feedback.success.text,
      border: colors.transparent,
    },
    warning: {
      bg: feedback.warning.bg,
      text: feedback.warning.text,
      border: colors.transparent,
    },
    danger: {
      bg: feedback.danger.bg,
      text: feedback.danger.text,
      border: colors.transparent,
    },
    // Rank badges
    iron: {
      bg: `rgba(123, 126, 138, 0.15)`,
      text: colors.rank.iron,
      border: colors.transparent,
    },
    bronze: {
      bg: `rgba(205, 127, 50, 0.15)`,
      text: colors.rank.bronze,
      border: colors.transparent,
    },
    silver: {
      bg: `rgba(192, 192, 192, 0.15)`,
      text: colors.rank.silver,
      border: colors.transparent,
    },
    gold: {
      bg: `rgba(255, 215, 0, 0.15)`,
      text: colors.rank.gold,
      border: colors.transparent,
    },
    platinum: {
      bg: `rgba(100, 230, 194, 0.15)`,
      text: colors.rank.platinum,
      border: colors.transparent,
    },
    diamond: {
      bg: `rgba(185, 242, 255, 0.15)`,
      text: colors.rank.diamond,
      border: colors.transparent,
    },
    mythic: {
      bg: `rgba(255, 77, 255, 0.15)`,
      text: colors.rank.mythic,
      border: colors.transparent,
    },
  },
} as const;

// =============================================================================
// TOAST TOKENS
// =============================================================================

export const toast = {
  base: {
    bg: surface.elevated,
    border: border.default,
    borderWidth: border.width.thin,
    radius: corners.card,
    shadow: shadow.xl,
    padding: space.cardMd,
    maxWidth: 360,
  },

  variants: {
    default: {
      bg: surface.elevated,
      border: border.default,
      icon: text.secondary,
    },
    success: {
      bg: feedback.success.bg,
      border: feedback.success.border,
      icon: feedback.success.icon,
    },
    warning: {
      bg: feedback.warning.bg,
      border: feedback.warning.border,
      icon: feedback.warning.icon,
    },
    error: {
      bg: feedback.danger.bg,
      border: feedback.danger.border,
      icon: feedback.danger.icon,
    },
    celebration: {
      bg: colors.toxic.soft,
      border: colors.toxic.primary,
      icon: colors.toxic.primary,
      glow: colors.toxic.glow,
    },
  },
} as const;

// =============================================================================
// MODAL TOKENS
// =============================================================================

export const modal = {
  overlay: {
    bg: surface.overlay.medium,
    blur: 8,
  },

  container: {
    bg: surface.elevated,
    border: border.subtle,
    borderWidth: border.width.thin,
    radius: corners.modal,
    shadow: shadow.xl,
    maxWidth: 400,
    padding: space.cardLg,
  },

  header: {
    paddingBottom: space.componentLg,
    borderBottom: border.subtle,
  },

  footer: {
    paddingTop: space.componentLg,
    borderTop: border.subtle,
    gap: space.componentMd,
  },
} as const;

// =============================================================================
// AVATAR TOKENS
// =============================================================================

export const avatar = {
  sizes: {
    xs: { size: 24, fontSize: typography.caption.size },
    sm: { size: 32, fontSize: typography.label.size },
    md: { size: 40, fontSize: typography.body.size },
    lg: { size: 56, fontSize: typography.h3.size },
    xl: { size: 80, fontSize: typography.h2.size },
    '2xl': { size: 120, fontSize: typography.h1.size },
  },

  base: {
    radius: corners.avatar,
    bg: surface.raised,
    border: border.default,
    borderWidth: border.width.thin,
  },

  status: {
    online: colors.green[500],
    offline: colors.gray[500],
    busy: colors.red[500],
    away: colors.amber[500],
  },
} as const;

// =============================================================================
// TAB BAR TOKENS
// =============================================================================

export const tabBar = {
  base: {
    bg: surface.raised,
    borderTop: border.subtle,
    height: 60,
    paddingBottom: 8, // Safe area addition
  },

  item: {
    activeColor: colors.toxic.primary,
    inactiveColor: text.muted,
    fontSize: typography.caption.size,
    iconSize: 24,
  },

  indicator: {
    height: 3,
    radius: corners.pill,
    color: colors.toxic.primary,
  },
} as const;

// =============================================================================
// HEADER TOKENS
// =============================================================================

export const header = {
  base: {
    bg: surface.base,
    height: 56,
    paddingX: space.screenX,
  },

  title: {
    ...typography.h3,
    color: text.primary,
  },

  transparent: {
    bg: colors.transparent,
  },

  blur: {
    bg: surface.glass.medium,
    blur: 20,
  },
} as const;

// =============================================================================
// LIST ITEM TOKENS
// =============================================================================

export const listItem = {
  base: {
    paddingX: space.cardMd,
    paddingY: space.componentMd,
    minHeight: 56,
    gap: space.componentMd,
  },

  variants: {
    default: {
      bg: colors.transparent,
    },
    card: {
      bg: surface.raised,
      radius: corners.card,
      border: border.subtle,
    },
  },

  states: {
    pressed: {
      bg: surface.sunken,
    },
  },

  divider: {
    color: border.subtle,
    height: border.width.hairline,
  },
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ButtonToken = typeof button;
export type CardToken = typeof card;
export type InputToken = typeof input;
export type BadgeToken = typeof badge;
export type ToastToken = typeof toast;
export type ModalToken = typeof modal;
export type AvatarToken = typeof avatar;
export type TabBarToken = typeof tabBar;
export type HeaderToken = typeof header;
export type ListItemToken = typeof listItem;
