// src/ui/components/WorkoutReplay/StatCard.tsx
// Stat card component for workout replay

import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../ui/theme';

interface StatCardProps {
  label: string;
  value: string;
  color: string;
}

export function StatCard({ label, value, color }: StatCardProps) {
  const c = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <Text style={[styles.label, { color: c.muted }]}>{label}</Text>
      <Text style={[styles.value, { color, textShadowColor: color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
  },
});