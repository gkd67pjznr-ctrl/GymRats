/**
 * Victory Line Chart Component - Wrapper for victory-native line charts
 * Enhanced with PR markers, trend lines, and interactive tooltips
 */
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, Modal, Pressable } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryScatter, VictoryVoronoiContainer } from 'victory-native';
import { makeDesignSystem } from '@/src/ui/designSystem';

type DataPoint = {
  x: number | string;
  y: number;
  date?: string;
  isPR?: boolean;
  label?: string;
};

type TrendLineData = {
  x: number | string;
  y: number;
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
  showPRMarkers?: boolean;
  trendLineData?: TrendLineData[];
  trendLineColor?: string;
  enableTooltips?: boolean;
  formatTooltip?: (point: DataPoint) => string;
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
  showPRMarkers = false,
  trendLineData,
  trendLineColor,
  enableTooltips = false,
  formatTooltip,
}) => {
  const ds = makeDesignSystem(theme, 'toxic');
  const chartAccentColor = accentColor || ds.tone.accent;
  const [tooltipData, setTooltipData] = useState<DataPoint | null>(null);

  // Ensure data is sorted by x value
  const sortedData = [...data].sort((a, b) => {
    const aVal = typeof a.x === 'string' ? new Date(a.x).getTime() : a.x;
    const bVal = typeof b.x === 'string' ? new Date(b.x).getTime() : b.x;
    return aVal - bVal;
  });

  // Separate PR points for special markers
  const prPoints = showPRMarkers ? sortedData.filter(d => d.isPR) : [];
  const regularPoints = showPRMarkers ? sortedData.filter(d => !d.isPR) : sortedData;

  // Calculate min and max for better domain
  const yValues = sortedData.map(d => d.y);
  const trendYValues = trendLineData?.map(d => d.y) || [];
  const allYValues = [...yValues, ...trendYValues];
  const yMin = Math.min(...allYValues);
  const yMax = Math.max(...allYValues);
  const yPadding = (yMax - yMin) * 0.1; // 10% padding

  const handleActivated = useCallback((points: any[]) => {
    if (enableTooltips && points.length > 0) {
      const point = points[0];
      setTooltipData({
        x: point.x,
        y: point.y,
        date: point.date || point.x,
        isPR: point.isPR,
      });
    }
  }, [enableTooltips]);

  const closeTooltip = useCallback(() => {
    setTooltipData(null);
  }, []);

  const defaultFormatTooltip = (point: DataPoint): string => {
    const dateStr = typeof point.x === 'string' && point.x.includes('-')
      ? new Date(point.x).toLocaleDateString()
      : String(point.x);
    return `${dateStr}\nValue: ${point.y.toFixed(1)}${point.isPR ? '\n🏆 PR!' : ''}`;
  };

  return (
    <View style={styles.container}>
      <VictoryChart
        width={width}
        height={height}
        theme={VictoryTheme.grayscale}
        padding={{ top: 40, bottom: 60, left: 60, right: 40 }}
        domain={{ y: [yMin - yPadding, yMax + yPadding] }}
        containerComponent={
          enableTooltips ? (
            <VictoryVoronoiContainer
              onActivated={handleActivated}
              voronoiDimension="x"
            />
          ) : undefined
        }
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

        {/* Trend Line (if provided) */}
        {trendLineData && trendLineData.length > 0 && (
          <VictoryLine
            data={trendLineData}
            style={{
              data: {
                stroke: trendLineColor || 'rgba(255,255,255,0.4)',
                strokeWidth: 2,
                strokeDasharray: '6,4',
              }
            }}
            interpolation="natural"
          />
        )}

        {/* Main Line */}
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

        {/* Regular data points */}
        {showDots && (
          <VictoryScatter
            data={showPRMarkers ? regularPoints : sortedData}
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

        {/* PR markers - larger gold stars */}
        {showPRMarkers && prPoints.length > 0 && (
          <VictoryScatter
            data={prPoints}
            size={8}
            symbol="star"
            style={{
              data: {
                fill: '#FFD700',
                stroke: '#FFA500',
                strokeWidth: 2,
              }
            }}
          />
        )}
      </VictoryChart>

      {/* Tooltip Modal */}
      {enableTooltips && tooltipData && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={closeTooltip}
        >
          <Pressable style={styles.tooltipOverlay} onPress={closeTooltip}>
            <View style={[styles.tooltipContainer, { backgroundColor: ds.tone.card }]}>
              <Text style={[styles.tooltipText, { color: ds.tone.text }]}>
                {formatTooltip ? formatTooltip(tooltipData) : defaultFormatTooltip(tooltipData)}
              </Text>
              {tooltipData.isPR && (
                <View style={[styles.prBadge, { backgroundColor: '#FFD700' }]}>
                  <Text style={styles.prBadgeText}>PR!</Text>
                </View>
              )}
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    padding: 16,
    borderRadius: 12,
    minWidth: 150,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  prBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prBadgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default VictoryLineChart;
