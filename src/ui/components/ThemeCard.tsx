// src/ui/components/ThemeCard.tsx
// Reusable theme card component

import { Pressable, Text, View } from "react-native";
import { useThemeColors } from "@/src/ui/theme";
import type { ThemePalette } from "@/src/lib/themeDatabase";

interface ThemeCardProps {
  theme: ThemePalette;
  isActive: boolean;
  onPress: () => void;
}

export function ThemeCard({ theme, isActive, onPress }: ThemeCardProps) {
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