/**
 * GlassPanel Primitive Component
 *
 * A glassmorphism container with blur effect and subtle borders.
 * Requires expo-blur to be installed for full effect.
 */

import React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp, Platform } from 'react-native';
import { surface, corners, border, shadow } from '../tokens/semantic';
import { blur } from '../tokens/primitives';

export type GlassIntensity = 'light' | 'medium' | 'heavy';

export interface GlassPanelProps {
  /** Blur/glass intensity */
  intensity?: GlassIntensity;
  /** Corner radius preset or custom number */
  radius?: keyof typeof corners | number;
  /** Show border */
  bordered?: boolean;
  /** Additional styles */
  style?: StyleProp<ViewStyle>;
  /** Children */
  children?: React.ReactNode;
  /** Test ID */
  testID?: string;
}

/**
 * GlassPanel provides a glassmorphism effect container.
 *
 * Note: For actual blur effect, wrap content with expo-blur's BlurView.
 * This component provides the correct background colors and styling.
 *
 * @example
 * ```tsx
 * import { BlurView } from 'expo-blur';
 *
 * <BlurView intensity={20} tint="dark">
 *   <GlassPanel intensity="medium">
 *     <Text>Content</Text>
 *   </GlassPanel>
 * </BlurView>
 * ```
 */
export function GlassPanel({
  intensity = 'medium',
  radius,
  bordered = true,
  style,
  children,
  testID,
}: GlassPanelProps) {
  const glassColors: Record<GlassIntensity, string> = {
    light: surface.glass.light,
    medium: surface.glass.medium,
    heavy: surface.glass.heavy,
  };

  const blurIntensity: Record<GlassIntensity, number> = {
    light: blur.sm,
    medium: blur.md,
    heavy: blur.lg,
  };

  const resolvedRadius =
    radius === undefined
      ? corners.card
      : typeof radius === 'number'
        ? radius
        : corners[radius];

  const glassStyle: ViewStyle = {
    backgroundColor: glassColors[intensity],
    borderRadius: resolvedRadius,
    overflow: 'hidden',
    ...(bordered && {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: border.width.thin,
    }),
    ...shadow.lg,
  };

  return (
    <View style={[glassStyle, style]} testID={testID}>
      {children}
    </View>
  );
}

/**
 * Pre-configured GlassPanel variants
 */
export const GlassPanelPresets = {
  /** Light frost effect */
  Frost: (props: Omit<GlassPanelProps, 'intensity'>) => (
    <GlassPanel {...props} intensity="light" />
  ),

  /** Standard glass effect */
  Glass: (props: Omit<GlassPanelProps, 'intensity'>) => (
    <GlassPanel {...props} intensity="medium" />
  ),

  /** Heavy blur effect */
  Blur: (props: Omit<GlassPanelProps, 'intensity'>) => (
    <GlassPanel {...props} intensity="heavy" />
  ),
};

/**
 * Hook to get blur intensity value for expo-blur
 */
export function useGlassBlurIntensity(intensity: GlassIntensity): number {
  const blurValues: Record<GlassIntensity, number> = {
    light: blur.sm,
    medium: blur.md,
    heavy: blur.lg,
  };
  return blurValues[intensity];
}

export default GlassPanel;
