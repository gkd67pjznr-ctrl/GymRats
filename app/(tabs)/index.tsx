// app/(tabs)/index.tsx
import { ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";
import { useThemeColors } from "../../src/ui/theme";

export default function HomeTab() {
  const c = useThemeColors();

  const CardLink = (props: { href: string; title: string; subtitle: string }) => (
    <Link href={props.href as any} asChild>
      <View
        style={{
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 14,
          padding: 14,
          backgroundColor: c.card,
          gap: 6,
        }}
      >
        <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>{props.title}</Text>
        <Text style={{ color: c.muted, lineHeight: 18 }}>{props.subtitle}</Text>
      </View>
    </Link>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ color: c.text, fontSize: 28, fontWeight: "900" }}>Forgerank</Text>
      <Text style={{ color: c.muted, lineHeight: 19 }}>
        Verified ranks. Real feedback. No fake leaderboards.
      </Text>

      <CardLink href="/live-workout" title="Resume / Start Workout" subtitle="Jump into your current session." />
      <CardLink href="/routines" title="Routines" subtitle="Build routines and targets." />
      <CardLink href="/exercises" title="Exercise DB" subtitle="Browse exercises + your ranks (soon)." />

      <View style={{ height: 6 }} />

      <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Utilities</Text>
      <CardLink href="/calendar" title="Calendar" subtitle="Month grid + highlighted workout days." />
      <CardLink href="/history" title="History" subtitle="Workout sessions by day, time, duration." />
      <CardLink href="/settings" title="Settings" subtitle="Toggle haptics & sounds." />
    </ScrollView>
  );
}
