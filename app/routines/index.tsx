import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import { useThemeColors } from "../../src/ui/theme";
// [MIGRATED 2026-01-23] Using Zustand stores
import { useRoutines, clearCurrentSession, hasCurrentSession } from "../../src/lib/stores";
import { setCurrentPlan } from "../../src/lib/workoutPlanStore";
import { makePlanFromRoutine } from "../../src/lib/workoutPlanModel";
import type { RoutineExercise } from "../../src/lib/routinesModel";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { ScreenHeader } from "../../src/ui/components/ScreenHeader";

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
  const c = useThemeColors();
  const router = useRouter();
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
      router.replace("/live-workout");
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
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScreenHeader
          title="Routines"
          rightAction={
            <Link href="/routines/create" asChild>
              <Pressable>
                <Text style={{ color: c.primary, fontWeight: "700", fontSize: 15 }}>+ New</Text>
              </Pressable>
            </Link>
          }
        />
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>

        {routines.length === 0 ? (
          <Text style={{ color: c.muted }}>No routines yet. Tap &quot;+ New&quot;.</Text>
        ) : (
          routines.map((r) => (
            <View
              key={r.id}
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 14,
                backgroundColor: c.card,
                padding: 12,
                gap: 8,
              }}
            >
              {/* Main content - tap to view details */}
              <Link href={`/routines/${r.id}`} asChild>
                <Pressable style={{ gap: 6 }}>
                  <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>{r.name}</Text>
                  <Text style={{ color: c.muted }}>
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
                  borderRadius: 10,
                  backgroundColor: c.primary,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: c.border,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>Start Workout</Text>
              </Pressable>
            </View>
          ))
        )}
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}
