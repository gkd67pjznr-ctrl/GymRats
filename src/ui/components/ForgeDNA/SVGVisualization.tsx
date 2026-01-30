import * as React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Svg, Circle, Path, Line, G, Text as SvgText } from "react-native-svg";
import { makeDesignSystem } from "../../../ui/designSystem";
import { useThemeColors } from "../../../ui/theme";
import type { ForgeDNA } from "../../../lib/forgeDNA/types";
import type { MuscleGroup } from "../../../data/exerciseTypes";

interface SVGVisualizationProps {
  dna: ForgeDNA;
  onMusclePress?: (muscle: MuscleGroup) => void;
}

export function SVGVisualization({ dna, onMusclePress }: SVGVisualizationProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  // SVG dimensions
  const size = 300;
  const center = size / 2;
  const radius = 100;

  // Generate points for the radar chart
  const muscleGroups: MuscleGroup[] = [
    'chest', 'shoulders', 'triceps',
    'lats', 'middle back', 'traps',
    'biceps', 'forearms',
    'quadriceps', 'hamstrings', 'glutes',
    'calves', 'abdominals'
  ];

  // Calculate points for muscle groups (simplified version)
  const points = muscleGroups.map((muscle, index) => {
    const angle = (index * 2 * Math.PI) / muscleGroups.length - Math.PI / 2;
    const value = (dna.muscleBalance[muscle] || 0) / 100;
    const distance = radius * value;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y, muscle, value };
  });

  // Create path for the radar chart
  const radarPath = points.map((point, i) => {
    return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }).join(' ') + ' Z';

  // Calculate training style distribution
  const { strength, volume, endurance } = dna.trainingStyle;
  const maxStyle = Math.max(strength, volume, endurance);
  const strengthRadius = (strength / maxStyle) * 30;
  const volumeRadius = (volume / maxStyle) * 30;
  const enduranceRadius = (endurance / maxStyle) * 30;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.text }]}>Training Identity</Text>

      {/* Main Radar Chart */}
      <View style={styles.chartContainer}>
        <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background grid circles */}
          {[0.25, 0.5, 0.75, 1].map((scale, i) => (
            <Circle
              key={i}
              cx={center}
              cy={center}
              r={radius * scale}
              fill="none"
              stroke={c.border}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}

          {/* Radar chart fill */}
          <Path
            d={radarPath}
            fill={`${ds.tone.accent}40`}
            stroke={ds.tone.accent}
            strokeWidth="2"
          />

          {/* Muscle group points */}
          {points.map((point, i) => (
            <G key={i}>
              <Circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill={ds.tone.accent}
                onPress={() => onMusclePress?.(point.muscle as MuscleGroup)}
              />
              <SvgText
                x={point.x}
                y={point.y - 15}
                fontSize="10"
                textAnchor="middle"
                fill={c.text}
              >
                {point.muscle.split(' ')[0]}
              </SvgText>
            </G>
          ))}

          {/* Center point */}
          <Circle
            cx={center}
            cy={center}
            r="8"
            fill={ds.tone.accent}
          />

          {/* Training style indicators */}
          {/* Strength (top) */}
          <Circle
            cx={center}
            cy={center - 60}
            r={strengthRadius}
            fill={`${ds.tone.danger}80`}
          />
          <SvgText
            x={center}
            y={center - 60 - strengthRadius - 5}
            fontSize="10"
            textAnchor="middle"
            fill={c.text}
          >
            S
          </SvgText>

          {/* Volume (right) */}
          <Circle
            cx={center + 60}
            cy={center}
            r={volumeRadius}
            fill={`${ds.tone.success}80`}
          />
          <SvgText
            x={center + 60}
            y={center - volumeRadius - 5}
            fontSize="10"
            textAnchor="middle"
            fill={c.text}
          >
            V
          </SvgText>

          {/* Endurance (left) */}
          <Circle
            cx={center - 60}
            cy={center}
            r={enduranceRadius}
            fill={`${ds.tone.accent}80`}
          />
          <SvgText
            x={center - 60}
            y={center - enduranceRadius - 5}
            fontSize="10"
            textAnchor="middle"
            fill={c.text}
          >
            E
          </SvgText>
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: ds.tone.danger }]} />
          <Text style={[styles.legendText, { color: c.text }]}>Strength</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: ds.tone.success }]} />
          <Text style={[styles.legendText, { color: c.text }]}>Volume</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: ds.tone.accent }]} />
          <Text style={[styles.legendText, { color: c.text }]}>Endurance</Text>
        </View>
      </View>

      {/* Interactive Info Panel */}
      <View style={[styles.infoPanel, { backgroundColor: `${ds.tone.accent}20`, borderColor: ds.tone.accent }]}>
        <Text style={[styles.infoTitle, { color: c.text }]}>Interactive Visualization</Text>
        <Text style={[styles.infoText, { color: c.muted }]}>
          Tap on muscle points to see detailed information
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
  },
  chartContainer: {
    marginBottom: 20,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoPanel: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
  },
});