import * as React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { makeDesignSystem } from "../../designSystem";
import { useThemeColors } from "../../../ui/theme";
import type { ForgeDNA } from "../../../lib/forgeDNA/types";
import type { MuscleGroup } from "../../../data/exerciseTypes";

interface UserComparisonProps {
  userDNA: ForgeDNA;
  averageDNA: ForgeDNA;
  differences: string[];
  insights: string[];
}

export function UserComparison({ userDNA, averageDNA, differences, insights }: UserComparisonProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  // Find top muscle groups for both user and average
  const userTopMuscles = Object.entries(userDNA.muscleBalance)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([muscle, percentage]) => ({ muscle: muscle as MuscleGroup, percentage }));

  const averageTopMuscles = Object.entries(averageDNA.muscleBalance)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([muscle, percentage]) => ({ muscle: muscle as MuscleGroup, percentage }));

  // Training style comparison
  const userDominantStyle = Object.entries(userDNA.trainingStyle)
    .sort(([, a], [, b]) => b - a)[0];

  const averageDominantStyle = Object.entries(averageDNA.trainingStyle)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.text }]}>User Comparison</Text>
      <Text style={[styles.subtitle, { color: c.muted }]}>
        How you compare to the average GymRats user
      </Text>

      {/* Training Style Comparison */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Training Style</Text>
        <View style={styles.styleComparison}>
          <View style={styles.styleBox}>
            <Text style={[styles.styleLabel, { color: c.muted }]}>You</Text>
            <Text style={[styles.styleValue, { color: c.text }]}>
              {userDominantStyle[0].charAt(0).toUpperCase() + userDominantStyle[0].slice(1)}
            </Text>
            <Text style={[styles.stylePercentage, { color: ds.tone.accent }]}>
              {userDominantStyle[1]}%
            </Text>
          </View>

          <View style={styles.vsContainer}>
            <Text style={[styles.vs, { color: c.muted }]}>VS</Text>
          </View>

          <View style={styles.styleBox}>
            <Text style={[styles.styleLabel, { color: c.muted }]}>Average</Text>
            <Text style={[styles.styleValue, { color: c.text }]}>
              {averageDominantStyle[0].charAt(0).toUpperCase() + averageDominantStyle[0].slice(1)}
            </Text>
            <Text style={[styles.stylePercentage, { color: ds.tone.accent }]}>
              {averageDominantStyle[1]}%
            </Text>
          </View>
        </View>
      </View>

      {/* Top Muscle Groups Comparison */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Top Muscle Groups</Text>
        <View style={styles.muscleComparison}>
          <View style={styles.muscleColumn}>
            <Text style={[styles.columnHeader, { color: c.text }]}>Your Top 5</Text>
            {userTopMuscles.map((muscleData, index) => (
              <View key={muscleData.muscle} style={styles.muscleItem}>
                <Text style={[styles.muscleRank, { color: c.muted }]}>#{index + 1}</Text>
                <Text style={[styles.muscleName, { color: c.text }]} numberOfLines={1}>
                  {muscleData.muscle}
                </Text>
                <Text style={[styles.musclePercentage, { color: ds.tone.accent }]}>
                  {muscleData.percentage}%
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.muscleColumn}>
            <Text style={[styles.columnHeader, { color: c.text }]}>Average Top 5</Text>
            {averageTopMuscles.map((muscleData, index) => (
              <View key={muscleData.muscle} style={styles.muscleItem}>
                <Text style={[styles.muscleRank, { color: c.muted }]}>#{index + 1}</Text>
                <Text style={[styles.muscleName, { color: c.text }]} numberOfLines={1}>
                  {muscleData.muscle}
                </Text>
                <Text style={[styles.musclePercentage, { color: ds.tone.accent }]}>
                  {muscleData.percentage}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Key Differences */}
      {differences.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Key Differences</Text>
          <View style={styles.differencesList}>
            {differences.slice(0, 5).map((difference, index) => (
              <View key={index} style={styles.differenceItem}>
                <View style={[styles.bullet, { backgroundColor: ds.tone.accent }]} />
                <Text style={[styles.differenceText, { color: c.text }]}>{difference}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Insights</Text>
          <View style={styles.insightsList}>
            {insights.slice(0, 3).map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <View style={[styles.insightIcon, { backgroundColor: `${ds.tone.accent}20` }]}>
                  <Text style={[styles.insightIconText, { color: ds.tone.accent }]}>!</Text>
                </View>
                <Text style={[styles.insightText, { color: c.text }]}>{insight}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
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
  styleComparison: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  styleBox: {
    alignItems: "center",
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 16,
  },
  styleLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  styleValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  stylePercentage: {
    fontSize: 20,
    fontWeight: "800",
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vs: {
    fontSize: 16,
    fontWeight: "600",
  },
  muscleComparison: {
    flexDirection: "row",
    gap: 16,
  },
  muscleColumn: {
    flex: 1,
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  muscleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  muscleRank: {
    fontSize: 12,
    width: 20,
  },
  muscleName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 8,
  },
  musclePercentage: {
    fontSize: 14,
    fontWeight: "700",
    width: 40,
    textAlign: "right",
  },
  differencesList: {
    gap: 8,
  },
  differenceItem: {
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
  differenceText: {
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
});