import React, { useState } from "react";
import { Modal, Pressable, Text, TextInput, View, Platform } from "react-native";
import { useThemeColors } from "../../theme";
import { FR } from "../../GrStyle";
import * as Haptics from "expo-haptics";
import { NumericKeypad } from "./NumericKeypad";

type StepOption = {
  label: string;
  value: number;
};

type PresetButton = {
  label: string;
  value: number;
};

type Props = {
  value: number;
  textValue: string;
  label: string;
  unit: string;
  onTextChange: (text: string) => void;
  onCommit: () => void;
  onDecrement: () => void;
  onIncrement: () => void;
  onStepChange?: (step: number) => void;
  min?: number;
  max?: number;
  stepOptions?: StepOption[];
  presets?: PresetButton[];
  presetContainerStyle?: "row" | "scroll";
  /** Whether to show calculator-style keypad instead of system keyboard */
  keypadMode?: boolean;
};

/**
 * NumberInput - A polished numeric input component with stepper buttons.
 *
 * Features:
 * - Large touch targets (48x48px) for +/- buttons
 * - Configurable step amounts
 * - Optional quick preset buttons
 * - Haptic feedback on interactions
 * - Dark mode styling matching GymRats aesthetic
 */
export function NumberInput({
  value,
  textValue,
  label,
  unit,
  onTextChange,
  onCommit,
  onDecrement,
  onIncrement,
  onStepChange,
  min = 0,
  max = 9999,
  stepOptions,
  presets,
  presetContainerStyle = "row",
  keypadMode = false,
}: Props) {
  const c = useThemeColors();
  const [selectedStep, setSelectedStep] = useState(0);
  const [keypadVisible, setKeypadVisible] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      triggerHaptic();
      onDecrement();
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      triggerHaptic();
      onIncrement();
    }
  };

  const handleStepChange = (index: number) => {
    triggerHaptic();
    setSelectedStep(index);
    if (onStepChange && stepOptions) {
      onStepChange(stepOptions[index].value);
    }
  };

  const handlePresetPress = (presetValue: number) => {
    triggerHaptic();
    onTextChange(presetValue.toString());
    onCommit();
  };

  const handleKeypadChange = (newValue: string) => {
    onTextChange(newValue);
  };

  const handleKeypadDone = () => {
    setKeypadVisible(false);
    onCommit();
  };

  const canDecrement = value > min;
  const canIncrement = value < max;
  const currentStep = stepOptions?.[selectedStep];
  // Determine current step value for quick adjust buttons
  const stepValue = currentStep?.value ?? 2.5;
  const stepLabel = stepValue % 1 === 0 ? stepValue.toString() : stepValue.toFixed(1);

  // Determine container class for presets
  const PresetContainer = presetContainerStyle === "row" ? View : View;
  const presetScrollProps = presetContainerStyle === "scroll"
    ? { horizontal: true, showsHorizontalScrollIndicator: false }
    : {};

  return (
    <View style={{ gap: FR.space.x2 }}>
      {/* Label with unit and quick adjust buttons */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: FR.space.x1 }}>
          <Text style={[FR.type.sub, { color: c.muted }]}>{label}</Text>
          <Text style={[FR.type.mono, { color: c.muted, opacity: 0.7 }]}>({unit})</Text>
        </View>
        {/* Quick adjust buttons for weight */}
        {unit === "lb" && (
          <View style={{ flexDirection: "row", gap: FR.space.x1, alignItems: "center" }}>
            <Pressable
              onPress={handleDecrement}
              disabled={!canDecrement}
              style={({ pressed }) => ({
                width: 28,
                height: 28,
                borderRadius: FR.radius.soft,
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.7 : canDecrement ? 1 : 0.3,
              })}
            >
              <Text style={[FR.type.mono, { color: canDecrement ? c.text : c.muted, fontSize: 14 }]}>-{stepLabel}</Text>
            </Pressable>
            <Pressable
              onPress={handleIncrement}
              disabled={!canIncrement}
              style={({ pressed }) => ({
                width: 28,
                height: 28,
                borderRadius: FR.radius.soft,
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.7 : canIncrement ? 1 : 0.3,
              })}
            >
              <Text style={[FR.type.mono, { color: canIncrement ? c.text : c.muted, fontSize: 14 }]}>+{stepLabel}</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Main input row */}
      <View style={{ flexDirection: "row", alignItems: "stretch", gap: FR.space.x2 }}>
        {/* Decrement button */}
        <Pressable
          onPress={handleDecrement}
          disabled={!canDecrement}
          style={({ pressed }) => ({
            width: 52,
            height: 52,
            borderRadius: FR.radius.button,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : canDecrement ? 1 : 0.3,
          })}
        >
          <Text style={[FR.type.h2, { color: canDecrement ? c.text : c.muted }]}>−</Text>
        </Pressable>

        {/* Text input */}
        <View style={{ flex: 1, justifyContent: "center" }}>
          {keypadMode ? (
            <Pressable
              onPress={() => setKeypadVisible(true)}
              style={({ pressed }) => ({
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: FR.radius.input,
                paddingVertical: FR.space.x3,
                paddingHorizontal: FR.space.x3,
                color: c.text,
                backgroundColor: c.bg,
                fontWeight: "900",
                fontSize: 18,
                textAlign: "center",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{
                color: c.text,
                fontWeight: "900",
                fontSize: 18,
                textAlign: "center",
              }}>
                {textValue || '0'}
              </Text>
            </Pressable>
          ) : (
            <TextInput
              value={textValue}
              keyboardType="decimal-pad"
              onChangeText={onTextChange}
              onBlur={onCommit}
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: FR.radius.input,
                paddingVertical: FR.space.x3,
                paddingHorizontal: FR.space.x3,
                color: c.text,
                backgroundColor: c.bg,
                fontWeight: "900",
                fontSize: 18,
                textAlign: "center",
              }}
            />
          )}
        </View>

        {/* Increment button */}
        <Pressable
          onPress={handleIncrement}
          disabled={!canIncrement}
          style={({ pressed }) => ({
            width: 52,
            height: 52,
            borderRadius: FR.radius.button,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : canIncrement ? 1 : 0.3,
          })}
        >
          <Text style={[FR.type.h2, { color: canIncrement ? c.text : c.muted }]}>+</Text>
        </Pressable>
      </View>

      {/* Step options (if provided) */}
      {stepOptions && stepOptions.length > 0 && (
        <View style={{ flexDirection: "row", gap: FR.space.x1, flexWrap: "wrap" }}>
          {stepOptions.map((step, index) => {
            const isSelected = selectedStep === index;
            return (
              <Pressable
                key={step.label}
                onPress={() => handleStepChange(index)}
                style={({ pressed }) => ({
                  paddingVertical: FR.space.x1,
                  paddingHorizontal: FR.space.x2,
                  borderRadius: FR.radius.soft,
                  backgroundColor: isSelected ? c.primary : c.card,
                  borderWidth: 1,
                  borderColor: isSelected ? c.primary : c.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={[
                    FR.type.mono,
                    { color: isSelected ? "#fff" : c.text },
                  ]}
                >
                  {step.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Preset buttons (if provided) */}
      {presets && presets.length > 0 && (
        <View style={{ marginTop: FR.space.x1 }}>
          <PresetContainer
            style={{ flexDirection: "row", gap: FR.space.x1 }}
            {...presetScrollProps}
          >
            {presets.map((preset) => (
              <Pressable
                key={preset.label}
                onPress={() => handlePresetPress(preset.value)}
                style={({ pressed }) => ({
                  paddingVertical: FR.space.x1,
                  paddingHorizontal: FR.space.x3,
                  borderRadius: FR.radius.soft,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={[FR.type.sub, { color: c.text }]}>
                  {preset.label}
                </Text>
              </Pressable>
            ))}
          </PresetContainer>
        </View>
      )}

      {/* Numeric Keypad Modal */}
      <Modal
        visible={keypadMode && keypadVisible}
        transparent
        animationType="slide"
        onRequestClose={handleKeypadDone}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: c.bg,
              borderTopLeftRadius: FR.radius.card,
              borderTopRightRadius: FR.radius.card,
              padding: FR.space.x4,
              paddingBottom: FR.space.x6,
            }}
          >
            <NumericKeypad
              value={textValue}
              onChange={handleKeypadChange}
              onDone={handleKeypadDone}
              decimal={unit !== 'reps'}
              maxLength={unit === 'reps' ? 3 : 6}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
