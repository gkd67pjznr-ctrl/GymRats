// app/live-workout-with-friends.tsx
// Live workout screen with integrated Live Workout Together functionality

import { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View, Text } from "react-native";
import { useRouter } from "expo-router";

import { makeDesignSystem } from "../src/ui/designSystem";
import { FR } from "../src/ui/forgerankStyle";
import { useThemeColors } from "../src/ui/theme";

import { getSettings } from "../src/lib/stores";
import { useCurrentPlan } from "../src/lib/workoutPlanStore";

// Components
import { ExerciseBlocksCard } from "../src/ui/components/LiveWorkout/ExerciseBlocksCard";
import { ExercisePicker } from "../src/ui/components/LiveWorkout/ExercisePicker";
import { InstantCueToast } from "../src/ui/components/LiveWorkout/InstantCueToast";
import { BuddyMessageToast } from "../src/ui/components/LiveWorkout/BuddyMessageToast";
import { QuickAddSetCard } from "../src/ui/components/LiveWorkout/QuickAddSetCard";
import { RestTimerOverlay } from "../src/ui/components/RestTimerOverlay";
import { ValidationToast } from "../src/ui/components/LiveWorkout/ValidationToast";
import { WorkoutTimerBar } from "../src/ui/components/LiveWorkout/WorkoutTimerBar";
import { WorkoutTimerDetails } from "../src/ui/components/LiveWorkout/WorkoutTimerDetails";

// New extracted components
import { WorkoutHeader } from "../src/ui/components/LiveWorkout/WorkoutHeader";
import { WorkoutControls } from "../src/ui/components/LiveWorkout/WorkoutControls";
import { SelectedExerciseCard } from "../src/ui/components/LiveWorkout/SelectedExerciseCard";
import { WorkoutActions } from "../src/ui/components/LiveWorkout/WorkoutActions";
import { RecapCues } from "../src/ui/components/LiveWorkout/RecapCues";
import { PRCelebration } from "../src/ui/components/LiveWorkout/PRCelebration";

// Gamification components
import { LevelUpModal } from "../src/ui/components/Gamification";
import { usePendingLevelUp } from "../src/lib/stores/gamificationStore";
import { useGamificationStore } from "../src/lib/stores/gamificationStore";

// Live Workout Together components
import { LiveWorkoutTogether } from "../src/ui/components/LiveWorkoutTogether/LiveWorkoutTogether";

// Hooks
import { useValidationToast } from "../src/lib/hooks/useValidationToast";
import { useExercisePickerState } from "../src/lib/hooks/useExercisePickerState";
import { useLiveWorkoutSession } from "../src/lib/hooks/useLiveWorkoutSession";
import { useWorkoutOrchestrator } from "../src/lib/hooks/useWorkoutOrchestrator";
import { useWorkoutTimer } from "../src/lib/hooks/useWorkoutTimer";

// Stores
import {
  ensureCurrentSession,
  updateCurrentSession,
  useCurrentSession,
} from "../src/lib/stores";
import { getSettings as getSettingsV2 } from "../src/lib/stores/settingsStore";
import { useUser } from "../src/lib/stores/authStore";

// Utils
import { randomHighlightDurationMs } from "../src/lib/perSetCue";
import { selectCelebration } from "../src/lib/celebration";
import type { SelectedCelebration } from "../src/lib/celebration";

// Notifications
import {
  initializeNotificationService,
  setupNotificationResponseListener,
  requestNotificationPermission,
} from "../src/lib/notifications/notificationService";

// Live Workout Together types
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

// Constants
const DEFAULT_REST_SECONDS = 90;
const DEFAULT_TARGET_REPS_MIN = 8;
const DEFAULT_TARGET_REPS_MAX = 12;
const SCROLL_BOTTOM_PADDING = 140;
const SPEECH_RATE = 1.05;
const SPEECH_PITCH = 1.1;

// Optional runtime requires (no-op if not installed)
let Haptics: any = null;
try {
  Haptics = require("expo-haptics");
} catch {
  Haptics = null;
}

let Speech: any = null;
try {
  Speech = require("expo-speech");
} catch {
  Speech = null;
}

function onRestTimerDoneFeedback() {
  const s = getSettings();

  if (s.hapticsEnabled && Haptics) {
    Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success).catch?.(() => {});
  }

  if (s.soundsEnabled && Speech) {
    Speech.stop?.();
    Speech.speak?.("Rest over.", { rate: SPEECH_RATE, pitch: SPEECH_PITCH });
  }
}

function hapticLight() {
  const s = getSettings();
  if (!s.hapticsEnabled || !Haptics) return;
  Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light).catch?.(() => {});
}

function hapticPR() {
  const s = getSettings();
  if (!s.hapticsEnabled || !Haptics) return;
  Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success).catch?.(() => {});
}

export default function LiveWorkoutWithFriends() {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");
  const router = useRouter();

  // Unified spacing/radii via FR
  const PAD = FR.space.x4;
  const GAP = FR.space.x3;

  // Plan data
  const plan = useCurrentPlan();

  // Persisted session state
  const persisted = useCurrentSession();
  const initializedRef = useRef(false);

  // Focus mode and rest timer state
  const [focusMode, setFocusMode] = useState(false);
  const [restVisible, setRestVisible] = useState(false);
  const [showTimerDetails, setShowTimerDetails] = useState(false);
  const notificationPermissionRequestedRef = useRef(false);

  // PR celebration state
  const [celebration, setCelebration] = useState<SelectedCelebration | null>(null);

  // Gamification state for level up modal
  const pendingLevelUp = usePendingLevelUp();
  const dismissLevelUp = useGamificationStore((s) => s.dismissLevelUp);

  // User data for Live Workout Together
  const user = useUser();

  // Exercise picker state - extracted to custom hook
  const pickerState = useExercisePickerState({
    plan,
    persisted,
  });

  // Validation toast for error/success feedback
  const { toast, showError, showSuccess, dismiss } = useValidationToast();

  // Session with validation callbacks
  const session = useLiveWorkoutSession(undefined, {
    onError: showError,
    onSuccess: showSuccess,
  });

  // Workout orchestrator with haptic/sound callbacks
  const orchestrator = useWorkoutOrchestrator({
    plan: plan ?? null,
    unit: "lb" as const,
    onHaptic: (type) => {
      if (type === "pr") hapticPR();
      else hapticLight();
    },
    onSound: (type) => {
      // Sound logic can be added here if needed
    },
    onWorkoutFinished: (sessionId) => {
      // Check replay auto-play setting
      const settings = getSettings();
      if (settings.replayAutoPlay) {
        // Navigate to workout replay screen
        router.push(`/workout-replay?sessionId=${sessionId}` as any);
      } else {
        // Navigate to workout summary screen
        router.push(`/workout-summary?sessionId=${sessionId}` as any);
      }
    },
    onPRCelebration: (params) => {
      // Select and show celebration for PR
      const selected = selectCelebration(params);
      if (selected) {
        setCelebration(selected);
      }
    },
  });

  // Build target sets map for exercise blocks
  const targetSetsByExerciseId = useMemo(
    () =>
      plan?.exercises.reduce<Record<string, number>>((acc, ex) => {
        acc[ex.exerciseId] = ex.targetSets;
        return acc;
      }, {}) ?? {},
    [plan]
  );

  // Workout timer
  const timer = useWorkoutTimer({
    exercises: plan?.exercises ? plan.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      targetSets: ex.targetSets,
      targetRepsMin: ex.targetRepsMin ?? DEFAULT_TARGET_REPS_MIN,
      targetRepsMax: ex.targetRepsMax ?? DEFAULT_TARGET_REPS_MAX,
      restSeconds: DEFAULT_REST_SECONDS,
    })) : [],
    loggedSets: session.sets,
    startedAtMs: persisted?.startedAtMs,
  });

  // Live Workout Together state
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [activeReactions, setActiveReactions] = useState<{ reaction: string; userName: string }[]>([]);

  // Mock data for Live Workout Together - in production this would come from real-time presence service
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

  // Initialize session on mount
  useEffect(() => {
    if (initializedRef.current) return;
    if (persisted) {
      initializedRef.current = true;
      return;
    }

    const first = pickerState.currentPlannedExerciseId ?? "bench";
    ensureCurrentSession({
      selectedExerciseId: first,
      exerciseBlocks: pickerState.planMode ? pickerState.plannedExerciseIds.slice() : [first],
      done: pickerState.planMode ? new Set() : new Set([first]),
    });
    initializedRef.current = true;

    // Initialize notification service
    initializeNotificationService().catch(console.error);

    // Set up notification response listener
    const responseListener = setupNotificationResponseListener((response) => {
      // Handle notification taps
      const data = response.notification.request.content.data;
      if (data?.screen === 'live-workout') {
        // Bring app to foreground and focus on workout
        // This is handled automatically by the OS when tapping notification
      }
    });

    return () => {
      // Clean up listener when component unmounts
      if (responseListener && typeof responseListener.remove === 'function') {
        responseListener.remove();
      }
    };
  }, [persisted, pickerState]);

  // Persist UI state (selected exercise, exercise blocks)
  useEffect(() => {
    updateCurrentSession((s: any) => ({
      ...s,
      selectedExerciseId: pickerState.selectedExerciseId,
      exerciseBlocks: pickerState.exerciseBlocks,
    }));
  }, [pickerState.selectedExerciseId, pickerState.exerciseBlocks]);

  // Add set to the workout
  function addSetInternal(exerciseId: string, source: "quick" | "block") {
    const result = session.addSet(exerciseId);
    orchestrator.addSetForExercise(exerciseId, result.weightLb, result.reps);

    if (source === "quick") {
      pickerState.setSelectedExerciseId(exerciseId);
    }

    // Request notification permission on first rest timer use (contextual permission request)
    if (!notificationPermissionRequestedRef.current) {
      requestNotificationPermission().then((granted) => {
        if (granted) {
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied');
        }
      });
      notificationPermissionRequestedRef.current = true;
    }

    setRestVisible(true);
  }

  const addSet = () => addSetInternal(pickerState.selectedExerciseId, "quick");
  const addSetForExercise = (exerciseId: string) => addSetInternal(exerciseId, "block");

  const handleSaveAsRoutine = () => {
    orchestrator.saveAsRoutine(pickerState.exerciseBlocks, session.sets);
  };

  const handleReset = () => {
    initializedRef.current = false;
    orchestrator.reset(pickerState.plannedExerciseIds);
    setRestVisible(false);
    setFocusMode(false);
  };

  const allowedExerciseIds = pickerState.planMode ? pickerState.plannedExerciseIds : undefined;

  if (pickerState.pickerMode) {
    return (
      <ExercisePicker
        visible
        allowedExerciseIds={allowedExerciseIds}
        selectedExerciseId={pickerState.selectedExerciseId}
        onSelect={pickerState.handleExerciseSelect}
        onBack={pickerState.closePicker}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <InstantCueToast
        cue={orchestrator.instantCue}
        onClear={orchestrator.clearInstantCue}
        randomHoldMs={randomHighlightDurationMs}
      />

      <BuddyMessageToast
        message={orchestrator.buddyMessage}
        onClear={orchestrator.clearBuddyMessage}
        randomHoldMs={randomHighlightDurationMs}
      />

      <ValidationToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={dismiss}
      />

      <RestTimerOverlay
        visible={restVisible}
        initialSeconds={DEFAULT_REST_SECONDS}
        onClose={() => setRestVisible(false)}
        onDone={onRestTimerDoneFeedback}
        workoutId={persisted?.session?.id}
      />

      <PRCelebration
        celebration={celebration}
        onDismiss={() => setCelebration(null)}
        onShare={() => {
          // TODO: Implement share functionality
          setCelebration(null);
        }}
      />

      <LevelUpModal
        visible={pendingLevelUp !== null}
        celebration={pendingLevelUp}
        onDismiss={dismissLevelUp}
      />

      <ScrollView
        contentContainerStyle={{ padding: PAD, gap: GAP, paddingBottom: SCROLL_BOTTOM_PADDING }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Timer Bar */}
        <WorkoutTimerBar
          timer={timer}
          onPressDetails={() => setShowTimerDetails(true)}
        />

        {/* Timer Details Modal */}
        <WorkoutTimerDetails
          visible={showTimerDetails}
          timer={timer}
          onClose={() => setShowTimerDetails(false)}
        />

        {/* Header Card */}
        <WorkoutHeader
          plan={plan}
          sets={session.sets}
          focusMode={focusMode}
        />

        {/* Live Workout Together Component */}
        {user && (
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>
              Working Out Together
            </Text>
            <LiveWorkoutTogether
              users={users}
              reactions={reactions}
              currentUserId={user.id}
              onAddReaction={handleAddReaction}
              activeReactions={activeReactions}
              onReactionAnimationComplete={handleReactionAnimationComplete}
            />
          </View>
        )}

        {/* Top Controls */}
        <WorkoutControls
          planMode={pickerState.planMode}
          focusMode={focusMode}
          onAddExercise={pickerState.openPickerToAdd}
          onToggleFocus={() => setFocusMode(v => !v)}
          onChangeSelected={pickerState.openPickerToChange}
        />

        {/* Exercise Blocks */}
        <ExerciseBlocksCard
          exerciseIds={pickerState.exerciseBlocks}
          sets={session.sets}
          targetSetsByExerciseId={pickerState.planMode ? targetSetsByExerciseId : undefined}
          focusedExerciseId={pickerState.selectedExerciseId}
          focusMode={focusMode}
          onAddSetForExercise={addSetForExercise}
          onJumpToExercise={(id: string) => pickerState.setSelectedExerciseId(id)}
          isDone={session.isDone}
          toggleDone={session.toggleDone}
          setWeightForSet={session.setWeightForSet}
          setRepsForSet={session.setRepsForSet}
          kgToLb={session.kgToLb}
          estimateE1RMLb={session.estimateE1RMLb}
          getLastSetForExercise={session.getLastSetForExercise}
          copyFromLastSet={session.copyFromLastSet}
        />

        {/* Quick Add Section - free workout mode only */}
        {!pickerState.planMode && (
          <>
            <SelectedExerciseCard
              selectedExerciseId={pickerState.selectedExerciseId}
              onChangeSelected={pickerState.openPickerToChange}
            />

            <QuickAddSetCard
              weightLb={session.weightLb}
              reps={session.reps}
              weightLbText={session.weightLbText}
              repsText={session.repsText}
              onWeightText={session.onWeightText}
              onRepsText={session.onRepsText}
              onWeightCommit={session.onWeightCommit}
              onRepsCommit={session.onRepsCommit}
              onDecWeight={session.decWeight}
              onIncWeight={session.incWeight}
              onDecReps={session.decReps}
              onIncReps={session.incReps}
              onAddSet={addSet}
              onWeightStepChange={session.onWeightStepChange}
            />
          </>
        )}

        {/* Bottom Actions */}
        <WorkoutActions
          setsCount={session.sets.length}
          onFinishWorkout={orchestrator.finishWorkout}
          onSaveRoutine={handleSaveAsRoutine}
          onReset={handleReset}
        />

        {/* Recap Cues */}
        <RecapCues cues={orchestrator.recapCues} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
});