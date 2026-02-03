/**
 * Card Primitive Component
 *
 * A container component with built-in elevation, padding, and interaction states.
 * Supports multiple variants for different use cases.
 */

import React from 'react';
import {
  View,
  Pressable,
  ViewStyle,
  StyleSheet,
  StyleProp,
  PressableProps,
} from 'react-native';
import { card } from '../tokens/components';
import { corners, shadow } from '../tokens/semantic';

export type CardVariant = keyof typeof card.variants;
export type CardSize = keyof typeof card.sizes;

export interface CardProps {
  /** Visual variant */
  variant?: CardVariant;
  /** Size (affects padding and radius) */
  size?: CardSize;
  /** Make card pressable */
  onPress?: PressableProps['onPress'];
  /** Long press handler */
  onLongPress?: PressableProps['onLongPress'];
  /** Disabled state */
  disabled?: boolean;
  /** Additional styles */
  style?: StyleProp<ViewStyle>;
  /** Children */
  children?: React.ReactNode;
  /** Test ID */
  testID?: string;
}

export function Card({
  variant = 'default',
  size = 'md',
  onPress,
  onLongPress,
  disabled = false,
  style,
  children,
  testID,
}: CardProps) {
  const variantConfig = card.variants[variant];
  const sizeConfig = card.sizes[size];

  const baseStyle: ViewStyle = {
    backgroundColor: variantConfig.bg,
    borderColor: variantConfig.border,
    borderWidth: variantConfig.borderWidth,
    borderRadius: sizeConfig.radius,
    padding: sizeConfig.padding,
    ...variantConfig.shadow,
  };

  // Non-interactive card
  if (!onPress && !onLongPress) {
    return (
      <View style={[baseStyle, style]} testID={testID}>
        {children}
      </View>
    );
  }

  // Interactive card with press states
  const isInteractive = variant === 'interactive';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      testID={testID}
      style={({ pressed }) => [
        baseStyle,
        pressed && isInteractive && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    backgroundColor: card.variants.interactive.pressedBg,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});

/**
 * Pre-configured Card variants
 */
export const CardPresets = {
  /** Default card with subtle styling */
  Default: (props: Omit<CardProps, 'variant'>) => (
    <Card {...props} variant="default" />
  ),

  /** Elevated card for emphasis */
  Elevated: (props: Omit<CardProps, 'variant'>) => (
    <Card {...props} variant="elevated" />
  ),

  /** Glass-effect card (use with BlurView) */
  Glass: (props: Omit<CardProps, 'variant'>) => (
    <Card {...props} variant="glass" />
  ),

  /** Accent-tinted card */
  Accent: (props: Omit<CardProps, 'variant'>) => (
    <Card {...props} variant="accent" />
  ),

  /** Interactive card with press states */
  Interactive: (props: Omit<CardProps, 'variant'>) => (
    <Card {...props} variant="interactive" />
  ),
};

export default Card;
