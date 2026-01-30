// src/ui/components/WorkoutReplay/RankChangeDisplay.tsx
// Rank change display component for workout replay

import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../ui/theme';
import type { ReplayRankChange } from '../../../lib/workoutReplay/replayTypes';
import { getTierColor } from '../../../lib/workoutReplay/replayUtils';

interface RankChangeDisplayProps {
  rankChange: ReplayRankChange;
}

export function RankChangeDisplay({ rankChange }: RankChangeDisplayProps) {
  const c = useThemeColors();
  const oldTierColor = getTierColor(rankChange.oldTier);
  const newTierColor = getTierColor(rankChange.newTier);

  return (
    <View style={[styles.container, { backgroundColor: c.card, borderColor: c.border }]}>
      <Text style={[styles.exercise, { color: c.text }]}>{rankChange.exerciseName}</Text>

      <View style={styles.rankRow}>
        <View style={styles.rankBadge}>
          <Text style={[styles.rankText, { color: oldTierColor }]}>{rankChange.oldTier}</Text>
          <Text style={[styles.rankNumber, { color: c.muted }]}>{rankChange.oldRank}</Text>
        </View>

        <Text style={[styles.arrow, { color: c.muted }]}>→</Text>

        <View style={styles.rankBadge}>
          <Text style={[styles.rankText, { color: newTierColor }]}>{rankChange.newTier}</Text>
          <Text style={[styles.rankNumber, { color: c.text }]}>{rankChange.newRank}</Text>
        </View>
      </View>

      <Text style={[styles.message, { color: c.muted }]}>
        Rank improved from {rankChange.oldRank} to {rankChange.newRank}!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  exercise: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  rankBadge: {
    alignItems: 'center',
    gap: 4,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: '900',
  },
  arrow: {
    fontSize: 20,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});