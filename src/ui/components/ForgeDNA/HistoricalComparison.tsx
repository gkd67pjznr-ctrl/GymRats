import * as React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { makeDesignSystem } from "../../designSystem";
import { useThemeColors } from "../../../ui/theme";
import type { ForgeDNAHistoryEntry } from "../../../lib/forgeDNA/types";
import type { MuscleGroup } from "../../../data/exerciseTypes";
import { UserComparison } from "./UserComparison";

interface HistoricalComparisonProps {
  history: ForgeDNAHistoryEntry[];
  userDNA?: any; // We'll improve this typing later
  averageUserDNA?: any; // We'll improve this typing later
  differences?: string[];
  insights?: string[];
}

export function HistoricalComparison({ history }: HistoricalComparisonProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  if (!history || history.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: c.text }]}>Historical Comparison</Text>
        <Text style={[styles.noData, { color: c.muted }]}>No historical data available yet</Text>
      </View>
    );
  }

  // Get the most recent DNA entry as current
  const currentDNA = history[0]?.dnaData;
  const previousDNA = history[1]?.dnaData;

  if (!currentDNA || !previousDNA) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: c.text }]}>Historical Comparison</Text>
        <Text style={[styles.noData, { color: c.muted }]}>Need at least 2 DNA snapshots for comparison</Text>
      </View>
    );
  }

  // Calculate changes in muscle balance
  const muscleChanges: { muscle: MuscleGroup; change: number; currentValue: number; previousValue: number }[] = [];
  for (const muscle in currentDNA.muscleBalance) {
    const currentValue = currentDNA.muscleBalance[muscle as MuscleGroup];
    const previousValue = previousDNA.muscleBalance[muscle as MuscleGroup];
    const change = currentValue - previousValue;
    muscleChanges.push({
      muscle: muscle as MuscleGroup,
      change,
      currentValue,
      previousValue
    });
  }

  // Sort by absolute change to show most changed first
  muscleChanges.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  // Calculate changes in training style
  const styleChanges = {
    strength: currentDNA.trainingStyle.strength - previousDNA.trainingStyle.strength,
    volume: currentDNA.trainingStyle.volume - previousDNA.trainingStyle.volume,
    endurance: currentDNA.trainingStyle.endurance - previousDNA.trainingStyle.endurance,
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.text }]}>Historical Comparison</Text>

      {/* Date comparison */}
      <View style={styles.dateComparison}>
        <View style={styles.dateItem}>
          <Text style={[styles.dateLabel, { color: c.muted }]}>Current</Text>
          <Text style={[styles.dateValue, { color: c.text }]}>
            {new Date(currentDNA.generatedAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={[styles.vs, { color: c.muted }]}>vs</Text>
        <View style={styles.dateItem}>
          <Text style={[styles.dateLabel, { color: c.muted }]}>Previous</Text>
          <Text style={[styles.dateValue, { color: c.text }]}>
            {new Date(previousDNA.generatedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Training Style Changes */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Training Style Changes</Text>
        <View style={styles.styleGrid}>
          {Object.entries(styleChanges).map(([style, change]) => (
            <View key={style} style={styles.styleItem}>
              <Text style={[styles.styleName, { color: c.text }]}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </Text>
              <Text style={[
                styles.styleChange,
                {
                  color: change >= 0 ? ds.tone.success : ds.tone.danger
                }
              ]}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top Muscle Changes */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Top Muscle Group Changes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.muscleGrid}>
            {muscleChanges.slice(0, 6).map(({ muscle, change, currentValue, previousValue }) => (
              <View key={muscle} style={styles.muscleItem}>
                <Text style={[styles.muscleName, { color: c.text }]} numberOfLines={1}>
                  {muscle}
                </Text>
                <View style={styles.muscleValues}>
                  <Text style={[styles.muscleValue, { color: c.text }]}>
                    {currentValue}%
                  </Text>
                  <Text style={[
                    styles.muscleChange,
                    {
                      color: change >= 0 ? ds.tone.success : ds.tone.danger
                    }
                  ]}>
                    {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.max(0, Math.min(100, currentValue))}%`,
                        backgroundColor: ds.tone.accent
                      }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Timeline Overview */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Timeline Overview</Text>
        <View style={styles.timeline}>
          {history.slice(0, 5).map((entry, index) => (
            <View key={entry.id} style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  {
                    backgroundColor: index === 0 ? ds.tone.accent : c.border
                  }
                ]}
              />
              <Text style={[
                styles.timelineDate,
                {
                  color: index === 0 ? ds.tone.accent : c.muted
                }
              ]}>
                {new Date(entry.dnaData.generatedAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </View>
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
    marginBottom: 16,
  },
  noData: {
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 20,
  },
  dateComparison: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  dateItem: {
    alignItems: "center",
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  vs: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  styleGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  styleItem: {
    alignItems: "center",
    flex: 1,
  },
  styleName: {
    fontSize: 14,
    marginBottom: 4,
  },
  styleChange: {
    fontSize: 16,
    fontWeight: "700",
  },
  muscleGrid: {
    flexDirection: "row",
    gap: 16,
  },
  muscleItem: {
    width: 120,
  },
  muscleName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  muscleValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  muscleValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  muscleChange: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  timeline: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  timelineDate: {
    fontSize: 14,
  },
});