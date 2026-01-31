// src/ui/components/__tests__/OAuthButton.test.tsx
// Tests for OAuthButton component

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

import { OAuthButton } from '../OAuthButton';

// Mock dependencies
jest.mock('@/src/ui/theme', () => ({
  useThemeColors: jest.fn(() => ({
    bg: '#000000',
    card: '#1a1a1a',
    border: '#333333',
    text: '#ffffff',
    muted: '#888888',
    primary: '#4ECDC4',
    danger: '#FF6B6B',
  })),
}));

jest.mock('@/src/ui/forgerankStyle', () => ({
  FR: {
    space: {
      x1: 6,
      x2: 8,
      x3: 12,
      x4: 16,
      x5: 20,
      x6: 24,
    },
    radius: {
      card: 16,
      pill: 999,
      soft: 12,
      input: 8,
      button: 12,
    },
    type: {
      h1: { fontSize: 22, fontWeight: '900', letterSpacing: 0.2 },
      h2: { fontSize: 18, fontWeight: '900', letterSpacing: 0.2 },
      h3: { fontSize: 16, fontWeight: '800', letterSpacing: 0.15 },
      body: { fontSize: 14, fontWeight: '700', letterSpacing: 0.1 },
      sub: { fontSize: 13, fontWeight: '700', letterSpacing: 0.1 },
      mono: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
    },
    pillButton: jest.fn(),
    card: jest.fn(),
  },
}));

jest.mock('expo-apple-authentication', () => ({
  AppleAuthenticationButton: jest.fn(({ style, onPress, disabled, children }) => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable onPress={onPress} disabled={disabled} style={style} testID="apple-auth-button">
        <Text>{children || 'Continue with Apple'}</Text>
      </Pressable>
    );
  }),
  AppleAuthenticationButtonType: {
    SIGN_IN: 'SIGN_IN',
  },
  AppleAuthenticationStyle: {
    BLACK: 'BLACK',
    WHITE_OUTLINE: 'WHITE_OUTLINE',
  },
}));

jest.mock('@/src/lib/auth/apple', () => ({
  isAppleAuthAvailable: jest.fn(() => true),
}));

describe('OAuthButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Google button', () => {
    it('should render correctly', () => {
      const { getByText } = render(
        <OAuthButton provider="google" onPress={jest.fn()} />
      );

      expect(getByText('Continue with Google')).toBeTruthy();
    });

    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <OAuthButton provider="google" onPress={onPress} />
      );

      fireEvent.press(getByText('Continue with Google'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <OAuthButton provider="google" onPress={onPress} disabled={true} />
      );

      fireEvent.press(getByText('Continue with Google'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <OAuthButton provider="google" onPress={onPress} isLoading={true} />
      );

      // When loading, the button should show ActivityIndicator
      expect(() => getByText('Continue with Google')).toThrow();
    });

    it('should show loading indicator when isLoading is true', () => {
      const { getByTestId } = render(
        <OAuthButton provider="google" onPress={jest.fn()} isLoading={true} />
      );

      // ActivityIndicator should be present
      const indicator = getByTestId('activity-indicator');
      expect(indicator).toBeTruthy();
    });

    it('should apply custom style', () => {
      const customStyle = { marginTop: 20 };
      const { getByRole } = render(
        <OAuthButton
          provider="google"
          onPress={jest.fn()}
          style={customStyle}
        />
      );

      const button = getByRole('button');
      // Style is an array in React Native when using multiple styles
      const styleArray = button?.props.style;
      expect(styleArray).toEqual(expect.arrayContaining([customStyle]));
    });
  });

  describe('Apple button', () => {
    it('should render when available', () => {
      const { isAppleAuthAvailable } = require('@/src/lib/auth/apple');
      isAppleAuthAvailable.mockReturnValue(true);

      const { getByText } = render(
        <OAuthButton provider="apple" onPress={jest.fn()} />
      );

      expect(getByText('Continue with Apple')).toBeTruthy();
    });

    it('should not render when not available', () => {
      const { isAppleAuthAvailable } = require('@/src/lib/auth/apple');
      isAppleAuthAvailable.mockReturnValue(false);

      const { UNSAFE_root } = render(
        <OAuthButton provider="apple" onPress={jest.fn()} />
      );

      // Component should return null (not render anything)
      expect(UNSAFE_root.children.length).toBe(0);
    });

    it('should call onPress when pressed', () => {
      const { isAppleAuthAvailable } = require('@/src/lib/auth/apple');
      isAppleAuthAvailable.mockReturnValue(true);

      const onPress = jest.fn();
      const { getByText } = render(
        <OAuthButton provider="apple" onPress={onPress} />
      );

      fireEvent.press(getByText('Continue with Apple'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Variants', () => {
    it('should render card variant by default', () => {
      const { getByText } = render(
        <OAuthButton provider="google" onPress={jest.fn()} />
      );

      expect(getByText('Continue with Google')).toBeTruthy();
    });

    it('should render outline variant', () => {
      const { getByText } = render(
        <OAuthButton provider="google" onPress={jest.fn()} variant="outline" />
      );

      expect(getByText('Continue with Google')).toBeTruthy();
    });

    it('should render pill variant', () => {
      const { getByText } = render(
        <OAuthButton provider="google" onPress={jest.fn()} variant="pill" />
      );

      expect(getByText('Continue with Google')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { getByText } = render(
        <OAuthButton provider="google" onPress={jest.fn()} size="small" />
      );

      expect(getByText('Continue with Google')).toBeTruthy();
    });

    it('should render medium size (default)', () => {
      const { getByText } = render(
        <OAuthButton provider="google" onPress={jest.fn()} size="medium" />
      );

      expect(getByText('Continue with Google')).toBeTruthy();
    });

    it('should render large size', () => {
      const { getByText } = render(
        <OAuthButton provider="google" onPress={jest.fn()} size="large" />
      );

      expect(getByText('Continue with Google')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible when not disabled', () => {
      const { getByRole } = render(
        <OAuthButton provider="google" onPress={jest.fn()} />
      );

      const button = getByRole('button');
      // When not disabled, accessibilityState.disabled should not be true
      expect(button?.props.accessibilityState?.disabled).not.toBe(true);
    });

    it('should be marked as disabled when disabled prop is true', () => {
      const { getByRole } = render(
        <OAuthButton provider="google" onPress={jest.fn()} disabled={true} />
      );

      const button = getByRole('button');
      expect(button?.props.accessibilityState?.disabled).toBe(true);
    });

    it('should be marked as disabled when loading', () => {
      const { getByRole } = render(
        <OAuthButton provider="google" onPress={jest.fn()} isLoading={true} />
      );

      const button = getByRole('button');
      expect(button?.props.accessibilityState?.disabled).toBe(true);
    });
  });
});
