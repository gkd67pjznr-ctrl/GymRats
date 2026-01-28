/**
 * XPProgressBar Component
 *
 * Displays the user's XP progress toward the next level.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Defs, Rect, ClipPath, LinearGradient, Stop } from 'react-native-svg';
import { makeDesignSystem } from '@/src/ui/designSystem';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface XPProgressBarProps {
  currentXP: number;
  xpToNextLevel: number;
  currentLevel: number;
  width?: number;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
}

export function XPProgressBar({
  currentXP,
  xpToNextLevel,
  currentLevel,
  width = 280,
  height = 12,
  showLabel = true,
  animated = true,
}: XPProgressBarProps) {
  const ds = makeDesignSystem('dark', 'toxic');
  const progress = xpToNextLevel > 0 ? Math.min(1, currentXP / xpToNextLevel) : 1;

  const animatedProgress = useSharedValue(animated ? 0 : progress);

  React.useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(progress, { duration: ds.motion.medMs });
    }
  }, [progress, animated]);

  const animatedProps = useAnimatedProps(() => {
    const barWidth = width * animatedProgress.value;
    return {
      width: barWidth,
    };
  });

  const barWidth = width * progress;

  return (
    <View style={[styles.container, { width }]}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={[styles.levelLabel, { color: ds.tone.text }]}>
            Level {currentLevel}
          </Text>
          <Text style={[styles.xpLabel, { color: ds.tone.muted }]}>
            {currentXP} / {xpToNextLevel} XP
          </Text>
        </View>
      )}

      <View style={[styles.barContainer, { height, borderRadius: height / 2 }]}>
        <Svg width={width} height={height}>
          <Defs>
            <ClipPath id="barClip">
              <Rect width={width} height={height} rx={height / 2} ry={height / 2} />
            </ClipPath>
            <LinearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={ds.tone.accent} stopOpacity={1} />
              <Stop offset="100%" stopColor={ds.tone.accent2} stopOpacity={1} />
            </LinearGradient>
          </Defs>

          {/* Background track */}
          <Rect
            width={width}
            height={height}
            rx={height / 2}
            ry={height / 2}
            fill={ds.tone.card2}
          />

          {/* Progress bar */}
          <AnimatedRect
            animatedProps={animatedProps}
            height={height}
            rx={height / 2}
            ry={height / 2}
            fill="url(#barGradient)"
            clipPath="url(#barClip)"
          />
        </Svg>
      </View>

      {/* Percentage indicator */}
      {showLabel && (
        <Text style={[styles.percentLabel, { color: ds.tone.muted }]}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  xpLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  barContainer: {
    overflow: 'hidden',
  },
  percentLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'right',
  },
});
