import { ScrollView, Text, View, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemeColors } from "../../../src/ui/theme";
import { EXERCISES_V1 } from "../../../src/data/exercises";
import { uid, type RoutineExercise } from "../../../src/lib/routinesModel";
// [MIGRATED 2026-01-23] Using Zustand stores
import { upsertRoutine, useRoutine } from "../../../src/lib/stores";

export default function AddExerciseToRoutine() {
  const c = useThemeColors();
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();

  const routine = useRoutine(String(routineId));

  if (!routine) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, padding: 16 }}>
        <Text style={{ color: c.text, fontWeight: "900" }}>Routine not found.</Text>
      </View>
    );
  }

  function add(exerciseId: string) {
    if (!routine) return; // [FIX 2026-01-23]
    const rx: RoutineExercise = {
      id: uid(),
      exerciseId,
      targetSets: 3,
      targetRepsMin: 6,
      targetRepsMax: 12,
    };

    upsertRoutine({
      ...routine,
      exercises: [...routine.exercises, rx],
      updatedAtMs: Date.now(),
    });

    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}>
        <Text style={{ color: c.text, fontSize: 22, fontWeight: "900" }}>Add Exercise</Text>
        <Text style={{ color: c.muted }}>Tap one to add to: {routine.name}</Text>

        {EXERCISES_V1.map((e) => (
          <Pressable
            key={e.id}
            onPress={() => add(e.id)}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900" }}>{e.name}</Text>
            <Text style={{ color: c.muted }}>{e.id}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
