// src/ui/components/Social/CommentsSection.tsx
// Reusable comments section with input and thread display

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Comment } from "../../../lib/socialModel";
import { addComment, usePostComments } from "../../../lib/stores/socialStore";
import { useUser } from "../../../lib/stores/authStore";
import { displayName, ME_ID } from "../../../lib/userDirectory";
import { useThemeColors } from "../../theme";
import { FR } from "../../GrStyle";
import { timeAgo } from "../../../lib/units";

interface CommentsSectionProps {
  postId: string;
  maxDisplay?: number;
  showInput?: boolean;
  onCommentAdded?: (comment: Comment) => void;
}

export function CommentsSection({
  postId,
  maxDisplay,
  showInput = true,
  onCommentAdded,
}: CommentsSectionProps) {
  const c = useThemeColors();
  const user = useUser();
  const comments = usePostComments(postId);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = user?.id ?? ME_ID;
  const userName = user?.displayName ?? displayName(ME_ID);

  const displayedComments = maxDisplay ? comments.slice(-maxDisplay) : comments;
  const hiddenCount = maxDisplay ? Math.max(0, comments.length - maxDisplay) : 0;

  const handleSubmit = useCallback(() => {
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const result = addComment({
      postId,
      myUserId: userId,
      myDisplayName: userName,
      text: text.trim(),
    });

    if (result) {
      setText("");
      onCommentAdded?.(result);
    }
    setIsSubmitting(false);
  }, [text, isSubmitting, postId, userId, userName, onCommentAdded]);

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
      <View style={[styles.commentCard, { backgroundColor: c.bg, borderColor: c.border }]}>
        <View style={styles.commentHeader}>
          <View style={styles.commentAvatar}>
            <Ionicons name="person" size={14} color={c.muted} />
          </View>
          <View style={styles.commentMeta}>
            <Text style={[styles.commentAuthor, { color: c.text }]}>
              {item.userDisplayName}
            </Text>
            <Text style={[styles.commentTime, { color: c.muted }]}>
              {timeAgo(item.createdAtMs)}
            </Text>
          </View>
        </View>
        <Text style={[styles.commentText, { color: c.text }]}>{item.text}</Text>
      </View>
    ),
    [c]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]}>
          Comments {comments.length > 0 && `(${comments.length})`}
        </Text>
      </View>

      {/* Hidden comments indicator */}
      {hiddenCount > 0 && (
        <Pressable style={[styles.hiddenIndicator, { backgroundColor: c.card }]}>
          <Text style={[styles.hiddenText, { color: c.muted }]}>
            View {hiddenCount} more comment{hiddenCount > 1 ? "s" : ""}
          </Text>
          <Ionicons name="chevron-up" size={16} color={c.muted} />
        </Pressable>
      )}

      {/* Comments list */}
      {displayedComments.length === 0 ? (
        <View style={[styles.emptyState, { borderColor: c.border }]}>
          <Ionicons name="chatbubble-outline" size={32} color={c.muted} />
          <Text style={[styles.emptyText, { color: c.muted }]}>
            No comments yet. Be the first to comment!
          </Text>
        </View>
      ) : (
        <View style={styles.commentsList}>
          {displayedComments.map((comment) => (
            <View key={comment.id}>
              {renderComment({ item: comment })}
            </View>
          ))}
        </View>
      )}

      {/* Comment input */}
      {showInput && (
        <View style={[styles.inputContainer, { borderColor: c.border, backgroundColor: c.card }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write a comment..."
            placeholderTextColor={c.muted}
            style={[styles.input, { color: c.text, backgroundColor: c.bg, borderColor: c.border }]}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
            blurOnSubmit={false}
          />
          <Pressable
            onPress={handleSubmit}
            disabled={!text.trim() || isSubmitting}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: text.trim() ? c.primary : c.border,
                opacity: pressed ? 0.7 : text.trim() ? 1 : 0.5,
              },
            ]}
          >
            <Ionicons
              name="send"
              size={18}
              color={text.trim() ? "#fff" : c.muted}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  hiddenIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 8,
    borderRadius: FR.radius.md,
  },
  hiddenText: {
    fontSize: 13,
    fontWeight: "500",
  },
  commentsList: {
    gap: 8,
  },
  commentCard: {
    padding: 12,
    borderRadius: FR.radius.md,
    borderWidth: 1,
    gap: 8,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(128,128,128,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  commentMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
  },
  commentTime: {
    fontSize: 11,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
    gap: 8,
    borderRadius: FR.radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 8,
    borderRadius: FR.radius.md,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: FR.radius.sm,
    borderWidth: 1,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CommentsSection;
