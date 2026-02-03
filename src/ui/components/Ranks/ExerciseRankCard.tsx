// src/ui/components/Ranks/ExerciseRankCard.tsx
// Expandable card showing exercise rank with progress and sparkline

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { FR } from '../../GrStyle';
import { RankSparkline } from './RankSparkline';
import { useExerciseSparkline } from '../../../lib/hooks/useExerciseRanks';
import type { ExerciseRankSummary, SparklineTimeframe } from '../../../lib/types/rankTypes';
import type { RankTier } from '../../../lib/userStats/types';
import { useSettings } from '../../../lib/stores/settingsStore';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  summary: ExerciseRankSummary;
  onCompare?: () => void;
  onShare?: () => void;
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

// Tier display names
const TIER_NAMES: Record<RankTier, string> = {
  iron: 'Iron',
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
  mythic: 'Mythic',
};

/**
 * Convert kg to the user's preferred unit
 */
function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'lb') {
    return `${Math.round(kg * 2.20462)} lb`;
  }
  return `${Math.round(kg)} kg`;
}

export function ExerciseRankCard({ summary, onCompare, onShare }: Props) {
  const c = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);
  const [sparklineTimeframe, setSparklineTimeframe] = useState<SparklineTimeframe>('90d');
  const sparklineData = useExerciseSparkline(summary.exerciseId, sparklineTimeframe);
  const { unitSystem } = useSettings();

  const tierColor = TIER_COLORS[summary.currentTier];
  const tierName = TIER_NAMES[summary.currentTier];

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  // Format last logged date
  const lastLoggedDate = summary.lastLoggedAt
    ? new Date(summary.lastLoggedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Never';

  return (
    <Pressable
      onPress={toggleExpand}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.card,
          borderColor: c.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {/* Collapsed view - always visible */}
      <View style={styles.headerRow}>
        {/* Rank badge */}
        <View style={[styles.rankBadge, { backgroundColor: tierColor }]}>
          <Text style={styles.rankNumber}>{summary.currentRank}</Text>
        </View>

        {/* Exercise info */}
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, { color: c.text }]} numberOfLines={1}>
            {summary.exerciseName}
          </Text>
          <Text style={[styles.tierLabel, { color: tierColor }]}>
            {tierName}
          </Text>
        </View>

        {/* Best weight */}
        <View style={styles.bestWeight}>
          <Text style={[styles.weightValue, { color: c.text }]}>
            {formatWeight(summary.bestWeightKg, unitSystem)}
          </Text>
          <Text style={[styles.repsLabel, { color: c.muted }]}>
            x{summary.bestReps}
          </Text>
        </View>

        {/* Expand indicator */}
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={c.muted}
        />
      </View>

      {/* Progress bar */}
      <View style={[styles.progressContainer, { backgroundColor: c.bg }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${summary.progressToNextRank * 100}%`,
              backgroundColor: tierColor,
            },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: c.muted }]}>
        {Math.round(summary.progressToNextRank * 100)}% to Rank {summary.currentRank + 1}
      </Text>

      {/* Expanded content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: c.border }]} />

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: c.muted }]}>Best e1RM</Text>
              <Text style={[styles.statValue, { color: c.text }]}>
                {formatWeight(summary.bestE1rm, unitSystem)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: c.muted }]}>Total Sets</Text>
              <Text style={[styles.statValue, { color: c.text }]}>
                {summary.totalSets.toLocaleString()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: c.muted }]}>Volume</Text>
              <Text style={[styles.statValue, { color: c.text }]}>
                {formatWeight(summary.totalVolumeKg, unitSystem)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: c.muted }]}>Last Logged</Text>
              <Text style={[styles.statValue, { color: c.text }]}>
                {lastLoggedDate}
              </Text>
            </View>
          </View>

          {/* Sparkline */}
          <View style={styles.sparklineSection}>
            <Text style={[styles.sectionLabel, { color: c.text }]}>
              e1RM History
            </Text>
            <RankSparkline
              data={sparklineData}
              selectedTimeframe={sparklineTimeframe}
              onTimeframeChange={setSparklineTimeframe}
            />
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            {onCompare && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onCompare();
                }}
                style={[
                  styles.actionButton,
                  { backgroundColor: c.bg, borderColor: c.border },
                ]}
              >
                <Ionicons name="people-outline" size={16} color={c.text} />
                <Text style={[styles.actionLabel, { color: c.text }]}>Compare</Text>
              </Pressable>
            )}
            {onShare && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                style={[
                  styles.actionButton,
                  { backgroundColor: c.bg, borderColor: c.border },
                ]}
              >
                <Ionicons name="share-outline" size={16} color={c.text} />
                <Text style={[styles.actionLabel, { color: c.text }]}>Share</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: FR.radius.card,
    borderWidth: 1,
    padding: FR.space.x3,
    gap: FR.space.x2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: FR.space.x3,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
  },
  tierLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  bestWeight: {
    alignItems: 'flex-end',
  },
  weightValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  repsLabel: {
    fontSize: 12,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    textAlign: 'right',
  },
  expandedContent: {
    marginTop: FR.space.x2,
    gap: FR.space.x3,
  },
  divider: {
    height: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: FR.space.x3,
  },
  statItem: {
    width: '45%',
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sparklineSection: {
    gap: FR.space.x2,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: FR.space.x2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
