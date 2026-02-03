// src/ui/components/Ranks/RankSparkline.tsx
// Sparkline chart showing e1RM progression over time

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';
import { FR } from '../../forgerankStyle';
import type { SparklineDataPoint, SparklineTimeframe } from '../../../lib/types/rankTypes';

type Props = {
  data: SparklineDataPoint[];
  selectedTimeframe: SparklineTimeframe;
  onTimeframeChange: (timeframe: SparklineTimeframe) => void;
  height?: number;
};

const TIMEFRAME_OPTIONS: { value: SparklineTimeframe; label: string }[] = [
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'All' },
];

export function RankSparkline({
  data,
  selectedTimeframe,
  onTimeframeChange,
  height = 80,
}: Props) {
  const c = useThemeColors();

  // Calculate min/max for scaling
  const values = data.map((d) => d.e1rmKg);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 100;
  const range = maxValue - minValue || 1;

  // Calculate stroke width and point positions
  const chartPadding = 8;

  return (
    <View style={styles.container}>
      {/* Timeframe selector */}
      <View style={styles.timeframeRow}>
        {TIMEFRAME_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onTimeframeChange(option.value)}
            style={[
              styles.timeframeChip,
              {
                backgroundColor:
                  selectedTimeframe === option.value ? c.primary : c.card,
                borderColor:
                  selectedTimeframe === option.value ? c.primary : c.border,
              },
            ]}
          >
            <Text
              style={[
                styles.timeframeLabel,
                {
                  color: selectedTimeframe === option.value ? '#fff' : c.muted,
                  fontWeight: selectedTimeframe === option.value ? '700' : '400',
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Sparkline chart */}
      {data.length > 1 ? (
        <View style={[styles.chartContainer, { height }]}>
          {/* Simple line chart using views */}
          <View style={[styles.chartArea, { paddingHorizontal: chartPadding }]}>
            {data.map((point, index) => {
              if (index === 0) return null;

              const prevPoint = data[index - 1];
              const chartWidth = 1; // Will be calculated by flex
              const chartHeight = height - chartPadding * 2;

              // Calculate normalized Y positions (inverted because RN Y goes down)
              const y1 = 1 - (prevPoint.e1rmKg - minValue) / range;
              const y2 = 1 - (point.e1rmKg - minValue) / range;

              // Position along X axis
              const x1 = (index - 1) / (data.length - 1);
              const x2 = index / (data.length - 1);

              return (
                <View
                  key={point.timestampMs}
                  style={[
                    styles.lineSegment,
                    {
                      position: 'absolute',
                      left: `${x1 * 100}%`,
                      width: `${(x2 - x1) * 100}%`,
                      top: `${Math.min(y1, y2) * 100}%`,
                      height: Math.max(2, Math.abs(y2 - y1) * chartHeight),
                      backgroundColor: c.primary,
                      transform: [
                        { rotate: `${Math.atan2((y2 - y1) * chartHeight, (x2 - x1) * 200) * (180 / Math.PI)}deg` },
                      ],
                    },
                  ]}
                />
              );
            })}

            {/* Data points */}
            {data.map((point, index) => {
              const y = 1 - (point.e1rmKg - minValue) / range;
              const x = index / (data.length - 1);

              return (
                <View
                  key={`point-${point.timestampMs}`}
                  style={[
                    styles.dataPoint,
                    {
                      position: 'absolute',
                      left: `${x * 100}%`,
                      top: `${y * 100}%`,
                      backgroundColor: c.primary,
                      marginLeft: -4,
                      marginTop: -4,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Y-axis labels */}
          <View style={styles.yAxisLabels}>
            <Text style={[styles.axisLabel, { color: c.muted }]}>
              {Math.round(maxValue)} kg
            </Text>
            <Text style={[styles.axisLabel, { color: c.muted }]}>
              {Math.round(minValue)} kg
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.emptyChart, { height, backgroundColor: c.card }]}>
          <Text style={[styles.emptyText, { color: c.muted }]}>
            {data.length === 0
              ? 'No data for this timeframe'
              : 'Need more sessions to show trend'}
          </Text>
        </View>
      )}

      {/* Stats summary */}
      {data.length > 1 && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: c.muted }]}>Start</Text>
            <Text style={[styles.statValue, { color: c.text }]}>
              {Math.round(data[0].e1rmKg)} kg
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: c.muted }]}>Current</Text>
            <Text style={[styles.statValue, { color: c.text }]}>
              {Math.round(data[data.length - 1].e1rmKg)} kg
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: c.muted }]}>Change</Text>
            <Text
              style={[
                styles.statValue,
                {
                  color:
                    data[data.length - 1].e1rmKg >= data[0].e1rmKg
                      ? '#4ECDC4'
                      : '#FF6B6B',
                },
              ]}
            >
              {data[data.length - 1].e1rmKg >= data[0].e1rmKg ? '+' : ''}
              {Math.round(data[data.length - 1].e1rmKg - data[0].e1rmKg)} kg
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: FR.space.x2,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: FR.space.x2,
  },
  timeframeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  timeframeLabel: {
    fontSize: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  lineSegment: {
    height: 2,
    borderRadius: 1,
  },
  dataPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  yAxisLabels: {
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  axisLabel: {
    fontSize: 10,
  },
  emptyChart: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: FR.space.x2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
