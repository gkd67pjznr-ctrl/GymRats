// app/u/[id].tsx
// Enhanced public user profile screen

import { Stack, useLocalSearchParams, useRouter, Link } from "expo-router";
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { ensureThread } from "../../src/lib/stores/chatStore";
import {
  acceptFriendRequest,
  areFriends,
  getFriendStatus,
  hydrateFriends,
  sendFriendRequest,
} from "../../src/lib/stores/friendsStore";
import { useFeedAll, toggleReaction, useMyReaction } from "../../src/lib/stores/socialStore";
import { useGamificationProfile } from "../../src/lib/stores/gamificationStore";
import { useLifetimeStats, useGymRank, useExerciseStats } from "../../src/lib/stores/userStatsStore";
import { useUser } from "../../src/lib/stores/authStore";
import type { ID, WorkoutPost, EmoteId } from "../../src/lib/socialModel";
import { getUser, ME_ID } from "../../src/lib/userDirectory";
import { useThemeColors } from "../../src/ui/theme";
import { timeAgo } from "../../src/lib/units";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { ProfileStatsCard } from "../../src/ui/components/Profile";
import { WorkoutPostCard } from "../../src/ui/components/Social";

// Tier colors
const TIER_COLORS: Record<string, string> = {
  Iron: '#6B7280',
  iron: '#6B7280',
  Bronze: '#CD7F32',
  bronze: '#CD7F32',
  Silver: '#C0C0C0',
  silver: '#C0C0C0',
  Gold: '#FFD700',
  gold: '#FFD700',
  Platinum: '#E5E4E2',
  platinum: '#E5E4E2',
  Diamond: '#B9F2FF',
  diamond: '#B9F2FF',
  Mythic: '#FF00FF',
  mythic: '#FF00FF',
};

function labelForStatus(opts: { isFriends: boolean; outgoing: string; incoming: string }): string {
  const { isFriends, outgoing, incoming } = opts;
  if (isFriends) return "Friends";
  if (outgoing === "blocked" || incoming === "blocked") return "Blocked";
  if (incoming === "requested") return "Wants to connect";
  if (outgoing === "requested") return "Request sent";
  return "Not connected";
}

export default function PublicProfileScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const currentUser = useUser();

  hydrateFriends().catch(() => {});

  const userId = (params?.id ?? "") as ID;
  const ME = currentUser?.id ?? ME_ID;

  // Get user stats (only available for current user in v1)
  const lifetimeStats = useLifetimeStats();
  const gymRank = useGymRank();
  const gamification = useGamificationProfile();
  const exerciseStats = useExerciseStats();

  // Get posts
  const allPosts = useFeedAll();

  if (!userId) {
    return (
      <ProtectedRoute>
        <Stack.Screen options={{ title: "Profile" }} />
        <View style={[styles.container, { backgroundColor: c.bg }]}>
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.text }]}>Missing user id</Text>
            <Pressable
              onPress={() => router.back()}
              style={[styles.button, { backgroundColor: c.bg, borderColor: c.border }]}
            >
              <Text style={[styles.buttonText, { color: c.text }]}>Go Back</Text>
            </Pressable>
          </View>
        </View>
      </ProtectedRoute>
    );
  }

  const u = getUser(userId);
  const isMe = userId === ME;
  const isFriends = !isMe && areFriends(ME, userId);

  // Friend status
  const outgoing = String(getFriendStatus(ME, userId) ?? "none");
  const incoming = String(getFriendStatus(userId, ME) ?? "none");
  const statusLabel = isMe ? "Your Profile" : labelForStatus({ isFriends, outgoing, incoming });

  const blocked = outgoing === "blocked" || incoming === "blocked";
  const canSendRequest = !isMe && !isFriends && !blocked && outgoing !== "requested" && incoming !== "requested";
  const canAccept = !isMe && !isFriends && !blocked && incoming === "requested";

  // Get user's posts (filter by visibility for non-friends)
  const theirPosts = allPosts
    .filter((p) => p.authorUserId === userId)
    .filter((p) => {
      if (isMe) return true;
      if (p.privacy === 'public') return true;
      if (isFriends && p.privacy === 'friends') return true;
      return false;
    })
    .slice(0, 5); // Limit to 5 most recent

  const tierColor = TIER_COLORS[gymRank.tier] || c.primary;

  return (
    <ProtectedRoute>
      <Stack.Screen
        options={{
          title: isMe ? "My Profile" : u.name,
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: c.bg }]}
        contentContainerStyle={styles.content}
      >
        {/* Profile Header */}
        <View style={[styles.headerCard, { backgroundColor: c.card, borderColor: c.border }]}>
          {/* Accent bar */}
          {isMe && <View style={[styles.accentBar, { backgroundColor: tierColor }]} />}

          <View style={styles.headerContent}>
            {/* Avatar placeholder */}
            <View style={[styles.avatarCircle, { backgroundColor: c.bg, borderColor: c.border }]}>
              <Text style={[styles.avatarText, { color: c.text }]}>
                {u.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            {/* Name & Status */}
            <View style={styles.headerInfo}>
              <Text style={[styles.userName, { color: c.text }]}>{u.name}</Text>
              {u.subtitle && (
                <Text style={[styles.userSubtitle, { color: c.muted }]}>{u.subtitle}</Text>
              )}
              <View style={[styles.statusBadge, { backgroundColor: c.bg, borderColor: c.border }]}>
                <Text style={[styles.statusText, { color: c.muted }]}>{statusLabel}</Text>
              </View>
            </View>

            {/* Level badge (for own profile) */}
            {isMe && (
              <View style={styles.levelBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={[styles.levelText, { color: c.text }]}>
                  Lv. {gamification.currentLevel}
                </Text>
              </View>
            )}
          </View>

          {/* Bio */}
          {u.bio && (
            <Text style={[styles.bio, { color: c.muted }]}>{u.bio}</Text>
          )}

          {/* Action buttons */}
          {!isMe && (
            <View style={styles.actionRow}>
              {canSendRequest && (
                <Pressable
                  onPress={() => sendFriendRequest(ME, userId)}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: c.primary, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Ionicons name="person-add" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Add Friend</Text>
                </Pressable>
              )}

              {canAccept && (
                <Pressable
                  onPress={() => acceptFriendRequest(ME, userId)}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: '#4CAF50', opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Accept Request</Text>
                </Pressable>
              )}

              {isFriends && (
                <Pressable
                  onPress={() => {
                    const t = ensureThread(ME, userId, "friendsOnly");
                    router.push(`/dm/${t.id}` as any);
                  }}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: c.bg, borderWidth: 1, borderColor: c.border, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={c.text} />
                  <Text style={[styles.actionButtonTextOutline, { color: c.text }]}>Message</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* Stats Section (only for own profile in v1) */}
        {isMe && (
          <>
            {/* Quick stats row */}
            <View style={[styles.quickStats, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatValue, { color: tierColor }]}>{gymRank.score}</Text>
                <Text style={[styles.quickStatLabel, { color: c.muted }]}>GymRank</Text>
              </View>
              <View style={[styles.quickStatDivider, { backgroundColor: c.border }]} />
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatValue, { color: c.text }]}>{lifetimeStats.totalWorkouts}</Text>
                <Text style={[styles.quickStatLabel, { color: c.muted }]}>Workouts</Text>
              </View>
              <View style={[styles.quickStatDivider, { backgroundColor: c.border }]} />
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatValue, { color: c.text }]}>{gamification.currentStreak}</Text>
                <Text style={[styles.quickStatLabel, { color: c.muted }]}>Day Streak</Text>
              </View>
              <View style={[styles.quickStatDivider, { backgroundColor: c.border }]} />
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatValue, { color: c.text }]}>
                  {lifetimeStats.totalWeightPRs + lifetimeStats.totalRepPRs + lifetimeStats.totalE1rmPRs}
                </Text>
                <Text style={[styles.quickStatLabel, { color: c.muted }]}>PRs</Text>
              </View>
            </View>

            {/* Full stats card */}
            <ProfileStatsCard limit={5} />
          </>
        )}

        {/* Posts Section */}
        <View style={styles.postsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              {isMe ? "Your Posts" : "Posts"}
            </Text>
            {theirPosts.length > 0 && (
              <Text style={[styles.postCount, { color: c.muted }]}>
                {theirPosts.length} recent
              </Text>
            )}
          </View>

          {theirPosts.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <Ionicons name="document-text-outline" size={32} color={c.muted} />
              <Text style={[styles.emptyTitle, { color: c.text }]}>No posts yet</Text>
              <Text style={[styles.emptySubtitle, { color: c.muted }]}>
                {isMe
                  ? "Complete a workout and share it to see it here"
                  : isFriends
                    ? "This user hasn't shared any posts yet"
                    : "Add them as a friend to see friends-only posts"}
              </Text>
            </View>
          ) : (
            <View style={styles.postsList}>
              {theirPosts.map((post) => (
                <PostCardWrapper key={post.id} post={post} userId={ME} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ProtectedRoute>
  );
}

// Post card wrapper for handling reactions
function PostCardWrapper({ post, userId }: { post: WorkoutPost; userId: string }) {
  const reaction = useMyReaction(post.id, userId);

  const handleReact = (postId: string, emote: EmoteId) => {
    toggleReaction(postId, userId, emote);
  };

  return (
    <WorkoutPostCard
      post={post}
      myReaction={reaction?.emote}
      onReact={handleReact}
    />
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accentBar: {
    height: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
  },
  userSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '800',
  },
  bio: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtonTextOutline: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickStats: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  quickStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickStatDivider: {
    width: 1,
    height: '100%',
  },
  postsSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  postCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  postsList: {
    gap: 16,
  },
});
