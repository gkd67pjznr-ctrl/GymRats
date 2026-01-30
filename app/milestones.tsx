/**
 * Milestones Screen
 * Full trophy case displaying all milestones with progress
 * Shows earned and locked milestones grouped by rarity
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../src/ui/theme';
import { TrophyCase, MilestoneDetailModal } from '../src/ui/components/Milestones/TrophyCase';
import { useMilestonesStore, useIsMilestonesHydrated } from '../src/lib/stores/milestonesStore';
import { useWorkoutStore } from '../src/lib/stores/workoutStore';
import { useGamificationStore } from '../src/lib/stores/gamificationStore';
import { getMilestoneStats } from '../src/lib/milestones/checker';
import type { MilestoneWithProgress, MilestoneUserStats } from '../src/lib/milestones/types';

export default function MilestonesScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const isHydrated = useIsMilestonesHydrated();
  const earnedMilestones = useMilestonesStore((s) => s.earnedMilestones);

  // Get data from other stores for milestone checking
  const workouts = useWorkoutStore((s) => s.sessions);
  const gamificationProfile = useGamificationStore((s) => s.profile);

  // Selected milestone for detail modal
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneWithProgress | null>(null);

  // Calculate user stats for milestone progress
  const userStats: MilestoneUserStats = useMemo(() => {
    // Calculate total sets
    const totalSets = workouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0);

    // Calculate exercises logged
    const exercisesLoggedSet = new Set<string>();
    workouts.forEach((w) => {
      w.sets?.forEach((s) => exercisesLoggedSet.add(s.exerciseId));
    });

    // Calculate exercise ranks (placeholder - will be populated by rank system)
    const exerciseRanks: Record<string, number> = {};

    // Calculate max weights per exercise (for clubs)
    const exerciseMaxWeights: Record<string, number> = {};
    workouts.forEach((w) => {
      w.sets?.forEach((s) => {
        if (!exerciseMaxWeights[s.exerciseId] || s.weightKg > exerciseMaxWeights[s.exerciseId]) {
          exerciseMaxWeights[s.exerciseId] = s.weightKg;
        }
      });
    });

    // Calculate PRs (placeholder - will be populated by PR tracking)
    const totalPRs = 0;

    return {
      totalWorkouts: workouts.length,
      currentStreak: gamificationProfile.currentStreak,
      longestStreak: gamificationProfile.longestStreak,
      totalPRs,
      currentLevel: gamificationProfile.currentLevel,
      totalSets,
      exercisesLogged: exercisesLoggedSet.size,
      exercisesRanked: Object.keys(exerciseRanks).length,
      exerciseRanks,
      exerciseMaxWeights,
      hasSharedWorkout: false,
    };
  }, [workouts, gamificationProfile]);

  // Get milestones with progress
  const milestonesWithProgress = useMemo(() => {
    const { getMilestonesWithProgress: getProgress } = require('../src/lib/milestones/checker');
    return getProgress(userStats, earnedMilestones);
  }, [userStats, earnedMilestones]);

  // Calculate stats
  const milestoneStats = useMemo(() => {
    const { getMilestoneStats: getStats } = require('../src/lib/milestones/checker');
    return getStats(userStats, Object.keys(earnedMilestones));
  }, [userStats, earnedMilestones]);

  // Loading state
  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.bg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={c.text} />
        <Text style={{ color: c.muted, marginTop: 12, fontSize: 14 }}>
          Loading milestones...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ color: c.text, fontSize: 24 }}>←</Text>
        </Pressable>
        <Text style={{ color: c.text, fontSize: 18, fontWeight: '900' }}>
          Trophy Case
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats Summary */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 16,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
        }}
      >
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: c.text, fontSize: 24, fontWeight: '900' }}>
            {milestoneStats.earned}
          </Text>
          <Text style={{ color: c.muted, fontSize: 12 }}>Earned</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: c.text, fontSize: 24, fontWeight: '900' }}>
            {milestoneStats.total}
          </Text>
          <Text style={{ color: c.muted, fontSize: 12 }}>Total</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: c.accent, fontSize: 24, fontWeight: '900' }}>
            {Math.round(milestoneStats.completionPercent)}%
          </Text>
          <Text style={{ color: c.muted, fontSize: 12 }}>Complete</Text>
        </View>
      </View>

      {/* Rarity Breakdown */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 8,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
        }}
      >
        {(['common', 'rare', 'epic', 'legendary'] as const).map((rarity) => {
          const stats = milestoneStats.byRarity[rarity];
          const { RARITY_INFO } = require('../src/lib/milestones/definitions');
          const info = RARITY_INFO[rarity];

          return (
            <View key={rarity} style={{ flex: 1, alignItems: 'center' }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: info.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: info.color, fontSize: 12, fontWeight: '900' }}>
                  {stats.earned}/{stats.total}
                </Text>
              </View>
              <Text style={{ color: c.muted, fontSize: 10, marginTop: 4 }}>
                {info.name}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Trophy Case */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <TrophyCase
          milestones={milestonesWithProgress}
          onPressMilestone={setSelectedMilestone}
        />
      </ScrollView>

      {/* Milestone Detail Modal */}
      <MilestoneDetailModal
        milestone={selectedMilestone}
        visible={selectedMilestone !== null}
        onClose={() => setSelectedMilestone(null)}
      />
    </View>
  );
}
