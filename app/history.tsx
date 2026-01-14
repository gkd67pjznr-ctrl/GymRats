import { View, Text, ScrollView } from "react-native";
import { useThemeColors } from "../src/ui/theme";
import { useWorkoutSessions } from "../src/lib/workoutStore";
import { durationMs, formatDateShort, formatTimeShort, formatDuration } from "../src/lib/workoutModel";

export default function History() {
  const c = useThemeColors();
  const sessions = useWorkoutSessions();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: c.text, fontSize: 22, fontWeight: "900" }}>History</Text>

        {sessions.length === 0 ? (
          <Text style={{ color: c.muted }}>No workouts logged yet. Finish a workout to save it.</Text>
        ) : (
          sessions.map((s) => (
            <View
              key={s.id}
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 14,
                backgroundColor: c.card,
                padding: 12,
                gap: 6,
              }}
            >
              <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>
                {formatDateShort(s.startedAtMs)} • {formatTimeShort(s.startedAtMs)}
              </Text>

              <Text style={{ color: c.muted }}>
                Duration: {formatDuration(durationMs(s))} • Sets: {s.sets.length}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
