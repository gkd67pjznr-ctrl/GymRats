/**
 * Decorations - Unified Export
 *
 * Decorative elements for visual flair.
 * These are placeholder exports - actual SVG/Lottie decorations to be added.
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors } from '../../tokens/primitives';

// =============================================================================
// PLACEHOLDER DECORATIONS
// =============================================================================

interface DecorationProps {
  color?: string;
  scale?: number;
  opacity?: number;
  style?: ViewStyle;
}

/**
 * Card corner accent decoration
 * TODO: Replace with actual SVG or Lottie animation
 */
export function CardCornerDecoration({
  color = colors.toxic.primary,
  scale = 1,
  opacity = 0.3,
  style,
}: DecorationProps) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          top: 0,
          right: 0,
          width: 40 * scale,
          height: 40 * scale,
          borderTopRightRadius: 12,
          backgroundColor: color,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Header accent line
 * TODO: Replace with animated gradient line
 */
export function HeaderLineDecoration({
  color = colors.toxic.primary,
  scale = 1,
  opacity = 0.5,
  style,
}: DecorationProps) {
  return (
    <View
      style={[
        {
          height: 2 * scale,
          backgroundColor: color,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Divider with accent glow
 * TODO: Replace with gradient divider
 */
export function GlowDivider({
  color = colors.toxic.primary,
  scale = 1,
  opacity = 0.2,
  style,
}: DecorationProps) {
  return (
    <View
      style={[
        {
          height: 1 * scale,
          backgroundColor: color,
          opacity,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 4,
        },
        style,
      ]}
    />
  );
}

/**
 * Background glow effect
 * TODO: Replace with radial gradient
 */
export function BackgroundGlow({
  color = colors.toxic.primary,
  scale = 1,
  opacity = 0.1,
  style,
}: DecorationProps) {
  return (
    <View
      style={[
        {
          width: 200 * scale,
          height: 200 * scale,
          borderRadius: 100 * scale,
          backgroundColor: color,
          opacity,
        },
        style,
      ]}
    />
  );
}
