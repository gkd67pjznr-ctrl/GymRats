import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useThemeColors } from "../src/ui/theme";
// [MIGRATED 2026-01-23] Using Zustand stores (auto-hydration, no manual hydrate needed)
import { useWorkoutSessions } from "../src/lib/stores";

export default function Profile() {
  const c = useThemeColors();
  const sessions = useWorkoutSessions();
  const [isLoading, setIsLoading] = useState(true);

  // Zustand auto-hydrates, so we just set loading to false on mount
  useEffect(() => {
    setIsLoading(false);
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
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 16, gap: 12 }}>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: "900" }}>Profile</Text>

      <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.card, padding: 12, gap: 6 }}>
        <Text style={{ color: c.text, fontWeight: "900" }}>Stats (v1)</Text>
        <Text style={{ color: c.muted }}>Workouts logged: {sessions.length}</Text>
        <Text style={{ color: c.muted }}>Next: lifetime PRs, per-lift rank summary, badges.</Text>
      </View>
    </View>
  );
}
