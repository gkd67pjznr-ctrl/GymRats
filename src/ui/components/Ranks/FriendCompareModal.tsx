// src/ui/components/Ranks/FriendCompareModal.tsx
// Modal for comparing rank with friends on a specific exercise

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { FR } from '../../GrStyle';
import { useFriendEdges } from '../../../lib/stores/friendsStore';
import { useUser } from '../../../lib/stores/authStore';
import { useSettings } from '../../../lib/stores/settingsStore';
import { useExerciseRank } from '../../../lib/hooks/useExerciseRanks';
import { EXERCISES_V1 } from '../../../data/exercises';
import type { RankTier } from '../../../lib/userStats/types';

type Props = {
  visible: boolean;
  exerciseId: string | null;
  onClose: () => void;
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

// Mock friend data for demonstration
// In production, this would come from a friends store with their stats
type FriendRankData = {
  id: string;
  name: string;
  rank: number;
  tier: RankTier;
  bestE1rm: number;
  bestWeight: number;
};

function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'lb') {
    return `${Math.round(kg * 2.20462)} lb`;
  }
  return `${Math.round(kg)} kg`;
}

export function FriendCompareModal({ visible, exerciseId, onClose }: Props) {
  const c = useThemeColors();
  const user = useUser();
  const { unitSystem } = useSettings();
  const userId = user?.id ?? 'demo';

  // Get user's rank for this exercise
  const userRank = useExerciseRank(exerciseId ?? '');

  // Get friends (in a real app, this would have their stats too)
  const friendEdges = useFriendEdges(userId);
  const friends = useMemo(() => {
    return friendEdges
      .filter((e) => e.status === 'friends')
      .map((e) => ({
        id: e.otherUserId,
        name: `User ${e.otherUserId.slice(-4)}`, // Placeholder - real app would have names
      }));
  }, [friendEdges]);

  // Mock friend rank data - in production this would come from API/store
  // This is a placeholder showing what the UI would look like
  const mockFriendRanks: FriendRankData[] = friends.slice(0, 5).map((friend, i) => ({
    id: friend.id,
    name: friend.name,
    rank: Math.max(1, (userRank?.currentRank ?? 5) - (i - 2)),
    tier: 'silver' as RankTier,
    bestE1rm: (userRank?.bestE1rm ?? 100) * (0.8 + Math.random() * 0.4),
    bestWeight: (userRank?.bestWeightKg ?? 80) * (0.8 + Math.random() * 0.4),
  }));

  if (!exerciseId) return null;

  const exerciseName = EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;

  // Calculate comparison stats
  const comparison = mockFriendRanks.map((friend) => {
    const rankDiff = (userRank?.currentRank ?? 0) - friend.rank;
    const e1rmDiff = (userRank?.bestE1rm ?? 0) - friend.bestE1rm;
    return {
      ...friend,
      rankDiff,
      e1rmDiff,
      isAhead: rankDiff > 0 || (rankDiff === 0 && e1rmDiff > 0),
    };
  });

  const CompareRow = ({ friend }: { friend: typeof comparison[0] }) => (
    <View style={[styles.compareRow, { backgroundColor: c.card, borderColor: c.border }]}>
      {/* Friend info */}
      <View style={styles.friendInfo}>
        <View style={[styles.avatar, { backgroundColor: c.bg }]}>
          <Text style={[styles.avatarText, { color: c.text }]}>
            {friend.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={[styles.friendName, { color: c.text }]}>{friend.name}</Text>
          <Text style={[styles.friendRank, { color: TIER_COLORS[friend.tier] }]}>
            Rank {friend.rank}
          </Text>
        </View>
      </View>

      {/* Stats comparison */}
      <View style={styles.statsColumn}>
        <Text style={[styles.statValue, { color: c.text }]}>
          {formatWeight(friend.bestE1rm, unitSystem)}
        </Text>
        <Text style={[styles.statLabel, { color: c.muted }]}>e1RM</Text>
      </View>

      {/* Comparison indicator */}
      <View
        style={[
          styles.comparisonBadge,
          { backgroundColor: friend.isAhead ? '#4ECDC420' : '#FF6B6B20' },
        ]}
      >
        <Ionicons
          name={friend.isAhead ? 'arrow-up' : 'arrow-down'}
          size={14}
          color={friend.isAhead ? '#4ECDC4' : '#FF6B6B'}
        />
        <Text
          style={[
            styles.comparisonText,
            { color: friend.isAhead ? '#4ECDC4' : '#FF6B6B' },
          ]}
        >
          {friend.isAhead ? '+' : ''}
          {Math.round(friend.e1rmDiff)} kg
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
        <View style={[styles.modal, { backgroundColor: c.bg }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: c.text }]}>Compare with Friends</Text>
              <Text style={[styles.subtitle, { color: c.muted }]}>{exerciseName}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={c.text} />
            </Pressable>
          </View>

          {/* User's rank card */}
          {userRank && (
            <View style={[styles.userCard, { backgroundColor: c.card, borderColor: c.primary }]}>
              <Text style={[styles.userLabel, { color: c.muted }]}>Your Rank</Text>
              <View style={styles.userStats}>
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: TIER_COLORS[userRank.currentTier] },
                  ]}
                >
                  <Text style={styles.rankNumber}>{userRank.currentRank}</Text>
                </View>
                <View>
                  <Text style={[styles.userE1rm, { color: c.text }]}>
                    {formatWeight(userRank.bestE1rm, unitSystem)} e1RM
                  </Text>
                  <Text style={[styles.userWeight, { color: c.muted }]}>
                    {formatWeight(userRank.bestWeightKg, unitSystem)} x {userRank.bestReps}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Friends list */}
          <ScrollView style={styles.friendsList} showsVerticalScrollIndicator={false}>
            {friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={c.muted} />
                <Text style={[styles.emptyTitle, { color: c.text }]}>No Friends Yet</Text>
                <Text style={[styles.emptySubtitle, { color: c.muted }]}>
                  Add friends to compare your rankings!
                </Text>
              </View>
            ) : (
              comparison.map((friend) => <CompareRow key={friend.id} friend={friend} />)
            )}
          </ScrollView>

          {/* Note about data */}
          {friends.length > 0 && (
            <Text style={[styles.note, { color: c.muted }]}>
              Friend stats are simulated for this demo. Real data coming soon!
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: FR.space.x4,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: FR.space.x4,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  userCard: {
    padding: FR.space.x3,
    borderRadius: FR.radius.card,
    borderWidth: 2,
    marginBottom: FR.space.x4,
  },
  userLabel: {
    fontSize: 12,
    marginBottom: FR.space.x2,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: FR.space.x3,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  userE1rm: {
    fontSize: 18,
    fontWeight: '700',
  },
  userWeight: {
    fontSize: 14,
  },
  friendsList: {
    flex: 1,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: FR.space.x3,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: FR.space.x2,
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: FR.space.x2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
  },
  friendRank: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsColumn: {
    alignItems: 'flex-end',
    marginRight: FR.space.x3,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 10,
  },
  comparisonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  comparisonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: FR.space.x6,
    gap: FR.space.x2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  note: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: FR.space.x3,
    fontStyle: 'italic',
  },
});
