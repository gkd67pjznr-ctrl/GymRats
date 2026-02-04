// app/(tabs)/feed.tsx
import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, RefreshControl } from "react-native";
import { useUser } from "../../src/lib/stores/authStore";
import { useFriendEdges } from "../../src/lib/stores/friendsStore";
import type { EmoteId, WorkoutPost } from "../../src/lib/socialModel";
import { toggleReaction, useFeedAll, useMyReaction, setupPostsRealtime, useSocialStore } from "../../src/lib/stores/socialStore";
import { ME_ID } from "../../src/lib/userDirectory";
import { FR } from "../../src/ui/GrStyle";
import { useThemeColors } from "../../src/ui/theme";
import { TabErrorBoundary } from "../../src/ui/tab-error-boundary";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { SyncStatusIndicator } from "../../src/ui/components/SyncStatusIndicator";
import { PostOptions, WorkoutPostCard } from "../../src/ui/components/Social";

type FeedMode = "public" | "friends";
const ME = ME_ID;

// Wrapper to use hooks for the post card
function PostCardWrapper({
  post,
  userId,
  onOptions
}: {
  post: WorkoutPost;
  userId: string;
  onOptions: () => void;
}) {
  const reaction = useMyReaction(post.id, userId);

  const handleReact = (postId: string, emote: EmoteId) => {
    toggleReaction(postId, userId, emote);
  };

  return (
    <WorkoutPostCard
      post={post}
      myReaction={reaction?.emote}
      onReact={handleReact}
      onOptions={onOptions}
    />
  );
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

  const ToggleChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderWidth: 1,
        borderColor: active ? c.text : c.border,
        backgroundColor: active ? c.bg : c.card,
        borderRadius: FR.radius.pill,
        paddingVertical: FR.space.x2,
        paddingHorizontal: FR.space.x3,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ color: c.text, ...FR.type.body }}>{label}</Text>
    </Pressable>
  );

  return (
    <ProtectedRoute>
      <TabErrorBoundary screenName="Feed">
        <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView
          contentContainerStyle={{
            padding: FR.space.x4,
            gap: FR.space.x4,
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
            posts.map((p) => (
              <PostCardWrapper
                key={p.id}
                post={p}
                userId={userId}
                onOptions={() => setSelectedPostForOptions(p)}
              />
            ))
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
