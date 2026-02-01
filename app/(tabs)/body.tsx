import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { TabErrorBoundary } from "@/src/ui/tab-error-boundary";
import { useWorkoutSessions } from "@/src/lib/stores/workoutStore";
import { calculateMuscleVolumes } from "@/src/lib/volumeCalculator";
import { BodyModel } from "@/src/ui/components/BodyModel";
import { makeDesignSystem } from "@/src/ui/designSystem";
import { useColorScheme } from "react-native";
import { useSettings } from "@/src/lib/stores/settingsStore";


const useDesignSystem = () => {
  const { accent } = useSettings();
  const colorScheme = useColorScheme();
  return makeDesignSystem(colorScheme === 'dark' ? 'dark' : 'light', accent);
};

export default function BodyTab() {
  const ds = useDesignSystem();
  const sessions = useWorkoutSessions();
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');

  // Compute filtered sessions based on time filter
  const now = Date.now();
  let filteredSessions = sessions;

  if (timeFilter === 'week') {
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    filteredSessions = sessions.filter(s => s.startedAtMs >= oneWeekAgo);
  } else if (timeFilter === 'month') {
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
    filteredSessions = sessions.filter(s => s.startedAtMs >= oneMonthAgo);
  }
  // 'all' uses all sessions

  const displayVolumes = calculateMuscleVolumes(filteredSessions);

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

          {/* Time filter toggle */}
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
            <Pressable
              onPress={() => setTimeFilter('week')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: timeFilter === 'week' ? ds.tone.accent : ds.tone.card,
                borderWidth: 1,
                borderColor: timeFilter === 'week' ? ds.tone.accent : ds.tone.border,
              }}
            >
              <Text style={{
                color: timeFilter === 'week' ? '#fff' : ds.tone.text,
                fontWeight: 'bold',
                fontSize: 12,
              }}>Week</Text>
            </Pressable>
            <Pressable
              onPress={() => setTimeFilter('month')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: timeFilter === 'month' ? ds.tone.accent : ds.tone.card,
                borderWidth: 1,
                borderColor: timeFilter === 'month' ? ds.tone.accent : ds.tone.border,
              }}
            >
              <Text style={{
                color: timeFilter === 'month' ? '#fff' : ds.tone.text,
                fontWeight: 'bold',
                fontSize: 12,
              }}>Month</Text>
            </Pressable>
            <Pressable
              onPress={() => setTimeFilter('all')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: timeFilter === 'all' ? ds.tone.accent : ds.tone.card,
                borderWidth: 1,
                borderColor: timeFilter === 'all' ? ds.tone.accent : ds.tone.border,
              }}
            >
              <Text style={{
                color: timeFilter === 'all' ? '#fff' : ds.tone.text,
                fontWeight: 'bold',
                fontSize: 12,
              }}>All Time</Text>
            </Pressable>
          </View>

          <BodyModel muscleVolumes={displayVolumes} side={viewSide} />

        </View>
      </ScrollView>
    </TabErrorBoundary>
  );
}
