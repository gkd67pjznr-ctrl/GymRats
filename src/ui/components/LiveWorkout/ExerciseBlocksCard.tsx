import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View, Platform } from "react-native";
import { useThemeColors } from "../../theme";
import { FR } from "../../forgerankStyle";
import { EXERCISES_V1 } from "../../../data/exercises";
import type { LoggedSet } from "../../../lib/loggerTypes";
import * as Haptics from "expo-haptics";
import { NumberInput } from "./NumberInput";

function exerciseName(exerciseId: string) {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

export type ExerciseBlocksCardProps = {
  exerciseIds: string[]; // ordered blocks
  sets: LoggedSet[];

  // Optional target sets per exercise (from routine/plan)
  targetSetsByExerciseId?: Record<string, number>;

  onAddSetForExercise: (exerciseId: string) => void;
  onJumpToExercise?: (exerciseId: string) => void;

  // focus mode: show only current
  focusMode: boolean;
  focusedExerciseId: string | null;

  // locking
  isDone: (setId: string) => boolean;
  toggleDone: (setId: string) => void;

  // edit handlers
  setWeightForSet: (setId: string, text: string) => void;
  setRepsForSet: (setId: string, text: string) => void;
  incrementWeight: (setId: string) => void;
  decrementWeight: (setId: string) => void;
  incrementReps: (setId: string) => void;
  decrementReps: (setId: string) => void;

  // helpers
  kgToLb: (kg: number) => number;
  estimateE1RMLb: (weightLb: number, reps: number) => number;

  // "same as previous" helpers
  getLastSetForExercise: (exerciseId: string) => LoggedSet | null;
  copyFromLastSet: (exerciseId: string, setId: string) => void;
};

export function ExerciseBlocksCard(props: ExerciseBlocksCardProps) {
  const c = useThemeColors();

  // local collapse map (per block)
  const [collapsedByExerciseId, setCollapsedByExerciseId] = useState<Record<string, boolean>>({});

  // Calculate overall progress when in plan mode
  const overallProgress = useMemo(() => {
    if (!props.targetSetsByExerciseId || Object.keys(props.targetSetsByExerciseId).length === 0) {
      return null;
    }

    let totalTargetSets = 0;
    let totalCompletedSets = 0;
    let completedExercises = 0;

    props.exerciseIds.forEach((exerciseId) => {
      const targetSets = props.targetSetsByExerciseId?.[exerciseId] ?? 0;
      const completedSets = props.sets.filter((s) => s.exerciseId === exerciseId).length;

      totalTargetSets += targetSets;
      totalCompletedSets += Math.min(completedSets, targetSets);

      if (completedSets >= targetSets && targetSets > 0) {
        completedExercises++;
      }
    });

    const progressPercent = totalTargetSets > 0
      ? Math.round((totalCompletedSets / totalTargetSets) * 100)
      : 0;

    return {
      totalTargetSets,
      totalCompletedSets,
      completedExercises,
      totalExercises: props.exerciseIds.length,
      progressPercent,
      remainingExercises: props.exerciseIds.length - completedExercises,
    };
  }, [props.exerciseIds, props.sets, props.targetSetsByExerciseId]);

  const visibleExerciseIds = useMemo(() => {
    if (!props.focusMode) return props.exerciseIds;
    if (!props.focusedExerciseId) return props.exerciseIds;
    return props.exerciseIds.filter((id) => id === props.focusedExerciseId);
  }, [props.exerciseIds, props.focusMode, props.focusedExerciseId]);

  const BlockButton = (p: { title: string; onPress: () => void; subtle?: boolean }) => (
    <Pressable
      onPress={p.onPress}
      style={({ pressed }) => ({
        paddingVertical: FR.space.x2,
        paddingHorizontal: FR.space.x3,
        borderRadius: FR.radius.button,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: p.subtle ? c.bg : c.card,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={[FR.type.sub, { color: c.text }]}>{p.title}</Text>
    </Pressable>
  );

  const DoneButton = (p: { done: boolean; onPress: () => void }) => (
    <Pressable
      onPress={p.onPress}
      style={({ pressed }) => ({
        paddingVertical: FR.space.x2,
        paddingHorizontal: FR.space.x3,
        borderRadius: FR.radius.pill,
        borderWidth: 1,
        borderColor: p.done ? c.success : c.border,
        backgroundColor: p.done ? c.success + "20" : c.card,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={[FR.type.sub, { color: p.done ? c.success : c.text }]}>
        {p.done ? "Done ✓" : "Mark Done"}
      </Text>
    </Pressable>
  );

  if (props.exerciseIds.length === 0) {
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: FR.radius.card,
          padding: FR.space.x4,
          gap: FR.space.x2,
          backgroundColor: c.card,
        }}
      >
        <Text style={[FR.type.h3, { color: c.text }]}>Exercises</Text>
        <Text style={[FR.type.body, { color: c.muted }]}>
          Add an exercise to start a block. (Quick Add still works too.)
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: FR.space.x3 }}>
      {/* Overall Progress Summary (plan mode only) */}
      {overallProgress && (
        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: FR.radius.card,
            padding: FR.space.x3,
            backgroundColor: c.card,
            gap: FR.space.x2,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[FR.type.h3, { color: c.text }]}>Progress</Text>
            <Text style={[FR.type.h3, { color: c.primary }]}>
              {overallProgress.progressPercent}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View
            style={{
              height: 8,
              backgroundColor: c.bg,
              borderRadius: FR.radius.pill,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${overallProgress.progressPercent}%`,
                backgroundColor: c.primary,
                borderRadius: FR.radius.pill,
              }}
            />
          </View>

          {/* Stats */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[FR.type.sub, { color: c.muted }]}>
              {overallProgress.totalCompletedSets}/{overallProgress.totalTargetSets} sets
            </Text>
            <Text style={[FR.type.sub, { color: c.muted }]}>
              {overallProgress.remainingExercises === 0
                ? "All exercises complete!"
                : `${overallProgress.remainingExercises} exercise${overallProgress.remainingExercises > 1 ? "s" : ""} left`}
            </Text>
          </View>
        </View>
      )}
      {visibleExerciseIds.map((exerciseId) => {
        const exSets = props.sets.filter((s) => s.exerciseId === exerciseId);
        const isCollapsed = !!collapsedByExerciseId[exerciseId];
        const targetSets = props.targetSetsByExerciseId?.[exerciseId];
        const completedSets = exSets.length;
        const showProgress = targetSets !== undefined && targetSets > 0;
        const lastSet = props.getLastSetForExercise(exerciseId);

        return (
          <View
            key={exerciseId}
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: FR.radius.card,
              padding: FR.space.x3,
              backgroundColor: c.card,
              gap: FR.space.x3,
            }}
          >
            {/* Block header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Pressable
                onPress={() => props.onJumpToExercise?.(exerciseId)}
                style={{ paddingVertical: FR.space.x1, paddingRight: FR.space.x2, flex: 1 }}
              >
                <Text style={[FR.type.h3, { color: c.text }]}>
                  {exerciseName(exerciseId)}
                </Text>
                <Text style={[FR.type.sub, { color: c.muted }]}>
                  {showProgress ? `${completedSets}/${targetSets} sets` : `${exSets.length} sets`}
                </Text>
              </Pressable>

              <View style={{ flexDirection: "row", gap: FR.space.x1 }}>
                <BlockButton
                  title={isCollapsed ? "▼" : "▲"}
                  onPress={() => {
                    if (Platform.OS === "ios") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setCollapsedByExerciseId((prev) => ({ ...prev, [exerciseId]: !prev[exerciseId] }));
                  }}
                  subtle
                />
                <BlockButton
                  title="+ Set"
                  onPress={() => props.onAddSetForExercise(exerciseId)}
                />
              </View>
            </View>

            {/* Body */}
            {isCollapsed ? (
              <Text style={[FR.type.body, { color: c.muted }]}>
                {exSets.length > 0 ? `${exSets.length} sets logged` : "No sets yet"}
              </Text>
            ) : exSets.length === 0 ? (
              <Text style={[FR.type.body, { color: c.muted }]}>No sets yet. Tap "+ Set".</Text>
            ) : (
              <View style={{ gap: FR.space.x2 }}>
                {exSets.map((s, idx) => {
                  const wLb = props.kgToLb(s.weightKg);
                  const e1rm = props.estimateE1RMLb(wLb, s.reps);
                  const done = props.isDone(s.id);
                  const isLastSet = idx === exSets.length - 1;
                  const hasPreviousSet = idx > 0 || lastSet !== null;

                  return (
                    <View
                      key={s.id}
                      style={{
                        borderWidth: 1,
                        borderColor: c.border,
                        borderRadius: FR.radius.button,
                        padding: FR.space.x3,
                        backgroundColor: done ? c.bg : c.card,
                        gap: FR.space.x2,
                      }}
                    >
                      {/* Set header with index and done button */}
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={[FR.type.sub, { color: c.muted }]}>Set {idx + 1}</Text>

                        <View style={{ flexDirection: "row", gap: FR.space.x1 }}>
                          {/* "Same as Previous" button (if not first set) */}
                          {!done && hasPreviousSet && (
                            <Pressable
                              onPress={() => props.copyFromLastSet(exerciseId, s.id)}
                              style={({ pressed }) => ({
                                paddingVertical: FR.space.x1,
                                paddingHorizontal: FR.space.x2,
                                borderRadius: FR.radius.soft,
                                borderWidth: 1,
                                borderColor: c.border,
                                backgroundColor: c.bg,
                                opacity: pressed ? 0.7 : 1,
                              })}
                            >
                              <Text style={[FR.type.mono, { color: c.primary, fontSize: 11 }]}>
                                Copy
                              </Text>
                            </Pressable>
                          )}

                          <DoneButton done={done} onPress={() => {
                            if (Platform.OS === "ios") {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }
                            props.toggleDone(s.id);
                          }} />
                        </View>
                      </View>

                      {/* Input row - NumberInput with stepper buttons */}
                      <View style={{ flexDirection: "row", gap: FR.space.x2, alignItems: "flex-end" }}>
                        {/* Weight */}
                        {done ? (
                          <View style={{ flex: 1, gap: FR.space.x1 }}>
                            <Text style={[FR.type.mono, { color: c.muted, fontSize: 11 }]}>Weight (lb)</Text>
                            <Text style={[FR.type.h3, { color: c.text }]}>
                              {wLb.toFixed(1)}
                            </Text>
                          </View>
                        ) : (
                          <View style={{ flex: 1 }}>
                            <NumberInput
                              value={wLb}
                              textValue={wLb.toFixed(1)}
                              label="Weight"
                              unit="lb"
                              onTextChange={(t) => props.setWeightForSet(s.id, t)}
                              onCommit={() => {}}
                              onDecrement={() => props.decrementWeight(s.id)}
                              onIncrement={() => props.incrementWeight(s.id)}
                              min={0}
                              max={2000}
                            />
                          </View>
                        )}

                        {/* Reps */}
                        {done ? (
                          <View style={{ width: 100, gap: FR.space.x1 }}>
                            <Text style={[FR.type.mono, { color: c.muted, fontSize: 11 }]}>Reps</Text>
                            <Text style={[FR.type.h3, { color: c.text }]}>{s.reps}</Text>
                          </View>
                        ) : (
                          <View style={{ width: 100 }}>
                            <NumberInput
                              value={s.reps}
                              textValue={String(s.reps)}
                              label="Reps"
                              unit=""
                              onTextChange={(t) => props.setRepsForSet(s.id, t)}
                              onCommit={() => {}}
                              onDecrement={() => props.decrementReps(s.id)}
                              onIncrement={() => props.incrementReps(s.id)}
                              min={0}
                              max={100}
                            />
                          </View>
                        )}

                        {/* e1RM */}
                        <View style={{ width: 50, alignItems: "flex-end", gap: FR.space.x1, paddingBottom: FR.space.x2 }}>
                          <Text style={[FR.type.mono, { color: c.muted, fontSize: 11 }]}>e1RM</Text>
                          <Text style={[FR.type.sub, { color: c.text }]}>
                            {e1rm > 0 ? `${Math.round(e1rm)}` : "—"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
