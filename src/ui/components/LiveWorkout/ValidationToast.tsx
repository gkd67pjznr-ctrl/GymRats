/**
 * ValidationToast Component
 *
 * Toast notification for validation feedback
 * Positioned at bottom of screen, auto-dismisses after 3 seconds
 *
 * DDD IMPROVE Phase: New component for SPEC-003
 */

import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { useThemeColors } from "../../theme";

export type ValidationToastType = "error" | "success";

export type ValidationToastProps = {
  visible: boolean;
  message: string;
  type: ValidationToastType;
  onDismiss: () => void;
};

const AUTO_DISMISS_MS = 3000;
const ANIMATION_DURATION = 250;

// Design system colors from SPEC
const TOAST_STYLES = {
  error: {
    border: "#FF6B6B",
    background: "#1a1a1a",
  },
  success: {
    border: "#4ECDC4",
    background: "#1a1a1a",
  },
};

// TAG-SPEC-003-IMPROVE-validation-toast-component
/**
 * ValidationToast - Bottom-positioned toast for validation feedback
 *
 * Usage:
 *   <ValidationToast
 *     visible={toastVisible}
 *     message="Invalid weight: cannot exceed 2000 lbs"
 *     type="error"
 *     onDismiss={() => setToastVisible(false)}
 *   />
 */
export function ValidationToast(props: ValidationToastProps) {
  const c = useThemeColors();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (props.visible) {
      // Animate in
      opacity.setValue(0);
      translateY.setValue(20);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 3 seconds
      timerRef.current = setTimeout(() => {
        dismissToast();
      }, AUTO_DISMISS_MS);
    } else {
      // Animate out immediately
      dismissToast();
    }

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [props.visible]);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        props.onDismiss();
      }
    });
  };

  if (!props.visible) {
    return null;
  }

  const style = TOAST_STYLES[props.type];

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingBottom: 16,
        zIndex: 1000,
      }}
    >
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY }],
          borderWidth: 1,
          borderColor: style.border,
          backgroundColor: style.background,
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 16,
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
          elevation: 6,
        }}
      >
        <Text
          style={{
            color: style.border,
            fontSize: 14,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          {props.message}
        </Text>
      </Animated.View>
    </View>
  );
}
