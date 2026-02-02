import React, { useState, useMemo } from "react";
import { Pressable, ScrollView, Text, View , Platform } from "react-native";
import { useThemeColors } from "../../theme";
import { FR } from "../../forgerankStyle";
import * as Haptics from "expo-haptics";

type Unit = "lb" | "kg";

type Plate = {
  weight: number;
  count: number;
  color: string;
};

type Props = {
  weight: number;
  unit: Unit;
  onWeightChange?: (newWeight: number) => void;
};

// Standard barbell weights
const BAR_WEIGHT_LB = 45;
const BAR_WEIGHT_KG = 20;

// Imperial plate colors (standard)
const PLATE_COLORS_LB: Record<number, string> = {
  45: "#3b82f6", // Blue
  35: "#eab308", // Yellow
  25: "#22c55e", // Green
  10: "#ffffff", // White
  5: "#a855f7", // Purple (actually 5.5 is red in some comps, using purple for visibility)
  2.5: "#f97316", // Orange
};

// Metric plate colors
const PLATE_COLORS_KG: Record<number, string> = {
  20: "#3b82f6", // Blue
  15: "#eab308", // Yellow
  10: "#22c55e", // Green
  5: "#ffffff", // White
  2.5: "#a855f7", // Purple
  1.25: "#f97316", // Orange
};

// Plate sizes available for each unit
const PLATE_SIZES_LB = [45, 35, 25, 10, 5, 2.5];
const PLATE_SIZES_KG = [20, 15, 10, 5, 2.5, 1.25];

/**
 * Calculate the plates needed for a given weight.
 * Returns an array of plates with their count.
 */
function calculatePlates(totalWeight: number, unit: Unit): Plate[] {
  const barWeight = unit === "lb" ? BAR_WEIGHT_LB : BAR_WEIGHT_KG;
  const plateSizes = unit === "lb" ? PLATE_SIZES_LB : PLATE_SIZES_KG;
  const plateColors = unit === "lb" ? PLATE_COLORS_LB : PLATE_COLORS_KG;

  // Weight available for plates (total minus bar)
  const weightForPlates = Math.max(0, totalWeight - barWeight);

  // Plates on each side (half of plate weight)
  const weightPerSide = weightForPlates / 2;

  const plates: Plate[] = [];
  let remaining = weightPerSide;

  // Greedy algorithm: use largest plates first
  for (const size of plateSizes) {
    if (remaining >= size) {
      const count = Math.floor(remaining / size);
      if (count > 0) {
        plates.push({
          weight: size,
          count,
          color: plateColors[size],
        });
        remaining -= count * size;
      }
    }
  }

  // Round small remainders to handle floating point precision
  if (remaining > 0.01 && remaining < 1.25) {
    // Show if there's a small remainder due to precision
    plates.push({
      weight: unit === "lb" ? 2.5 : 1.25,
      count: 1,
      color: unit === "lb" ? PLATE_COLORS_LB[2.5] : PLATE_COLORS_KG[1.25],
    });
  }

  return plates;
}

/**
 * Get the plate width based on weight (thicker plates are wider visually)
 */
function getPlateWidth(weight: number, unit: Unit): number {
  // Base width + additional width for heavier plates
  const baseWidth = 8;
  if (unit === "lb") {
    if (weight >= 45) return baseWidth + 8;
    if (weight >= 35) return baseWidth + 6;
    if (weight >= 25) return baseWidth + 4;
    return baseWidth + 2;
  } else {
    if (weight >= 20) return baseWidth + 8;
    if (weight >= 15) return baseWidth + 6;
    if (weight >= 10) return baseWidth + 4;
    return baseWidth + 2;
  }
}

/**
 * PlateCalculator - Visual representation of plates on a barbell.
 *
 * Features:
 * - Shows exact plate combination for target weight
 * - Supports both imperial (lb) and metric (kg)
 * - Collapsible to save space
 * - Optional quick-add buttons to add plates
 */
export function PlateCalculator({ weight, unit, onWeightChange }: Props) {
  const c = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);

  const plates = useMemo(() => calculatePlates(weight, unit), [weight, unit]);

  const barWeight = unit === "lb" ? BAR_WEIGHT_LB : BAR_WEIGHT_KG;
  const plateSizes = unit === "lb" ? PLATE_SIZES_LB : PLATE_SIZES_KG;

  const toggleExpanded = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsExpanded(!isExpanded);
  };

  const handleAddPlate = (plateWeight: number) => {
    if (onWeightChange) {
      // Add one plate to each side (2x plate weight)
      const newWeight = weight + plateWeight * 2;
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onWeightChange(newWeight);
    }
  };

  const totalPlatesWeight = plates.reduce(
    (sum, plate) => sum + plate.weight * plate.count * 2, // *2 for both sides
    0
  );

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: FR.radius.card,
        backgroundColor: c.card,
        overflow: "hidden",
      }}
    >
      {/* Header - always visible */}
      <Pressable
        onPress={toggleExpanded}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: FR.space.x3,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x2 }}>
          <Text style={[FR.type.body, { color: c.text }]}>Plate Calculator</Text>
          {totalPlatesWeight > 0 && (
            <View style={{
              backgroundColor: c.primary,
              paddingHorizontal: FR.space.x2,
              paddingVertical: 2,
              borderRadius: FR.radius.soft,
            }}>
              <Text style={[FR.type.mono, { color: "#fff", fontSize: 11 }]}>
                {totalPlatesWeight} {unit}
              </Text>
            </View>
          )}
        </View>
        <Text style={[FR.type.h2, { color: c.muted }]}>
          {isExpanded ? "▼" : "▶"}
        </Text>
      </Pressable>

      {/* Expanded content */}
      {isExpanded && (
        <View style={{ padding: FR.space.x3, gap: FR.space.x3, borderTopWidth: 1, borderTopColor: c.border }}>
          {/* Barbell visualization */}
          <View style={{ alignItems: "center", paddingVertical: FR.space.x2 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                height: 24,
              }}
            >
              {/* Left plates */}
              <View style={{ flexDirection: "row", marginRight: 2 }}>
                {[...plates].reverse().map((plate) =>
                  Array.from({ length: plate.count }).map((_, i) => (
                    <View
                      key={`left-${plate.weight}-${i}`}
                      style={{
                        width: getPlateWidth(plate.weight, unit),
                        height: 20,
                        backgroundColor: plate.color,
                        marginRight: 1,
                        borderRadius: 2,
                        borderLeftWidth: 1,
                        borderLeftColor: c.border,
                      }}
                    />
                  ))
                )}
              </View>

              {/* Bar */}
              <View
                style={{
                  flex: 1,
                  height: 8,
                  backgroundColor: c.border,
                  borderRadius: 4,
                }}
              />

              {/* Right plates */}
              <View style={{ flexDirection: "row", marginLeft: 2 }}>
                {plates.map((plate) =>
                  Array.from({ length: plate.count }).map((_, i) => (
                    <View
                      key={`right-${plate.weight}-${i}`}
                      style={{
                        width: getPlateWidth(plate.weight, unit),
                        height: 20,
                        backgroundColor: plate.color,
                        marginLeft: 1,
                        borderRadius: 2,
                        borderRightWidth: 1,
                        borderRightColor: c.border,
                      }}
                    />
                  ))
                )}
              </View>
            </View>

            {/* Weight breakdown text */}
            <Text style={[FR.type.mono, { color: c.muted, marginTop: FR.space.x2 }]}>
              {barWeight} {unit} bar
              {plates.length > 0
                ? plates.map((p) => ` + ${p.count}×${p.weight}`).join("")
                : " (no plates)"}
            </Text>
          </View>

          {/* Plate legend */}
          {plates.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: FR.space.x2 }}>
              {plates.map((plate) => (
                <View key={plate.weight} style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x1 }}>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor: plate.color,
                      borderWidth: 1,
                      borderColor: c.border,
                    }}
                  />
                  <Text style={[FR.type.mono, { color: c.text }]}>
                    {plate.count}×{plate.weight}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Quick add buttons (if onWeightChange provided) */}
          {onWeightChange && (
            <View style={{ gap: FR.space.x2 }}>
              <Text style={[FR.type.sub, { color: c.muted }]}>Quick Add (per side)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexDirection: "row" }}
              >
                <View style={{ flexDirection: "row", gap: FR.space.x1 }}>
                  {plateSizes.map((size) => {
                    const plateColor = unit === "lb" ? PLATE_COLORS_LB[size] : PLATE_COLORS_KG[size];
                    return (
                      <Pressable
                        key={size}
                        onPress={() => handleAddPlate(size)}
                        style={({ pressed }) => ({
                          flexDirection: "row",
                          alignItems: "center",
                          gap: FR.space.x1,
                          paddingVertical: FR.space.x2,
                          paddingHorizontal: FR.space.x3,
                          borderRadius: FR.radius.button,
                          backgroundColor: c.bg,
                          borderWidth: 1,
                          borderColor: c.border,
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <View
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 2,
                            backgroundColor: plateColor,
                            borderWidth: 1,
                            borderColor: c.border,
                          }}
                        />
                        <Text style={[FR.type.sub, { color: c.text }]}>
                          +{size * 2}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Info text */}
          <Text style={[FR.type.mono, { color: c.muted, fontSize: 10, textAlign: "center" }]}>
            {unit === "lb"
              ? "Standard 45lb barbell with Olympic plates"
              : "Standard 20kg barbell with metric plates"}
          </Text>
        </View>
      )}
    </View>
  );
}
