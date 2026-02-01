/**
 * Muscle Balance Card - Displays muscle group balance analytics
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import VictoryBarChart from './VictoryBarChart';

type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core'
  | 'upper_chest' | 'lower_chest' | 'front_delt' | 'side_delt' | 'rear_delt'
  | 'lats' | 'mid_back' | 'traps' | 'biceps' | 'triceps' | 'forearms'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'abs' | 'obliques';

type MuscleGroupVolumeData = {
  period: string;
  groups: Record<MuscleGroup, number>;
};

type MuscleBalanceCardProps = {
  data: MuscleGroupVolumeData[];
  isLoading: boolean;
};

const MuscleBalanceCard: React.FC<MuscleBalanceCardProps> = ({ data, isLoading }) => {
  const ds = makeDesignSystem('dark', 'toxic');

  // Get the most recent period data
  const latestData = data && data.length > 0 ? data[data.length - 1] : null;

  // Calculate total volume for percentage calculations
  let totalVolume = 0;
  if (latestData) {
    Object.values(latestData.groups).forEach(volume => {
      totalVolume += volume;
    });
  }

  // Get top muscle groups by volume
  const topMuscleGroups: { name: string; volume: number; percentage: number }[] = [];
  if (latestData) {
    Object.entries(latestData.groups)
      .filter(([_, volume]) => volume > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .forEach(([name, volume]) => {
        topMuscleGroups.push({
          name,
          volume,
          percentage: totalVolume > 0 ? (volume / totalVolume) * 100 : 0
        });
      });
  }

  // Prepare chart data for muscle group volumes
  const chartData = latestData
    ? Object.entries(latestData.groups)
        .filter(([_, volume]) => volume > 0)
        .map(([muscleGroup, volume]) => ({
          x: muscleGroup,
          y: volume,
          label: muscleGroup,
        }))
        .sort((a, b) => b.y - a.y) // Sort descending
    : [];

  return (
    <View style={[styles.card, { backgroundColor: ds.tone.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: ds.tone.text }]}>Muscle Balance</Text>
        <Text style={[styles.subtitle, { color: ds.tone.textSecondary }]}>
          Distribution of training volume across muscle groups
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={ds.tone.accent} size="large" />
        </View>
      ) : latestData ? (
        <View style={styles.content}>
          <View style={styles.chartContainer}>
            {chartData.length > 0 ? (
              <VictoryBarChart
                data={chartData}
                xLabel="Muscle Group"
                yLabel="Volume (kg)"
                accentColor={ds.tone.accent}
                height={150}
                barWidth={20}
              />
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text style={[styles.chartText, { color: ds.tone.textSecondary }]}>
                  No muscle group volume data
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.sectionTitle, { color: ds.tone.text }]}>
            Top Muscle Groups
          </Text>

          <ScrollView style={styles.muscleList}>
            {topMuscleGroups.map((group, index) => (
              <View key={group.name} style={styles.muscleItem}>
                <View style={styles.muscleInfo}>
                  <Text style={[styles.muscleName, { color: ds.tone.text }]}>
                    {group.name}
                  </Text>
                  <Text style={[styles.muscleVolume, { color: ds.tone.textSecondary }]}>
                    {group.volume.toFixed(0)} kg ({group.percentage.toFixed(1)}%)
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: ds.tone.accent,
                        width: `${Math.min(group.percentage, 100)}%`
                      }
                    ]}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: ds.tone.textSecondary }]}>
            No muscle group data available
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
    height: 300,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  muscleList: {
    maxHeight: 200,
  },
  muscleItem: {
    marginBottom: 12,
  },
  muscleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  muscleName: {
    fontSize: 16,
    fontWeight: '600',
  },
  muscleVolume: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MuscleBalanceCard;