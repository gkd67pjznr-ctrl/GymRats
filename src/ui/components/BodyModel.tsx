import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { View, useColorScheme } from 'react-native';
import { getMuscleGroups } from '@/src/data/muscleGroupsManager';
import { makeDesignSystem, alpha } from '@/src/ui/designSystem';
import { useSettings } from '@/src/lib/stores/settingsStore';
import type { MuscleGroup as StandardMuscleGroup } from '@/src/data/exerciseTypes';

const MUSCLE_GROUPS = getMuscleGroups();

interface BodyModelProps {
  muscleVolumes: Record<string, number>; // Muscle ID -> Volume (0-1)
  side: 'front' | 'back';
}

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

const useDesignSystem = () => {
  const { accent } = useSettings();
  const colorScheme = useColorScheme();
  return makeDesignSystem(colorScheme === 'dark' ? 'dark' : 'light', accent);
};

export function BodyModel({ muscleVolumes, side }: BodyModelProps) {
  const ds = useDesignSystem();

  // Convert standard muscle group volumes to detailed muscle group volumes
  const getDetailedMuscleVolumes = () => {
    const detailedVolumes: Record<string, number> = {};

    // Map standard muscle groups to detailed ones
    for (const [standardMuscle, volume] of Object.entries(muscleVolumes)) {
      const detailedMuscles = STANDARD_TO_DETAILED_MAPPING[standardMuscle as StandardMuscleGroup];
      if (detailedMuscles) {
        // Distribute volume equally among detailed muscles
        const volumePerMuscle = volume / detailedMuscles.length;
        detailedMuscles.forEach(muscle => {
          detailedVolumes[muscle] = (detailedVolumes[muscle] || 0) + volumePerMuscle;
        });
      }
    }

    return detailedVolumes;
  };

  const detailedVolumes = getDetailedMuscleVolumes();

  const getMuscleColor = (muscleId: string) => {
    const volume = detailedVolumes[muscleId] || 0;
    if (volume === 0) {
      return ds.tone.card2;
    }
    return alpha(ds.tone.accent, volume);
  };

  return (
    <View style={{ aspectRatio: 1, width: '100%' }}>
      <Svg viewBox="0 0 200 400">
        {MUSCLE_GROUPS.filter((m) => m.side === side).map((muscle) => (
          <Path
            key={muscle.id}
            d={muscle.svgPath}
            fill={getMuscleColor(muscle.id)}
            stroke={ds.tone.border}
            strokeWidth="0.5"
          />
        ))}
      </Svg>
    </View>
  );
}
