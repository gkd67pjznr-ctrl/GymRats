// src/ui/components/WorkoutReplay/PRHighlight.tsx
// PR highlight component for workout replay

import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../ui/theme';
import type { ReplayPR } from '../../../lib/workoutReplay/replayTypes';

interface PRHighlightProps {
  pr: ReplayPR;
  exerciseName: string;
}

export function PRHighlight({ pr, exerciseName }: PRHighlightProps) {
  const c = useThemeColors();

  // Get PR type label
  const getPRTypeLabel = () => {
    switch (pr.type) {
      case 'weight': return 'Weight PR';
      case 'rep': return 'Rep PR';
      case 'e1rm': return 'e1RM PR';
      default: return 'PR';
    }
  };

  // Get PR value label
  const getPRValueLabel = () => {
    switch (pr.type) {
      case 'weight': return `+${pr.value.toFixed(1)} lb`;
      case 'rep': return `+${pr.value} reps`;
      case 'e1rm': return `+${pr.value.toFixed(1)} lb e1RM`;
      default: return `+${pr.value}`;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.card, borderColor: '#fbbf24' }]}>
      <View style={styles.header}>
        <Text style={[styles.prType, { color: '#fbbf24' }]}>{getPRTypeLabel()}</Text>
        <Text style={[styles.exercise, { color: c.text }]}>{exerciseName}</Text>
      </View>
      <Text style={[styles.value, { color: c.text }]}>{getPRValueLabel()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prType: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  exercise: {
    fontSize: 16,
    fontWeight: '700',
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
  },
});