// app/(tabs)/leaderboard.tsx
// Leaderboard screens showing rankings across exercises, users, and activity

import { useState, useMemo } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { useThemeColors } from "../../src/ui/theme";
import { TabErrorBoundary } from "../../src/ui/tab-error-boundary";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { useUser } from "../../src/lib/stores/authStore";
import { useWorkoutSessions } from "../../src/lib/stores";
import { EXERCISES_V1 } from "../../src/data/exercises";
import type { WorkoutSet } from "../../src/lib/workoutModel";
import { FR } from "../../src/ui/forgerankStyle";

type LeaderboardTab = "exercises" | "users" | "volume" | "streaks";

type LeaderboardEntry = {
  rank: number;
  userId: string;
  userName: string;
  value: number;
  display: string;
};

type ExerciseRank = LeaderboardEntry & { exerciseId: string };

export default function LeaderboardTab() {
  const c = useThemeColors();
  const user = useUser();
  const sessions = useWorkoutSessions();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("exercises");
  const userId = user?.id ?? "u_demo_me";

  // Calculate exercise rankings
  const exerciseRankings = useMemo(() => {
    const rankings: ExerciseRank[] = [];

    for (const exercise of EXERCISES_V1) {
      const exerciseStats = new Map<string, { bestE1RM: number; totalVolume: number }>();

      // Calculate best e1RM per user for this exercise
      // Note: In production, sessions would have a userId field
      // For now, we're using the current user ID as a placeholder
      for (const session of sessions) {
        for (const set of session.sets) {
          if (set.exerciseId === exercise.id) {
            const current = exerciseStats.get(userId) || { bestE1RM: 0, totalVolume: 0 };
            const setE1RM = calculateE1RM(set.weightKg, set.reps);
            const setVolume = set.weightKg * set.reps;

            if (setE1RM > current.bestE1RM) {
              current.bestE1RM = setE1RM;
            }
            current.totalVolume += setVolume;

            exerciseStats.set(userId, current);
          }
        }
      }

      // Sort by best e1RM and rank
      const sorted = Array.from(exerciseStats.entries())
        .map(([uid, stats]) => ({
          exerciseId: exercise.id,
          userId: uid,
          userName: uid === userId ? "You" : uid,
          value: stats.bestE1RM,
          display: `${stats.bestE1RM.toFixed(1)} kg`,
        }))
        .sort((a, b) => b.value - a.value)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      if (sorted.length > 0) {
        rankings.push(...sorted);
      }
    }

    return rankings;
  }, [sessions, userId]);

  // Calculate overall user rankings by total volume
  const userRankings = useMemo(() => {
    const userStats = new Map<string, { totalVolume: number; workoutCount: number; setCount: number }>();

    for (const session of sessions) {
      const current = userStats.get(userId) || { totalVolume: 0, workoutCount: 0, setCount: 0 };

      current.workoutCount += 1;

      for (const set of session.sets) {
        current.setCount += 1;
        current.totalVolume += set.weightKg * set.reps;
      }

      userStats.set(userId, current);
    }

    // Sort by total volume
    return Array.from(userStats.entries())
      .map(([uid, stats]) => ({
        rank: 0,
        userId: uid,
        userName: uid === userId ? "You" : uid,
        value: stats.totalVolume,
        display: `${(stats.totalVolume / 1000).toFixed(1)}k kg`,
        workoutCount: stats.workoutCount,
        setCount: stats.setCount,
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [sessions, userId]);

  // Calculate volume rankings (per exercise)
  const volumeRankings = useMemo(() => {
    const volumeByExercise = new Map<string, ExerciseRank[]>();

    for (const exercise of EXERCISES_V1) {
      const exerciseStats = new Map<string, number>();

      for (const session of sessions) {
        for (const set of session.sets) {
          if (set.exerciseId === exercise.id) {
            const current = exerciseStats.get(userId) || 0;
            const setVolume = set.weightKg * set.reps;
            exerciseStats.set(userId, current + setVolume);
          }
        }
      }

      const sorted = Array.from(exerciseStats.entries())
        .map(([uid, volume]) => ({
          exerciseId: exercise.id,
          userId: uid,
          userName: uid === userId ? "You" : uid,
          value: volume,
          display: `${(volume / 1000).toFixed(1)}k kg`,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10) // Top 10 per exercise
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      if (sorted.length > 0) {
        volumeByExercise.set(exercise.id, sorted);
      }
    }

    return volumeByExercise;
  }, [sessions, userId]);

  // Calculate streak rankings
  const streakRankings = useMemo(() => {
    const streaks = new Map<string, { currentStreak: number; longestStreak: number }>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const session of sessions) {
      const sessionDate = new Date(session.startedAtMs);
      sessionDate.setHours(0, 0, 0, 0);

      // Simple streak calculation - count consecutive days with workouts
      const dayDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff <= 5) {
        // Recent workout, contributes to streak
        const current = streaks.get(userId) || { currentStreak: 0, longestStreak: 0 };
        current.currentStreak += 1;
        if (current.currentStreak > current.longestStreak) {
          current.longestStreak = current.currentStreak;
        }
        streaks.set(userId, current);
      }
    }

    return Array.from(streaks.entries())
      .map(([uid, stats]) => ({
        rank: 0,
        userId: uid,
        userName: uid === userId ? "You" : uid,
        value: stats.longestStreak,
        display: `${stats.longestStreak} days`,
        currentStreak: stats.currentStreak,
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [sessions, userId]);

  const ToggleTab = (p: { label: string; tab: LeaderboardTab }) => (
    <Pressable
      onPress={() => setActiveTab(p.tab)}
      style={({ pressed }) => ({
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: activeTab === p.tab ? c.text : c.border,
        backgroundColor: activeTab === p.tab ? c.bg : c.card,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ color: c.text, ...FR.type.body }}>{p.label}</Text>
    </Pressable>
  );

  const ExerciseRankRow = (p: { entry: ExerciseRank; exerciseName: string }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: c.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: c.text, ...FR.type.h3 }}>{p.entry.rank}</Text>
        </View>
        <Text style={{ color: p.entry.userId === userId ? c.primary : c.text, ...FR.type.body }}>
          {p.entry.userName}
        </Text>
      </View>
      <Text style={{ color: c.muted, ...FR.type.sub }}>{p.entry.display}</Text>
    </View>
  );

  const UserRankRow = (p: { entry: LeaderboardEntry & { workoutCount?: number; setCount?: number } }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: c.border,
        backgroundColor: p.entry.userId === userId ? `${c.primary}10` : undefined,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: p.entry.rank <= 3 ? c.primary : c.card,
            borderWidth: 1,
            borderColor: c.border,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: p.entry.rank <= 3 ? "#fff" : c.text, ...FR.type.h3 }}>
            {p.entry.rank}
          </Text>
        </View>
        <Text style={{ color: p.entry.userId === userId ? c.primary : c.text, ...FR.type.body, fontWeight: "700" }}>
          {p.entry.userName}
        </Text>
      </View>
      <Text style={{ color: c.text, ...FR.type.body }}>{p.entry.display}</Text>
    </View>
  );

  return (
    <ProtectedRoute>
      <TabErrorBoundary screenName="Leaderboard">
        <View style={{ flex: 1, backgroundColor: c.bg }}>
          <ScrollView
            contentContainerStyle={{
              padding: FR.space.x4,
              gap: FR.space.x3,
              paddingBottom: FR.space.x6,
            }}
          >
            {/* Title */}
            <View style={{ gap: 6 }}>
              <Text style={{ color: c.text, ...FR.type.h1 }}>Leaderboards</Text>
              <Text style={{ color: c.muted, ...FR.type.sub }}>
                Rankings across exercises, users, and consistency. Compete with friends!
              </Text>
            </View>

            {/* Tab Toggle */}
            <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
              <ToggleTab label="Exercises" tab="exercises" />
              <ToggleTab label="Users" tab="users" />
              <ToggleTab label="Volume" tab="volume" />
              <ToggleTab label="Streaks" tab="streaks" />
            </View>

            {/* Content */}
            {activeTab === "exercises" && (
              <View style={{ gap: FR.space.x3 }}>
                {exerciseRankings.length === 0 ? (
                  <View style={{ ...FR.card({ card: c.card, border: c.border }), padding: FR.space.x4, gap: 6 }}>
                    <Text style={{ color: c.text, ...FR.type.h3 }}>No rankings yet</Text>
                    <Text style={{ color: c.muted, ...FR.type.sub }}>
                      Log some workouts to see your rankings!
                    </Text>
                  </View>
                ) : (
                  exerciseRankings.slice(0, 20).map((entry) => (
                    <ExerciseRankRow
                      key={`${entry.exerciseId}-${entry.userId}`}
                      entry={entry}
                      exerciseName={EXERCISES_V1.find((e) => e.id === entry.exerciseId)?.name ?? entry.exerciseId}
                    />
                  ))
                )}
              </View>
            )}

            {activeTab === "users" && (
              <View style={{ gap: FR.space.x3 }}>
                {userRankings.length === 0 ? (
                  <View style={{ ...FR.card({ card: c.card, border: c.border }), padding: FR.space.x4, gap: 6 }}>
                    <Text style={{ color: c.text, ...FR.type.h3 }}>No rankings yet</Text>
                    <Text style={{ color: c.muted, ...FR.type.sub }}>
                      Log some workouts to appear on the leaderboard!
                    </Text>
                  </View>
                ) : (
                  userRankings.map((entry) => (
                    <View key={entry.userId}>
                      <UserRankRow entry={entry} />
                      {entry.workoutCount !== undefined && (
                        <Text style={{ color: c.muted, ...FR.type.sub, marginLeft: 54 }}>
                          {entry.workoutCount} workouts • {entry.setCount} sets
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}

            {activeTab === "volume" && (
              <View style={{ gap: FR.space.x4 }}>
                {Array.from(volumeRankings.entries()).map(([exerciseId, rankings]) => {
                  const exercise = EXERCISES_V1.find((e) => e.id === exerciseId);
                  if (!exercise || rankings.length === 0) return null;

                  return (
                    <View key={exerciseId} style={{ gap: FR.space.x2 }}>
                      <Text style={{ color: c.text, ...FR.type.h3 }}>{exercise.name}</Text>
                      <View style={{ ...FR.card({ card: c.card, border: c.border }) }}>
                        {rankings.map((entry) => (
                          <ExerciseRankRow
                            key={`${exerciseId}-${entry.userId}`}
                            entry={entry}
                            exerciseName={exercise.name}
                          />
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {activeTab === "streaks" && (
              <View style={{ gap: FR.space.x3 }}>
                {streakRankings.length === 0 ? (
                  <View style={{ ...FR.card({ card: c.card, border: c.border }), padding: FR.space.x4, gap: 6 }}>
                    <Text style={{ color: c.text, ...FR.type.h3 }}>No streaks yet</Text>
                    <Text style={{ color: c.muted, ...FR.type.sub }}>
                      Work out consistently to build your streak!
                    </Text>
                  </View>
                ) : (
                  streakRankings.map((entry) => (
                    <View key={entry.userId}>
                      <UserRankRow entry={entry} />
                      {entry.currentStreak > 0 && (
                        <Text style={{ color: c.primary, ...FR.type.sub, marginLeft: 54 }}>
                          🔥 {entry.currentStreak} day streak!
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </TabErrorBoundary>
    </ProtectedRoute>
  );
}

// Epley formula for e1RM calculation
function calculateE1RM(weightKg: number, reps: number): number {
  return weightKg * (1 + reps / 30);
}
