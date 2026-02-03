import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useThemeColors } from "../../src/ui/theme";
// [MIGRATED 2026-01-23] Using Zustand stores
import { deleteRoutine, upsertRoutine, useRoutine, clearCurrentSession, hasCurrentSession, ensureCurrentSession } from "../../src/lib/stores";
import { setCurrentPlan } from "../../src/lib/workoutPlanStore";
import type { RoutineExercise } from "../../src/lib/routinesModel";
import { EXERCISES_V1 } from "../../src/data/exercises";
import { makePlanFromRoutine } from "../../src/lib/workoutPlanModel";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { ScreenHeader } from "../../src/ui/components/ScreenHeader";
import { useWorkoutDrawerStore } from "../../src/lib/stores/workoutDrawerStore";

function nameForExercise(exerciseId: string) {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

/**
 * Convert RoutineExercise to PlannedExercise for WorkoutPlan
 */
function toPlannedExercise(rx: RoutineExercise) {
  return {
    exerciseId: rx.exerciseId,
    targetSets: rx.targetSets ?? 3,
    targetRepsMin: rx.targetRepsMin,
    targetRepsMax: rx.targetRepsMax,
  };
}

export default function RoutineDetail() {
  const c = useThemeColors();
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();

  const routine = useRoutine(String(routineId));

  if (!routine) {
    return (
      <ProtectedRoute>
        <View style={{ flex: 1, backgroundColor: c.bg, padding: 16 }}>
          <Text style={{ color: c.text, fontWeight: "900" }}>Routine not found.</Text>
        </View>
      </ProtectedRoute>
    );
  }

  function updateExercises(next: RoutineExercise[]) {
    // [FIX 2026-01-23] routine is guaranteed defined due to early return above
    if (!routine) return;
    upsertRoutine({ ...routine, exercises: next, updatedAtMs: Date.now() });
  }

  function removeAt(i: number) {
    if (!routine) return; // [FIX 2026-01-23]
    const next = routine.exercises.slice();
    next.splice(i, 1);
    updateExercises(next);
  }

  function move(i: number, dir: -1 | 1) {
    if (!routine) return; // [FIX 2026-01-23]
    const j = i + dir;
    if (j < 0 || j >= routine.exercises.length) return;
    const next = routine.exercises.slice();
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    updateExercises(next);
  }

  function nuke() {
    if (!routine) return; // [FIX 2026-01-23]
    deleteRoutine(routine.id);
    router.replace("/routines");
  }

  const Btn = (p: { label: string; onPress: () => void }) => (
    <Pressable
      onPress={p.onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.card,
      }}
    >
      <Text style={{ color: c.text, fontWeight: "900" }}>{p.label}</Text>
    </Pressable>
  );

  function handleStartWorkout() {
    if (!routine) return;

    const hasActiveSession = hasCurrentSession();

    if (hasActiveSession) {
      Alert.alert(
        "Replace Current Workout?",
        "You have an active workout in progress. Starting this routine will replace it. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Start Routine",
            style: "destructive",
            onPress: () => startRoutine(),
          },
        ]
      );
    } else {
      startRoutine();
    }
  }

  function startRoutine() {
    if (!routine) return;

    // Clear any existing session
    clearCurrentSession();

    // Convert routine to WorkoutPlan
    const plan = makePlanFromRoutine({
      routineId: routine.id,
      routineName: routine.name,
      exercises: routine.exercises.map(toPlannedExercise),
    });

    // Set as current plan
    setCurrentPlan(plan);

    // Set up session with routine exercises and open drawer
    const exerciseIds = routine.exercises.map(e => e.exerciseId);
    ensureCurrentSession({
      selectedExerciseId: exerciseIds[0] ?? null,
      exerciseBlocks: exerciseIds,
    });

    const { startWorkout } = useWorkoutDrawerStore.getState();
    startWorkout();
  }

  return (
    <ProtectedRoute>
      <ScreenHeader title={routine?.name ?? "Routine"} />
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>

        {/* Start Workout Button */}
        <Pressable
          onPress={handleStartWorkout}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 14,
            backgroundColor: c.primary,
            alignItems: "center",
            borderWidth: 1,
            borderColor: c.border,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>Start Workout</Text>
        </Pressable>

        <Link href={`/routines/${routine.id}/add-exercise`} asChild>
          <Pressable
            style={{
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              alignItems: "center",
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900" }}>+ Add Exercise</Text>
          </Pressable>
        </Link>

        <View style={{ gap: 10 }}>
          {routine.exercises.length === 0 ? (
            <Text style={{ color: c.muted }}>No exercises yet. Add some.</Text>
          ) : (
            routine.exercises.map((rx, i) => (
              <View
                key={rx.id}
                style={{
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: 14,
                  backgroundColor: c.card,
                  padding: 12,
                  gap: 8,
                }}
              >
                <Text style={{ color: c.text, fontWeight: "900" }}>
                  {i + 1}. {nameForExercise(rx.exerciseId)}
                </Text>

                <Text style={{ color: c.muted }}>
                  Targets: {rx.targetSets ?? "—"} sets •{" "}
                  {rx.targetRepsMin ?? "—"}–{rx.targetRepsMax ?? "—"} reps
                </Text>

                <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                  <Btn label="↑" onPress={() => move(i, -1)} />
                  <Btn label="↓" onPress={() => move(i, 1)} />
                  <Btn label="Remove" onPress={() => removeAt(i)} />
                </View>
              </View>
            ))
          )}
        </View>

        <Pressable onPress={nuke} style={{ marginTop: 10 }}>
          <Text style={{ color: c.muted, fontWeight: "900" }}>Delete routine</Text>
        </Pressable>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}
