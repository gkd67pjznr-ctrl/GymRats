// app/workout-summary.tsx
// Post-workout summary screen showing stats, completion, and sharing options

import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useThemeColors } from "../src/ui/theme";
import { FR } from "../src/ui/GrStyle";
import { EXERCISES_V1 } from "../src/data/exercises";
import { useWorkoutStore, useIsHydrated, useJournalEntryForSession, useUser , updateJournalEntry, addJournalEntry } from "../src/lib/stores";
import { timeAgo } from "../src/lib/units";
import WorkoutNotesSection from "../src/ui/components/Journal/WorkoutNotesSection";
import { createJournalEntry, getDateFromTimestamp } from "../src/lib/journalModel";
import { MuscleId } from "../src/data/consolidatedMuscleGroups";
import { ScreenHeader } from "../src/ui/components/ScreenHeader";

type WorkoutSummaryData = {
  sessionId: string;
  durationMs: number;
  setCount: number;
  prCount: number;
  weightPRs: number;
  repPRs: number;
  e1rmPRs: number;
  completionPct?: number;
  routineName?: string;
  exerciseIds: string[];
};

function exerciseName(exerciseId: string) {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

const StatCard = ({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) => (
  <View
    style={{
      flex: 1,
      backgroundColor: "#18181b",
      borderWidth: 1,
      borderColor: "#27272a",
      borderRadius: 14,
      padding: 12,
      alignItems: "center",
      gap: 4,
    }}
  >
    <Text style={{ fontSize: 11, fontWeight: "600", color: "#a1a1aa" }}>{label}</Text>
    <Text style={{ fontSize: 24, fontWeight: "900", color: "#fafafa" }}>{value}</Text>
    {subtext && <Text style={{ fontFamily: "monospace", color: "#a1a1aa", fontSize: 11 }}>{subtext}</Text>}
  </View>
);

export default function WorkoutSummary() {
  const c = useThemeColors();
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

  // Get the workout session - wait for hydration
  const hydrated = useIsHydrated();
  const sessions = useWorkoutStore((state) => state.workouts);
  const user = useUser();
  // Get existing journal entry for this session
  const existingJournalEntry = useJournalEntryForSession(sessionId || "");
  const [summary, setSummary] = useState<WorkoutSummaryData | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [endedAtMs, setEndedAtMs] = useState<number | null>(null);

  useEffect(() => {
    // Wait for hydration before accessing sessions
    if (!hydrated) return;

    if (!sessionId) {
      router.replace("/");
      return;
    }

    // Ensure sessions is an array before calling find
    const sessionsArray = sessions ?? [];
    const foundSession = sessionsArray.find((s) => s.id === sessionId);
    if (!foundSession) {
      // Session not found, go home
      router.replace("/");
      return;
    }

    // Use stored PR counts from the workout session
    const prCount = foundSession.prCount ?? 0;
    const weightPRs = foundSession.weightPRs ?? 0;
    const repPRs = foundSession.repPRs ?? 0;
    const e1rmPRs = foundSession.e1rmPRs ?? 0;

    // Calculate completion % if following a routine
    let completionPct: number | undefined;
    if (foundSession.plannedExercises && foundSession.plannedExercises.length > 0) {
      const totalTargetSets = foundSession.plannedExercises.reduce(
        (sum, ex) => sum + (ex.targetSets || 0),
        0
      );
      const completedSets = foundSession.sets.length;
      completionPct = totalTargetSets > 0
        ? Math.round((Math.min(completedSets, totalTargetSets) / totalTargetSets) * 100)
        : 0;
    }

    const exerciseIds = Array.from(new Set(foundSession.sets.map((s) => s.exerciseId)));

    setSession(foundSession);
    setSummary({
      sessionId: foundSession.id,
      durationMs: foundSession.endedAtMs - foundSession.startedAtMs,
      setCount: foundSession.sets.length,
      prCount,
      weightPRs,
      repPRs,
      e1rmPRs,
      completionPct,
      routineName: foundSession.routineName,
      exerciseIds,
    });
    setEndedAtMs(foundSession.endedAtMs);
  }, [hydrated, sessionId, sessions, router]);

  if (!summary) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleShare = async () => {
    setIsSharing(true);
    // TODO: Implement sharing to feed
    // For now, just show a success message
    setTimeout(() => {
      setIsSharing(false);
    }, 1000);
  };

  const handleDone = () => {
    router.replace("/");
  };

  const handleSaveJournal = async (data: {
    text: string;
    mood?: number;
    energy?: number;
    soreness?: MuscleId[];
  }) => {
    if (!user?.id || !session) return;

    const sessionDate = getDateFromTimestamp(session.startedAtMs);

    if (existingJournalEntry) {
      // Update existing journal entry
      updateJournalEntry(existingJournalEntry.id, {
        text: data.text,
        mood: data.mood,
        energy: data.energy,
        soreness: data.soreness,
      });

      // Also update the workout session with journal fields
      useWorkoutStore.getState().updateSession(session.id, {
        notes: data.text,
        mood: data.mood,
        energy: data.energy,
        soreness: data.soreness,
      });
    } else {
      // Create new journal entry
      const journalEntry = createJournalEntry(
        user.id,
        sessionDate,
        data.text,
        session.id,
        data.mood,
        data.energy,
        data.soreness
      );
      addJournalEntry(journalEntry);

      // Also update the workout session with journal fields
      useWorkoutStore.getState().updateSession(session.id, {
        notes: data.text,
        mood: data.mood,
        energy: data.energy,
        soreness: data.soreness,
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScreenHeader title="Workout Complete" />
      <ScrollView
        contentContainerStyle={{
          padding: FR.space.x4,
          gap: FR.space.x4,
          paddingBottom: 120,
        }}
      >
        {/* Header */}
        <View style={{ gap: FR.space.x2, alignItems: "center" }}>
          <Text style={[FR.type.body, { color: c.muted }]}>
            {endedAtMs ? timeAgo(endedAtMs) : "Just now"}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
          <StatCard label="Duration" value={formatDuration(summary.durationMs)} />
          <StatCard label="Sets" value={summary.setCount} />
          <StatCard label="PRs" value={summary.prCount} subtext={"new records"} />
        </View>

        {/* PR Breakdown (only show if PRs achieved) */}
        {summary.prCount > 0 && (
          <View
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: FR.radius.card,
              padding: FR.space.x3,
              backgroundColor: c.card,
              gap: FR.space.x2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x2 }}>
              <Text style={{ fontSize: 24 }}>🏆</Text>
              <Text style={[FR.type.h3, { color: c.text }]}>Personal Records</Text>
            </View>

            <View style={{ flexDirection: "row", gap: FR.space.x3 }}>
              {summary.weightPRs > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 16 }}>🏋️</Text>
                  <Text style={[FR.type.body, { color: c.text }]}>
                    {summary.weightPRs} Weight
                  </Text>
                </View>
              )}
              {summary.repPRs > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 16 }}>💪</Text>
                  <Text style={[FR.type.body, { color: c.text }]}>
                    {summary.repPRs} Rep
                  </Text>
                </View>
              )}
              {summary.e1rmPRs > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 16 }}>🔥</Text>
                  <Text style={[FR.type.body, { color: c.text }]}>
                    {summary.e1rmPRs} e1RM
                  </Text>
                </View>
              )}
            </View>

            {summary.prCount >= 3 && (
              <Text style={[FR.type.sub, { color: c.primary, fontWeight: "700" }]}>
                🎉 Hat Trick! {summary.prCount} PRs in one workout!
              </Text>
            )}
          </View>
        )}

        {/* Routine Completion */}
        {summary.completionPct !== undefined && (
          <View
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: FR.radius.card,
              padding: FR.space.x3,
              backgroundColor: c.card,
              gap: FR.space.x2,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[FR.type.h3, { color: c.text }]}>
                {summary.routineName || "Routine"} Progress
              </Text>
              <Text style={[FR.type.h3, { color: c.primary }]}>{summary.completionPct}%</Text>
            </View>

            {/* Progress Bar */}
            <View
              style={{
                height: 8,
                backgroundColor: c.bg,
                borderRadius: FR.radius.pill,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${summary.completionPct}%`,
                  backgroundColor:
                    summary.completionPct >= 100
                      ? c.success
                      : summary.completionPct >= 50
                        ? c.primary
                        : c.warning,
                  borderRadius: FR.radius.pill,
                }}
              />
            </View>

            <Text style={[FR.type.sub, { color: c.muted }]}>
              {summary.completionPct >= 100
                ? "Full workout completed! 💪"
                : summary.completionPct >= 75
                  ? "Almost there, great work!"
                  : summary.completionPct >= 50
                    ? "Good progress, keep going!"
                    : "Good start!"}
            </Text>
          </View>
        )}

        {/* Exercises List */}
        {summary.exerciseIds.length > 0 && (
          <View style={{ gap: FR.space.x2 }}>
            <Text style={[FR.type.h3, { color: c.text }]}>Exercises</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: FR.radius.card,
                padding: FR.space.x3,
                backgroundColor: c.card,
                gap: FR.space.x2,
              }}
            >
              {summary.exerciseIds.map((exerciseId) => (
                <Text key={exerciseId} style={[FR.type.body, { color: c.text }]}>
                  • {exerciseName(exerciseId)}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Journal Notes Section */}
        {session && user && (
          <WorkoutNotesSection
            sessionId={session.id}
            sessionDate={getDateFromTimestamp(session.startedAtMs)}
            userId={user.id}
            existingEntry={existingJournalEntry}
            onSave={handleSaveJournal}
            compact={false}
          />
        )}
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: FR.space.x4,
          backgroundColor: c.bg,
          borderTopWidth: 1,
          borderTopColor: c.border,
          gap: FR.space.x2,
        }}
      >
        <Pressable
          onPress={handleShare}
          disabled={isSharing}
          style={({ pressed }) => ({
            paddingVertical: FR.space.x4,
            borderRadius: FR.radius.button,
            backgroundColor: c.primary,
            alignItems: "center",
            opacity: pressed || isSharing ? 0.7 : 1,
          })}
        >
          {isSharing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[FR.type.h3, { color: "#fff", fontWeight: "900" }]}>Share to Feed</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push(`/workout-replay?sessionId=${sessionId}` as any)}
          style={({ pressed }) => ({
            paddingVertical: FR.space.x4,
            borderRadius: FR.radius.button,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={[FR.type.h3, { color: c.text }]}>Replay Workout</Text>
        </Pressable>

        <Pressable
          onPress={handleDone}
          style={({ pressed }) => ({
            paddingVertical: FR.space.x4,
            borderRadius: FR.radius.button,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={[FR.type.h3, { color: c.text }]}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}
