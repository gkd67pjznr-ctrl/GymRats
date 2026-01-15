// app/(tabs)/workout.tsx
import { Pressable, ScrollView, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useThemeColors } from "../../src/ui/theme";
import { EXERCISES_V1 } from "../../src/data/exercises";
import {
  ensureCurrentSession,
  useCurrentSession,
} from "../../src/lib/currentSessionStore";

export default function WorkoutTab() {
  const c = useThemeColors();
  const router = useRouter();

  const session = useCurrentSession();
  const hasSession = !!session;
  const setCount = session?.sets?.length ?? 0;

  const BigButton = (props: {
    title: string;
    subtitle: string;
    onPress?: () => void;
    href?: string;
    rightBadge?: string;
  }) => {
    const inner = (
      <View
        style={{
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 16,
          padding: 16,
          backgroundColor: c.card,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>{props.title}</Text>
          {!!props.rightBadge && (
            <View
              style={{
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.bg,
              }}
            >
              <Text style={{ color: c.text, fontWeight: "900", fontSize: 12 }}>{props.rightBadge}</Text>
            </View>
          )}
        </View>
        <Text style={{ color: c.muted, lineHeight: 18 }}>{props.subtitle}</Text>
      </View>
    );

    if (props.href) {
      return (
        <Link href={props.href as any} asChild>
          <Pressable>{inner}</Pressable>
        </Link>
      );
    }

    return <Pressable onPress={props.onPress}>{inner}</Pressable>;
  };

  function startOrResume() {
    // If none exists, create a lightweight session now.
    if (!hasSession) {
      const firstExerciseId = EXERCISES_V1[0]?.id ?? null;
      ensureCurrentSession({
        selectedExerciseId: firstExerciseId,
        exerciseBlocks: firstExerciseId ? [firstExerciseId] : [],
      });
    }
    router.push("/live-workout");
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ color: c.text, fontSize: 26, fontWeight: "900" }}>Workout</Text>
      <Text style={{ color: c.muted, lineHeight: 18 }}>
        Start a session, log sets, and come back anytime. (We’ll wire Live Workout to this persistent session next.)
      </Text>

      <BigButton
        title={hasSession ? "Resume Workout" : "Start Workout"}
        subtitle={
          hasSession
            ? `Current session has ${setCount} set${setCount === 1 ? "" : "s"} logged.`
            : "Creates a session and opens Live Workout."
        }
        rightBadge={hasSession ? `${setCount} sets` : undefined}
        onPress={startOrResume}
      />

      <View style={{ height: 6 }} />

      <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Shortcuts</Text>

      <BigButton title="Start From a Routine" subtitle="Pick a routine and begin." href="/workout/start" />
      <BigButton title="Routines" subtitle="Build routines and targets." href="/routines" />
      <BigButton title="History" subtitle="Review past sessions and stats." href="/history" />
    </ScrollView>
  );
}
