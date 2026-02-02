/**
 * Victory Line Chart Component - Wrapper for victory-native line charts
 */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryScatter } from 'victory-native';
import { makeDesignSystem } from '@/src/ui/designSystem';

type DataPoint = {
  x: number | string;
  y: number;
  date?: string;
};

type VictoryLineChartProps = {
  data: DataPoint[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  width?: number;
  theme?: 'dark' | 'light';
  accentColor?: string;
  showDots?: boolean;
};

const VictoryLineChart: React.FC<VictoryLineChartProps> = ({
  data,
  title,
  xLabel,
  yLabel,
  height = 250,
  width = Dimensions.get('window').width - 40,
  theme = 'dark',
  accentColor,
  showDots = true,
}) => {
  const ds = makeDesignSystem(theme, 'toxic');
  const chartAccentColor = accentColor || ds.tone.accent;

  // Ensure data is sorted by x value
  const sortedData = [...data].sort((a, b) => {
    const aVal = typeof a.x === 'string' ? parseFloat(a.x) : a.x;
    const bVal = typeof b.x === 'string' ? parseFloat(b.x) : b.x;
    return aVal - bVal;
  });

  // Calculate min and max for better domain
  const yValues = sortedData.map(d => d.y);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const yPadding = (yMax - yMin) * 0.1; // 10% padding

  return (
    <View style={styles.container}>
      <VictoryChart
        width={width}
        height={height}
        theme={VictoryTheme.grayscale}
        padding={{ top: 40, bottom: 60, left: 60, right: 40 }}
        domain={{ y: [yMin - yPadding, yMax + yPadding] }}
      >
        {/* X Axis */}
        <VictoryAxis
          label={xLabel}
          style={{
            axis: { stroke: ds.tone.textSecondary },
            axisLabel: {
              fontSize: 12,
              padding: 30,
              fill: ds.tone.text,
            },
            tickLabels: {
              fontSize: 10,
              fill: ds.tone.textSecondary,
            },
            grid: {
              stroke: 'rgba(255,255,255,0.1)',
              strokeDasharray: '4,4',
            }
          }}
          tickFormat={(tick) => {
            if (typeof tick === 'string' && tick.includes('-')) {
              // Format date strings
              const parts = tick.split('-');
              if (parts.length >= 3) {
                return `${parts[1]}/${parts[2].slice(0, 2)}`;
              }
            }
            return tick;
          }}
        />

        {/* Y Axis */}
        <VictoryAxis
          dependentAxis
          label={yLabel}
          style={{
            axis: { stroke: ds.tone.textSecondary },
            axisLabel: {
              fontSize: 12,
              padding: 40,
              fill: ds.tone.text,
            },
            tickLabels: {
              fontSize: 10,
              fill: ds.tone.textSecondary,
            },
            grid: {
              stroke: 'rgba(255,255,255,0.1)',
              strokeDasharray: '4,4',
            }
          }}
        />

        {/* Line */}
        <VictoryLine
          data={sortedData}
          style={{
            data: {
              stroke: chartAccentColor,
              strokeWidth: 2,
            }
          }}
          interpolation="natural"
        />

        {/* Data points */}
        {showDots && (
          <VictoryScatter
            data={sortedData}
            size={4}
            style={{
              data: {
                fill: chartAccentColor,
                stroke: ds.tone.bg,
                strokeWidth: 1,
              }
            }}
          />
        )}
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VictoryLineChart;