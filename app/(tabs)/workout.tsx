// app/(tabs)/workout.tsx
import { Pressable, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";
import { useThemeColors } from "../../src/ui/theme";

export default function WorkoutTab() {
  const c = useThemeColors();

  const BigButton = (props: { title: string; subtitle: string; href: string }) => (
    <Link href={props.href as any} asChild>
      <Pressable
        style={{
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 16,
          padding: 16,
          backgroundColor: c.card,
          gap: 6,
        }}
      >
        <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>{props.title}</Text>
        <Text style={{ color: c.muted, lineHeight: 18 }}>{props.subtitle}</Text>
      </Pressable>
    </Link>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ color: c.text, fontSize: 26, fontWeight: "900" }}>Workout</Text>
      <Text style={{ color: c.muted, lineHeight: 18 }}>
        Start a session, log sets, and come back anytime. (Persistent session behavior is next.)
      </Text>

      <BigButton
        title="Open Live Workout"
        subtitle="Log sets, cues, PRs, rest timer. (Current session screen)"
        href="/live-workout"
      />

      <View style={{ height: 6 }} />

      <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Shortcuts</Text>

      <BigButton title="Start From a Routine" subtitle="Pick a routine and begin." href="/workout/start" />
      <BigButton title="Routines" subtitle="Build routines and targets." href="/routines" />
      <BigButton title="History" subtitle="Review past sessions and stats." href="/history" />
    </ScrollView>
  );
}
