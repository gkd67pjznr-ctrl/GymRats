import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, AppState, AppStateStatus, Pressable, Text, View, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from 'expo-haptics';
import { useThemeColors } from "../theme";
import { scheduleRestTimerNotification, cancelRestTimerNotification } from "@/src/lib/notifications/notificationService";
import { playSound } from "@/src/lib/sound";
import { isAudioCueEnabled, isRestTimerAudioEnabled, isRestTimerHapticEnabled } from "@/src/lib/sound/soundUtils";
import { workoutDrawerActions } from "@/src/lib/stores/workoutDrawerStore";

type Props = {
  visible: boolean; // if false, render nothing
  initialSeconds: number;
  onClose: () => void; // hides timer completely
  onDone?: () => void; // called when timer hits 0
  workoutId?: string; // optional workout ID for notification data
  startedAtMs?: number | null; // if provided, sync timer with this start time
};

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.floor(n)));
}

const SCREEN_WIDTH = Dimensions.get('window').width;

function LinearProgress({
  progress,
  color,
  backgroundColor,
}: {
  progress: number;
  color: string;
  backgroundColor: string;
}) {
  const width = SCREEN_WIDTH - 48; // Full width minus padding

  return (
    <View
      style={{
        width,
        height: 8,
        borderRadius: 4,
        backgroundColor,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: width * Math.max(0, Math.min(1, progress)),
          height: '100%',
          borderRadius: 4,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

function formatMMSS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

// Compact format for collapsed pill: seconds until 90s, then minute increments
function formatCompact(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s <= 90) {
    return `${s}s`;
  }
  // Round up to nearest minute for display
  const minutes = Math.ceil(s / 60);
  return `${minutes}m`;
}


export function RestTimerOverlay(props: Props) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [appState, setAppState] = useState(AppState.currentState);

  // pill always shows when visible, panel expands on tap
  const [expanded, setExpanded] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(props.initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(props.initialSeconds); // Track total for progress
  const [isRunning, setIsRunning] = useState(true);
  const [scheduledNotificationId, setScheduledNotificationId] = useState<string | null>(null);
  const hasPlayedStartSoundRef = useRef(false);

  // Track paused time offset for accurate pause/resume
  const pausedAtRef = useRef<number | null>(null);
  const timeOffsetRef = useRef(0);

  // slide animation: panel only (overlay)
  const panelY = useRef(new Animated.Value(220)).current; // off-screen-ish

  // Reset timer when visibility changes
  // Calculate remaining time from startedAtMs to maintain continuity across drawer collapse/expand
  useEffect(() => {
    if (!props.visible) return;

    // Calculate remaining time based on startedAtMs if available
    let remaining = props.initialSeconds;
    if (props.startedAtMs) {
      const elapsedSec = Math.floor((Date.now() - props.startedAtMs) / 1000);
      remaining = Math.max(0, props.initialSeconds - elapsedSec);
    }

    setExpanded(false);
    setSecondsLeft(remaining);
    setTotalSeconds(props.initialSeconds);
    setIsRunning(remaining > 0);
    pausedAtRef.current = null;
    timeOffsetRef.current = 0;

    // Only reset sound flag if this is a truly fresh timer (not a resume)
    if (!props.startedAtMs || remaining === props.initialSeconds) {
      hasPlayedStartSoundRef.current = false;
    }

    // Clean up any existing notification when timer starts
    cancelRestTimerNotification().catch(console.error);
  }, [props.visible, props.initialSeconds, props.startedAtMs]);

  // Countdown timer - only runs when isRunning is true
  useEffect(() => {
    if (!props.visible) return;
    if (!isRunning) return;
    if (secondsLeft <= 0) return;

    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) return 0;
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [props.visible, isRunning, secondsLeft]);

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

  // Timer completion
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

  // Panel animation
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
  const compactTimeLabel = useMemo(() => formatCompact(secondsLeft), [secondsLeft]);
  const progress = totalSeconds > 0 ? 1 - (secondsLeft / totalSeconds) : 0;

  // Handle +/- time adjustments
  const adjustTime = (delta: number) => {
    setSecondsLeft((s) => {
      const newSeconds = clampInt(s + delta, 0, 3600);
      return newSeconds;
    });
    // Also adjust total so progress bar stays sensible
    if (delta > 0) {
      setTotalSeconds((t) => t + delta);
    }
    // Sync adjustment to store so it persists across drawer collapse/expand
    workoutDrawerActions.adjustRestTimer(delta);
  };

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
      {/* Full-screen touch blocker - always present when timer visible to prevent touches passing through */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 997,
        }}
      >
        {/* Invisible blocker area around the timer UI */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: Math.max(insets.bottom, 14) + 250,
          }}
          pointerEvents="box-only"
          onStartShouldSetResponder={() => true}
        />
      </View>

      {/* COMPACT PILL - positioned lower */}
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={{
          position: "absolute",
          bottom: Math.max(insets.bottom, 14) + 140,
          alignSelf: "center",
          left: "50%",
          transform: [{ translateX: -55 }], // Half of approximate pill width
          zIndex: 999,
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.card,
          borderRadius: 999,
          paddingVertical: 6,
          paddingHorizontal: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          shadowOpacity: 0.16,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}
      >
        <Text style={{ color: c.text, fontWeight: "900", fontSize: 13, minWidth: 32, textAlign: "center" }}>{compactTimeLabel}</Text>
        <Text style={{ color: c.muted, fontWeight: "900", fontSize: 9 }}>
          {expanded ? "▼" : "▲"}
        </Text>
      </Pressable>

      {/* Full-screen backdrop to block ALL touches when expanded */}
      {expanded && (
        <Pressable
          onPress={() => setExpanded(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        />
      )}

      {/* SLIDE-IN PANEL (overlay only; compact) */}
      <Animated.View
        pointerEvents={expanded ? "auto" : "none"}
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: Math.max(insets.bottom, 14) + 190,
          zIndex: 1000,
          transform: [{ translateY: panelY }],
        }}
      >
        {/* Panel container */}
        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.card,
            borderRadius: 16,
            overflow: "hidden",

            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 10,
          }}
        >
          {/* Top area (including padding) - tap anywhere here to collapse */}
          <Pressable
            onPress={() => setExpanded(false)}
            style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 16, alignItems: "center", gap: 12 }}
          >
            <Text style={{ color: c.text, fontWeight: "900", fontSize: 48 }}>
              {timeLabel}
            </Text>
            <LinearProgress
              progress={progress}
              color={c.primary}
              backgroundColor={`${c.primary}30`}
            />
          </Pressable>

          {/* Controls - each button handles its own press */}
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center", paddingHorizontal: 16, paddingBottom: 16 }}>
            <SmallBtn
              title={isRunning ? "Pause" : "Resume"}
              onPress={() => setIsRunning((v) => !v)}
              minW={74}
            />
            <SmallBtn title="-15s" onPress={() => adjustTime(-15)} subtle />
            <SmallBtn title="+15s" onPress={() => adjustTime(15)} subtle />
            <SmallBtn
              title="Reset"
              onPress={() => {
                setSecondsLeft(props.initialSeconds);
                setTotalSeconds(props.initialSeconds);
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
        </View>
      </Animated.View>
    </>
  );
}
