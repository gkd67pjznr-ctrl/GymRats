// src/ui/components/Social/ShareableWorkoutCard.tsx
// A styled card component designed to be captured and shared as an image

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { WorkoutSession } from '../../../lib/workoutModel';
import type { WorkoutMilestone } from '../../../lib/workoutPostGenerator';
import type { Tier } from '../../../lib/GrScoring';
import { EXERCISES_V1 } from '@/src/data/exercises';
import { useSettings } from '../../../lib/stores/settingsStore';

type Props = {
  session: WorkoutSession;
  userName?: string;
  bestTier?: Tier;
  milestones?: WorkoutMilestone[];
  totalVolume?: number; // kg
};

// Tier colors for styling
const TIER_COLORS: Record<Tier, string> = {
  Iron: '#6B7280',
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2',
  Diamond: '#B9F2FF',
  Mythic: '#FF00FF',
};

// Tier gradient backgrounds
const TIER_GRADIENTS: Record<Tier, { start: string; end: string }> = {
  Iron: { start: '#0f0f14', end: '#1a1a2e' },
  Bronze: { start: '#0f0f14', end: '#2d1f0f' },
  Silver: { start: '#0f0f14', end: '#2a2a3a' },
  Gold: { start: '#0f0f14', end: '#2d2a0f' },
  Platinum: { start: '#0f0f14', end: '#1f2d2d' },
  Diamond: { start: '#0f0f14', end: '#0f1f2d' },
  Mythic: { start: '#0f0f14', end: '#2d0f2d' },
};

// Milestone type icons
const MILESTONE_ICONS: Record<string, string> = {
  weight_pr: '🏋️',
  rep_pr: '💪',
  e1rm_pr: '⚡',
  streak: '🔥',
  volume: '💎',
  rank_up: '⭐',
};

function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'lb') {
    return `${Math.round(kg * 2.20462)} lb`;
  }
  return `${Math.round(kg)} kg`;
}

function formatDuration(startMs: number, endMs: number): string {
  const durationMin = Math.round((endMs - startMs) / 60000);
  if (durationMin < 60) return `${durationMin}m`;
  const hours = Math.floor(durationMin / 60);
  const mins = durationMin % 60;
  return `${hours}h ${mins}m`;
}

function getTopExercises(session: WorkoutSession, limit = 3) {
  // Group sets by exercise and find best e1RM for each
  const exerciseMap = new Map<string, { weightKg: number; reps: number; e1rm: number }>();

  for (const set of session.sets) {
    const e1rm = set.weightKg * (1 + set.reps / 30);
    const current = exerciseMap.get(set.exerciseId);
    if (!current || e1rm > current.e1rm) {
      exerciseMap.set(set.exerciseId, {
        weightKg: set.weightKg,
        reps: set.reps,
        e1rm,
      });
    }
  }

  // Sort by e1RM and take top
  return Array.from(exerciseMap.entries())
    .sort((a, b) => b[1].e1rm - a[1].e1rm)
    .slice(0, limit)
    .map(([exerciseId, data]) => {
      const exercise = EXERCISES_V1.find((e) => e.id === exerciseId);
      return {
        name: exercise?.name ?? exerciseId,
        weightKg: data.weightKg,
        reps: data.reps,
        e1rm: data.e1rm,
      };
    });
}

/**
 * A card designed to look good when shared as an image
 * Use with react-native-view-shot to capture
 */
export const ShareableWorkoutCard = forwardRef<View, Props>(
  ({ session, userName, bestTier = 'Iron', milestones = [], totalVolume }, ref) => {
    const { unitSystem, displayName } = useSettings();
    const tierColor = TIER_COLORS[bestTier];
    const gradient = TIER_GRADIENTS[bestTier];
    const name = userName || displayName || 'Lifter';

    const exerciseCount = new Set(session.sets.map((s) => s.exerciseId)).size;
    const setCount = session.sets.length;
    const duration = formatDuration(session.startedAtMs, session.endedAtMs);
    const topExercises = getTopExercises(session, 3);

    // Calculate volume if not provided
    const volume =
      totalVolume ?? session.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);

    // Filter to show only PR milestones (most important)
    const prMilestones = milestones
      .filter((m) => ['weight_pr', 'rep_pr', 'e1rm_pr'].includes(m.type))
      .slice(0, 3);

    return (
      <View ref={ref} style={[styles.card, { backgroundColor: gradient.start }]}>
        {/* Accent bar */}
        <View style={[styles.accentBar, { backgroundColor: tierColor }]} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>GYMRATS</Text>
          <Text style={styles.userName}>{name}</Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.workoutTitle}>
            {session.routineName || `${exerciseCount} Exercise Workout`}
          </Text>
          <Text style={styles.workoutDate}>
            {new Date(session.endedAtMs).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: tierColor }]}>{exerciseCount}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: tierColor }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: tierColor }]}>{setCount}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: tierColor }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: tierColor }]}>{duration}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: tierColor }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: tierColor }]}>
              {formatWeight(volume, unitSystem)}
            </Text>
            <Text style={styles.statLabel}>Volume</Text>
          </View>
        </View>

        {/* Top exercises */}
        {topExercises.length > 0 && (
          <View style={styles.exercisesSection}>
            <Text style={styles.sectionTitle}>Top Lifts</Text>
            {topExercises.map((ex, i) => (
              <View key={i} style={styles.exerciseRow}>
                <Text style={styles.exerciseName} numberOfLines={1}>
                  {ex.name}
                </Text>
                <Text style={styles.exerciseStats}>
                  {formatWeight(ex.weightKg, unitSystem)} × {ex.reps}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* PRs achieved */}
        {prMilestones.length > 0 && (
          <View style={[styles.prBadge, { backgroundColor: `${tierColor}20` }]}>
            <Text style={[styles.prText, { color: tierColor }]}>
              {prMilestones.map((m) => MILESTONE_ICONS[m.type]).join(' ')} PRs Today!
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.hashtag}>#GymRats</Text>
          <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
            <Text style={styles.tierText}>{bestTier.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    );
  }
);

ShareableWorkoutCard.displayName = 'ShareableWorkoutCard';

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
    marginBottom: 16,
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
  titleSection: {
    marginBottom: 20,
  },
  workoutTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  workoutDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 24,
    opacity: 0.3,
  },
  exercisesSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  exerciseStats: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  prBadge: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  prText: {
    fontSize: 14,
    fontWeight: '800',
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
  tierBadge: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tierText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default ShareableWorkoutCard;
