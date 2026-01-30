// app/live-workout-together.tsx
// Live Workout Together main screen

import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Text, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { makeDesignSystem } from "../src/ui/designSystem";
import { useThemeColors } from "../src/ui/theme";
import { useUser } from "../src/lib/stores/authStore";
import { ProtectedRoute } from "../src/ui/components/ProtectedRoute";
import { LiveWorkoutTogether } from "../src/ui/components/LiveWorkoutTogether/LiveWorkoutTogether";
import { useLiveWorkoutStore } from "../src/lib/stores/liveWorkoutStore";

// Mock data for presence users - this would come from real-time backend in production
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

export default function LiveWorkoutTogetherScreen() {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");
  const router = useRouter();
  const params = useLocalSearchParams();

  const user = useUser();
  const { sets } = useLiveWorkoutStore();

  // State for Live Workout Together
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [activeReactions, setActiveReactions] = useState<{ reaction: string; userName: string }[]>([]);

  // Mock data - in production this would come from real-time presence service
  useEffect(() => {
    // Simulate some friends working out together
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

    // Simulate some reactions
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

    // Show animation for the reaction
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
        <View style={[styles.container, { backgroundColor: c.bg }]}>
          <Text style={{ color: c.text }}>Please sign in to use Live Workout Together.</Text>
        </View>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: c.text }]}>Live Workout Together</Text>
            <Text style={[styles.subtitle, { color: c.muted }]}>
              Work out with friends in real-time
            </Text>
          </View>

          {/* Live Workout Together Component */}
          <View style={styles.liveWorkoutContainer}>
            <LiveWorkoutTogether
              users={users}
              reactions={reactions}
              currentUserId={user.id}
              onAddReaction={handleAddReaction}
              activeReactions={activeReactions}
              onReactionAnimationComplete={handleReactionAnimationComplete}
            />
          </View>

          {/* Workout Stats */}
          <View style={[styles.statsContainer, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.statsTitle, { color: c.text }]}>Your Workout Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: ds.tone.accent }]}>{sets.length}</Text>
                <Text style={[styles.statLabel, { color: c.muted }]}>Sets</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: ds.tone.accent }]}>{users.length}</Text>
                <Text style={[styles.statLabel, { color: c.muted }]}>Friends</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: ds.tone.accent }]}>{reactions.length}</Text>
                <Text style={[styles.statLabel, { color: c.muted }]}>Reactions</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: ds.tone.accent }]}
              onPress={navigateToLiveWorkout}
            >
              <Text style={[styles.actionButtonText, { color: c.bg }]}>
                Start Workout Together
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, { backgroundColor: c.bg, borderColor: c.border }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.actionButtonText, { color: c.text }]}>
                Back to Workout
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  liveWorkoutContainer: {
    marginBottom: 24,
  },
  statsContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "900",
  },
});