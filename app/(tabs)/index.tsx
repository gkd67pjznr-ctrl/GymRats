// app/(tabs)/index.tsx - Home tab
// Main hub with Friends dropdown and user's Hangout Room

import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabErrorBoundary } from "../../src/ui/tab-error-boundary";
import { TAB_BAR_HEIGHT } from "../../src/ui/components/PersistentTabBar";

// New Design System imports
import {
  Text,
  Card,
  surface,
  spacing,
  backgroundGradients,
} from "../../src/design";
import { useThemeColors } from "../../src/ui/theme";

// Home components
import { FriendsDropdown, HomeHangoutRoom } from "../../src/ui/components/Home";

// Social feed (secondary content)
import type { EmoteId, WorkoutPost } from "../../src/lib/socialModel";
import { toggleReaction, useFeedAll, useMyReaction } from "../../src/lib/stores/socialStore";
import { timeAgo } from "../../src/lib/units";

const MY_USER_ID = "u_demo_me"; // v1 placeholder (later: auth user id)

function emoteLabel(e: EmoteId): string {
  if (e === "like") return "\u{1F44D}";
  if (e === "fire") return "\u{1F525}";
  if (e === "skull") return "\u{1F480}";
  if (e === "crown") return "\u{1F451}";
  if (e === "bolt") return "\u26A1";
  return "\u{1F44F}";
}

function compactNum(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(1).replace(".0", "")}k`;
  return `${(n / 1000000).toFixed(1).replace(".0", "")}m`;
}

// Compact post card for social feed section
function CompactPostCard({ post }: { post: WorkoutPost }) {
  const c = useThemeColors();
  const my = useMyReaction(post.id, MY_USER_ID);

  return (
    <Pressable style={[styles.compactPost, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.compactPostHeader}>
        <Text variant="label" color="primary">
          {post.authorDisplayName}
        </Text>
        <Text variant="caption" color="muted">
          {timeAgo(post.createdAtMs)}
        </Text>
      </View>
      {!!post.caption && (
        <Text variant="bodySmall" color="secondary" numberOfLines={2}>
          {post.caption}
        </Text>
      )}
      <View style={styles.compactPostMeta}>
        <View style={styles.compactPostStats}>
          <Text variant="caption" color="muted">
            {"\u2764\uFE0F"} {compactNum(post.likeCount)}
          </Text>
          <Text variant="caption" color="muted">
            {"\u{1F4AC}"} {compactNum(post.commentCount)}
          </Text>
        </View>
        <Pressable
          onPress={() => toggleReaction(post.id, MY_USER_ID, "like")}
          style={[
            styles.quickReactButton,
            my?.emote === "like" && { backgroundColor: c.primary + "20" },
          ]}
        >
          <Text variant="caption">{emoteLabel("like")}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

// Quick action card
function QuickActionCard({
  icon,
  title,
  subtitle,
  onPress,
  accent,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  accent?: string;
}) {
  const c = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.quickAction, { backgroundColor: c.card, borderColor: c.border }]}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: (accent || c.primary) + "20" }]}>
        <Ionicons name={icon as any} size={22} color={accent || c.primary} />
      </View>
      <View style={styles.quickActionText}>
        <Text variant="label" color="primary">{title}</Text>
        <Text variant="caption" color="muted">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={c.muted} />
    </Pressable>
  );
}

export default function HomeTab() {
  const router = useRouter();
  const posts = useFeedAll();
  const c = useThemeColors();
  const insets = useSafeAreaInsets();

  const handleSelectFriend = (friendId: string) => {
    // Navigate to friend's room or profile
    router.push(`/hangout?friend=${friendId}` as any);
  };

  return (
    <TabErrorBoundary screenName="Home">
      <View style={styles.container}>
        {/* Screen background with gradient */}
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
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Friends Dropdown */}
          <FriendsDropdown onSelectFriend={handleSelectFriend} />

          {/* Your Hangout Room - Main Feature */}
          <View style={styles.roomSection}>
            <View style={styles.sectionHeader}>
              <Text variant="label" color="primary">Your Room</Text>
              <Pressable onPress={() => router.push("/hangout")}>
                <Text variant="caption" color="primary" style={{ opacity: 0.8 }}>
                  Full View
                </Text>
              </Pressable>
            </View>
            <HomeHangoutRoom
              onCustomizeAvatar={() => router.push("/avatar")}
              onEditRoom={() => router.push("/hangout")}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text variant="label" color="primary" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <View style={styles.quickActionsGrid}>
              <QuickActionCard
                icon="barbell"
                title="Start Workout"
                subtitle="Begin training"
                onPress={() => router.push("/(tabs)/workout")}
                accent="#4ECDC4"
              />
              <QuickActionCard
                icon="calendar"
                title="Calendar"
                subtitle="View history"
                onPress={() => router.push("/calendar")}
                accent="#9B59B6"
              />
            </View>
          </View>

          {/* Recent Activity (Social Feed Preview) */}
          {posts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="label" color="primary">Recent Activity</Text>
                <Pressable onPress={() => router.push("/(tabs)/feed" as any)}>
                  <Text variant="caption" color="primary" style={{ opacity: 0.8 }}>
                    View All
                  </Text>
                </Pressable>
              </View>
              <View style={styles.recentPosts}>
                {posts.slice(0, 3).map((post) => (
                  <CompactPostCard key={post.id} post={post} />
                ))}
              </View>
            </View>
          )}

          {/* Empty state for social */}
          {posts.length === 0 && (
            <Card variant="default" size="md" style={styles.emptyState}>
              <Text variant="body" color="muted">
                No recent activity from friends. Start a workout to share your progress!
              </Text>
            </Card>
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
    gap: spacing.lg,
  },
  roomSection: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  quickActionsGrid: {
    gap: spacing.sm,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    flex: 1,
    gap: 2,
  },
  recentPosts: {
    gap: spacing.sm,
  },
  compactPost: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  compactPostHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compactPostMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compactPostStats: {
    flexDirection: "row",
    gap: spacing.md,
  },
  quickReactButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.lg,
  },
});
