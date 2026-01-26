import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useThemeColors } from "../../src/ui/theme";
// [MIGRATED 2026-01-23] Using Zustand stores
import { useRoutines } from "../../src/lib/stores";
import { makeFreePlan, makePlanFromRoutine, type PlannedExercise } from "../../src/lib/workoutPlanModel";
import { setCurrentPlan } from "../../src/lib/workoutPlanStore";
import { RoutinePreviewModal } from "../../src/ui/components/LiveWorkout/RoutinePreviewModal";

export default function StartWorkout() {
  const c = useThemeColors();
  const router = useRouter();
  const routines = useRoutines();

  // State for routine preview modal
  const [previewRoutine, setPreviewRoutine] = useState<{
    id: string;
    name: string;
    exercises: typeof routines;
  } | null>(null);

  function startFree() {
    setCurrentPlan(makeFreePlan());
    router.push("/live-workout");
  }

  function showRoutinePreview(routineId: string) {
    const r = routines.find((x) => x.id === routineId);
    if (!r) return;

    setPreviewRoutine({
      id: r.id,
      name: r.name,
      exercises: r.exercises,
    });
  }

  function startRoutine() {
    if (!previewRoutine) return;

    const planned: PlannedExercise[] = previewRoutine.exercises.map((rx) => ({
      exerciseId: rx.exerciseId,
      targetSets: rx.targetSets ?? 3,
      targetRepsMin: rx.targetRepsMin,
      targetRepsMax: rx.targetRepsMax,
    }));

    setCurrentPlan(
      makePlanFromRoutine({
        routineId: previewRoutine.id,
        routineName: previewRoutine.name,
        exercises: planned,
      })
    );

    setPreviewRoutine(null);
    router.push("/live-workout");
  }

  function cancelPreview() {
    setPreviewRoutine(null);
  }

  const Card = (p: { title: string; subtitle: string; onPress: () => void }) => (
    <Pressable
      onPress={p.onPress}
      style={{
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 14,
        backgroundColor: c.card,
        padding: 14,
        gap: 6,
      }}
    >
      <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>{p.title}</Text>
      <Text style={{ color: c.muted, lineHeight: 18 }}>{p.subtitle}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: c.text, fontSize: 22, fontWeight: "900" }}>Start Workout</Text>

        <Card title="Free Workout" subtitle="No plan. Log anything." onPress={startFree} />

        <Text style={{ color: c.muted, marginTop: 8 }}>Start from a routine</Text>

        {routines.length === 0 ? (
          <Text style={{ color: c.muted }}>No routines yet. Create one in Routines.</Text>
        ) : (
          routines.map((r) => (
            <Card
              key={r.id}
              title={r.name}
              subtitle={`Exercises: ${r.exercises.length}`}
              onPress={() => showRoutinePreview(r.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Routine Preview Modal */}
      <RoutinePreviewModal
        visible={previewRoutine !== null}
        routineName={previewRoutine?.name ?? ""}
        exercises={previewRoutine?.exercises ?? []}
        onStart={startRoutine}
        onCancel={cancelPreview}
      />
    </View>
  );
}
