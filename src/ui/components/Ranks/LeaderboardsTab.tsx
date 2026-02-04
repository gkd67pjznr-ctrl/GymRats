// src/ui/components/Ranks/LeaderboardsTab.tsx
// Leaderboards sub-tab with scope, exercise, and category filtering

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
import { FR } from '../../GrStyle';
import { useUser } from '../../../lib/stores/authStore';
import { useFriendEdges } from '../../../lib/stores/friendsStore';
import { useSettings } from '../../../lib/stores/settingsStore';
import { supabase } from '../../../lib/supabase/client';
import { EXERCISES_V1, getAllExercises } from '../../../data/exercises';
import { DEFAULT_TIERS, type Tier } from '../../../lib/GrScoring';
import type { MuscleGroup } from '../../../data/exerciseTypes';
import {
  filterByFriends,
  filterByRegion,
  recomputeRanks,
  ensureCurrentUserVisible,
  computeOverallRankings,
  computeVolumeRankings,
  computeLevelRankings,
  filterSessionsByPeriod,
  formatVolumeCompact,
  formatXPCompact,
  getLevelTierName,
  type EnhancedLeaderboardEntry,
  type VolumeLeaderboardEntry,
  type LevelLeaderboardEntry,
  type VolumeMetric,
  type LevelMetric,
} from '../../../lib/leaderboardUtils';
import { useWorkoutSessions } from '../../../lib/stores/workoutStore';
import { useGamificationProfile } from '../../../lib/stores/gamificationStore';

// Extended scope that includes regional
type ExtendedLeaderboardScope = 'global' | 'regional' | 'friends';

// Time period filter
type TimePeriod = 'all' | 'monthly' | 'weekly';

// Leaderboard type
type LeaderboardType = 'per-exercise' | 'overall' | 'volume' | 'level';

// Extended entry with score and tier
type ExerciseRank = EnhancedLeaderboardEntry & {
  exerciseId: string;
  country?: string | null;
  region?: string | null;
  score?: number;
  tier?: Tier;
};

// Tier colors for display
const TIER_COLORS: Record<Tier, string> = {
  Iron: '#6B7280',
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2',
  Diamond: '#B9F2FF',
  Mythic: '#FF00FF',
};

// Muscle group categories for filtering
const MUSCLE_CATEGORIES: { id: string; label: string; muscles: MuscleGroup[] }[] = [
  { id: 'all', label: 'All Exercises', muscles: [] },
  { id: 'chest', label: 'Chest', muscles: ['chest'] },
  { id: 'back', label: 'Back', muscles: ['lats', 'middle back', 'lower back'] },
  { id: 'legs', label: 'Legs', muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves'] },
  { id: 'shoulders', label: 'Shoulders', muscles: ['shoulders'] },
  { id: 'arms', label: 'Arms', muscles: ['biceps', 'triceps', 'forearms'] },
  { id: 'core', label: 'Core', muscles: ['abdominals'] },
];

// Get tier from score
function getTierFromScore(score: number): Tier {
  for (let i = DEFAULT_TIERS.length - 1; i >= 0; i--) {
    if (score >= DEFAULT_TIERS[i].minScore) {
      return DEFAULT_TIERS[i].tier;
    }
  }
  return 'Iron';
}

export function LeaderboardsTab() {
  const c = useThemeColors();
  const user = useUser();
  const { unitSystem, location } = useSettings();
  const userId = user?.id ?? 'u_demo_me';

  // Check if user has location set for regional leaderboards
  const hasLocation = Boolean(location.country);

  // State
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('per-exercise');
  const [scope, setScope] = useState<ExtendedLeaderboardScope>('global');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [volumeMetric, setVolumeMetric] = useState<VolumeMetric>('volume');
  const [levelMetric, setLevelMetric] = useState<LevelMetric>('level');
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [exerciseRankings, setExerciseRankings] = useState<ExerciseRank[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all workout sessions for volume leaderboard
  const allWorkoutSessions = useWorkoutSessions();

  // Get current user's gamification profile for level leaderboard
  const gamificationProfile = useGamificationProfile();

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

  // Get all exercises with their muscle data
  const allExercises = useMemo(() => getAllExercises(), []);

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

  // Get available exercises filtered by category
  const availableExercises = useMemo(() => {
    const exerciseIds = Array.from(groupedRankings.keys());

    if (selectedCategory === 'all') {
      return exerciseIds.map((id) => ({
        id,
        name: EXERCISES_V1.find((e) => e.id === id)?.name ?? id,
      }));
    }

    // Filter by muscle category
    const category = MUSCLE_CATEGORIES.find((c) => c.id === selectedCategory);
    if (!category) return [];

    return exerciseIds
      .filter((id) => {
        const exercise = allExercises.find((e) => e.id === id);
        if (!exercise) return false;
        return exercise.primaryMuscles.some((m) => category.muscles.includes(m));
      })
      .map((id) => ({
        id,
        name: EXERCISES_V1.find((e) => e.id === id)?.name ?? id,
      }));
  }, [groupedRankings, selectedCategory, allExercises]);

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

  // Overall rankings (computed from all exercises)
  const overallRankings = useMemo(() => {
    if (leaderboardType !== 'overall') return [];

    let rankings = computeOverallRankings(groupedRankings);

    // Apply scope filter
    if (scope === 'friends') {
      const filtered = filterByFriends(rankings, friendUserIds, userId);
      rankings = recomputeRanks(filtered);
    }

    return ensureCurrentUserVisible(rankings, userId, 20);
  }, [leaderboardType, groupedRankings, scope, friendUserIds, userId]);

  // Volume rankings (computed from workout sessions)
  const volumeRankings = useMemo(() => {
    if (leaderboardType !== 'volume') return [];

    // Filter sessions by time period
    const filteredSessions = filterSessionsByPeriod(allWorkoutSessions, timePeriod);

    // Build user name map from exerciseRankings (for display names)
    const userNameMap = new Map<string, string>();
    for (const entry of exerciseRankings) {
      if (!userNameMap.has(entry.userId)) {
        userNameMap.set(entry.userId, entry.userName);
      }
    }

    // Prepare sessions for volume computation
    const sessionsForVolume = filteredSessions.map((s) => ({
      id: s.id,
      userId: s.userId ?? userId,
      userName: userNameMap.get(s.userId ?? userId) || user?.displayName || 'You',
      startedAtMs: s.startedAtMs,
      sets: s.sets.map((set) => ({
        weightKg: set.weightKg,
        reps: set.reps,
      })),
    }));

    let rankings = computeVolumeRankings(sessionsForVolume, volumeMetric, userNameMap);

    // Apply scope filter
    if (scope === 'friends') {
      const filtered = filterByFriends(rankings, friendUserIds, userId);
      rankings = recomputeRanks(filtered) as VolumeLeaderboardEntry[];
    }

    return ensureCurrentUserVisible(rankings, userId, 20);
  }, [leaderboardType, allWorkoutSessions, timePeriod, volumeMetric, scope, friendUserIds, userId, exerciseRankings, user]);

  // Level rankings (computed from gamification profiles)
  const levelRankings = useMemo(() => {
    if (leaderboardType !== 'level') return [];

    // Build user name map from exerciseRankings (for display names)
    const userNameMap = new Map<string, string>();
    for (const entry of exerciseRankings) {
      if (!userNameMap.has(entry.userId)) {
        userNameMap.set(entry.userId, entry.userName);
      }
    }

    // For now, we only have the current user's gamification profile locally
    // In a full implementation, this would fetch profiles from the server
    const profiles = [
      {
        userId: userId,
        userName: user?.displayName || 'You',
        currentLevel: gamificationProfile.currentLevel,
        totalXP: gamificationProfile.totalXP,
        workoutCalendar: gamificationProfile.workoutCalendar,
      },
    ];

    // Add any users from exercise rankings with mock level data
    // This simulates having other users' gamification data
    for (const entry of exerciseRankings) {
      if (entry.userId !== userId && !profiles.find((p) => p.userId === entry.userId)) {
        // Generate mock level data based on their exercise ranking
        // This is a placeholder until server provides real gamification data
        const mockLevel = Math.min(30, Math.max(1, Math.floor((entry.score || 0) / 50) + 1));
        const mockXP = mockLevel * 500 + Math.floor(Math.random() * 500);
        profiles.push({
          userId: entry.userId,
          userName: entry.userName,
          currentLevel: mockLevel,
          totalXP: mockXP,
          workoutCalendar: [],
        });
      }
    }

    let rankings = computeLevelRankings(
      profiles,
      levelMetric,
      levelMetric === 'weeklyXP' ? timePeriod : 'all',
      userNameMap
    );

    // Apply scope filter
    if (scope === 'friends') {
      const filtered = filterByFriends(rankings, friendUserIds, userId);
      rankings = recomputeRanks(filtered) as LevelLeaderboardEntry[];
    }

    return ensureCurrentUserVisible(rankings, userId, 20);
  }, [leaderboardType, gamificationProfile, exerciseRankings, levelMetric, timePeriod, scope, friendUserIds, userId, user]);

  // Ensure current user is visible
  const displayRankings = useMemo(() => {
    if (leaderboardType === 'overall') return overallRankings;
    if (leaderboardType === 'volume') return volumeRankings;
    if (leaderboardType === 'level') return levelRankings;
    return ensureCurrentUserVisible(filteredRankings, userId, 20);
  }, [leaderboardType, filteredRankings, overallRankings, volumeRankings, levelRankings, userId]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const shouldUseRegionalFilter = scope === 'regional' && hasLocation;
      const requestBody: any = {};

      if (shouldUseRegionalFilter) {
        requestBody.body = { country: location.country, region: location.region || undefined };
      }

      if (timePeriod !== 'all') {
        requestBody.body = {
          ...requestBody.body,
          period: timePeriod,
        };
      }

      const { data, error: fetchError } = await supabase.functions.invoke(
        'get-all-exercise-leaderboards',
        Object.keys(requestBody).length > 0 ? requestBody : undefined
      );

      if (fetchError) throw fetchError;

      // Enhance data with tier information
      const enhanced = (data || []).map((entry: any) => ({
        ...entry,
        tier: entry.score ? getTierFromScore(entry.score) : undefined,
      }));

      setExerciseRankings(enhanced);

      // Auto-select first exercise if none selected
      if (!selectedExercise && enhanced.length > 0) {
        const firstExerciseId = enhanced[0]?.exerciseId;
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
  }, [selectedExercise, scope, hasLocation, location, timePeriod]);

  // Fetch leaderboard when scope or time period changes
  useEffect(() => {
    fetchLeaderboard();
  }, [scope, timePeriod]);

  // Reset selected exercise when category changes
  useEffect(() => {
    if (availableExercises.length > 0 && !availableExercises.find(e => e.id === selectedExercise)) {
      setSelectedExercise(availableExercises[0].id);
    }
  }, [availableExercises, selectedExercise]);

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

  const TypeToggle = () => (
    <View style={styles.typeRow}>
      {(['per-exercise', 'overall', 'volume', 'level'] as LeaderboardType[]).map((t) => (
        <Pressable
          key={t}
          onPress={() => setLeaderboardType(t)}
          style={[
            styles.typeChip,
            {
              backgroundColor: leaderboardType === t ? c.primary : c.card,
              borderColor: leaderboardType === t ? c.primary : c.border,
            },
          ]}
        >
          <Ionicons
            name={
              t === 'per-exercise'
                ? 'barbell-outline'
                : t === 'overall'
                ? 'stats-chart-outline'
                : t === 'volume'
                ? 'flame-outline'
                : 'star-outline'
            }
            size={14}
            color={leaderboardType === t ? '#fff' : c.text}
          />
          <Text
            style={[
              styles.typeLabel,
              {
                color: leaderboardType === t ? '#fff' : c.text,
                fontWeight: leaderboardType === t ? '700' : '400',
              },
            ]}
          >
            {t === 'per-exercise' ? 'Exercise' : t === 'overall' ? 'Overall' : t === 'volume' ? 'Volume' : 'Level'}
          </Text>
        </Pressable>
      ))}
    </View>
  );

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

  const TimePeriodToggle = () => (
    <View style={styles.periodRow}>
      {(['all', 'monthly', 'weekly'] as TimePeriod[]).map((p) => (
        <Pressable
          key={p}
          onPress={() => setTimePeriod(p)}
          style={[
            styles.periodChip,
            {
              backgroundColor: timePeriod === p ? `${c.primary}30` : 'transparent',
              borderColor: timePeriod === p ? c.primary : c.border,
            },
          ]}
        >
          <Text
            style={[
              styles.periodLabel,
              {
                color: timePeriod === p ? c.primary : c.muted,
                fontWeight: timePeriod === p ? '700' : '400',
              },
            ]}
          >
            {p === 'all' ? 'All Time' : p === 'monthly' ? 'This Month' : 'This Week'}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const VolumeMetricToggle = () => (
    <View style={styles.metricRow}>
      {([
        { id: 'volume', label: 'Total Volume', icon: 'scale-outline' },
        { id: 'sets', label: 'Total Sets', icon: 'layers-outline' },
        { id: 'workouts', label: 'Workouts', icon: 'calendar-outline' },
      ] as { id: VolumeMetric; label: string; icon: string }[]).map((m) => (
        <Pressable
          key={m.id}
          onPress={() => setVolumeMetric(m.id)}
          style={[
            styles.metricChip,
            {
              backgroundColor: volumeMetric === m.id ? `${c.primary}20` : c.card,
              borderColor: volumeMetric === m.id ? c.primary : c.border,
            },
          ]}
        >
          <Ionicons
            name={m.icon as any}
            size={14}
            color={volumeMetric === m.id ? c.primary : c.muted}
          />
          <Text
            style={[
              styles.metricLabel,
              {
                color: volumeMetric === m.id ? c.primary : c.text,
                fontWeight: volumeMetric === m.id ? '700' : '400',
              },
            ]}
          >
            {m.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const LevelMetricToggle = () => (
    <View style={styles.metricRow}>
      {([
        { id: 'level', label: 'Level', icon: 'star-outline' },
        { id: 'totalXP', label: 'Total XP', icon: 'flash-outline' },
        { id: 'weeklyXP', label: 'Recent XP', icon: 'trending-up-outline' },
      ] as { id: LevelMetric; label: string; icon: string }[]).map((m) => (
        <Pressable
          key={m.id}
          onPress={() => setLevelMetric(m.id)}
          style={[
            styles.metricChip,
            {
              backgroundColor: levelMetric === m.id ? `${c.primary}20` : c.card,
              borderColor: levelMetric === m.id ? c.primary : c.border,
            },
          ]}
        >
          <Ionicons
            name={m.icon as any}
            size={14}
            color={levelMetric === m.id ? c.primary : c.muted}
          />
          <Text
            style={[
              styles.metricLabel,
              {
                color: levelMetric === m.id ? c.primary : c.text,
                fontWeight: levelMetric === m.id ? '700' : '400',
              },
            ]}
          >
            {m.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const CategoryDropdown = () => (
    <View style={[styles.dropdownContainer, { zIndex: 20 }]}>
      <Pressable
        onPress={() => {
          setShowCategoryPicker(!showCategoryPicker);
          setShowExercisePicker(false);
        }}
        style={[
          styles.dropdown,
          styles.smallDropdown,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <Ionicons name="filter-outline" size={16} color={c.muted} />
        <Text style={[styles.dropdownText, styles.smallDropdownText, { color: c.text }]}>
          {MUSCLE_CATEGORIES.find((cat) => cat.id === selectedCategory)?.label ?? 'All'}
        </Text>
        <Ionicons
          name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={c.muted}
        />
      </Pressable>

      {showCategoryPicker && (
        <View style={[styles.dropdownList, { backgroundColor: c.card, borderColor: c.border }]}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {MUSCLE_CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => {
                  setSelectedCategory(category.id);
                  setShowCategoryPicker(false);
                }}
                style={[
                  styles.dropdownItem,
                  {
                    backgroundColor:
                      selectedCategory === category.id
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
                        selectedCategory === category.id ? c.primary : c.text,
                      fontWeight: selectedCategory === category.id ? '700' : '400',
                    },
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const ExerciseDropdown = () => (
    <View style={[styles.dropdownContainer, { zIndex: 10 }]}>
      <Pressable
        onPress={() => {
          setShowExercisePicker(!showExercisePicker);
          setShowCategoryPicker(false);
        }}
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
            {availableExercises.length === 0 ? (
              <Text style={[styles.noExercisesText, { color: c.muted }]}>
                No exercises in this category
              </Text>
            ) : (
              availableExercises.map((exercise) => (
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
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const TierBadge = ({ tier }: { tier: Tier }) => (
    <View style={[styles.tierBadge, { backgroundColor: TIER_COLORS[tier] }]}>
      <Text style={styles.tierText}>{tier.slice(0, 1)}</Text>
    </View>
  );

  const RankRow = ({ entry, index }: { entry: ExerciseRank | EnhancedLeaderboardEntry | VolumeLeaderboardEntry | LevelLeaderboardEntry; index: number }) => {
    const entryTier = 'tier' in entry && entry.tier ? entry.tier : undefined;
    const entryScore = 'score' in entry && entry.score ? entry.score : undefined;
    const isVolumeEntry = 'totalVolume' in entry;
    const isLevelEntry = 'levelTier' in entry;

    // Format the display value based on leaderboard type
    const getDisplayValue = () => {
      if (leaderboardType === 'volume' && isVolumeEntry) {
        const volumeEntry = entry as VolumeLeaderboardEntry;
        switch (volumeMetric) {
          case 'volume':
            return formatVolumeCompact(volumeEntry.totalVolume);
          case 'sets':
            return `${volumeEntry.totalSets} sets`;
          case 'workouts':
            return `${volumeEntry.workoutCount} workouts`;
        }
      }
      if (leaderboardType === 'level' && isLevelEntry) {
        const levelEntry = entry as LevelLeaderboardEntry;
        switch (levelMetric) {
          case 'level':
            return `Lvl ${levelEntry.currentLevel}`;
          case 'totalXP':
            return formatXPCompact(levelEntry.totalXP);
          case 'weeklyXP':
            return formatXPCompact(entry.value);
        }
      }
      if (leaderboardType === 'overall') {
        return `${entry.value} avg`;
      }
      return formatValue(entry.value);
    };

    // Get level tier color for level leaderboard
    const getLevelColor = (level: number): string => {
      if (level <= 5) return TIER_COLORS.Iron;
      if (level <= 10) return TIER_COLORS.Bronze;
      if (level <= 15) return TIER_COLORS.Silver;
      if (level <= 20) return TIER_COLORS.Gold;
      if (level <= 30) return TIER_COLORS.Platinum;
      return TIER_COLORS.Mythic;
    };

    return (
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

          {/* Tier badge (if available, not shown for volume or level) */}
          {entryTier && leaderboardType !== 'volume' && leaderboardType !== 'level' && <TierBadge tier={entryTier} />}

          {/* Flame icon for volume leaderboard top 3 */}
          {leaderboardType === 'volume' && entry.rank <= 3 && (
            <Ionicons
              name="flame"
              size={18}
              color={entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : '#CD7F32'}
            />
          )}

          {/* Star icon for level leaderboard with tier color */}
          {leaderboardType === 'level' && isLevelEntry && (
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor((entry as LevelLeaderboardEntry).currentLevel) }]}>
              <Text style={styles.levelBadgeText}>
                {(entry as LevelLeaderboardEntry).currentLevel}
              </Text>
            </View>
          )}

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

          {/* Score and value */}
          <View style={styles.valueContainer}>
            {entryScore !== undefined && leaderboardType !== 'volume' && leaderboardType !== 'level' && (
              <Text style={[styles.scoreText, { color: entryTier ? TIER_COLORS[entryTier] : c.muted }]}>
                {Math.round(entryScore)}
              </Text>
            )}
            {isLevelEntry && leaderboardType === 'level' && (
              <Text style={[styles.levelTierText, { color: getLevelColor((entry as LevelLeaderboardEntry).currentLevel) }]}>
                {(entry as LevelLeaderboardEntry).levelTier}
              </Text>
            )}
            <Text style={[styles.value, { color: c.text }]}>
              {getDisplayValue()}
            </Text>
          </View>
        </View>
      </>
    );
  };

  const EmptyState = () => {
    let icon = 'trophy-outline';
    let title = scope === 'friends' ? 'No Friends Yet' : 'No Rankings Yet';
    let subtitle = scope === 'friends'
      ? 'Add friends to see how you compare!'
      : 'Log workouts and compete with others!';

    if (leaderboardType === 'volume') {
      icon = 'flame-outline';
      title = 'No Volume Data Yet';
      subtitle = timePeriod === 'weekly'
        ? 'Start logging workouts this week to see the grind leaderboard!'
        : timePeriod === 'monthly'
        ? 'Start logging workouts this month to climb the ranks!'
        : 'Log some workouts to see who\'s grinding the most!';
    }

    if (leaderboardType === 'level') {
      icon = 'star-outline';
      title = 'No Level Data Yet';
      subtitle = levelMetric === 'weeklyXP'
        ? 'Earn XP this week to climb the rising stars leaderboard!'
        : 'Complete workouts to earn XP and level up!';
    }

    return (
      <View style={[styles.emptyState, { backgroundColor: c.card, borderColor: c.border }]}>
        <Ionicons name={icon as any} size={48} color={c.muted} />
        <Text style={[styles.emptyTitle, { color: c.text }]}>{title}</Text>
        <Text style={[styles.emptySubtitle, { color: c.muted }]}>{subtitle}</Text>
      </View>
    );
  };

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
      {/* Leaderboard type toggle */}
      <TypeToggle />

      {/* Time period filter (for Overall, Volume, and Level with weeklyXP) */}
      {(leaderboardType === 'overall' || leaderboardType === 'volume' || (leaderboardType === 'level' && levelMetric === 'weeklyXP')) && <TimePeriodToggle />}

      {/* Volume metric toggle (for Volume leaderboard) */}
      {leaderboardType === 'volume' && <VolumeMetricToggle />}

      {/* Level metric toggle (for Level leaderboard) */}
      {leaderboardType === 'level' && <LevelMetricToggle />}

      {/* Scope toggle */}
      <ScopeToggle />

      {/* Regional scope info */}
      {scope === 'regional' && hasLocation && (
        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="location" size={20} color={c.primary} />
          <Text style={[styles.infoText, { color: c.text }]}>
            Showing users from {location.region ? `${location.region}, ` : ''}{location.country}
          </Text>
        </View>
      )}

      {/* Prompt to set location when regional is disabled */}
      {!hasLocation && (
        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="information-circle-outline" size={20} color={c.muted} />
          <Text style={[styles.infoText, { color: c.muted }]}>
            Set your location in Settings to unlock regional leaderboards.
          </Text>
        </View>
      )}

      {/* Exercise-specific controls */}
      {leaderboardType === 'per-exercise' && (
        <>
          {/* Category filter */}
          <CategoryDropdown />

          {/* Exercise dropdown */}
          <ExerciseDropdown />
        </>
      )}

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
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: c.text }]}>
              {leaderboardType === 'overall'
                ? 'Overall GymRank'
                : leaderboardType === 'volume'
                ? volumeMetric === 'volume'
                  ? 'Volume Champions'
                  : volumeMetric === 'sets'
                  ? 'Set Grinders'
                  : 'Workout Warriors'
                : leaderboardType === 'level'
                ? levelMetric === 'level'
                  ? 'Level Leaders'
                  : levelMetric === 'totalXP'
                  ? 'XP Masters'
                  : 'Rising Stars'
                : `${EXERCISES_V1.find((e) => e.id === selectedExercise)?.name} Rankings`}
            </Text>
            <Text style={[styles.listSubtitle, { color: c.muted }]}>
              {leaderboardType === 'overall'
                ? 'Average score across all exercises'
                : leaderboardType === 'volume'
                ? volumeMetric === 'volume'
                  ? 'Total weight moved (weight × reps)'
                  : volumeMetric === 'sets'
                  ? 'Total working sets logged'
                  : 'Number of completed workouts'
                : leaderboardType === 'level'
                ? levelMetric === 'level'
                  ? 'Highest level achieved'
                  : levelMetric === 'totalXP'
                  ? 'Total experience points earned'
                  : `XP earned ${timePeriod === 'weekly' ? 'this week' : timePeriod === 'monthly' ? 'this month' : 'all time'}`
                : 'Best e1RM scores'}
            </Text>
          </View>
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
  typeRow: {
    flexDirection: 'row',
    gap: FR.space.x2,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  typeLabel: {
    fontSize: 13,
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
  periodRow: {
    flexDirection: 'row',
    gap: FR.space.x2,
  },
  periodChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  periodLabel: {
    fontSize: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: FR.space.x2,
  },
  metricChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 11,
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: FR.space.x3,
    borderRadius: FR.radius.card,
    borderWidth: 1,
  },
  smallDropdown: {
    paddingVertical: FR.space.x2,
    gap: 8,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  smallDropdownText: {
    fontSize: 14,
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
  noExercisesText: {
    padding: FR.space.x3,
    textAlign: 'center',
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: FR.space.x2,
    padding: FR.space.x3,
    borderRadius: FR.radius.card,
    borderWidth: 1,
  },
  infoText: {
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
    gap: FR.space.x2,
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
  tierBadge: {
    width: 24,
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  levelBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  levelTierText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    flex: 1,
    fontSize: 14,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
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
