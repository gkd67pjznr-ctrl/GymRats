/**
 * WorkoutControls Component
 *
 * Hevy/Liftoff style - prominent "+ Add Exercise" button with minimal secondary controls.
 */

import { Pressable, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  onAddExercise,
  onToggleFocus,
  onChangeSelected,
}: WorkoutControlsProps) {
  const c = useThemeColors();

  return (
    <View style={styles.container}>
      {/* Primary: Add Exercise button */}
      <Pressable
        onPress={onAddExercise}
        style={({ pressed }) => [
          styles.addButton,
          {
            backgroundColor: c.primary + "18",
            borderColor: c.primary + "40",
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Ionicons name="add" size={20} color={c.primary} />
        <Text style={[styles.addButtonText, { color: c.primary }]}>
          Add Exercise
        </Text>
      </Pressable>

      {/* Secondary controls row */}
      <View style={styles.secondaryRow}>
        <Pressable
          onPress={onChangeSelected}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              backgroundColor: c.card,
              borderColor: c.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons name="swap-horizontal" size={14} color={c.muted} />
          <Text style={[styles.secondaryText, { color: c.muted }]}>
            Switch
          </Text>
        </Pressable>

        <Pressable
          onPress={onToggleFocus}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              backgroundColor: focusMode ? c.primary + "18" : c.card,
              borderColor: focusMode ? c.primary + "40" : c.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons
            name="eye"
            size={14}
            color={focusMode ? c.primary : c.muted}
          />
          <Text
            style={[
              styles.secondaryText,
              { color: focusMode ? c.primary : c.muted },
            ]}
          >
            Focus
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
