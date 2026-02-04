// src/ui/components/BodyModel/CompactBodyModel.tsx
// Compact body model visualization for social posts

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useThemeColors } from '../../theme';
import { getMuscleGroups } from '@/src/data/muscleGroupsManager';
import type { MuscleGroup as StandardMuscleGroup } from '@/src/data/exerciseTypes';
import { alpha } from '../../designSystem';

const MUSCLE_GROUPS = getMuscleGroups();

// Mapping from standard muscle groups to detailed muscle groups
const STANDARD_TO_DETAILED_MAPPING: Record<StandardMuscleGroup, string[]> = {
  'abdominals': ['upper_abs', 'lower_abs', 'obliques'],
  'abductors': ['abductors'],
  'adductors': ['adductors'],
  'biceps': ['biceps'],
  'calves': ['calves'],
  'chest': ['upper_chest', 'lower_chest'],
  'forearms': ['forearms'],
  'glutes': ['glutes'],
  'hamstrings': ['hamstrings'],
  'lats': ['lats'],
  'lower back': ['lower_back'],
  'middle back': ['mid_back'],
  'neck': [],
  'quadriceps': ['quads'],
  'shoulders': ['front_delt', 'side_delt', 'rear_delt', 'traps'],
  'traps': ['traps'],
  'triceps': ['triceps'],
};

interface CompactBodyModelProps {
  /** Muscle intensities (0-1) by muscle group ID */
  muscleIntensities: Record<string, number>;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show both front and back */
  showBothSides?: boolean;
  /** Accent color for highlights */
  accentColor?: string;
  /** Background color */
  backgroundColor?: string;
}

export function CompactBodyModel({
  muscleIntensities,
  size = 'medium',
  showBothSides = true,
  accentColor,
  backgroundColor,
}: CompactBodyModelProps) {
  const c = useThemeColors();
  const accent = accentColor || c.primary;
  const bg = backgroundColor || c.card;

  // Convert standard muscle group intensities to detailed
  const getDetailedIntensities = () => {
    const detailed: Record<string, number> = {};

    for (const [standardMuscle, intensity] of Object.entries(muscleIntensities)) {
      const detailedMuscles = STANDARD_TO_DETAILED_MAPPING[standardMuscle as StandardMuscleGroup];
      if (detailedMuscles) {
        detailedMuscles.forEach(muscle => {
          detailed[muscle] = Math.max(detailed[muscle] || 0, intensity);
        });
      }
    }

    return detailed;
  };

  const detailedIntensities = getDetailedIntensities();

  const getMuscleColor = (muscleId: string) => {
    const intensity = detailedIntensities[muscleId] || 0;
    if (intensity === 0) {
      return alpha(c.text, 0.1);
    }
    return alpha(accent, 0.3 + (intensity * 0.7));
  };

  const dimensions = {
    small: { width: 60, height: 120, viewBox: '0 0 200 400' },
    medium: { width: 80, height: 160, viewBox: '0 0 200 400' },
    large: { width: 120, height: 240, viewBox: '0 0 200 400' },
  };

  const { width, height, viewBox } = dimensions[size];

  const renderSide = (side: 'front' | 'back') => (
    <Svg width={width} height={height} viewBox={viewBox}>
      {MUSCLE_GROUPS.filter(m => m.side === side).map(muscle => (
        <Path
          key={muscle.id}
          d={muscle.svgPath}
          fill={getMuscleColor(muscle.id)}
          stroke={alpha(c.text, 0.2)}
          strokeWidth="0.3"
        />
      ))}
    </Svg>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.bodyContainer}>
        {renderSide('front')}
        {showBothSides && (
          <>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            {renderSide('back')}
          </>
        )}
      </View>
    </View>
  );
}

/**
 * Compact body model with workout stats overlay
 */
interface CompactBodyWithStatsProps extends CompactBodyModelProps {
  /** Total volume formatted */
  totalVolume?: string;
  /** Primary muscles worked */
  primaryMuscles?: string[];
  /** Exercise count */
  exerciseCount?: number;
  /** Duration in minutes */
  durationMin?: number;
}

export function CompactBodyWithStats({
  muscleIntensities,
  totalVolume,
  primaryMuscles,
  exerciseCount,
  durationMin,
  size = 'medium',
  accentColor,
  backgroundColor,
}: CompactBodyWithStatsProps) {
  const c = useThemeColors();
  const accent = accentColor || c.primary;
  const bg = backgroundColor || c.card;

  return (
    <View style={[styles.statsContainer, { backgroundColor: bg }]}>
      <CompactBodyModel
        muscleIntensities={muscleIntensities}
        size={size}
        showBothSides={true}
        accentColor={accent}
        backgroundColor="transparent"
      />

      {/* Stats overlay */}
      <View style={styles.statsOverlay}>
        {totalVolume && (
          <View style={styles.statRow}>
            <Text style={[styles.statValue, { color: accent }]}>{totalVolume}</Text>
            <Text style={[styles.statLabel, { color: c.muted }]}>volume</Text>
          </View>
        )}

        {exerciseCount !== undefined && (
          <View style={styles.statRow}>
            <Text style={[styles.statValue, { color: accent }]}>{exerciseCount}</Text>
            <Text style={[styles.statLabel, { color: c.muted }]}>exercises</Text>
          </View>
        )}

        {durationMin !== undefined && (
          <View style={styles.statRow}>
            <Text style={[styles.statValue, { color: accent }]}>{durationMin}m</Text>
            <Text style={[styles.statLabel, { color: c.muted }]}>duration</Text>
          </View>
        )}
      </View>

      {/* Primary muscles list */}
      {primaryMuscles && primaryMuscles.length > 0 && (
        <View style={styles.musclesList}>
          <Text style={[styles.musclesLabel, { color: c.muted }]}>Trained:</Text>
          <Text style={[styles.musclesText, { color: c.text }]}>
            {primaryMuscles.join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  bodyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '80%',
    marginHorizontal: 8,
  },
  statsContainer: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  statsOverlay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  statRow: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  musclesList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  musclesLabel: {
    fontSize: 11,
  },
  musclesText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default CompactBodyModel;
