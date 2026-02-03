/**
 * Text Primitive Component
 *
 * Typography component with semantic presets and consistent styling.
 * Automatically applies colors and typography tokens.
 */

import React from 'react';
import {
  Text as RNText,
  TextStyle,
  StyleSheet,
  StyleProp,
  TextProps as RNTextProps,
} from 'react-native';
import { text } from '../tokens/semantic';
import { typography } from '../tokens/semantic';

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'caption'
  | 'mono';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'link';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  /** Typography variant */
  variant?: TextVariant;
  /** Text color */
  color?: TextColor;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Make text bold (overrides variant weight) */
  bold?: boolean;
  /** Make text italic */
  italic?: boolean;
  /** Uppercase transform */
  uppercase?: boolean;
  /** Additional styles */
  style?: StyleProp<TextStyle>;
  /** Children */
  children?: React.ReactNode;
}

export function Text({
  variant = 'body',
  color = 'primary',
  align,
  bold,
  italic,
  uppercase,
  style,
  children,
  ...props
}: TextProps) {
  const variantStyle = typography[variant];

  const colorMap: Record<TextColor, string> = {
    primary: text.primary,
    secondary: text.secondary,
    muted: text.muted,
    inverse: text.inverse,
    accent: text.accent,
    success: text.success,
    warning: text.warning,
    danger: text.danger,
    info: text.info,
    link: text.link,
  };

  // Calculate lineHeight in pixels (React Native expects pixels)
  const lineHeightPx = variantStyle.size * variantStyle.lineHeight;

  const textStyle: TextStyle = {
    fontSize: variantStyle.size,
    fontWeight: bold ? '700' : variantStyle.weight,
    lineHeight: lineHeightPx,
    letterSpacing: variantStyle.tracking,
    color: colorMap[color],
    ...(align && { textAlign: align }),
    ...(italic && { fontStyle: 'italic' }),
    ...(uppercase && { textTransform: 'uppercase' }),
  };

  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  );
}

/**
 * Pre-configured Text variants for common use cases
 */
export const TextPresets = {
  /** Large display text for hero sections */
  Display: (props: Omit<TextProps, 'variant'>) => (
    <Text {...props} variant="display" />
  ),

  /** Page titles */
  H1: (props: Omit<TextProps, 'variant'>) => <Text {...props} variant="h1" />,

  /** Section headings */
  H2: (props: Omit<TextProps, 'variant'>) => <Text {...props} variant="h2" />,

  /** Card titles */
  H3: (props: Omit<TextProps, 'variant'>) => <Text {...props} variant="h3" />,

  /** Small headings */
  H4: (props: Omit<TextProps, 'variant'>) => <Text {...props} variant="h4" />,

  /** Large body text */
  BodyLarge: (props: Omit<TextProps, 'variant'>) => (
    <Text {...props} variant="bodyLarge" />
  ),

  /** Standard body text */
  Body: (props: Omit<TextProps, 'variant'>) => (
    <Text {...props} variant="body" />
  ),

  /** Small body text */
  BodySmall: (props: Omit<TextProps, 'variant'>) => (
    <Text {...props} variant="bodySmall" />
  ),

  /** Labels and buttons */
  Label: (props: Omit<TextProps, 'variant'>) => (
    <Text {...props} variant="label" />
  ),

  /** Captions and metadata */
  Caption: (props: Omit<TextProps, 'variant'>) => (
    <Text {...props} variant="caption" />
  ),

  /** Monospace text for numbers/code */
  Mono: (props: Omit<TextProps, 'variant'>) => (
    <Text {...props} variant="mono" />
  ),
};

export default Text;
