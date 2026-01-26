// app/live-workout.tsx
import { useWorkoutTimer } from "../src/lib/hooks/useWorkoutTimer";
import { WorkoutTimerBar } from "../src/ui/components/LiveWorkout/WorkoutTimerBar";
import { WorkoutTimerDetails } from "../src/ui/components/LiveWorkout/WorkoutTimerDetails";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { makeDesignSystem } from "../src/ui/designSystem";
import { FR } from "../src/ui/forgerankStyle";
import { useThemeColors } from "../src/ui/theme";

import { EXERCISES_V1 } from "../src/data/exercises";
import type { UnitSystem } from "../src/lib/buckets";
import type { LoggedSet } from "../src/lib/loggerTypes";
import { randomHighlightDurationMs } from "../src/lib/perSetCue";
import { getSettings } from "../src/lib/stores"; // [MIGRATED 2026-01-23] Using Zustand
import { useCurrentPlan } from "../src/lib/workoutPlanStore";

import { ExerciseBlocksCard } from "../src/ui/components/LiveWorkout/ExerciseBlocksCard";
import { ExercisePicker } from "../src/ui/components/LiveWorkout/ExercisePicker";
import { InstantCueToast } from "../src/ui/components/LiveWorkout/InstantCueToast";
import { QuickAddSetCard } from "../src/ui/components/LiveWorkout/QuickAddSetCard";
import { RestTimerOverlay } from "../src/ui/components/RestTimerOverlay";
import { ValidationToast } from "../src/ui/components/LiveWorkout/ValidationToast";
import { useValidationToast } from "../src/lib/hooks/useValidationToast";

// [MIGRATED 2026-01-23] Using Zustand stores
import {
  ensureCurrentSession,
  updateCurrentSession,
  useCurrentSession,
} from "../src/lib/stores";
import { useLiveWorkoutSession } from "../src/lib/hooks/useLiveWorkoutSession";
import { useWorkoutOrchestrator } from "../src/lib/hooks/useWorkoutOrchestrator";
import { calculatePlanProgress, formatProgressPercent } from "../src/lib/utils/routineProgress";

function exerciseName(exerciseId: string) {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

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
    Speech.speak?.("Rest over.", { rate: 1.05, pitch: 1.1 });
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
  const ds = makeDesignSystem("dark", "toxic");

  // Unified spacing/radii via FR
  const PAD = FR.space.x4;
  const GAP = FR.space.x3;
  const CARD_R = FR.radius.card;
  const PILL_R = FR.radius.pill;

  const unit: UnitSystem = "lb";

  const plan = useCurrentPlan();
  const planMode = !!plan && plan.exercises.length > 0;

  const plannedExerciseIds = plan?.exercises.map((x) => x.exerciseId) ?? [];
  const currentPlannedExerciseId = planMode ? plan!.exercises[plan!.currentExerciseIndex]?.exerciseId : null;

  const persisted = useCurrentSession();
  const initializedRef = useRef(false);

  const [pickerMode, setPickerMode] = useState<null | "changeSelected" | "addBlock">(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState(currentPlannedExerciseId ?? EXERCISES_V1[0].id);
  const [exerciseBlocks, setExerciseBlocks] = useState<string[]>(() => (planMode ? plannedExerciseIds.slice() : []));
  const [focusMode, setFocusMode] = useState(false);
  const [restVisible, setRestVisible] = useState(false);
  const [showTimerDetails, setShowTimerDetails] = useState(false);

  const randomHoldMs = randomHighlightDurationMs;

  // Initialize session on mount
  useEffect(() => {
    if (initializedRef.current) return;
    if (persisted) {
      initializedRef.current = true;
      setSelectedExerciseId(persisted.selectedExerciseId ?? selectedExerciseId);
      setExerciseBlocks(persisted.exerciseBlocks?.length ? persisted.exerciseBlocks : exerciseBlocks);
      return;
    }

    const first = currentPlannedExerciseId ?? EXERCISES_V1[0]?.id ?? "unknown";
    ensureCurrentSession({
      selectedExerciseId: first,
      exerciseBlocks: planMode ? plannedExerciseIds.slice() : first ? [first] : [],
    });
    initializedRef.current = true;
  }, [persisted, planMode, currentPlannedExerciseId, selectedExerciseId, exerciseBlocks, plannedExerciseIds]);

  // Sync selected exercise with plan
  useEffect(() => {
    if (planMode && currentPlannedExerciseId) {
      setSelectedExerciseId(currentPlannedExerciseId);
      updateCurrentSession((s: any) => ({ ...s, selectedExerciseId: currentPlannedExerciseId }));
    }
  }, [planMode, currentPlannedExerciseId]);

  // Sync exercise blocks with plan
  useEffect(() => {
    if (!planMode) return;
    setExerciseBlocks((prev) => (prev.length ? prev : plannedExerciseIds.slice()));
  }, [planMode, plannedExerciseIds]);

  // Persist UI state
  useEffect(() => {
    updateCurrentSession((s: any) => ({ ...s, selectedExerciseId, exerciseBlocks }));
  }, [selectedExerciseId, exerciseBlocks]);

  // Validation toast for error/success feedback (DDD SPEC-003)
  const { toast, showError, showSuccess, dismiss } = useValidationToast();

  // Session with validation callbacks
  const session = useLiveWorkoutSession(
    undefined,
    {
      onError: showError,
      onSuccess: showSuccess,
    }
  );

  // Workout orchestrator with haptic/sound callbacks
  const orchestrator = useWorkoutOrchestrator({
    plan: plan ?? null,
    unit,
    onHaptic: (type) => {
      if (type === 'pr') hapticPR();
      else hapticLight();
    },
    onSound: (type) => {
      // Sound logic can be added here if needed
    },
  });

  const selectedExerciseName = useMemo(() => exerciseName(selectedExerciseId), [selectedExerciseId]);

  // Add set to the workout - uses the session's addSet function
  function addSetInternal(exerciseId: string, source: "quick" | "block") {
    // Call the session's addSet function
    const result = session.addSet(exerciseId);

    // Use orchestrator for PR detection
    orchestrator.addSetForExercise(exerciseId, result.weightLb, result.reps);

    // Update selected exercise if from quick add
    if (source === "quick") {
      setSelectedExerciseId(exerciseId);
    }

    // Show rest timer after adding a set
    setRestVisible(true);
  }

  const addSet = () => addSetInternal(selectedExerciseId, "quick");
  const addSetForExercise = (exerciseId: string) => addSetInternal(exerciseId, "block");

  const handleSaveAsRoutine = () => {
    orchestrator.saveAsRoutine(exerciseBlocks, session.sets);
  };

  const handleReset = () => {
    initializedRef.current = false;
    orchestrator.reset(plannedExerciseIds);
    setRestVisible(false);
    setFocusMode(false);
  };

  // FIX: Only allow adding exercises in free workout mode
  const handleAddExercise = () => {
    if (planMode) {
      // Don't allow adding exercises in plan mode
      console.log("Cannot add exercises during a planned workout");
      return;
    }
    setPickerMode("addBlock");
  };

  const allowedExerciseIds = planMode ? plannedExerciseIds : undefined;

  if (pickerMode) {
    return (
      <ExercisePicker
        visible
        allowedExerciseIds={allowedExerciseIds}
        selectedExerciseId={selectedExerciseId}
        onSelect={(id) => {
          if (pickerMode === "changeSelected") setSelectedExerciseId(id);
          else {
            setExerciseBlocks((prev) => (prev.includes(id) ? prev : [...prev, id]));
            setSelectedExerciseId(id);
          }
          setPickerMode(null);
        }}
        onBack={() => setPickerMode(null)}
      />
    );
  }

  const sets = session.sets;

  // Calculate workout progress (TAG-003: Overall Completion Percentage)
  const progress = useMemo(
    () => calculatePlanProgress(plan, sets),
    [plan, sets]
  );

  // Build target sets map for exercise blocks (TAG-002: Exercise Progress Indicators)
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
      targetRepsMin: ex.targetRepsMin ?? 8,
      targetRepsMax: ex.targetRepsMax ?? 12,
      restSeconds: 90,
    })) : [],
    loggedSets: sets,
    startedAtMs: persisted?.startedAtMs,
  });

  // Session provides properly typed isDone and toggleDone functions
  const isDoneFn = session.isDone;
  const toggleDone = session.toggleDone;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <InstantCueToast
        cue={orchestrator.instantCue}
        onClear={orchestrator.clearInstantCue}
        randomHoldMs={randomHoldMs}
      />

      {/* Validation Toast for error/success feedback (DDD SPEC-003) */}
      <ValidationToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={dismiss}
      />

      <RestTimerOverlay
        visible={restVisible}
        initialSeconds={90}
        onClose={() => setRestVisible(false)}
        onDone={onRestTimerDoneFeedback}
      />

      <ScrollView contentContainerStyle={{ padding: PAD, gap: GAP, paddingBottom: 140 }}>
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

        {/* Header card */}
        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.card,
            borderRadius: CARD_R,
            padding: FR.space.x4,
            gap: FR.space.x2,
          }}
        >
          <Text style={{ color: c.text, ...FR.type.h2 }}>
            {planMode ? plan?.routineName ?? "Planned Workout" : "Free Workout"}
          </Text>
          <Text style={{ color: c.muted, ...FR.type.sub }}>
            Sets logged: {sets.length} • Focus: {focusMode ? "On" : "Off"}
          </Text>

          {/* Progress bar for planned workouts (TAG-003) */}
          {planMode && progress.total > 0 && (
            <View style={{ marginTop: FR.space.x1, gap: FR.space.x1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: c.muted, ...FR.type.sub }}>
                  Progress
                </Text>
                <Text style={{ color: c.text, ...FR.type.sub, fontWeight: "900" }}>
                  {progress.completed}/{progress.total} sets ({formatProgressPercent(progress.percent)})
                </Text>
              </View>
              <View
                style={{
                  height: 6,
                  backgroundColor: c.bg,
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.min(progress.percent, 1) * 100}%`,
                    backgroundColor: c.success,
                    borderRadius: 3,
                  }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Top controls - FIX: Hide +Exercise in plan mode */}
        <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
          {!planMode && (
            <Pressable
              onPress={handleAddExercise}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: FR.space.x3,
                paddingHorizontal: FR.space.x4,
                borderRadius: PILL_R,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.card,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? ds.rules.tapOpacity : 1,
              })}
            >
              <Text style={{ color: c.text, ...FR.type.h3 }}>+ Exercise</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => setFocusMode((v) => !v)}
            style={({ pressed }) => ({
              paddingVertical: FR.space.x3,
              paddingHorizontal: FR.space.x4,
              borderRadius: PILL_R,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: focusMode ? c.bg : c.card,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? ds.rules.tapOpacity : 1,
            })}
          >
            <Text style={{ color: c.text, ...FR.type.h3 }}>{focusMode ? "Focus ✓" : "Focus"}</Text>
          </Pressable>

          {!planMode && (
            <Pressable
              onPress={() => setPickerMode("changeSelected")}
              style={({ pressed }) => ({
                paddingVertical: FR.space.x3,
                paddingHorizontal: FR.space.x4,
                borderRadius: PILL_R,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.card,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? ds.rules.tapOpacity : 1,
              })}
            >
              <Text style={{ color: c.text, ...FR.type.h3 }}>Pick</Text>
            </Pressable>
          )}
        </View>

        {/* Exercise blocks */}
        <ExerciseBlocksCard
          exerciseIds={exerciseBlocks}
          sets={sets}
          targetSetsByExerciseId={planMode ? targetSetsByExerciseId : undefined}
          focusedExerciseId={selectedExerciseId}
          focusMode={focusMode}
          onAddSetForExercise={addSetForExercise}
          onJumpToExercise={(id: string) => setSelectedExerciseId(id)}
          isDone={isDoneFn}
          toggleDone={toggleDone}
          setWeightForSet={session.setWeightForSet}
          setRepsForSet={session.setRepsForSet}
          kgToLb={session.kgToLb}
          estimateE1RMLb={session.estimateE1RMLb}
        />

        {/* Quick add card - FIX: Only show in free workout mode */}
        {!planMode && (
          <>
            <View
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: CARD_R,
                padding: FR.space.x4,
                backgroundColor: c.card,
                gap: FR.space.x2,
              }}
            >
              <Text style={{ color: c.muted, ...FR.type.sub }}>Selected Exercise (Quick Add)</Text>
              <Text style={{ color: c.text, ...FR.type.h2 }}>{selectedExerciseName}</Text>

              <Pressable
                onPress={() => setPickerMode("changeSelected")}
                style={({ pressed }) => ({
                  paddingVertical: FR.space.x3,
                  paddingHorizontal: FR.space.x4,
                  borderRadius: PILL_R,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.bg,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? ds.rules.tapOpacity : 1,
                })}
              >
                <Text style={{ color: c.text, ...FR.type.h3 }}>Change Selected</Text>
              </Pressable>
            </View>

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
            />
          </>
        )}

        {/* Bottom actions */}
        <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
          <Pressable
            onPress={orchestrator.finishWorkout}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: FR.space.x3,
              paddingHorizontal: FR.space.x4,
              borderRadius: PILL_R,
              borderWidth: 1,
              borderColor: ds.tone.accent,
              backgroundColor: ds.tone.accent,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? ds.rules.tapOpacity : 1,
            })}
          >
            <Text style={{ color: c.bg, ...FR.type.h3 }}>Finish Workout</Text>
          </Pressable>

          <Pressable
            onPress={handleSaveAsRoutine}
            disabled={sets.length === 0}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: FR.space.x3,
              paddingHorizontal: FR.space.x4,
              borderRadius: PILL_R,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              alignItems: "center",
              justifyContent: "center",
              opacity: sets.length === 0 ? 0.5 : pressed ? ds.rules.tapOpacity : 1,
            })}
          >
            <Text style={{ color: c.text, ...FR.type.h3 }}>Save Routine</Text>
          </Pressable>

          <Pressable
            onPress={handleReset}
            style={({ pressed }) => ({
              paddingVertical: FR.space.x3,
              paddingHorizontal: FR.space.x4,
              borderRadius: PILL_R,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? ds.rules.tapOpacity : 1,
            })}
          >
            <Text style={{ color: c.text, ...FR.type.h3 }}>Reset</Text>
          </Pressable>
        </View>

        {/* Recap cues */}
        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: CARD_R,
            padding: FR.space.x4,
            gap: FR.space.x2,
            backgroundColor: c.card,
          }}
        >
          <Text style={{ color: c.text, ...FR.type.h3 }}>Recap Cues</Text>

          {orchestrator.recapCues.length === 0 ? (
            <Text style={{ color: c.muted, ...FR.type.sub }}>Tap Finish Workout to generate recap cues.</Text>
          ) : (
            orchestrator.recapCues.map((cue, idx) => (
              <Text
                key={idx}
                style={{
                  color: c.text,
                  ...(cue.intensity === "high" ? FR.type.h3 : FR.type.body),
                }}
              >
                • {cue.message}
              </Text>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
