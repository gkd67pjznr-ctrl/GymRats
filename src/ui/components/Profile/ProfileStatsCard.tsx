/**
 * ProfileStatsCard Component
 *
 * Displays comprehensive profile stats including:
 * - Exercise ranks with tier colors
 * - Personal Records (best lifts)
 * - PR counts
 * - Top exercises by rank
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Link, type Href } from 'expo-router';
import { makeDesignSystem } from '@/src/ui/designSystem';
import { useThemeColors } from '@/src/ui/theme';
import {
  calculateProfileStats,
  getTopExercisesByRank,
  getExerciseDisplayName,
  getRankTierColor,
  type ProfileStats,
  type RankTier,
} from '@/src/lib/profile/profileStats';
import { useWorkoutStore } from '@/src/lib/stores/workoutStore';
import { useLifetimeStats } from '@/src/lib/stores/userStatsStore';
import { kgToLb } from '@/src/lib/units';

interface ProfileStatsCardProps {
  limit?: number; // Number of top exercises to show
  style?: any;
}

export function ProfileStatsCard({ limit = 5, style }: ProfileStatsCardProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');
  const sessions = useWorkoutStore((s) => s.sessions);

  // Use unified stats store for totals (single source of truth)
  const lifetimeStats = useLifetimeStats();

  // Calculate exercise-specific stats from workout history
  // (for now, keep using calculateProfileStats for exercise details)
  const stats = useMemo(() => calculateProfileStats(sessions), [sessions]);

  // Get top exercises by rank
  const topExercises = useMemo(
    () => getTopExercisesByRank(stats, limit),
    [stats, limit]
  );

  if (topExercises.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: c.card, borderColor: c.border }, style]}>
        <Text style={[styles.headerTitle, { color: c.text }]}>Your Lifts</Text>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: c.muted }]}>
            Complete workouts to see your ranks and PRs
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.card, borderColor: c.border }, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: c.text }]}>Your Lifts</Text>
        <Text style={[styles.headerSubtitle, { color: c.muted }]}>
          Based on your best e1RM for each exercise
        </Text>
      </View>

      {/* Top Exercises */}
      <View style={styles.exercisesList}>
        {topExercises.map(({ exerciseId, rank, pr }) => (
          <ExerciseRankRow
            key={exerciseId}
            exerciseId={exerciseId}
            rank={rank}
            bestE1RMKg={pr.bestE1RMKg}
            bestWeightKg={pr.bestWeightKg}
          />
        ))}
      </View>

      {/* Stats Footer - uses unified userStatsStore for totals */}
      <View style={styles.footer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: c.accent }]}>{lifetimeStats.totalSets}</Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>Total Sets</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: c.accent }]}>
            {(lifetimeStats.totalVolumeKg / 1000).toFixed(1)}k
          </Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>Volume (kg)</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: c.accent }]}>
            {Object.keys(stats.exerciseRanks).length}
          </Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>Ranked</Text>
        </View>
      </View>
    </View>
  );
}

interface ExerciseRankRowProps {
  exerciseId: string;
  rank: {
    rankNumber: number;
    tier: RankTier;
    progressToNext: number;
  };
  bestE1RMKg: number;
  bestWeightKg: number;
}

function ExerciseRankRow({ exerciseId, rank, bestE1RMKg, bestWeightKg }: ExerciseRankRowProps) {
  const c = useThemeColors();
  const tierColor = getRankTierColor(rank.tier);
  const displayName = getExerciseDisplayName(exerciseId);

  return (
    <View style={[styles.exerciseRow, { backgroundColor: c.bg }]}>
      {/* Exercise Name */}
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseName, { color: c.text }]}>{displayName}</Text>
        <Text style={[styles.exercisePR, { color: c.muted }]}>
          Best: {Math.round(bestWeightKg)} kg
        </Text>
      </View>

      {/* Rank Display */}
      <View style={styles.rankContainer}>
        <View style={[styles.rankBadge, { borderColor: tierColor }]}>
          <Text style={[styles.rankNumber, { color: tierColor }]}>
            {rank.rankNumber}
          </Text>
        </View>
        <Text style={[styles.rankTier, { color: tierColor }]}>
          {rank.tier.charAt(0).toUpperCase() + rank.tier.slice(1)}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${rank.progressToNext * 100}%`,
              backgroundColor: tierColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseRow: {
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  exercisePR: {
    fontSize: 12,
    fontWeight: '600',
  },
  rankContainer: {
    alignItems: 'center',
    gap: 2,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '900',
  },
  rankTier: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
