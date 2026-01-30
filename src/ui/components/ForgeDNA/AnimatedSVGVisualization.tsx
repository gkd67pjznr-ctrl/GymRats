import * as React from "react";
import { View, Text, StyleSheet, Animated, Easing, Pressable } from "react-native";
import { Svg, Circle, Path, G, Text as SvgText } from "react-native-svg";
import { makeDesignSystem } from "../../../ui/designSystem";
import { useThemeColors } from "../../../ui/theme";
import type { ForgeDNA } from "../../../lib/forgeDNA/types";
import type { MuscleGroup } from "../../../data/exerciseTypes";

interface AnimatedSVGVisualizationProps {
  dna: ForgeDNA;
  onMusclePress?: (muscle: MuscleGroup) => void;
}

export function AnimatedSVGVisualization({ dna, onMusclePress }: AnimatedSVGVisualizationProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const rotationAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Animate in the visualization
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1.5),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  // Calculate points for muscle groups
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

  // Animated transforms
  const scale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const opacity = opacityAnim;

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.text }]}>Animated Training Identity</Text>

      {/* Animated Main Radar Chart */}
      <Animated.View
        style={[
          styles.chartContainer,
          {
            transform: [{ scale }, { rotate: rotation }],
            opacity: opacity,
          },
        ]}
      >
        <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background grid circles with animation */}
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

          {/* Animated radar chart fill */}
          <Path
            d={radarPath}
            fill={`${ds.tone.accent}40`}
            stroke={ds.tone.accent}
            strokeWidth="3"
          />

          {/* Animated muscle group points with pulse effect */}
          {points.map((point, i) => (
            <G key={i}>
              <AnimatedCircle
                cx={point.x}
                cy={point.y}
                r="8"
                fill={ds.tone.accent}
                onPress={() => onMusclePress?.(point.muscle as MuscleGroup)}
                delay={i * 50}
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

          {/* Center point with pulse animation */}
          <PulsingCircle
            cx={center}
            cy={center}
            r="10"
            fill={ds.tone.accent}
          />

          {/* Training style indicators with animation */}
          <AnimatedCircle
            cx={center}
            cy={center - 60}
            r={strengthRadius}
            fill={`${ds.tone.danger}80`}
            delay={200}
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

          <AnimatedCircle
            cx={center + 60}
            cy={center}
            r={volumeRadius}
            fill={`${ds.tone.success}80`}
            delay={400}
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

          <AnimatedCircle
            cx={center - 60}
            cy={center}
            r={enduranceRadius}
            fill={`${ds.tone.accent}80`}
            delay={600}
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
      </Animated.View>

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

      {/* Interactive Controls */}
      <View style={styles.controls}>
        <Pressable
          style={[styles.controlButton, { backgroundColor: ds.tone.accent }]}
          onPress={() => {
            // Reset animations
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);
            rotationAnim.setValue(0);

            Animated.parallel([
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.elastic(1.5),
                useNativeDriver: true,
              }),
              Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(rotationAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
              }),
            ]).start();
          }}
        >
          <Text style={[styles.controlButtonText, { color: c.bg }]}>Replay Animation</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Animated Circle Component
const AnimatedCircle = ({ cx, cy, r, fill, onPress, delay = 0 }: any) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1.5),
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const scale = scaleAnim;

  return (
    <AnimatedCircleComponent
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      onPress={onPress}
      scale={scale}
    />
  );
};

// Pulsing Circle Component
const PulsingCircle = ({ cx, cy, r, fill }: any) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scale = pulseAnim;

  return (
    <AnimatedCircleComponent
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      scale={scale}
    />
  );
};

// Reusable Animated Circle Component
const AnimatedCircleComponent = ({ cx, cy, r, fill, onPress, scale }: any) => {
  const animatedScale = scale || new Animated.Value(1);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        transform: [{ scale: animatedScale }],
      }}
    >
      <Circle
        cx={r}
        cy={r}
        r={r}
        fill={fill}
        onPress={onPress}
      />
    </Animated.View>
  );
};

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
  controls: {
    flexDirection: "row",
    gap: 12,
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});