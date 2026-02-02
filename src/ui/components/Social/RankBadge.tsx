// src/ui/components/Social/RankBadge.tsx
// Rank badge component for displaying Forgerank tier on workout posts

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import type { Tier } from '@/src/lib/forgerankScoring';
import type { WorkoutPost } from '@/src/lib/socialModel';

interface RankBadgeProps {
  post?: WorkoutPost;
  tier?: Tier;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'badge' | 'minimal';
  showLabel?: boolean;
  style?: any;
}

const SIZE_CONFIG = {
  sm: { paddingVertical: 2, paddingHorizontal: 8, fontSize: 10, iconSize: 10 },
  md: { paddingVertical: 4, paddingHorizontal: 12, fontSize: 12, iconSize: 12 },
  lg: { paddingVertical: 6, paddingHorizontal: 16, fontSize: 14, iconSize: 14 },
};

const TIER_ICONS: Record<Tier, string> = {
  Iron: '🔩',
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💎',
  Diamond: '💠',
  Mythic: '👑',
};

/**
 * Calculate the best tier from a workout post's workout snapshot
 * Returns the highest tier achieved in the workout
 */
export function getBestTierForPost(post: WorkoutPost | undefined): Tier | null {
  if (!post?.workoutSnapshot?.topLines || post.workoutSnapshot.topLines.length === 0) {
    return null;
  }

  // For now, default to Iron - would need actual e1RM scoring data
  // This will be enhanced when we include tier data in the workout snapshot
  return 'Iron';
}

export function RankBadge({
  post,
  tier: propTier,
  size = 'sm',
  variant = 'pill',
  showLabel = true,
  style,
}: RankBadgeProps) {
  const ds = makeDesignSystem('dark', 'toxic');
  const config = SIZE_CONFIG[size];

  // Determine tier from prop or calculate from post
  const tier = propTier ?? getBestTierForPost(post) ?? 'Iron';

  const tierColor = getTierColor(tier, ds);
  const tierIcon = TIER_ICONS[tier];
  const tierLabel = tier.toUpperCase();

  if (variant === 'minimal') {
    return (
      <View style={[styles.minimalContainer, { borderColor: tierColor }, style]}>
        <Text style={[styles.minimalText, { color: tierColor, fontSize: config.fontSize }]}>
          {showLabel ? tierLabel : tierIcon}
        </Text>
      </View>
    );
  }

  if (variant === 'badge') {
    return (
      <View style={[styles.badgeContainer, { backgroundColor: tierColor }, style]}>
        <Text style={[styles.badgeIcon, { fontSize: config.iconSize }]}>
          {tierIcon}
        </Text>
        {showLabel && (
          <Text style={[styles.badgeText, { fontSize: config.fontSize, color: '#0A0A0D' }]}>
            {tierLabel}
          </Text>
        )}
      </View>
    );
  }

  // Default: pill variant
  return (
    <View
      style={[
        styles.pillContainer,
        {
          backgroundColor: tierColor,
          paddingVertical: config.paddingVertical,
          paddingHorizontal: config.paddingHorizontal,
        },
        style,
      ]}
    >
      <Text style={[styles.pillIcon, { fontSize: config.iconSize }]}>{tierIcon}</Text>
      {showLabel && (
        <Text style={[styles.pillText, { fontSize: config.fontSize, color: '#0A0A0D' }]}>
          {tierLabel}
        </Text>
      )}
    </View>
  );
}

function getTierColor(tier: Tier, ds: ReturnType<typeof makeDesignSystem>): string {
  const colorMap: Record<Tier, string> = {
    Iron: ds.tone.iron,
    Bronze: ds.tone.bronze,
    Silver: ds.tone.silver,
    Gold: ds.tone.gold,
    Platinum: ds.tone.platinum,
    Diamond: ds.tone.diamond,
    Mythic: ds.tone.mythic,
  };
  return colorMap[tier];
}

const styles = StyleSheet.create({
  // Pill variant (default)
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  pillIcon: {
    lineHeight: 14,
  },
  pillText: {
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Badge variant (larger, more prominent)
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeIcon: {
    lineHeight: 16,
  },
  badgeText: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Minimal variant (outline only)
  minimalContainer: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  minimalText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
