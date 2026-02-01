/**
 * Victory Bar Chart Component - Wrapper for victory-native bar charts
 */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native';
import { makeDesignSystem } from '@/src/ui/designSystem';

type DataPoint = {
  x: string | number;
  y: number;
  label?: string;
};

type VictoryBarChartProps = {
  data: DataPoint[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  width?: number;
  theme?: 'dark' | 'light';
  accentColor?: string;
  barWidth?: number;
};

const VictoryBarChart: React.FC<VictoryBarChartProps> = ({
  data,
  title,
  xLabel,
  yLabel,
  height = 250,
  width = Dimensions.get('window').width - 40,
  theme = 'dark',
  accentColor,
  barWidth = 20,
}) => {
  const ds = makeDesignSystem(theme, 'toxic');
  const chartAccentColor = accentColor || ds.tone.accent;

  // Sort data by x value if numbers, otherwise keep order
  const sortedData = [...data].sort((a, b) => {
    if (typeof a.x === 'number' && typeof b.x === 'number') {
      return a.x - b.x;
    }
    if (typeof a.x === 'string' && typeof b.x === 'string') {
      return a.x.localeCompare(b.x);
    }
    return 0;
  });

  // Calculate min and max for better domain
  const yValues = sortedData.map(d => d.y);
  const yMin = Math.min(0, ...yValues); // Start from 0 for bar charts
  const yMax = Math.max(...yValues);
  const yPadding = (yMax - yMin) * 0.1;

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
              angle: -45,
              textAnchor: 'end',
            },
            grid: {
              stroke: 'rgba(255,255,255,0.1)',
              strokeDasharray: '4,4',
            }
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

        {/* Bars */}
        <VictoryBar
          data={sortedData}
          barWidth={barWidth}
          style={{
            data: {
              fill: chartAccentColor,
              stroke: ds.tone.bg,
              strokeWidth: 1,
            }
          }}
          labels={({ datum }) => datum.y.toFixed(0)}
          labelComponent={
            <VictoryAxis
              style={{
                tickLabels: {
                  fontSize: 9,
                  fill: ds.tone.textSecondary,
                }
              }}
            />
          }
        />
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

export default VictoryBarChart;