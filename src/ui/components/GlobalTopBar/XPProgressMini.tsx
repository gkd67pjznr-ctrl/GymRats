// src/ui/components/GlobalTopBar/XPProgressMini.tsx
// Compact XP progress bar for top bar

import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/src/ui/theme';
import { makeDesignSystem } from '@/src/ui/designSystem';
import { useGamificationProfile } from '@/src/lib/stores/gamificationStore';
import { getLevelProgress } from '@/src/lib/gamification';

interface XPProgressMiniProps {
  width?: number;
  height?: number;
}

/**
 * XPProgressMini Component
 *
 * Compact XP progress bar showing progress to next level.
 * Uses toxic accent gradient and animates on XP change.
 */
export function XPProgressMini({ width = 80, height = 6 }: XPProgressMiniProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');
  const profile = useGamificationProfile();

  // Calculate progress percentage
  const progress = getLevelProgress(profile.totalXP);
  const progressPercent = progress.xpToNextLevel > 0
    ? progress.xpIntoLevel / progress.xpToNextLevel
    : 1;

  // Animated progress width
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progressPercent, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [progressPercent]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Background track */}
      <View
        style={[
          styles.track,
          {
            width,
            height,
            borderRadius: height / 2,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: ds.tone.border,
          },
        ]}
      >
        {/* Progress fill with gradient */}
        <Animated.View
          style={[
            styles.progressContainer,
            { height: height - 2, borderRadius: (height - 2) / 2 },
            animatedProgressStyle,
          ]}
        >
          <LinearGradient
            colors={[ds.tone.accent, ds.tone.accent2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressFill,
              { height: height - 2, borderRadius: (height - 2) / 2 },
            ]}
          />
        </Animated.View>

        {/* Glow effect overlay */}
        <View
          style={[
            styles.glowOverlay,
            {
              backgroundColor: ds.tone.accent,
              opacity: 0.15,
              height: height - 2,
              borderRadius: (height - 2) / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  track: {
    overflow: 'hidden',
    position: 'relative',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  progressFill: {
    flex: 1,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
