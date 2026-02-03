import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, AppState, AppStateStatus, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from 'expo-haptics';
import { useThemeColors } from "../theme";
import { scheduleRestTimerNotification, cancelRestTimerNotification } from "@/src/lib/notifications/notificationService";
import Svg, { Circle } from "react-native-svg";
import { playSound } from "@/src/lib/sound";
import { isAudioCueEnabled, isRestTimerAudioEnabled, isRestTimerHapticEnabled } from "@/src/lib/sound/soundUtils";

type Props = {
  visible: boolean; // if false, render nothing
  initialSeconds: number;
  onClose: () => void; // hides timer completely
  onDone?: () => void; // called when timer hits 0
  workoutId?: string; // optional workout ID for notification data
};

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function CircularProgress({
  progress,
  size = 100,
  strokeWidth = 8,
  color
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size}>
      <Circle
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        cx={size/2}
        cy={size/2}
        r={radius}
      />
    </Svg>
  );
}

function formatMMSS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}


export function RestTimerOverlay(props: Props) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [appState, setAppState] = useState(AppState.currentState);

  // pill always shows when visible, panel expands on tap
  const [expanded, setExpanded] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(props.initialSeconds);
  const [initialSeconds, setInitialSeconds] = useState(props.initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [scheduledNotificationId, setScheduledNotificationId] = useState<string | null>(null);
  const hasPlayedStartSoundRef = useRef(false);

  // slide animation: panel only (overlay)
  const panelY = useRef(new Animated.Value(220)).current; // off-screen-ish

  useEffect(() => {
    if (!props.visible) return;
    // when shown, reset and start running
    setExpanded(false);
    setSecondsLeft(props.initialSeconds);
    setInitialSeconds(props.initialSeconds);
    setIsRunning(true);
    hasPlayedStartSoundRef.current = false;

    // Clean up any existing notification when timer starts
    cancelRestTimerNotification().catch(console.error);
  }, [props.visible, props.initialSeconds]);

  useEffect(() => {
    if (!props.visible) return;
    if (!isRunning) return;

    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) return 0;
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [props.visible, isRunning]);

  // Handle app state changes for background notifications
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Schedule background notification when timer starts and app is in background
  useEffect(() => {
    if (!props.visible || !isRunning || secondsLeft <= 0) return;

    // Only schedule notification if app is in background
    if (appState !== 'active') {
      scheduleRestTimerNotification(secondsLeft)
        .then((id) => { if (id) setScheduledNotificationId(id); })
        .catch(console.error);
    }
  }, [props.visible, isRunning, secondsLeft, appState]);

  // Play start sound when timer starts
  useEffect(() => {
    if (!props.visible || !isRunning || secondsLeft <= 0) return;
    if (hasPlayedStartSoundRef.current) return;

    if (isAudioCueEnabled('restTimerStart')) {
      playSound('spark').catch(console.error);
    }
    hasPlayedStartSoundRef.current = true;
  }, [props.visible, isRunning, secondsLeft]);

  useEffect(() => {
    if (!props.visible) return;
    if (secondsLeft !== 0) return;

    if (isRestTimerAudioEnabled()) {
      playSound('cheer').catch(console.error);
    }
    if (isRestTimerHapticEnabled()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(console.error);
    }
    setIsRunning(false);
    props.onDone?.();

    // Cancel the notification when timer completes
    if (scheduledNotificationId) {
      cancelRestTimerNotification().catch(console.error);
      setScheduledNotificationId(null);
    }
  }, [secondsLeft, props, scheduledNotificationId]);

  useEffect(() => {
    if (!props.visible) return;

    Animated.spring(panelY, {
      toValue: expanded ? 0 : 220,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
      mass: 0.9,
    }).start();
  }, [expanded, props.visible, panelY]);

  const timeLabel = useMemo(() => formatMMSS(secondsLeft), [secondsLeft]);

  if (!props.visible) return null;

  const SmallBtn = (p: { title: string; onPress: () => void; subtle?: boolean; minW?: number }) => (
    <Pressable
      onPress={p.onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: p.subtle ? c.bg : c.card,
        alignItems: "center",
        justifyContent: "center",
        minWidth: p.minW ?? 64,
      }}
    >
      <Text style={{ color: c.text, fontWeight: "900", fontSize: 12 }}>{p.title}</Text>
    </Pressable>
  );

  return (
    <>
      {/* PILL TAB (always overlay, never pushes layout) */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: Math.max(insets.bottom, 14) + 70, // Account for tab bar + safe area
          zIndex: 999,
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          style={{
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.card,
            borderRadius: 999,
            paddingVertical: 10,
            paddingHorizontal: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,

            // subtle but visible
            shadowOpacity: 0.16,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
          }}
        >
          <Text style={{ color: c.muted, fontWeight: "900", fontSize: 12 }}>Rest</Text>
          <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>{timeLabel}</Text>

          <View style={{ width: 1, height: 18, backgroundColor: c.border, opacity: 0.8 }} />

          <Text style={{ color: c.muted, fontWeight: "900", fontSize: 12 }}>
            {expanded ? "Hide" : "Show"}
          </Text>
        </Pressable>
      </View>

      {/* SLIDE-IN PANEL (overlay only; compact) */}
      <Animated.View
        pointerEvents={expanded ? "auto" : "none"}
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: Math.max(insets.bottom, 14) + 130, // Account for tab bar + pill + safe area
          zIndex: 1000,
          transform: [{ translateY: panelY }],
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.card,
            borderRadius: 16,
            padding: 12,
            gap: 10,

            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 10,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: c.text, fontWeight: "900" }}>Rest Timer</Text>

            <Pressable
              onPress={() => setExpanded(false)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.bg,
              }}
            >
              <Text style={{ color: c.text, fontWeight: "900", fontSize: 12 }}>Close</Text>
            </Pressable>
          </View>

          <View style={{ alignItems: "center", justifyContent: "center", marginVertical: 10 }}>
            <View style={{ position: "relative", width: 120, height: 120, alignItems: "center", justifyContent: "center" }}>
              <CircularProgress
                progress={initialSeconds > 0 ? 1 - (secondsLeft / initialSeconds) : 0}
                size={120}
                strokeWidth={6}
                color={c.primary}
              />
              <Text style={{ position: "absolute", color: c.text, fontWeight: "900", fontSize: 32 }}>
                {timeLabel}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <SmallBtn
              title={isRunning ? "Pause" : "Start"}
              onPress={() => setIsRunning((v) => !v)}
              minW={74}
            />
            <SmallBtn title="+15s" onPress={() => setSecondsLeft((s) => clampInt(s + 15, 0, 3600))} subtle />
            <SmallBtn title="-15s" onPress={() => setSecondsLeft((s) => clampInt(s - 15, 0, 3600))} subtle />
            <SmallBtn
              title="Reset"
              onPress={() => {
                setSecondsLeft(props.initialSeconds);
                setInitialSeconds(props.initialSeconds);
                setIsRunning(true);
                hasPlayedStartSoundRef.current = false;
              }}
              subtle
            />
            <SmallBtn
              title="Dismiss"
              onPress={() => {
                setExpanded(false);
                props.onClose();
              }}
              subtle
              minW={80}
            />
          </View>

          {/* tiny hint line */}
          <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>
            Tip: Tap the pill to show/hide.
          </Text>
        </View>
      </Animated.View>
    </>
  );
}
