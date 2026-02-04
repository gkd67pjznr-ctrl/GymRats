// app/(tabs)/index.tsx - Home/Feed tab
// Refactored with new Design System

import { Link } from "expo-router";
import { Pressable, ScrollView, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { EmoteId, WorkoutPost } from "../../src/lib/socialModel";
import { toggleReaction, useFeedAll, useMyReaction } from "../../src/lib/stores/socialStore";
import { TabErrorBoundary } from "../../src/ui/tab-error-boundary";
import { timeAgo } from "../../src/lib/units";

// New Design System imports
import {
  Surface,
  Card,
  Text,
  colors,
  surface,
  text,
  border,
  corners,
  shadow,
  spacing,
  backgroundGradients,
} from "../../src/design";

const MY_USER_ID = "u_demo_me"; // v1 placeholder (later: auth user id)

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

// Emote button with new design system
function EmoteButton({
  postId,
  emote,
  active,
}: {
  postId: string;
  emote: EmoteId;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={() => toggleReaction(postId, MY_USER_ID, emote)}
      style={({ pressed }) => [
        styles.emoteButton,
        active && styles.emoteButtonActive,
        pressed && styles.emoteButtonPressed,
      ]}
    >
      <Text variant="label" style={styles.emoteLabel}>
        {emoteLabel(emote)}
      </Text>
    </Pressable>
  );
}

// Post card with new design system
function PostCard({ post }: { post: WorkoutPost }) {
  const my = useMyReaction(post.id, MY_USER_ID);
  const top = post.workoutSnapshot?.topLines?.slice(0, 2) ?? [];

  return (
    <Link href={`/post/${post.id}` as any} asChild>
      <Pressable>
        {({ pressed }) => (
          <Card
            variant="elevated"
            size="md"
            style={[styles.postCard, pressed && styles.postCardPressed]}
          >
            {/* Header */}
            <View style={styles.postHeader}>
              <View style={styles.postAuthorInfo}>
                <View style={styles.postAuthorRow}>
                  <Text variant="label" color="primary">
                    {post.authorDisplayName}
                  </Text>
                  <Text variant="caption" color="muted">
                    {" "}• {post.privacy === "friends" ? "Friends" : "Public"}
                  </Text>
                </View>
                <Text variant="caption" color="muted">
                  {timeAgo(post.createdAtMs)}
                </Text>
              </View>

              {!!post.title && (
                <View style={styles.titleBadge}>
                  <Text variant="caption" color="primary" bold>
                    {post.title}
                  </Text>
                </View>
              )}
            </View>

            {/* Caption */}
            {!!post.caption && (
              <Text variant="body" color="secondary" style={styles.caption}>
                {post.caption}
              </Text>
            )}

            {/* Snapshot lines */}
            {top.length > 0 && (
              <View style={styles.snapshotContainer}>
                {top.map((t, idx) => (
                  <Surface
                    key={`${t.exerciseName}-${idx}`}
                    elevation="sunken"
                    radius="input"
                    style={styles.snapshotItem}
                  >
                    <Text variant="label" color="primary">
                      {t.exerciseName}
                    </Text>
                    {!!t.bestSet && (
                      <Text variant="bodySmall" color="muted">
                        {t.bestSet.weightLabel} × {t.bestSet.reps}
                        {t.bestSet.e1rmLabel ? ` • e1RM ${t.bestSet.e1rmLabel}` : ""}
                      </Text>
                    )}
                  </Surface>
                ))}
              </View>
            )}

            {/* Meta row */}
            <View style={styles.metaRow}>
              <Text variant="caption" color="muted" bold>
                ❤️ {compactNum(post.likeCount)}
              </Text>
              <Text variant="caption" color="muted" bold>
                💬 {compactNum(post.commentCount)}
              </Text>
              {!!post.durationSec && (
                <Text variant="caption" color="muted" bold>
                  ⏱ {Math.round(post.durationSec / 60)}m
                </Text>
              )}
              {!!post.exerciseCount && (
                <Text variant="caption" color="muted" bold>
                  🏋️ {post.exerciseCount} ex
                </Text>
              )}
              {!!post.setCount && (
                <Text variant="caption" color="muted" bold>
                  ✅ {post.setCount} sets
                </Text>
              )}
            </View>

            {/* Reactions */}
            <View style={styles.reactionsRow}>
              <EmoteButton postId={post.id} emote="like" active={my?.emote === "like"} />
              <EmoteButton postId={post.id} emote="fire" active={my?.emote === "fire"} />
              <EmoteButton postId={post.id} emote="crown" active={my?.emote === "crown"} />
              <EmoteButton postId={post.id} emote="clap" active={my?.emote === "clap"} />
            </View>

            <Text variant="caption" color="muted">
              Tap to open post.
            </Text>
          </Card>
        )}
      </Pressable>
    </Link>
  );
}

// Empty state component
function EmptyState() {
  return (
    <Card variant="default" size="md" style={styles.emptyState}>
      <Text variant="h4" color="primary">
        No posts yet
      </Text>
      <Text variant="body" color="muted">
        Soon you'll be able to post a workout when you finish, and it will show up here.
      </Text>
    </Card>
  );
}

export default function FeedTab() {
  const posts = useFeedAll();

  return (
    <TabErrorBoundary screenName="Home">
      {/* Screen background with gradient */}
      <View style={styles.container}>
        <LinearGradient
          colors={backgroundGradients.screenDepth.colors as unknown as readonly [string, string, ...string[]]}
          start={backgroundGradients.screenDepth.start}
          end={backgroundGradients.screenDepth.end}
          locations={backgroundGradients.screenDepth.locations as unknown as readonly [number, number, ...number[]] | undefined}
          style={StyleSheet.absoluteFill}
        />

        {/* Top glow accent */}
        <LinearGradient
          colors={backgroundGradients.topGlow.colors as unknown as readonly [string, string, ...string[]]}
          start={backgroundGradients.topGlow.start}
          end={backgroundGradients.topGlow.end}
          style={styles.topGlow}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header section */}
          <View style={styles.header}>
            <Text variant="h1" color="primary">
              Friends
            </Text>
            <Text variant="body" color="muted">
              Public workouts from the community.
            </Text>
          </View>

          {/* Posts or empty state */}
          {posts.length === 0 ? (
            <EmptyState />
          ) : (
            <View style={styles.postsContainer}>
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </TabErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: surface.base,
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    pointerEvents: "none",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  postsContainer: {
    gap: spacing.md,
  },
  postCard: {
    gap: spacing.sm,
  },
  postCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  postAuthorInfo: {
    gap: 2,
  },
  postAuthorRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  titleBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: corners.pill,
    backgroundColor: surface.sunken,
    borderWidth: 1,
    borderColor: border.subtle,
  },
  caption: {
    lineHeight: 20,
  },
  snapshotContainer: {
    gap: spacing.xs,
  },
  snapshotItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  reactionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  emoteButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: corners.pill,
    borderWidth: 1,
    borderColor: border.subtle,
    backgroundColor: surface.raised,
  },
  emoteButtonActive: {
    borderColor: colors.toxic.primary,
    backgroundColor: colors.toxic.soft,
  },
  emoteButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  emoteLabel: {
    fontSize: 16,
  },
  emptyState: {
    gap: spacing.sm,
  },
});
