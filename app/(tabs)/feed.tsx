// app/(tabs)/feed.tsx
import { Link } from "expo-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Pressable, FlatList, Text, View, ActivityIndicator, RefreshControl } from "react-native";
import { useUser } from "../../src/lib/stores/authStore";
import { useFriendEdges, setupFriendsRealtime } from "../../src/lib/stores/friendsStore";
import type { WorkoutPost } from "../../src/lib/socialModel";
import { toggleReaction, useFeedAll, useMyReaction, usePostReactions, setupPostsRealtime, useSocialStore } from "../../src/lib/stores/socialStore";
import { displayName, ME_ID } from "../../src/lib/userDirectory";
import { FR } from "../../src/ui/GrStyle";
import { useThemeColors } from "../../src/ui/theme";
import { TabErrorBoundary } from "../../src/ui/tab-error-boundary";
import { timeAgo } from "../../src/lib/units";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { SyncStatusIndicator } from "../../src/ui/components/SyncStatusIndicator";
import { RankBadge, PhotoCard, PostOptions, AnimatedReactionButton, ReactionsModal } from "../../src/ui/components/Social";

type FeedMode = "public" | "friends";
const ME = ME_ID;

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

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

  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  const allPosts = useMemo(() => {
    const sorted = [...all].sort((a, b) => b.createdAtMs - a.createdAtMs);

    if (mode === "public") return sorted;

    // friends mode:
    // - must be friends visibility
    // - must be authored by a friend (or you)
    return sorted.filter((p) => p.privacy === "friends" && (p.authorUserId === ME || friendIdSet.has(p.authorUserId)));
  }, [all, mode, friendIdSet]);

  // Paginated posts
  const posts = useMemo(() => {
    return allPosts.slice(0, displayCount);
  }, [allPosts, displayCount]);

  // Check if there are more posts to load
  useEffect(() => {
    setHasMore(displayCount < allPosts.length);
  }, [displayCount, allPosts.length]);

  // Reset pagination when mode changes
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [mode]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    // Simulate async loading
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, allPosts.length));
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, hasMore, allPosts.length]);

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


  const PostCard = (p: { post: WorkoutPost }) => {
    const my = useMyReaction(p.post.id, userId);
    const reactions = usePostReactions(p.post.id);
    const [showReactionsModal, setShowReactionsModal] = useState(false);
    const top = p.post.workoutSnapshot?.topLines?.slice(0, 2) ?? [];

    // Count reactions by emote type
    const emoteCounts = useMemo(() => {
      const counts: Record<string, number> = { like: 0, fire: 0, crown: 0 };
      for (const r of reactions) {
        if (r.emote in counts) counts[r.emote]++;
      }
      return counts;
    }, [reactions]);

    return (
      <>
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

            {/* Workout Stats Row */}
            <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
              {p.post.durationSec ? (
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: c.bg,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: FR.radius.sm,
                  borderWidth: 1,
                  borderColor: c.border,
                }}>
                  <Text style={{ color: c.muted }}>⏱</Text>
                  <Text style={{ color: c.text, ...FR.type.mono, fontSize: 12 }}>
                    {Math.round(p.post.durationSec / 60)}m
                  </Text>
                </View>
              ) : null}
              {p.post.exerciseCount ? (
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: c.bg,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: FR.radius.sm,
                  borderWidth: 1,
                  borderColor: c.border,
                }}>
                  <Text style={{ color: c.muted }}>🏋️</Text>
                  <Text style={{ color: c.text, ...FR.type.mono, fontSize: 12 }}>
                    {p.post.exerciseCount}
                  </Text>
                </View>
              ) : null}
              {p.post.setCount ? (
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: c.bg,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: FR.radius.sm,
                  borderWidth: 1,
                  borderColor: c.border,
                }}>
                  <Text style={{ color: c.muted }}>✅</Text>
                  <Text style={{ color: c.text, ...FR.type.mono, fontSize: 12 }}>
                    {p.post.setCount}
                  </Text>
                </View>
              ) : null}
              {p.post.completionPct !== undefined && p.post.completionPct > 0 && (
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: p.post.completionPct >= 1 ? "rgba(76, 175, 80, 0.2)" : c.bg,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: FR.radius.sm,
                  borderWidth: 1,
                  borderColor: p.post.completionPct >= 1 ? "#4CAF50" : c.border,
                }}>
                  <Text style={{ color: p.post.completionPct >= 1 ? "#4CAF50" : c.muted }}>
                    {p.post.completionPct >= 1 ? "✓" : "◐"}
                  </Text>
                  <Text style={{
                    color: p.post.completionPct >= 1 ? "#4CAF50" : c.text,
                    ...FR.type.mono,
                    fontSize: 12
                  }}>
                    {Math.round(p.post.completionPct * 100)}%
                  </Text>
                </View>
              )}
            </View>

            {/* Snapshot lines - best lifts */}
            {top.length > 0 && (
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
            )}

            {/* Attached Photos */}
            {p.post.photoUrls && p.post.photoUrls.length > 0 && (
              <PhotoCard photoUrls={p.post.photoUrls} />
            )}

            {/* Footer row */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: FR.space.x3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x2 }}>
                <AnimatedReactionButton
                  emote="like"
                  active={my?.emote === "like"}
                  count={emoteCounts.like}
                  onPress={() => toggleReaction(p.post.id, userId, "like")}
                  onLongPress={() => setShowReactionsModal(true)}
                  colors={{ text: c.text, border: c.border, bg: c.bg, card: c.card }}
                />
                <AnimatedReactionButton
                  emote="fire"
                  active={my?.emote === "fire"}
                  count={emoteCounts.fire}
                  onPress={() => toggleReaction(p.post.id, userId, "fire")}
                  onLongPress={() => setShowReactionsModal(true)}
                  colors={{ text: c.text, border: c.border, bg: c.bg, card: c.card }}
                />
                <AnimatedReactionButton
                  emote="crown"
                  active={my?.emote === "crown"}
                  count={emoteCounts.crown}
                  onPress={() => toggleReaction(p.post.id, userId, "crown")}
                  onLongPress={() => setShowReactionsModal(true)}
                  colors={{ text: c.text, border: c.border, bg: c.bg, card: c.card }}
                />
              </View>

              <Pressable onPress={() => setShowReactionsModal(true)}>
                <Text style={{ color: c.muted, ...FR.type.sub }}>
                  {compactNum(p.post.likeCount)} reactions • {compactNum(p.post.commentCount)} comments
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Link>

        {/* Reactions Modal */}
        <ReactionsModal
          visible={showReactionsModal}
          onClose={() => setShowReactionsModal(false)}
          reactions={reactions}
        />
      </>
    );
  };

  const renderPost = useCallback(({ item }: { item: WorkoutPost }) => (
    <PostCard post={item} />
  ), []);

  const ListHeader = () => (
    <>
      {/* Title */}
      <View style={{ gap: 6, marginBottom: FR.space.x3 }}>
        <Text style={{ color: c.text, ...FR.type.h1 }}>Feed</Text>
        <Text style={{ color: c.muted, ...FR.type.sub }}>
          Friends workouts, PRs, and streak fuel. Keep it tight, keep it real.
        </Text>
      </View>

      {/* Mode toggle */}
      <View style={{ flexDirection: "row", gap: FR.space.x2, alignItems: "center", marginBottom: FR.space.x3 }}>
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
    </>
  );

  const ListEmpty = () => (
    <View style={{ ...FR.card({ card: c.card, border: c.border }), gap: 6 }}>
      <Text style={{ color: c.text, ...FR.type.h3 }}>Nothing here yet</Text>
      <Text style={{ color: c.muted, ...FR.type.sub }}>
        Finish a workout and share it — your first post will show up here.
      </Text>
    </View>
  );

  const ListFooter = () => {
    if (!hasMore || posts.length === 0) return null;
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        {loadingMore ? (
          <ActivityIndicator size="small" color={c.primary} />
        ) : (
          <Text style={{ color: c.muted, ...FR.type.sub }}>
            Pull up for more
          </Text>
        )}
      </View>
    );
  };

  return (
    <ProtectedRoute>
      <TabErrorBoundary screenName="Feed">
        <View style={{ flex: 1, backgroundColor: c.bg }}>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: FR.space.x4,
            gap: FR.space.x3,
            paddingBottom: FR.space.x6,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />

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
