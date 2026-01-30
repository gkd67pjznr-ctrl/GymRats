/**
 * WorkoutControls Component
 *
 * Displays top control buttons for the live workout screen.
 * - + Exercise (free workout mode only)
 * - Focus toggle
 * - Pick (change selected exercise, free workout mode only)
 *
 * Extracted from live-workout.tsx to reduce component complexity.
 */

import { Pressable, Text, View } from "react-native";
import { makeDesignSystem } from "@/src/ui/designSystem";
import { FR } from "@/src/ui/forgerankStyle";
import { useThemeColors } from "@/src/ui/theme";

export interface WorkoutControlsProps {
  planMode: boolean;
  focusMode: boolean;
  liveWorkoutTogether?: boolean;
  onAddExercise: () => void;
  onToggleFocus: () => void;
  onChangeSelected: () => void;
  onToggleLiveWorkoutTogether?: () => void;
}

export function WorkoutControls({
  planMode,
  focusMode,
  liveWorkoutTogether,
  onAddExercise,
  onToggleFocus,
  onChangeSelected,
  onToggleLiveWorkoutTogether,
}: WorkoutControlsProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");
  const PILL_R = FR.radius.pill;

  const buttonStyle = (pressed: boolean, isActive = false) => ({
    paddingVertical: FR.space.x3,
    paddingHorizontal: FR.space.x4,
    borderRadius: PILL_R,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: isActive ? c.bg : c.card,
    alignItems: "center",
    justifyContent: "center",
    opacity: pressed ? ds.rules.tapOpacity : 1,
  });

  const primaryButtonStyle = (pressed: boolean) => ({
    flex: 1,
    paddingVertical: FR.space.x3,
    paddingHorizontal: FR.space.x4,
    borderRadius: PILL_R,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.card,
    alignItems: "center",
    justifyContent: "center",
    opacity: pressed ? ds.rules.tapOpacity : 1,
  });

  return (
    <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
      {/* + Exercise button - only in free workout mode */}
      {!planMode && (
        <Pressable
          onPress={onAddExercise}
          style={({ pressed }) => primaryButtonStyle(pressed)}
        >
          <Text style={{ color: c.text, ...FR.type.h3 }}>+ Exercise</Text>
        </Pressable>
      )}

      {/* Focus toggle */}
      <Pressable
        onPress={onToggleFocus}
        style={({ pressed }) => buttonStyle(pressed, focusMode)}
      >
        <Text style={{ color: c.text, ...FR.type.h3 }}>
          {focusMode ? "Focus ✓" : "Focus"}
        </Text>
      </Pressable>

      {/* Live Workout Together toggle */}
      {onToggleLiveWorkoutTogether && (
        <Pressable
          onPress={onToggleLiveWorkoutTogether}
          style={({ pressed }) => buttonStyle(pressed, liveWorkoutTogether)}
        >
          <Text style={{ color: c.text, ...FR.type.h3 }}>
            {liveWorkoutTogether ? "Friends ✓" : "Friends"}
          </Text>
        </Pressable>
      )}

      {/* Pick button - only in free workout mode */}
      {!planMode && (
        <Pressable
          onPress={onChangeSelected}
          style={({ pressed }) => buttonStyle(pressed)}
        >
          <Text style={{ color: c.text, ...FR.type.h3 }}>Pick</Text>
        </Pressable>
      )}
    </View>
  );
}
