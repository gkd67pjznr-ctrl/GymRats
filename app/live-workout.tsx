// app/live-workout.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "../src/ui/theme";

import { getSettings } from "../src/lib/stores";
import { useCurrentPlan, setCurrentPlan } from "../src/lib/workoutPlanStore";
import type { WorkoutPlan } from "../src/lib/workoutPlanModel";

// Components
import { ExercisePicker } from "../src/ui/components/LiveWorkout/ExercisePicker";
import { InstantCueToast } from "../src/ui/components/LiveWorkout/InstantCueToast";
import { BuddyMessageToast } from "../src/ui/components/LiveWorkout/BuddyMessageToast";
import { RestTimerOverlay } from "../src/ui/components/RestTimerOverlay";
import { ValidationToast } from "../src/ui/components/LiveWorkout/ValidationToast";
import { WorkoutTimerDetails } from "../src/ui/components/LiveWorkout/WorkoutTimerDetails";

// Hevy-style components
import { ExerciseCard } from "../src/ui/components/LiveWorkout/ExerciseCard";
import { WorkoutTopBar } from "../src/ui/components/LiveWorkout/WorkoutTopBar";
import { WorkoutControls } from "../src/ui/components/LiveWorkout/WorkoutControls";
import { WorkoutActions } from "../src/ui/components/LiveWorkout/WorkoutActions";
import { PRCelebration } from "../src/ui/components/LiveWorkout/PRCelebration";
import { TutorialOverlay } from "../src/ui/components/LiveWorkout/TutorialOverlay";

// Legacy components (kept for backward compatibility)
// import { ExerciseBlocksCard } from "../src/ui/components/LiveWorkout/ExerciseBlocksCard";
// import { QuickAddSetCard } from "../src/ui/components/LiveWorkout/QuickAddSetCard";
// import { SelectedExerciseCard } from "../src/ui/components/LiveWorkout/SelectedExerciseCard";
// import { WorkoutHeader } from "../src/ui/components/LiveWorkout/WorkoutHeader";
// import { WorkoutTimerBar } from "../src/ui/components/LiveWorkout/WorkoutTimerBar";

// Live Workout Together components
import { LiveWorkoutTogether } from "../src/ui/components/LiveWorkoutTogether/LiveWorkoutTogether";
// Gamification components
import { LevelUpModal } from "../src/ui/components/Gamification";
import { usePendingLevelUp, useGamificationStore } from "../src/lib/stores/gamificationStore";

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
  useUser,
} from "../src/lib/stores";
import { getSettings as getSettingsV2 } from "../src/lib/stores/settingsStore";
import { useBuddyStore } from "../src/lib/stores/buddyStore";
import { useOnboardingStore } from "../src/lib/stores/onboardingStore";
import { evaluateBehaviorTriggers } from "../src/lib/buddyEngine";

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

export default function LiveWorkout() {
  const c = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Plan data
  const plan = useCurrentPlan();

  // Persisted session state
  const persisted = useCurrentSession();
  const initializedRef = useRef(false);

  // Focus mode and rest timer state
  const [focusMode, setFocusMode] = useState(false);
  const [liveWorkoutTogether, setLiveWorkoutTogether] = useState(false);
  const [restVisible, setRestVisible] = useState(false);
  const [showTimerDetails, setShowTimerDetails] = useState(false);
  const notificationPermissionRequestedRef = useRef(false);
  const [restStartTime, setRestStartTime] = useState<number | null>(null);


  const onRestTimerDone = () => {
    // Record rest duration in buddy store
    if (restStartTime) {
      const durationMs = Date.now() - restStartTime;
      useBuddyStore.getState().recordRest(durationMs);
      setRestStartTime(null);
    }
    // Call original feedback function
    onRestTimerDoneFeedback();
  };


  // PR celebration state
  const [celebration, setCelebration] = useState<SelectedCelebration | null>(null);

  // Gamification state for level up modal
  const pendingLevelUp = usePendingLevelUp();
  const dismissLevelUp = useGamificationStore((s) => s.dismissLevelUp);

  // User data for Live Workout Together
  const user = useUser();

  // Live Workout Together state
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [activeReactions, setActiveReactions] = useState<{ reaction: string; userName: string }[]>([]);

  // Exercise picker state - extracted to custom hook
  const pickerState = useExercisePickerState({
    plan,
    persisted,
  });

  // Tutorial state
  const params = useLocalSearchParams<{ tutorial?: string }>();
  const isTutorialMode = params.tutorial === 'true';
  const { tutorialStep, tutorialCompleted, advanceTutorialStep, completeTutorial } = useOnboardingStore();
  const showTutorial = isTutorialMode && !tutorialCompleted;

  // Validation toast for error/success feedback
  const { toast, showError, showSuccess, dismiss } = useValidationToast();

  // Session with validation callbacks
  const session = useLiveWorkoutSession(undefined, {
    onError: showError,
    onSuccess: showSuccess,
  });
  const { syncQuickAddToExercise } = session;

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

  // Read plan from navigation params on mount (fix for race condition with Zustand persist)
  const localParams = useLocalSearchParams();
  useEffect(() => {
    const planDataParam = localParams.planData as string | undefined;
    if (planDataParam) {
      try {
        const planFromParams = JSON.parse(planDataParam) as WorkoutPlan;
        // Update Zustand store with plan from params
        setCurrentPlan(planFromParams);
        // Clear params to avoid re-applying
        router.setParams({ planData: undefined } as any);
      } catch (e) {
        console.error("Failed to parse planData from params:", e);
      }
    }
  }, [localParams.planData]);

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
    });

    // Start buddy workout session
    useBuddyStore.getState().startWorkoutSession();

    // Check for behavior pattern triggers (streak, return after absence)
    const gamificationProfile = useGamificationStore.getState().profile;
    const streakDays = gamificationProfile.currentStreak;
    const lastWorkoutDate = gamificationProfile.lastWorkoutDate;

    let absenceDays = 0;
    if (lastWorkoutDate) {
      const lastWorkout = new Date(lastWorkoutDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastWorkout.getTime());
      absenceDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Evaluate behavior pattern triggers
    const behaviorCue = evaluateBehaviorTriggers({
      restDurationMs: 0, // Not applicable at start
      isSkipping: false, // Not applicable at start
      streakDays,
      absenceDays,
      workoutDurationMs: 0 // Not applicable at start
    });

    if (behaviorCue) {
      // We would need to pass this to the orchestrator to display it
      // For now, let's just log it
      console.log("Behavior cue at start:", behaviorCue);
    }

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

  // Live Workout Together mock data setup
  useEffect(() => {
    if (liveWorkoutTogether) {
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
    } else {
      // Clear Live Workout Together state when disabled
      setUsers([]);
      setReactions([]);
    }
  }, [liveWorkoutTogether]);

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

  // Persist UI state (selected exercise, exercise blocks)
  useEffect(() => {
    updateCurrentSession((s: any) => ({
      ...s,
      selectedExerciseId: pickerState.selectedExerciseId,
      exerciseBlocks: pickerState.exerciseBlocks,
    }));
  }, [pickerState.selectedExerciseId, pickerState.exerciseBlocks]);

  // Sync sets and done state to persisted store so finishWorkout can read them
  useEffect(() => {
    updateCurrentSession((s: any) => ({
      ...s,
      sets: session.sets,
      doneBySetId: session.doneBySetId,
    }));
  }, [session.sets, session.doneBySetId]);

  // Auto-fill weight/reps from last workout when exercise changes
  useEffect(() => {
    if (pickerState.selectedExerciseId && syncQuickAddToExercise) {
      syncQuickAddToExercise(pickerState.selectedExerciseId);
    }
  }, [pickerState.selectedExerciseId, syncQuickAddToExercise]);

  // Add set row to the workout (no cue/rest timer - those fire on checkmark)
  function addSetInternal(exerciseId: string, source: "quick" | "block") {
    session.addSet(exerciseId);

    if (source === "quick") {
      pickerState.setSelectedExerciseId(exerciseId);
    }
  }

  // Handle checkmark press: trigger cue/PR detection + rest timer
  function handleToggleDone(setId: string) {
    const wasDone = session.isDone(setId);
    session.toggleDone(setId);

    // Only trigger cue + rest timer when marking as done (not when unchecking)
    if (!wasDone) {
      const set = session.sets.find(s => s.id === setId);
      if (set) {
        const weightLb = session.kgToLb(set.weightKg);
        orchestrator.addSetForExercise(set.exerciseId, weightLb, set.reps);
      }

      // Request notification permission on first rest timer use
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

      // Record rest start time and show rest timer
      setRestStartTime(Date.now());
      setRestVisible(true);
    }
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

  // Helper to get previous set for an exercise at a given index
  // Uses workout history if available
  const getPreviousSet = useMemo(() => {
    return (exerciseId: string, setIndex: number): { weightKg: number; reps: number } | null => {
      // First check current session's previous sets for this exercise
      const exerciseSets = session.sets.filter(s => s.exerciseId === exerciseId);
      if (setIndex > 0 && exerciseSets[setIndex - 1]) {
        return {
          weightKg: exerciseSets[setIndex - 1].weightKg,
          reps: exerciseSets[setIndex - 1].reps,
        };
      }
      // Fall back to last workout's set for this exercise
      const lastSet = session.getLastSetForExercise(exerciseId);
      if (lastSet) {
        return { weightKg: lastSet.weightKg, reps: lastSet.reps };
      }
      return null;
    };
  }, [session.sets, session.getLastSetForExercise]);

  // Filter exercises to show based on focus mode
  const visibleExerciseIds = useMemo(() => {
    if (!focusMode) return pickerState.exerciseBlocks;
    if (!pickerState.selectedExerciseId) return pickerState.exerciseBlocks;
    return pickerState.exerciseBlocks.filter((id) => id === pickerState.selectedExerciseId);
  }, [pickerState.exerciseBlocks, focusMode, pickerState.selectedExerciseId]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      {/* Overlays and Toasts */}
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
        onDone={onRestTimerDone}
        workoutId={persisted?.id}
      />

      <PRCelebration
        celebration={celebration}
        onDismiss={() => setCelebration(null)}
        onShare={() => {
          setCelebration(null);
        }}
      />

      <LevelUpModal
        visible={pendingLevelUp !== null}
        celebration={pendingLevelUp}
        onDismiss={dismissLevelUp}
      />

      {showTutorial && (
        <TutorialOverlay
          onComplete={() => console.log('Tutorial completed')}
          onSkip={() => console.log('Tutorial skipped')}
        />
      )}

      {/* Timer Details Modal */}
      <WorkoutTimerDetails
        visible={showTimerDetails}
        timer={timer}
        onClose={() => setShowTimerDetails(false)}
      />

      {/* Fixed Top Bar - Hevy style */}
      <WorkoutTopBar
        elapsedDisplay={timer.elapsedDisplay}
        isRestTimerActive={restVisible}
        onBack={() => router.back()}
        onFinish={orchestrator.finishWorkout}
        onRestTimer={() => setRestVisible(true)}
      />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: 12,
          paddingHorizontal: 16,
          paddingBottom: SCROLL_BOTTOM_PADDING + insets.bottom,
          gap: 12,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Controls: Add Exercise + secondary */}
        <WorkoutControls
          planMode={pickerState.planMode}
          focusMode={focusMode}
          onAddExercise={pickerState.openPickerToAdd}
          onToggleFocus={() => setFocusMode(v => !v)}
          onChangeSelected={pickerState.openPickerToChange}
        />

        {/* Live Workout Together Component */}
        {liveWorkoutTogether && user && (
          <View>
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

        {/* Exercise Cards */}
        {visibleExerciseIds.map((exerciseId) => {
          const exerciseSets = session.sets.filter(s => s.exerciseId === exerciseId);
          const targetSets = targetSetsByExerciseId[exerciseId];

          return (
            <ExerciseCard
              key={exerciseId}
              exerciseId={exerciseId}
              sets={exerciseSets}
              targetSets={targetSets}
              getPreviousSet={getPreviousSet}
              onAddSet={() => addSetForExercise(exerciseId)}
              onDeleteSet={session.deleteSet}
              onToggleDone={handleToggleDone}
              onWeightChange={session.setWeightForSet}
              onRepsChange={session.setRepsForSet}
              isDone={session.isDone}
              kgToLb={session.kgToLb}
              onExerciseTap={() => pickerState.openPickerToChange()}
            />
          );
        })}

        {/* Empty state */}
        {visibleExerciseIds.length === 0 && (
          <Pressable
            onPress={pickerState.openPickerToAdd}
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderStyle: "dashed",
              borderRadius: 12,
              paddingVertical: 40,
              paddingHorizontal: 24,
              backgroundColor: c.card,
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: c.text }}>
              No exercises yet
            </Text>
            <Text style={{ fontSize: 14, color: c.primary, fontWeight: "600" }}>
              Tap to add your first exercise
            </Text>
          </Pressable>
        )}

        {/* Bottom Actions */}
        <WorkoutActions
          setsCount={session.sets.length}
          onFinishWorkout={orchestrator.finishWorkout}
          onSaveRoutine={handleSaveAsRoutine}
          onReset={handleReset}
        />
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
