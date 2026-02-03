// src/ui/components/Ranks/LeaderboardsTab.tsx
// Leaderboards sub-tab with scope and exercise filtering

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { FR } from '../../forgerankStyle';
import { useUser } from '../../../lib/stores/authStore';
import { useFriendEdges } from '../../../lib/stores/friendsStore';
import { useSettings } from '../../../lib/stores/settingsStore';
import { supabase } from '../../../lib/supabase/client';
import { EXERCISES_V1 } from '../../../data/exercises';
import {
  filterByFriends,
  filterByRegion,
  recomputeRanks,
  ensureCurrentUserVisible,
  type EnhancedLeaderboardEntry,
} from '../../../lib/leaderboardUtils';

// Extended scope that includes regional (not in base leaderboardUtils)
type ExtendedLeaderboardScope = 'global' | 'regional' | 'friends';

type ExerciseRank = EnhancedLeaderboardEntry & {
  exerciseId: string;
  country?: string | null;
  region?: string | null;
};

export function LeaderboardsTab() {
  const c = useThemeColors();
  const user = useUser();
  const { unitSystem, location } = useSettings();
  const userId = user?.id ?? 'u_demo_me';

  // Check if user has location set for regional leaderboards
  const hasLocation = Boolean(location.country);

  // State
  const [scope, setScope] = useState<ExtendedLeaderboardScope>('global');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseRankings, setExerciseRankings] = useState<ExerciseRank[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get friend edges for filtering
  const friendEdges = useFriendEdges(userId);
  const friendUserIds = useMemo(() => {
    const ids = new Set<string>();
    for (const edge of friendEdges) {
      if (edge.status === 'friends') {
        ids.add(edge.otherUserId);
      }
    }
    return ids;
  }, [friendEdges]);

  // Group rankings by exercise
  const groupedRankings = useMemo(() => {
    const grouped = new Map<string, ExerciseRank[]>();
    for (const ranking of exerciseRankings) {
      if (!grouped.has(ranking.exerciseId)) {
        grouped.set(ranking.exerciseId, []);
      }
      grouped.get(ranking.exerciseId)!.push(ranking);
    }
    return grouped;
  }, [exerciseRankings]);

  // Get available exercises from rankings
  const availableExercises = useMemo(() => {
    return Array.from(groupedRankings.keys()).map((id) => ({
      id,
      name: EXERCISES_V1.find((e) => e.id === id)?.name ?? id,
    }));
  }, [groupedRankings]);

  // Filter rankings based on scope
  const filteredRankings = useMemo(() => {
    if (!selectedExercise) return [];

    const rankings = groupedRankings.get(selectedExercise) ?? [];

    if (scope === 'global') return rankings;
    if (scope === 'friends') {
      const filtered = filterByFriends(rankings, friendUserIds, userId);
      return recomputeRanks(filtered);
    }
    if (scope === 'regional' && hasLocation) {
      const filtered = filterByRegion(rankings, location.country, location.region);
      return recomputeRanks(filtered);
    }
    return rankings;
  }, [selectedExercise, groupedRankings, scope, friendUserIds, userId, hasLocation, location]);

  // Ensure current user is visible
  const displayRankings = useMemo(() => {
    return ensureCurrentUserVisible(filteredRankings, userId, 20);
  }, [filteredRankings, userId]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (isRefresh = false, forceRegional = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Pass regional filter when in regional scope
      const shouldUseRegionalFilter = forceRegional || (scope === 'regional' && hasLocation);
      const requestBody = shouldUseRegionalFilter && hasLocation
        ? { body: { country: location.country, region: location.region || undefined } }
        : {};

      const { data, error: fetchError } = await supabase.functions.invoke(
        'get-all-exercise-leaderboards',
        requestBody
      );

      if (fetchError) throw fetchError;
      setExerciseRankings(data || []);

      // Auto-select first exercise if none selected
      if (!selectedExercise && data && data.length > 0) {
        const firstExerciseId = data[0]?.exerciseId;
        if (firstExerciseId) {
          setSelectedExercise(firstExerciseId);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedExercise, scope, hasLocation, location]);

  // Fetch leaderboard when scope or location changes
  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const onRefresh = useCallback(() => {
    fetchLeaderboard(true);
  }, [fetchLeaderboard]);

  // Format value for display
  const formatValue = (value: number) => {
    if (unitSystem === 'lb') {
      return `${Math.round(value * 2.20462)} lb`;
    }
    return `${Math.round(value)} kg`;
  };

  const ScopeToggle = () => (
    <View style={styles.scopeRow}>
      {(['global', 'regional', 'friends'] as ExtendedLeaderboardScope[]).map((s) => {
        const isRegionalDisabled = s === 'regional' && !hasLocation;
        return (
          <Pressable
            key={s}
            onPress={() => setScope(s)}
            style={[
              styles.scopeChip,
              {
                backgroundColor: scope === s ? c.primary : c.card,
                borderColor: scope === s ? c.primary : c.border,
                opacity: isRegionalDisabled ? 0.5 : 1,
              },
            ]}
            disabled={isRegionalDisabled}
          >
            <Ionicons
              name={
                s === 'global'
                  ? 'globe-outline'
                  : s === 'regional'
                  ? 'location-outline'
                  : 'people-outline'
              }
              size={14}
              color={scope === s ? '#fff' : c.text}
            />
            <Text
              style={[
                styles.scopeLabel,
                {
                  color: scope === s ? '#fff' : c.text,
                  fontWeight: scope === s ? '700' : '400',
                },
              ]}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const ExerciseDropdown = () => (
    <View style={styles.dropdownContainer}>
      <Pressable
        onPress={() => setShowExercisePicker(!showExercisePicker)}
        style={[
          styles.dropdown,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <Text style={[styles.dropdownText, { color: c.text }]}>
          {selectedExercise
            ? EXERCISES_V1.find((e) => e.id === selectedExercise)?.name ?? selectedExercise
            : 'Select Exercise'}
        </Text>
        <Ionicons
          name={showExercisePicker ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={c.muted}
        />
      </Pressable>

      {showExercisePicker && (
        <View style={[styles.dropdownList, { backgroundColor: c.card, borderColor: c.border }]}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {availableExercises.map((exercise) => (
              <Pressable
                key={exercise.id}
                onPress={() => {
                  setSelectedExercise(exercise.id);
                  setShowExercisePicker(false);
                }}
                style={[
                  styles.dropdownItem,
                  {
                    backgroundColor:
                      selectedExercise === exercise.id
                        ? `${c.primary}20`
                        : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    {
                      color:
                        selectedExercise === exercise.id ? c.primary : c.text,
                      fontWeight: selectedExercise === exercise.id ? '700' : '400',
                    },
                  ]}
                >
                  {exercise.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const RankRow = ({ entry, index }: { entry: EnhancedLeaderboardEntry; index: number }) => (
    <>
      {entry.showSeparator && (
        <View style={styles.separatorRow}>
          <Text style={[styles.separatorText, { color: c.muted }]}>...</Text>
        </View>
      )}
      <View
        style={[
          styles.rankRow,
          {
            backgroundColor: entry.isCurrentUser ? `${c.primary}15` : 'transparent',
            borderColor: entry.isCurrentUser ? c.primary : 'transparent',
          },
        ]}
      >
        {/* Rank badge */}
        <View
          style={[
            styles.rankBadge,
            {
              backgroundColor:
                entry.rank <= 3 ? c.primary : entry.isCurrentUser ? c.primary : c.card,
              borderColor: entry.rank <= 3 || entry.isCurrentUser ? c.primary : c.border,
            },
          ]}
        >
          <Text
            style={[
              styles.rankNumber,
              { color: entry.rank <= 3 || entry.isCurrentUser ? '#fff' : c.text },
            ]}
          >
            {entry.rank}
          </Text>
        </View>

        {/* User name */}
        <Text
          style={[
            styles.userName,
            {
              color: entry.isCurrentUser ? c.primary : c.text,
              fontWeight: entry.isCurrentUser ? '700' : '400',
            },
          ]}
          numberOfLines={1}
        >
          {entry.userName}
        </Text>

        {/* Value */}
        <Text style={[styles.value, { color: c.text }]}>
          {formatValue(entry.value)}
        </Text>
      </View>
    </>
  );

  const EmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: c.card, borderColor: c.border }]}>
      <Ionicons name="trophy-outline" size={48} color={c.muted} />
      <Text style={[styles.emptyTitle, { color: c.text }]}>
        {scope === 'friends' ? 'No Friends Yet' : 'No Rankings Yet'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: c.muted }]}>
        {scope === 'friends'
          ? 'Add friends to see how you compare!'
          : 'Log workouts and compete with others!'}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={c.primary}
          colors={[c.primary]}
        />
      }
    >
      {/* Scope toggle */}
      <ScopeToggle />

      {/* Regional scope info */}
      {scope === 'regional' && hasLocation && (
        <View style={[styles.comingSoon, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="location" size={20} color={c.primary} />
          <Text style={[styles.comingSoonText, { color: c.text }]}>
            Showing users from {location.region ? `${location.region}, ` : ''}{location.country}
          </Text>
        </View>
      )}

      {/* Prompt to set location when regional is disabled */}
      {!hasLocation && (
        <View style={[styles.comingSoon, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="information-circle-outline" size={20} color={c.muted} />
          <Text style={[styles.comingSoonText, { color: c.muted }]}>
            Set your location in Settings to unlock regional leaderboards.
          </Text>
        </View>
      )}

      {/* Exercise dropdown */}
      <ExerciseDropdown />

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={[styles.errorContainer, { backgroundColor: c.card }]}>
          <Text style={[styles.errorText, { color: '#FF6B6B' }]}>{error}</Text>
          <Pressable
            onPress={() => fetchLeaderboard()}
            style={[styles.retryButton, { backgroundColor: c.primary }]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : displayRankings.length === 0 ? (
        <EmptyState />
      ) : (
        <View style={[styles.listCard, { backgroundColor: c.card, borderColor: c.border }]}>
          {selectedExercise && (
            <View style={styles.listHeader}>
              <Text style={[styles.listTitle, { color: c.text }]}>
                {EXERCISES_V1.find((e) => e.id === selectedExercise)?.name} Rankings
              </Text>
              <Text style={[styles.listSubtitle, { color: c.muted }]}>
                Best e1RM scores
              </Text>
            </View>
          )}
          {displayRankings.map((entry, index) => (
            <RankRow key={entry.userId} entry={entry} index={index} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: FR.space.x4,
    gap: FR.space.x3,
    paddingBottom: 100,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: FR.space.x2,
  },
  scopeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  scopeLabel: {
    fontSize: 13,
  },
  dropdownContainer: {
    zIndex: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: FR.space.x3,
    borderRadius: FR.radius.card,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: FR.radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: FR.space.x3,
  },
  dropdownItemText: {
    fontSize: 14,
  },
  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: FR.space.x2,
    padding: FR.space.x3,
    borderRadius: FR.radius.card,
    borderWidth: 1,
  },
  comingSoonText: {
    flex: 1,
    fontSize: 12,
  },
  listCard: {
    borderRadius: FR.radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listHeader: {
    padding: FR.space.x3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  listSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: FR.space.x3,
    gap: FR.space.x3,
    borderWidth: 1,
    borderRadius: 8,
    margin: 4,
  },
  separatorRow: {
    padding: FR.space.x2,
    alignItems: 'center',
  },
  separatorText: {
    fontSize: 14,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  userName: {
    flex: 1,
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: FR.space.x6,
    borderRadius: FR.radius.card,
    borderWidth: 1,
    alignItems: 'center',
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
  errorContainer: {
    padding: FR.space.x4,
    borderRadius: FR.radius.card,
    alignItems: 'center',
    gap: FR.space.x3,
  },
  errorText: {
    fontSize: 14,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
});
