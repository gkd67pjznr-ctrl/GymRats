/**
 * Surface Primitive Component
 *
 * The foundational layer component for building UI hierarchy.
 * Automatically applies elevation styles, shadows, and borders.
 */

import React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { ElevationLevel, getSurfaceStyle, SurfaceVariant } from '../surfaces/elevation';
import { corners } from '../tokens/semantic';

export interface SurfaceProps {
  /** Elevation level determines visual depth */
  elevation?: ElevationLevel;
  /** Surface variant (solid, glass, gradient) */
  variant?: SurfaceVariant;
  /** Corner radius preset or custom number */
  radius?: keyof typeof corners | number;
  /** Additional styles */
  style?: StyleProp<ViewStyle>;
  /** Children */
  children?: React.ReactNode;
  /** Test ID for testing */
  testID?: string;
}

export function Surface({
  elevation = 'base',
  variant = 'solid',
  radius,
  style,
  children,
  testID,
}: SurfaceProps) {
  const surfaceConfig = getSurfaceStyle(elevation, variant);

  const resolvedRadius =
    radius === undefined
      ? undefined
      : typeof radius === 'number'
        ? radius
        : corners[radius];

  const surfaceStyle: ViewStyle = {
    backgroundColor: surfaceConfig.backgroundColor,
    ...(surfaceConfig.borderColor && {
      borderColor: surfaceConfig.borderColor,
      borderWidth: surfaceConfig.borderWidth,
    }),
    ...(surfaceConfig.shadow && surfaceConfig.shadow),
    ...(resolvedRadius !== undefined && { borderRadius: resolvedRadius }),
  };

  return (
    <View style={[surfaceStyle, style]} testID={testID}>
      {children}
    </View>
  );
}

/**
 * Pre-configured Surface variants for common use cases
 */
export const SurfacePresets = {
  /** Screen background */
  Screen: (props: Omit<SurfaceProps, 'elevation'>) => (
    <Surface {...props} elevation="base" />
  ),

  /** Standard card container */
  Card: (props: Omit<SurfaceProps, 'elevation' | 'radius'>) => (
    <Surface {...props} elevation="raised" radius="card" />
  ),

  /** Elevated card for emphasis */
  CardElevated: (props: Omit<SurfaceProps, 'elevation' | 'radius'>) => (
    <Surface {...props} elevation="elevated" radius="cardLg" />
  ),

  /** Floating element (dropdown, tooltip) */
  Floating: (props: Omit<SurfaceProps, 'elevation' | 'radius'>) => (
    <Surface {...props} elevation="floating" radius="card" />
  ),

  /** Modal container */
  Modal: (props: Omit<SurfaceProps, 'elevation' | 'radius'>) => (
    <Surface {...props} elevation="elevated" radius="modal" />
  ),

  /** Inset/sunken area */
  Inset: (props: Omit<SurfaceProps, 'elevation' | 'radius'>) => (
    <Surface {...props} elevation="sunken" radius="input" />
  ),

  /** Spotlight/focused element */
  Spotlight: (props: Omit<SurfaceProps, 'elevation' | 'radius'>) => (
    <Surface {...props} elevation="spotlight" radius="card" />
  ),
};

export default Surface;
