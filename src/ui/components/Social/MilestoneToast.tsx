// src/ui/components/Social/MilestoneToast.tsx
// Toast notification for workout milestones (PRs, rank-ups, streaks)

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import { useThemeColors } from '@/src/ui/theme';
import type { WorkoutMilestone } from '@/src/lib/workoutPostGenerator';

interface MilestoneToastProps {
  milestone: WorkoutMilestone | null;
  visible: boolean;
  onDismiss?: () => void;
  onShare?: () => void;
  autoDismiss?: boolean;
}

export function MilestoneToast({
  milestone,
  visible,
  onDismiss,
  onShare,
  autoDismiss = true,
}: MilestoneToastProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible && milestone) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4 seconds
      if (autoDismiss) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, 4000);
        return () => clearTimeout(timer);
      }
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(-100);
    }
  }, [visible, milestone]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  if (!milestone || !visible) return null;

  const getIcon = () => {
    switch (milestone.type) {
      case 'rank_up':
        return '🏆';
      case 'weight_pr':
      case 'rep_pr':
      case 'e1rm_pr':
        return '⚡';
      case 'streak':
        return '🔥';
      case 'volume':
        return '💎';
      default:
        return '🎯';
    }
  };

  const getTierColor = () => {
    if (milestone.tier) {
      const tierColors: Record<string, string> = {
        Iron: ds.tone.iron,
        Bronze: ds.tone.bronze,
        Silver: ds.tone.silver,
        Gold: ds.tone.gold,
        Platinum: ds.tone.platinum,
        Diamond: ds.tone.diamond,
        Mythic: ds.tone.mythic,
      };
      return tierColors[milestone.tier] || ds.tone.accent;
    }
    return ds.tone.accent;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: c.card,
            borderColor: getTierColor(),
            shadowColor: getTierColor(),
          },
        ]}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: alpha(getTierColor(), 0.15) }]}>
            <Text style={styles.icon}>{getIcon()}</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: getTierColor() }]}>
              {getMilestoneTitle(milestone.type)}
            </Text>
            <Text style={[styles.message, { color: c.text }]} numberOfLines={2}>
              {milestone.message}
            </Text>
          </View>
        </View>

        {onShare && (
          <Pressable
            onPress={() => {
              handleDismiss();
              onShare();
            }}
            style={[
              styles.shareButton,
              { backgroundColor: alpha(ds.tone.accent, 0.15), borderColor: ds.tone.accent },
            ]}
          >
            <Text style={[styles.shareButtonText, { color: ds.tone.accent }]}>
              Share
            </Text>
          </Pressable>
        )}

        <Pressable onPress={handleDismiss} style={styles.dismissButton}>
          <Text style={[styles.dismissButtonText, { color: c.muted }]}>✕</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function getMilestoneTitle(type: WorkoutMilestone['type']): string {
  switch (type) {
    case 'rank_up':
      return 'RANK UP!';
    case 'weight_pr':
      return 'WEIGHT PR!';
    case 'rep_pr':
      return 'REP PR!';
    case 'e1rm_pr':
      return 'NEW e1RM!';
    case 'streak':
      return 'STREAK MILESTONE!';
    case 'volume':
      return 'VOLUME CRUSHED!';
    default:
      return 'MILESTONE!';
  }
}

// Helper function to add alpha to hex color
function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: 380,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  shareButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 4,
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

/**
 * Hook to manage milestone toast state
 */
export function useMilestoneToast() {
  const [milestone, setMilestone] = useState<WorkoutMilestone | null>(null);
  const [visible, setVisible] = useState(false);

  const show = (newMilestone: WorkoutMilestone) => {
    setMilestone(newMilestone);
    setVisible(true);
  };

  const hide = () => {
    setVisible(false);
  };

  return {
    milestone,
    visible,
    show,
    hide,
  };
}
