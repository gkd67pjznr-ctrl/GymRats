import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useThemeColors } from "../../../src/ui/theme";
import { useWorkoutSessions } from "../../../src/lib/workoutStore";
import { startOfDayMs, formatDateShort, formatTimeShort, formatDuration, durationMs } from "../../../src/lib/workoutModel";
import { EXERCISES_V1 } from "../../../src/data/exercises";

function exerciseName(exerciseId: string) {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

function kgToLb(kg: number) {
  return kg * 2.2046226218;
}

export default function DayDetail() {
  const c = useThemeColors();
  const { dayMs } = useLocalSearchParams<{ dayMs: string }>();

  const day = Number(dayMs);
  const sessions = useWorkoutSessions();

  const dayStart = startOfDayMs(day);
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;

  const todays = sessions.filter((s) => s.startedAtMs >= dayStart && s.startedAtMs < dayEnd);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: c.text, fontSize: 22, fontWeight: "900" }}>
          {formatDateShort(dayStart)}
        </Text>

        {todays.length === 0 ? (
          <Text style={{ color: c.muted }}>No workouts logged this day.</Text>
        ) : (
          todays.map((s) => (
            <View
              key={s.id}
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
                {formatTimeShort(s.startedAtMs)} • {formatDuration(durationMs(s))} • {s.sets.length} sets
              </Text>

              <View style={{ gap: 6 }}>
                {s.sets.map((set, i) => (
                  <Text key={set.id} style={{ color: c.muted }}>
                    {i + 1}. {exerciseName(set.exerciseId)} — {kgToLb(set.weightKg).toFixed(0)} lb x {set.reps}
                  </Text>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
