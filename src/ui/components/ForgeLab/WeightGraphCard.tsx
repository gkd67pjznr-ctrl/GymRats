/**
 * Weight Graph Card - Displays bodyweight trend over time
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';
import VictoryLineChart from './VictoryLineChart';

type WeightDataPoint = {
  date: string;
  weightKg: number;
};

type WeightGraphCardProps = {
  data: WeightDataPoint[];
  isLoading: boolean;
};

const WeightGraphCard: React.FC<WeightGraphCardProps> = ({ data, isLoading }) => {
  const ds = makeDesignSystem('dark', 'toxic');

  // Transform data for Victory chart
  const chartData = data.map(point => ({
    x: point.date,
    y: point.weightKg,
    date: point.date,
  }));

  return (
    <View style={[styles.card, { backgroundColor: ds.tone.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: ds.tone.text }]}>Weight Trend</Text>
        <Text style={[styles.subtitle, { color: ds.tone.textSecondary }]}>
          Track your bodyweight over time
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={ds.tone.accent} size="large" />
        </View>
      ) : data && data.length > 0 ? (
        <View style={styles.chartContainer}>
          <VictoryLineChart
            data={chartData}
            xLabel="Date"
            yLabel="Weight (kg)"
            accentColor={ds.tone.accent}
            height={180}
            showDots={chartData.length <= 20} // Only show dots for reasonable number of points
          />
          {chartData.length > 0 && (
            <View style={styles.statsContainer}>
              <Text style={[styles.statsText, { color: ds.tone.textSecondary }]}>
                {chartData.length} measurements •
                Latest: {chartData[chartData.length - 1].y.toFixed(1)}kg
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: ds.tone.textSecondary }]}>
            No weight data available. Add your weight in settings.
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
    marginBottom: 20,
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
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    height: 200,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    opacity: 0.8,
  },
});

export default WeightGraphCard;