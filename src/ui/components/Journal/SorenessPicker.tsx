// src/ui/components/Journal/SorenessPicker.tsx
// Muscle group picker for soreness tracking

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useThemeColors } from "@/src/ui/theme";
import { makeDesignSystem } from "@/src/ui/designSystem";
import { MuscleId, MUSCLE_GROUPS } from "@/src/data/consolidatedMuscleGroups";

export interface SorenessPickerProps {
  selectedMuscles: MuscleId[];
  onMuscleToggle: (muscleId: MuscleId) => void;
  disabled?: boolean;
  maxSelection?: number;
  showRegions?: boolean;
}

export const SorenessPicker: React.FC<SorenessPickerProps> = ({
  selectedMuscles,
  onMuscleToggle,
  disabled = false,
  maxSelection = 10,
  showRegions = true,
}) => {
  const colors = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const handleMusclePress = (muscleId: MuscleId) => {
    if (disabled) return;

    // If already selected, remove it
    if (selectedMuscles.includes(muscleId)) {
      onMuscleToggle(muscleId);
      return;
    }

    // If not selected, check max selection
    if (selectedMuscles.length < maxSelection) {
      onMuscleToggle(muscleId);
    }
  };

  const isSelected = (muscleId: MuscleId) => selectedMuscles.includes(muscleId);

  // Group muscles by region for better organization
  const musclesByRegion = MUSCLE_GROUPS.reduce((acc, muscle) => {
    if (!acc[muscle.region]) {
      acc[muscle.region] = [];
    }
    acc[muscle.region].push(muscle);
    return acc;
  }, {} as Record<string, typeof MUSCLE_GROUPS>);

  const regionLabels: Record<string, string> = {
    upper_front: "Upper Body (Front)",
    upper_back: "Upper Body (Back)",
    lower_body: "Lower Body",
  };

  const renderMuscleChip = (muscle: (typeof MUSCLE_GROUPS)[0]) => {
    const selected = isSelected(muscle.id);

    return (
      <TouchableOpacity
        key={muscle.id}
        onPress={() => handleMusclePress(muscle.id)}
        disabled={disabled}
        activeOpacity={0.7}
        style={[
          styles.muscleChip,
          {
            backgroundColor: selected ? ds.tone.accent : colors.card,
            borderColor: selected ? ds.tone.accent : colors.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.muscleChipText,
            {
              color: selected ? colors.bg : colors.text,
              fontWeight: selected ? "700" : "500",
            },
          ]}
        >
          {muscle.displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRegion = (region: string, muscles: typeof MUSCLE_GROUPS) => (
    <View key={region} style={styles.regionContainer}>
      {showRegions && (
        <Text style={[styles.regionLabel, { color: colors.text }]}>
          {regionLabels[region] || region}
        </Text>
      )}
      <View style={styles.muscleGrid}>
        {muscles.map(renderMuscleChip)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Select Sore Muscles
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {selectedMuscles.length}/{maxSelection} selected
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(musclesByRegion).map(([region, muscles]) =>
          renderRegion(region, muscles)
        )}
      </ScrollView>

      {selectedMuscles.length >= maxSelection && (
        <View style={styles.limitWarning}>
          <Text style={[styles.limitWarningText, { color: colors.warning }]}>
            Maximum {maxSelection} muscles can be selected
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxHeight: 400,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: {
    width: "100%",
  },
  regionContainer: {
    marginBottom: 20,
  },
  regionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  muscleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  muscleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
  },
  muscleChipText: {
    fontSize: 13,
    textAlign: "center",
  },
  limitWarning: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  limitWarningText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default SorenessPicker;