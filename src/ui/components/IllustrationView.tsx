// src/ui/components/IllustrationView.tsx
// Component to display themed illustrations

import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "@/src/ui/theme";
import { useActivePalette } from "@/src/lib/stores/themeStore";
import type { ThemeIllustration } from "@/src/lib/themeDatabase";

interface IllustrationViewProps {
  illustration: ThemeIllustration;
  size?: "small" | "medium" | "large";
  showDetails?: boolean;
}

export function IllustrationView({
  illustration,
  size = "medium",
  showDetails = false,
}: IllustrationViewProps) {
  const c = useThemeColors();
  const activePalette = useActivePalette();

  // Size configuration
  const sizeConfig = {
    small: { width: 60, height: 60, fontSize: 10 },
    medium: { width: 120, height: 120, fontSize: 12 },
    large: { width: 180, height: 180, fontSize: 14 },
  }[size];

  // In a real implementation, we would display the actual illustration
  // For now, we'll show a placeholder with the illustration details
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.illustrationContainer,
          {
            width: sizeConfig.width,
            height: sizeConfig.height,
            backgroundColor: c.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: c.border,
          },
        ]}
      >
        {/* Illustration placeholder with details */}
        <View style={styles.placeholderContent}>
          <Text
            style={[
              styles.illustrationName,
              {
                color: activePalette?.colors.primary || c.primary,
                fontSize: sizeConfig.fontSize,
              },
            ]}
            numberOfLines={2}
            textAlign="center"
          >
            {illustration.name}
          </Text>
          <Text
            style={[
              styles.illustrationCategory,
              {
                color: c.muted,
                fontSize: sizeConfig.fontSize - 2,
                marginTop: 4,
              },
            ]}
            numberOfLines={1}
          >
            {illustration.category}
          </Text>
        </View>
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          <Text style={[styles.detailText, { color: c.text }]} numberOfLines={1}>
            Style: {illustration.style}
          </Text>
          {illustration.animationType && illustration.animationType !== "none" && (
            <Text style={[styles.detailText, { color: c.accent }]} numberOfLines={1}>
              Animation: {illustration.animationType}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  illustrationContainer: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  placeholderContent: {
    padding: 8,
    alignItems: "center",
  },
  illustrationName: {
    fontWeight: "900",
  },
  illustrationCategory: {
    fontWeight: "600",
  },
  detailsContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
  },
});