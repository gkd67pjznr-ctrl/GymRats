/**
 * WorkoutHeader Component
 *
 * Displays workout title, stats, and progress bar for planned workouts.
 *
 * Extracted from live-workout.tsx to reduce component complexity.
 */

import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FR } from "@/src/ui/GrStyle";
import { useThemeColors } from "@/src/ui/theme";
import type { WorkoutPlan } from "@/src/lib/workoutPlanModel";
import type { LoggedSet } from "@/src/lib/loggerTypes";
import { calculatePlanProgress, formatProgressPercent } from "@/src/lib/utils/routineProgress";

export interface WorkoutHeaderProps {
  plan: WorkoutPlan | null;
  sets: LoggedSet[];
  focusMode: boolean;
}

export function WorkoutHeader({ plan, sets, focusMode }: WorkoutHeaderProps) {
  const c = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const CARD_R = FR.radius.card;

  const planMode = !!plan && plan.exercises.length > 0;
  const progress = calculatePlanProgress(plan, sets);

  return (
    <View style={{ gap: FR.space.x3 }}>
      {/* Back button row */}
      <View style={{ paddingTop: insets.top * 0.5, flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            padding: 4,
          })}
        >
          <Ionicons name="chevron-back" size={28} color={c.text} />
        </Pressable>
      </View>

      {/* Main header card */}
      <View
        style={{
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.card,
          borderRadius: CARD_R,
          padding: FR.space.x4,
          gap: FR.space.x2,
        }}
      >
        <Text style={{ color: c.text, ...FR.type.h2 }}>
          {planMode ? plan?.routineName ?? "Planned Workout" : "Free Workout"}
        </Text>
      <Text style={{ color: c.muted, ...FR.type.sub }}>
        Sets logged: {sets.length} • Focus: {focusMode ? "On" : "Off"}
      </Text>

      {/* Progress bar for planned workouts */}
      {planMode && progress.total > 0 && (
        <View style={{ marginTop: FR.space.x1, gap: FR.space.x1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: c.muted, ...FR.type.sub }}>
              Progress
            </Text>
            <Text style={{ color: c.text, ...FR.type.sub, fontWeight: "900" }}>
              {progress.completed}/{progress.total} sets ({formatProgressPercent(progress.percent)})
            </Text>
          </View>
          <View
            style={{
              height: 6,
              backgroundColor: c.bg,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${Math.min(progress.percent, 1) * 100}%`,
                backgroundColor: c.success,
                borderRadius: 3,
              }}
            />
          </View>
        </View>
      )}
      </View>
    </View>
  );
}
