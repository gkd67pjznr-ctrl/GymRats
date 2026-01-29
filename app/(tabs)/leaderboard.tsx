// app/(tabs)/leaderboard.tsx
// Leaderboard screens showing rankings across exercises, users, and activity

import { useState, useMemo, useEffect } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { useThemeColors } from "../../src/ui/theme";
import { TabErrorBoundary } from "../../src/ui/tab-error-boundary";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { useUser } from "../../src/lib/stores/authStore";
import { useWorkoutSessions } from "../../src/lib/stores";
import { supabase } from "../../src/lib/supabase/client";
import { EXERCISES_V1 } from "../../src/data/exercises";
import type { WorkoutSet } from "../../src/lib/workoutModel";
import { FR } from "../../src/ui/forgerankStyle";
import { estimate1RM_Epley } from "../../src/lib/e1rm";

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

  const [exerciseRankings, setExerciseRankings] = useState<ExerciseRank[]>([]);
  const groupedExerciseRankings = useMemo(() => {
    const grouped = new Map<string, ExerciseRank[]>();
    for (const ranking of exerciseRankings) {
      if (!grouped.has(ranking.exerciseId)) {
        grouped.set(ranking.exerciseId, []);
      }
      grouped.get(ranking.exerciseId)!.push(ranking);
    }
    return grouped;
  }, [exerciseRankings]);
  const [userRankings, setUserRankings] = useState<(LeaderboardEntry & { workoutCount?: number; setCount?: number })[]>([]);
  const [volumeRankings, setVolumeRankings] = useState<Map<string, ExerciseRank[]>>(new Map());
  const [streakRankings, setStreakRankings] = useState<(LeaderboardEntry & { currentStreak?: number })[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        let functionName = '';
        switch (activeTab) {
          case 'exercises':
            functionName = 'get-all-exercise-leaderboards';
            break;
          case 'users':
            functionName = 'get-user-leaderboard-by-volume';
            break;
          case 'volume':
            functionName = 'get-volume-leaderboards';
            break;
          case 'streaks':
            functionName = 'get-streak-leaderboard';
            break;
        }

        if (!functionName) return;

        const { data, error } = await supabase.functions.invoke(functionName);

        if (error) throw error;

        switch (activeTab) {
          case 'exercises':
            setExerciseRankings(data || []);
            break;
          case 'users':
            setUserRankings(data || []);
            break;
          case 'volume':
            setVolumeRankings(new Map(Object.entries(data || {})));
            break;
          case 'streaks':
            setStreakRankings(data || []);
            break;
        }

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab, supabase]);

    
  
  
  
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
                {loading ? (
              <ActivityIndicator />
            ) : error ? (
              <Text style={{ color: c.danger }}>{error}</Text>
            ) : exerciseRankings.length === 0 ? (
                  <View style={{ ...FR.card({ card: c.card, border: c.border }), padding: FR.space.x4, gap: 6 }}>
                    <Text style={{ color: c.text, ...FR.type.h3 }}>No rankings yet</Text>
                    <Text style={{ color: c.muted, ...FR.type.sub }}>
                      Log some workouts to see your rankings!
                    </Text>
                  </View>
                ) : (
                  Array.from(groupedExerciseRankings.entries()).map(([exerciseId, rankings]) => {
                    const exercise = EXERCISES_V1.find((e) => e.id === exerciseId);
                    if (!exercise || rankings.length === 0) return null;

                    return (
                      <View key={exerciseId} style={{ gap: FR.space.x2 }}>
                        <Text style={{ color: c.text, ...FR.type.h3 }}>{exercise.name}</Text>
                        <View style={{ ...FR.card({ card: c.card, border: c.border }) }}>
                          {rankings.slice(0, 5).map((entry) => (
                            <ExerciseRankRow
                              key={`${exerciseId}-${entry.userId}`}
                              entry={entry}
                              exerciseName={exercise.name}
                            />
                          ))}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {activeTab === "users" && (
              <View style={{ gap: FR.space.x3 }}>
                {loading ? (
              <ActivityIndicator />
            ) : error ? (
              <Text style={{ color: c.danger }}>{error}</Text>
            ) : userRankings.length === 0 ? (
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
                {loading ? (
              <ActivityIndicator />
            ) : error ? (
              <Text style={{ color: c.danger }}>{error}</Text>
            ) : Array.from(volumeRankings.entries()).length === 0 ? (
              <View style={{ ...FR.card({ card: c.card, border: c.border }), padding: FR.space.x4, gap: 6 }}>
                <Text style={{ color: c.text, ...FR.type.h3 }}>No rankings yet</Text>
                <Text style={{ color: c.muted, ...FR.type.sub }}>
                  Log some workouts to see your rankings!
                </Text>
              </View>
            ) : (
              Array.from(volumeRankings.entries()).map(([exerciseId, rankings]) => {
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
                {loading ? (
              <ActivityIndicator />
            ) : error ? (
              <Text style={{ color: c.danger }}>{error}</Text>
            ) : streakRankings.length === 0 ? (
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

