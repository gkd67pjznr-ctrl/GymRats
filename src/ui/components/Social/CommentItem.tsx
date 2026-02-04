// src/ui/components/Social/CommentItem.tsx
// Single comment display with reply and delete actions

import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Comment } from '../../../lib/socialModel';
import { useThemeColors } from '../../theme';
import { timeAgo } from '../../../lib/units';

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  onReply?: (comment: Comment) => void;
  onDelete?: (commentId: string) => void;
  isReply?: boolean;
}

export function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  isReply = false,
}: CommentItemProps) {
  const c = useThemeColors();
  const isOwn = comment.userId === currentUserId;

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(comment.id),
        },
      ]
    );
  }, [comment.id, onDelete]);

  const handleReply = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReply?.(comment);
  }, [comment, onReply]);

  return (
    <View style={[styles.container, isReply && styles.replyContainer]}>
      {isReply && <View style={[styles.replyLine, { backgroundColor: c.border }]} />}

      <View style={[styles.card, { backgroundColor: c.bg, borderColor: c.border }]}>
        {/* Header */}
        <View style={styles.header}>
          <Link href={{ pathname: '/u/[id]', params: { id: comment.userId } } as any} asChild>
            <Pressable style={styles.authorTouchable}>
              <Text style={[styles.authorName, { color: c.text }]}>
                {comment.userDisplayName}
              </Text>
            </Pressable>
          </Link>
          <Text style={[styles.time, { color: c.muted }]}>
            {timeAgo(comment.createdAtMs)}
          </Text>
        </View>

        {/* Content */}
        <Text style={[styles.text, { color: c.text }]}>{comment.text}</Text>

        {/* Actions */}
        <View style={styles.actions}>
          {onReply && (
            <Pressable
              onPress={handleReply}
              style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Ionicons name="chatbubble-outline" size={14} color={c.muted} />
              <Text style={[styles.actionText, { color: c.muted }]}>Reply</Text>
            </Pressable>
          )}

          {isOwn && onDelete && (
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Ionicons name="trash-outline" size={14} color={c.muted} />
              <Text style={[styles.actionText, { color: c.muted }]}>Delete</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * Comment list with threading support
 */
interface CommentListProps {
  comments: Comment[];
  currentUserId: string;
  onReply?: (comment: Comment) => void;
  onDelete?: (commentId: string) => void;
}

export function CommentList({
  comments,
  currentUserId,
  onReply,
  onDelete,
}: CommentListProps) {
  const c = useThemeColors();

  // Separate root comments from replies
  const rootComments = comments.filter(c => !c.parentCommentId);
  const repliesMap = new Map<string, Comment[]>();

  comments.forEach(comment => {
    if (comment.parentCommentId) {
      const existing = repliesMap.get(comment.parentCommentId) || [];
      repliesMap.set(comment.parentCommentId, [...existing, comment]);
    }
  });

  // Sort root comments by date (newest first)
  const sortedRoots = [...rootComments].sort((a, b) => b.createdAtMs - a.createdAtMs);

  if (comments.length === 0) {
    return (
      <Text style={[styles.emptyText, { color: c.muted }]}>
        No comments yet. Be the first to comment!
      </Text>
    );
  }

  return (
    <View style={styles.listContainer}>
      {sortedRoots.map(comment => {
        const replies = repliesMap.get(comment.id) || [];
        // Sort replies by date (oldest first for conversation flow)
        const sortedReplies = [...replies].sort((a, b) => a.createdAtMs - b.createdAtMs);

        return (
          <View key={comment.id} style={styles.threadContainer}>
            <CommentItem
              comment={comment}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
            />
            {sortedReplies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onReply={onReply}
                onDelete={onDelete}
                isReply
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  replyContainer: {
    marginLeft: 24,
  },
  replyLine: {
    width: 2,
    marginRight: 12,
    borderRadius: 1,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    gap: 12,
  },
  threadContainer: {
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default CommentItem;
