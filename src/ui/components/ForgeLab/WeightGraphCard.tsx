/**
 * Weight Graph Card - Displays bodyweight trend over time
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { makeDesignSystem } from '@/src/ui/designSystem';

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
          {/* Placeholder for chart - in a real implementation, this would use a charting library */}
          <View style={styles.chartPlaceholder}>
            <Text style={[styles.chartText, { color: ds.tone.textSecondary }]}>
              Weight Chart Visualization
            </Text>
            <Text style={[styles.chartText, { color: ds.tone.textSecondary }]}>
              {data.length} data points
            </Text>
          </View>
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
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default WeightGraphCard;