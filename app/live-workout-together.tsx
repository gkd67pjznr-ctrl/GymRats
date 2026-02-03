// app/live-workout-together.tsx
// Workout with Friends - Train together in real-time

import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

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
  spacing,
  backgroundGradients,
} from "../src/design";
import { ScreenHeader } from "../src/ui/components/ScreenHeader";
import { useUser } from "../src/lib/stores/authStore";
import { ProtectedRoute } from "../src/ui/components/ProtectedRoute";
import { LiveWorkoutTogether } from "../src/ui/components/LiveWorkoutTogether/LiveWorkoutTogether";
import { useLiveWorkoutStore } from "../src/lib/stores/liveWorkoutStore";

// Types for presence users and reactions
export type PresenceUser = {
  id: string;
  name: string;
  avatarUrl?: string;
  isActive: boolean;
  currentExercise?: string;
  lastActivityTime?: number;
};

export type Reaction = {
  id: string;
  userId: string;
  userName: string;
  type: 'fire' | 'muscle' | 'heart' | 'clap' | 'rocket' | 'thumbsup';
  timestamp: number;
};

function getReactionEmoji(type: Reaction['type']): string {
  const emojiMap: Record<Reaction['type'], string> = {
    fire: '🔥',
    muscle: '💪',
    heart: '❤️',
    clap: '👏',
    rocket: '🚀',
    thumbsup: '👍',
  };
  return emojiMap[type];
}

export default function WorkoutWithFriendsScreen() {
  const router = useRouter();
  const user = useUser();
  const { sets } = useLiveWorkoutStore();

  // State for presence users and reactions
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [activeReactions, setActiveReactions] = useState<{ reaction: string; userName: string }[]>([]);

  // Mock data - in production this would come from real-time presence service
  useEffect(() => {
    const mockUsers: PresenceUser[] = [
      {
        id: "friend1",
        name: "Alex Johnson",
        avatarUrl: "https://i.pravatar.cc/150?img=1",
        isActive: true,
        currentExercise: "bench",
        lastActivityTime: Date.now() - 30000
      },
      {
        id: "friend2",
        name: "Taylor Smith",
        avatarUrl: "https://i.pravatar.cc/150?img=2",
        isActive: true,
        currentExercise: "squat",
        lastActivityTime: Date.now() - 60000
      },
      {
        id: "friend3",
        name: "Jordan Lee",
        avatarUrl: "https://i.pravatar.cc/150?img=3",
        isActive: true,
        currentExercise: "deadlift",
        lastActivityTime: Date.now() - 90000
      }
    ];

    setUsers(mockUsers);

    const mockReactions: Reaction[] = [
      {
        id: "1",
        userId: "friend1",
        userName: "Alex Johnson",
        type: "fire",
        timestamp: Date.now() - 10000
      },
      {
        id: "2",
        userId: "friend2",
        userName: "Taylor Smith",
        type: "muscle",
        timestamp: Date.now() - 5000
      }
    ];

    setReactions(mockReactions);
  }, []);

  const handleAddReaction = (type: Reaction['type']) => {
    if (!user) return;

    const newReaction: Reaction = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.displayName || "You",
      type,
      timestamp: Date.now()
    };

    setReactions([...reactions, newReaction]);

    setActiveReactions([...
      activeReactions,
      { reaction: getReactionEmoji(type), userName: user.displayName || "You" }
    ]);
  };

  const handleReactionAnimationComplete = (index: number) => {
    setActiveReactions(activeReactions.filter((_, i) => i !== index));
  };

  const navigateToLiveWorkout = () => {
    router.push("/live-workout");
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <View style={styles.container}>
          <LinearGradient
            colors={backgroundGradients.screenDepth.colors as unknown as readonly [string, string, ...string[]]}
            start={backgroundGradients.screenDepth.start}
            end={backgroundGradients.screenDepth.end}
            locations={backgroundGradients.screenDepth.locations as unknown as readonly [number, number, ...number[]] | undefined}
            style={StyleSheet.absoluteFill}
          />
          <ScreenHeader title="Workout with Friends" />
          <View style={styles.centered}>
            <Text variant="body" color="muted">Please sign in to workout with friends.</Text>
          </View>
        </View>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        {/* Background gradient */}
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

        {/* Header with safe area */}
        <ScreenHeader title="Workout with Friends" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header section */}
          <View style={styles.header}>
            <Text variant="h2" color="primary">
              Train Together
            </Text>
            <Text variant="body" color="muted">
              Work out with friends in real-time. Cheer each other on!
            </Text>
          </View>

          {/* Live Workout Together Component */}
          <Card variant="elevated" size="md" style={styles.liveWorkoutCard}>
            <LiveWorkoutTogether
              users={users}
              reactions={reactions}
              currentUserId={user.id}
              onAddReaction={handleAddReaction}
              activeReactions={activeReactions}
              onReactionAnimationComplete={handleReactionAnimationComplete}
            />
          </Card>

          {/* Workout Stats */}
          <Card variant="default" size="md" style={styles.statsCard}>
            <Text variant="label" color="primary" bold style={styles.statsTitle}>
              Your Workout Stats
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="h2" style={{ color: colors.toxic.primary }}>
                  {sets.length}
                </Text>
                <Text variant="caption" color="muted">Sets</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="h2" style={{ color: colors.toxic.primary }}>
                  {users.length}
                </Text>
                <Text variant="caption" color="muted">Friends</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="h2" style={{ color: colors.toxic.primary }}>
                  {reactions.length}
                </Text>
                <Text variant="caption" color="muted">Reactions</Text>
              </View>
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Pressable
              onPress={navigateToLiveWorkout}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed
              ]}
            >
              <Text variant="label" style={styles.primaryButtonText}>
                Start Workout Together
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed
              ]}
            >
              <Text variant="label" color="primary">
                Back to Workout
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </ProtectedRoute>
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
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  liveWorkoutCard: {
    gap: spacing.md,
  },
  statsCard: {
    gap: spacing.md,
  },
  statsTitle: {
    marginBottom: spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  actionsContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: corners.button,
    backgroundColor: colors.toxic.primary,
    alignItems: "center",
  },
  primaryButtonText: {
    color: surface.base,
    fontWeight: "900",
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: corners.button,
    backgroundColor: surface.raised,
    borderWidth: 1,
    borderColor: border.subtle,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
