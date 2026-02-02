/**
 * Characterization tests for useValidationToast hook
 *
 * DDD PRESERVE Phase: Creating safety net for validation toast behavior
 */

// Mock expo-haptics before importing the hook
import { renderHook, act } from '@testing-library/react-native';
import { useValidationToast } from '../useValidationToast';

jest.mock('expo-haptics', () => ({
  NotificationFeedbackType: {
    Error: 'error',
    Success: 'success',
    Warning: 'warning',
  },
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('useValidationToast - Characterization Tests', () => {
  test('should initialize with invisible toast', () => {
    const { result } = renderHook(() => useValidationToast());

    expect(result.current.toast.visible).toBe(false);
    expect(result.current.toast.message).toBe("");
    expect(result.current.toast.type).toBe("error");
  });

  test('should show error toast when showError is called', () => {
    const { result } = renderHook(() => useValidationToast());

    act(() => {
      result.current.showError("Invalid weight");
    });

    expect(result.current.toast.visible).toBe(true);
    expect(result.current.toast.message).toBe("Invalid weight");
    expect(result.current.toast.type).toBe("error");
  });

  test('should show success toast when showSuccess is called', () => {
    const { result } = renderHook(() => useValidationToast());

    act(() => {
      result.current.showSuccess("Set logged!");
    });

    expect(result.current.toast.visible).toBe(true);
    expect(result.current.toast.message).toBe("Set logged!");
    expect(result.current.toast.type).toBe("success");
  });

  test('should dismiss toast when dismiss is called', () => {
    const { result } = renderHook(() => useValidationToast());

    act(() => {
      result.current.showError("Error message");
    });

    expect(result.current.toast.visible).toBe(true);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toast.visible).toBe(false);
  });

  test('should replace existing toast when new error is shown', () => {
    const { result } = renderHook(() => useValidationToast());

    act(() => {
      result.current.showError("First error");
    });

    act(() => {
      result.current.showError("Second error");
    });

    expect(result.current.toast.message).toBe("Second error");
  });

  test('should switch from error to success toast', () => {
    const { result } = renderHook(() => useValidationToast());

    act(() => {
      result.current.showError("Error");
    });

    expect(result.current.toast.type).toBe("error");

    act(() => {
      result.current.showSuccess("Success");
    });

    expect(result.current.toast.type).toBe("success");
    expect(result.current.toast.message).toBe("Success");
  });
});
