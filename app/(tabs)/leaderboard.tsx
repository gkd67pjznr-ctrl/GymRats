// app/(tabs)/leaderboard.tsx
// Leaderboard screens showing rankings across exercises, users, and activity

import { useState, useMemo, useEffect, useCallback } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator, RefreshControl } from "react-native";
import { useThemeColors } from "../../src/ui/theme";
import { TabErrorBoundary } from "../../src/ui/tab-error-boundary";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { useUser } from "../../src/lib/stores/authStore";
import { useFriendEdges } from "../../src/lib/stores/friendsStore";
import { supabase } from "../../src/lib/supabase/client";
import { EXERCISES_V1 } from "../../src/data/exercises";
import { FR } from "../../src/ui/forgerankStyle";
import {
  filterByFriends,
  recomputeRanks,
  ensureCurrentUserVisible,
  computeOverallRankings,
  type LeaderboardScope,
  type EnhancedLeaderboardEntry,
} from "../../src/lib/leaderboardUtils";

type LeaderboardTabType = "overall" | "exercises" | "users" | "volume" | "streaks";

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
  const [activeTab, setActiveTab] = useState<LeaderboardTabType>("overall");
  const [scope, setScope] = useState<LeaderboardScope>("global");
  const userId = user?.id ?? "u_demo_me";

  // Get friend edges for filtering
  const friendEdges = useFriendEdges(userId);
  const friendUserIds = useMemo(() => {
    const ids = new Set<string>();
    for (const edge of friendEdges) {
      if (edge.status === "friends") {
        ids.add(edge.otherUserId);
      }
    }
    return ids;
  }, [friendEdges]);

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

  // Compute overall rankings from exercise rankings
  const overallRankings = useMemo(() => {
    return computeOverallRankings(groupedExerciseRankings);
  }, [groupedExerciseRankings]);

  const [userRankings, setUserRankings] = useState<(LeaderboardEntry & { workoutCount?: number; setCount?: number })[]>([]);
  const [volumeRankings, setVolumeRankings] = useState<Map<string, ExerciseRank[]>>(new Map());
  const [streakRankings, setStreakRankings] = useState<(LeaderboardEntry & { currentStreak?: number })[]>([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // For overall tab, we need exercise rankings
      const tabToFetch = activeTab === "overall" ? "exercises" : activeTab;

      let functionName = '';
      switch (tabToFetch) {
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

      switch (tabToFetch) {
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
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const onRefresh = useCallback(() => {
    fetchLeaderboard(true);
  }, [fetchLeaderboard]);

  // Apply scope filtering to rankings
  const filteredOverallRankings = useMemo(() => {
    if (scope === "global") return overallRankings;
    const filtered = filterByFriends(overallRankings, friendUserIds, userId);
    return recomputeRanks(filtered);
  }, [overallRankings, scope, friendUserIds, userId]);

  const filteredGroupedExerciseRankings = useMemo(() => {
    if (scope === "global") return groupedExerciseRankings;

    const filtered = new Map<string, ExerciseRank[]>();
    for (const [exerciseId, rankings] of groupedExerciseRankings.entries()) {
      const filteredRankings = filterByFriends(rankings, friendUserIds, userId);
      if (filteredRankings.length > 0) {
        filtered.set(exerciseId, recomputeRanks(filteredRankings));
      }
    }
    return filtered;
  }, [groupedExerciseRankings, scope, friendUserIds, userId]);

  const filteredUserRankings = useMemo(() => {
    if (scope === "global") return userRankings;
    const filtered = filterByFriends(userRankings, friendUserIds, userId);
    return recomputeRanks(filtered);
  }, [userRankings, scope, friendUserIds, userId]);

  const filteredVolumeRankings = useMemo(() => {
    if (scope === "global") return volumeRankings;

    const filtered = new Map<string, ExerciseRank[]>();
    for (const [exerciseId, rankings] of volumeRankings.entries()) {
      const filteredRankings = filterByFriends(rankings, friendUserIds, userId);
      if (filteredRankings.length > 0) {
        filtered.set(exerciseId, recomputeRanks(filteredRankings));
      }
    }
    return filtered;
  }, [volumeRankings, scope, friendUserIds, userId]);

  const filteredStreakRankings = useMemo(() => {
    if (scope === "global") return streakRankings;
    const filtered = filterByFriends(streakRankings, friendUserIds, userId);
    return recomputeRanks(filtered);
  }, [streakRankings, scope, friendUserIds, userId]);

  // Ensure current user is visible in overall rankings
  const displayOverallRankings = useMemo(() => {
    return ensureCurrentUserVisible(filteredOverallRankings, userId, 10);
  }, [filteredOverallRankings, userId]);

  const ToggleTab = (p: { label: string; tab: LeaderboardTabType }) => (
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

  const ScopeToggle = () => (
    <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
      <Pressable
        onPress={() => setScope("global")}
        style={({ pressed }) => ({
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 16,
          backgroundColor: scope === "global" ? c.primary : c.card,
          borderWidth: 1,
          borderColor: scope === "global" ? c.primary : c.border,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{
          color: scope === "global" ? "#fff" : c.text,
          ...FR.type.sub,
          fontWeight: scope === "global" ? "700" : "400",
        }}>
          Global
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setScope("friends")}
        style={({ pressed }) => ({
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 16,
          backgroundColor: scope === "friends" ? c.primary : c.card,
          borderWidth: 1,
          borderColor: scope === "friends" ? c.primary : c.border,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{
          color: scope === "friends" ? "#fff" : c.text,
          ...FR.type.sub,
          fontWeight: scope === "friends" ? "700" : "400",
        }}>
          Friends
        </Text>
      </Pressable>
    </View>
  );

  const SeparatorRow = () => (
    <View style={{
      paddingVertical: 8,
      alignItems: "center",
    }}>
      <Text style={{ color: c.muted, ...FR.type.sub }}>...</Text>
    </View>
  );

  const ExerciseRankRow = (p: { entry: ExerciseRank & { isCurrentUser?: boolean; showSeparator?: boolean }; exerciseName: string }) => (
    <>
      {p.entry.showSeparator && <SeparatorRow />}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 10,
          paddingHorizontal: p.entry.isCurrentUser ? 8 : 0,
          borderBottomWidth: 1,
          borderColor: c.border,
          backgroundColor: p.entry.isCurrentUser ? `${c.primary}15` : undefined,
          borderRadius: p.entry.isCurrentUser ? 8 : 0,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: p.entry.isCurrentUser ? c.primary : c.card,
              borderWidth: 1,
              borderColor: p.entry.isCurrentUser ? c.primary : c.border,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: p.entry.isCurrentUser ? "#fff" : c.text, ...FR.type.h3 }}>{p.entry.rank}</Text>
          </View>
          <Text style={{ color: p.entry.isCurrentUser ? c.primary : c.text, ...FR.type.body, fontWeight: p.entry.isCurrentUser ? "700" : "400" }}>
            {p.entry.userName}
          </Text>
        </View>
        <Text style={{ color: c.muted, ...FR.type.sub }}>{p.entry.display}</Text>
      </View>
    </>
  );

  const OverallRankRow = (p: { entry: EnhancedLeaderboardEntry }) => (
    <>
      {p.entry.showSeparator && <SeparatorRow />}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 12,
          paddingHorizontal: p.entry.isCurrentUser ? 8 : 0,
          borderBottomWidth: 1,
          borderColor: c.border,
          backgroundColor: p.entry.isCurrentUser ? `${c.primary}15` : undefined,
          borderRadius: p.entry.isCurrentUser ? 8 : 0,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: p.entry.rank <= 3 ? c.primary : (p.entry.isCurrentUser ? c.primary : c.card),
              borderWidth: 1,
              borderColor: p.entry.rank <= 3 || p.entry.isCurrentUser ? c.primary : c.border,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: p.entry.rank <= 3 || p.entry.isCurrentUser ? "#fff" : c.text, ...FR.type.h3 }}>
              {p.entry.rank}
            </Text>
          </View>
          <Text style={{ color: p.entry.isCurrentUser ? c.primary : c.text, ...FR.type.body, fontWeight: "700" }}>
            {p.entry.userName}
          </Text>
        </View>
        <Text style={{ color: c.text, ...FR.type.body }}>{p.entry.display}</Text>
      </View>
    </>
  );

  const UserRankRow = (p: { entry: LeaderboardEntry & { workoutCount?: number; setCount?: number; isCurrentUser?: boolean; showSeparator?: boolean } }) => (
    <>
      {p.entry.showSeparator && <SeparatorRow />}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 12,
          paddingHorizontal: p.entry.isCurrentUser ? 8 : 0,
          borderBottomWidth: 1,
          borderColor: c.border,
          backgroundColor: p.entry.isCurrentUser ? `${c.primary}15` : undefined,
          borderRadius: p.entry.isCurrentUser ? 8 : 0,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: p.entry.rank <= 3 ? c.primary : (p.entry.isCurrentUser ? c.primary : c.card),
              borderWidth: 1,
              borderColor: p.entry.rank <= 3 || p.entry.isCurrentUser ? c.primary : c.border,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: p.entry.rank <= 3 || p.entry.isCurrentUser ? "#fff" : c.text, ...FR.type.h3 }}>
              {p.entry.rank}
            </Text>
          </View>
          <Text style={{ color: p.entry.isCurrentUser ? c.primary : c.text, ...FR.type.body, fontWeight: "700" }}>
            {p.entry.userName}
          </Text>
        </View>
        <Text style={{ color: c.text, ...FR.type.body }}>{p.entry.display}</Text>
      </View>
    </>
  );

  const EmptyState = (p: { title: string; subtitle: string }) => (
    <View style={{ ...FR.card({ card: c.card, border: c.border }), padding: FR.space.x4, gap: 6 }}>
      <Text style={{ color: c.text, ...FR.type.h3 }}>{p.title}</Text>
      <Text style={{ color: c.muted, ...FR.type.sub }}>{p.subtitle}</Text>
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={c.primary}
                colors={[c.primary]}
              />
            }
          >
            {/* Title */}
            <View style={{ gap: 6 }}>
              <Text style={{ color: c.text, ...FR.type.h1 }}>Leaderboards</Text>
              <Text style={{ color: c.muted, ...FR.type.sub }}>
                Rankings across exercises, users, and consistency. Compete with friends!
              </Text>
            </View>

            {/* Tab Toggle */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: FR.space.x2 }}
            >
              <ToggleTab label="Overall" tab="overall" />
              <ToggleTab label="Exercises" tab="exercises" />
              <ToggleTab label="Users" tab="users" />
              <ToggleTab label="Volume" tab="volume" />
              <ToggleTab label="Streaks" tab="streaks" />
            </ScrollView>

            {/* Scope Toggle */}
            <ScopeToggle />

            {/* Content */}
            {activeTab === "overall" && (
              <View style={{ gap: FR.space.x3 }}>
                {loading ? (
                  <ActivityIndicator />
                ) : error ? (
                  <Text style={{ color: c.danger }}>{error}</Text>
                ) : displayOverallRankings.length === 0 ? (
                  <EmptyState
                    title={scope === "friends" ? "No friends yet" : "No rankings yet"}
                    subtitle={scope === "friends" ? "Add friends to see how you compare!" : "Log some workouts to see your overall ranking!"}
                  />
                ) : (
                  <View style={{ ...FR.card({ card: c.card, border: c.border }) }}>
                    <View style={{ padding: FR.space.x3, borderBottomWidth: 1, borderColor: c.border }}>
                      <Text style={{ color: c.text, ...FR.type.h3 }}>Average Forgerank Score</Text>
                      <Text style={{ color: c.muted, ...FR.type.sub }}>
                        Based on your best e1RM across all exercises
                      </Text>
                    </View>
                    {displayOverallRankings.map((entry) => (
                      <OverallRankRow key={entry.userId} entry={entry} />
                    ))}
                  </View>
                )}
              </View>
            )}

            {activeTab === "exercises" && (
              <View style={{ gap: FR.space.x3 }}>
                {loading ? (
                  <ActivityIndicator />
                ) : error ? (
                  <Text style={{ color: c.danger }}>{error}</Text>
                ) : filteredGroupedExerciseRankings.size === 0 ? (
                  <EmptyState
                    title={scope === "friends" ? "No friends yet" : "No rankings yet"}
                    subtitle={scope === "friends" ? "Add friends to see how you compare!" : "Log some workouts to see your rankings!"}
                  />
                ) : (
                  Array.from(filteredGroupedExerciseRankings.entries()).map(([exerciseId, rankings]) => {
                    const exercise = EXERCISES_V1.find((e) => e.id === exerciseId);
                    if (!exercise || rankings.length === 0) return null;

                    // Ensure current user is visible in each exercise
                    const displayRankings = ensureCurrentUserVisible(rankings, userId, 5);

                    return (
                      <View key={exerciseId} style={{ gap: FR.space.x2 }}>
                        <Text style={{ color: c.text, ...FR.type.h3 }}>{exercise.name}</Text>
                        <View style={{ ...FR.card({ card: c.card, border: c.border }) }}>
                          {displayRankings.map((entry) => (
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
                ) : filteredUserRankings.length === 0 ? (
                  <EmptyState
                    title={scope === "friends" ? "No friends yet" : "No rankings yet"}
                    subtitle={scope === "friends" ? "Add friends to see how you compare!" : "Log some workouts to appear on the leaderboard!"}
                  />
                ) : (
                  (() => {
                    const displayRankings = ensureCurrentUserVisible(filteredUserRankings, userId, 10);
                    return displayRankings.map((entry) => (
                      <View key={entry.userId}>
                        <UserRankRow entry={entry} />
                        {entry.workoutCount !== undefined && (
                          <Text style={{ color: c.muted, ...FR.type.sub, marginLeft: 54 }}>
                            {entry.workoutCount} workouts • {entry.setCount} sets
                          </Text>
                        )}
                      </View>
                    ));
                  })()
                )}
              </View>
            )}

            {activeTab === "volume" && (
              <View style={{ gap: FR.space.x4 }}>
                {loading ? (
                  <ActivityIndicator />
                ) : error ? (
                  <Text style={{ color: c.danger }}>{error}</Text>
                ) : filteredVolumeRankings.size === 0 ? (
                  <EmptyState
                    title={scope === "friends" ? "No friends yet" : "No rankings yet"}
                    subtitle={scope === "friends" ? "Add friends to see how you compare!" : "Log some workouts to see your rankings!"}
                  />
                ) : (
                  Array.from(filteredVolumeRankings.entries()).map(([exerciseId, rankings]) => {
                    const exercise = EXERCISES_V1.find((e) => e.id === exerciseId);
                    if (!exercise || rankings.length === 0) return null;

                    const displayRankings = ensureCurrentUserVisible(rankings, userId, 5);

                    return (
                      <View key={exerciseId} style={{ gap: FR.space.x2 }}>
                        <Text style={{ color: c.text, ...FR.type.h3 }}>{exercise.name}</Text>
                        <View style={{ ...FR.card({ card: c.card, border: c.border }) }}>
                          {displayRankings.map((entry) => (
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

            {activeTab === "streaks" && (
              <View style={{ gap: FR.space.x3 }}>
                {loading ? (
                  <ActivityIndicator />
                ) : error ? (
                  <Text style={{ color: c.danger }}>{error}</Text>
                ) : filteredStreakRankings.length === 0 ? (
                  <EmptyState
                    title={scope === "friends" ? "No friends yet" : "No streaks yet"}
                    subtitle={scope === "friends" ? "Add friends to see how you compare!" : "Work out consistently to build your streak!"}
                  />
                ) : (
                  (() => {
                    const displayRankings = ensureCurrentUserVisible(filteredStreakRankings, userId, 10);
                    return displayRankings.map((entry) => (
                      <View key={entry.userId}>
                        <UserRankRow entry={entry} />
                        {(entry.currentStreak ?? 0) > 0 && (
                          <Text style={{ color: c.primary, ...FR.type.sub, marginLeft: 54 }}>
                            {entry.currentStreak} day streak
                          </Text>
                        )}
                      </View>
                    ));
                  })()
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </TabErrorBoundary>
    </ProtectedRoute>
  );
}
