// src/lib/bodyModel/bodyModel.tsx
// Body model component with muscle coloring based on workout volume

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import type { MuscleId } from './muscleGroups';

/**
 * Muscle volume data
 *
 * Maps muscle IDs to their workout volume (for coloring intensity).
 */
export interface MuscleVolumeData {
  [muscleId: string]: number;
}

/**
 * Props for BodyModel component
 */
export interface BodyModelProps {
  /** Muscle volume data for coloring intensity */
  volumeData?: MuscleVolumeData;
  /** Base color theme (light or dark) */
  theme?: 'light' | 'dark';
  /** Size of the body model */
  size?: number;
  /** Whether to show detailed view (all muscles) or simplified */
  detailed?: boolean;
  /** Opacity of the body model */
  opacity?: number;
}

/**
 * Get color intensity for a muscle based on volume
 *
 * Returns a color from cold (blue) to hot (red) based on
 * relative volume compared to other muscles.
 */
function getMuscleColor(
  muscleId: MuscleId,
  volumeData: MuscleVolumeData,
  theme: 'light' | 'dark'
): string {
  const volume = volumeData[muscleId] || 0;

  // Find max volume for normalization
  const volumes = Object.values(volumeData);
  const maxVolume = Math.max(...volumes, 1);

  // Normalize volume to 0-1 range
  const intensity = maxVolume > 0 ? volume / maxVolume : 0;

  // Color stops from cold to hot
  // 0.0 - 0.2: Blue (cold)
  // 0.2 - 0.4: Cyan
  // 0.4 - 0.6: Yellow
  // 0.6 - 0.8: Orange
  // 0.8 - 1.0: Red (hot)

  if (intensity < 0.2) {
    return theme === 'dark' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.4)'; // Blue
  } else if (intensity < 0.4) {
    return theme === 'dark' ? 'rgba(34, 211, 238, 0.7)' : 'rgba(34, 211, 238, 0.5)'; // Cyan
  } else if (intensity < 0.6) {
    return theme === 'dark' ? 'rgba(250, 204, 21, 0.75)' : 'rgba(250, 204, 21, 0.55)'; // Yellow
  } else if (intensity < 0.8) {
    return theme === 'dark' ? 'rgba(249, 115, 22, 0.8)' : 'rgba(249, 115, 22, 0.6)'; // Orange
  } else {
    return theme === 'dark' ? 'rgba(239, 68, 68, 0.85)' : 'rgba(239, 68, 68, 0.65)'; // Red
  }
}

/**
 * Body Model Component
 *
 * Renders a stylized human figure with muscle groups that can be
 * colored based on workout volume data.
 *
 * The body model is rendered as an SVG with separate paths for each
 * muscle group, allowing individual coloring.
 */
export function BodyModel({
  volumeData = {},
  theme = 'dark',
  size = 200,
  detailed = false,
  opacity = 1,
}: BodyModelProps) {
  const width = size;
  const height = size * 1.8; // Body is taller than wide

  // Base outline color
  const outlineColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
  const defaultMuscleColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 100 180">
        {/* Background silhouette */}
        <Path
          d="M50 5 C45 5 42 8 42 12 C42 15 44 17 46 18 L46 25 C40 27 35 32 33 38 L25 42 C22 43 20 46 20 50 L20 55 C20 57 21 58 23 58 L25 58 L25 85 L20 90 C18 92 18 95 20 95 L35 95 L35 140 C35 145 38 150 43 150 L43 165 C43 168 45 170 50 170 C55 170 57 168 57 165 L57 150 C62 150 65 145 65 140 L65 95 L80 95 C82 95 82 92 80 90 L75 85 L75 58 L77 58 C79 58 80 57 80 55 L80 50 C80 46 78 43 75 42 L67 38 C65 32 60 27 54 25 L54 18 C56 17 58 15 58 12 C58 8 55 5 50 5 Z"
          fill={outlineColor}
          stroke="none"
          opacity={opacity}
        />

        {detailed && (
          <>
            {/* Head */}
            <Circle cx="50" cy="12" r="8" fill={defaultMuscleColor} stroke={outlineColor} strokeWidth="0.5" />

            {/* Neck */}
            <Path
              d="M46 18 L54 18 L54 25 L46 25 Z"
              fill={getMuscleColor('traps', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Traps */}
            <Path
              d="M46 25 L40 30 L46 30 Z M54 25 L60 30 L54 30 Z"
              fill={getMuscleColor('traps', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Front Delts */}
            <Path
              d="M40 30 L35 38 L42 40 Z"
              fill={getMuscleColor('front_delt', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />
            <Path
              d="M60 30 L65 38 L58 40 Z"
              fill={getMuscleColor('front_delt', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Side Delts */}
            <Path
              d="M35 38 L32 45 L38 45 Z"
              fill={getMuscleColor('side_delt', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />
            <Path
              d="M65 38 L68 45 L62 45 Z"
              fill={getMuscleColor('side_delt', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Upper Chest */}
            <Path
              d="M38 42 L50 38 L62 42 L62 48 L38 48 Z"
              fill={getMuscleColor('upper_chest', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Lower Chest */}
            <Path
              d="M38 48 L62 48 L58 55 L42 55 Z"
              fill={getMuscleColor('lower_chest', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Upper Abs */}
            <Path
              d="M42 55 L58 55 L56 62 L44 62 Z"
              fill={getMuscleColor('upper_abs', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Lower Abs */}
            <Path
              d="M44 62 L56 62 L54 70 L46 70 Z"
              fill={getMuscleColor('lower_abs', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Obliques */}
            <Path
              d="M42 55 L38 70 L44 70 Z M58 55 L62 70 L56 70 Z"
              fill={getMuscleColor('obliques', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Biceps */}
            <Path
              d="M32 45 L28 55 L32 60 L38 55 Z"
              fill={getMuscleColor('biceps', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />
            <Path
              d="M68 45 L72 55 L68 60 L62 55 Z"
              fill={getMuscleColor('biceps', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Forearms */}
            <Path
              d="M28 55 L25 70 L30 72 L32 60 Z"
              fill={getMuscleColor('forearms', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />
            <Path
              d="M72 55 L75 70 L70 72 L68 60 Z"
              fill={getMuscleColor('forearms', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Quads */}
            <Path
              d="M38 70 L35 95 L42 95 L42 75 Z"
              fill={getMuscleColor('quads', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />
            <Path
              d="M62 70 L65 95 L58 95 L58 75 Z"
              fill={getMuscleColor('quads', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Hamstrings */}
            <Path
              d="M42 75 L42 95 L40 110 L35 95 L35 75 Z"
              fill={getMuscleColor('hamstrings', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />
            <Path
              d="M58 75 L58 95 L60 110 L65 95 L65 75 Z"
              fill={getMuscleColor('hamstrings', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Calves */}
            <Path
              d="M38 110 L36 130 L42 130 L42 110 Z"
              fill={getMuscleColor('calves', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />
            <Path
              d="M62 110 L64 130 L58 130 L58 110 Z"
              fill={getMuscleColor('calves', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />

            {/* Glutes */}
            <Path
              d="M42 95 L50 100 L58 95 L58 105 L50 110 L42 105 Z"
              fill={getMuscleColor('glutes', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />
          </>
        )}

        {!detailed && (
          <>
            {/* Simplified body - major muscle groups only */}
            <Path
              d="M40 30 L60 30 L65 45 L60 55 L55 75 L58 95 L50 100 L42 95 L45 75 L40 55 L35 45 Z"
              fill={getMuscleColor('upper_chest', volumeData, theme) || getMuscleColor('quads', volumeData, theme) || defaultMuscleColor}
              stroke={outlineColor}
              strokeWidth="0.5"
              opacity={opacity}
            />
          </>
        )}
      </Svg>
    </View>
  );
}

/**
 * Calculate muscle volume from workout sets
 *
 * Aggregates muscle contributions from all sets in a workout.
 */
export function calculateMuscleVolume(
  sets: Array<{ exerciseId: string; weightKg: number; reps: number }>
): Record<string, number> {
  const volumeData: Record<string, number> = {};

  for (const set of sets) {
    const contributions = require('./muscleGroups').calculateMuscleContribution(
      set.exerciseId,
      set.weightKg,
      set.reps
    );

    for (const [muscle, volume] of Object.entries(contributions)) {
      volumeData[muscle] = (volumeData[muscle] || 0) + volume;
    }
  }

  return volumeData;
}

/**
 * Compact body model for post thumbnails
 *
 * Smaller, simplified version for use in feed posts when no photo is uploaded.
 */
export function CompactBodyModel({
  volumeData,
  theme = 'dark',
}: {
  volumeData?: MuscleVolumeData;
  theme?: 'light' | 'dark';
}) {
  return <BodyModel volumeData={volumeData} theme={theme} size={80} detailed={false} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
