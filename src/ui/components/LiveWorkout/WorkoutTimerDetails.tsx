import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { useThemeColors } from "../../theme";
import { FR } from "../../GrStyle";
import type { WorkoutTimerResult } from "../../../lib/hooks/useWorkoutTimer";

interface WorkoutTimerDetailsProps {
  visible: boolean;
  timer: WorkoutTimerResult;
  onClose: () => void;
}

/**
 * Timer Details Modal
 * 
 * Shows detailed breakdown of time estimation
 */
export function WorkoutTimerDetails({ visible, timer, onClose }: WorkoutTimerDetailsProps) {
  const c = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: c.bg,
            borderTopLeftRadius: FR.radius.card,
            borderTopRightRadius: FR.radius.card,
            maxHeight: "80%",
          }}
        >
          <ScrollView contentContainerStyle={{ padding: FR.space.x4, gap: FR.space.x3 }}>
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: c.text, ...FR.type.h2 }}>Workout Timer</Text>
              <Pressable onPress={onClose}>
                <Text style={{ color: c.text, fontSize: 24 }}>✕</Text>
              </Pressable>
            </View>

            {/* Current Status */}
            <View
              style={{
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: FR.radius.card,
                padding: FR.space.x3,
                gap: FR.space.x2,
              }}
            >
              <Text style={{ color: c.text, ...FR.type.h3 }}>Current Status</Text>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: c.muted, ...FR.type.body }}>Elapsed</Text>
                <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>
                  {timer.elapsedDisplay}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: c.muted, ...FR.type.body }}>Estimated Total</Text>
                <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>
                  {timer.estimatedTotalDisplay}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: c.muted, ...FR.type.body }}>Est. Finish</Text>
                <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>
                  {timer.estimatedFinishTime}
                </Text>
              </View>

              <View
                style={{
                  marginTop: FR.space.x2,
                  paddingTop: FR.space.x2,
                  borderTopWidth: 1,
                  borderTopColor: c.border,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: c.muted, ...FR.type.body }}>Pace</Text>
                  <Text style={{ color: timer.paceColor, ...FR.type.body, fontWeight: "900" }}>
                    {timer.paceMessage}
                  </Text>
                </View>
              </View>
            </View>

            {/* Time Breakdown */}
            <View
              style={{
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: FR.radius.card,
                padding: FR.space.x3,
                gap: FR.space.x2,
              }}
            >
              <Text style={{ color: c.text, ...FR.type.h3 }}>Time Breakdown</Text>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: c.muted, ...FR.type.body }}>💪 Working Sets</Text>
                <Text style={{ color: c.text, ...FR.type.body }}>
                  {timer.breakdown.workSets} min
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: c.muted, ...FR.type.body }}>⏸️ Rest Time</Text>
                <Text style={{ color: c.text, ...FR.type.body }}>
                  {timer.breakdown.restTime} min
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: c.muted, ...FR.type.body }}>🔄 Equipment Changes</Text>
                <Text style={{ color: c.text, ...FR.type.body }}>
                  {timer.breakdown.equipmentChanges} min
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: c.muted, ...FR.type.body }}>⚙️ Setup Buffer</Text>
                <Text style={{ color: c.text, ...FR.type.body }}>
                  {timer.breakdown.setupBuffer} min
                </Text>
              </View>
            </View>

            {/* Tips */}
            <View
              style={{
                backgroundColor: timer.paceColor + "20",
                borderWidth: 1,
                borderColor: timer.paceColor,
                borderRadius: FR.radius.card,
                padding: FR.space.x3,
                gap: FR.space.x1,
              }}
            >
              <Text style={{ color: timer.paceColor, ...FR.type.body, fontWeight: "700" }}>
                💡 Tip
              </Text>
              <Text style={{ color: c.text, ...FR.type.sub }}>
                {timer.paceStatus === 'way-behind'
                  ? "You're behind schedule. Consider shortening rest times or reducing sets to finish on time."
                  : timer.paceStatus === 'behind'
                  ? "You're slightly behind. Speed up rest periods to get back on track."
                  : timer.paceStatus === 'ahead'
                  ? "You're ahead of schedule! Take your time with proper form."
                  : "You're right on pace. Keep up the good work!"}
              </Text>
            </View>

            {/* Close Button */}
            <Pressable
              onPress={onClose}
              style={{
                paddingVertical: FR.space.x3,
                borderRadius: FR.radius.button,
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: "center",
              }}
            >
              <Text style={{ color: c.text, ...FR.type.body }}>Close</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
