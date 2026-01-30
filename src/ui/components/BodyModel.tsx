import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { View, useColorScheme } from 'react-native';
import { getMuscleGroups } from '@/src/data/muscleGroupsManager';
import { makeDesignSystem, alpha } from '@/src/ui/designSystem';
import { useSettings } from '@/src/lib/stores/settingsStore';

const MUSCLE_GROUPS = getMuscleGroups();

interface BodyModelProps {
  muscleVolumes: Record<string, number>; // Muscle ID -> Volume (0-1)
  side: 'front' | 'back';
}

const useDesignSystem = () => {
  const { accent } = useSettings();
  const colorScheme = useColorScheme();
  return makeDesignSystem(colorScheme === 'dark' ? 'dark' : 'light', accent);
};

export function BodyModel({ muscleVolumes, side }: BodyModelProps) {
  const ds = useDesignSystem();

  const getMuscleColor = (muscleId: string) => {
    const volume = muscleVolumes[muscleId] || 0;
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
