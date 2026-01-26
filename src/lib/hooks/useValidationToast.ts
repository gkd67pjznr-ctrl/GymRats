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

// Optional runtime requires (no-op if not installed)
let Haptics: any = null;
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
