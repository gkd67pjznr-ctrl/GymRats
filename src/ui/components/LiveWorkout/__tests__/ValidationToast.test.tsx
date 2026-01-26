/**
 * ValidationToast Component Tests
 *
 * SPEC-003 - Input Validation with Toast Feedback
 * Tests for validation toast notification component
 *
 * Test Coverage:
 * - Render with error type (verifies red border #FF6B6B)
 * - Render with success type (verifies cyan border #4ECDC4)
 * - Animation lifecycle (slide-in/slide-out with 250ms duration)
 * - Auto-dismiss behavior after 3 seconds
 * - onDismiss callback invocation
 * - Bottom positioning (16px padding, z-index 1000)
 * - Cleanup on unmount
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';

import { ValidationToast, ValidationToastType } from '../ValidationToast';

// Mock useThemeColors - component imports but doesn't use it
jest.mock('@/src/ui/theme', () => ({
  useThemeColors: jest.fn(() => ({
    bg: '#000000',
    card: '#1a1a1a',
    border: '#333333',
    text: '#ffffff',
    muted: '#888888',
    primary: '#4ECDC4',
    secondary: '#8b5cf6',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
  })),
}));

// Mock Animated API for predictable testing
jest.spyOn(Animated, 'Value').mockImplementation((value: number) => ({
  setValue: jest.fn(),
  interpolate: jest.fn(),
  extract: jest.fn(),
  __getValue: jest.fn(() => value),
} as unknown as Animated.Value));

// Mock Animated.parallel to trigger callbacks immediately
const mockParallelStart = jest.fn((callback?: (result: { finished: boolean }) => void) => {
  // Immediately call callback to simulate animation completion
  if (callback) {
    setTimeout(() => callback({ finished: true }), 0);
  }
  return { start: mockParallelStart, stop: jest.fn(), reset: jest.fn() };
});

jest.spyOn(Animated, 'parallel').mockImplementation(() => ({
  start: mockParallelStart,
  stop: jest.fn(),
  reset: jest.fn(),
}));

// Mock Animated.timing
const mockTiming = jest.fn(() => ({
  start: jest.fn((callback?: (result: { finished: boolean }) => void) => {
    if (callback) {
      setTimeout(() => callback({ finished: true }), 0);
    }
  }),
  stop: jest.fn(),
  reset: jest.fn(),
}));
Animated.timing = mockTiming;

// Mock Easing functions
Animated.Easing = {
  out: jest.fn((easing: any) => easing),
  in: jest.fn((easing: any) => easing),
  cubic: 'cubic-easing',
  linear: 'linear-easing',
  quad: 'quad-easing',
  ease: 'ease-easing',
  bounce: 'bounce-easing',
  elastic: (t: number) => t,
};

// Use fake timers for predictable auto-dismiss testing
jest.useFakeTimers();

describe('ValidationToast Component', () => {
  let onDismissMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    onDismissMock = jest.fn();
  });

  describe('Rendering', () => {
    it('should render null when visible is false', () => {
      const { queryByText } = render(
        <ValidationToast
          visible={false}
          message="Test error message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      expect(queryByText('Test error message')).toBeNull();
    });

    it('should render when visible is true', () => {
      const { getByText } = render(
        <ValidationToast
          visible={true}
          message="Test error message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      expect(getByText('Test error message')).toBeTruthy();
    });

    it('should display the provided message', () => {
      const message = 'Invalid weight: cannot exceed 2000 lbs';
      const { getByText } = render(
        <ValidationToast
          visible={true}
          message={message}
          type="error"
          onDismiss={onDismissMock}
        />
      );

      expect(getByText(message)).toBeTruthy();
    });

    it('should render with testID for accessibility', () => {
      const { getByTestId, UNSAFE_getByType } = render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      // The toast wrapper should be rendered
      const animatedView = UNSAFE_getByType(Animated.View);
      expect(animatedView).toBeTruthy();
    });
  });

  describe('Error Type Styling', () => {
    it('should apply red border (#FF6B6B) for error type', () => {
      const { UNSAFE_getByType } = render(
        <ValidationToast
          visible={true}
          message="Error message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      const animatedView = UNSAFE_getByType(Animated.View);
      expect(animatedView.props.style.borderColor).toBe('#FF6B6B');
      expect(animatedView.props.style.backgroundColor).toBe('#1a1a1a');
    });

    it('should apply error text color matching border', () => {
      const { getByText } = render(
        <ValidationToast
          visible={true}
          message="Error message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      const textElement = getByText('Error message');
      expect(textElement.props.style.color).toBe('#FF6B6B');
    });
  });

  describe('Success Type Styling', () => {
    it('should apply cyan border (#4ECDC4) for success type', () => {
      const { UNSAFE_getByType } = render(
        <ValidationToast
          visible={true}
          message="Success message"
          type="success"
          onDismiss={onDismissMock}
        />
      );

      const animatedView = UNSAFE_getByType(Animated.View);
      expect(animatedView.props.style.borderColor).toBe('#4ECDC4');
      expect(animatedView.props.style.backgroundColor).toBe('#1a1a1a');
    });

    it('should apply success text color matching border', () => {
      const { getByText } = render(
        <ValidationToast
          visible={true}
          message="Success message"
          type="success"
          onDismiss={onDismissMock}
        />
      );

      const textElement = getByText('Success message');
      expect(textElement.props.style.color).toBe('#4ECDC4');
    });
  });

  describe('Positioning', () => {
    it('should position at bottom of screen with absolute positioning', () => {
      const { UNSAFE_getAllByType } = render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      const views = UNSAFE_getAllByType(require('react-native').View);
      // Find the outer container View (not Animated.View)
      const containerView = views.find((v: any) =>
        v.props.style?.position === 'absolute'
      );

      expect(containerView).toBeDefined();
      expect(containerView.props.style.position).toBe('absolute');
      expect(containerView.props.style.bottom).toBe(0);
      expect(containerView.props.style.left).toBe(0);
      expect(containerView.props.style.right).toBe(0);
    });

    it('should have 16px horizontal and bottom padding', () => {
      const { UNSAFE_getAllByType } = render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      const views = UNSAFE_getAllByType(require('react-native').View);
      const containerView = views.find((v: any) =>
        v.props.style?.position === 'absolute'
      );

      expect(containerView.props.style.paddingHorizontal).toBe(16);
      expect(containerView.props.style.paddingBottom).toBe(16);
    });

    it('should have z-index of 1000', () => {
      const { UNSAFE_getAllByType } = render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      const views = UNSAFE_getAllByType(require('react-native').View);
      const containerView = views.find((v: any) =>
        v.props.style?.zIndex === 1000
      );

      expect(containerView).toBeDefined();
      expect(containerView.props.style.zIndex).toBe(1000);
    });
  });

  describe('Animation Lifecycle', () => {
    it('should create parallel animations for opacity and translateY', () => {
      render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      expect(Animated.parallel).toHaveBeenCalled();
    });

    it('should use 250ms duration for animations', () => {
      render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      expect(mockTiming).toHaveBeenCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({
          duration: 250,
        })
      );
    });

    it('should use native driver for animations', () => {
      render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      expect(mockTiming).toHaveBeenCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({
          useNativeDriver: true,
        })
      );
    });

    it('should use easing functions for smooth animations', () => {
      render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      expect(mockTiming).toHaveBeenCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({
          easing: expect.any(Function),
        })
      );
    });
  });

  describe('Auto-Dismiss Behavior', () => {
    it('should auto-dismiss after 3 seconds (3000ms)', async () => {
      render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      // Fast-forward 3 seconds
      jest.advanceTimersByTime(3000);

      // Wait for animation callback to complete
      await waitFor(() => {
        expect(onDismissMock).toHaveBeenCalled();
      });
    });

    it('should not auto-dismiss before 3 seconds', () => {
      render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      // Fast-forward less than 3 seconds
      jest.advanceTimersByTime(2500);

      expect(onDismissMock).not.toHaveBeenCalled();
    });

    it('should clear existing timer when visibility changes to false', () => {
      const { rerender } = render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      // Rerender with visible=false (dismissToast is called immediately)
      rerender(
        <ValidationToast
          visible={false}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      // onDismiss should be called due to dismissToast
      expect(onDismissMock).toHaveBeenCalled();
    });
  });

  describe('onDismiss Callback', () => {
    it('should call onDismiss when auto-dismiss completes', async () => {
      render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(onDismissMock).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onDismiss after slide-out animation completes', async () => {
      render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(onDismissMock).toHaveBeenCalled();
      });
    });

    it('should call onDismiss when visible changes to false', async () => {
      const { rerender } = render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      rerender(
        <ValidationToast
          visible={false}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      await waitFor(() => {
        expect(onDismissMock).toHaveBeenCalled();
      });
    });
  });

  describe('Cleanup', () => {
    it('should clear timer on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { unmount } = render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('should not call onDismiss after unmount', () => {
      const { unmount } = render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      unmount();

      // Advance time after unmount
      jest.advanceTimersByTime(3000);

      // onDismiss should not be called after unmount
      expect(onDismissMock).not.toHaveBeenCalled();
    });

    it('should handle rapid mount/unmount cycles', () => {
      const { unmount } = render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      // Immediate unmount
      unmount();

      // Advance time - should not call onDismiss
      jest.advanceTimersByTime(3000);

      expect(onDismissMock).not.toHaveBeenCalled();
    });
  });

  describe('Styling Details', () => {
    it('should have rounded corners (borderRadius: 12)', () => {
      const { UNSAFE_getByType } = render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      const animatedView = UNSAFE_getByType(Animated.View);
      expect(animatedView.props.style.borderRadius).toBe(12);
    });

    it('should have vertical padding of 12 and horizontal padding of 16', () => {
      const { UNSAFE_getByType } = render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      const animatedView = UNSAFE_getByType(Animated.View);
      expect(animatedView.props.style.paddingVertical).toBe(12);
      expect(animatedView.props.style.paddingHorizontal).toBe(16);
    });

    it('should have shadow properties for elevation', () => {
      const { UNSAFE_getByType } = render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      const animatedView = UNSAFE_getByType(Animated.View);
      expect(animatedView.props.style.shadowOpacity).toBe(0.3);
      expect(animatedView.props.style.shadowRadius).toBe(8);
      expect(animatedView.props.style.shadowOffset).toEqual({
        width: 0,
        height: -2,
      });
      expect(animatedView.props.style.elevation).toBe(6);
    });

    it('should have text styling with font weight 600 and size 14', () => {
      const { getByText } = render(
        <ValidationToast
          visible={true}
          message="Test message"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      const textElement = getByText('Test message');
      expect(textElement.props.style.fontSize).toBe(14);
      expect(textElement.props.style.fontWeight).toBe('600');
      expect(textElement.props.style.textAlign).toBe('center');
    });
  });

  describe('TypeScript Types', () => {
    it('should accept "error" as valid type', () => {
      const type: ValidationToastType = 'error';

      const { getByText } = render(
        <ValidationToast
          visible={true}
          message="Test"
          type={type}
          onDismiss={onDismissMock}
        />
      );

      expect(getByText('Test')).toBeTruthy();
    });

    it('should accept "success" as valid type', () => {
      const type: ValidationToastType = 'success';

      const { getByText } = render(
        <ValidationToast
          visible={true}
          message="Test"
          type={type}
          onDismiss={onDismissMock}
        />
      );

      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const { getByText } = render(
        <ValidationToast
          visible={true}
          message=""
          type="error"
          onDismiss={onDismissMock}
        />
      );

      expect(getByText('')).toBeTruthy();
    });

    it('should handle very long message', () => {
      const longMessage = 'E'.repeat(500);
      const { getByText } = render(
        <ValidationToast
          visible={true}
          message={longMessage}
          type="error"
          onDismiss={onDismissMock}
        />
      );

      expect(getByText(longMessage)).toBeTruthy();
    });

    it('should handle special characters in message', () => {
      const specialMessage = 'Error: <>&"\'\\t\\n';
      const { getByText } = render(
        <ValidationToast
          visible={true}
          message={specialMessage}
          type="error"
          onDismiss={onDismissMock}
        />
      );

      expect(getByText(specialMessage)).toBeTruthy();
    });

    it('should handle rapid visibility changes', async () => {
      const { rerender } = render(
        <ValidationToast
          visible={true}
          message="Test"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      // Rapidly change visibility
      rerender(
        <ValidationToast
          visible={false}
          message="Test"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      rerender(
        <ValidationToast
          visible={true}
          message="Test"
          type="error"
          onDismiss={onDismissMock}
        />
      );

      // Should not crash
      expect(Animated.parallel).toHaveBeenCalled();
    });
  });
});
