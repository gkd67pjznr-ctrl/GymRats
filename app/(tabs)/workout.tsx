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
    emoji?: string;
    color?: string;
  }) => {
    const inner = (
      <View
        style={{
          borderWidth: 1,
          borderColor: props.color || c.border,
          borderRadius: 16,
          padding: 16,
          backgroundColor: c.card,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
            {props.emoji && <Text style={{ fontSize: 24 }}>{props.emoji}</Text>}
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "900", flex: 1 }}>{props.title}</Text>
          </View>
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
        Start a free workout, follow a premade plan, or build your own routine.
      </Text>

      {/* Main Action */}
      <BigButton
        title={hasSession ? "Resume Workout" : "Start Workout"}
        subtitle={
          hasSession
            ? `Current session has ${setCount} set${setCount === 1 ? "" : "s"} logged.`
            : "Start a free workout session."
        }
        rightBadge={hasSession ? `${setCount} sets` : undefined}
        onPress={startOrResume}
      />

      <View style={{ height: 6 }} />

      {/* NEW: Browse Plans Section */}
      <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Premade Plans</Text>

      <BigButton
        emoji="📚"
        title="Browse Plans"
        subtitle="Explore curated workout plans across 5 categories."
        href="/workout/browse-plans"
        color="#4ECDC4"
      />

      <BigButton
        emoji="🤖"
        title="AI Generator"
        subtitle="Create a custom plan tailored to your goals."
        href="/workout/ai-generate"
        color="#9B59B6"
      />

      <View style={{ height: 6 }} />

      <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>My Workouts</Text>

      <BigButton 
        title="Start From a Routine" 
        subtitle="Pick a saved routine and begin." 
        href="/workout/start" 
      />
      
      <BigButton 
        title="Routines" 
        subtitle="Build and manage your workout routines." 
        href="/routines" 
      />
      
      <BigButton 
        title="History" 
        subtitle="Review past sessions and stats." 
        href="/history" 
      />
    </ScrollView>
  );
}
