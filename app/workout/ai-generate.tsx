import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { getCategoryInfo } from "../../src/lib/premadePlans/categories";
import type { PlanCategory, PlanDifficulty } from "../../src/lib/premadePlans/types";
import { useAIGeneratePlan } from "../../src/lib/premadePlans/useAIGeneratePlan";
import { makeDesignSystem } from "../../src/ui/designSystem";
import { FR } from "../../src/ui/forgerankStyle";
import { useThemeColors, useThemeRadius } from "../../src/ui/theme";

/**
 * AI Plan Generator
 * 
 * Let users create custom workout plans using AI
 * Fills out form → AI generates plan → Saved to their plans
 */
export default function AIGeneratePlan() {
  const c = useThemeColors();
  const r = useThemeRadius();
  const ds = makeDesignSystem("dark", "toxic");
  const router = useRouter();
  const { generatePlan, state, isLoading } = useAIGeneratePlan();

  // Form state
  const [category, setCategory] = useState<PlanCategory>("strength");
  const [difficulty, setDifficulty] = useState<PlanDifficulty>("intermediate");
  const [daysPerWeek, setDaysPerWeek] = useState("4");
  const [durationWeeks, setDurationWeeks] = useState("8");
  const [goals, setGoals] = useState("");
  const [equipment, setEquipment] = useState("");
  const [injuries, setInjuries] = useState("");

  // Check if we're in native app (not web)
  const isNativeApp = typeof navigator !== 'undefined' && 
  (navigator.product === 'ReactNative' || typeof window === 'undefined');

  const categories: PlanCategory[] = ["bodybuilding", "calisthenics", "cardio", "core", "strength"];
  const difficulties: PlanDifficulty[] = ["beginner", "intermediate", "advanced"];

// Show "web only" message for native apps
if (isNativeApp) {
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: FR.space.x4, gap: FR.space.x4 }}>
        <View style={{ gap: FR.space.x2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x3 }}>
            <Text style={{ fontSize: 48 }}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, ...FR.type.h1 }}>AI Generator</Text>
              <Text style={{ color: "#9B59B6", ...FR.type.body, fontWeight: "700" }}>
                Web Only Feature
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#9B59B620",
            borderWidth: 1,
            borderColor: "#9B59B6",
            borderRadius: FR.radius.card,
            padding: FR.space.x3,
            gap: FR.space.x2,
          }}
        >
          <Text style={{ color: "#9B59B6", ...FR.type.body, fontWeight: "700" }}>
            ℹ️ Note
          </Text>
          <Text style={{ color: c.text, ...FR.type.body }}>
            AI plan generation is currently only available in the web version of Forgerank.
          </Text>
          <Text style={{ color: c.muted, ...FR.type.sub, marginTop: FR.space.x2 }}>
            For now, you can browse our 10 curated plans or use the dev tools to create custom plans.
          </Text>
        </View>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            paddingVertical: FR.space.x3,
            borderRadius: r.button,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: "center",
            opacity: pressed ? ds.rules.tapOpacity : 1,
          })}
        >
          <Text style={{ color: c.text, ...FR.type.body }}>Back to Plans</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// Original form continues below for web users
    const handleGenerate = async () => {
    const daysNum = parseInt(daysPerWeek);
    const weeksNum = parseInt(durationWeeks);

    if (!daysNum || daysNum < 1 || daysNum > 7) {
      Alert.alert("Error", "Days per week must be between 1-7");
      return;
    }

    if (!weeksNum || weeksNum < 1 || weeksNum > 52) {
      Alert.alert("Error", "Duration must be between 1-52 weeks");
      return;
    }

    try {
      const plan = await generatePlan({
        category,
        difficulty,
        daysPerWeek: daysNum,
        durationWeeks: weeksNum,
        goals: goals.trim() || undefined,
        equipment: equipment.trim() ? equipment.split(",").map(e => e.trim()) : undefined,
        injuries: injuries.trim() || undefined,
      });

      Alert.alert(
        "Plan Generated! 🎉",
        `"${plan.name}" has been created and saved to your ${getCategoryInfo(category).name} plans.`,
        [
          {
            text: "View Plan",
            onPress: () => router.replace(`/workout/plan-detail/${plan.id}` as any),
          },
          {
            text: "Generate Another",
            style: "cancel",
          },
        ]
      );
    } catch (err) {
      console.error("Generation failed:", err);
      Alert.alert("Error", "Failed to generate plan. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: FR.space.x4, gap: FR.space.x4, paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ gap: FR.space.x2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x3 }}>
            <Text style={{ fontSize: 48 }}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, ...FR.type.h1 }}>AI Generator</Text>
              <Text style={{ color: "#9B59B6", ...FR.type.body, fontWeight: "700" }}>
                Custom workout plans
              </Text>
            </View>
          </View>
          <Text style={{ color: c.muted, ...FR.type.sub }}>
            Fill out the form below and AI will create a personalized workout plan tailored to your goals
          </Text>
        </View>

        {/* Category */}
        <View style={{ gap: FR.space.x2 }}>
          <Text style={{ color: c.text, ...FR.type.h3 }}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
              {categories.map(cat => {
                const info = getCategoryInfo(cat);
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={({ pressed }) => ({
                      paddingVertical: FR.space.x2,
                      paddingHorizontal: FR.space.x3,
                      borderRadius: FR.radius.pill,
                      borderWidth: 2,
                      borderColor: category === cat ? info.color : c.border,
                      backgroundColor: category === cat ? info.color + "20" : c.card,
                      opacity: pressed ? ds.rules.tapOpacity : 1,
                    })}
                  >
                    <Text style={{ color: c.text, ...FR.type.body, fontWeight: category === cat ? "900" : "400" }}>
                      {info.icon} {info.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Difficulty */}
        <View style={{ gap: FR.space.x2 }}>
          <Text style={{ color: c.text, ...FR.type.h3 }}>Difficulty</Text>
          <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
            {difficulties.map(diff => (
              <Pressable
                key={diff}
                onPress={() => setDifficulty(diff)}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: FR.space.x3,
                  borderRadius: r.button,
                  borderWidth: 2,
                  borderColor: difficulty === diff ? c.text : c.border,
                  backgroundColor: difficulty === diff ? c.bg : c.card,
                  alignItems: "center",
                  opacity: pressed ? ds.rules.tapOpacity : 1,
                })}
              >
                <Text style={{ color: c.text, ...FR.type.body, fontWeight: difficulty === diff ? "900" : "400" }}>
                  {diff}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Duration & Frequency */}
        <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
          <View style={{ flex: 1, gap: FR.space.x2 }}>
            <Text style={{ color: c.text, ...FR.type.h3 }}>Duration (weeks)</Text>
            <TextInput
              value={durationWeeks}
              onChangeText={setDurationWeeks}
              keyboardType="number-pad"
              placeholder="8"
              placeholderTextColor={c.muted}
              style={{
                color: c.text,
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: r.input,
                padding: FR.space.x3,
                ...FR.type.body,
              }}
            />
          </View>

          <View style={{ flex: 1, gap: FR.space.x2 }}>
            <Text style={{ color: c.text, ...FR.type.h3 }}>Days/Week</Text>
            <TextInput
              value={daysPerWeek}
              onChangeText={setDaysPerWeek}
              keyboardType="number-pad"
              placeholder="4"
              placeholderTextColor={c.muted}
              style={{
                color: c.text,
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: r.input,
                padding: FR.space.x3,
                ...FR.type.body,
              }}
            />
          </View>
        </View>

        {/* Optional: Goals */}
        <View style={{ gap: FR.space.x2 }}>
          <Text style={{ color: c.text, ...FR.type.h3 }}>Goals (optional)</Text>
          <TextInput
            value={goals}
            onChangeText={setGoals}
            placeholder="e.g., Build explosive power for basketball, improve endurance"
            placeholderTextColor={c.muted}
            multiline
            numberOfLines={3}
            style={{
              color: c.text,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: r.input,
              padding: FR.space.x3,
              ...FR.type.body,
              minHeight: 80,
            }}
          />
        </View>

        {/* Optional: Equipment */}
        <View style={{ gap: FR.space.x2 }}>
          <Text style={{ color: c.text, ...FR.type.h3 }}>Available Equipment (optional)</Text>
          <TextInput
            value={equipment}
            onChangeText={setEquipment}
            placeholder="e.g., barbell, dumbbells, pull-up bar"
            placeholderTextColor={c.muted}
            style={{
              color: c.text,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: r.input,
              padding: FR.space.x3,
              ...FR.type.body,
            }}
          />
          <Text style={{ color: c.muted, ...FR.type.sub, fontSize: 11 }}>
            Comma separated list
          </Text>
        </View>

        {/* Optional: Injuries */}
        <View style={{ gap: FR.space.x2 }}>
          <Text style={{ color: c.text, ...FR.type.h3 }}>Injuries/Limitations (optional)</Text>
          <TextInput
            value={injuries}
            onChangeText={setInjuries}
            placeholder="e.g., Lower back pain, avoid overhead pressing"
            placeholderTextColor={c.muted}
            multiline
            numberOfLines={2}
            style={{
              color: c.text,
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: r.input,
              padding: FR.space.x3,
              ...FR.type.body,
              minHeight: 60,
            }}
          />
        </View>

        {/* Info Box */}
        <View
          style={{
            backgroundColor: "#9B59B620",
            borderWidth: 1,
            borderColor: "#9B59B6",
            borderRadius: FR.radius.card,
            padding: FR.space.x3,
            gap: FR.space.x2,
          }}
        >
          <Text style={{ color: "#9B59B6", ...FR.type.body, fontWeight: "700" }}>
            ✨ How it works
          </Text>
          <Text style={{ color: c.muted, ...FR.type.sub }}>
            AI will generate a complete workout plan with exercises, sets, reps, and rest periods tailored to your
            specifications. Generation takes 5-10 seconds.
          </Text>
        </View>

        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          disabled={isLoading}
          style={({ pressed }) => ({
            paddingVertical: FR.space.x3,
            borderRadius: r.button,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: "center",
            opacity: pressed || isLoading ? ds.rules.tapOpacity : 1,
          })}
        >
          <Text style={{ color: c.text, ...FR.type.body }}>Back</Text>
        </Pressable>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: FR.space.x4,
          backgroundColor: c.bg,
          borderTopWidth: 1,
          borderTopColor: c.border,
        }}
      >
        <Pressable
          onPress={handleGenerate}
          disabled={isLoading}
          style={({ pressed }) => ({
            paddingVertical: FR.space.x4,
            borderRadius: r.button,
            backgroundColor: "#9B59B6",
            alignItems: "center",
            opacity: pressed || isLoading ? ds.rules.tapOpacity : 1,
          })}
        >
          {isLoading ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x2 }}>
              <ActivityIndicator color="#FFF" />
              <Text style={{ color: "#FFF", ...FR.type.h3, fontWeight: "900" }}>Generating...</Text>
            </View>
          ) : (
            <Text style={{ color: "#FFF", ...FR.type.h3, fontWeight: "900" }}>🤖 Generate Plan</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}