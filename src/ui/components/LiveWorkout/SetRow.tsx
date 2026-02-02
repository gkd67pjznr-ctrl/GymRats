// src/ui/components/LiveWorkout/SetRow.tsx
// Tabular set row component - Hevy-style layout
// SET | PREV | LBS | REPS | ✓

import { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  Platform,
  StyleSheet,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { useThemeColors } from "../../theme";
import { FR } from "../../forgerankStyle";
import type { LoggedSet } from "../../../lib/loggerTypes";

export interface SetRowProps {
  set: LoggedSet;
  setNumber: number;
  /** Previous workout's data for this exercise at this set number */
  previousSet: { weightKg: number; reps: number } | null;
  isDone: boolean;
  onToggleDone: () => void;
  onWeightChange: (text: string) => void;
  onRepsChange: (text: string) => void;
  onDelete: () => void;
  kgToLb: (kg: number) => number;
}

// Column widths for consistent alignment
const COL = {
  SET: 36,
  PREV: 72,
  LBS: 64,
  REPS: 56,
  CHECK: 44,
};

export function SetRow({
  set,
  setNumber,
  previousSet,
  isDone,
  onToggleDone,
  onWeightChange,
  onRepsChange,
  onDelete,
  kgToLb,
}: SetRowProps) {
  const c = useThemeColors();
  const swipeableRef = useRef<Swipeable>(null);

  const weightLb = kgToLb(set.weightKg);
  const prevWeightLb = previousSet ? kgToLb(previousSet.weightKg) : null;
  const prevReps = previousSet?.reps ?? null;

  const triggerHaptic = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleToggleDone = () => {
    triggerHaptic();
    onToggleDone();
  };

  const handleDelete = () => {
    if (Platform.OS === "ios") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    swipeableRef.current?.close();
    onDelete();
  };

  // Render delete action on swipe right
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <Pressable
        onPress={handleDelete}
        style={{
          backgroundColor: c.danger,
          justifyContent: "center",
          alignItems: "center",
          width: 80,
          borderRadius: FR.radius.soft,
        }}
      >
        <Animated.Text
          style={{
            color: "#fff",
            fontWeight: "700",
            fontSize: 14,
            transform: [{ scale }],
          }}
        >
          Delete
        </Animated.Text>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
    >
      <View
        style={[
          styles.row,
          {
            backgroundColor: isDone ? c.bg : c.card,
            borderColor: c.border,
          },
        ]}
      >
        {/* SET number */}
        <View style={[styles.cell, { width: COL.SET }]}>
          <Text
            style={[
              FR.type.body,
              { color: c.muted, fontWeight: "700" },
            ]}
          >
            {setNumber}
          </Text>
        </View>

        {/* PREV - previous workout data */}
        <View style={[styles.cell, { width: COL.PREV }]}>
          {prevWeightLb !== null && prevReps !== null ? (
            <Text style={[FR.type.sub, { color: c.muted }]}>
              {Math.round(prevWeightLb)}×{prevReps}
            </Text>
          ) : (
            <Text style={[FR.type.sub, { color: c.border }]}>—</Text>
          )}
        </View>

        {/* LBS input */}
        <View style={[styles.cell, { width: COL.LBS }]}>
          {isDone ? (
            <Text style={[FR.type.body, { color: c.text, fontWeight: "700" }]}>
              {Math.round(weightLb)}
            </Text>
          ) : (
            <TextInput
              value={String(Math.round(weightLb))}
              onChangeText={onWeightChange}
              keyboardType="decimal-pad"
              selectTextOnFocus
              style={[
                styles.input,
                {
                  color: c.text,
                  backgroundColor: c.bg,
                  borderColor: c.border,
                },
              ]}
            />
          )}
        </View>

        {/* REPS input */}
        <View style={[styles.cell, { width: COL.REPS }]}>
          {isDone ? (
            <Text style={[FR.type.body, { color: c.text, fontWeight: "700" }]}>
              {set.reps}
            </Text>
          ) : (
            <TextInput
              value={String(set.reps)}
              onChangeText={onRepsChange}
              keyboardType="number-pad"
              selectTextOnFocus
              style={[
                styles.input,
                {
                  color: c.text,
                  backgroundColor: c.bg,
                  borderColor: c.border,
                },
              ]}
            />
          )}
        </View>

        {/* Checkmark button */}
        <Pressable
          onPress={handleToggleDone}
          style={({ pressed }) => [
            styles.checkButton,
            {
              backgroundColor: isDone ? c.primary + "30" : "transparent",
              borderColor: isDone ? c.primary : c.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text
            style={{
              color: isDone ? c.primary : c.muted,
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            {isDone ? "✓" : "○"}
          </Text>
        </Pressable>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: FR.space.x2,
    paddingHorizontal: FR.space.x2,
    borderRadius: FR.radius.soft,
    borderWidth: 1,
    gap: FR.space.x1,
  },
  cell: {
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: FR.space.x1,
    paddingHorizontal: FR.space.x1,
    borderRadius: FR.radius.input,
    borderWidth: 1,
  },
  checkButton: {
    width: COL.CHECK - 4,
    height: 32,
    borderRadius: FR.radius.soft,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SetRow;
