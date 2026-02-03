/**
 * End-to-End Integration Tests for Validation Flow
 *
 * SPEC-003 - Input Validation with Toast Feedback
 *
 * Test Requirements:
 * 1. User types invalid weight → error toast appears with haptic feedback
 * 2. User corrects input → toast disappears
 * 3. User types valid weight and reps → set logged → success toast appears
 * 4. Toast auto-dismisses after 3 seconds
 * 5. Multiple validation errors show sequentially
 *
 * Test Coverage:
 * - Complete validation flow from invalid input to successful set logging
 * - Haptic feedback integration with expo-haptics
 * - Toast lifecycle management (show, auto-dismiss, manual dismiss)
 * - Sequential validation error handling
 * - Integration between useLiveWorkoutSession, useValidationToast, ValidationToast, and QuickAddSetCard
 *
 * @module __tests__/integration/validation-flow
 */

import React, { ReactElement } from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import { TextInput } from 'react-native';
import { Animated } from 'react-native';

// @ts-ignore - UNSAFE_UNSAFE_getAllByType exists but may not be in types
const { UNSAFE_UNSAFE_getAllByType } = render;

// Mock expo-haptics for haptic feedback
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  selectionAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  getAllKeys: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
  multiGet: jest.fn().mockResolvedValue([]),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-router navigation
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useSegments: () => [],
  usePathname: () => '/live-workout',
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

// Mock useThemeColors
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

// Mock NumberInput to render actual TextInput components for testing
jest.mock('@/src/ui/components/LiveWorkout/NumberInput', () => {
  const { View, Text, TextInput, Pressable } = require('react-native');
  return {
    NumberInput: jest.fn(({ value, textValue, onTextChange, onIncrement, onDecrement, onCommit, label, unit }: any) => (
      <View>
        <Text>{label}</Text>
        <TextInput
          testID={`input-${label}`}
          value={textValue}
          onChangeText={onTextChange}
          onBlur={onCommit}
        />
        <Pressable onPress={onIncrement}><Text>+</Text></Pressable>
        <Pressable onPress={onDecrement}><Text>-</Text></Pressable>
      </View>
    )),
  };
});

// Mock FR (GrStyle)
jest.mock('@/src/ui/GrStyle', () => ({
  FR: {
    space: { x1: 4, x2: 8, x3: 12, x4: 16, x5: 20, x6: 24 },
    radius: { button: 12, card: 20, input: 8, soft: 6 },
    type: {
      h1: { fontSize: 32, fontWeight: '900' },
      h2: { fontSize: 24, fontWeight: '900' },
      sub: { fontSize: 14, fontWeight: '500' },
      body: { fontSize: 16, fontWeight: '400' },
      mono: { fontSize: 14, fontFamily: 'monospace' },
    },
  },
}));

// Use fake timers for predictable auto-dismiss testing
jest.useFakeTimers();

import { useLiveWorkoutSession, ValidationCallbacks } from '@/src/lib/hooks/useLiveWorkoutSession';
import { useValidationToast } from '@/src/lib/hooks/useValidationToast';
import { ValidationToast } from '@/src/ui/components/LiveWorkout/ValidationToast';
import { QuickAddSetCard } from '@/src/ui/components/LiveWorkout/QuickAddSetCard';
import * as Haptics from 'expo-haptics';

/**
 * Test Component: Integration of validation flow components
 *
 * This component integrates:
 * - useLiveWorkoutSession (with validation callbacks)
 * - useValidationToast (toast state and haptic feedback)
 * - ValidationToast (visual feedback component)
 * - QuickAddSetCard (input component)
 */
function ValidationFlowIntegration(): ReactElement {
  const { toast, showError, showSuccess, dismiss } = useValidationToast();

  const validationCallbacks: ValidationCallbacks = {
    onError: showError,
    onSuccess: showSuccess,
    onDismiss: dismiss,
  };

  const session = useLiveWorkoutSession(
    { weightLb: 135, reps: 8 },
    validationCallbacks
  );

  return (
    <React.Fragment>
      <QuickAddSetCard
        weightLb={session.weightLb}
        reps={session.reps}
        weightLbText={session.weightLbText}
        repsText={session.repsText}
        onWeightText={session.onWeightText}
        onRepsText={session.onRepsText}
        onWeightCommit={session.onWeightCommit}
        onRepsCommit={session.onRepsCommit}
        onDecWeight={session.decWeight}
        onIncWeight={session.incWeight}
        onDecReps={session.decReps}
        onIncReps={session.incReps}
        onAddSet={() => session.addSet('bench')}
      />
      <ValidationToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={dismiss}
      />
    </React.Fragment>
  );
}

describe('Validation Flow - End-to-End Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Test Requirement 1: Invalid Weight Triggers Error Toast with Haptics', () => {
    it('should show error toast when user types weight exceeding 2000 lbs', async () => {
      const { getByText, getByPlaceholderText, UNSAFE_getAllByType } = render(
        <ValidationFlowIntegration />
      );

      // Find weight input (first TextInput)
      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // Type invalid weight (exceeds 2000 lbs)
      await act(async () => {
        fireEvent.changeText(weightInput, '2500');
        fireEvent(weightInput, 'blur');
      });

      // Verify error toast is shown
      await waitFor(() => {
        const errorToast = getByText('Weight cannot exceed 2000 lbs');
        expect(errorToast).toBeTruthy();
      });

      // Verify haptic feedback was triggered
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });

    it('should show error toast when user types negative weight', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // Type invalid weight (negative)
      await act(async () => {
        fireEvent.changeText(weightInput, '-10');
        fireEvent(weightInput, 'blur');
      });

      // Verify error toast
      await waitFor(() => {
        const errorToast = getByText('Weight cannot be negative');
        expect(errorToast).toBeTruthy();
      });

      // Verify haptic feedback
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });

    it('should show error toast when user types non-numeric weight', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // Type invalid weight (not a number)
      await act(async () => {
        fireEvent.changeText(weightInput, 'abc');
        fireEvent(weightInput, 'blur');
      });

      // Verify error toast
      await waitFor(() => {
        const errorToast = getByText('Weight must be a number');
        expect(errorToast).toBeTruthy();
      });

      // Verify haptic feedback
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });

    it('should show error toast when user types invalid reps (below 1)', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const repsInput = textInputs[1];

      // Type invalid reps (0)
      await act(async () => {
        fireEvent.changeText(repsInput, '0');
        fireEvent(repsInput, 'blur');
      });

      // Verify error toast
      await waitFor(() => {
        const errorToast = getByText('Reps must be at least 1');
        expect(errorToast).toBeTruthy();
      });

      // Verify haptic feedback
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });

    it('should show error toast when user types invalid reps (exceeds 100)', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const repsInput = textInputs[1];

      // Type invalid reps (exceeds 100)
      await act(async () => {
        fireEvent.changeText(repsInput, '150');
        fireEvent(repsInput, 'blur');
      });

      // Verify error toast
      await waitFor(() => {
        const errorToast = getByText('Reps cannot exceed 100');
        expect(errorToast).toBeTruthy();
      });

      // Verify haptic feedback
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });
  });

  describe('Test Requirement 2: Toast Disappears on Correction', () => {
    it('should dismiss error toast when user corrects invalid weight to valid value', async () => {
      const { getByText, queryByText, UNSAFE_getAllByType } = render(
        <ValidationFlowIntegration />
      );

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // Type invalid weight
      await act(async () => {
        fireEvent.changeText(weightInput, '3000');
        fireEvent(weightInput, 'blur');
      });

      // Verify error toast appears
      await waitFor(() => {
        expect(getByText('Weight cannot exceed 2000 lbs')).toBeTruthy();
      });

      // Type valid weight
      await act(async () => {
        fireEvent.changeText(weightInput, '185');
        fireEvent(weightInput, 'blur');
      });

      // Verify error toast disappears (no longer in DOM)
      await waitFor(() => {
        expect(queryByText('Weight cannot exceed 2000 lbs')).toBeNull();
      });
    });

    it('should dismiss error toast when user corrects invalid reps to valid value', async () => {
      const { getByText, queryByText, UNSAFE_getAllByType } = render(
        <ValidationFlowIntegration />
      );

      const textInputs = UNSAFE_getAllByType(TextInput);
      const repsInput = textInputs[1];

      // Type invalid reps
      await act(async () => {
        fireEvent.changeText(repsInput, '0');
        fireEvent(repsInput, 'blur');
      });

      // Verify error toast appears
      await waitFor(() => {
        expect(getByText('Reps must be at least 1')).toBeTruthy();
      });

      // Type valid reps
      await act(async () => {
        fireEvent.changeText(repsInput, '10');
        fireEvent(repsInput, 'blur');
      });

      // Verify error toast disappears
      await waitFor(() => {
        expect(queryByText('Reps must be at least 1')).toBeNull();
      });
    });
  });

  describe('Test Requirement 3: Valid Input Shows Success Toast', () => {
    it('should show success toast when user logs set with valid weight and reps', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];
      const repsInput = textInputs[1];

      // Enter valid weight
      await act(async () => {
        fireEvent.changeText(weightInput, '225');
      });

      // Enter valid reps
      await act(async () => {
        fireEvent.changeText(repsInput, '5');
      });

      // Click "Add Set" button
      const addSetButton = getByText('Add Set');
      await act(async () => {
        fireEvent.press(addSetButton);
      });

      // Verify success toast
      await waitFor(() => {
        const successToast = getByText('Set logged!');
        expect(successToast).toBeTruthy();
      });

      // Verify success haptic feedback
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('should show success toast with valid minimum weight and reps (1 rep, 0 lbs)', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];
      const repsInput = textInputs[1];

      // Enter minimum valid weight
      await act(async () => {
        fireEvent.changeText(weightInput, '0');
      });

      // Enter minimum valid reps
      await act(async () => {
        fireEvent.changeText(repsInput, '1');
      });

      // Click "Add Set" button
      const addSetButton = getByText('Add Set');
      await act(async () => {
        fireEvent.press(addSetButton);
      });

      // Verify success toast
      await waitFor(() => {
        expect(getByText('Set logged!')).toBeTruthy();
      });
    });

    it('should show success toast with valid maximum weight and reps (2000 lbs, 100 reps)', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];
      const repsInput = textInputs[1];

      // Enter maximum valid weight
      await act(async () => {
        fireEvent.changeText(weightInput, '2000');
      });

      // Enter maximum valid reps
      await act(async () => {
        fireEvent.changeText(repsInput, '100');
      });

      // Click "Add Set" button
      const addSetButton = getByText('Add Set');
      await act(async () => {
        fireEvent.press(addSetButton);
      });

      // Verify success toast
      await waitFor(() => {
        expect(getByText('Set logged!')).toBeTruthy();
      });
    });
  });

  describe('Test Requirement 4: Toast Auto-Dismisses After 3 Seconds', () => {
    it('should auto-dismiss error toast after 3000ms', async () => {
      const { getByText, queryByText, UNSAFE_getAllByType } = render(
        <ValidationFlowIntegration />
      );

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // Trigger error toast
      await act(async () => {
        fireEvent.changeText(weightInput, '5000');
        fireEvent(weightInput, 'blur');
      });

      // Verify error toast appears
      await waitFor(() => {
        expect(getByText('Weight cannot exceed 2000 lbs')).toBeTruthy();
      });

      // Fast-forward 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Verify toast is dismissed
      await waitFor(() => {
        expect(queryByText('Weight cannot exceed 2000 lbs')).toBeNull();
      });
    });

    it('should auto-dismiss success toast after 3000ms', async () => {
      const { getByText, queryByText, UNSAFE_getAllByType } = render(
        <ValidationFlowIntegration />
      );

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];
      const repsInput = textInputs[1];

      // Trigger success toast
      await act(async () => {
        fireEvent.changeText(weightInput, '185');
        fireEvent.changeText(repsInput, '8');
      });

      const addSetButton = getByText('Add Set');
      await act(async () => {
        fireEvent.press(addSetButton);
      });

      // Verify success toast appears
      await waitFor(() => {
        expect(getByText('Set logged!')).toBeTruthy();
      });

      // Fast-forward 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Verify toast is dismissed
      await waitFor(() => {
        expect(queryByText('Set logged!')).toBeNull();
      });
    });

    it('should not dismiss toast before 3000ms', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // Trigger error toast
      await act(async () => {
        fireEvent.changeText(weightInput, '-100');
        fireEvent(weightInput, 'blur');
      });

      // Verify error toast appears
      await waitFor(() => {
        expect(getByText('Weight cannot be negative')).toBeTruthy();
      });

      // Fast-forward less than 3 seconds (2500ms)
      act(() => {
        jest.advanceTimersByTime(2500);
      });

      // Toast should still be visible
      expect(getByText('Weight cannot be negative')).toBeTruthy();
    });
  });

  describe('Test Requirement 5: Multiple Validation Errors Show Sequentially', () => {
    it('should show multiple error toasts one after another for different validation errors', async () => {
      const { getByText, queryByText, UNSAFE_getAllByType } = render(
        <ValidationFlowIntegration />
      );

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // First error: weight exceeds max
      await act(async () => {
        fireEvent.changeText(weightInput, '3000');
        fireEvent(weightInput, 'blur');
      });

      // Verify first error toast
      await waitFor(() => {
        expect(getByText('Weight cannot exceed 2000 lbs')).toBeTruthy();
      });

      // Dismiss first toast (auto-dismiss after 3s)
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(queryByText('Weight cannot exceed 2000 lbs')).toBeNull();
      });

      // Second error: negative weight
      await act(async () => {
        fireEvent.changeText(weightInput, '-50');
        fireEvent(weightInput, 'blur');
      });

      // Verify second error toast replaces first
      await waitFor(() => {
        expect(getByText('Weight cannot be negative')).toBeTruthy();
        expect(queryByText('Weight cannot exceed 2000 lbs')).toBeNull();
      });

      // Dismiss second toast
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(queryByText('Weight cannot be negative')).toBeNull();
      });

      // Third error: non-numeric weight
      await act(async () => {
        fireEvent.changeText(weightInput, 'invalid');
        fireEvent(weightInput, 'blur');
      });

      // Verify third error toast
      await waitFor(() => {
        expect(getByText('Weight must be a number')).toBeTruthy();
        expect(queryByText('Weight cannot be negative')).toBeNull();
      });
    });

    it('should handle rapid sequential validation errors', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // Rapidly trigger different errors
      await act(async () => {
        fireEvent.changeText(weightInput, '5000');
        fireEvent(weightInput, 'blur');
      });

      // First error
      await waitFor(() => {
        expect(getByText('Weight cannot exceed 2000 lbs')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.changeText(weightInput, 'abc');
        fireEvent(weightInput, 'blur');
      });

      // Second error replaces first
      await waitFor(() => {
        expect(getByText('Weight must be a number')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.changeText(weightInput, '-100');
        fireEvent(weightInput, 'blur');
      });

      // Third error replaces second
      await waitFor(() => {
        expect(getByText('Weight cannot be negative')).toBeTruthy();
      });

      // Verify haptic feedback was called for each error
      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(3);
    });

    it('should transition from error to success toast', async () => {
      const { getByText, queryByText, UNSAFE_getAllByType } = render(
        <ValidationFlowIntegration />
      );

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];
      const repsInput = textInputs[1];

      // Trigger error
      await act(async () => {
        fireEvent.changeText(weightInput, '10000');
        fireEvent(weightInput, 'blur');
      });

      // Verify error toast
      await waitFor(() => {
        expect(getByText('Weight cannot exceed 2000 lbs')).toBeTruthy();
      });

      // Auto-dismiss error
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(queryByText('Weight cannot exceed 2000 lbs')).toBeNull();
      });

      // Trigger success with valid input
      await act(async () => {
        fireEvent.changeText(weightInput, '225');
        fireEvent.changeText(repsInput, '5');
      });

      const addSetButton = getByText('Add Set');
      await act(async () => {
        fireEvent.press(addSetButton);
      });

      // Verify success toast
      await waitFor(() => {
        expect(getByText('Set logged!')).toBeTruthy();
      });

      // Verify both haptic types were called
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });
  });

  describe('Haptic Feedback Integration', () => {
    it('should trigger error haptic for weight validation errors', async () => {
      const { UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      await act(async () => {
        fireEvent.changeText(weightInput, '9999');
        fireEvent(weightInput, 'blur');
      });

      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Error
        );
      });
    });

    it('should trigger error haptic for reps validation errors', async () => {
      const { UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const repsInput = textInputs[1];

      await act(async () => {
        fireEvent.changeText(repsInput, '200');
        fireEvent(repsInput, 'blur');
      });

      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Error
        );
      });
    });

    it('should trigger success haptic when set is logged', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];
      const repsInput = textInputs[1];

      await act(async () => {
        fireEvent.changeText(weightInput, '185');
        fireEvent.changeText(repsInput, '8');
      });

      const addSetButton = getByText('Add Set');
      await act(async () => {
        fireEvent.press(addSetButton);
      });

      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Success
        );
      });
    });

    it('should handle haptic errors gracefully (no-op on failure)', async () => {
      // Mock haptics to throw error
      (Haptics.notificationAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Haptic unavailable')
      );

      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // Should not throw despite haptic error
      await act(async () => {
        fireEvent.changeText(weightInput, '5000');
        fireEvent(weightInput, 'blur');
      });

      // Toast should still appear
      await waitFor(() => {
        expect(getByText('Weight cannot exceed 2000 lbs')).toBeTruthy();
      });
    });
  });

  describe('Input State Management', () => {
    it('should preserve valid input state after validation error is corrected', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // Type invalid weight
      await act(async () => {
        fireEvent.changeText(weightInput, 'abc');
        fireEvent(weightInput, 'blur');
      });

      // Verify error
      await waitFor(() => {
        expect(getByText('Weight must be a number')).toBeTruthy();
      });

      // Type valid weight
      await act(async () => {
        fireEvent.changeText(weightInput, '200.5');
        fireEvent(weightInput, 'blur');
      });

      // Verify no error and input is preserved
      await waitFor(() => {
        expect(weightInput.props.value).toBe('200.5');
      });
    });

    it('should reset input to last valid value on validation error', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // Start with valid weight
      await act(async () => {
        fireEvent.changeText(weightInput, '185');
        fireEvent(weightInput, 'blur');
      });

      // Type invalid weight
      await act(async () => {
        fireEvent.changeText(weightInput, '9999');
        fireEvent(weightInput, 'blur');
      });

      // Verify error and reset to previous valid value
      await waitFor(() => {
        expect(getByText('Weight cannot exceed 2000 lbs')).toBeTruthy();
        expect(weightInput.props.value).toBe('185.0');
      });
    });

    it('should handle decimal inputs correctly', async () => {
      const { getByText, queryByText, UNSAFE_getAllByType } = render(
        <ValidationFlowIntegration />
      );

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // Type valid decimal weight
      await act(async () => {
        fireEvent.changeText(weightInput, '187.5');
        fireEvent(weightInput, 'blur');
      });

      // Should not show error (regex excludes the "Weight" label text)
      expect(queryByText(/Weight cannot/)).toBeNull();
      expect(weightInput.props.value).toBe('187.5');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty weight input gracefully', async () => {
      const { UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // Type empty input
      await act(async () => {
        fireEvent.changeText(weightInput, '');
        fireEvent(weightInput, 'blur');
      });

      // Should not crash or show error (empty is treated as 0, formatted as "0.0")
      expect(weightInput.props.value).toBe('0.0');
    });

    it('should handle empty reps input gracefully', async () => {
      const { UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const repsInput = textInputs[1];

      // Type empty input
      await act(async () => {
        fireEvent.changeText(repsInput, '');
        fireEvent(repsInput, 'blur');
      });

      // Should not crash (empty is treated as 0)
      expect(repsInput.props.value).toBe('0');
    });

    it('should handle boundary values (2000 lbs)', async () => {
      const { queryByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];

      // Type exact boundary value
      await act(async () => {
        fireEvent.changeText(weightInput, '2000');
        fireEvent(weightInput, 'blur');
      });

      // Should not show error (2000 is valid)
      expect(queryByText(/Weight cannot/)).toBeNull();
    });

    it('should handle boundary values (100 reps)', async () => {
      const { queryByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const repsInput = textInputs[1];

      // Type exact boundary value
      await act(async () => {
        fireEvent.changeText(repsInput, '100');
        fireEvent(repsInput, 'blur');
      });

      // Should not show error (100 is valid)
      expect(queryByText(/Reps cannot/)).toBeNull();
    });

    it('should reject values just above boundaries', async () => {
      const { getByText, UNSAFE_getAllByType } = render(<ValidationFlowIntegration />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];
      const repsInput = textInputs[1];

      // Type weight just above boundary
      await act(async () => {
        fireEvent.changeText(weightInput, '2000.1');
        fireEvent(weightInput, 'blur');
      });

      await waitFor(() => {
        expect(getByText('Weight cannot exceed 2000 lbs')).toBeTruthy();
      });

      // Type reps just above boundary
      await act(async () => {
        fireEvent.changeText(repsInput, '101');
        fireEvent(repsInput, 'blur');
      });

      await waitFor(() => {
        expect(getByText('Reps cannot exceed 100')).toBeTruthy();
      });
    });
  });

  describe('Integration with Session State', () => {
    it('should update session state when valid set is added', async () => {
      let capturedSession: any = null;

      // Capture session state
      const TestWrapper = (): ReactElement => {
        const { toast, showError, showSuccess, dismiss } = useValidationToast();

        const callbacks: ValidationCallbacks = {
          onError: showError,
          onSuccess: showSuccess,
          onDismiss: dismiss,
        };

        const session = useLiveWorkoutSession(
          { weightLb: 135, reps: 8 },
          callbacks
        );

        // Capture session state
        if (session.sets.length > 0 && !capturedSession) {
          capturedSession = session;
        }

        return (
          <React.Fragment>
            <QuickAddSetCard
              weightLb={session.weightLb}
              reps={session.reps}
              weightLbText={session.weightLbText}
              repsText={session.repsText}
              onWeightText={session.onWeightText}
              onRepsText={session.onRepsText}
              onWeightCommit={session.onWeightCommit}
              onRepsCommit={session.onRepsCommit}
              onDecWeight={session.decWeight}
              onIncWeight={session.incWeight}
              onDecReps={session.decReps}
              onIncReps={session.incReps}
              onAddSet={() => session.addSet('bench')}
            />
            <ValidationToast
              visible={toast.visible}
              message={toast.message}
              type={toast.type}
              onDismiss={dismiss}
            />
          </React.Fragment>
        );
      };

      const { getByText, UNSAFE_getAllByType } = render(<TestWrapper />);

      const textInputs = UNSAFE_getAllByType(TextInput);
      const weightInput = textInputs[0];
      const repsInput = textInputs[1];

      // Enter valid values
      await act(async () => {
        fireEvent.changeText(weightInput, '225');
        fireEvent.changeText(repsInput, '5');
      });

      // Add set
      const addSetButton = getByText('Add Set');
      await act(async () => {
        fireEvent.press(addSetButton);
      });

      // Verify session was updated
      await waitFor(() => {
        expect(capturedSession).not.toBeNull();
        expect(capturedSession.sets.length).toBe(1);
        expect(capturedSession.sets[0].exerciseId).toBe('bench');
      });
    });
  });
});
