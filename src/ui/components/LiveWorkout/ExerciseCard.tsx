// src/ui/components/LiveWorkout/ExerciseCard.tsx
// Hevy/Liftoff-style exercise card with clean tabular set layout

import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useThemeColors } from "../../theme";
import { EXERCISES_V1 } from "../../../data/exercises";
import type { LoggedSet } from "../../../lib/loggerTypes";
import { SetRow } from "./SetRow";
import { ExerciseNoteInput, ExerciseNotePreview } from "../ExerciseNoteInput";
import { useHasExerciseNote } from "../../../lib/stores/exerciseNotesStore";

export interface ExerciseCardProps {
  exerciseId: string;
  sets: LoggedSet[];
  targetSets?: number;
  getPreviousSet: (exerciseId: string, setIndex: number) => { weightKg: number; reps: number } | null;
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
  onToggleDone: (setId: string) => void;
  onWeightChange: (setId: string, text: string) => void;
  onRepsChange: (setId: string, text: string) => void;
  isDone: (setId: string) => boolean;
  kgToLb: (kg: number) => number;
  onExerciseTap?: () => void;
  onMenuTap?: () => void;
}

function getExerciseName(exerciseId: string): string {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
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
}: ExerciseCardProps) {
  const c = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const hasNote = useHasExerciseNote(exerciseId);

  const exerciseName = getExerciseName(exerciseId);
  const completedSets = sets.filter((s) => isDone(s.id)).length;
  const totalSets = targetSets ?? sets.length;

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
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={onExerciseTap}
          style={({ pressed }) => [
            styles.headerLeft,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.exerciseName, { color: c.primary }]} numberOfLines={1}>
            {exerciseName}
          </Text>
          {targetSets !== undefined && targetSets > 0 && (
            <Text style={[styles.setProgress, { color: c.muted }]}>
              {completedSets}/{totalSets}
            </Text>
          )}
        </Pressable>

        <View style={styles.headerRight}>
          {/* Note icon */}
          <Pressable
            onPress={() => {
              triggerHaptic();
              setIsNoteExpanded(!isNoteExpanded);
            }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.noteButton,
              {
                opacity: pressed ? 0.5 : 1,
                borderColor: hasNote ? c.primary + "40" : c.border,
                backgroundColor: hasNote ? c.primary + "15" : "transparent",
              },
            ]}
          >
            <Ionicons
              name={hasNote ? "document-text" : "document-text-outline"}
              size={16}
              color={hasNote ? c.primary : c.muted}
            />
          </Pressable>

          {/* Expand/collapse */}
          <Pressable
            onPress={handleToggleExpand}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={c.muted}
            />
          </Pressable>
        </View>
      </View>

      {/* Note input (expandable) */}
      {isNoteExpanded && (
        <View style={styles.noteContainer}>
          <ExerciseNoteInput exerciseId={exerciseId} />
        </View>
      )}

      {/* Note preview (when collapsed and has note) */}
      {!isNoteExpanded && hasNote && (
        <View style={styles.notePreviewContainer}>
          <Ionicons name="document-text" size={12} color={c.muted} style={{ marginRight: 4 }} />
          <ExerciseNotePreview exerciseId={exerciseId} maxLength={50} />
        </View>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <>
          {/* Column headers */}
          <View style={[styles.columnHeaders, { borderBottomColor: c.border }]}>
            <View style={styles.setCol}>
              <Text style={[styles.colLabel, { color: c.muted }]}>SET</Text>
            </View>
            <View style={styles.flexCol}>
              <Text style={[styles.colLabel, { color: c.muted }]}>PREVIOUS</Text>
            </View>
            <View style={styles.flexCol}>
              <Text style={[styles.colLabel, { color: c.muted }]}>LBS</Text>
            </View>
            <View style={styles.flexCol}>
              <Text style={[styles.colLabel, { color: c.muted }]}>REPS</Text>
            </View>
            <View style={styles.checkCol}>
              <Ionicons name="checkmark" size={14} color={c.muted} />
            </View>
          </View>

          {/* Set rows */}
          {sets.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: c.muted }]}>
                Tap + Add Set to begin
              </Text>
            </View>
          ) : (
            sets.map((set, index) => (
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
            ))
          )}

          {/* Add Set button */}
          <Pressable
            onPress={handleAddSet}
            style={({ pressed }) => [
              styles.addSetButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons name="add" size={16} color={c.primary} />
            <Text style={[styles.addSetText, { color: c.primary }]}>
              Add Set
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "700",
  },
  setProgress: {
    fontSize: 13,
    fontWeight: "500",
  },
  columnHeaders: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  setCol: {
    width: 36,
    alignItems: "center",
  },
  flexCol: {
    flex: 1,
    alignItems: "center",
  },
  checkCol: {
    width: 40,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "500",
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 4,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  noteButton: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  noteContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  notePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});

export default ExerciseCard;
