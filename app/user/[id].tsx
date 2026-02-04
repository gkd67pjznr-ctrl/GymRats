// app/user/[id].tsx
// Public user profile page showing stats, posts, and friend status

import { Stack, useLocalSearchParams, Link } from "expo-router";
import { useMemo, useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useThemeColors } from "../../src/ui/theme";
import { FR } from "../../src/ui/GrStyle";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { useFeedAll } from "../../src/lib/stores/socialStore";
import { useFriendEdge, sendFriendRequest, acceptFriendRequest, removeFriend } from "../../src/lib/stores/friendsStore";
import { useUser } from "../../src/lib/stores/authStore";
import { displayName, getUser as getDemoUser, ME_ID } from "../../src/lib/userDirectory";
import { timeAgo } from "../../src/lib/units";
import type { WorkoutPost } from "../../src/lib/socialModel";
import { RankBadge } from "../../src/ui/components/Social";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  colors: any;
}

function StatCard({ label, value, icon, colors }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function PostMiniCard({ post, colors }: { post: WorkoutPost; colors: any }) {
  return (
    <Link href={`/post/${post.id}` as any} asChild>
      <Pressable style={[styles.miniCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.miniCardHeader}>
          <Text style={[styles.miniCardTitle, { color: colors.text }]} numberOfLines={1}>
            {post.title ?? "Workout"}
          </Text>
          <RankBadge post={post} size="sm" variant="minimal" showLabel={false} />
        </View>
        <Text style={[styles.miniCardMeta, { color: colors.muted }]}>
          {post.exerciseCount ?? 0} exercises • {post.setCount ?? 0} sets
        </Text>
        <Text style={[styles.miniCardTime, { color: colors.muted }]}>
          {timeAgo(post.createdAtMs)}
        </Text>
      </Pressable>
    </Link>
  );
}

export default function UserProfileScreen() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const profileUserId = params.id ?? "";

  const currentUser = useUser();
  const currentUserId = currentUser?.id ?? ME_ID;
  const isOwnProfile = profileUserId === currentUserId;

  // Get user info (demo user directory for now)
  const profileUser = getDemoUser(profileUserId);
  const friendEdge = useFriendEdge(currentUserId, profileUserId);
  const friendStatus = friendEdge?.status ?? "none";

  // Get user's posts
  const allPosts = useFeedAll();
  const userPosts = useMemo(() => {
    return allPosts
      .filter(p => p.authorUserId === profileUserId)
      .slice(0, 10);
  }, [allPosts, profileUserId]);

  // Calculate stats
  const stats = useMemo(() => {
    const workoutCount = userPosts.length;
    const totalSets = userPosts.reduce((sum, p) => sum + (p.setCount ?? 0), 0);
    const totalExercises = userPosts.reduce((sum, p) => sum + (p.exerciseCount ?? 0), 0);
    return { workoutCount, totalSets, totalExercises };
  }, [userPosts]);

  const [actionLoading, setActionLoading] = useState(false);

  const handleFriendAction = async () => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      if (friendStatus === "none") {
        await sendFriendRequest(currentUserId, profileUserId);
      } else if (friendStatus === "pending") {
        await acceptFriendRequest(currentUserId, profileUserId);
      } else if (friendStatus === "friends" || friendStatus === "requested") {
        await removeFriend(currentUserId, profileUserId);
      }
    } catch (error) {
      console.error("Friend action failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const getFriendButtonText = () => {
    switch (friendStatus) {
      case "none": return "Add Friend";
      case "requested": return "Request Sent";
      case "pending": return "Accept Request";
      case "friends": return "Friends";
      case "blocked": return "Blocked";
      default: return "Add Friend";
    }
  };

  const getFriendButtonIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (friendStatus) {
      case "none": return "person-add";
      case "requested": return "hourglass";
      case "pending": return "checkmark";
      case "friends": return "people";
      case "blocked": return "ban";
      default: return "person-add";
    }
  };

  const renderPost = ({ item }: { item: WorkoutPost }) => (
    <PostMiniCard post={item} colors={c} />
  );

  const ListHeader = () => (
    <>
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: c.bg, borderColor: c.border }]}>
            <Text style={styles.avatarText}>
              {profileUser.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.displayName, { color: c.text }]}>{profileUser.name}</Text>
            {profileUser.subtitle && (
              <Text style={[styles.subtitle, { color: c.muted }]}>{profileUser.subtitle}</Text>
            )}
          </View>
        </View>

        {profileUser.bio && (
          <Text style={[styles.bio, { color: c.text }]}>{profileUser.bio}</Text>
        )}

        {/* Friend action button (don't show for own profile) */}
        {!isOwnProfile && (
          <Pressable
            onPress={handleFriendAction}
            disabled={actionLoading || friendStatus === "blocked"}
            style={({ pressed }) => [
              styles.friendButton,
              {
                backgroundColor: friendStatus === "friends" ? c.card : c.primary,
                borderColor: friendStatus === "friends" ? c.border : c.primary,
                opacity: pressed ? 0.7 : actionLoading ? 0.5 : 1,
              },
            ]}
          >
            <Ionicons
              name={getFriendButtonIcon()}
              size={18}
              color={friendStatus === "friends" ? c.text : "#fff"}
            />
            <Text
              style={[
                styles.friendButtonText,
                { color: friendStatus === "friends" ? c.text : "#fff" },
              ]}
            >
              {getFriendButtonText()}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard label="Workouts" value={stats.workoutCount} icon="🏋️" colors={c} />
        <StatCard label="Sets" value={stats.totalSets} icon="✅" colors={c} />
        <StatCard label="Exercises" value={stats.totalExercises} icon="💪" colors={c} />
      </View>

      {/* Recent Activity Header */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>
        Recent Activity
      </Text>
    </>
  );

  const ListEmpty = () => (
    <View style={[styles.emptyState, { borderColor: c.border }]}>
      <Ionicons name="fitness-outline" size={48} color={c.muted} />
      <Text style={[styles.emptyText, { color: c.muted }]}>
        No workouts shared yet
      </Text>
    </View>
  );

  return (
    <ProtectedRoute>
      <Stack.Screen options={{ title: profileUser.name }} />
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <FlatList
          data={userPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  header: {
    padding: 16,
    borderRadius: FR.radius.lg,
    borderWidth: 1,
    gap: 12,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  displayName: {
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
  friendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: FR.radius.pill,
    borderWidth: 1,
  },
  friendButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: FR.radius.md,
    borderWidth: 1,
    gap: 4,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  miniCard: {
    padding: 14,
    borderRadius: FR.radius.md,
    borderWidth: 1,
    gap: 6,
    marginBottom: 8,
  },
  miniCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  miniCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  miniCardMeta: {
    fontSize: 13,
  },
  miniCardTime: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    gap: 12,
    borderRadius: FR.radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
