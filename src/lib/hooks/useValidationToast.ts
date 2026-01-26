/**
 * useValidationToast Hook
 *
 * Custom hook to manage validation toast state and haptic feedback
 *
 * DDD IMPROVE Phase: New hook for SPEC-003
 */

import { useCallback, useState } from "react";

export type ValidationToastType = "error" | "success";

export type ValidationToastState = {
  visible: boolean;
  message: string;
  type: ValidationToastType;
};

/**
 * Type definition for expo-haptics NotificationFeedbackType
 *
 * Graceful fallback pattern: Allows the app to function even when
 * expo-haptics is not installed (e.g., web environments)
 */
type NotificationFeedbackType = "success" | "warning" | "error";

/**
 * Interface for optional expo-haptics module
 *
 * This interface provides type safety for optional haptic feedback.
 * The module is loaded dynamically at runtime and defaults to null
 * if expo-haptics is not installed.
 */
interface HapticsModule {
  notificationAsync(type: NotificationFeedbackType): Promise<void>;
  readonly NotificationFeedbackType: {
    readonly Success: "success";
    readonly Warning: "warning";
    readonly Error: "error";
  };
}

// Optional runtime requires (no-op if not installed)
let Haptics: HapticsModule | null = null;
try {
  Haptics = require("expo-haptics");
} catch {
  // expo-haptics not available, haptic feedback will be no-op
  Haptics = null;
}

export type UseValidationToastResult = {
  toast: ValidationToastState;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  dismiss: () => void;
};

// TAG-SPEC-003-IMPROVE-validation-toast-hook
/**
 * Hook for managing validation toast notifications with haptic feedback
 *
 * Usage:
 *   const { toast, showError, showSuccess, dismiss } = useValidationToast();
 *
 *   // Show error with error haptic
 *   showError("Weight cannot exceed 2000 lbs");
 *
 *   // Show success with success haptic
 *   showSuccess("Set logged!");
 *
 *   // Dismiss manually (also auto-dismisses after 3 seconds)
 *   dismiss();
 */
export function useValidationToast(): UseValidationToastResult {
  const [toast, setToast] = useState<ValidationToastState>({
    visible: false,
    message: "",
    type: "error",
  });

  const showError = useCallback((message: string) => {
    setToast({ visible: true, message, type: "error" });

    // Trigger error haptic feedback
    if (Haptics) {
      Haptics.notificationAsync?.(
        Haptics.NotificationFeedbackType.Error
      ).catch?.(() => {});
    }
  }, []);

  const showSuccess = useCallback((message: string) => {
    setToast({ visible: true, message, type: "success" });

    // Trigger success haptic feedback
    if (Haptics) {
      Haptics.notificationAsync?.(
        Haptics.NotificationFeedbackType.Success
      ).catch?.(() => {});
    }
  }, []);

  const dismiss = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    toast,
    showError,
    showSuccess,
    dismiss,
  };
}
