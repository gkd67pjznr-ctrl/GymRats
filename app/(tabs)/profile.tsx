// app/(tabs)/profile.tsx
import { ScrollView, Text, View } from "react-native";
import { useThemeColors } from "../../src/ui/theme";

export default function ProfileTab() {
  const c = useThemeColors();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      <Text style={{ color: c.text, fontSize: 26, fontWeight: "900" }}>Profile</Text>

      <Text style={{ color: c.muted, lineHeight: 18 }}>
        Your training history, stats, and progress over time.
      </Text>

      {/* Calendar placeholder */}
      <View
        style={{
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 14,
          padding: 16,
          backgroundColor: c.card,
          gap: 8,
        }}
      >
        <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>
          Workout Calendar
        </Text>
        <Text style={{ color: c.muted, lineHeight: 18 }}>
          This calendar will highlight the days you trained.
        </Text>
        <Text style={{ color: c.muted, lineHeight: 18 }}>
          In the future, each day can show the workout title or small muscle indicators.
        </Text>
      </View>

      {/* Stats placeholder */}
      <View
        style={{
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 14,
          padding: 16,
          backgroundColor: c.card,
          gap: 8,
        }}
      >
        <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>
          Stats & Ranks
        </Text>
        <Text style={{ color: c.muted, lineHeight: 18 }}>
          Lifetime PRs, ranks, streaks, and training volume will live here.
        </Text>
      </View>
    </ScrollView>
  );
}
