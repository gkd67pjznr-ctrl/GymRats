/**
 * Volume Trend Card - Displays training volume trends
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';

type ExerciseStat = {
  exerciseId: string;
  name: string;
  e1rmHistory: { date: string; e1rm: number }[];
  volumeHistory: { week: string; volume: number }[];
  rankHistory: { date: string; rank: number; score: number }[];
};

type VolumeTrendCardProps = {
  exercises: ExerciseStat[];
  isLoading: boolean;
};

const VolumeTrendCard: React.FC<VolumeTrendCardProps> = ({ exercises, isLoading }) => {
  const ds = makeDesignSystem('dark', 'toxic');

  // Calculate total volume across all exercises
  const totalVolume: { week: string; volume: number }[] = [];
  const volumeByExercise: Record<string, { week: string; volume: number }[]> = {};

  exercises.forEach(exercise => {
    volumeByExercise[exercise.exerciseId] = exercise.volumeHistory;

    exercise.volumeHistory.forEach(point => {
      const existing = totalVolume.find(v => v.week === point.week);
      if (existing) {
        existing.volume += point.volume;
      } else {
        totalVolume.push({ ...point });
      }
    });
  });

  // Sort by week
  totalVolume.sort((a, b) => a.week.localeCompare(b.week));

  return (
    <View style={[styles.card, { backgroundColor: ds.tone.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: ds.tone.text }]}>Volume Trends</Text>
        <Text style={[styles.subtitle, { color: ds.tone.textSecondary }]}>
          Track your training volume over time
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={ds.tone.accent} size="large" />
        </View>
      ) : exercises && exercises.length > 0 ? (
        <View style={styles.content}>
          <View style={styles.chartContainer}>
            <View style={styles.chartPlaceholder}>
              <Text style={[styles.chartText, { color: ds.tone.textSecondary }]}>
                Volume Trend Chart
              </Text>
              <Text style={[styles.chartText, { color: ds.tone.textSecondary }]}>
                {totalVolume.length} weeks of data
              </Text>
              {totalVolume.length > 0 && (
                <Text style={[styles.chartText, { color: ds.tone.textSecondary }]}>
                  Latest volume: {totalVolume[totalVolume.length - 1]?.volume.toFixed(0)} kg
                </Text>
              )}
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: ds.tone.text }]}>
                {totalVolume.length > 0
                  ? Math.round(totalVolume[totalVolume.length - 1]?.volume || 0)
                  : 0}
              </Text>
              <Text style={[styles.statLabel, { color: ds.tone.textSecondary }]}>
                Latest (kg)
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: ds.tone.text }]}>
                {totalVolume.length > 0
                  ? Math.round(totalVolume.reduce((sum, point) => sum + point.volume, 0) / totalVolume.length)
                  : 0}
              </Text>
              <Text style={[styles.statLabel, { color: ds.tone.textSecondary }]}>
                Average (kg)
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: ds.tone.text }]}>
                {totalVolume.length}
              </Text>
              <Text style={[styles.statLabel, { color: ds.tone.textSecondary }]}>
                Weeks
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: ds.tone.textSecondary }]}>
            No volume data available
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  loadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  chartContainer: {
    height: 150,
    marginBottom: 20,
  },
  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  chartText: {
    fontSize: 16,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  emptyContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VolumeTrendCard;