import * as React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { makeDesignSystem } from "../../../ui/designSystem";
import { useThemeColors } from "../../../ui/theme";
import type { ForgeDNA, ForgeDNAHistoryEntry } from "../../../lib/forgeDNA/types";
import { HistoricalComparison } from "./HistoricalComparison";
import { UserComparison } from "./UserComparison";
import { DetailedAnalysis } from "./DetailedAnalysis";
import { SVGVisualization } from "./SVGVisualization";
import { analyzeMuscleImbalances, analyzeTrainingStyle, generateProgressionSuggestions } from "../../../lib/forgeDNA/imbalanceAnalyzer";

interface ForgeDNAVisualizationProps {
  dna: ForgeDNA;
  isPremium: boolean;
  history?: ForgeDNAHistoryEntry[];
  averageUserDNA?: ForgeDNA;
  differences?: string[];
  insights?: string[];
  detailedAnalysis?: {
    imbalanceRecommendations: string[];
    trainingStyleInsights: string[];
    progressionSuggestions: string[];
  };
}

export function ForgeDNAVisualization(props: ForgeDNAVisualizationProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const { dna, isPremium, history, averageUserDNA, differences = [], insights = [], detailedAnalysis } = props;

  // Calculate detailed analysis if not provided
  const analysisData = React.useMemo(() => {
    if (!dna) return null;

    const imbalanceAnalysis = analyzeMuscleImbalances(dna);
    const trainingStyleAnalysis = analyzeTrainingStyle(dna);

    return {
      ...imbalanceAnalysis,
      trainingStyleInsights: trainingStyleAnalysis.insights,
      progressionSuggestions: generateProgressionSuggestions(dna)
    };
  }, [dna]);

  // Find top 3 muscle groups by volume
  const topMuscleGroups = Object.entries(dna.muscleBalance)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([muscle, percentage]) => ({ muscle, percentage }));

  // Find dominant training style
  const trainingStyles = Object.entries(dna.trainingStyle)
    .sort(([, a], [, b]) => b - a)
    .map(([style, percentage]) => ({ style, percentage }));

  const dominantStyle = trainingStyles[0];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]}>Forge DNA</Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          Your unique training identity
        </Text>
      </View>

      {/* SVG Visualization for Premium Users */}
      {isPremium && dna && (
        <View style={styles.section}>
          <SVGVisualization dna={dna} />
        </View>
      )}

      {/* Muscle Balance Radar Chart Visualization */}
      <View style={styles.visualizationSection}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>
          Muscle Balance
        </Text>
        <View style={styles.radarChartContainer}>
          <View style={styles.radarChart}>
            {/* Simplified radar chart representation */}
            <View style={[styles.radarCenter, { backgroundColor: `${ds.tone.accent}20` }]} />
            {topMuscleGroups.map((group, index) => (
              <View
                key={group.muscle}
                style={[
                  styles.radarPoint,
                  {
                    backgroundColor: ds.tone.accent,
                    width: 12 + (group.percentage / 10),
                    height: 12 + (group.percentage / 10),
                    left: `${20 + (index * 30)}%`,
                    top: `${50 - (group.percentage / 4)}%`,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Top muscle groups */}
        <View style={styles.topMuscles}>
          {topMuscleGroups.map((group) => (
            <View key={group.muscle} style={styles.muscleItem}>
              <Text style={[styles.muscleName, { color: c.text }]}>
                {group.muscle}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: ds.tone.accent,
                      width: `${group.percentage}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.percentage, { color: c.muted }]}>
                {group.percentage}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Training Style */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>
          Training Style
        </Text>
        <View style={styles.trainingStyleContainer}>
          <View style={styles.dominantStyle}>
            <Text style={[styles.styleName, { color: c.text }]}>
              {dominantStyle.style.charAt(0).toUpperCase() + dominantStyle.style.slice(1)}
            </Text>
            <Text style={[styles.stylePercentage, { color: ds.tone.accent }]}>
              {dominantStyle.percentage}%
            </Text>
          </View>

          <View style={styles.styleBreakdown}>
            {trainingStyles.slice(1).map((style) => (
              <View key={style.style} style={styles.styleItem}>
                <Text style={[styles.styleLabel, { color: c.muted }]}>
                  {style.style.charAt(0).toUpperCase() + style.style.slice(1)}
                </Text>
                <Text style={[styles.styleValue, { color: c.text }]}>
                  {style.percentage}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Top Exercises */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>
          Top Exercises
        </Text>
        <View style={styles.exercisesList}>
          {dna.topExercises.slice(0, 3).map((exerciseId, index) => (
            <View key={exerciseId} style={styles.exerciseItem}>
              <View style={styles.exerciseRank}>
                <Text style={[styles.rankText, { color: c.text }]}>
                  #{index + 1}
                </Text>
              </View>
              <Text
                style={[styles.exerciseName, { color: c.text }]}
                numberOfLines={1}
              >
                {exerciseId.replace(/_/g, " ")}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Historical Comparison for Premium Users */}
      {isPremium && history && history.length > 1 && (
        <View style={styles.section}>
          <HistoricalComparison
            history={history}
            userDNA={dna}
            averageUserDNA={averageUserDNA}
            differences={differences}
            insights={insights}
          />
        </View>
      )}

      {/* User Comparison for Premium Users */}
      {isPremium && averageUserDNA && (
        <View style={styles.section}>
          <UserComparison
            userDNA={dna}
            averageDNA={averageUserDNA}
            differences={differences}
            insights={insights}
          />
        </View>
      )}

      {/* Detailed Analysis for Premium Users */}
      {isPremium && dna && analysisData && (
        <View style={styles.section}>
          <DetailedAnalysis
            dna={dna}
            imbalances={analysisData.muscleImbalances}
            overallBalanceScore={analysisData.overallBalanceScore}
            recommendations={analysisData.recommendations}
            trainingStyleInsights={analysisData.trainingStyleInsights}
            progressionSuggestions={analysisData.progressionSuggestions}
          />
        </View>
      )}

      {/* Premium Blur Overlay */}
      {!isPremium && (
        <View style={styles.blurOverlay}>
          <View style={styles.blurContent}>
            <Text style={[styles.blurTitle, { color: c.text }]}>
              Premium Insights Locked
            </Text>
            <Text style={[styles.blurDescription, { color: c.muted }]}>
              Unlock detailed analysis, historical comparisons, and personalized recommendations
            </Text>
            <View style={[styles.unlockButton, { backgroundColor: ds.tone.accent }]}>
              <Text style={[styles.unlockButtonText, { color: c.bg }]}>
                Unlock with Pro
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    position: "relative",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
  },
  visualizationSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  radarChartContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  radarChart: {
    width: 200,
    height: 200,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  radarCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  radarPoint: {
    position: "absolute",
    borderRadius: 6,
  },
  topMuscles: {
    gap: 12,
  },
  muscleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  muscleName: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  progressBar: {
    flex: 2,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    fontWeight: "600",
    width: 30,
    textAlign: "right",
  },
  section: {
    marginBottom: 24,
  },
  trainingStyleContainer: {
    gap: 16,
  },
  dominantStyle: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 16,
  },
  styleName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  stylePercentage: {
    fontSize: 24,
    fontWeight: "800",
  },
  styleBreakdown: {
    gap: 8,
  },
  styleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  styleLabel: {
    fontSize: 14,
    fontWeight: "400",
  },
  styleValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  exercisesList: {
    gap: 8,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  exerciseRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontSize: 12,
    fontWeight: "600",
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  blurContent: {
    alignItems: "center",
    gap: 16,
  },
  blurTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  blurDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  unlockButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});