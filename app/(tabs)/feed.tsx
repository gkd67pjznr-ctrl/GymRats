// app/(tabs)/feed.tsx
import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator, RefreshControl } from "react-native";
import { useUser } from "../../src/lib/stores/authStore";
import { useFriendEdges, setupFriendsRealtime } from "../../src/lib/stores/friendsStore";
import type { EmoteId, WorkoutPost } from "../../src/lib/socialModel";
import { toggleReaction, useFeedAll, useMyReaction, setupPostsRealtime, useSocialStore } from "../../src/lib/stores/socialStore";
import { displayName, ME_ID } from "../../src/lib/userDirectory";
import { FR } from "../../src/ui/GrStyle";
import { useThemeColors } from "../../src/ui/theme";
import { TabErrorBoundary } from "../../src/ui/tab-error-boundary";
import { timeAgo } from "../../src/lib/units";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { SyncStatusIndicator } from "../../src/ui/components/SyncStatusIndicator";
import { RankBadge, PhotoCard, PostOptions } from "../../src/ui/components/Social";

type FeedMode = "public" | "friends";
const ME = ME_ID;

function emoteLabel(e: EmoteId): string {
  if (e === "like") return "👍";
  if (e === "fire") return "🔥";
  if (e === "skull") return "💀";
  if (e === "crown") return "👑";
  if (e === "bolt") return "⚡";
  return "👏";
}

function compactNum(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(1).replace(".0", "")}k`;
  return `${(n / 1000000).toFixed(1).replace(".0", "")}m`;
}

export default function FeedTab() {
  const c = useThemeColors();
  const user = useUser();
  const all = useFeedAll();
  const edges = useFriendEdges(ME);
  const [mode, setMode] = useState<FeedMode>("public");
  const [refreshing, setRefreshing] = useState(false);
  const { pullFromServer: syncFeed } = useSocialStore();
  const [selectedPostForOptions, setSelectedPostForOptions] = useState<WorkoutPost | null>(null);

  const userId = user?.id ?? ME;

  // Setup realtime subscriptions for posts
  useEffect(() => {
    if (user?.id) {
      const cleanup = setupPostsRealtime(user.id);
      return cleanup;
    }
  }, [user?.id]);

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      syncFeed().catch(err => {
        console.error('[Feed] Failed to sync:', err);
      });
    }
  }, [user?.id]);

  // Pull to refresh
  async function onRefresh() {
    setRefreshing(true);
    try {
      await syncFeed();
    } catch (err) {
      console.error('[Feed] Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  }

  const friendIdSet = useMemo(() => {
    const set = new Set<string>();
    for (const e of edges) {
      if (e.status === "friends") set.add(e.otherUserId);
    }
    return set;
  }, [edges]);

  const posts = useMemo(() => {
    const sorted = [...all].sort((a, b) => b.createdAtMs - a.createdAtMs);

    if (mode === "public") return sorted;

    // friends mode:
    // - must be friends visibility
    // - must be authored by a friend (or you)
    return sorted.filter((p) => p.privacy === "friends" && (p.authorUserId === ME || friendIdSet.has(p.authorUserId)));
  }, [all, mode, friendIdSet]);

  const ToggleChip = (p: { label: string; active: boolean; onPress: () => void }) => (
    <Pressable
      onPress={p.onPress}
      style={({ pressed }) => ({
        borderWidth: 1,
        borderColor: p.active ? c.text : c.border,
        backgroundColor: p.active ? c.bg : c.card,
        borderRadius: FR.radius.pill,
        paddingVertical: FR.space.x2,
        paddingHorizontal: FR.space.x3,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ color: c.text, ...FR.type.body }}>{p.label}</Text>
    </Pressable>
  );

  const EmoteButton = (p: { postId: string; emote: EmoteId; active?: boolean }) => (
    <Pressable
      onPress={() => toggleReaction(p.postId, userId, p.emote)}
      style={({ pressed }) => ({
        paddingVertical: FR.space.x2,
        paddingHorizontal: FR.space.x3,
        borderRadius: FR.radius.pill,
        borderWidth: 1,
        borderColor: p.active ? c.text : c.border,
        backgroundColor: p.active ? c.bg : c.card,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ color: c.text, ...FR.type.h3 }}>{emoteLabel(p.emote)}</Text>
    </Pressable>
  );

  const PostCard = (p: { post: WorkoutPost }) => {
    const my = useMyReaction(p.post.id, userId);
    const top = p.post.workoutSnapshot?.topLines?.slice(0, 2) ?? [];

    return (
      <Link href={({ pathname: "/post/[id]", params: { id: p.post.id } } as any) as any} asChild>
        <Pressable
          style={({ pressed }) => ({
            ...FR.card({ card: c.card, border: c.border }),
            gap: FR.space.x3,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: FR.space.x3 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x2 }}>
                <Text style={{ color: c.text, ...FR.type.h3 }}>{displayName(p.post.authorUserId)}</Text>
                <RankBadge post={p.post} size="sm" variant="minimal" showLabel={false} />
              </View>
              <Text style={{ color: c.muted, ...FR.type.sub }}>
                {p.post.title ?? "Workout"} • {timeAgo(p.post.createdAtMs)}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x2 }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.bg,
                  borderRadius: FR.radius.pill,
                  paddingVertical: 4,
                  paddingHorizontal: FR.space.x2,
                }}
              >
                <Text style={{ color: c.text, ...FR.type.mono }}>{p.post.privacy.toUpperCase()}</Text>
              </View>
              <Pressable
                onPress={() => setSelectedPostForOptions(p.post)}
                style={({ pressed }) => ({
                  padding: 8,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: c.muted, fontSize: 18 }}>•••</Text>
              </Pressable>
            </View>
          </View>

          {/* Snapshot lines */}
          {top.length > 0 ? (
            <View style={{ gap: 4 }}>
              {top.map((line, i) => (
                <Text
                  key={i}
                  style={{ color: c.text, ...FR.type.body }}>

                 {typeof line === "string"
                  ? line
                  : `${line.exerciseName} — ${line.bestSet ? `${line.bestSet.weightLabel} x${line.bestSet.reps}${line.bestSet.e1rmLabel ? ` (${line.bestSet.e1rmLabel})` : ""}` : "—"}`}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={{ color: c.muted, ...FR.type.sub }}>
              {p.post.exerciseCount ?? 0} exercises • {p.post.setCount ?? 0} sets • {p.post.durationSec ? `${Math.round(p.post.durationSec / 60)}m` : "—"}
            </Text>
          )}

          {/* Attached Photos */}
          {p.post.photoUrls && p.post.photoUrls.length > 0 && (
            <PhotoCard photoUrls={p.post.photoUrls} />
          )}

          {/* Footer row */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: FR.space.x3 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x2 }}>
              <EmoteButton postId={p.post.id} emote="like" active={my?.emote === "like"} />
              <EmoteButton postId={p.post.id} emote="fire" active={my?.emote === "fire"} />
              <EmoteButton postId={p.post.id} emote="crown" active={my?.emote === "crown"} />
            </View>

            <Text style={{ color: c.muted, ...FR.type.sub }}>
              {compactNum(p.post.likeCount)} likes • {compactNum(p.post.commentCount)} comments
            </Text>
          </View>
        </Pressable>
      </Link>
    );
  };

  return (
    <ProtectedRoute>
      <TabErrorBoundary screenName="Feed">
        <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView
          contentContainerStyle={{
            padding: FR.space.x4,
            gap: FR.space.x3,
            paddingBottom: FR.space.x6,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Title */}
          <View style={{ gap: 6 }}>
            <Text style={{ color: c.text, ...FR.type.h1 }}>Feed</Text>
            <Text style={{ color: c.muted, ...FR.type.sub }}>
              Friends workouts, PRs, and streak fuel. Keep it tight, keep it real.
            </Text>
          </View>

          {/* Mode toggle */}
          <View style={{ flexDirection: "row", gap: FR.space.x2, alignItems: "center" }}>
            <ToggleChip label="Public" active={mode === "public"} onPress={() => setMode("public")} />
            <ToggleChip label="Friends" active={mode === "friends"} onPress={() => setMode("friends")} />
            <SyncStatusIndicator displayMode="compact" storeName="social" />
            <Link href={"/friends" as any} asChild>
              <Pressable
                style={({ pressed }) => ({
                  marginLeft: "auto",
                  ...FR.pillButton({ card: c.card, border: c.border }),
                  paddingVertical: FR.space.x2,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: c.text, ...FR.type.body }}>Manage</Text>
              </Pressable>
            </Link>
          </View>

          {/* Posts */}
          {posts.length === 0 ? (
            <View style={{ ...FR.card({ card: c.card, border: c.border }), gap: 6 }}>
              <Text style={{ color: c.text, ...FR.type.h3 }}>Nothing here yet</Text>
              <Text style={{ color: c.muted, ...FR.type.sub }}>
                Finish a workout and share it — your first post will show up here.
              </Text>
            </View>
          ) : (
            posts.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </ScrollView>

        {/* Post Options Modal */}
        {selectedPostForOptions && (
          <PostOptions
            visible={selectedPostForOptions !== null}
            onClose={() => setSelectedPostForOptions(null)}
            post={selectedPostForOptions}
          />
        )}
      </View>
    </TabErrorBoundary>
    </ProtectedRoute>
  );
}
