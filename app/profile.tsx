import { View, Text } from "react-native";
import { useThemeColors } from "../src/ui/theme";
import { useWorkoutSessions } from "../src/lib/workoutStore";

export default function Profile() {
  const c = useThemeColors();
  const sessions = useWorkoutSessions();

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
