// src/ui/components/Social/WorkoutPostCard.tsx
// An attractive card for displaying workout posts in the social feed

import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { WorkoutPost, EmoteId } from '../../../lib/socialModel';
import type { Tier } from '../../../lib/GrScoring';
import { useThemeColors } from '../../theme';
import { FR } from '../../GrStyle';
import { timeAgo } from '../../../lib/units';
import { PhotoCard } from './PhotoCard';
import { getBestTierForPost } from './RankBadge';

// Tier colors
const TIER_COLORS: Record<Tier, string> = {
  Iron: '#6B7280',
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2',
  Diamond: '#B9F2FF',
  Mythic: '#FF00FF',
};

// Emote labels
function emoteLabel(e: EmoteId): string {
  if (e === 'like') return '👍';
  if (e === 'fire') return '🔥';
  if (e === 'skull') return '💀';
  if (e === 'crown') return '👑';
  if (e === 'bolt') return '⚡';
  return '👏';
}

function compactNum(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`;
  return `${(n / 1000000).toFixed(1).replace('.0', '')}m`;
}

interface WorkoutPostCardProps {
  post: WorkoutPost;
  myReaction?: EmoteId | null;
  onReact: (postId: string, emote: EmoteId) => void;
  onOptions?: () => void;
}

export function WorkoutPostCard({
  post,
  myReaction,
  onReact,
  onOptions,
}: WorkoutPostCardProps) {
  const c = useThemeColors();
  const bestTier = getBestTierForPost(post);
  const tierColor = bestTier ? TIER_COLORS[bestTier] : c.muted;

  const top = post.workoutSnapshot?.topLines?.slice(0, 3) ?? [];
  const exerciseCount = post.exerciseCount ?? 0;
  const setCount = post.setCount ?? 0;
  const durationMin = post.durationSec ? Math.round(post.durationSec / 60) : 0;

  // Animated emote button with pop effect
  const AnimatedEmoteButton = ({ emote, active }: { emote: EmoteId; active?: boolean }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = useCallback(() => {
      // Trigger pop animation
      scale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Call reaction handler
      onReact(post.id, emote);
    }, [emote, scale]);

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.emoteButton,
            {
              backgroundColor: active ? `${tierColor}20` : c.bg,
              borderColor: active ? tierColor : c.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.emoteText, active && styles.emoteTextActive]}>{emoteLabel(emote)}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Link href={{ pathname: '/post/[id]', params: { id: post.id } } as any} asChild>
      <Pressable style={({ pressed }) => [styles.card, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.9 : 1 }]}>
        {/* Accent bar */}
        <View style={[styles.accentBar, { backgroundColor: tierColor }]} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: c.text }]}>{post.authorDisplayName}</Text>
            <Text style={[styles.postTime, { color: c.muted }]}>{timeAgo(post.createdAtMs)}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.privacyBadge, { backgroundColor: c.bg, borderColor: c.border }]}>
              <Text style={[styles.privacyText, { color: c.muted }]}>{post.privacy.toUpperCase()}</Text>
            </View>
            {onOptions && (
              <Pressable onPress={onOptions} style={styles.optionsButton}>
                <Text style={[styles.optionsText, { color: c.muted }]}>•••</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Title & Stats Row */}
        <View style={styles.titleSection}>
          <Text style={[styles.workoutTitle, { color: c.text }]} numberOfLines={1}>
            {post.title ?? 'Workout'}
          </Text>
          {bestTier && (
            <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
              <Text style={styles.tierText}>{bestTier.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Stats row */}
        <View style={[styles.statsRow, { backgroundColor: `${tierColor}10` }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: tierColor }]}>{exerciseCount}</Text>
            <Text style={[styles.statLabel, { color: c.muted }]}>exercises</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: tierColor }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: tierColor }]}>{setCount}</Text>
            <Text style={[styles.statLabel, { color: c.muted }]}>sets</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: tierColor }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: tierColor }]}>{durationMin}m</Text>
            <Text style={[styles.statLabel, { color: c.muted }]}>duration</Text>
          </View>
        </View>

        {/* Top lifts */}
        {top.length > 0 && (
          <View style={styles.exercisesList}>
            {top.map((line, i) => (
              <View key={i} style={styles.exerciseRow}>
                <Text style={[styles.exerciseName, { color: c.text }]} numberOfLines={1}>
                  {typeof line === 'string'
                    ? line
                    : line.exerciseName}
                </Text>
                {typeof line !== 'string' && line.bestSet && (
                  <Text style={[styles.exerciseStats, { color: c.muted }]}>
                    {line.bestSet.weightLabel} × {line.bestSet.reps}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Caption */}
        {post.caption && (
          <Text style={[styles.caption, { color: c.text }]} numberOfLines={2}>
            {post.caption}
          </Text>
        )}

        {/* Photos */}
        {post.photoUrls && post.photoUrls.length > 0 && (
          <View style={styles.photoSection}>
            <PhotoCard photoUrls={post.photoUrls} />
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.reactions}>
            <AnimatedEmoteButton emote="like" active={myReaction === 'like'} />
            <AnimatedEmoteButton emote="fire" active={myReaction === 'fire'} />
            <AnimatedEmoteButton emote="crown" active={myReaction === 'crown'} />
          </View>
          <Text style={[styles.engagementText, { color: c.muted }]}>
            {compactNum(post.likeCount)} likes • {compactNum(post.commentCount)} comments
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 0,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  postTime: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  privacyBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  privacyText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  optionsButton: {
    padding: 4,
  },
  optionsText: {
    fontSize: 16,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '900',
    flex: 1,
    marginRight: 10,
  },
  tierBadge: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tierText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 14,
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 12,
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
  statDivider: {
    width: 1,
    height: 24,
    opacity: 0.3,
  },
  exercisesList: {
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 6,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  exerciseStats: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  caption: {
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  photoSection: {
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    paddingTop: 0,
  },
  reactions: {
    flexDirection: 'row',
    gap: 8,
  },
  emoteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  emoteText: {
    fontSize: 16,
  },
  emoteTextActive: {
    transform: [{ scale: 1.1 }],
  },
  engagementText: {
    fontSize: 12,
  },
});

export default WorkoutPostCard;
