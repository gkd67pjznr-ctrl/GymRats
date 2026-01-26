import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { getAllCategories } from "../../src/lib/premadePlans/categories";
import { getPlanCountByCategory } from "../../src/lib/premadePlans/store";
import { makeDesignSystem } from "../../src/ui/designSystem";
import { FR } from "../../src/ui/forgerankStyle";
import { useThemeColors, useThemeRadius } from "../../src/ui/theme";

/**
 * Browse Plans - Category Selection
 * 
 * Shows all 5 categories as cards
 * User taps a category to see plans in that category
 */
export default function BrowsePlans() {
  const c = useThemeColors();
  const r = useThemeRadius();
  const ds = makeDesignSystem("dark", "toxic");
  const router = useRouter();
  const categories = getAllCategories();
  
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: FR.space.x4, gap: FR.space.x3 }}>
        {/* Header */}
        <View style={{ gap: FR.space.x2 }}>
          <Text style={{ color: c.text, ...FR.type.h1 }}>Browse Plans</Text>
          <Text style={{ color: c.muted, ...FR.type.sub }}>
            Choose a category to find the perfect workout plan
          </Text>
        </View>

        {/* Categories Grid */}
        {categories.map((category) => {
          const planCount = getPlanCountByCategory(category.id);
          
          return (
            <Pressable
              key={category.id}
              onPress={() => router.push(`/workout/plans/${category.id}` as any)}
              style={({ pressed }) => ({
                backgroundColor: c.card,
                borderWidth: 2,
                borderColor: category.color,
                borderRadius: FR.radius.card,
                padding: FR.space.x4,
                gap: FR.space.x2,
                opacity: pressed ? ds.rules.tapOpacity : 1,
              })}
            >
              {/* Icon + Name */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x3 }}>
                <Text style={{ fontSize: 40 }}>{category.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, ...FR.type.h2 }}>{category.name}</Text>
                  <Text style={{ color: c.muted, ...FR.type.sub }}>
                    {planCount} {planCount === 1 ? "plan" : "plans"}
                  </Text>
                </View>
              </View>

              {/* Tagline */}
              <Text style={{ color: category.color, ...FR.type.body, fontWeight: "700" }}>
                {category.tagline}
              </Text>

              {/* Description */}
              <Text style={{ color: c.muted, ...FR.type.sub }}>
                {category.description}
              </Text>
            </Pressable>
          );
        })}

        {/* AI Generator Card */}
        <Pressable
          onPress={() => router.push("/workout/ai-generate" as any)}
          style={({ pressed }) => ({
            backgroundColor: c.card,
            borderWidth: 2,
            borderColor: "#9B59B6",
            borderRadius: FR.radius.card,
            padding: FR.space.x4,
            gap: FR.space.x2,
            opacity: pressed ? ds.rules.tapOpacity : 1,
          })}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x3 }}>
            <Text style={{ fontSize: 40 }}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, ...FR.type.h2 }}>AI Generator</Text>
              <Text style={{ color: c.muted, ...FR.type.sub }}>Custom plans</Text>
            </View>
          </View>

          <Text style={{ color: "#9B59B6", ...FR.type.body, fontWeight: "700" }}>
            Generate a custom plan
          </Text>

          <Text style={{ color: c.muted, ...FR.type.sub }}>
            Create a personalized workout plan tailored to your goals, equipment, and schedule
          </Text>
        </Pressable>

        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            paddingVertical: FR.space.x3,
            borderRadius: r.button,  // CHANGED: FR.radius.button → r.button
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: "center",
            opacity: pressed ? ds.rules.tapOpacity : 1,
            marginTop: FR.space.x2,
          })}
        >
          <Text style={{ color: c.text, ...FR.type.body }}>Back</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}