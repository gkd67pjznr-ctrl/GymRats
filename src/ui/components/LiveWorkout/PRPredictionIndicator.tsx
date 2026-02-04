// src/ui/components/LiveWorkout/PRPredictionIndicator.tsx
// Shows prediction when user is close to or will achieve a PR

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../../theme";
import type { PRPrediction } from "@/src/lib/prPrediction";
import {
  getPredictionMessage,
  getPredictionIntensity,
} from "@/src/lib/prPrediction";

interface PRPredictionIndicatorProps {
  prediction: PRPrediction | null;
  compact?: boolean;
}

export function PRPredictionIndicator({
  prediction,
  compact = false,
}: PRPredictionIndicatorProps) {
  const c = useThemeColors();

  if (!prediction) return null;

  const intensity = getPredictionIntensity(prediction);
  const message = getPredictionMessage(prediction);

  // Don't show anything if not close to PR
  if (intensity === "none" || !message) return null;

  // Determine colors based on intensity
  const getColors = () => {
    switch (intensity) {
      case "pr":
        return {
          bg: "rgba(255, 215, 0, 0.15)",
          border: "#FFD700",
          text: "#FFD700",
          icon: "crown",
        };
      case "very-close":
        return {
          bg: "rgba(255, 165, 0, 0.12)",
          border: "#FFA500",
          text: "#FFA500",
          icon: "flame",
        };
      case "close":
        return {
          bg: "rgba(100, 200, 255, 0.1)",
          border: c.primary,
          text: c.primary,
          icon: "trending",
        };
      default:
        return {
          bg: c.card,
          border: c.border,
          text: c.muted,
          icon: "none",
        };
    }
  };

  const colors = getColors();

  // Build detail text
  let detailText: string | null = null;
  if (intensity !== "pr" && prediction.repsNeededForE1RMPR) {
    const currentReps = Math.round(
      30 * (prediction.predictedE1RM / (prediction.currentBestE1RM || 1) - 1)
    );
    const repsNeeded = prediction.repsNeededForE1RMPR;
    if (repsNeeded > currentReps) {
      detailText = `+${repsNeeded - currentReps} more reps for PR`;
    }
  }

  if (compact) {
    return (
      <View
        style={[
          styles.compactContainer,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.compactText, { color: colors.text }]}>
          {intensity === "pr" ? "PR!" : intensity === "very-close" ? "~PR" : "Close"}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.icon]}>
          {intensity === "pr" ? "👑" : intensity === "very-close" ? "🔥" : "📈"}
        </Text>
        <View style={styles.textContainer}>
          <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
          {detailText && (
            <Text style={[styles.detail, { color: c.muted }]}>{detailText}</Text>
          )}
        </View>
      </View>

      {/* Progress bar for e1RM proximity */}
      {intensity !== "pr" && prediction.e1rmProximity > 0.85 && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: c.bg,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.border,
                  width: `${Math.min(100, prediction.e1rmProximity * 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: c.muted }]}>
            {Math.round(prediction.e1rmProximity * 100)}% of PR
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  compactContainer: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  compactText: {
    fontSize: 11,
    fontWeight: "700",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: "700",
  },
  detail: {
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    gap: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    textAlign: "right",
  },
});

export default PRPredictionIndicator;
