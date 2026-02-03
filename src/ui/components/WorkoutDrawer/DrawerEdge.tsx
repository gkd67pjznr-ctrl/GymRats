// src/ui/components/WorkoutDrawer/DrawerEdge.tsx
// Visual indicator shown when drawer is collapsed - includes compact rest timer

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useThemeColors } from '@/src/ui/theme';
import { useCurrentSession } from '@/src/lib/stores/currentSessionStore';
import { useRestTimer, useHasPendingCue } from '@/src/lib/stores/workoutDrawerStore';

const EDGE_WIDTH = 28;
const EDGE_HEIGHT = 100;

interface DrawerEdgeProps {
  isCollapsed: boolean;
  onPress: () => void;
}

/**
 * Circular progress for compact timer
 */
function CompactCircularProgress({
  progress,
  size = 20,
  strokeWidth = 2,
  color,
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
      {/* Background circle */}
      <Circle
        stroke="rgba(255,255,255,0.2)"
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

/**
 * Format seconds as M:SS
 */
function formatCompactTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }
  return `${secs}`;
}

/**
 * DrawerEdge Component
 *
 * A thin strip visible on the right edge of the screen when the workout
 * drawer is collapsed. Shows workout status and can be tapped to expand.
 *
 * Displays:
 * - Rest timer countdown (when active)
 * - PR indicator (when pending)
 * - Pulsing indicator dot (default)
 * - Set count
 * - Chevron hint
 */
export function DrawerEdge({ isCollapsed, onPress }: DrawerEdgeProps) {
  const c = useThemeColors();
  const session = useCurrentSession();
  const restTimer = useRestTimer();
  const hasPendingCue = useHasPendingCue();

  // Track remaining seconds for rest timer
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Update rest timer countdown
  useEffect(() => {
    if (!restTimer.isActive || !restTimer.startedAtMs) {
      setSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - restTimer.startedAtMs!) / 1000);
      const remaining = Math.max(0, restTimer.totalSeconds - elapsed);
      setSecondsLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.startedAtMs, restTimer.totalSeconds]);

  // Pulsing animation for the indicator dot
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // PR indicator glow animation
  const prGlow = useSharedValue(0);

  useEffect(() => {
    if (hasPendingCue) {
      prGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      );
    } else {
      prGlow.value = 0;
    }
  }, [hasPendingCue]);

  const prGlowStyle = useAnimatedStyle(() => ({
    opacity: prGlow.value,
  }));

  // Count completed sets
  const setCount = session?.sets?.length ?? 0;
  const completedCount = Object.values(session?.doneBySetId ?? {}).filter(Boolean).length;

  // Calculate rest timer progress
  const timerProgress = restTimer.totalSeconds > 0
    ? 1 - (secondsLeft / restTimer.totalSeconds)
    : 0;

  if (!isCollapsed) {
    return null;
  }

  const isTimerActive = restTimer.isActive && secondsLeft > 0;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: isTimerActive ? c.card : c.primary,
          borderColor: isTimerActive ? c.primary : 'transparent',
          borderWidth: isTimerActive ? 2 : 0,
        },
      ]}
    >
      {/* PR indicator (star icon when pending) */}
      {hasPendingCue && !isTimerActive && (
        <Animated.View style={[styles.prIndicator, prGlowStyle]}>
          <Ionicons name="star" size={16} color="#FFD700" />
        </Animated.View>
      )}

      {/* Rest timer countdown */}
      {isTimerActive ? (
        <View style={styles.timerContainer}>
          <CompactCircularProgress
            progress={timerProgress}
            size={22}
            strokeWidth={2}
            color={c.primary}
          />
          <Text style={[styles.timerText, { color: c.text }]}>
            {formatCompactTime(secondsLeft)}
          </Text>
        </View>
      ) : (
        <>
          {/* Pulsing indicator (default state) */}
          {!hasPendingCue && (
            <Animated.View style={[styles.pulse, pulseStyle]}>
              <View style={[styles.dot, { backgroundColor: '#fff' }]} />
            </Animated.View>
          )}
        </>
      )}

      {/* Set count */}
      <Text style={[
        styles.setCount,
        { color: isTimerActive ? c.text : '#fff' }
      ]}>
        {completedCount}/{setCount}
      </Text>

      {/* Chevron hint */}
      <Ionicons
        name="chevron-back"
        size={14}
        color={isTimerActive ? c.muted : '#fff'}
        style={styles.chevron}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: -EDGE_WIDTH,
    top: '35%',
    width: EDGE_WIDTH,
    height: EDGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pulse: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timerContainer: {
    alignItems: 'center',
    gap: 2,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  setCount: {
    fontSize: 10,
    fontWeight: '900',
  },
  chevron: {
    opacity: 0.7,
  },
  prIndicator: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
  },
});

export default DrawerEdge;
