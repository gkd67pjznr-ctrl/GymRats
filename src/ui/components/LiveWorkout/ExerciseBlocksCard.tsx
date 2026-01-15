import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useThemeColors } from "../../theme";
import { EXERCISES_V1 } from "../../../data/exercises";
import type { LoggedSet } from "../../../lib/loggerTypes";

function exerciseName(exerciseId: string) {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

export type ExerciseBlocksCardProps = {
  exerciseIds: string[]; // ordered blocks
  sets: LoggedSet[];

  // focus mode
  focusExerciseId?: string | null;
  showOnlyFocus?: boolean;

  // add set uses per-exercise last-used from parent
  onAddSetForExercise: (exerciseId: string) => void;
  onJumpToExercise?: (exerciseId: string) => void;

  // locking
  isDone: (setId: string) => boolean;
  toggleDone: (setId: string) => void;

  // edit handlers
  setWeightForSet: (setId: string, text: string) => void;
  setRepsForSet: (setId: string, text: string) => void;

  // helpers
  kgToLb: (kg: number) => number;
  estimateE1RMLb: (weightLb: number, reps: number) => number;
};

export function ExerciseBlocksCard(props: ExerciseBlocksCardProps) {
  const c = useThemeColors();
  const [collapsedById, setCollapsedById] = useState<Record<string, boolean>>({});

  const visibleExerciseIds = useMemo(() => {
    if (props.showOnlyFocus && props.focusExerciseId) {
      return props.exerciseIds.filter((id) => id === props.focusExerciseId);
    }
    return props.exerciseIds;
  }, [props.exerciseIds, props.focusExerciseId, props.showOnlyFocus]);

  const BlockButton = (p: { title: string; onPress: () => void; subtle?: boolean }) => (
    <Pressable
      onPress={p.onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: p.subtle ? c.bg : c.card,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: c.text, fontWeight: "900", fontSize: 12 }}>{p.title}</Text>
    </Pressable>
  );

  if (props.exerciseIds.length === 0) {
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 12,
          padding: 12,
          gap: 8,
          backgroundColor: c.card,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "900", color: c.text }}>Exercises</Text>
        <Text style={{ color: c.muted, opacity: 0.9 }}>
          Add an exercise to start a block. (Quick Add still works too.)
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {visibleExerciseIds.map((exerciseId) => {
        const exSets = props.sets.filter((s) => s.exerciseId === exerciseId);
        const collapsed = !!collapsedById[exerciseId];

        return (
          <View
            key={exerciseId}
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 14,
              padding: 12,
              backgroundColor: c.card,
              gap: 10,
            }}
          >
            {/* Block header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Pressable
                onPress={() => props.onJumpToExercise?.(exerciseId)}
                style={{ paddingVertical: 4, paddingRight: 10, flex: 1 }}
              >
                <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>
                  {exerciseName(exerciseId)}
                </Text>
                <Text style={{ color: c.muted, fontWeight: "800", fontSize: 12 }}>{exSets.length} sets</Text>
              </Pressable>

              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <BlockButton
                  title={collapsed ? "Expand" : "Collapse"}
                  onPress={() =>
                    setCollapsedById((prev) => ({ ...prev, [exerciseId]: !prev[exerciseId] }))
                  }
                  subtle
                />
                <BlockButton title="+ Set" onPress={() => props.onAddSetForExercise(exerciseId)} />
              </View>
            </View>

            {/* Body */}
            {collapsed ? (
              <Text style={{ color: c.muted, opacity: 0.9 }}>Collapsed.</Text>
            ) : exSets.length === 0 ? (
              <Text style={{ color: c.muted, opacity: 0.9 }}>No sets yet. Tap “+ Set”.</Text>
            ) : (
              exSets.map((s, idx) => {
                const wLb = props.kgToLb(s.weightKg);
                const e1rm = props.estimateE1RMLb(wLb, s.reps);
                const done = props.isDone(s.id);

                return (
                  <View
                    key={s.id}
                    style={{
                      borderWidth: 1,
                      borderColor: c.border,
                      borderRadius: 12,
                      padding: 10,
                      backgroundColor: done ? c.bg : c.card,
                      gap: 8,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ color: c.muted, fontWeight: "800" }}>Set {idx + 1}</Text>

                      <Pressable
                        onPress={() => props.toggleDone(s.id)}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: c.border,
                          backgroundColor: done ? c.card : c.bg,
                        }}
                      >
                        <Text style={{ color: c.text, fontWeight: "900" }}>{done ? "Done ✓" : "Mark Done"}</Text>
                      </Pressable>
                    </View>

                    <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                      {/* Weight */}
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ color: c.muted, fontSize: 12 }}>Weight (lb)</Text>
                        {done ? (
                          <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>
                            {wLb.toFixed(1)}
                          </Text>
                        ) : (
                          <TextInput
                            defaultValue={wLb.toFixed(1)}
                            keyboardType="decimal-pad"
                            onChangeText={(t) => props.setWeightForSet(s.id, t)}
                            style={{
                              borderWidth: 1,
                              borderColor: c.border,
                              borderRadius: 10,
                              paddingVertical: 10,
                              paddingHorizontal: 10,
                              color: c.text,
                              backgroundColor: c.bg,
                              fontWeight: "900",
                            }}
                          />
                        )}
                      </View>

                      {/* Reps */}
                      <View style={{ width: 90, gap: 4 }}>
                        <Text style={{ color: c.muted, fontSize: 12 }}>Reps</Text>
                        {done ? (
                          <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>{s.reps}</Text>
                        ) : (
                          <TextInput
                            defaultValue={String(s.reps)}
                            keyboardType="number-pad"
                            onChangeText={(t) => props.setRepsForSet(s.id, t)}
                            style={{
                              borderWidth: 1,
                              borderColor: c.border,
                              borderRadius: 10,
                              paddingVertical: 10,
                              paddingHorizontal: 10,
                              color: c.text,
                              backgroundColor: c.bg,
                              fontWeight: "900",
                            }}
                          />
                        )}
                      </View>

                      {/* e1RM */}
                      <View style={{ width: 90, alignItems: "flex-end", gap: 4 }}>
                        <Text style={{ color: c.muted, fontSize: 12 }}>e1RM</Text>
                        <Text style={{ color: c.text, fontWeight: "900" }}>
                          {e1rm > 0 ? `${Math.round(e1rm)}` : "—"}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        );
      })}
    </View>
  );
}
