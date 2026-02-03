// app/profile/theme-demo.tsx
// Theme demo screen showcasing themed components

import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/src/ui/theme";
import { ProtectedRoute } from "@/src/ui/components/ProtectedRoute";
import { ScreenHeader } from "@/src/ui/components/ScreenHeader";
import { ThemePreview } from "@/src/ui/components/ThemePreview";
import { ThemedButton } from "@/src/ui/components/ThemedButton";
import { useActivePalette, useActiveIllustration } from "@/src/lib/stores/themeStore";
import { IllustrationView } from "@/src/ui/components/IllustrationView";

function ActiveIllustrationPreview() {
  const c = useThemeColors();
  const activeIllustration = useActiveIllustration();

  if (!activeIllustration) return null;

  return (
    <View
      style={{
        backgroundColor: c.card,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 14,
        padding: 16,
        gap: 12,
      }}
    >
      <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>
        Active Illustration
      </Text>
      <View style={{ alignItems: "center" }}>
        <IllustrationView illustration={activeIllustration} size="large" showDetails />
      </View>
      <Text style={{ color: c.muted, lineHeight: 20, textAlign: "center" }}>
        {activeIllustration.description}
      </Text>
    </View>
  );
}

export default function ThemeDemoScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const activePalette = useActivePalette();

  return (
    <ProtectedRoute>
      <ScreenHeader title="Theme Demo" />

      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: c.text, fontSize: 24, fontWeight: "900" }}>Theme Demo</Text>
          <Text style={{ color: c.muted, lineHeight: 20 }}>
            This screen demonstrates how themed components adapt to the active theme.
          </Text>
        </View>

        {/* Theme Preview */}
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
            Active Theme
          </Text>
          <ThemePreview />
        </View>

        {/* Button Demo */}
        <View style={{ gap: 16 }}>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>Themed Buttons</Text>

          <View style={{ gap: 12 }}>
            <ThemedButton
              title="Primary Button"
              variant="primary"
              onPress={() => Alert.alert("Button Pressed", "Primary button pressed!")}
            />

            <ThemedButton
              title="Secondary Button"
              variant="secondary"
              onPress={() => Alert.alert("Button Pressed", "Secondary button pressed!")}
            />

            <ThemedButton
              title="Success Button"
              variant="success"
              onPress={() => Alert.alert("Button Pressed", "Success button pressed!")}
            />

            <ThemedButton
              title="Danger Button"
              variant="danger"
              onPress={() => Alert.alert("Button Pressed", "Danger button pressed!")}
            />

            <ThemedButton
              title="Outline Button"
              variant="outline"
              onPress={() => Alert.alert("Button Pressed", "Outline button pressed!")}
            />
          </View>
        </View>

        {/* Button Sizes */}
        <View style={{ gap: 16 }}>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>Button Sizes</Text>

          <View style={{ gap: 12 }}>
            <ThemedButton
              title="Small Button"
              variant="primary"
              size="small"
              onPress={() => Alert.alert("Button Pressed", "Small button pressed!")}
            />

            <ThemedButton
              title="Medium Button"
              variant="primary"
              size="medium"
              onPress={() => Alert.alert("Button Pressed", "Medium button pressed!")}
            />

            <ThemedButton
              title="Large Button"
              variant="primary"
              size="large"
              onPress={() => Alert.alert("Button Pressed", "Large button pressed!")}
            />
          </View>
        </View>

        {/* Theme Info */}
        {activePalette && (
          <View
            style={{
              backgroundColor: `${activePalette.colors.primary}15`,
              borderWidth: 1,
              borderColor: activePalette.colors.primary,
              borderRadius: 12,
              padding: 16,
              gap: 12,
            }}
          >
            <Text style={{ color: activePalette.colors.primary, fontSize: 16, fontWeight: "900" }}>
              {activePalette.name} Theme
            </Text>
            <Text style={{ color: activePalette.colors.primary, lineHeight: 20 }}>
              {activePalette.description}
            </Text>
            <Text style={{ color: activePalette.colors.primary, lineHeight: 20 }}>
              Emotional Meaning: {activePalette.emotionalMeaning}
            </Text>
            <Text style={{ color: activePalette.colors.primary, lineHeight: 20 }}>
              Type: {activePalette.isLegendary ? "Legendary" : activePalette.isPremium ? "Premium" : "Free"}
            </Text>
          </View>
        )}

        {/* Active Illustration Preview */}
        <ActiveIllustrationPreview />

        {/* Illustrations Gallery Link */}
        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 14,
            padding: 16,
            backgroundColor: c.card,
            gap: 8,
          }}
        >
          <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>Explore Illustrations</Text>
          <Text style={{ color: c.muted, lineHeight: 20 }}>
            Browse themed illustrations that enhance your app experience with unique visuals.
          </Text>
          <ThemedButton
            title="View Illustrations Gallery"
            variant="primary"
            onPress={() => router.push("/profile/illustrations")}
          />
        </View>
      </ScrollView>
    </ProtectedRoute>
  );
}