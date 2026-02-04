// app/(tabs)/workout.tsx
// Workout Hub - Central entry point for all workout activities

import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "../../src/ui/theme";
import { EXERCISES_V1 } from "../../src/data/exercises";
import {
  ensureCurrentSession,
  useCurrentSession,
} from "../../src/lib/stores";
import { useWorkoutDrawerStore } from "../../src/lib/stores/workoutDrawerStore";
import { useRoutinesStore } from "../../src/lib/stores/routinesStore";
import { TabErrorBoundary } from "../../src/ui/tab-error-boundary";

// Format duration for active workout display
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function WorkoutHub() {
  const c = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Session state
  const session = useCurrentSession();
  const hasSession = !!session && (session.sets?.length > 0 || session.exerciseBlocks?.length > 0);
  const setCount = session?.sets?.length ?? 0;
  const completedSetCount = Object.values(session?.doneBySetId ?? {}).filter(Boolean).length;
  const exerciseCount = session?.exerciseBlocks?.length ?? 0;

  // Drawer controls
  const { startWorkout, openDrawer, hasActiveWorkout } = useWorkoutDrawerStore();

  // Routines for quick access
  const routines = useRoutinesStore((s) => s.routines);
  const recentRoutines = routines.slice(0, 3);

  // Start or resume workout
  const handleStartFreestyle = () => {
    if (!hasSession) {
      const firstExerciseId = EXERCISES_V1[0]?.id ?? null;
      ensureCurrentSession({
        selectedExerciseId: firstExerciseId,
        exerciseBlocks: firstExerciseId ? [firstExerciseId] : [],
      });
    }
    if (hasActiveWorkout) {
      openDrawer();
    } else {
      startWorkout();
    }
  };

  // Resume existing workout
  const handleResumeWorkout = () => {
    if (hasActiveWorkout) {
      openDrawer();
    } else {
      startWorkout();
    }
  };

  // Calculate elapsed time for active session
  const elapsedMs = session?.startedAtMs ? Date.now() - session.startedAtMs : 0;

  return (
    <TabErrorBoundary screenName="Workout">
      <ScrollView
        style={[styles.container, { backgroundColor: c.bg }]}
        contentContainerStyle={[styles.content, { paddingTop: 16, paddingBottom: insets.bottom + 100 }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.text }]}>Workout</Text>
        </View>

        {/* Active Workout Banner */}
        {hasSession && (
          <Pressable
            onPress={handleResumeWorkout}
            style={[styles.activeBanner, { backgroundColor: c.primary }]}
          >
            <View style={styles.activeBannerContent}>
              <View style={styles.activeBannerLeft}>
                <View style={styles.activePulse}>
                  <View style={[styles.pulseCircle, { backgroundColor: '#fff' }]} />
                </View>
                <View>
                  <Text style={styles.activeBannerTitle}>Workout In Progress</Text>
                  <Text style={styles.activeBannerSubtitle}>
                    {formatDuration(elapsedMs)} · {completedSetCount}/{setCount} sets · {exerciseCount} exercises
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </View>
          </Pressable>
        )}

        {/* Quick Start Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Quick Start</Text>

          <View style={styles.quickStartGrid}>
            {/* Freestyle */}
            <Pressable
              onPress={handleStartFreestyle}
              style={[styles.quickStartCard, { backgroundColor: c.card, borderColor: c.border }]}
            >
              <View style={[styles.quickStartIcon, { backgroundColor: `${c.primary}20` }]}>
                <Ionicons name="flash" size={24} color={c.primary} />
              </View>
              <Text style={[styles.quickStartTitle, { color: c.text }]}>Freestyle</Text>
              <Text style={[styles.quickStartSubtitle, { color: c.muted }]}>
                Start empty, add exercises as you go
              </Text>
            </Pressable>

            {/* From Routine */}
            <Pressable
              onPress={() => router.push("/routines")}
              style={[styles.quickStartCard, { backgroundColor: c.card, borderColor: c.border }]}
            >
              <View style={[styles.quickStartIcon, { backgroundColor: `${c.primary}20` }]}>
                <Ionicons name="list" size={24} color={c.primary} />
              </View>
              <Text style={[styles.quickStartTitle, { color: c.text }]}>My Routines</Text>
              <Text style={[styles.quickStartSubtitle, { color: c.muted }]}>
                {routines.length > 0 ? `${routines.length} saved` : "Create your first"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Routines (if any) */}
        {recentRoutines.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Recent Routines</Text>
              <Pressable onPress={() => router.push("/routines")}>
                <Text style={[styles.seeAll, { color: c.primary }]}>See All</Text>
              </Pressable>
            </View>

            {recentRoutines.map((routine) => (
              <RoutineRow
                key={routine.id}
                name={routine.name}
                exerciseCount={routine.exercises?.length ?? 0}
                onPress={() => router.push(`/routines/${routine.id}`)}
                colors={c}
              />
            ))}
          </View>
        )}

        {/* Discover Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Discover</Text>

          <Pressable
            onPress={() => router.push("/workout/browse-plans")}
            style={[styles.discoverCard, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <View style={styles.discoverCardContent}>
              <View style={[styles.discoverIcon, { backgroundColor: '#4ECDC420' }]}>
                <Ionicons name="compass" size={28} color="#4ECDC4" />
              </View>
              <View style={styles.discoverText}>
                <Text style={[styles.discoverTitle, { color: c.text }]}>Browse Plans</Text>
                <Text style={[styles.discoverSubtitle, { color: c.muted }]}>
                  Curated workout programs for every goal
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={c.muted} />
          </Pressable>

          <Pressable
            onPress={() => router.push("/workout/ai-generate")}
            style={[styles.discoverCard, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <View style={styles.discoverCardContent}>
              <View style={[styles.discoverIcon, { backgroundColor: '#9B59B620' }]}>
                <Ionicons name="sparkles" size={28} color="#9B59B6" />
              </View>
              <View style={styles.discoverText}>
                <Text style={[styles.discoverTitle, { color: c.text }]}>AI Generator</Text>
                <Text style={[styles.discoverSubtitle, { color: c.muted }]}>
                  Create a custom plan tailored to you
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={c.muted} />
          </Pressable>
        </View>

        {/* Social Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Social</Text>

          <Pressable
            onPress={() => router.push("/live-workout-together")}
            style={[styles.socialCard, { backgroundColor: c.card, borderColor: '#FF6B6B40' }]}
          >
            <View style={styles.socialCardContent}>
              <View style={[styles.socialIcon, { backgroundColor: '#FF6B6B20' }]}>
                <Ionicons name="people" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.socialText}>
                <Text style={[styles.socialTitle, { color: c.text }]}>Workout Together</Text>
                <Text style={[styles.socialSubtitle, { color: c.muted }]}>
                  Train with friends in real-time
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={c.muted} />
          </Pressable>
        </View>

        {/* History Link */}
        <View style={styles.section}>
          <Pressable
            onPress={() => router.push("/history")}
            style={[styles.historyCard, { borderColor: c.border }]}
          >
            <View style={styles.historyContent}>
              <Ionicons name="time-outline" size={20} color={c.muted} />
              <Text style={[styles.historyText, { color: c.muted }]}>View Workout History</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.muted} />
          </Pressable>
        </View>
      </ScrollView>
    </TabErrorBoundary>
  );
}

// Routine row component
function RoutineRow({
  name,
  exerciseCount,
  onPress,
  colors: c
}: {
  name: string;
  exerciseCount: number;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.routineRow, { backgroundColor: c.card, borderColor: c.border }]}
    >
      <View style={styles.routineRowLeft}>
        <View style={[styles.routineIcon, { backgroundColor: `${c.primary}15` }]}>
          <Ionicons name="barbell-outline" size={18} color={c.primary} />
        </View>
        <View>
          <Text style={[styles.routineName, { color: c.text }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.routineExercises, { color: c.muted }]}>
            {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={c.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 20,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
  },

  // Active workout banner
  activeBanner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  activeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activePulse: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeBannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  activeBannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },

  // Section
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Quick start grid
  quickStartGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStartCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  quickStartIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStartTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  quickStartSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Routine row
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  routineRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  routineIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineName: {
    fontSize: 15,
    fontWeight: '600',
  },
  routineExercises: {
    fontSize: 12,
    marginTop: 1,
  },

  // Discover cards
  discoverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  discoverCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  discoverIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discoverText: {
    flex: 1,
  },
  discoverTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  discoverSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Social card
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  socialCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    flex: 1,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  socialSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // History card
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderTopWidth: 1,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
