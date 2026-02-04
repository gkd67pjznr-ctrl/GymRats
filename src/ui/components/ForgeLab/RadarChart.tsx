/**
 * Radar Chart Component - SVG-based spider/radar chart for muscle balance
 * Displays muscle group volume distribution in a radial format
 */
import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { makeDesignSystem } from '@/src/ui/designSystem';

type RadarDataPoint = {
  label: string;
  value: number;
  maxValue?: number;
};

type RadarChartProps = {
  data: RadarDataPoint[];
  size?: number;
  levels?: number;
  accentColor?: string;
  fillOpacity?: number;
  showLabels?: boolean;
  showValues?: boolean;
  comparisonData?: RadarDataPoint[]; // For period comparison
  comparisonColor?: string;
};

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 250,
  levels = 5,
  accentColor,
  fillOpacity = 0.3,
  showLabels = true,
  showValues = false,
  comparisonData,
  comparisonColor = 'rgba(255,255,255,0.4)',
}) => {
  const ds = makeDesignSystem('dark', 'toxic');
  const chartColor = accentColor || ds.tone.accent;

  const center = size / 2;
  const radius = (size / 2) - 40; // Leave room for labels

  // Calculate the max value across all data points
  const maxValue = useMemo(() => {
    const dataMax = Math.max(...data.map(d => d.maxValue || d.value));
    const compMax = comparisonData
      ? Math.max(...comparisonData.map(d => d.maxValue || d.value))
      : 0;
    return Math.max(dataMax, compMax, 1); // Avoid division by zero
  }, [data, comparisonData]);

  // Calculate angle for each data point
  const angleSlice = (2 * Math.PI) / data.length;

  // Convert data point to coordinates
  const getCoordinates = (value: number, index: number): { x: number; y: number } => {
    const normalizedValue = value / maxValue;
    const angle = angleSlice * index - Math.PI / 2; // Start from top
    return {
      x: center + radius * normalizedValue * Math.cos(angle),
      y: center + radius * normalizedValue * Math.sin(angle),
    };
  };

  // Generate polygon points for the data
  const dataPoints = useMemo(() => {
    return data.map((d, i) => getCoordinates(d.value, i));
  }, [data, maxValue, radius, center]);

  const dataPolygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Generate polygon points for comparison data if provided
  const comparisonPoints = useMemo(() => {
    if (!comparisonData) return null;
    return comparisonData.map((d, i) => getCoordinates(d.value, i));
  }, [comparisonData, maxValue, radius, center]);

  const comparisonPolygonPoints = comparisonPoints
    ? comparisonPoints.map(p => `${p.x},${p.y}`).join(' ')
    : null;

  // Generate grid levels
  const gridLevels = useMemo(() => {
    const result: { points: string; radius: number }[] = [];
    for (let level = 1; level <= levels; level++) {
      const levelRadius = (radius / levels) * level;
      const points = data.map((_, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        return {
          x: center + levelRadius * Math.cos(angle),
          y: center + levelRadius * Math.sin(angle),
        };
      });
      result.push({
        points: points.map(p => `${p.x},${p.y}`).join(' '),
        radius: levelRadius,
      });
    }
    return result;
  }, [data.length, radius, levels, center]);

  // Generate axis lines
  const axisLines = useMemo(() => {
    return data.map((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      return {
        x2: center + radius * Math.cos(angle),
        y2: center + radius * Math.sin(angle),
      };
    });
  }, [data.length, radius, center]);

  // Generate label positions
  const labelPositions = useMemo(() => {
    return data.map((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const labelRadius = radius + 25;
      return {
        x: center + labelRadius * Math.cos(angle),
        y: center + labelRadius * Math.sin(angle),
        label: d.label,
        value: d.value,
        anchor: angle > Math.PI / 2 && angle < (3 * Math.PI) / 2 ? 'end' : 'start',
      };
    });
  }, [data, radius, center]);

  // Format label for display
  const formatLabel = (label: string): string => {
    return label
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (data.length < 3) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={[styles.emptyText, { color: ds.tone.textSecondary }]}>
          Need at least 3 data points for radar chart
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Grid levels */}
        {gridLevels.map((level, i) => (
          <Polygon
            key={`grid-${i}`}
            points={level.points}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((line, i) => (
          <Line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
          />
        ))}

        {/* Comparison data polygon (if provided) */}
        {comparisonPolygonPoints && (
          <Polygon
            points={comparisonPolygonPoints}
            fill={comparisonColor}
            fillOpacity={fillOpacity * 0.5}
            stroke={comparisonColor}
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />
        )}

        {/* Main data polygon */}
        <Polygon
          points={dataPolygonPoints}
          fill={chartColor}
          fillOpacity={fillOpacity}
          stroke={chartColor}
          strokeWidth={2}
        />

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <Circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={chartColor}
            stroke={ds.tone.card}
            strokeWidth={2}
          />
        ))}

        {/* Labels */}
        {showLabels && labelPositions.map((pos, i) => (
          <G key={`label-${i}`}>
            <SvgText
              x={pos.x}
              y={pos.y}
              fill={ds.tone.text}
              fontSize={10}
              fontWeight="500"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {formatLabel(pos.label)}
            </SvgText>
            {showValues && (
              <SvgText
                x={pos.x}
                y={pos.y + 12}
                fill={ds.tone.textSecondary}
                fontSize={8}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {pos.value.toFixed(0)}
              </SvgText>
            )}
          </G>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default RadarChart;
