import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useThemeColors } from "../../theme";
import { FR } from "../../forgerankStyle";
import { EXERCISES_V1 } from "../../../data/exercises";
import type { RoutineExercise } from "../../../lib/routinesModel";

interface RoutinePreviewModalProps {
  visible: boolean;
  routineName: string;
  exercises: RoutineExercise[];
  onStart: () => void;
  onCancel: () => void;
}

/**
 * Routine Preview Modal
 *
 * Shows exercises and targets before starting a routine workout.
 * Displays the routine name, list of exercises with their set/rep targets,
 * and provides Start/Cancel buttons.
 */
export function RoutinePreviewModal({
  visible,
  routineName,
  exercises,
  onStart,
  onCancel,
}: RoutinePreviewModalProps) {
  const c = useThemeColors();

  const exerciseName = (exerciseId: string) => {
    return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
  };

  const formatTargetReps = (min?: number, max?: number) => {
    if (min !== undefined && max !== undefined) {
      if (min === max) return `${min} reps`;
      return `${min}-${max} reps`;
    }
    if (min !== undefined) return `${min}+ reps`;
    if (max !== undefined) return `${max} reps`;
    return "—";
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: c.bg,
            borderTopLeftRadius: FR.radius.card,
            borderTopRightRadius: FR.radius.card,
            maxHeight: "80%",
          }}
        >
          <ScrollView contentContainerStyle={{ padding: FR.space.x4, gap: FR.space.x3 }}>
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: c.text, ...FR.type.h2 }}>Start Routine</Text>
              <Pressable onPress={onCancel}>
                <Text style={{ color: c.text, fontSize: 24 }}>✕</Text>
              </Pressable>
            </View>

            {/* Routine Name */}
            <View
              style={{
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: FR.radius.card,
                padding: FR.space.x3,
              }}
            >
              <Text style={{ color: c.muted, ...FR.type.sub }}>Routine</Text>
              <Text style={{ color: c.text, ...FR.type.h2 }}>{routineName}</Text>
              <Text style={{ color: c.muted, ...FR.type.body, marginTop: FR.space.x1 }}>
                {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
              </Text>
            </View>

            {/* Exercise List */}
            <View
              style={{
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: FR.radius.card,
                padding: FR.space.x3,
                gap: FR.space.x3,
              }}
            >
              <Text style={{ color: c.text, ...FR.type.h3 }}>Exercises</Text>

              {exercises.length === 0 ? (
                <Text style={{ color: c.muted, ...FR.type.body }}>No exercises in this routine.</Text>
              ) : (
                exercises.map((rx, idx) => (
                  <View
                    key={rx.id}
                    style={{
                      backgroundColor: c.bg,
                      borderWidth: 1,
                      borderColor: c.border,
                      borderRadius: FR.radius.soft,
                      padding: FR.space.x3,
                      gap: FR.space.x1,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x2 }}>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: c.border,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: c.text, fontSize: 12, fontWeight: "900" }}>
                          {idx + 1}
                        </Text>
                      </View>
                      <Text style={{ color: c.text, ...FR.type.h3, flex: 1 }}>
                        {exerciseName(rx.exerciseId)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", gap: FR.space.x4, marginTop: FR.space.x1 }}>
                      <Text style={{ color: c.muted, ...FR.type.sub }}>
                        Target: {rx.targetSets ?? 3} sets × {formatTargetReps(rx.targetRepsMin, rx.targetRepsMax)}
                      </Text>
                    </View>

                    {rx.note && (
                      <Text style={{ color: c.muted, ...FR.type.sub, marginTop: FR.space.x1 }}>
                        Note: {rx.note}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
              <Pressable
                onPress={onCancel}
                style={{
                  flex: 1,
                  paddingVertical: FR.space.x3,
                  borderRadius: FR.radius.button,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: c.text, ...FR.type.h3 }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={onStart}
                style={{
                  flex: 1,
                  paddingVertical: FR.space.x3,
                  borderRadius: FR.radius.button,
                  backgroundColor: c.success,
                  borderWidth: 1,
                  borderColor: c.success,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: c.bg, ...FR.type.h3 }}>Start Workout</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
