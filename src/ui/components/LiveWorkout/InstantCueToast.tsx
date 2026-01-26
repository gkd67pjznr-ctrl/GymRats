// src/ui/components/LiveWorkout/InstantCueToast.tsx
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Text } from "react-native";
import { useThemeColors } from "../../../ui/theme";

export type InstantCue = {
  message: string;
  detail?: string;
  intensity: "low" | "high";
};

export function InstantCueToast(props: {
  cue: InstantCue | null;
  onClear: () => void;
  // NOTE: this is intentionally NOT used as a dependency; we stash it in a ref
  // to avoid "effect re-runs every render" spam.
  randomHoldMs: (isHighlight: boolean) => number;
}) {
  const c = useThemeColors();

  const holdFnRef = useRef(props.randomHoldMs);
  useEffect(() => {
    holdFnRef.current = props.randomHoldMs;
  }, [props.randomHoldMs]);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-18)).current;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCueKeyRef = useRef<string>("");

  const cueKey = useMemo(() => {
    if (!props.cue) return "";
    // key that changes ONLY when cue content changes
    return `${props.cue.intensity}::${props.cue.message}::${props.cue.detail ?? ""}`;
  }, [props.cue]);

  useEffect(() => {
    // No cue -> ensure hidden
    if (!props.cue) {
      lastCueKeyRef.current = "";
      opacity.setValue(0);
      translateY.setValue(-18);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      return;
    }

    // Same cue as last time -> do nothing (prevents spam)
    if (cueKey && cueKey === lastCueKeyRef.current) return;
    lastCueKeyRef.current = cueKey;

    // Clear any previous timer
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;

    // Animate in
    opacity.setValue(0);
    translateY.setValue(-18);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const isHighlight = props.cue.intensity !== "low";
    const holdMs = holdFnRef.current(isHighlight);

    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) props.onClear();
      });

      timerRef.current = null;
    }, holdMs);

    // Cleanup
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
    // IMPORTANT: do NOT depend on props.randomHoldMs (we ref it)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cueKey, props.cue, props.onClear, opacity, translateY]);

  if (!props.cue) return null;

  const toastFontSize = props.cue.intensity === "low" ? 16 : 28;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        right: 12,
        zIndex: 1000,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: c.card,
        opacity,
        transform: [{ translateY }],
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}
    >
      <Text style={{ color: c.muted, marginBottom: 4, fontSize: 12 }}>Cue</Text>

      <Text
        style={{
          color: c.text,
          fontSize: toastFontSize,
          fontWeight: props.cue.intensity === "high" ? "800" : "700",
        }}
      >
        {props.cue.message}
      </Text>

      {!!props.cue.detail && (
        <Text style={{ color: c.muted, marginTop: 6, fontSize: 13 }}>{props.cue.detail}</Text>
      )}
    </Animated.View>
  );
}
