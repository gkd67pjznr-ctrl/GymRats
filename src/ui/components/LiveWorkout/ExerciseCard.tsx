// src/ui/components/LiveWorkout/ExerciseCard.tsx
// Hevy-style exercise card with tabular set layout

import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useThemeColors } from "../../theme";
import { FR } from "../../forgerankStyle";
import { EXERCISES_V1 } from "../../../data/exercises";
import type { LoggedSet } from "../../../lib/loggerTypes";
import { SetRow } from "./SetRow";

// Column widths - must match SetRow
const COL = {
  SET: 36,
  PREV: 72,
  LBS: 64,
  REPS: 56,
  CHECK: 44,
};

export interface ExerciseCardProps {
  exerciseId: string;
  sets: LoggedSet[];
  /** Target sets from plan (if in plan mode) */
  targetSets?: number;
  /** Previous workout data keyed by set index */
  getPreviousSet: (exerciseId: string, setIndex: number) => { weightKg: number; reps: number } | null;
  /** Handlers */
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
  onToggleDone: (setId: string) => void;
  onWeightChange: (setId: string, text: string) => void;
  onRepsChange: (setId: string, text: string) => void;
  isDone: (setId: string) => boolean;
  kgToLb: (kg: number) => number;
  /** Optional: show exercise picker on tap */
  onExerciseTap?: () => void;
  /** Optional: show menu on tap */
  onMenuTap?: () => void;
}

function getExerciseName(exerciseId: string): string {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

function getExerciseIcon(exerciseId: string): string {
  // Simple emoji icons based on exercise type
  const iconMap: Record<string, string> = {
    bench: "🏋️",
    squat: "🦵",
    deadlift: "💪",
    ohp: "🙌",
    row: "🚣",
    pullup: "🧗",
    lat_pulldown: "⬇️",
    leg_press: "🦿",
    rdl: "🍑",
    incline_bench: "📐",
  };
  return iconMap[exerciseId] ?? "🏋️";
}

export function ExerciseCard({
  exerciseId,
  sets,
  targetSets,
  getPreviousSet,
  onAddSet,
  onDeleteSet,
  onToggleDone,
  onWeightChange,
  onRepsChange,
  isDone,
  kgToLb,
  onExerciseTap,
  onMenuTap,
}: ExerciseCardProps) {
  const c = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(true);

  const exerciseName = getExerciseName(exerciseId);
  const exerciseIcon = getExerciseIcon(exerciseId);
  const completedSets = sets.length;
  const showProgress = targetSets !== undefined && targetSets > 0;

  const triggerHaptic = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAddSet = () => {
    triggerHaptic();
    onAddSet();
  };

  const handleToggleExpand = () => {
    triggerHaptic();
    setIsExpanded(!isExpanded);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.card,
          borderColor: c.border,
        },
      ]}
    >
      {/* Header Row */}
      <View style={styles.header}>
        {/* Left: Icon + Name */}
        <Pressable
          onPress={onExerciseTap}
          style={({ pressed }) => [
            styles.headerLeft,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.exerciseIcon}>{exerciseIcon}</Text>
          <View style={styles.headerText}>
            <Text
              style={[FR.type.h3, { color: c.text }]}
              numberOfLines={1}
            >
              {exerciseName}
            </Text>
            {showProgress && (
              <Text style={[FR.type.sub, { color: c.muted }]}>
                {completedSets}/{targetSets} sets
              </Text>
            )}
          </View>
          <Ionicons
            name="chevron-down"
            size={16}
            color={c.muted}
            style={{ marginLeft: FR.space.x1 }}
          />
        </Pressable>

        {/* Right: Menu + Collapse */}
        <View style={styles.headerRight}>
          {onMenuTap && (
            <Pressable
              onPress={onMenuTap}
              style={({ pressed }) => [
                styles.iconButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={c.muted} />
            </Pressable>
          )}
          <Pressable
            onPress={handleToggleExpand}
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={c.muted}
            />
          </Pressable>
        </View>
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Column Headers */}
          <View style={styles.columnHeaders}>
            <View style={[styles.colHeader, { width: COL.SET }]}>
              <Text style={[styles.colHeaderText, { color: c.muted }]}>SET</Text>
            </View>
            <View style={[styles.colHeader, { width: COL.PREV }]}>
              <Text style={[styles.colHeaderText, { color: c.muted }]}>PREV</Text>
            </View>
            <View style={[styles.colHeader, { width: COL.LBS }]}>
              <Text style={[styles.colHeaderText, { color: c.muted }]}>LBS</Text>
            </View>
            <View style={[styles.colHeader, { width: COL.REPS }]}>
              <Text style={[styles.colHeaderText, { color: c.muted }]}>REPS</Text>
            </View>
            <View style={[styles.colHeader, { width: COL.CHECK }]}>
              <Ionicons name="checkmark-circle-outline" size={16} color={c.muted} />
            </View>
          </View>

          {/* Set Rows */}
          {sets.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[FR.type.sub, { color: c.muted }]}>
                No sets yet. Add your first set.
              </Text>
            </View>
          ) : (
            <View style={styles.setsList}>
              {sets.map((set, index) => (
                <SetRow
                  key={set.id}
                  set={set}
                  setNumber={index + 1}
                  previousSet={getPreviousSet(exerciseId, index)}
                  isDone={isDone(set.id)}
                  onToggleDone={() => onToggleDone(set.id)}
                  onWeightChange={(text) => onWeightChange(set.id, text)}
                  onRepsChange={(text) => onRepsChange(set.id, text)}
                  onDelete={() => onDeleteSet(set.id)}
                  kgToLb={kgToLb}
                />
              ))}
            </View>
          )}

          {/* Add Set Button */}
          <Pressable
            onPress={handleAddSet}
            style={({ pressed }) => [
              styles.addSetButton,
              {
                borderColor: c.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons name="add" size={18} color={c.primary} />
            <Text style={[FR.type.body, { color: c.primary, fontWeight: "700" }]}>
              ADD SET
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: FR.radius.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: FR.space.x3,
    paddingHorizontal: FR.space.x3,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  exerciseIcon: {
    fontSize: 24,
    marginRight: FR.space.x2,
  },
  headerText: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: FR.space.x1,
  },
  iconButton: {
    padding: FR.space.x1,
  },
  content: {
    paddingHorizontal: FR.space.x3,
    paddingBottom: FR.space.x3,
    gap: FR.space.x2,
  },
  columnHeaders: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: FR.space.x2,
    gap: FR.space.x1,
  },
  colHeader: {
    alignItems: "center",
    justifyContent: "center",
  },
  colHeaderText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  emptyState: {
    paddingVertical: FR.space.x4,
    alignItems: "center",
  },
  setsList: {
    gap: FR.space.x1,
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: FR.space.x2,
    borderRadius: FR.radius.soft,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: FR.space.x1,
  },
});

export default ExerciseCard;
