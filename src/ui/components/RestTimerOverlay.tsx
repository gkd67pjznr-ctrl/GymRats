import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, AppState, AppStateStatus, Pressable, Text, View, Dimensions, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
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

// Circular progress for the collapsed pill
function CircularProgress({
  progress,
  size = 32,
  strokeWidth = 3,
  color,
  bgColor,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size}>
      {/* Background circle */}
      <Circle
        stroke={bgColor}
        fill="transparent"
        strokeWidth={strokeWidth}
        cx={size / 2}
        cy={size / 2}
        r={radius}
      />
      {/* Progress circle */}
      <Circle
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        cx={size / 2}
        cy={size / 2}
        r={radius}
      />
    </Svg>
  );
}

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

  // Collapsed = small pill at bottom, expanded = full panel
  const [expanded, setExpanded] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(props.initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(props.initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [scheduledNotificationId, setScheduledNotificationId] = useState<string | null>(null);
  const hasPlayedStartSoundRef = useRef(false);

  // Track paused time offset for accurate pause/resume
  const pausedAtRef = useRef<number | null>(null);
  const timeOffsetRef = useRef(0);

  // Panel slide animation
  const panelY = useRef(new Animated.Value(300)).current;

  // Reset timer when visibility changes
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

    // Only reset sound flag if this is a truly fresh timer
    if (!props.startedAtMs || remaining === props.initialSeconds) {
      hasPlayedStartSoundRef.current = false;
    }

    // Clean up any existing notification when timer starts
    cancelRestTimerNotification().catch(console.error);
  }, [props.visible, props.initialSeconds, props.startedAtMs]);

  // Countdown timer
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

  // Schedule background notification when app goes to background
  useEffect(() => {
    if (!props.visible || !isRunning || secondsLeft <= 0) return;

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
      toValue: expanded ? 0 : 300,
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
  const adjustTime = useCallback((delta: number) => {
    setSecondsLeft((s) => {
      const newSeconds = clampInt(s + delta, 0, 3600);
      return newSeconds;
    });
    if (delta > 0) {
      setTotalSeconds((t) => t + delta);
    }
    workoutDrawerActions.adjustRestTimer(delta);
  }, []);

  const handlePauseResume = useCallback(() => {
    setIsRunning((v) => !v);
  }, []);

  const handleReset = useCallback(() => {
    setSecondsLeft(props.initialSeconds);
    setTotalSeconds(props.initialSeconds);
    setIsRunning(true);
    hasPlayedStartSoundRef.current = false;
  }, [props.initialSeconds]);

  const handleDismiss = useCallback(() => {
    setExpanded(false);
    props.onClose();
  }, [props.onClose]);

  if (!props.visible) return null;

  return (
    <>
      {/* Backdrop when expanded - tap to collapse */}
      {expanded && (
        <Pressable
          onPress={() => setExpanded(false)}
          style={styles.backdrop}
        />
      )}

      {/* COLLAPSED PILL - bottom of screen */}
      {!expanded && (
        <Pressable
          onPress={() => setExpanded(true)}
          style={[
            styles.collapsedPill,
            {
              bottom: insets.bottom + 16,
              backgroundColor: c.card,
              borderColor: c.primary,
            },
          ]}
        >
          <CircularProgress
            progress={progress}
            size={32}
            strokeWidth={3}
            color={c.primary}
            bgColor={`${c.primary}30`}
          />
          <View style={styles.pillTextContainer}>
            <Text style={[styles.pillTime, { color: c.text }]}>{compactTimeLabel}</Text>
            <Text style={[styles.pillLabel, { color: c.muted }]}>Rest</Text>
          </View>
          <Text style={[styles.pillChevron, { color: c.muted }]}>▲</Text>
        </Pressable>
      )}

      {/* EXPANDED PANEL */}
      <Animated.View
        pointerEvents={expanded ? "auto" : "none"}
        style={[
          styles.expandedPanel,
          {
            bottom: insets.bottom + 16,
            transform: [{ translateY: panelY }],
          },
        ]}
      >
        <View style={[styles.panelContainer, { backgroundColor: c.card, borderColor: c.border }]}>
          {/* Collapse handle */}
          <Pressable
            onPress={() => setExpanded(false)}
            style={styles.collapseHandle}
          >
            <View style={[styles.handleBar, { backgroundColor: c.muted }]} />
          </Pressable>

          {/* Timer display */}
          <View style={styles.timerSection}>
            <Text style={[styles.timerText, { color: c.text }]}>{timeLabel}</Text>
            <LinearProgress
              progress={progress}
              color={c.primary}
              backgroundColor={`${c.primary}30`}
            />
          </View>

          {/* Control buttons */}
          <View style={styles.controlsRow}>
            <Pressable
              onPress={handlePauseResume}
              style={[styles.controlBtn, styles.primaryBtn, { backgroundColor: c.primary }]}
            >
              <Text style={styles.primaryBtnText}>{isRunning ? "Pause" : "Resume"}</Text>
            </Pressable>

            <Pressable
              onPress={() => adjustTime(-15)}
              style={[styles.controlBtn, { backgroundColor: c.bg, borderColor: c.border }]}
            >
              <Text style={[styles.controlBtnText, { color: c.text }]}>-15s</Text>
            </Pressable>

            <Pressable
              onPress={() => adjustTime(15)}
              style={[styles.controlBtn, { backgroundColor: c.bg, borderColor: c.border }]}
            >
              <Text style={[styles.controlBtnText, { color: c.text }]}>+15s</Text>
            </Pressable>
          </View>

          <View style={styles.secondaryRow}>
            <Pressable
              onPress={handleReset}
              style={[styles.secondaryBtn, { borderColor: c.border }]}
            >
              <Text style={[styles.secondaryBtnText, { color: c.muted }]}>Reset</Text>
            </Pressable>

            <Pressable
              onPress={handleDismiss}
              style={[styles.secondaryBtn, { borderColor: c.border }]}
            >
              <Text style={[styles.secondaryBtnText, { color: c.muted }]}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 998,
  },

  // Collapsed pill
  collapsedPill: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  pillTextContainer: {
    alignItems: "center",
  },
  pillTime: {
    fontSize: 16,
    fontWeight: "900",
  },
  pillLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: -2,
  },
  pillChevron: {
    fontSize: 10,
    fontWeight: "900",
  },

  // Expanded panel
  expandedPanel: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  panelContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  collapseHandle: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },

  timerSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 16,
  },
  timerText: {
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -2,
  },

  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  controlBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 70,
    alignItems: "center",
  },
  primaryBtn: {
    borderWidth: 0,
    minWidth: 100,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  controlBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },

  secondaryRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
