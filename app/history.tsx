import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import { Surface, Text, Card, surface, text, space } from "@/src/design";
// [MIGRATED 2026-01-23] Using Zustand stores (auto-hydration, no manual hydrate needed)
import { useWorkoutSessions } from "../src/lib/stores";
import { durationMs, formatDateShort, formatTimeShort, formatDuration } from "../src/lib/workoutModel";
import { ProtectedRoute } from "../src/ui/components/ProtectedRoute";
import { ScreenHeader } from "../src/ui/components/ScreenHeader";

export default function History() {
  const sessions = useWorkoutSessions();
  // Zustand auto-hydrates, but we can check hydration state if needed
  const [isLoading] = useState(false); // Zustand hydrates synchronously from persist

  // With Zustand persist middleware, hydration is automatic
  // No manual hydration needed

  // Show loading spinner while hydrating
  if (isLoading) {
    return (
      <Surface elevation="base" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={text.primary} />
        <Text variant="bodySmall" color="muted" style={{ marginTop: 12 }}>
          Loading history...
        </Text>
      </Surface>
    );
  }

  return (
    <ProtectedRoute>
      <Surface elevation="base" style={{ flex: 1 }}>
        <ScreenHeader title="History" />
        <ScrollView contentContainerStyle={{ padding: space.componentLg, gap: space.componentMd, paddingBottom: 40 }}>

        {sessions.length === 0 ? (
          <Text variant="body" color="muted">No workouts logged yet. Finish a workout to save it.</Text>
        ) : (
          sessions.map((s) => {
            const completionLabel = s.completionPct == null ? null : `${Math.round(s.completionPct * 100)}%`;

            return (
              <Link key={s.id} href={`/workout/${s.id}`} asChild>
                <Pressable>
                  <Card style={{ padding: space.componentMd, gap: 6 }}>
                    <Text variant="h4">
                      {formatDateShort(s.startedAtMs)} • {formatTimeShort(s.startedAtMs)}
                    </Text>

                    <Text variant="bodySmall" color="muted">
                      {s.routineName ? `Routine: ${s.routineName} • ` : ""}
                      Duration: {formatDuration(durationMs(s))} • Sets: {s.sets.length}
                      {completionLabel ? ` • ${completionLabel}` : ""}
                    </Text>
                  </Card>
                </Pressable>
              </Link>
            );
          })
        )}
        </ScrollView>
      </Surface>
    </ProtectedRoute>
  );
}
