// src/ui/components/LiveWorkout/SetRow.tsx
// Clean table row for set data - Hevy/Liftoff style
// SET | PREVIOUS | LBS | REPS | [check]

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
  previousSet: { weightKg: number; reps: number } | null;
  isDone: boolean;
  onToggleDone: () => void;
  onWeightChange: (text: string) => void;
  onRepsChange: (text: string) => void;
  onDelete: () => void;
  kgToLb: (kg: number) => number;
}

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

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
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
        }}
      >
        <Animated.Text
          style={{
            color: "#fff",
            fontWeight: "700",
            fontSize: 13,
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
            backgroundColor: isDone ? c.bg + "80" : "transparent",
          },
        ]}
      >
        {/* SET number */}
        <View style={styles.setCol}>
          <View
            style={[
              styles.setNumberBadge,
              {
                backgroundColor: isDone ? c.primary + "20" : c.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.setNumberText,
                { color: isDone ? c.primary : c.muted },
              ]}
            >
              {setNumber}
            </Text>
          </View>
        </View>

        {/* PREVIOUS */}
        <View style={styles.prevCol}>
          {prevWeightLb !== null && prevReps !== null ? (
            <Text style={[styles.prevText, { color: c.muted }]}>
              {Math.round(prevWeightLb)} x {prevReps}
            </Text>
          ) : (
            <Text style={[styles.prevText, { color: c.border }]}>-</Text>
          )}
        </View>

        {/* LBS input */}
        <View style={styles.inputCol}>
          {isDone ? (
            <Text style={[styles.lockedValue, { color: c.text }]}>
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
                },
              ]}
            />
          )}
        </View>

        {/* REPS input */}
        <View style={styles.inputCol}>
          {isDone ? (
            <Text style={[styles.lockedValue, { color: c.text }]}>
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
                },
              ]}
            />
          )}
        </View>

        {/* Check button */}
        <View style={styles.checkCol}>
          <Pressable
            onPress={handleToggleDone}
            style={({ pressed }) => [
              styles.checkButton,
              {
                backgroundColor: isDone ? c.primary : "transparent",
                borderColor: isDone ? c.primary : c.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            {isDone ? (
              <Text style={styles.checkMark}>✓</Text>
            ) : null}
          </Pressable>
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  setCol: {
    width: 36,
    alignItems: "center",
  },
  setNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  setNumberText: {
    fontSize: 13,
    fontWeight: "700",
  },
  prevCol: {
    flex: 1,
    alignItems: "center",
  },
  prevText: {
    fontSize: 13,
    fontWeight: "500",
  },
  inputCol: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  input: {
    width: "100%",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  lockedValue: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  checkCol: {
    width: 40,
    alignItems: "center",
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default SetRow;
