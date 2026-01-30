import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { TabErrorBoundary } from "@/src/ui/tab-error-boundary";
import { useWorkoutSessions } from "@/src/lib/stores/workoutStore";
import { useBodyStatStore } from "@/src/lib/stores/bodyStatStore";
import { calculateMuscleVolumes } from "@/src/lib/volumeCalculator";
import { BodyModel } from "@/src/ui/components/BodyModel";
import { getMuscleGroups } from "@/src/data/muscleGroupsManager";
import { makeDesignSystem } from "@/src/ui/designSystem";
import { useColorScheme } from "react-native";
import { useSettings } from "@/src/lib/stores/settingsStore";

const MUSCLE_GROUPS = getMuscleGroups();

const useDesignSystem = () => {
  const { accent } = useSettings();
  const colorScheme = useColorScheme();
  return makeDesignSystem(colorScheme === 'dark' ? 'dark' : 'light', accent);
};

export default function BodyTab() {
  const ds = useDesignSystem();
  const sessions = useWorkoutSessions();
  const { muscleVolumes, updateMuscleVolumes } = useBodyStatStore();
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');

  useEffect(() => {
    const newVolumes = calculateMuscleVolumes(sessions);
    updateMuscleVolumes(newVolumes);
  }, [sessions, updateMuscleVolumes]);

  return (
    <TabErrorBoundary screenName="Body">
      <ScrollView
        style={{ flex: 1, backgroundColor: ds.tone.bg }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        <Text style={{ color: ds.tone.text, fontSize: 26, fontWeight: "900" }}>
          Body
        </Text>
        <Text style={{ color: ds.tone.muted, lineHeight: 18 }}>
          Muscle heatmap based on your training history.
        </Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: ds.tone.border,
            borderRadius: 16,
            padding: 12,
            backgroundColor: ds.tone.card,
            gap: 12,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: ds.tone.text, fontWeight: "900", fontSize: 16 }}>
              Muscle Map
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable onPress={() => setViewSide('front')}>
                <Text style={{ color: viewSide === 'front' ? ds.tone.accent : ds.tone.muted, fontWeight: 'bold' }}>Front</Text>
              </Pressable>
              <Pressable onPress={() => setViewSide('back')}>
                <Text style={{ color: viewSide === 'back' ? ds.tone.accent : ds.tone.muted, fontWeight: 'bold' }}>Back</Text>
              </Pressable>
            </View>
          </View>


          <BodyModel muscleVolumes={muscleVolumes} side={viewSide} />

        </View>
      </ScrollView>
    </TabErrorBoundary>
  );
}
