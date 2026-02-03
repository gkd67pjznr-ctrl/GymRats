/**
 * SelectedExerciseCard Component
 *
 * Displays the currently selected exercise for quick add in free workout mode.
 * Shows exercise name and "Change Selected" button.
 *
 * Extracted from live-workout.tsx to reduce component complexity.
 */

import { Pressable, Text, View } from "react-native";
import { makeDesignSystem } from "@/src/ui/designSystem";
import { FR } from "@/src/ui/GrStyle";
import { useThemeColors } from "@/src/ui/theme";
import { EXERCISES_V1 } from "@/src/data/exercises";

export interface SelectedExerciseCardProps {
  selectedExerciseId: string;
  onChangeSelected: () => void;
}

export function SelectedExerciseCard({
  selectedExerciseId,
  onChangeSelected,
}: SelectedExerciseCardProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");
  const CARD_R = FR.radius.card;
  const PILL_R = FR.radius.pill;

  const exerciseName = EXERCISES_V1.find((e) => e.id === selectedExerciseId)?.name ?? selectedExerciseId;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: CARD_R,
        padding: FR.space.x4,
        backgroundColor: c.card,
        gap: FR.space.x2,
      }}
    >
      <Text style={{ color: c.muted, ...FR.type.sub }}>Selected Exercise (Quick Add)</Text>
      <Text style={{ color: c.text, ...FR.type.h2 }}>{exerciseName}</Text>

      <Pressable
        onPress={onChangeSelected}
        style={({ pressed }) => ({
          paddingVertical: FR.space.x3,
          paddingHorizontal: FR.space.x4,
          borderRadius: PILL_R,
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.bg,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? ds.rules.tapOpacity : 1,
        })}
      >
        <Text style={{ color: c.text, ...FR.type.h3 }}>Change Selected</Text>
      </Pressable>
    </View>
  );
}
