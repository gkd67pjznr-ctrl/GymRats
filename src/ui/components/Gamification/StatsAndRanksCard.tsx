/**
 * StatsAndRanksCard Component
 *
 * Displays comprehensive gamification stats on the profile screen.
 * Shows level, XP, streak, tokens, and workout calendar.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import type { GamificationProfile } from '@/src/lib/gamification/types';
import { getLevelProgress } from '@/src/lib/gamification/xp/levels';
import { XPProgressBar } from './XPProgressBar';
import { LevelBadge } from './LevelBadge';
import { StreakCounter } from './StreakCounter';
import { ForgeTokenDisplay } from './ForgeTokenDisplay';
import { WorkoutCalendar } from './WorkoutCalendar';

interface StatsAndRanksCardProps {
  profile: GamificationProfile;
  style?: any;
}

export function StatsAndRanksCard({ profile, style }: StatsAndRanksCardProps) {
  const ds = makeDesignSystem('dark', 'toxic');
  const progress = getLevelProgress(profile.totalXP);

  // Calculate stats
  const totalWorkouts = profile.workoutCalendar.reduce(
    (sum, day) => sum + day.count,
    0
  );

  return (
    <View style={[styles.container, { backgroundColor: ds.tone.card, borderColor: ds.tone.border }, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: ds.tone.text }]}>
          Your Stats
        </Text>
      </View>

      {/* Level and XP */}
      <View style={styles.section}>
        <View style={styles.levelRow}>
          <LevelBadge level={profile.currentLevel} size="lg" showTier />
          <View style={styles.xpColumn}>
            <XPProgressBar
              currentXP={progress.xpIntoLevel}
              xpToNextLevel={progress.xpToNextLevel}
              currentLevel={profile.currentLevel}
              width={200}
              showLabel
            />
          </View>
        </View>
      </View>

      {/* Streak and Tokens */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statLabel, { color: ds.tone.muted }]}>Current Streak</Text>
          <StreakCounter
            currentStreak={profile.currentStreak}
            longestStreak={profile.longestStreak}
            size="lg"
            showLongest
          />
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statLabel, { color: ds.tone.muted }]}>Forge Tokens</Text>
          <ForgeTokenDisplay balance={profile.forgeTokens} size="lg" />
        </View>
      </View>

      {/* Additional Stats */}
      <View style={styles.section}>
        <View style={styles.miniStatsRow}>
          <MiniStat label="Workouts" value={totalWorkouts.toString()} ds={ds} />
          <MiniStat label="Total XP" value={profile.totalXP.toLocaleString()} ds={ds} />
          <MiniStat
            label="Milestones"
            value={profile.milestonesCompleted.length.toString()}
            ds={ds}
          />
        </View>
      </View>

      {/* Workout Calendar */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: ds.tone.text }]}>Activity</Text>
        <WorkoutCalendar calendar={profile.workoutCalendar} weeks={12} />
      </View>
    </View>
  );
}

interface MiniStatProps {
  label: string;
  value: string;
  ds: ReturnType<typeof makeDesignSystem>;
}

function MiniStat({ label, value, ds }: MiniStatProps) {
  return (
    <View style={styles.miniStat}>
      <Text style={[styles.miniStatValue, { color: ds.tone.accent }]}>{value}</Text>
      <Text style={[styles.miniStatLabel, { color: ds.tone.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 20,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  section: {
    gap: 12,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  xpColumn: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
  miniStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  miniStat: {
    alignItems: 'center',
    gap: 4,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  miniStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.1,
    marginBottom: 8,
  },
});
