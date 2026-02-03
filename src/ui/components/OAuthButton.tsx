// src/ui/components/OAuthButton.tsx
// Reusable OAuth button component for Google and Apple sign-in

import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

import { useThemeColors } from '../theme';
import { FR } from '../GrStyle';
import { isAppleAuthAvailable } from '../../lib/auth/apple';

// ============================================================================
// Types
// ============================================================================

export type OAuthProviderType = 'google' | 'apple';

export interface OAuthButtonProps {
  /**
   * OAuth provider to sign in with
   */
  provider: OAuthProviderType;

  /**
   * Called when sign in is pressed
   */
  onPress: () => void | Promise<void>;

  /**
   * Whether the button is in a loading state
   */
  isLoading?: boolean;

  /**
   * Whether the button is disabled
   */
  disabled?: boolean;

  /**
   * Custom style for the button container
   */
  style?: object;

  /**
   * Button variant for styling
   * @default 'card'
   */
  variant?: 'card' | 'pill' | 'outline';

  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
}

// ============================================================================
// Icons (Text-based for simplicity)
// ============================================================================

/**
 * Google icon - colored "G" text
 */
function GoogleIcon({ size = 24 }: { size?: number }) {
  const fontSize = size;
  return (
    <Text
      style={{
        fontSize,
        fontWeight: '900',
        color: '#4285F4',
      }}
    >
      G
    </Text>
  );
}

/**
 * Apple icon - simple apple glyph
 */
function AppleIcon({ size = 24, color }: { size?: number; color?: string }) {
  const fontSize = size;
  return (
    <Text
      style={{
        fontSize,
        fontWeight: '300',
        color: color || '#fff',
      }}
    >
      
    </Text>
  );
}

// ============================================================================
// Styles
// ============================================================================

const createStyles = (
  colors: ReturnType<typeof useThemeColors>,
  provider: OAuthProviderType,
  variant: OAuthButtonProps['variant'],
  size: OAuthButtonProps['size']
) => {
  const sizeMap = {
    small: { paddingVertical: 10, paddingHorizontal: 16, iconSize: 18, fontSize: 13 },
    medium: { paddingVertical: 14, paddingHorizontal: 20, iconSize: 24, fontSize: 15 },
    large: { paddingVertical: 16, paddingHorizontal: 24, iconSize: 28, fontSize: 16 },
  };

  const s = sizeMap[size || 'medium'];

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: variant === 'card' ? colors.card : 'transparent',
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: colors.border,
      borderRadius: FR.radius.button,
      paddingVertical: s.paddingVertical,
      paddingHorizontal: s.paddingHorizontal,
      gap: FR.space.x2,
      minHeight: 48,
    },
    pressed: {
      opacity: 0.7,
    },
    disabled: {
      opacity: 0.5,
    },
    iconContainer: {
      width: s.iconSize + 4,
      height: s.iconSize + 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      ...FR.type.body,
      fontSize: s.fontSize,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.2,
    },
    loading: {
      marginLeft: FR.space.x2,
    },
  });
};

// ============================================================================
// Component
// ============================================================================

/**
 * OAuth Button Component
 *
 * A standardized button for OAuth sign-in with Google and Apple.
 * Handles platform-specific rendering (Apple button hidden on Android).
 *
 * @example
 * ```tsx
 * <OAuthButton
 *   provider="google"
 *   onPress={handleGoogleSignIn}
 *   isLoading={isGoogleLoading}
 * />
 *
 * <OAuthButton
 *   provider="apple"
 *   onPress={handleAppleSignIn}
 *   isLoading={isAppleLoading}
 * />
 * ```
 */
export function OAuthButton({
  provider,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  variant = 'card',
  size = 'medium',
}: OAuthButtonProps) {
  const [pressed, setPressed] = useState(false);
  const colors = useThemeColors();
  const styles = createStyles(colors, provider, variant, size);

  // Hide Apple button on Android (not supported)
  if (provider === 'apple' && !isAppleAuthAvailable()) {
    return null;
  }

  // For Apple on iOS, use the native Apple Authentication button
  // It provides the best UX and follows Apple's guidelines
  const shouldUseNativeAppleButton =
    provider === 'apple' &&
    Platform.OS === 'ios' &&
    AppleAuthentication.AppleAuthenticationButton;

  if (shouldUseNativeAppleButton) {
    const buttonType = AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN;
    // Check if AppleAuthenticationStyle exists, otherwise use WHITE_OUTLINE as fallback
    const hasStyle = AppleAuthentication.AppleAuthenticationStyle;
    const buttonStyle = variant === 'outline' || !hasStyle
      ? AppleAuthentication.AppleAuthenticationStyle?.WHITE_OUTLINE ?? 0
      : AppleAuthentication.AppleAuthenticationStyle?.BLACK ?? 0;

    return (
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={buttonType}
        buttonStyle={buttonStyle}
        cornerRadius={FR.radius.button}
        style={[styles.container, style]}
        onPress={onPress}
        disabled={disabled || isLoading}
      />
    );
  }

  // Custom button for Google or Apple on non-iOS platforms
  const handlePressIn = () => setPressed(true);
  const handlePressOut = () => setPressed(false);
  const handlePress = () => {
    if (!disabled && !isLoading) {
      onPress();
    }
  };

  const providerName = provider === 'google' ? 'Google' : 'Apple';
  const Icon = provider === 'google' ? GoogleIcon : AppleIcon;
  const sizeMap = {
    small: { iconSize: 18 },
    medium: { iconSize: 24 },
    large: { iconSize: 28 },
  };
  const iconSize = sizeMap[size || 'medium'].iconSize;

  return (
    <Pressable
      role="button"
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      style={({ pressed: isPressed }) => [
        styles.container,
        pressed && styles.pressed,
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          testID="activity-indicator"
          size="small"
          color={colors.text}
          style={styles.loading}
        />
      ) : (
        <>
          <View style={styles.iconContainer}>
            <Icon size={iconSize} color={colors.text} />
          </View>
          <Text style={styles.text}>
            Continue with {providerName}
          </Text>
        </>
      )}
    </Pressable>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default OAuthButton;
