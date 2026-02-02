// src/ui/components/ThemePreview.tsx
// Theme preview component that demonstrates the active theme

import { View, Text } from "react-native";
import { useThemeColors } from "@/src/ui/theme";
import { useActivePalette, useActiveTypography } from "@/src/lib/stores/themeStore";

/**
 * Theme Preview Component
 * Shows a visual preview of the active theme's colors and typography
 */
export function ThemePreview() {
  const c = useThemeColors();
  const activePalette = useActivePalette();
  const activeTypography = useActiveTypography();

  if (!activePalette) return null;

  return (
    <View style={{ gap: 16 }}>
      {/* Color Palette Preview */}
      <View style={{ gap: 8 }}>
        <Text style={{ color: c.text, fontSize: 16, fontWeight: "900" }}>Color Palette</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(activePalette.colors).map(([name, color]) => (
            <View key={name} style={{ alignItems: "center", gap: 4, width: 60 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: color,
                  borderWidth: 1,
                  borderColor: c.border,
                }}
              />
              <Text style={{ color: c.muted, fontSize: 10, textAlign: "center" }}>{name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Typography Preview */}
      {activeTypography && (
        <View style={{ gap: 8 }}>
          <Text style={{ color: c.text, fontSize: 16, fontWeight: "900" }}>Typography</Text>
          <View style={{ gap: 8 }}>
            <Text
              style={{
                color: c.text,
                fontSize: activeTypography.sizes.hero,
                fontWeight: activeTypography.weights.hero as any,
                lineHeight: activeTypography.lineHeights.hero,
              }}
            >
              Hero Text
            </Text>
            <Text
              style={{
                color: c.text,
                fontSize: activeTypography.sizes.h1,
                fontWeight: activeTypography.weights.h1 as any,
                lineHeight: activeTypography.lineHeights.h1,
              }}
            >
              Heading 1
            </Text>
            <Text
              style={{
                color: c.text,
                fontSize: activeTypography.sizes.h2,
                fontWeight: activeTypography.weights.h2 as any,
                lineHeight: activeTypography.lineHeights.h2,
              }}
            >
              Heading 2
            </Text>
            <Text
              style={{
                color: c.text,
                fontSize: activeTypography.sizes.body,
                fontWeight: activeTypography.weights.body as any,
                lineHeight: activeTypography.lineHeights.body,
              }}
            >
              Body text demonstrating the typography style. This shows how regular content will appear.
            </Text>
            <Text
              style={{
                color: c.muted,
                fontSize: activeTypography.sizes.caption,
                fontWeight: activeTypography.weights.caption as any,
                lineHeight: activeTypography.lineHeights.caption,
              }}
            >
              Caption text
            </Text>
          </View>
        </View>
      )}

      {/* Theme Info */}
      <View
        style={{
          backgroundColor: `${activePalette.colors.primary}15`,
          borderWidth: 1,
          borderColor: activePalette.colors.primary,
          borderRadius: 12,
          padding: 12,
          gap: 8,
        }}
      >
        <Text style={{ color: activePalette.colors.primary, fontWeight: "900" }}>
          {activePalette.name} Theme
        </Text>
        <Text style={{ color: activePalette.colors.primary, fontSize: 14 }}>
          {activePalette.emotionalMeaning} • {activePalette.isLegendary ? "Legendary" : activePalette.isPremium ? "Premium" : "Free"}
        </Text>
      </View>
    </View>
  );
}