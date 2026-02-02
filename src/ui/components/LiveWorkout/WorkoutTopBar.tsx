// src/ui/components/LiveWorkout/WorkoutTopBar.tsx
// Fixed top bar for live workout - Hevy-style layout
// [Back] [Timer Icon + Duration] [Finish]

import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useThemeColors } from "../../theme";
import { FR } from "../../forgerankStyle";

export interface WorkoutTopBarProps {
  /** Formatted elapsed time (e.g., "1:14:32") */
  elapsedDisplay: string;
  /** Is rest timer currently visible/active */
  isRestTimerActive?: boolean;
  /** Callback to go back/minimize */
  onBack: () => void;
  /** Callback to finish workout */
  onFinish: () => void;
  /** Callback to show rest timer */
  onRestTimer?: () => void;
}

export function WorkoutTopBar({
  elapsedDisplay,
  isRestTimerActive,
  onBack,
  onFinish,
  onRestTimer,
}: WorkoutTopBarProps) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();

  const triggerHaptic = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleBack = () => {
    triggerHaptic();
    onBack();
  };

  const handleFinish = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onFinish();
  };

  const handleRestTimer = () => {
    triggerHaptic();
    onRestTimer?.();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: c.bg,
          borderBottomColor: c.border,
          paddingTop: insets.top + FR.space.x2,
        },
      ]}
    >
      {/* Left: Back button */}
      <Pressable
        onPress={handleBack}
        style={({ pressed }) => [
          styles.backButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Ionicons name="chevron-down" size={28} color={c.text} />
      </Pressable>

      {/* Center: Timer */}
      <Pressable
        onPress={handleRestTimer}
        style={({ pressed }) => [
          styles.timerSection,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Ionicons
          name="timer-outline"
          size={20}
          color={isRestTimerActive ? c.primary : c.muted}
        />
        <Text style={[styles.timerText, { color: c.text }]}>
          {elapsedDisplay}
        </Text>
      </Pressable>

      {/* Right: Finish button */}
      <Pressable
        onPress={handleFinish}
        style={({ pressed }) => [
          styles.finishButton,
          {
            backgroundColor: c.primary,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text style={[styles.finishText, { color: c.bg }]}>Finish</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: FR.space.x3,
    paddingBottom: FR.space.x3,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: FR.space.x1,
  },
  timerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: FR.space.x2,
  },
  timerText: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  finishButton: {
    paddingVertical: FR.space.x2,
    paddingHorizontal: FR.space.x4,
    borderRadius: FR.radius.soft,
  },
  finishText: {
    fontSize: 14,
    fontWeight: "700",
  },
});

export default WorkoutTopBar;
