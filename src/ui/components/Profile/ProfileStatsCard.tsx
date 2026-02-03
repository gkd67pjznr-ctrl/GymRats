/**
 * ProfileStatsCard Component
 *
 * Displays comprehensive profile stats including:
 * - GymRank score (overall training score)
 * - Exercise ranks with tier colors
 * - Personal Records (best lifts)
 * - PR counts breakdown (weight, rep, e1RM)
 * - Top exercises by rank
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/src/ui/theme';
import {
  calculateProfileStats,
  getTopExercisesByRank,
  getExerciseDisplayName,
  getRankTierColor,
  type RankTier,
} from '@/src/lib/profile/profileStats';
import { useWorkoutStore } from '@/src/lib/stores/workoutStore';
import { useLifetimeStats, useGymRank } from '@/src/lib/stores/userStatsStore';

interface ProfileStatsCardProps {
  limit?: number; // Number of top exercises to show
  style?: any;
}

export function ProfileStatsCard({ limit = 5, style }: ProfileStatsCardProps) {
  const c = useThemeColors();
  const sessions = useWorkoutStore((s) => s.sessions);

  // Use unified stats store for totals (single source of truth)
  const lifetimeStats = useLifetimeStats();
  const gymRank = useGymRank();

  // Calculate exercise-specific stats from workout history
  // (for now, keep using calculateProfileStats for exercise details)
  const stats = useMemo(() => calculateProfileStats(sessions), [sessions]);

  // Get top exercises by rank
  const topExercises = useMemo(
    () => getTopExercisesByRank(stats, limit),
    [stats, limit]
  );

  // Get GymRank tier color
  const gymRankTierColor = getGymRankTierColor(gymRank.tier);

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
      {/* GymRank Score Header */}
      <View style={styles.gymRankHeader}>
        <View style={styles.gymRankInfo}>
          <Text style={[styles.headerTitle, { color: c.text }]}>GymRank</Text>
          <Text style={[styles.headerSubtitle, { color: c.muted }]}>
            Overall training score
          </Text>
        </View>
        <View style={[styles.gymRankBadge, { borderColor: gymRankTierColor }]}>
          <Text style={[styles.gymRankScore, { color: gymRankTierColor }]}>
            {gymRank.score}
          </Text>
          <Text style={[styles.gymRankTier, { color: gymRankTierColor }]}>
            {gymRank.tier.charAt(0).toUpperCase() + gymRank.tier.slice(1)}
          </Text>
        </View>
      </View>

      {/* PR Summary */}
      <View style={styles.prSummary}>
        <View style={[styles.prTotalBadge, { backgroundColor: `${c.accent}15` }]}>
          <Text style={[styles.prTotalValue, { color: c.accent }]}>
            {lifetimeStats.totalPRs}
          </Text>
          <Text style={[styles.prTotalLabel, { color: c.muted }]}>Total PRs</Text>
        </View>
        <View style={styles.prBreakdown}>
          <PRTypeBadge label="Weight" count={lifetimeStats.weightPRs} color="#FFD700" />
          <PRTypeBadge label="Rep" count={lifetimeStats.repPRs} color="#00BFFF" />
          <PRTypeBadge label="e1RM" count={lifetimeStats.e1rmPRs} color="#FF6B6B" />
        </View>
      </View>

      {/* Section Divider */}
      <View style={[styles.divider, { backgroundColor: c.border }]} />

      {/* Top Exercises Header */}
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Top Exercises</Text>
        <Text style={[styles.headerSubtitle, { color: c.muted }]}>
          Based on your best e1RM
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
            {lifetimeStats.totalWorkouts}
          </Text>
          <Text style={[styles.statLabel, { color: c.muted }]}>Workouts</Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Get color for GymRank tier
 */
function getGymRankTierColor(tier: string): string {
  const tierColors: Record<string, string> = {
    iron: '#6B7280',
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
    mythic: '#FF00FF',
  };
  return tierColors[tier] || tierColors.iron;
}

/**
 * PR Type Badge component
 */
interface PRTypeBadgeProps {
  label: string;
  count: number;
  color: string;
}

function PRTypeBadge({ label, count, color }: PRTypeBadgeProps) {
  return (
    <View style={styles.prTypeBadge}>
      <Text style={[styles.prTypeValue, { color }]}>{count}</Text>
      <Text style={[styles.prTypeLabel, { color: 'rgba(255,255,255,0.5)' }]}>{label}</Text>
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
  // GymRank Header
  gymRankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gymRankInfo: {
    gap: 4,
  },
  gymRankBadge: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  gymRankScore: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  gymRankTier: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // PR Summary
  prSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prTotalBadge: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  prTotalValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  prTotalLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  prBreakdown: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  prTypeBadge: {
    alignItems: 'center',
    gap: 2,
  },
  prTypeValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  prTypeLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  // Divider
  divider: {
    height: 1,
    marginVertical: 4,
  },
  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
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
