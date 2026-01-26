import React from "react";
import { Pressable, Text, View } from "react-native";
import { useThemeColors } from "../../theme";
import { EXERCISES_V1 } from "../../../data/exercises";

type PlannedExercise = {
  exerciseId: string;
  targetSets: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
};

export type PlanHeader = {
  title: string;
  subtitle: string;
};

type Props = {
  header: PlanHeader | null;
  planTitle?: string; // optional, usually header.title already covers it
  planExercises: PlannedExercise[];
  currentExerciseIndex: number;
  completedSetsByExerciseId: Record<string, number>;
  onJumpToIndex: (index: number) => void;
  onNext: () => void;
  visible: boolean; // show planned list section
};

function exerciseName(exerciseId: string) {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

export function PlanHeaderCard(props: Props) {
  const c = useThemeColors();

  if (!props.header && !props.visible) return null;

  return (
    <>
      {!!props.header && (
        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 12,
            padding: 12,
            backgroundColor: c.card,
            gap: 6,
          }}
        >
          <Text style={{ color: c.text, fontWeight: "900" }}>{props.header.title}</Text>
          <Text style={{ color: c.muted }}>{props.header.subtitle}</Text>
        </View>
      )}

      {props.visible && props.planExercises.length > 0 && (
        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 12,
            padding: 12,
            backgroundColor: c.card,
            gap: 8,
          }}
        >
          <Text style={{ color: c.text, fontWeight: "900" }}>Planned Exercises</Text>

          {props.planExercises.map((ex, idx) => {
            const done = props.completedSetsByExerciseId[ex.exerciseId] ?? 0;
            const isCurrent = idx === props.currentExerciseIndex;

            return (
              <Pressable
                key={`${ex.exerciseId}-${idx}`}
                onPress={() => props.onJumpToIndex(idx)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: isCurrent ? c.bg : c.card,
                  gap: 3,
                }}
              >
                <Text style={{ color: c.text, fontWeight: isCurrent ? "900" : "700" }}>
                  {idx + 1}. {exerciseName(ex.exerciseId)}
                </Text>
                <Text style={{ color: c.muted }}>
                  Sets: {done}/{ex.targetSets}{" "}
                  {ex.targetRepsMin != null && ex.targetRepsMax != null
                    ? `• ${ex.targetRepsMin}-${ex.targetRepsMax} reps`
                    : ""}
                </Text>
              </Pressable>
            );
          })}

          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            <Pressable
              onPress={props.onNext}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.bg,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "800", color: c.text }}>Next Exercise</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
}
