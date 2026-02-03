// src/ui/components/ForgeLab/BodyModelCard.tsx
// Body Model card for Forge Lab - muscle heatmap visualization

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useThemeColors } from '../../theme';
import { FR } from '../../forgerankStyle';
import { BodyModel } from '../BodyModel';
import { useWorkoutSessions } from '../../../lib/stores/workoutStore';
import { calculateMuscleVolumes } from '../../../lib/volumeCalculator';

type TimeFilter = 'week' | 'month' | 'all';

type Props = {
  /** If true, show as full-screen content rather than card */
  fullScreen?: boolean;
};

export function BodyModelCard({ fullScreen = false }: Props) {
  const c = useThemeColors();
  const sessions = useWorkoutSessions();
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');

  // Compute filtered sessions based on time filter
  const now = Date.now();
  let filteredSessions = sessions;

  if (timeFilter === 'week') {
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    filteredSessions = sessions.filter((s) => s.startedAtMs >= oneWeekAgo);
  } else if (timeFilter === 'month') {
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    filteredSessions = sessions.filter((s) => s.startedAtMs >= oneMonthAgo);
  }

  const displayVolumes = calculateMuscleVolumes(filteredSessions);

  const TimeFilterButton = ({ filter, label }: { filter: TimeFilter; label: string }) => (
    <Pressable
      onPress={() => setTimeFilter(filter)}
      style={[
        styles.filterButton,
        {
          backgroundColor: timeFilter === filter ? c.primary : c.card,
          borderColor: timeFilter === filter ? c.primary : c.border,
        },
      ]}
    >
      <Text
        style={[
          styles.filterLabel,
          {
            color: timeFilter === filter ? '#fff' : c.text,
            fontWeight: timeFilter === filter ? '700' : '400',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const content = (
    <>
      {/* Header with side toggle */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: c.text }]}>Muscle Map</Text>
        <View style={styles.sideToggle}>
          <Pressable onPress={() => setViewSide('front')}>
            <Text
              style={[
                styles.sideLabel,
                { color: viewSide === 'front' ? c.primary : c.muted },
              ]}
            >
              Front
            </Text>
          </Pressable>
          <Pressable onPress={() => setViewSide('back')}>
            <Text
              style={[
                styles.sideLabel,
                { color: viewSide === 'back' ? c.primary : c.muted },
              ]}
            >
              Back
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Time filter */}
      <View style={styles.filterRow}>
        <TimeFilterButton filter="week" label="Week" />
        <TimeFilterButton filter="month" label="Month" />
        <TimeFilterButton filter="all" label="All Time" />
      </View>

      {/* Body model */}
      <BodyModel muscleVolumes={displayVolumes} side={viewSide} />

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendLabel, { color: c.muted }]}>
          Heatmap based on training volume
        </Text>
        <View style={styles.legendScale}>
          <View style={[styles.legendBox, { backgroundColor: c.card }]} />
          <Text style={[styles.legendText, { color: c.muted }]}>None</Text>
          <View style={styles.legendSpacer} />
          <View style={[styles.legendBox, { backgroundColor: c.primary, opacity: 0.5 }]} />
          <Text style={[styles.legendText, { color: c.muted }]}>Some</Text>
          <View style={styles.legendSpacer} />
          <View style={[styles.legendBox, { backgroundColor: c.primary }]} />
          <Text style={[styles.legendText, { color: c.muted }]}>High</Text>
        </View>
      </View>
    </>
  );

  if (fullScreen) {
    return (
      <ScrollView
        style={[styles.fullScreenContainer, { backgroundColor: c.bg }]}
        contentContainerStyle={styles.fullScreenContent}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: FR.radius.card,
    borderWidth: 1,
    padding: FR.space.x3,
    gap: FR.space.x3,
  },
  fullScreenContainer: {
    flex: 1,
  },
  fullScreenContent: {
    padding: FR.space.x4,
    gap: FR.space.x3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
  },
  sideToggle: {
    flexDirection: 'row',
    gap: FR.space.x3,
  },
  sideLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: FR.space.x2,
    justifyContent: 'center',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterLabel: {
    fontSize: 12,
  },
  legend: {
    alignItems: 'center',
    gap: FR.space.x2,
  },
  legendLabel: {
    fontSize: 12,
  },
  legendScale: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    marginLeft: 4,
  },
  legendSpacer: {
    width: 12,
  },
});

export default BodyModelCard;
