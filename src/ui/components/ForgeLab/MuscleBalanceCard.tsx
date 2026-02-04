/**
 * Muscle Balance Card - Displays muscle group balance analytics
 * Enhanced with radar chart view for visual muscle balance
 */
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import VictoryBarChart from './VictoryBarChart';
import RadarChart from './RadarChart';

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
  const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');

  // Get the most recent period data
  const latestData = data && data.length > 0 ? data[data.length - 1] : null;
  const previousData = data && data.length > 1 ? data[data.length - 2] : null;

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

  // Prepare radar chart data - use major muscle groups for cleaner display
  const majorMuscleGroups = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core'] as const;

  const radarData = useMemo(() => {
    if (!latestData) return [];

    // Aggregate detailed groups into major groups
    const aggregated: Record<string, number> = {
      chest: (latestData.groups.chest || 0) + (latestData.groups.upper_chest || 0) + (latestData.groups.lower_chest || 0),
      back: (latestData.groups.back || 0) + (latestData.groups.lats || 0) + (latestData.groups.mid_back || 0) + (latestData.groups.traps || 0),
      shoulders: (latestData.groups.shoulders || 0) + (latestData.groups.front_delt || 0) + (latestData.groups.side_delt || 0) + (latestData.groups.rear_delt || 0),
      legs: (latestData.groups.legs || 0) + (latestData.groups.quads || 0) + (latestData.groups.hamstrings || 0) + (latestData.groups.glutes || 0) + (latestData.groups.calves || 0),
      arms: (latestData.groups.arms || 0) + (latestData.groups.biceps || 0) + (latestData.groups.triceps || 0) + (latestData.groups.forearms || 0),
      core: (latestData.groups.core || 0) + (latestData.groups.abs || 0) + (latestData.groups.obliques || 0),
    };

    return majorMuscleGroups.map(group => ({
      label: group,
      value: aggregated[group] || 0,
    }));
  }, [latestData]);

  // Prepare comparison data from previous period
  const comparisonRadarData = useMemo(() => {
    if (!previousData) return undefined;

    const aggregated: Record<string, number> = {
      chest: (previousData.groups.chest || 0) + (previousData.groups.upper_chest || 0) + (previousData.groups.lower_chest || 0),
      back: (previousData.groups.back || 0) + (previousData.groups.lats || 0) + (previousData.groups.mid_back || 0) + (previousData.groups.traps || 0),
      shoulders: (previousData.groups.shoulders || 0) + (previousData.groups.front_delt || 0) + (previousData.groups.side_delt || 0) + (previousData.groups.rear_delt || 0),
      legs: (previousData.groups.legs || 0) + (previousData.groups.quads || 0) + (previousData.groups.hamstrings || 0) + (previousData.groups.glutes || 0) + (previousData.groups.calves || 0),
      arms: (previousData.groups.arms || 0) + (previousData.groups.biceps || 0) + (previousData.groups.triceps || 0) + (previousData.groups.forearms || 0),
      core: (previousData.groups.core || 0) + (previousData.groups.abs || 0) + (previousData.groups.obliques || 0),
    };

    return majorMuscleGroups.map(group => ({
      label: group,
      value: aggregated[group] || 0,
    }));
  }, [previousData]);

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
          {/* Chart Type Toggle */}
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setChartType('radar')}
              style={[
                styles.toggleButton,
                {
                  backgroundColor: chartType === 'radar' ? ds.tone.accent : ds.tone.bg,
                  borderColor: ds.tone.accent,
                }
              ]}
            >
              <Text style={[
                styles.toggleText,
                { color: chartType === 'radar' ? ds.tone.bg : ds.tone.text }
              ]}>
                Radar
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setChartType('bar')}
              style={[
                styles.toggleButton,
                {
                  backgroundColor: chartType === 'bar' ? ds.tone.accent : ds.tone.bg,
                  borderColor: ds.tone.accent,
                }
              ]}
            >
              <Text style={[
                styles.toggleText,
                { color: chartType === 'bar' ? ds.tone.bg : ds.tone.text }
              ]}>
                Bar
              </Text>
            </Pressable>
          </View>

          <View style={styles.chartContainer}>
            {chartType === 'radar' ? (
              radarData.length >= 3 ? (
                <View style={styles.radarContainer}>
                  <RadarChart
                    data={radarData}
                    size={220}
                    accentColor={ds.tone.accent}
                    showLabels={true}
                    showValues={true}
                    comparisonData={comparisonRadarData}
                    comparisonColor="rgba(255,255,255,0.3)"
                  />
                  {comparisonRadarData && (
                    <View style={styles.legendRow}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: ds.tone.accent }]} />
                        <Text style={[styles.legendText, { color: ds.tone.textSecondary }]}>
                          Current
                        </Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' }]} />
                        <Text style={[styles.legendText, { color: ds.tone.textSecondary }]}>
                          Previous
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.chartPlaceholder}>
                  <Text style={[styles.chartText, { color: ds.tone.textSecondary }]}>
                    Need more data for radar chart
                  </Text>
                </View>
              )
            ) : chartData.length > 0 ? (
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
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    minHeight: 150,
    marginBottom: 20,
  },
  radarContainer: {
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
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