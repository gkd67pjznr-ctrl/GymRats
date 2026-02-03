// app/workout-replay.tsx
// Main workout replay screen

import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import { makeDesignSystem } from '../src/ui/designSystem';
import { useThemeColors } from '../src/ui/theme';
import { useWorkoutReplay } from '../src/lib/hooks/useWorkoutReplay';
import { getWorkoutSessionById } from '../src/lib/stores/workoutStore';
import type { WorkoutReplay } from '../src/lib/workoutReplay/replayTypes';
import { StatCard } from '../src/ui/components/WorkoutReplay/StatCard';
import { PRHighlight } from '../src/ui/components/WorkoutReplay/PRHighlight';
import { RankChangeDisplay } from '../src/ui/components/WorkoutReplay/RankChangeDisplay';
import { BuddySignOff } from '../src/ui/components/WorkoutReplay/BuddySignOff';
import { ReplayControls } from '../src/ui/components/WorkoutReplay/ReplayControls';
import { ScreenHeader } from '../src/ui/components/ScreenHeader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WorkoutReplayScreen() {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { prepareReplay, formatReplayDuration } = useWorkoutReplay();

  const [replay, setReplay] = useState<WorkoutReplay | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const confettiRef = useRef<any>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Load workout data
  useEffect(() => {
    if (!sessionId) {
      router.replace('/');
      return;
    }

    const session = getWorkoutSessionById(sessionId);
    if (!session) {
      router.replace('/');
      return;
    }

    const replayData = prepareReplay(session);
    setReplay(replayData);

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-play confetti for PRs
    if (replayData.prsAchieved.length > 0 && confettiRef.current) {
      setTimeout(() => {
        confettiRef.current?.start();
      }, 1000);
    }
  }, [sessionId]);

  // Handle skip/replay
  const handleSkip = () => {
    router.replace('/');
  };

  const handleShare = () => {
    // TODO: Implement sharing to feed
    router.replace('/');
  };

  if (!replay) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <Text style={{ color: c.text }}>Loading replay...</Text>
      </View>
    );
  }

  const hasPRs = replay.prsAchieved.length > 0;
  const hasRankChanges = replay.rankChanges.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <ScreenHeader title="Workout Replay" />
      {/* Confetti for PR celebrations */}
      {hasPRs && (
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 3 }}
          fallSpeed={3000}
        />
      )}

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: c.muted }]}>
            {new Date(replay.endedAtMs).toLocaleDateString()}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Duration"
            value={formatReplayDuration(replay.durationMs)}
            color={ds.tone.accent}
          />
          <StatCard
            label="Sets"
            value={replay.setCount.toString()}
            color={ds.tone.gold}
          />
          <StatCard
            label="Volume"
            value={`${Math.round(replay.totalVolume / 1000)}k`}
            color={ds.tone.platinum}
          />
        </View>

        {/* PR Highlights */}
        {hasPRs && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Personal Records</Text>
            {replay.prsAchieved.map((pr, index) => (
              <PRHighlight key={index} pr={pr} exerciseName={replay.exercises.find(e => e.exerciseId === pr.exerciseId)?.exerciseName || pr.exerciseId} />
            ))}
          </View>
        )}

        {/* Rank Changes */}
        {hasRankChanges && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Rank Progress</Text>
            {replay.rankChanges.map((rankChange, index) => (
              <RankChangeDisplay key={index} rankChange={rankChange} />
            ))}
          </View>
        )}

        {/* Buddy Sign Off */}
        <View style={styles.section}>
          <BuddySignOff
            message={replay.buddySignOff}
            buddyName={replay.buddyName}
            buddyTier={replay.buddyTier}
          />
        </View>

        {/* Controls */}
        <ReplayControls
          onShare={handleShare}
          onSkip={handleSkip}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
});