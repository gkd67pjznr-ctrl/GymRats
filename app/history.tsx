import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { useThemeColors } from "../src/ui/theme";
import { useWorkoutSessions, hydrateWorkoutStore } from "../src/lib/workoutStore";
import { durationMs, formatDateShort, formatTimeShort, formatDuration } from "../src/lib/workoutModel";

export default function History() {
  const c = useThemeColors();
  const sessions = useWorkoutSessions();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hydrate workout data from AsyncStorage
    hydrateWorkoutStore()
      .catch((err) => {
        console.error('Failed to load workout history:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Show loading spinner while hydrating
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: c.bg, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color={c.text} />
        <Text style={{ color: c.muted, marginTop: 12, fontSize: 14 }}>
          Loading history...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <Text style={{ color: c.text, fontSize: 22, fontWeight: "900" }}>History</Text>

        {sessions.length === 0 ? (
          <Text style={{ color: c.muted }}>No workouts logged yet. Finish a workout to save it.</Text>
        ) : (
          sessions.map((s) => {
            const completionLabel = s.completionPct == null ? null : `${Math.round(s.completionPct * 100)}%`;

            return (
              <Link key={s.id} href={`/workout/${s.id}`} asChild>
                <Pressable
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
                    {s.routineName ? `Routine: ${s.routineName} • ` : ""}
                    Duration: {formatDuration(durationMs(s))} • Sets: {s.sets.length}
                    {completionLabel ? ` • ${completionLabel}` : ""}
                  </Text>
                </Pressable>
              </Link>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
