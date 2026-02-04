// app/post/[id].tsx
// Post detail screen with enhanced comments

import { Stack, useLocalSearchParams, Link } from "expo-router";
import { useMemo, useState, useCallback } from "react";
import { Pressable, Text, View, StyleSheet, ScrollView } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Comment, EmoteId } from "../../src/lib/socialModel";
import {
  addComment,
  deleteComment,
  toggleReaction,
  useMyReaction,
  usePost,
  usePostComments,
} from "../../src/lib/stores/socialStore";
import { useUser } from "../../src/lib/stores/authStore";
import { useThemeColors } from "../../src/ui/theme";
import { KeyboardAwareScrollView } from "../../src/ui/components/KeyboardAwareScrollView";
import { timeAgo } from "../../src/lib/units";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { CommentInput, CommentList } from "../../src/ui/components/Social";
import { PhotoCard } from "../../src/ui/components/Social/PhotoCard";
import { ME_ID } from "../../src/lib/userDirectory";

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
  if (n < 1000000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`;
  return `${(n / 1000000).toFixed(1).replace('.0', '')}m`;
}

// Animated emote button component
function AnimatedEmoteButton({
  emote,
  active,
  onPress,
  accentColor,
}: {
  emote: EmoteId;
  active?: boolean;
  onPress: () => void;
  accentColor: string;
}) {
  const c = useThemeColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress, scale]);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.emoteButton,
          {
            backgroundColor: active ? `${accentColor}20` : c.bg,
            borderColor: active ? accentColor : c.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text style={styles.emoteText}>{emoteLabel(emote)}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function PostDetailScreen() {
  const c = useThemeColors();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id ?? "";
  const user = useUser();
  const userId = user?.id ?? ME_ID;
  const userName = user?.email?.split('@')[0] ?? 'You';

  const post = usePost(id);
  const comments = usePostComments(id);
  const myReaction = useMyReaction(id, userId);

  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const topLines = useMemo(() => post?.workoutSnapshot?.topLines?.slice(0, 8) ?? [], [post]);

  const handleReact = useCallback((emote: EmoteId) => {
    toggleReaction(id, userId, emote);
  }, [id, userId]);

  const handleAddComment = useCallback((text: string) => {
    addComment({
      postId: id,
      myUserId: userId,
      myDisplayName: userName,
      text,
      parentCommentId: replyingTo?.id,
    });
    setReplyingTo(null);
  }, [id, userId, userName, replyingTo]);

  const handleDeleteComment = useCallback((commentId: string) => {
    deleteComment(commentId, userId);
  }, [userId]);

  const handleReply = useCallback((comment: Comment) => {
    setReplyingTo(comment);
  }, []);

  const accentColor = c.primary;

  if (!post) {
    return (
      <ProtectedRoute>
        <Stack.Screen options={{ title: "Post" }} />
        <View style={[styles.container, { backgroundColor: c.bg }]}>
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.title, { color: c.text }]}>Post not found</Text>
            <Text style={[styles.subtitle, { color: c.muted }]}>
              This post may have been deleted or hasn't loaded yet.
            </Text>
          </View>
        </View>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Stack.Screen options={{ title: "Post" }} />
      <KeyboardAwareScrollView
        style={[styles.container, { backgroundColor: c.bg }]}
        contentContainerStyle={styles.content}
      >
        {/* Post Header Card */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          {/* Author row */}
          <View style={styles.headerRow}>
            <Link href={{ pathname: '/u/[id]', params: { id: post.authorUserId } } as any} asChild>
              <Pressable style={styles.authorTouchable}>
                <Text style={[styles.authorName, { color: c.text }]}>
                  {post.authorDisplayName}
                </Text>
              </Pressable>
            </Link>
            <Text style={[styles.timestamp, { color: c.muted }]}>{timeAgo(post.createdAtMs)}</Text>
          </View>

          {/* Title */}
          {post.title && (
            <Text style={[styles.postTitle, { color: c.text }]}>{post.title}</Text>
          )}

          {/* Caption */}
          {post.caption && (
            <Text style={[styles.caption, { color: c.text }]}>{post.caption}</Text>
          )}

          {/* Photos */}
          {post.photoUrls && post.photoUrls.length > 0 && (
            <View style={styles.photoSection}>
              <PhotoCard photoUrls={post.photoUrls} />
            </View>
          )}

          {/* Stats row */}
          <View style={[styles.statsRow, { backgroundColor: `${accentColor}10` }]}>
            {post.exerciseCount !== undefined && post.exerciseCount > 0 && (
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: accentColor }]}>{post.exerciseCount}</Text>
                <Text style={[styles.statLabel, { color: c.muted }]}>exercises</Text>
              </View>
            )}
            {post.setCount !== undefined && post.setCount > 0 && (
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: accentColor }]}>{post.setCount}</Text>
                <Text style={[styles.statLabel, { color: c.muted }]}>sets</Text>
              </View>
            )}
            {post.durationSec !== undefined && post.durationSec > 0 && (
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: accentColor }]}>{Math.round(post.durationSec / 60)}m</Text>
                <Text style={[styles.statLabel, { color: c.muted }]}>duration</Text>
              </View>
            )}
          </View>

          {/* Reactions */}
          <View style={styles.reactionsSection}>
            <View style={styles.emoteRow}>
              <AnimatedEmoteButton emote="like" active={myReaction?.emote === 'like'} onPress={() => handleReact('like')} accentColor={accentColor} />
              <AnimatedEmoteButton emote="fire" active={myReaction?.emote === 'fire'} onPress={() => handleReact('fire')} accentColor={accentColor} />
              <AnimatedEmoteButton emote="crown" active={myReaction?.emote === 'crown'} onPress={() => handleReact('crown')} accentColor={accentColor} />
              <AnimatedEmoteButton emote="clap" active={myReaction?.emote === 'clap'} onPress={() => handleReact('clap')} accentColor={accentColor} />
              <AnimatedEmoteButton emote="bolt" active={myReaction?.emote === 'bolt'} onPress={() => handleReact('bolt')} accentColor={accentColor} />
            </View>
            <Text style={[styles.engagementText, { color: c.muted }]}>
              {compactNum(post.likeCount)} reactions • {compactNum(post.commentCount)} comments
            </Text>
          </View>
        </View>

        {/* Workout Snapshot */}
        {topLines.length > 0 && (
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Workout Snapshot</Text>
            <View style={styles.exerciseList}>
              {topLines.map((t, idx) => (
                <View
                  key={`${t.exerciseName}-${idx}`}
                  style={[styles.exerciseRow, { backgroundColor: c.bg, borderColor: c.border }]}
                >
                  <Text style={[styles.exerciseName, { color: c.text }]}>{t.exerciseName}</Text>
                  {t.bestSet && (
                    <Text style={[styles.exerciseStats, { color: c.muted }]}>
                      {t.bestSet.weightLabel} × {t.bestSet.reps}
                      {t.bestSet.e1rmLabel && ` • e1RM ${t.bestSet.e1rmLabel}`}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Comments Section */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            Comments {comments.length > 0 && `(${comments.length})`}
          </Text>

          {/* Comment input */}
          <CommentInput
            onSubmit={handleAddComment}
            placeholder={replyingTo ? `Reply to ${replyingTo.userDisplayName}...` : "Write a comment..."}
            replyingTo={replyingTo?.userDisplayName}
            onCancelReply={() => setReplyingTo(null)}
          />

          {/* Comments list */}
          <View style={styles.commentsList}>
            <CommentList
              comments={comments}
              currentUserId={userId}
              onReply={handleReply}
              onDelete={handleDeleteComment}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 13,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 15,
    lineHeight: 22,
  },
  photoSection: {
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 10,
    paddingVertical: 12,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reactionsSection: {
    gap: 10,
  },
  emoteRow: {
    flexDirection: 'row',
    gap: 8,
  },
  emoteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  emoteText: {
    fontSize: 18,
  },
  engagementText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  exerciseList: {
    gap: 8,
  },
  exerciseRow: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
  },
  exerciseStats: {
    fontSize: 13,
  },
  commentsList: {
    marginTop: 8,
  },
});
