import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useThemeColors } from "../../../src/ui/theme";
import { FR } from "../../../src/ui/GrStyle";
import { usePlan, hydratePremadePlansStore } from "../../../src/lib/premadePlans/store";
import { startPremadePlan, formatProgress } from "../../../src/lib/premadePlans/planToRoutine";
import { setCurrentPlan } from "../../../src/lib/workoutPlanStore";
import { makePlanFromRoutine } from "../../../src/lib/workoutPlanModel";
import { EXERCISES_V1 } from "../../../src/data/exercises";
import { makeDesignSystem } from "../../../src/ui/designSystem";
import { getCategoryInfo } from "../../../src/lib/premadePlans/categories";
import { ScreenHeader } from "../../../src/ui/components/ScreenHeader";
import { TAB_BAR_HEIGHT } from "../../../src/ui/components/PersistentTabBar";
import { useWorkoutDrawerStore } from "../../../src/lib/stores/workoutDrawerStore";
import { ensureCurrentSession } from "../../../src/lib/stores/currentSessionStore";

/**
 * Plan Detail Screen
 * 
 * Shows:
 * - Plan info (duration, frequency, difficulty)
 * - Exercise list with sets/reps
 * - "Start Plan" button
 */
export default function PlanDetail() {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  const plan = usePlan(id as string);

  useEffect(() => {
    hydratePremadePlansStore()
      .catch((err) => console.error("Failed to load plan:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleStartPlan = () => {
    if (!plan) return;

    Alert.alert(
      "Start Plan?",
      `This will create "${plan.name}" in your routines and track your progress.\n\nDuration: ${plan.durationWeeks} weeks\nFrequency: ${plan.daysPerWeek}x per week`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start",
          onPress: async () => {
            setIsStarting(true);

            try {
              // Convert to routine and start tracking
              const { routine, progress } = startPremadePlan(plan);

              // Set as current plan for live workout
              const workoutPlan = makePlanFromRoutine({
                routineId: routine.id,
                routineName: routine.name,
                exercises: routine.exercises.map((ex) => ({
                  exerciseId: ex.exerciseId,
                  targetSets: ex.targetSets,
                  targetRepsMin: ex.targetRepsMin,
                  targetRepsMax: ex.targetRepsMax,
                })),
              });

              setCurrentPlan(workoutPlan);

              const formatted = formatProgress(progress);

              Alert.alert(
                "Plan Started!",
                `"${routine.name}" is now in your routines.\n\n${formatted.displayText}\n\nReady to start your first workout?`,
                [
                  {
                    text: "View Routines",
                    onPress: () => router.push("/routines" as Href),
                  },
                  {
                    text: "Start Workout",
                    onPress: () => {
                      // Set up session with plan exercises and open drawer
                      const exerciseIds = routine.exercises.map(e => e.exerciseId);
                      ensureCurrentSession({
                        selectedExerciseId: exerciseIds[0] ?? null,
                        exerciseBlocks: exerciseIds,
                      });
                      const { startWorkout } = useWorkoutDrawerStore.getState();
                      startWorkout();
                    },
                  },
                ]
              );
            } catch (err) {
              console.error("Failed to start plan:", err);
              Alert.alert("Error", "Failed to start plan. Please try again.");
            } finally {
              setIsStarting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={c.text} />
        <Text style={{ color: c.muted, marginTop: 12, fontSize: 14 }}>Loading plan...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: c.text, ...FR.type.h2, marginBottom: 12 }}>Plan not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: c.muted }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const categoryInfo = getCategoryInfo(plan.category);
  const totalDays = plan.durationWeeks * plan.daysPerWeek;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "#4ECDC4";
      case "intermediate": return "#FFA07A";
      case "advanced": return "#FF6B6B";
      default: return c.muted;
    }
  };

  const getExerciseName = (id: string) => {
    return EXERCISES_V1.find(e => e.id === id)?.name || id;
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScreenHeader title={plan.name ?? "Plan Detail"} />
      <ScrollView contentContainerStyle={{
        paddingTop: FR.space.x4,
        paddingHorizontal: FR.space.x4,
        paddingBottom: 100 + insets.bottom + TAB_BAR_HEIGHT,
        gap: FR.space.x4,
      }}>
        {/* Header */}
        <View style={{ gap: FR.space.x2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x3 }}>
            <Text style={{ fontSize: 48 }}>{categoryInfo.icon}</Text>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  paddingHorizontal: FR.space.x2,
                  paddingVertical: FR.space.x1,
                  borderRadius: FR.radius.pill,
                  backgroundColor: getDifficultyColor(plan.difficulty) + "20",
                  alignSelf: "flex-start",
                  marginTop: FR.space.x1,
                }}
              >
                <Text
                  style={{
                    color: getDifficultyColor(plan.difficulty),
                    fontSize: 11,
                    fontWeight: "900",
                    textTransform: "uppercase",
                  }}
                >
                  {plan.difficulty}
                </Text>
              </View>
            </View>
          </View>

          <Text style={{ color: c.muted, ...FR.type.body }}>{plan.description}</Text>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: FR.radius.card,
              padding: FR.space.x3,
              alignItems: "center",
            }}
          >
            <Text style={{ color: c.muted, ...FR.type.sub }}>Duration</Text>
            <Text style={{ color: c.text, ...FR.type.h2 }}>{plan.durationWeeks}</Text>
            <Text style={{ color: c.muted, ...FR.type.sub }}>weeks</Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: FR.radius.card,
              padding: FR.space.x3,
              alignItems: "center",
            }}
          >
            <Text style={{ color: c.muted, ...FR.type.sub }}>Frequency</Text>
            <Text style={{ color: c.text, ...FR.type.h2 }}>{plan.daysPerWeek}x</Text>
            <Text style={{ color: c.muted, ...FR.type.sub }}>per week</Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: FR.radius.card,
              padding: FR.space.x3,
              alignItems: "center",
            }}
          >
            <Text style={{ color: c.muted, ...FR.type.sub }}>Total</Text>
            <Text style={{ color: c.text, ...FR.type.h2 }}>{totalDays}</Text>
            <Text style={{ color: c.muted, ...FR.type.sub }}>workouts</Text>
          </View>
        </View>

        {/* Exercises */}
        <View style={{ gap: FR.space.x2 }}>
          <Text style={{ color: c.text, ...FR.type.h3 }}>Exercises ({plan.exercises.length})</Text>

          {plan.exercises.map((ex, idx) => (
            <View
              key={idx}
              style={{
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: FR.radius.card,
                padding: FR.space.x3,
                gap: FR.space.x1,
              }}
            >
              <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>
                {idx + 1}. {getExerciseName(ex.exerciseId)}
              </Text>
              <Text style={{ color: c.muted, ...FR.type.sub }}>
                {ex.targetSets} sets × {ex.targetRepsMin}-{ex.targetRepsMax} reps
                {ex.restSeconds && ` • ${ex.restSeconds}s rest`}
              </Text>
              {ex.notes && (
                <Text style={{ color: c.muted, ...FR.type.sub, fontStyle: "italic" }}>
                  💡 {ex.notes}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Tags */}
        {plan.tags.length > 0 && (
          <View style={{ gap: FR.space.x2 }}>
            <Text style={{ color: c.text, ...FR.type.h3 }}>Tags</Text>
            <View style={{ flexDirection: "row", gap: FR.space.x2, flexWrap: "wrap" }}>
              {plan.tags.map((tag, idx) => (
                <View
                  key={idx}
                  style={{
                    paddingHorizontal: FR.space.x3,
                    paddingVertical: FR.space.x2,
                    borderRadius: FR.radius.pill,
                    backgroundColor: c.card,
                    borderWidth: 1,
                    borderColor: c.border,
                  }}
                >
                  <Text style={{ color: c.text, fontSize: 12 }}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Source Info */}
        {plan.source === "ai-generated" && (
          <View
            style={{
              backgroundColor: "#9B59B620",
              borderWidth: 1,
              borderColor: "#9B59B6",
              borderRadius: FR.radius.card,
              padding: FR.space.x3,
            }}
          >
            <Text style={{ color: "#9B59B6", ...FR.type.sub }}>
              🤖 AI Generated Plan • {plan.aiModel || "Claude"}
            </Text>
          </View>
        )}

        {plan.authorName && plan.source === "curated" && (
          <View
            style={{
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: FR.radius.card,
              padding: FR.space.x3,
            }}
          >
            <Text style={{ color: c.muted, ...FR.type.sub }}>
              ✍️ Curated by {plan.authorName}
            </Text>
          </View>
        )}

        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            paddingVertical: FR.space.x3,
            borderRadius: FR.radius.button,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: "center",
            opacity: pressed ? ds.rules.tapOpacity : 1,
          })}
        >
          <Text style={{ color: c.text, ...FR.type.body }}>Back</Text>
        </Pressable>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + TAB_BAR_HEIGHT,
          left: 0,
          right: 0,
          padding: FR.space.x4,
          backgroundColor: c.bg,
          borderTopWidth: 1,
          borderTopColor: c.border,
        }}
      >
        <Pressable
          onPress={handleStartPlan}
          disabled={isStarting}
          style={({ pressed }) => ({
            paddingVertical: FR.space.x4,
            borderRadius: FR.radius.button,
            backgroundColor: categoryInfo.color,
            alignItems: "center",
            opacity: pressed || isStarting ? ds.rules.tapOpacity : 1,
          })}
        >
          {isStarting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={{ color: "#000", ...FR.type.h3, fontWeight: "900" }}>
              Start Plan
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
