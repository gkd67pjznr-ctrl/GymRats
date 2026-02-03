import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useThemeColors } from "../../src/ui/theme";
// [MIGRATED 2026-01-23] Using Zustand stores
import { useWorkoutSessions } from "../../src/lib/stores";
import { durationMs, formatDateShort, formatTimeShort, formatDuration } from "../../src/lib/workoutModel";
import { EXERCISES_V1 } from "../../src/data/exercises";
import { kgToLb } from "../../src/lib/units";
import { ScreenHeader } from "../../src/ui/components/ScreenHeader";

function exerciseName(exerciseId: string) {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

export default function WorkoutDetail() {
  const c = useThemeColors();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const sessions = useWorkoutSessions();

  const session = sessions.find((s) => s.id === String(sessionId));

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, padding: 16 }}>
        <Text style={{ color: c.text, fontWeight: "900" }}>Workout not found.</Text>
      </View>
    );
  }

  // group sets by exercise in order they appear
  const groups: { exerciseId: string; sets: typeof session.sets }[] = [];
  for (const set of session.sets) {
    const last = groups[groups.length - 1];
    if (!last || last.exerciseId !== set.exerciseId) {
      groups.push({ exerciseId: set.exerciseId, sets: [set] });
    } else {
      last.sets.push(set);
    }
  }

  const completionLabel =
    session.completionPct == null ? null : `${Math.round(session.completionPct * 100)}% plan completion`;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScreenHeader title="Workout Detail" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}>
        <Text style={{ color: c.muted, fontSize: 14, fontWeight: "600" }}>
          {formatDateShort(session.startedAtMs)} • {formatTimeShort(session.startedAtMs)}
        </Text>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12, gap: 6 }}>
          <Text style={{ color: c.text, fontWeight: "900" }}>
            {session.routineName ? `Routine: ${session.routineName}` : "Free Workout"}
          </Text>
          <Text style={{ color: c.muted }}>
            Duration: {formatDuration(durationMs(session))} • Sets: {session.sets.length}
          </Text>
          {!!completionLabel && <Text style={{ color: c.muted }}>{completionLabel}</Text>}
        </View>

        {groups.map((g, idx) => (
          <View
            key={`${g.exerciseId}-${idx}`}
            style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12, gap: 8 }}
          >
            <Text style={{ color: c.text, fontWeight: "900" }}>{exerciseName(g.exerciseId)}</Text>
            {g.sets.map((s, i) => (
              <Text key={s.id} style={{ color: c.muted }}>
                {i + 1}. {kgToLb(s.weightKg).toFixed(0)} lb x {s.reps}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
