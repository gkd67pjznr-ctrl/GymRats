/**
 * LevelBadge Component
 *
 * Displays the user's level as a badge with tier-based coloring.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showTier?: boolean;
  style?: any;
}

const SIZE_CONFIG = {
  sm: { width: 36, height: 36, fontSize: 14, iconSize: 10 },
  md: { width: 48, height: 48, fontSize: 18, iconSize: 14 },
  lg: { width: 64, height: 64, fontSize: 24, iconSize: 18 },
};

export function LevelBadge({
  level,
  size = 'md',
  showTier = false,
  style,
}: LevelBadgeProps) {
  const ds = makeDesignSystem('dark', 'toxic');
  const config = SIZE_CONFIG[size];

  const tierColor = getTierColor(level, ds);
  const tierName = getTierName(level);

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.badge,
          {
            width: config.width,
            height: config.height,
            borderRadius: config.width * 0.22,
            backgroundColor: tierColor,
          },
        ]}
      >
        <View style={styles.innerBorder}>
          <Text
            style={[
              styles.levelText,
              {
                fontSize: config.fontSize,
                color: '#0A0A0D',
              },
            ]}
          >
            {level}
          </Text>
        </View>
      </View>

      {showTier && (
        <Text style={[styles.tierLabel, { color: ds.tone.muted }]}>
          {tierName}
        </Text>
      )}
    </View>
  );
}

function getTierColor(level: number, ds: ReturnType<typeof makeDesignSystem>): string {
  if (level <= 5) return ds.tone.iron;
  if (level <= 10) return ds.tone.bronze;
  if (level <= 15) return ds.tone.silver;
  if (level <= 20) return ds.tone.gold;
  if (level <= 30) return ds.tone.platinum;
  return ds.tone.mythic;
}

function getTierName(level: number): string {
  if (level <= 5) return 'Novice';
  if (level <= 10) return 'Apprentice';
  if (level <= 15) return 'Adept';
  if (level <= 20) return 'Expert';
  if (level <= 30) return 'Master';
  return 'Grandmaster';
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  innerBorder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tierLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
