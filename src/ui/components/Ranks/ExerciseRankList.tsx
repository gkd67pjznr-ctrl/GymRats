// src/ui/components/Ranks/ExerciseRankList.tsx
// Scrollable list of exercise rank cards with sorting options

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { FR } from '../../forgerankStyle';
import { ExerciseRankCard } from './ExerciseRankCard';
import { useExerciseRanks } from '../../../lib/hooks/useExerciseRanks';
import type { ExerciseRankSortOption, ExerciseRankSummary } from '../../../lib/types/rankTypes';

type Props = {
  onCompare?: (exerciseId: string) => void;
  onShare?: (exerciseId: string) => void;
};

type SortOption = {
  value: ExerciseRankSortOption;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const SORT_OPTIONS: SortOption[] = [
  { value: 'rank', label: 'By Rank', icon: 'trophy-outline' },
  { value: 'recent', label: 'Recent', icon: 'time-outline' },
  { value: 'alphabetical', label: 'A-Z', icon: 'text-outline' },
  { value: 'volume', label: 'Volume', icon: 'barbell-outline' },
];

export function ExerciseRankList({ onCompare, onShare }: Props) {
  const c = useThemeColors();
  const [sortOption, setSortOption] = useState<ExerciseRankSortOption>('rank');
  const [refreshing, setRefreshing] = useState(false);
  const exerciseRanks = useExerciseRanks(sortOption);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // In future, this could trigger a data sync
    // For now, just wait briefly to simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const renderSortChip = (option: SortOption) => (
    <Pressable
      key={option.value}
      onPress={() => setSortOption(option.value)}
      style={[
        styles.sortChip,
        {
          backgroundColor: sortOption === option.value ? c.primary : c.card,
          borderColor: sortOption === option.value ? c.primary : c.border,
        },
      ]}
    >
      <Ionicons
        name={option.icon}
        size={14}
        color={sortOption === option.value ? '#fff' : c.muted}
      />
      <Text
        style={[
          styles.sortLabel,
          {
            color: sortOption === option.value ? '#fff' : c.text,
            fontWeight: sortOption === option.value ? '700' : '400',
          },
        ]}
      >
        {option.label}
      </Text>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: c.card, borderColor: c.border }]}>
      <Ionicons name="barbell-outline" size={48} color={c.muted} />
      <Text style={[styles.emptyTitle, { color: c.text }]}>No Exercises Logged</Text>
      <Text style={[styles.emptySubtitle, { color: c.muted }]}>
        Complete your first workout to see your exercise rankings here.
      </Text>
    </View>
  );

  const renderItem = useCallback(
    ({ item }: { item: ExerciseRankSummary }) => (
      <ExerciseRankCard
        summary={item}
        onCompare={onCompare ? () => onCompare(item.exerciseId) : undefined}
        onShare={onShare ? () => onShare(item.exerciseId) : undefined}
      />
    ),
    [onCompare, onShare]
  );

  const keyExtractor = useCallback((item: ExerciseRankSummary) => item.exerciseId, []);

  return (
    <View style={styles.container}>
      {/* Sort options */}
      <View style={styles.sortRow}>
        <Text style={[styles.sortLabel2, { color: c.muted }]}>Sort:</Text>
        {SORT_OPTIONS.map(renderSortChip)}
      </View>

      {/* Exercise count */}
      <Text style={[styles.countText, { color: c.muted }]}>
        {exerciseRanks.length} exercise{exerciseRanks.length !== 1 ? 's' : ''} tracked
      </Text>

      {/* List */}
      <FlatList
        data={exerciseRanks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.primary}
            colors={[c.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: FR.space.x2,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: FR.space.x2,
    flexWrap: 'wrap',
  },
  sortLabel2: {
    fontSize: 12,
    marginRight: 4,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  sortLabel: {
    fontSize: 12,
  },
  countText: {
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
  separator: {
    height: FR.space.x3,
  },
  emptyState: {
    padding: FR.space.x6,
    borderRadius: FR.radius.card,
    borderWidth: 1,
    alignItems: 'center',
    gap: FR.space.x3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
