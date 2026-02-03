import React, { useState } from "react";
import { Pressable, ScrollView, Text, View, Platform } from "react-native";
import { useThemeColors } from "../../theme";
import { FR } from "../../GrStyle";
import { NumberInput } from "./NumberInput";
import { PlateCalculator } from "./PlateCalculator";
import * as Haptics from "expo-haptics";

type Props = {
  weightLb: number;
  reps: number;
  weightLbText: string;
  repsText: string;

  onWeightText: (t: string) => void;
  onRepsText: (t: string) => void;
  onWeightCommit: () => void; // onBlur normalize
  onRepsCommit: () => void;

  onDecWeight: () => void;
  onIncWeight: () => void;
  onDecReps: () => void;
  onIncReps: () => void;

  onAddSet: () => void;
  onWeightStepChange?: (step: number) => void;
};

// Weight presets for quick selection (in lb)
const WEIGHT_PRESETS_LB = [
  { label: "95", value: 95 },
  { label: "135", value: 135 },
  { label: "185", value: 185 },
  { label: "225", value: 225 },
  { label: "275", value: 275 },
  { label: "315", value: 315 },
  { label: "405", value: 405 },
];

// Reps presets for quick selection
const REPS_PRESETS = [
  { label: "5", value: 5 },
  { label: "8", value: 8 },
  { label: "10", value: 10 },
  { label: "12", value: 12 },
  { label: "15", value: 15 },
];

// Step options for weight (in lb)
const WEIGHT_STEPS_LB = [
  { label: "2.5", value: 2.5 },
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "45", value: 45 },
];

export function QuickAddSetCard(props: Props) {
  const c = useThemeColors();
  const [showPlateCalc, setShowPlateCalc] = useState(false);

  const handleAddSet = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    props.onAddSet();
  };

  const handleWeightChange = (newWeight: number) => {
    props.onWeightText(newWeight.toFixed(1));
    props.onWeightCommit();
  };

  return (
    <View
      style={{
        gap: FR.space.x3,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={[FR.type.h3, { color: c.text }]}>Quick Add Set</Text>
        <Pressable
          onPress={() => setShowPlateCalc(!showPlateCalc)}
          style={({ pressed }) => ({
            paddingVertical: FR.space.x1,
            paddingHorizontal: FR.space.x2,
            borderRadius: FR.radius.soft,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={[FR.type.sub, { color: showPlateCalc ? c.primary : c.muted }]}>
            {showPlateCalc ? "▲ Plates" : "▼ Plates"}
          </Text>
        </Pressable>
      </View>

      {/* Weight Input */}
      <NumberInput
        value={props.weightLb}
        textValue={props.weightLbText}
        label="Weight"
        unit="lb"
        onTextChange={props.onWeightText}
        onCommit={props.onWeightCommit}
        onDecrement={props.onDecWeight}
        onIncrement={props.onIncWeight}
        onStepChange={props.onWeightStepChange}
        min={0}
        max={2000}
        stepOptions={WEIGHT_STEPS_LB}
        presets={WEIGHT_PRESETS_LB}
        keypadMode={true}
      />

      {/* Reps Input */}
      <NumberInput
        value={props.reps}
        textValue={props.repsText}
        label="Reps"
        unit="reps"
        onTextChange={props.onRepsText}
        onCommit={props.onRepsCommit}
        onDecrement={props.onDecReps}
        onIncrement={props.onIncReps}
        min={1}
        max={100}
        presets={REPS_PRESETS}
        keypadMode={true}
      />

      {/* Current value display */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          paddingVertical: FR.space.x2,
          borderRadius: FR.radius.soft,
          backgroundColor: c.bg,
        }}
      >
        <Text style={[FR.type.body, { color: c.muted }]}>
          Current:{" "}
          <Text style={[FR.type.body, { color: c.text, fontWeight: "900" }]}>
            {props.weightLb.toFixed(1)} lb
          </Text>{" "}
          •{" "}
          <Text style={[FR.type.body, { color: c.text, fontWeight: "900" }]}>
            {props.reps} reps
          </Text>
        </Text>
      </View>

      {/* Plate Calculator (collapsible) */}
      {showPlateCalc && (
        <PlateCalculator
          weight={props.weightLb}
          unit="lb"
          onWeightChange={handleWeightChange}
        />
      )}

      {/* Add Set Button */}
      <Pressable
        onPress={handleAddSet}
        style={({ pressed }) => ({
          paddingVertical: FR.space.x4,
          paddingHorizontal: FR.space.x4,
          borderRadius: FR.radius.button,
          backgroundColor: c.primary,
          alignItems: "center",
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={[FR.type.h3, { color: "#fff" }]}>Add Set</Text>
      </Pressable>
    </View>
  );
}
