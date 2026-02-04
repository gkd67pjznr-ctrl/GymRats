import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useThemeColors } from "../../../src/ui/theme";
import { FR } from "../../../src/ui/GrStyle";
import type { PlanCategory } from "../../../src/lib/premadePlans/types";
import { usePlansByCategory, hydratePremadePlansStore } from "../../../src/lib/premadePlans/store";
import { getCategoryInfo } from "../../../src/lib/premadePlans/categories";
import { makeDesignSystem } from "../../../src/ui/designSystem";
import { ScreenHeader } from "../../../src/ui/components/ScreenHeader";
import { TAB_BAR_HEIGHT } from "../../../src/ui/components/PersistentTabBar";

/**
 * Plan List - Shows all plans in a category
 * 
 * Route: /workout/plans/[category]
 * Example: /workout/plans/strength
 */
export default function PlanList() {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { category } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const categoryId = category as PlanCategory;
  const plans = usePlansByCategory(categoryId);
  const categoryInfo = getCategoryInfo(categoryId);

  useEffect(() => {
    hydratePremadePlansStore()
      .catch((err) => console.error("Failed to load plans:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={c.text} />
        <Text style={{ color: c.muted, marginTop: 12, fontSize: 14 }}>Loading plans...</Text>
      </View>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "#4ECDC4";
      case "intermediate": return "#FFA07A";
      case "advanced": return "#FF6B6B";
      default: return c.muted;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScreenHeader title={categoryInfo.name} />
      <ScrollView contentContainerStyle={{ padding: FR.space.x4, gap: FR.space.x3, paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20 }}>
        {/* Header */}
        <View style={{ gap: FR.space.x2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x3 }}>
            <Text style={{ fontSize: 48 }}>{categoryInfo.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: categoryInfo.color, ...FR.type.body, fontWeight: "700" }}>
                {categoryInfo.tagline}
              </Text>
            </View>
          </View>
          <Text style={{ color: c.muted, ...FR.type.sub }}>{categoryInfo.description}</Text>
        </View>

        {/* Plans */}
        {plans.length === 0 ? (
          <View
            style={{
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: FR.radius.card,
              padding: FR.space.x4,
              alignItems: "center",
            }}
          >
            <Text style={{ color: c.muted, ...FR.type.body }}>No plans in this category yet</Text>
          </View>
        ) : (
          plans.map((plan) => (
            <Pressable
              key={plan.id}
              onPress={() => router.push(`/workout/plan-detail/${plan.id}` as any)}
              style={({ pressed }) => ({
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: FR.radius.card,
                padding: FR.space.x4,
                gap: FR.space.x2,
                opacity: pressed ? ds.rules.tapOpacity : 1,
              })}
            >
              {/* Plan Name + Difficulty Badge */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Text style={{ color: c.text, ...FR.type.h3, flex: 1 }}>{plan.name}</Text>
                <View
                  style={{
                    paddingHorizontal: FR.space.x2,
                    paddingVertical: FR.space.x1,
                    borderRadius: FR.radius.pill,
                    backgroundColor: getDifficultyColor(plan.difficulty) + "20",
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

              {/* Description */}
              <Text style={{ color: c.muted, ...FR.type.sub }} numberOfLines={2}>
                {plan.description}
              </Text>

              {/* Meta Info */}
              <View style={{ flexDirection: "row", gap: FR.space.x3, flexWrap: "wrap" }}>
                <Text style={{ color: c.muted, ...FR.type.sub }}>
                  📅 {plan.durationWeeks}w • {plan.daysPerWeek}x/week
                </Text>
                <Text style={{ color: c.muted, ...FR.type.sub }}>
                  💪 {plan.exercises.length} exercises
                </Text>
                {plan.source === "ai-generated" && (
                  <Text style={{ color: "#9B59B6", ...FR.type.sub }}>🤖 AI</Text>
                )}
              </View>

              {/* Tags */}
              {plan.tags.length > 0 && (
                <View style={{ flexDirection: "row", gap: FR.space.x2, flexWrap: "wrap" }}>
                  {plan.tags.slice(0, 3).map((tag, idx) => (
                    <View
                      key={idx}
                      style={{
                        paddingHorizontal: FR.space.x2,
                        paddingVertical: FR.space.x1,
                        borderRadius: FR.radius.pill,
                        backgroundColor: c.bg,
                      }}
                    >
                      <Text style={{ color: c.muted, fontSize: 11 }}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          ))
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
            marginTop: FR.space.x2,
          })}
        >
          <Text style={{ color: c.text, ...FR.type.body }}>Back to Categories</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
