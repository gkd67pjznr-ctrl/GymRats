import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { useThemeColors } from "../src/ui/theme";
// [MIGRATED 2026-01-23] Using Zustand stores (auto-hydration, no manual hydrate needed)
import { useWorkoutSessions } from "../src/lib/stores";
import { durationMs, formatDateShort, formatTimeShort, formatDuration } from "../src/lib/workoutModel";
import { ProtectedRoute } from "../src/ui/components/ProtectedRoute";
import { ScreenHeader } from "../src/ui/components/ScreenHeader";

export default function History() {
  const c = useThemeColors();
  const sessions = useWorkoutSessions();
  // Zustand auto-hydrates, but we can check hydration state if needed
  const [isLoading, setIsLoading] = useState(false); // Zustand hydrates synchronously from persist

  // With Zustand persist middleware, hydration is automatic
  // No manual hydration needed

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
    <ProtectedRoute>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScreenHeader title="History" />
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>

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
    </ProtectedRoute>
  );
}
