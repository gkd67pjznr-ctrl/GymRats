// src/ui/components/WorkoutDrawer/DrawerContent.tsx
// Main content area of the workout drawer with full workout logging UI

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeColors } from '@/src/ui/theme';
import {
  useWorkoutDrawerStore,
  useRestTimer,
  usePendingCue,
  useDrawerPosition,
} from '@/src/lib/stores/workoutDrawerStore';
import {
  useCurrentSession,
  updateCurrentSession,
  clearCurrentSession,
} from '@/src/lib/stores/currentSessionStore';
import { EXERCISES_V1 } from '@/src/data/exercises';
import { kgToLb, lbToKg } from '@/src/lib/units';
import { uid } from '@/src/lib/uid';
import { getSettings } from '@/src/lib/stores/settingsStore';
import {
  detectCueForWorkingSet,
  makeEmptyExerciseState,
} from '@/src/lib/perSetCue';
import type { LoggedSet } from '@/src/lib/loggerTypes';
import type { ExerciseSessionState } from '@/src/lib/perSetCueTypes';
import {
  shouldDetectPRsForExercise,
  getBaselineStateForExercise,
  rebuildPRsFromHistory,
} from '@/src/lib/stores/prStore';
import { useWorkoutStore } from '@/src/lib/stores/workoutStore';
import type { WorkoutSession, WorkoutSet } from '@/src/lib/workoutModel';

// Components
import { ExercisePicker } from '@/src/ui/components/LiveWorkout/ExercisePicker';
import { ExerciseCard } from '@/src/ui/components/LiveWorkout/ExerciseCard';
import { RestTimerOverlay } from '@/src/ui/components/RestTimerOverlay';
import { CuePresenter } from '@/src/ui/components/CuePresenter';
import type { RichCue, PRType } from '@/src/lib/cues/cueTypes';
import { computeIntensity } from '@/src/lib/cues/cueTypes';

// Helper to get exercise name
function getExerciseName(exerciseId: string): string {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

// Helper to format duration
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// Default rest timer seconds
const DEFAULT_REST_SECONDS = 90;

export function DrawerContent() {
  const c = useThemeColors();
  const {
    collapseDrawer,
    endWorkout,
    startRestTimer,
    clearRestTimer,
    setPendingCue,
    clearPendingCue,
  } = useWorkoutDrawerStore();
  const session = useCurrentSession();
  const scrollRef = useRef<ScrollView>(null);
  const drawerPosition = useDrawerPosition();

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Rest timer state from store (persists across drawer collapse/expand)
  const restTimer = useRestTimer();
  const [restTimerVisible, setRestTimerVisible] = useState(false);

  // PR cue from store
  const pendingCue = usePendingCue();

  // Track done state locally (synced with session)
  const doneBySetId = session?.doneBySetId ?? {};

  // Get user settings for rest timer
  const settings = getSettings();

  // Show rest timer overlay only when drawer is expanded
  useEffect(() => {
    setRestTimerVisible(drawerPosition === 'expanded' && restTimer.isActive);
  }, [drawerPosition, restTimer.isActive]);

  // Update timer every second
  useEffect(() => {
    if (!session?.startedAtMs) return;

    const interval = setInterval(() => {
      setElapsedMs(Date.now() - session.startedAtMs);
    }, 1000);

    setElapsedMs(Date.now() - session.startedAtMs);

    return () => clearInterval(interval);
  }, [session?.startedAtMs]);

  // Get sets for a specific exercise
  const getSetsForExercise = useCallback(
    (exerciseId: string): LoggedSet[] => {
      return session?.sets?.filter((s) => s.exerciseId === exerciseId) ?? [];
    },
    [session?.sets]
  );

  // Get previous set for an exercise (from workout history)
  const getPreviousSet = useCallback(
    (exerciseId: string, setIndex: number): { weightKg: number; reps: number } | null => {
      // For now, return the previous set in current session if exists
      const exerciseSets = getSetsForExercise(exerciseId);
      if (setIndex > 0 && exerciseSets[setIndex - 1]) {
        return {
          weightKg: exerciseSets[setIndex - 1].weightKg,
          reps: exerciseSets[setIndex - 1].reps,
        };
      }
      return null;
    },
    [getSetsForExercise]
  );

  // Add a new set for an exercise
  const handleAddSet = useCallback(
    (exerciseId: string) => {
      if (!session) return;

      // Get last set for defaults
      const exerciseSets = getSetsForExercise(exerciseId);
      const lastSet = exerciseSets[exerciseSets.length - 1];

      const newSet: LoggedSet = {
        id: uid(),
        exerciseId,
        setType: 'working',
        weightKg: lastSet?.weightKg ?? lbToKg(135), // Default 135 lb
        reps: lastSet?.reps ?? 8, // Default 8 reps
        timestampMs: Date.now(),
      };

      updateCurrentSession((s) => ({
        ...s,
        sets: [...s.sets, newSet],
      }));
    },
    [session, getSetsForExercise]
  );

  // Delete a set
  const handleDeleteSet = useCallback((setId: string) => {
    updateCurrentSession((s) => ({
      ...s,
      sets: s.sets.filter((set) => set.id !== setId),
      doneBySetId: (() => {
        const next = { ...s.doneBySetId };
        delete next[setId];
        return next;
      })(),
    }));
  }, []);

  // Toggle set done state with rest timer
  const handleToggleDone = useCallback((setId: string) => {
    const currentDone = doneBySetId[setId];
    const isMarkingDone = !currentDone;

    updateCurrentSession((s) => ({
      ...s,
      doneBySetId: {
        ...s.doneBySetId,
        [setId]: !s.doneBySetId[setId],
      },
    }));

    // When marking a set as done
    if (isMarkingDone && session) {
      const set = session.sets.find((s) => s.id === setId);
      if (set) {
        // Haptic feedback
        if (settings.hapticsEnabled && Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        }

        // Start rest timer via store (persists across drawer collapse)
        const restSeconds = settings.defaultRestSeconds ?? DEFAULT_REST_SECONDS;
        startRestTimer(restSeconds);

        // PR detection - only for exercises with prior history or user-entered baseline
        if (shouldDetectPRsForExercise(set.exerciseId)) {
          const exerciseName = getExerciseName(set.exerciseId);
          const unit = settings.unitSystem ?? 'lb';

          // Get baseline from PR store, then overlay session state for within-session tracking
          const baselineState = getBaselineStateForExercise(set.exerciseId);
          const sessionState = session.exerciseStates?.[set.exerciseId];

          // Merge: use higher of baseline or session bests
          const prevState: ExerciseSessionState = {
            bestE1RMKg: Math.max(baselineState.bestE1RMKg, sessionState?.bestE1RMKg ?? 0),
            bestWeightKg: Math.max(baselineState.bestWeightKg, sessionState?.bestWeightKg ?? 0),
            bestRepsAtWeight: {
              ...baselineState.bestRepsAtWeight,
              ...sessionState?.bestRepsAtWeight,
            },
          };

          const result = detectCueForWorkingSet({
            weightKg: set.weightKg,
            reps: set.reps,
            unit,
            exerciseName,
            prev: prevState,
          });

          // Update exercise state in session
          updateCurrentSession((s) => ({
            ...s,
            exerciseStates: {
              ...s.exerciseStates,
              [set.exerciseId]: result.next,
            },
          }));

          // Show cue if PR detected
          if (result.cue) {
            // Map PR type
            const prType: PRType = result.meta.type === 'cardio' ? 'cardio'
              : result.meta.type === 'weight' ? 'weight'
              : result.meta.type === 'rep' ? 'rep'
              : result.meta.type === 'e1rm' ? 'e1rm'
              : 'none';

            // Compute delta for intensity calculation
            const delta = prType === 'weight' ? result.meta.weightDeltaLb
              : prType === 'rep' ? result.meta.repDeltaAtWeight
              : prType === 'e1rm' ? result.meta.e1rmDeltaLb
              : 0;

            // Build detail string
            const detail =
              prType === 'weight'
                ? `+${result.meta.weightDeltaLb.toFixed(0)} lb`
                : prType === 'rep'
                ? `+${result.meta.repDeltaAtWeight} reps at ${result.meta.weightLabel}`
                : prType === 'e1rm'
                ? `+${result.meta.e1rmDeltaLb.toFixed(0)} lb e1RM`
                : undefined;

            // Create rich cue
            const richCue: RichCue = {
              id: `pr_${Date.now()}_${set.id}`,
              message: result.cue.message,
              detail,
              prType,
              exerciseId: set.exerciseId,
              exerciseName,
              delta,
              deltaUnit: prType === 'rep' ? 'reps' : 'lb',
              intensity: computeIntensity(prType, delta),
              triggeredBySetId: set.id,
              sessionId: session.id,
              createdAt: Date.now(),
            };

            setPendingCue(richCue);

            // Extra haptic for PRs (stronger for bigger PRs)
            if (settings.hapticsEnabled && Platform.OS === 'ios') {
              const hapticType = richCue.intensity === 'legendary'
                ? Haptics.NotificationFeedbackType.Success
                : richCue.intensity === 'hype'
                ? Haptics.NotificationFeedbackType.Success
                : Haptics.ImpactFeedbackStyle.Medium;

              if (richCue.intensity === 'legendary' || richCue.intensity === 'hype') {
                Haptics.notificationAsync(hapticType as Haptics.NotificationFeedbackType).catch(() => {});
              } else {
                Haptics.impactAsync(hapticType as Haptics.ImpactFeedbackStyle).catch(() => {});
              }
            }
          }
        }
      }
    }
  }, [doneBySetId, session, settings.hapticsEnabled, settings.defaultRestSeconds, settings.unitSystem, startRestTimer, setPendingCue]);

  // Update weight for a set
  const handleWeightChange = useCallback((setId: string, text: string) => {
    const weightLb = parseFloat(text);
    if (isNaN(weightLb) || weightLb < 0) return;

    updateCurrentSession((s) => ({
      ...s,
      sets: s.sets.map((set) =>
        set.id === setId ? { ...set, weightKg: lbToKg(weightLb) } : set
      ),
    }));
  }, []);

  // Update reps for a set
  const handleRepsChange = useCallback((setId: string, text: string) => {
    const reps = parseInt(text, 10);
    if (isNaN(reps) || reps < 0) return;

    updateCurrentSession((s) => ({
      ...s,
      sets: s.sets.map((set) =>
        set.id === setId ? { ...set, reps } : set
      ),
    }));
  }, []);

  // Check if set is done
  const isDone = useCallback(
    (setId: string) => !!doneBySetId[setId],
    [doneBySetId]
  );

  // Add exercise to workout
  const handleSelectExercise = useCallback(
    (exerciseId: string) => {
      if (!session) return;

      // Add to exercise blocks if not already there
      if (!session.exerciseBlocks.includes(exerciseId)) {
        updateCurrentSession((s) => ({
          ...s,
          exerciseBlocks: [...s.exerciseBlocks, exerciseId],
          selectedExerciseId: exerciseId,
        }));
      }

      setShowExercisePicker(false);
    },
    [session]
  );

  // Remove exercise from workout
  const handleRemoveExercise = useCallback((exerciseId: string) => {
    Alert.alert(
      'Remove Exercise?',
      `Remove ${getExerciseName(exerciseId)} and all its sets?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            updateCurrentSession((s) => ({
              ...s,
              exerciseBlocks: s.exerciseBlocks.filter((id) => id !== exerciseId),
              sets: s.sets.filter((set) => set.exerciseId !== exerciseId),
              selectedExerciseId:
                s.selectedExerciseId === exerciseId
                  ? s.exerciseBlocks.find((id) => id !== exerciseId) ?? null
                  : s.selectedExerciseId,
            }));
          },
        },
      ]
    );
  }, []);

  // Counts
  const setCount = session?.sets?.length ?? 0;
  const completedSetCount = Object.values(doneBySetId).filter(Boolean).length;
  const exerciseCount = session?.exerciseBlocks?.length ?? 0;

  // Get addSession from workout store
  const addSession = useWorkoutStore((state) => state.addSession);

  // Complete workout handler
  const handleCompleteWorkout = useCallback(() => {
    if (completedSetCount === 0) {
      Alert.alert(
        'No Sets Completed',
        'You haven\'t completed any sets yet. Complete sets by tapping the checkmark, or discard this workout.',
        [
          { text: 'Keep Working', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: handleDiscardWorkout },
        ]
      );
      return;
    }

    Alert.alert(
      'Complete Workout?',
      `You've completed ${completedSetCount} sets across ${exerciseCount} exercises. Ready to finish?`,
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            if (session) {
              // Convert completed sets to WorkoutSets
              const completedSets: WorkoutSet[] = session.sets
                .filter((set) => doneBySetId[set.id])
                .map((set) => ({
                  id: set.id,
                  exerciseId: set.exerciseId,
                  weightKg: set.weightKg,
                  reps: set.reps,
                  timestampMs: set.timestampMs,
                }));

              // Create WorkoutSession
              const workoutSession: WorkoutSession = {
                id: session.id,
                startedAtMs: session.startedAtMs,
                endedAtMs: Date.now(),
                sets: completedSets,
                routineId: session.routineId,
                planId: session.planId,
              };

              // Save to workout store
              addSession(workoutSession);

              // Rebuild PR history so future PRs are detected correctly
              rebuildPRsFromHistory();
            }

            clearCurrentSession();
            endWorkout();
          },
        },
      ]
    );
  }, [completedSetCount, exerciseCount, session, doneBySetId, addSession, endWorkout]);

  // Discard workout handler
  const handleDiscardWorkout = useCallback(() => {
    Alert.alert(
      'Discard Workout?',
      'This will delete all logged sets. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            clearCurrentSession();
            endWorkout();
          },
        },
      ]
    );
  }, [endWorkout]);

  // Rest timer done handler
  const handleRestTimerDone = useCallback(() => {
    clearRestTimer();
    // Haptic feedback when rest is over
    if (settings.hapticsEnabled && Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [settings.hapticsEnabled, clearRestTimer]);

  // Close rest timer (dismiss without completing)
  const handleRestTimerClose = useCallback(() => {
    setRestTimerVisible(false);
    clearRestTimer();
  }, [clearRestTimer]);

  // Clear cue toast
  const handleClearCue = useCallback(() => {
    clearPendingCue();
  }, [clearPendingCue]);

  // Dismiss keyboard on scroll
  const handleScrollBeginDrag = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  // Render exercise picker when open
  if (showExercisePicker) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <ExercisePicker
          visible={true}
          selectedExerciseId={session?.selectedExerciseId ?? ''}
          onSelect={handleSelectExercise}
          onBack={() => setShowExercisePicker(false)}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        {/* Collapse button */}
        <Pressable
          onPress={collapseDrawer}
          style={styles.headerButton}
          hitSlop={8}
        >
          <Ionicons name="chevron-forward" size={24} color={c.text} />
        </Pressable>

        {/* Title and Timer */}
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: c.text }]}>Workout</Text>
          <View style={styles.headerStats}>
            <Text style={[styles.headerSubtitle, { color: c.muted }]}>
              {formatDuration(elapsedMs)}
            </Text>
            <Text style={[styles.headerDot, { color: c.muted }]}> · </Text>
            <Text style={[styles.headerSubtitle, { color: c.muted }]}>
              {completedSetCount}/{setCount} sets
            </Text>
          </View>
        </View>

        {/* Complete button */}
        <Pressable
          onPress={handleCompleteWorkout}
          style={[styles.completeButton, { backgroundColor: c.primary }]}
          hitSlop={8}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={handleScrollBeginDrag}
      >
        {/* Empty state */}
        {exerciseCount === 0 && (
          <Pressable
            style={[styles.emptyState, { borderColor: c.border }]}
            onPress={() => setShowExercisePicker(true)}
          >
            <Ionicons name="add-circle-outline" size={48} color={c.muted} />
            <Text style={[styles.emptyText, { color: c.muted }]}>
              Tap to add your first exercise
            </Text>
          </Pressable>
        )}

        {/* Exercise Cards */}
        {session?.exerciseBlocks?.map((exerciseId) => (
          <ExerciseCard
            key={exerciseId}
            exerciseId={exerciseId}
            sets={getSetsForExercise(exerciseId)}
            getPreviousSet={getPreviousSet}
            onAddSet={() => handleAddSet(exerciseId)}
            onDeleteSet={handleDeleteSet}
            onToggleDone={handleToggleDone}
            onWeightChange={handleWeightChange}
            onRepsChange={handleRepsChange}
            isDone={isDone}
            kgToLb={kgToLb}
            onExerciseTap={() => handleRemoveExercise(exerciseId)}
          />
        ))}

        {/* Add Exercise Button */}
        <Pressable
          style={[styles.addButton, { backgroundColor: `${c.primary}15`, borderColor: c.primary }]}
          onPress={() => setShowExercisePicker(true)}
        >
          <Ionicons name="add" size={20} color={c.primary} />
          <Text style={[styles.addButtonText, { color: c.primary }]}>
            Add Exercise
          </Text>
        </Pressable>

        {/* Bottom padding for keyboard */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer actions */}
      <View style={[styles.footer, { borderTopColor: c.border }]}>
        <View style={styles.footerButtons}>
          <Pressable
            style={[styles.discardButton, { borderColor: c.border }]}
            onPress={handleDiscardWorkout}
          >
            <Ionicons name="trash-outline" size={18} color={c.muted} />
          </Pressable>
          <Pressable
            style={[styles.finishButton, { backgroundColor: c.primary }]}
            onPress={handleCompleteWorkout}
          >
            <Text style={styles.finishButtonText}>
              Complete Workout ({completedSetCount} sets)
            </Text>
          </Pressable>
        </View>
      </View>

      {/* PR Cue Presenter - only show when drawer is expanded */}
      {drawerPosition === 'expanded' && (
        <CuePresenter
          cue={pendingCue}
          onDismiss={handleClearCue}
          position="top"
        />
      )}

      {/* Rest Timer Overlay - synced with store state */}
      <RestTimerOverlay
        visible={restTimerVisible}
        initialSeconds={restTimer.totalSeconds || settings.defaultRestSeconds || DEFAULT_REST_SECONDS}
        startedAtMs={restTimer.startedAtMs}
        onClose={handleRestTimerClose}
        onDone={handleRestTimerDone}
        workoutId={session?.id}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
  },
  headerDot: {
    fontSize: 12,
  },
  completeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    padding: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discardButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
});

export default DrawerContent;
