import React, { useMemo } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useThemeColors } from "../../theme";
import { EXERCISES_V1 } from "../../../data/exercises";
import type { LoggedSet } from "../../../lib/loggerTypes";

function exerciseName(exerciseId: string) {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

export type WorkoutLogCardProps = {
  sets: LoggedSet[];

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

export function WorkoutLogCard(props: WorkoutLogCardProps) {
  const c = useThemeColors();

  const orderedExerciseIds = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const s of props.sets) {
      if (!seen.has(s.exerciseId)) {
        seen.add(s.exerciseId);
        ordered.push(s.exerciseId);
      }
    }
    return ordered;
  }, [props.sets]);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 12,
        padding: 12,
        gap: 10,
        backgroundColor: c.card,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={{ fontSize: 16, fontWeight: "900", color: c.text }}>Workout Log</Text>
        <Text style={{ color: c.muted, fontWeight: "800" }}>{props.sets.length} sets</Text>
      </View>

      {props.sets.length === 0 ? (
        <Text style={{ color: c.muted, opacity: 0.9 }}>No sets yet. Add your first set above.</Text>
      ) : (
        orderedExerciseIds.map((exerciseId) => {
          const exSets = props.sets.filter((s) => s.exerciseId === exerciseId);

          return (
            <View key={exerciseId} style={{ gap: 8 }}>
              <Text style={{ color: c.text, fontWeight: "900", marginTop: 6 }}>{exerciseName(exerciseId)}</Text>

              {exSets.map((s, idx) => {
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
                          <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>{wLb.toFixed(1)}</Text>
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
              })}
            </View>
          );
        })
      )}
    </View>
  );
}
