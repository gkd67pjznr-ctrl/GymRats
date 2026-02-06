import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { useThemePackColors, useThemePackMotion } from "../../../lib/themes";
import type { CueMessage } from "../../../lib/buddyTypes";
import { buddies } from "../../../lib/buddyData";
import { playVoiceLine } from "../../../lib/voice/VoiceManager";

interface BuddyMessageToastProps {
  message: CueMessage | null;
  onClear: () => void;
  randomHoldMs: (isHighlight: boolean) => number;
}

export function BuddyMessageToast(props: BuddyMessageToastProps) {
  const colors = useThemePackColors();
  const motion = useThemePackMotion();

  const holdFnRef = useRef(props.randomHoldMs);
  useEffect(() => {
    holdFnRef.current = props.randomHoldMs;
  }, [props.randomHoldMs]);

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageKeyRef = useRef<string>("");

  const messageKey = useMemo(() => {
    if (!props.message) return "";
    // key that changes ONLY when message content changes
    return `${props.message.buddyId}::${props.message.triggerType}::${props.message.text}`;
  }, [props.message]);

  useEffect(() => {
    // No message -> ensure hidden
    if (!props.message) {
      lastMessageKeyRef.current = "";
      opacity.setValue(0);
      scale.setValue(0.8);
      translateY.setValue(20);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      return;
    }

    // Same message as last time -> do nothing (prevents spam)
    if (messageKey && messageKey === lastMessageKeyRef.current) return;
    lastMessageKeyRef.current = messageKey;

    // Clear any previous timer
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;

    // Animate in
    opacity.setValue(0);
    scale.setValue(0.8);
    translateY.setValue(20);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
    ]).start();

    // Play voice line if available (premium+ buddies only)
    if (props.message.voiceLine) {
      playVoiceLine(props.message.voiceLine).catch(() => {
        // Silently ignore voice playback errors
      });
    }

    const isHighlight = props.message.intensity !== "low";
    const holdMs = holdFnRef.current(isHighlight);

    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 200,
          easing: Easing.in(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 20,
          duration: 200,
          easing: Easing.in(Easing.back(1.4)),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageKey, props.message, props.onClear]);

  if (!props.message) return null;

  const buddy = buddies.find(b => b.id === props.message?.buddyId);
  const isLegendary = buddy?.tier === 'legendary';
  const fontSize = props.message.intensity === "low" ? 16 :
                  props.message.intensity === "high" ? 24 : 28;

  // Legendary buddies get special styling from theme
  const accentColor = isLegendary ? colors.secondary : colors.accent;
  const backgroundColor = isLegendary ? `${colors.surface}80` : colors.surface;
  const glowColor = colors.accentGlow ?? colors.accent;

  // Use motion config for glow effect
  const showGlow = motion.enableGlow;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLabel={`${buddy?.name ?? 'Buddy'} says: ${props.message.text}`}
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 1000,
        borderRadius: 16,
        padding: 16,
        backgroundColor,
        opacity,
        transform: [{ scale }, { translateY }],
        shadowColor: showGlow ? (isLegendary ? colors.secondary : glowColor) : 'transparent',
        shadowOpacity: showGlow ? 0.4 : 0,
        shadowRadius: showGlow ? 16 : 0,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
        borderWidth: isLegendary ? 2 : 1,
        borderColor: accentColor,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {buddy?.name || "Buddy"}
            {props.message.intensity === "epic" && " 🔥"}
          </Text>

          <Text
            style={{
              color: colors.text,
              fontSize,
              fontWeight: props.message.intensity === "epic" ? "900" :
                         props.message.intensity === "high" ? "800" : "700",
              lineHeight: fontSize * 1.3,
            }}
          >
            {props.message.text}
          </Text>
        </View>

        {isLegendary && (
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.secondary,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 12,
          }}>
            <Text style={{
              color: colors.background,
              fontSize: 16,
              fontWeight: "900"
            }}>
              ★
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}