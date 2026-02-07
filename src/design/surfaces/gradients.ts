/**
 * Gradient Definitions
 *
 * Predefined gradients for backgrounds, cards, and decorative elements.
 * Use with expo-linear-gradient or react-native-linear-gradient.
 */

import { colors } from '../tokens/primitives';

// =============================================================================
// GRADIENT TYPES
// =============================================================================

export interface GradientConfig {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
}

// =============================================================================
// BACKGROUND GRADIENTS
// =============================================================================

export const backgroundGradients = {
  // Subtle depth gradient for screens (top to bottom)
  screenDepth: {
    colors: [colors.gray[950], colors.gray[975], colors.gray[950]],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    locations: [0, 0.5, 1],
  } as GradientConfig,

  // Radial-like glow from top
  topGlow: {
    colors: ['rgba(166, 255, 0, 0.03)', 'transparent'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 0.4 },
  } as GradientConfig,

  // Dark vignette effect
  vignette: {
    colors: ['transparent', 'rgba(0, 0, 0, 0.3)'],
    start: { x: 0.5, y: 0.5 },
    end: { x: 0.5, y: 1 },
  } as GradientConfig,

  // Spotlight from center-top
  spotlight: {
    colors: ['rgba(166, 255, 0, 0.05)', 'transparent', 'transparent'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 0.6 },
    locations: [0, 0.3, 1],
  } as GradientConfig,
} as const;

// =============================================================================
// CARD GRADIENTS
// =============================================================================

export const cardGradients = {
  // Subtle shine effect (diagonal)
  shine: {
    colors: ['rgba(255, 255, 255, 0.02)', 'transparent', 'transparent'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 0.3, 1],
  } as GradientConfig,

  // Glass-like reflective surface
  glass: {
    colors: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  } as GradientConfig,

  // Accent tinted card
  accentTint: {
    colors: [`${colors.toxic.primary}08`, 'transparent'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  // Depth illusion (darker at bottom)
  depth: {
    colors: ['transparent', 'rgba(0, 0, 0, 0.1)'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientConfig,
} as const;

// =============================================================================
// ACCENT GRADIENTS
// =============================================================================

export const accentGradients = {
  // Primary accent gradient
  toxic: {
    colors: [colors.toxic.primary, colors.toxic.secondary],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  // Electric purple to cyan
  electric: {
    colors: [colors.electric.primary, colors.electric.secondary],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  // Ember pink to orange
  ember: {
    colors: [colors.ember.primary, colors.ember.secondary],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  // Ice teal to cyan
  ice: {
    colors: [colors.ice.primary, colors.ice.secondary],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  // Ultra lime to magenta
  ultra: {
    colors: [colors.ultra.primary, colors.ultra.secondary],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,
} as const;

// =============================================================================
// RANK GRADIENTS (For badges, celebrations)
// =============================================================================

export const rankGradients = {
  copper: {
    colors: ['#B87333', '#8B5A2B'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  bronze: {
    colors: ['#CD7F32', '#8B5A2B'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  iron: {
    colors: ['#6B6B6B', '#4A4A4A'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  silver: {
    colors: ['#E8E8E8', '#A0A0A0'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  gold: {
    colors: ['#FFD700', '#FFA500'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  master: {
    colors: ['#FFF8DC', '#FFD700', '#FFF8DC'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 0.5, 1],
  } as GradientConfig,

  legendary: {
    colors: ['#9B30FF', '#7B68EE'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientConfig,

  mythic: {
    colors: ['#00CED1', '#20B2AA', '#00CED1'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 0.5, 1],
  } as GradientConfig,

  supreme_being: {
    colors: ['#FF4500', '#FF6347', '#FF4500'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 0.5, 1],
  } as GradientConfig,

  goat: {
    colors: ['#FFFFFF', '#FFD700', '#FFFFFF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 0.5, 1],
  } as GradientConfig,
} as const;

// =============================================================================
// CELEBRATION GRADIENTS
// =============================================================================

export const celebrationGradients = {
  // PR celebration background
  prCelebration: {
    colors: [`${colors.toxic.primary}20`, 'transparent', `${colors.toxic.secondary}10`],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    locations: [0, 0.5, 1],
  } as GradientConfig,

  // Rank up celebration
  rankUp: {
    colors: [`${colors.rank.gold}30`, 'transparent'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientConfig,

  // Achievement unlocked
  achievement: {
    colors: [`${colors.rank.legendary}20`, 'transparent'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 0.6 },
  } as GradientConfig,
} as const;

// =============================================================================
// UTILITY GRADIENTS
// =============================================================================

export const utilityGradients = {
  // Fade to transparent (for scroll indicators)
  fadeBottom: {
    colors: ['transparent', colors.gray[950]],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientConfig,

  fadeTop: {
    colors: [colors.gray[950], 'transparent'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientConfig,

  fadeLeft: {
    colors: [colors.gray[950], 'transparent'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  } as GradientConfig,

  fadeRight: {
    colors: ['transparent', colors.gray[950]],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  } as GradientConfig,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type BackgroundGradientKey = keyof typeof backgroundGradients;
export type CardGradientKey = keyof typeof cardGradients;
export type AccentGradientKey = keyof typeof accentGradients;
export type RankGradientKey = keyof typeof rankGradients;
export type CelebrationGradientKey = keyof typeof celebrationGradients;
export type UtilityGradientKey = keyof typeof utilityGradients;
