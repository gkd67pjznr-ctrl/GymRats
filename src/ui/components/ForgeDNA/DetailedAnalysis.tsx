import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { makeDesignSystem } from "../../designSystem";
import { useThemeColors } from "../../../ui/theme";
import type { ForgeDNA } from "../../../lib/forgeDNA/types";
import type { MuscleImbalance } from "../../../lib/forgeDNA/imbalanceAnalyzer";

interface DetailedAnalysisProps {
  dna: ForgeDNA;
  imbalances: MuscleImbalance[];
  overallBalanceScore: number;
  recommendations: string[];
  trainingStyleInsights: string[];
  progressionSuggestions: string[];
}

export function DetailedAnalysis({
  dna,
  imbalances,
  overallBalanceScore,
  recommendations,
  trainingStyleInsights,
  progressionSuggestions
}: DetailedAnalysisProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  // Get top imbalances by severity
  const highSeverityImbalances = imbalances.filter(imb => imb.severity === 'high');
  const mediumSeverityImbalances = imbalances.filter(imb => imb.severity === 'medium');

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.text }]}>Detailed Analysis</Text>

      {/* Overall Balance Score */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Balance Score</Text>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreText, { color: c.text }]}>
              {overallBalanceScore}
            </Text>
            <Text style={[styles.scoreLabel, { color: c.muted }]}>out of 100</Text>
          </View>
          <View style={styles.scoreDescription}>
            <Text style={[styles.scoreDescriptionText, { color: c.text }]}>
              {overallBalanceScore > 80
                ? "Excellent balance across muscle groups"
                : overallBalanceScore > 60
                ? "Good balance with minor imbalances"
                : "Significant imbalances detected"}
            </Text>
          </View>
        </View>
      </View>

      {/* Significant Imbalances */}
      {(highSeverityImbalances.length > 0 || mediumSeverityImbalances.length > 0) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Muscle Imbalances</Text>

          {highSeverityImbalances.length > 0 && (
            <View style={styles.imbalanceSeverity}>
              <Text style={[styles.severityTitle, { color: ds.tone.danger }]}>High Priority</Text>
              {highSeverityImbalances.slice(0, 3).map((imbalance, index) => (
                <View key={index} style={styles.imbalanceItem}>
                  <View style={styles.imbalanceHeader}>
                    <Text style={[styles.muscleName, { color: c.text }]}>{imbalance.muscleGroup}</Text>
                    <Text style={[styles.imbalanceScore, { color: ds.tone.danger }]}>
                      {imbalance.imbalanceScore}
                    </Text>
                  </View>
                  <Text style={[styles.recommendation, { color: c.muted }]}>{imbalance.recommendation}</Text>
                </View>
              ))}
            </View>
          )}

          {mediumSeverityImbalances.length > 0 && (
            <View style={styles.imbalanceSeverity}>
              <Text style={[styles.severityTitle, { color: ds.tone.accent }]}>Medium Priority</Text>
              {mediumSeverityImbalances.slice(0, 3).map((imbalance, index) => (
                <View key={index} style={styles.imbalanceItem}>
                  <View style={styles.imbalanceHeader}>
                    <Text style={[styles.muscleName, { color: c.text }]}>{imbalance.muscleGroup}</Text>
                    <Text style={[styles.imbalanceScore, { color: ds.tone.accent }]}>
                      {imbalance.imbalanceScore}
                    </Text>
                  </View>
                  <Text style={[styles.recommendation, { color: c.muted }]}>{imbalance.recommendation}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Recommendations</Text>
          <View style={styles.recommendationsList}>
            {recommendations.slice(0, 5).map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={[styles.bullet, { backgroundColor: ds.tone.accent }]} />
                <Text style={[styles.recommendationText, { color: c.text }]}>{recommendation}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Training Style Insights */}
      {trainingStyleInsights.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Training Style Insights</Text>
          <View style={styles.insightsList}>
            {trainingStyleInsights.slice(0, 3).map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <View style={[styles.insightIcon, { backgroundColor: `${ds.tone.accent}20` }]}>
                  <Text style={[styles.insightIconText, { color: ds.tone.accent }]}>i</Text>
                </View>
                <Text style={[styles.insightText, { color: c.text }]}>{insight}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Progression Suggestions */}
      {progressionSuggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Progression Suggestions</Text>
          <View style={styles.suggestionsList}>
            {progressionSuggestions.slice(0, 4).map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <View style={[styles.suggestionIcon, { backgroundColor: `${ds.tone.success}20` }]}>
                  <Text style={[styles.suggestionIconText, { color: ds.tone.success }]}>✓</Text>
                </View>
                <Text style={[styles.suggestionText, { color: c.text }]}>{suggestion}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Button */}
      <Pressable
        style={[styles.actionButton, { backgroundColor: ds.tone.accent }]}
        onPress={() => {
          // TODO: Navigate to personalized workout plan based on analysis
        }}
      >
        <Text style={[styles.actionButtonText, { color: c.bg }]}>
          Create Personalized Plan
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "800",
  },
  scoreLabel: {
    fontSize: 12,
  },
  scoreDescription: {
    flex: 1,
  },
  scoreDescriptionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  imbalanceSeverity: {
    marginBottom: 16,
  },
  severityTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  imbalanceItem: {
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  imbalanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  muscleName: {
    fontSize: 16,
    fontWeight: "600",
  },
  imbalanceScore: {
    fontSize: 16,
    fontWeight: "700",
  },
  recommendation: {
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 6,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  insightIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  insightIconText: {
    fontSize: 14,
    fontWeight: "700",
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  suggestionsList: {
    gap: 12,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  suggestionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  suggestionIconText: {
    fontSize: 14,
    fontWeight: "700",
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});