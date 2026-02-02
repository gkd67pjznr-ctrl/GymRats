/**
 * WorkoutActions Component
 *
 * Bottom actions for the live workout - Hevy/Liftoff style.
 * Clean two-button layout: Cancel (outlined) + Finish (accent).
 */

import { Pressable, Text, View, StyleSheet } from "react-native";
import { useThemeColors } from "@/src/ui/theme";

export interface WorkoutActionsProps {
  setsCount: number;
  onFinishWorkout: () => void;
  onSaveRoutine: () => void;
  onReset: () => void;
}

export function WorkoutActions({
  setsCount,
  onFinishWorkout,
  onSaveRoutine,
  onReset,
}: WorkoutActionsProps) {
  const c = useThemeColors();
  const hasSets = setsCount > 0;

  return (
    <View style={styles.container}>
      {/* Finish Workout - primary */}
      <Pressable
        onPress={onFinishWorkout}
        style={({ pressed }) => [
          styles.finishButton,
          {
            backgroundColor: c.primary,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text style={[styles.finishText, { color: c.bg }]}>
          Finish Workout
        </Text>
      </Pressable>

      {/* Secondary row */}
      <View style={styles.secondaryRow}>
        {hasSets && (
          <Pressable
            onPress={onSaveRoutine}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                borderColor: c.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryText, { color: c.muted }]}>
              Save as Routine
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={onReset}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              borderColor: c.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[styles.secondaryText, { color: c.danger }]}>
            Discard Workout
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 8,
  },
  finishButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  finishText: {
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
