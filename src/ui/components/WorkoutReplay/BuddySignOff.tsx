// src/ui/components/WorkoutReplay/BuddySignOff.tsx
// Buddy sign-off component for workout replay

import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../ui/theme';

interface BuddySignOffProps {
  message: string;
  buddyName: string;
  buddyTier: string;
}

export function BuddySignOff({ message, buddyName, buddyTier }: BuddySignOffProps) {
  const c = useThemeColors();

  // Determine if this is a legendary buddy for special styling
  const isLegendary = buddyTier === 'legendary';

  return (
    <View style={[styles.container, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.header}>
        <Text style={[styles.buddyLabel, { color: c.muted }]}>FROM YOUR BUDDY</Text>
        <Text style={[styles.buddyName, { color: c.text }]}>
          {buddyName}
          {isLegendary && (
            <Text style={styles.legendaryStar}> ★</Text>
          )}
        </Text>
      </View>

      <Text style={[styles.message, { color: c.text }]}>"{message}"</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  buddyLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  buddyName: {
    fontSize: 18,
    fontWeight: '800',
  },
  legendaryStar: {
    color: '#9370DB',
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
});