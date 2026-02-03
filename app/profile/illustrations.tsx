// app/profile/illustrations.tsx
// Themed illustrations gallery screen

import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/src/ui/theme";
import { useThemeStore, useActivePalette } from "@/src/lib/stores/themeStore";
import { ProtectedRoute } from "@/src/ui/components/ProtectedRoute";
import { ScreenHeader } from "@/src/ui/components/ScreenHeader";
import { ThemeIllustration } from "@/src/lib/themeDatabase";
import { ThemedButton } from "@/src/ui/components/ThemedButton";
import { IllustrationView } from "@/src/ui/components/IllustrationView";

/**
 * Illustration Preview Component
 */
function IllustrationPreview({
  illustration,
  isActive,
  onPress,
}: {
  illustration: ThemeIllustration;
  isActive: boolean;
  onPress: () => void;
}) {
  const c = useThemeColors();
  const activePalette = useActivePalette();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: c.card,
        borderWidth: 2,
        borderColor: isActive ? (activePalette?.colors.primary || c.primary) : c.border,
        borderRadius: 14,
        padding: 16,
        gap: 12,
        opacity: pressed ? 0.8 : 1,
        position: "relative",
      })}
    >
      {/* Active indicator */}
      {isActive && (
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: activePalette?.colors.primary || c.primary,
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: "#000", fontSize: 12, fontWeight: "900" }}>Active</Text>
        </View>
      )}

      {/* Illustration Preview */}
      <View style={{ alignItems: "center" }}>
        <IllustrationView illustration={illustration} size="medium" showDetails />
      </View>

      {/* Illustration Name */}
      <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>
        {illustration.name}
      </Text>
      <Text style={{ color: c.muted, fontSize: 14, lineHeight: 18 }}>
        {illustration.description}
      </Text>

      {/* Style and Animation */}
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <View
          style={{
            backgroundColor: `${c.primary}15`,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: c.primary, fontSize: 12, fontWeight: "700" }}>
            {illustration.style}
          </Text>
        </View>
        {illustration.animationType && illustration.animationType !== "none" && (
          <View
            style={{
              backgroundColor: `${c.accent}15`,
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: c.accent, fontSize: 12, fontWeight: "700" }}>
              {illustration.animationType}
            </Text>
          </View>
        )}
      </View>

      {/* Premium/Legendary Badges */}
      <View style={{ flexDirection: "row", gap: 6 }}>
        {illustration.isPremium && (
          <View
            style={{
              backgroundColor: "#FFD700",
              borderRadius: 8,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: "#000", fontSize: 10, fontWeight: "900" }}>PREMIUM</Text>
          </View>
        )}
        {illustration.isLegendary && (
          <View
            style={{
              backgroundColor: "#FF4DFF",
              borderRadius: 8,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: "#000", fontSize: 10, fontWeight: "900" }}>LEGENDARY</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

/**
 * Illustrations Gallery Screen
 */
export default function IllustrationsGalleryScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const { database, setActiveTheme, activeIllustration } = useThemeStore();
  const activePalette = useActivePalette();
  const [illustrations, setIllustrations] = useState<ThemeIllustration[]>([]);
  const [groupedIllustrations, setGroupedIllustrations] = useState<Record<string, ThemeIllustration[]>>({});

  // Load illustrations from the database
  useEffect(() => {
    setIllustrations(database.illustrations);

    // Group illustrations by category
    const grouped: Record<string, ThemeIllustration[]> = {};
    database.illustrations.forEach(illustration => {
      if (!grouped[illustration.category]) {
        grouped[illustration.category] = [];
      }
      grouped[illustration.category].push(illustration);
    });

    setGroupedIllustrations(grouped);
  }, [database]);

  /**
   * Handle illustration selection
   */
  function handleSelectIllustration(illustrationId: string) {
    const illustration = database.illustrations.find((i) => i.id === illustrationId);
    if (!illustration) return;

    // Find a theme configuration that uses this illustration
    const config = database.configurations.find(c => c.illustrationId === illustrationId);

    if (config) {
      // Check if this is a legendary illustration
      if (illustration.isLegendary) {
        Alert.alert(
          "Legendary Illustration",
          `The ${illustration.name} illustration transforms the app's visual experience with unique visuals and animations.\n\nAre you ready for the transformation?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Transform",
              style: "default",
              onPress: () => {
                setActiveTheme(config.id);
                Alert.alert("Transformation Complete", `You've activated the ${illustration.name} illustration!`);
              },
            },
          ]
        );
      } else if (illustration.isPremium && !illustration.isLegendary) {
        Alert.alert(
          "Premium Illustration",
          `${illustration.name} is a premium illustration. In a full implementation, this would require an in-app purchase.\n\nFor now, you can preview all illustrations!`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Activate",
              style: "default",
              onPress: () => {
                setActiveTheme(config.id);
                Alert.alert("Illustration Activated", `${illustration.name} illustration activated!`);
              },
            },
          ]
        );
      } else {
        setActiveTheme(config.id);
      }
    } else {
      Alert.alert("Configuration Not Found", "No theme configuration found for this illustration.");
    }
  }

  return (
    <ProtectedRoute>
      <ScreenHeader title="Illustrations" />

      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: c.text, fontSize: 24, fontWeight: "900" }}>Illustrations Gallery</Text>
          <Text style={{ color: c.muted, lineHeight: 20 }}>
            Browse themed illustrations that enhance your app experience. Each illustration style adds unique visual flair to achievements, ranks, and other UI elements.
          </Text>
        </View>

        {/* Info Section */}
        <View
          style={{
            backgroundColor: `${c.primary}15`,
            borderWidth: 1,
            borderColor: c.primary,
            borderRadius: 12,
            padding: 16,
            gap: 12,
          }}
        >
          <Text style={{ color: c.primary, fontSize: 16, fontWeight: "900" }}>Illustration System</Text>
          <Text style={{ color: c.primary, lineHeight: 20 }}>
            Forgerank's illustration system enhances the app with themed visuals:
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: c.primary }}>•</Text>
              <Text style={{ color: c.primary, flex: 1 }}>Hand-drawn illustrations with personal touch</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: c.primary }}>•</Text>
              <Text style={{ color: c.primary, flex: 1 }}>Surreal and psychedelic styles for energy</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: c.primary }}>•</Text>
              <Text style={{ color: c.primary, flex: 1 }}>Animated illustrations for engagement</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: c.primary }}>•</Text>
              <Text style={{ color: c.primary, flex: 1 }}>Category-specific visuals (PRs, ranks, achievements)</Text>
            </View>
          </View>
        </View>

        {/* Illustrations by Category */}
        {Object.entries(groupedIllustrations).map(([category, categoryIllustrations]) => (
          <View key={category} style={{ gap: 12 }}>
            <Text style={{ color: c.text, fontSize: 20, fontWeight: "900", textTransform: "capitalize" }}>
              {category.replace('-', ' ')}
            </Text>
            <View style={{ gap: 12 }}>
              {categoryIllustrations.map((illustration) => (
                <IllustrationPreview
                  key={illustration.id}
                  illustration={illustration}
                  isActive={activeIllustration?.id === illustration.id}
                  onPress={() => handleSelectIllustration(illustration.id)}
                />
              ))}
            </View>
          </View>
        ))}

        {/* Active Illustration Preview */}
        {activeIllustration && (
          <View
            style={{
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 14,
              padding: 16,
            }}
          >
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
              Active Illustration
            </Text>
            <View style={{ alignItems: "center" }}>
              <IllustrationView illustration={activeIllustration} size="large" showDetails />
            </View>
          </View>
        )}

        {/* Premium Info */}
        <View
          style={{
            backgroundColor: `${c.secondary}15`,
            borderWidth: 1,
            borderColor: c.secondary,
            borderRadius: 12,
            padding: 16,
            gap: 12,
          }}
        >
          <Text style={{ color: c.secondary, fontSize: 16, fontWeight: "900" }}>Premium & Legendary Illustrations</Text>
          <Text style={{ color: c.secondary, lineHeight: 20 }}>
            Premium illustrations unlock additional visual enhancements, while Legendary illustrations completely transform the app experience with unique personalities and special effects.
          </Text>
        </View>
      </ScrollView>
    </ProtectedRoute>
  );
}