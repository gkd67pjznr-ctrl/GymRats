/**
 * StreakCounter Component
 *
 * Displays the user's current workout streak with a fire icon.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak?: number;
  size?: 'sm' | 'md' | 'lg';
  showLongest?: boolean;
  style?: any;
}

const SIZE_CONFIG = {
  sm: { iconSize: 16, textFontSize: 14, labelFontSize: 9 },
  md: { iconSize: 24, textFontSize: 20, labelFontSize: 11 },
  lg: { iconSize: 32, textFontSize: 28, labelFontSize: 12 },
};

export function StreakCounter({
  currentStreak,
  longestStreak,
  size = 'md',
  showLongest = false,
  style,
}: StreakCounterProps) {
  const ds = makeDesignSystem('dark', 'toxic');
  const config = SIZE_CONFIG[size];

  const intensity = getFireIntensity(currentStreak);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Text style={[styles.fireIcon, { fontSize: config.iconSize }]}>
          {getFireEmoji(intensity)}
        </Text>

        <Text
          style={[
            styles.streakText,
            {
              fontSize: config.textFontSize,
              color: getStreakColor(currentStreak, ds),
            },
          ]}
        >
          {currentStreak}
        </Text>

        <Text
          style={[styles.label, { fontSize: config.labelFontSize, color: ds.tone.muted }]}
        >
          {currentStreak === 1 ? 'day' : 'days'}
        </Text>
      </View>

      {showLongest && longestStreak !== undefined && longestStreak > 0 && (
        <Text style={[styles.longestLabel, { color: ds.tone.muted }]}>
          Best: {longestStreak}
        </Text>
      )}
    </View>
  );
}

function getFireIntensity(streak: number): 'low' | 'medium' | 'high' | 'extreme' {
  if (streak >= 30) return 'extreme';
  if (streak >= 14) return 'high';
  if (streak >= 7) return 'medium';
  return 'low';
}

function getFireEmoji(intensity: ReturnType<typeof getFireIntensity>): string {
  switch (intensity) {
    case 'extreme':
      return '🔥🔥🔥';
    case 'high':
      return '🔥🔥';
    case 'medium':
      return '🔥';
    default:
      return '💨';
  }
}

function getStreakColor(streak: number, ds: ReturnType<typeof makeDesignSystem>): string {
  if (streak >= 30) return '#FF6B35';
  if (streak >= 14) return '#FF8C42';
  if (streak >= 7) return '#FFB347';
  return ds.tone.muted;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fireIcon: {
    lineHeight: 28,
  },
  streakText: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
  longestLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
    marginTop: 2,
  },
});
