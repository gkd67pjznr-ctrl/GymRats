/**
 * Button Primitive Component
 *
 * A pressable button with multiple variants, sizes, and states.
 * Supports icons and loading states.
 */

import React from 'react';
import {
  Pressable,
  View,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
  StyleProp,
  PressableProps,
} from 'react-native';
import { Text } from './Text';
import { button } from '../tokens/components';
import { colors } from '../tokens/primitives';

export type ButtonVariant = keyof typeof button.variants;
export type ButtonSize = keyof typeof button.sizes;

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  /** Button label */
  label: string;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Left icon component */
  leftIcon?: React.ReactNode;
  /** Right icon component */
  rightIcon?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const variantConfig = button.variants[variant];
  const sizeConfig = button.sizes[size];

  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      {...props}
      style={({ pressed }) => [
        styles.base,
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingX,
          borderRadius: sizeConfig.radius,
          backgroundColor: variantConfig.bg,
          borderColor: variantConfig.border,
          borderWidth: variantConfig.border !== colors.transparent ? 1 : 0,
          ...variantConfig.shadow,
        },
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantConfig.text}
            style={styles.loader}
          />
        ) : (
          <>
            {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
            <Text
              variant="label"
              style={[
                styles.label,
                {
                  fontSize: sizeConfig.fontSize,
                  color: variantConfig.text,
                },
              ]}
            >
              {label}
            </Text>
            {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  label: {
    fontWeight: '600',
  },
  loader: {
    marginHorizontal: 8,
  },
});

/**
 * Pre-configured Button variants
 */
export const ButtonPresets = {
  /** Primary action button */
  Primary: (props: Omit<ButtonProps, 'variant'>) => (
    <Button {...props} variant="primary" />
  ),

  /** Secondary action button */
  Secondary: (props: Omit<ButtonProps, 'variant'>) => (
    <Button {...props} variant="secondary" />
  ),

  /** Ghost/text button */
  Ghost: (props: Omit<ButtonProps, 'variant'>) => (
    <Button {...props} variant="ghost" />
  ),

  /** Danger/destructive action */
  Danger: (props: Omit<ButtonProps, 'variant'>) => (
    <Button {...props} variant="danger" />
  ),

  /** Success/confirm action */
  Success: (props: Omit<ButtonProps, 'variant'>) => (
    <Button {...props} variant="success" />
  ),
};

/**
 * Icon-only button variant
 */
export interface IconButtonProps extends Omit<PressableProps, 'style'> {
  /** Icon component */
  icon: React.ReactNode;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Additional styles */
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  ...props
}: IconButtonProps) {
  const variantConfig = button.variants[variant];
  const sizeConfig = button.sizes[size];

  const isDisabled = disabled || loading;
  const buttonSize = sizeConfig.height;

  return (
    <Pressable
      disabled={isDisabled}
      {...props}
      style={({ pressed }) => [
        styles.base,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: variantConfig.bg,
          borderColor: variantConfig.border,
          borderWidth: variantConfig.border !== colors.transparent ? 1 : 0,
        },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantConfig.text} />
      ) : (
        icon
      )}
    </Pressable>
  );
}

export default Button;
