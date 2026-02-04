// app/(tabs)/feed.tsx
// Enhanced social feed with infinite scroll and real-time updates

import { Link } from "expo-router";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Pressable,
  Text,
  View,
  RefreshControl,
  FlatList,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUser } from "../../src/lib/stores/authStore";
import { useFriendEdges } from "../../src/lib/stores/friendsStore";
import type { EmoteId, WorkoutPost } from "../../src/lib/socialModel";
import {
  toggleReaction,
  useFeedAll,
  useMyReaction,
  setupPostsRealtime,
  useSocialStore,
} from "../../src/lib/stores/socialStore";
import { ME_ID } from "../../src/lib/userDirectory";
import { FR } from "../../src/ui/GrStyle";
import { useThemeColors } from "../../src/ui/theme";
import { TabErrorBoundary } from "../../src/ui/tab-error-boundary";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { SyncStatusIndicator } from "../../src/ui/components/SyncStatusIndicator";
import { PostOptions, WorkoutPostCard } from "../../src/ui/components/Social";

type FeedMode = "public" | "friends";
const ME = ME_ID;
const PAGE_SIZE = 10;

// Post card wrapper with reaction handling
function PostCardWrapper({
  post,
  userId,
  onOptions,
}: {
  post: WorkoutPost;
  userId: string;
  onOptions: () => void;
}) {
  const reaction = useMyReaction(post.id, userId);

  const handleReact = useCallback(
    (postId: string, emote: EmoteId) => {
      toggleReaction(postId, userId, emote);
    },
    [userId]
  );

  return (
    <WorkoutPostCard
      post={post}
      myReaction={reaction?.emote}
      onReact={handleReact}
      onOptions={onOptions}
    />
  );
}

// New posts banner component
function NewPostsBanner({
  count,
  onPress,
}: {
  count: number;
  onPress: () => void;
}) {
  const c = useThemeColors();
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -60,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [count, translateY]);

  if (count === 0) return null;

  return (
    <Animated.View
      style={[
        styles.newPostsBanner,
        {
          backgroundColor: c.primary,
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable onPress={onPress} style={styles.newPostsContent}>
        <Ionicons name="arrow-up" size={16} color="#fff" />
        <Text style={styles.newPostsText}>
          {count} new {count === 1 ? "post" : "posts"}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// Empty state component
function EmptyFeed({ mode }: { mode: FeedMode }) {
  const c = useThemeColors();

  return (
    <View style={[styles.emptyContainer, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: c.bg }]}>
        <Ionicons
          name={mode === "friends" ? "people-outline" : "fitness-outline"}
          size={40}
          color={c.muted}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: c.text }]}>
        {mode === "friends" ? "No friend posts yet" : "No posts yet"}
      </Text>
      <Text style={[styles.emptySubtitle, { color: c.muted }]}>
        {mode === "friends"
          ? "Add friends to see their workouts here"
          : "Complete a workout and share it to see it here"}
      </Text>
      {mode === "friends" && (
        <Link href="/friends" asChild>
          <Pressable style={[styles.emptyButton, { backgroundColor: c.primary }]}>
            <Ionicons name="person-add" size={16} color="#fff" />
            <Text style={styles.emptyButtonText}>Find Friends</Text>
          </Pressable>
        </Link>
      )}
    </View>
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

  // Pagination state
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [lastSeenPostId, setLastSeenPostId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

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
      syncFeed().catch((err) => {
        console.error("[Feed] Failed to sync:", err);
      });
    }
  }, [user?.id, syncFeed]);

  // Track new posts
  useEffect(() => {
    if (all.length > 0 && lastSeenPostId) {
      const lastSeenIndex = all.findIndex((p) => p.id === lastSeenPostId);
      if (lastSeenIndex > 0) {
        setNewPostsCount(lastSeenIndex);
      }
    } else if (all.length > 0 && !lastSeenPostId) {
      setLastSeenPostId(all[0].id);
    }
  }, [all, lastSeenPostId]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await syncFeed();
      // Reset to show new posts at top
      setNewPostsCount(0);
      if (all.length > 0) {
        setLastSeenPostId(all[0].id);
      }
    } catch (err) {
      console.error("[Feed] Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  }, [syncFeed, all]);

  // Handle "new posts" tap
  const handleNewPostsTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNewPostsCount(0);
    if (all.length > 0) {
      setLastSeenPostId(all[0].id);
    }
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [all]);

  // Friend filtering
  const friendIdSet = useMemo(() => {
    const set = new Set<string>();
    for (const e of edges) {
      if (e.status === "friends") set.add(e.otherUserId);
    }
    return set;
  }, [edges]);

  // Filter and sort posts
  const posts = useMemo(() => {
    const sorted = [...all].sort((a, b) => b.createdAtMs - a.createdAtMs);

    if (mode === "public") return sorted;

    // Friends mode: only friends' posts with friends visibility
    return sorted.filter(
      (p) => p.privacy === "friends" && (p.authorUserId === ME || friendIdSet.has(p.authorUserId))
    );
  }, [all, mode, friendIdSet]);

  // Paginated posts
  const displayedPosts = useMemo(
    () => posts.slice(0, displayCount),
    [posts, displayCount]
  );

  // Load more on scroll
  const handleLoadMore = useCallback(() => {
    if (displayCount < posts.length) {
      setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, posts.length));
    }
  }, [displayCount, posts.length]);

  // Mode toggle
  const ToggleChip = ({
    label,
    active,
    onPress,
    icon,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
    icon: string;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.toggleChip,
        {
          borderColor: active ? c.primary : c.border,
          backgroundColor: active ? `${c.primary}15` : c.card,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={active ? c.primary : c.muted}
      />
      <Text
        style={[
          styles.toggleChipText,
          { color: active ? c.primary : c.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  // Render list header
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={[styles.title, { color: c.text }]}>Feed</Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>
          Workouts, PRs, and wins from the community
        </Text>
      </View>

      {/* Mode toggle */}
      <View style={styles.controlsRow}>
        <View style={styles.toggleGroup}>
          <ToggleChip
            label="Public"
            active={mode === "public"}
            onPress={() => setMode("public")}
            icon="globe-outline"
          />
          <ToggleChip
            label="Friends"
            active={mode === "friends"}
            onPress={() => setMode("friends")}
            icon="people-outline"
          />
        </View>

        <View style={styles.rightControls}>
          <SyncStatusIndicator displayMode="compact" storeName="social" />
          <Link href="/friends" asChild>
            <Pressable
              style={({ pressed }) => [
                styles.manageButton,
                { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Ionicons name="settings-outline" size={16} color={c.muted} />
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );

  // Render post item
  const renderItem = useCallback(
    ({ item }: { item: WorkoutPost }) => (
      <View style={styles.postItem}>
        <PostCardWrapper
          post={item}
          userId={userId}
          onOptions={() => setSelectedPostForOptions(item)}
        />
      </View>
    ),
    [userId]
  );

  // Render empty state
  const renderEmpty = () => <EmptyFeed mode={mode} />;

  // Render footer (loading more indicator)
  const renderFooter = () => {
    if (displayCount >= posts.length) return null;

    return (
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: c.muted }]}>
          Loading more...
        </Text>
      </View>
    );
  };

  // Key extractor
  const keyExtractor = useCallback((item: WorkoutPost) => item.id, []);

  return (
    <ProtectedRoute>
      <TabErrorBoundary screenName="Feed">
        <View style={[styles.container, { backgroundColor: c.bg }]}>
          {/* New posts banner */}
          <NewPostsBanner count={newPostsCount} onPress={handleNewPostsTap} />

          <FlatList
            ref={flatListRef}
            data={displayedPosts}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={c.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            // Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={7}
            initialNumToRender={5}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 16,
    gap: 16,
    marginBottom: 16,
  },
  titleSection: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleGroup: {
    flexDirection: "row",
    gap: 8,
  },
  toggleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  rightControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  manageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  postItem: {
    marginBottom: 16,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // New posts banner
  newPostsBanner: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    zIndex: 100,
    borderRadius: 20,
    overflow: "hidden",
  },
  newPostsContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  newPostsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  // Empty state
  emptyContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 260,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
