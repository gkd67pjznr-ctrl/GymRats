// app/profile/themes.tsx
// Theme selection screen for GymRats

import { useState, useEffect } from "react";
import { View, Text, Pressable, Alert, ScrollView, Image } from "react-native";
import { useRouter, Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/src/ui/theme";
import { TAB_BAR_HEIGHT } from "@/src/ui/components/PersistentTabBar";
import { useThemeStore, useActivePalette } from "@/src/lib/stores/themeStore";
import { ProtectedRoute } from "@/src/ui/components/ProtectedRoute";
import { ScreenHeader } from "@/src/ui/components/ScreenHeader";
import { ThemePalette } from "@/src/lib/themeDatabase";
import { ThemePreview } from "@/src/ui/components/ThemePreview";

/**
 * Local Theme Card Component
 * Note: Renamed from ThemeCard to LocalThemeCard to avoid duplicate declaration error
 */
function LocalThemeCard({
  theme,
  isActive,
  onPress,
}: {
  theme: ThemePalette;
  isActive: boolean;
  onPress: () => void;
}) {
  const c = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: c.card,
        borderWidth: 2,
        borderColor: isActive ? theme.colors.primary : c.border,
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
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: "#000", fontSize: 12, fontWeight: "900" }}>Active</Text>
        </View>
      )}

      {/* Theme Name */}
      <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>{theme.name}</Text>
      <Text style={{ color: c.muted, fontSize: 14, lineHeight: 18 }}>{theme.description}</Text>

      {/* Color Palette Preview */}
      <View style={{ flexDirection: "row", gap: 4 }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: theme.colors.primary,
            borderWidth: 1,
            borderColor: c.border,
          }}
        />
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: theme.colors.secondary,
            borderWidth: 1,
            borderColor: c.border,
          }}
        />
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: theme.colors.accent,
            borderWidth: 1,
            borderColor: c.border,
          }}
        />
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: theme.colors.success,
            borderWidth: 1,
            borderColor: c.border,
          }}
        />
      </View>

      {/* Premium/Legendary Badges */}
      <View style={{ flexDirection: "row", gap: 6 }}>
        {theme.isPremium && (
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
        {theme.isLegendary && (
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
 * Theme Selection Screen
 */
export default function ThemeSelectionScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const { database, setActiveTheme } = useThemeStore();
  const activePalette = useActivePalette();
  const [themes, setThemes] = useState<ThemePalette[]>([]);

  // Load themes from the database
  useEffect(() => {
    setThemes(database.palettes);
  }, [database]);

  /**
   * Handle theme selection
   */
  function handleSelectTheme(themeId: string) {
    const theme = database.palettes.find((t) => t.id === themeId);
    if (!theme) return;

    // Check if this is a legendary theme
    if (theme.isLegendary) {
      Alert.alert(
        "Legendary Theme",
        `The ${theme.name} theme transforms the entire app experience with unique visuals, sounds, and animations.\n\nAre you ready for the transformation?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Transform",
            style: "default",
            onPress: () => {
              setActiveTheme(themeId);
              Alert.alert("Transformation Complete", `You've activated the ${theme.name} theme!`);
            },
          },
        ]
      );
    } else if (theme.isPremium && !theme.isLegendary) {
      Alert.alert(
        "Premium Theme",
        `${theme.name} is a premium theme. In a full implementation, this would require an in-app purchase.\n\nFor now, you can preview all themes!`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Activate",
            style: "default",
            onPress: () => {
              setActiveTheme(themeId);
              Alert.alert("Theme Activated", `${theme.name} theme activated!`);
            },
          },
        ]
      );
    } else {
      setActiveTheme(themeId);
    }
  }

  return (
    <ProtectedRoute>
      <ScreenHeader title="App Themes" />

      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20 }}
      >
        {/* Header */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: c.text, fontSize: 24, fontWeight: "900" }}>App Themes</Text>
          <Text style={{ color: c.muted, lineHeight: 20 }}>
            Choose a theme that matches your personality and training style. Each theme transforms the app's colors,
            sounds, and animations.
          </Text>
        </View>

        {/* Theme Grid */}
        <View style={{ gap: 12 }}>
          {themes.map((theme) => (
            <LocalThemeCard
              key={theme.id}
              theme={theme}
              isActive={activePalette?.id === theme.id}
              onPress={() => handleSelectTheme(theme.id)}
            />
          ))}
        </View>

        {/* Active Theme Preview */}
        {activePalette && (
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
              Current Theme Preview
            </Text>
            <ThemePreview />
          </View>
        )}

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
          <Text style={{ color: c.primary, fontSize: 16, fontWeight: "900" }}>Theme System</Text>
          <Text style={{ color: c.primary, lineHeight: 20 }}>
            GymRats' theme system goes beyond simple color changes. Each theme includes:
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: c.primary }}>•</Text>
              <Text style={{ color: c.primary, flex: 1 }}>Unique color palettes with emotional meaning</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: c.primary }}>•</Text>
              <Text style={{ color: c.primary, flex: 1 }}>Themed audio feedback for achievements</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: c.primary }}>•</Text>
              <Text style={{ color: c.primary, flex: 1 }}>Custom animations and haptic feedback</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: c.primary }}>•</Text>
              <Text style={{ color: c.primary, flex: 1 }}>Themed illustrations and typography</Text>
            </View>
          </View>
        </View>

        {/* Demo Link */}
        <Link href="/profile/theme-demo" asChild>
          <Pressable
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 14,
              padding: 14,
              backgroundColor: c.card,
              gap: 6,
            }}
          >
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>Theme Demo</Text>
            <Text style={{ color: c.muted, lineHeight: 18 }}>
              See how themed components look with your current theme
            </Text>
          </Pressable>
        </Link>

        {/* Illustrations Gallery Link */}
        <Link href="/profile/illustrations" asChild>
          <Pressable
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 14,
              padding: 14,
              backgroundColor: c.card,
              gap: 6,
            }}
          >
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>Illustrations Gallery</Text>
            <Text style={{ color: c.muted, lineHeight: 18 }}>
              Browse themed illustrations that enhance your app experience
            </Text>
          </Pressable>
        </Link>

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
          <Text style={{ color: c.secondary, fontSize: 16, fontWeight: "900" }}>Premium & Legendary Themes</Text>
          <Text style={{ color: c.secondary, lineHeight: 20 }}>
            Premium themes unlock additional visual enhancements, while Legendary themes completely transform the app
            experience with unique personalities, theme overrides, and special effects.
          </Text>
        </View>
      </ScrollView>
    </ProtectedRoute>
  );
}