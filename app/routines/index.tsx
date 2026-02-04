import { View, Pressable, ScrollView, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Surface, Text, Card, surface, text, border, corners, space } from "@/src/design";
import { TAB_BAR_HEIGHT } from "@/src/ui/components/PersistentTabBar";
// [MIGRATED 2026-01-23] Using Zustand stores
import { useRoutines, clearCurrentSession, hasCurrentSession, ensureCurrentSession } from "../../src/lib/stores";
import { setCurrentPlan } from "../../src/lib/workoutPlanStore";
import { makePlanFromRoutine } from "../../src/lib/workoutPlanModel";
import type { RoutineExercise } from "../../src/lib/routinesModel";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { ScreenHeader } from "../../src/ui/components/ScreenHeader";
import { useWorkoutDrawerStore } from "../../src/lib/stores/workoutDrawerStore";

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

export default function RoutinesHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const routines = useRoutines();

  function handleQuickStart(routine: { id: string; name: string; exercises: RoutineExercise[] }) {
    const hasActiveSession = hasCurrentSession();

    const startRoutine = () => {
      clearCurrentSession();

      const plan = makePlanFromRoutine({
        routineId: routine.id,
        routineName: routine.name,
        exercises: routine.exercises.map(toPlannedExercise),
      });

      setCurrentPlan(plan);

      // Set up session with routine exercises and open drawer
      const exerciseIds = routine.exercises.map(e => e.exerciseId);
      ensureCurrentSession({
        selectedExerciseId: exerciseIds[0] ?? null,
        exerciseBlocks: exerciseIds,
      });

      const { startWorkout } = useWorkoutDrawerStore.getState();
      startWorkout();
    };

    if (hasActiveSession) {
      Alert.alert(
        "Replace Current Workout?",
        "You have an active workout in progress. Starting this routine will replace it. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Start Routine",
            style: "destructive",
            onPress: startRoutine,
          },
        ]
      );
    } else {
      startRoutine();
    }
  }

  return (
    <ProtectedRoute>
      <Surface elevation="base" style={{ flex: 1 }}>
        <ScreenHeader
          title="Routines"
          rightAction={
            <Link href="/routines/create" asChild>
              <Pressable>
                <Text variant="label" color="accent">+ New</Text>
              </Pressable>
            </Link>
          }
        />
        <ScrollView contentContainerStyle={{ padding: space.componentLg, gap: space.componentMd, paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20 }}>

        {routines.length === 0 ? (
          <Text variant="body" color="muted">No routines yet. Tap &quot;+ New&quot;.</Text>
        ) : (
          routines.map((r) => (
            <Card
              key={r.id}
              style={{
                padding: space.componentMd,
                gap: space.componentSm,
              }}
            >
              {/* Main content - tap to view details */}
              <Link href={`/routines/${r.id}`} asChild>
                <Pressable style={{ gap: 6 }}>
                  <Text variant="h4">{r.name}</Text>
                  <Text variant="bodySmall" color="muted">
                    Exercises: {r.exercises.length} • Updated:{" "}
                    {new Date(r.updatedAtMs).toLocaleDateString()}
                  </Text>
                </Pressable>
              </Link>

              {/* Quick Start Button */}
              <Pressable
                onPress={() => handleQuickStart(r)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: corners.button,
                  backgroundColor: text.accent,
                  alignItems: "center",
                }}
              >
                <Text variant="label" color="inverse">Start Workout</Text>
              </Pressable>
            </Card>
          ))
        )}
        </ScrollView>
      </Surface>
    </ProtectedRoute>
  );
}
