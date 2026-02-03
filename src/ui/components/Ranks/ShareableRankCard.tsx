// src/ui/components/Ranks/ShareableRankCard.tsx
// A styled card component designed to be captured and shared as an image

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ExerciseRankSummary } from '../../../lib/types/rankTypes';
import type { RankTier } from '../../../lib/userStats/types';
import { useSettings } from '../../../lib/stores/settingsStore';

type Props = {
  summary: ExerciseRankSummary;
  userName?: string;
};

// Rank tier colors
const TIER_COLORS: Record<RankTier, string> = {
  iron: '#6B7280',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
  mythic: '#FF00FF',
};

// Tier gradient backgrounds
const TIER_GRADIENTS: Record<RankTier, { start: string; end: string }> = {
  iron: { start: '#1a1a2e', end: '#16213e' },
  bronze: { start: '#1a1a2e', end: '#2d1f0f' },
  silver: { start: '#1a1a2e', end: '#2a2a3a' },
  gold: { start: '#1a1a2e', end: '#2d2a0f' },
  platinum: { start: '#1a1a2e', end: '#1f2d2d' },
  diamond: { start: '#1a1a2e', end: '#0f1f2d' },
  mythic: { start: '#1a1a2e', end: '#2d0f2d' },
};

// Tier display names
const TIER_NAMES: Record<RankTier, string> = {
  iron: 'IRON',
  bronze: 'BRONZE',
  silver: 'SILVER',
  gold: 'GOLD',
  platinum: 'PLATINUM',
  diamond: 'DIAMOND',
  mythic: 'MYTHIC',
};

function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'lb') {
    return `${Math.round(kg * 2.20462)} lb`;
  }
  return `${Math.round(kg)} kg`;
}

/**
 * A card designed to look good when shared as an image
 * Use with react-native-view-shot to capture
 */
export const ShareableRankCard = forwardRef<View, Props>(
  ({ summary, userName }, ref) => {
    const { unitSystem, displayName } = useSettings();
    const tierColor = TIER_COLORS[summary.currentTier];
    const tierName = TIER_NAMES[summary.currentTier];
    const gradient = TIER_GRADIENTS[summary.currentTier];
    const name = userName || displayName || 'Lifter';

    return (
      <View ref={ref} style={[styles.card, { backgroundColor: gradient.start }]}>
        {/* Background accent */}
        <View style={[styles.accentBar, { backgroundColor: tierColor }]} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>GYMRATS</Text>
          <Text style={styles.userName}>{name}</Text>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Rank badge */}
          <View style={[styles.rankBadge, { backgroundColor: tierColor }]}>
            <Text style={styles.rankNumber}>{summary.currentRank}</Text>
          </View>

          {/* Tier label */}
          <Text style={[styles.tierLabel, { color: tierColor }]}>{tierName}</Text>

          {/* Exercise name */}
          <Text style={styles.exerciseName}>{summary.exerciseName}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatWeight(summary.bestWeightKg, unitSystem)}
            </Text>
            <Text style={styles.statLabel}>Best Weight</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: tierColor }]} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary.bestReps}</Text>
            <Text style={styles.statLabel}>Reps</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: tierColor }]} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatWeight(summary.bestE1rm, unitSystem)}
            </Text>
            <Text style={styles.statLabel}>e1RM</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${summary.progressToNextRank * 100}%`,
                  backgroundColor: tierColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(summary.progressToNextRank * 100)}% to Rank{' '}
            {summary.currentRank + 1}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.hashtag}>#GymRats</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>
    );
  }
);

ShareableRankCard.displayName = 'ShareableRankCard';

const styles = StyleSheet.create({
  card: {
    width: 350,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 20,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    opacity: 0.7,
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  rankBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rankNumber: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 8,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    opacity: 0.3,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hashtag: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  },
});

export default ShareableRankCard;
