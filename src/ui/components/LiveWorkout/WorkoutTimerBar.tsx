import { View, Text, Pressable } from "react-native";
import { useThemeColors } from "../../theme";
import { FR } from "../../forgerankStyle";
import type { WorkoutTimerResult } from "../../../lib/hooks/useWorkoutTimer";

interface WorkoutTimerBarProps {
  timer: WorkoutTimerResult;
  onPressDetails?: () => void;
}

/**
 * Workout Timer Bar
 * 
 * Shows at top of live workout:
 * - Elapsed time vs estimated time
 * - Estimated finish time
 * - Pace indicator (color coded)
 */
export function WorkoutTimerBar({ timer, onPressDetails }: WorkoutTimerBarProps) {
  const c = useThemeColors();

  const getPaceEmoji = () => {
    switch (timer.paceStatus) {
      case 'ahead': return '🟢';
      case 'on-pace': return '🟡';
      case 'behind': return '🟠';
      case 'way-behind': return '🔴';
    }
  };

  return (
    <Pressable
      onPress={onPressDetails}
      style={{
        backgroundColor: c.card,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: FR.radius.card,
        padding: FR.space.x3,
        gap: FR.space.x2,
      }}
    >
      {/* Main Time Display */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.muted, ...FR.type.sub, fontSize: 11 }}>ELAPSED</Text>
          <Text style={{ color: c.text, ...FR.type.h2 }}>{timer.elapsedDisplay}</Text>
        </View>

        <View style={{ alignItems: "center", paddingHorizontal: FR.space.x2 }}>
          <Text style={{ color: c.muted, fontSize: 20 }}>→</Text>
        </View>

        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={{ color: c.muted, ...FR.type.sub, fontSize: 11 }}>ESTIMATED</Text>
          <Text style={{ color: c.text, ...FR.type.h2 }}>{timer.estimatedTotalDisplay}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View
        style={{
          height: 4,
          backgroundColor: c.bg,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${Math.min(100, (timer.elapsedSeconds / (timer.estimatedTotalMinutes * 60)) * 100)}%`,
            backgroundColor: timer.paceColor,
          }}
        />
      </View>

      {/* Pace Info */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x1 }}>
          <Text style={{ fontSize: 14 }}>{getPaceEmoji()}</Text>
          <Text style={{ color: timer.paceColor, ...FR.type.sub, fontWeight: "700" }}>
            {timer.paceMessage}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: c.muted, ...FR.type.sub, fontSize: 11 }}>EST FINISH</Text>
          <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>
            {timer.estimatedFinishTime}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
