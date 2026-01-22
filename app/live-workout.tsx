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
import { getSettings } from "../src/lib/settings";
import { useCurrentPlan } from "../src/lib/workoutPlanStore";

import { ExerciseBlocksCard } from "../src/ui/components/LiveWorkout/ExerciseBlocksCard";
import { ExercisePicker } from "../src/ui/components/LiveWorkout/ExercisePicker";
import { InstantCueToast } from "../src/ui/components/LiveWorkout/InstantCueToast";
import { QuickAddSetCard } from "../src/ui/components/LiveWorkout/QuickAddSetCard";
import { RestTimerOverlay } from "../src/ui/components/RestTimerOverlay";

import {
  ensureCurrentSession,
  updateCurrentSession,
  useCurrentSession,
} from "../src/lib/currentSessionStore";
import { useLiveWorkoutSession } from "../src/lib/hooks/useLiveWorkoutSession";
import { useWorkoutOrchestrator } from "../src/lib/hooks/useWorkoutOrchestrator";

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
      setSelectedExerciseId((persisted as any).selectedExerciseId ?? selectedExerciseId);
      setExerciseBlocks((persisted as any).exerciseBlocks?.length ? (persisted as any).exerciseBlocks : exerciseBlocks);
      return;
    }

    const first = currentPlannedExerciseId ?? EXERCISES_V1[0]?.id ?? "unknown";
    ensureCurrentSession({
      selectedExerciseId: first,
      exerciseBlocks: planMode ? plannedExerciseIds.slice() : first ? [first] : [],
    } as any);
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

  const session = useLiveWorkoutSession({ selectedExerciseId } as any);

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

  // Wrapper to add set using both session and orchestrator
  function addSetInternal(exerciseId: string, source: "quick" | "block") {
    const anySession = session as any;
    const fn =
      anySession.addSet ??
      anySession.onAddSet ??
      anySession.commitSet ??
      anySession.logSet ??
      anySession.addWorkingSet ??
      null;

    if (typeof fn !== "function") return;

    const set = fn(exerciseId);
    if (!set) return;

    const anySet = set as any;
    const weightLb = typeof anySet.weightLb === "number" ? anySet.weightLb : 0;
    const reps = typeof anySet.reps === "number" ? anySet.reps : 0;

    // Use orchestrator for PR detection and cues
    orchestrator.addSetForExercise(exerciseId, weightLb, reps);

    if (source === "quick") setSelectedExerciseId(exerciseId);
  }

  const addSet = () => addSetInternal(selectedExerciseId, "quick");
  const addSetForExercise = (exerciseId: string) => addSetInternal(exerciseId, "block");

  const handleSaveAsRoutine = () => {
    const sets: LoggedSet[] = (session as any).sets ?? [];
    orchestrator.saveAsRoutine(exerciseBlocks, sets);
  };

  const handleReset = () => {
    initializedRef.current = false;
    orchestrator.reset(plannedExerciseIds);
    setRestVisible(false);
    setFocusMode(false);
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

  const sets: LoggedSet[] = (session as any).sets ?? [];

// Workout timer - MUST be before any early returns
  const timer = useWorkoutTimer({
    exercises: plan?.exercises ? plan.exercises.map(ex => ({
    exerciseId: ex.exerciseId,
    targetSets: ex.targetSets,
    targetRepsMin: ex.targetRepsMin ?? 8,
    targetRepsMax: ex.targetRepsMax ?? 12,
    restSeconds: 90,
  })) : [],
  loggedSets: sets,
  startedAtMs: (persisted as any)?.startedAtMs,
});

  const isDoneFn = useMemo(() => {
    const anySession = session as any;
    if (typeof anySession.isDone === "function") return anySession.isDone as (setId: string) => boolean;
    if (anySession.isDone && typeof anySession.isDone === "object") {
      const map = anySession.isDone as Record<string, boolean>;
      return (setId: string) => !!map[setId];
    }
    if (typeof anySession.isDone === "boolean") {
      const all = anySession.isDone as boolean;
      return (_setId: string) => all;
    }
    return (_setId: string) => false;
  }, [session]);

  const toggleDone: any = (session as any).toggleDone;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <InstantCueToast 
        cue={orchestrator.instantCue} 
        onClear={orchestrator.clearInstantCue} 
        randomHoldMs={randomHoldMs} 
      />

      <RestTimerOverlay
        visible={restVisible}
        initialSeconds={90}
        onClose={() => setRestVisible(false)}
        onDone={onRestTimerDoneFeedback}
      />

      <ScrollView contentContainerStyle={{ padding: PAD, gap: GAP, paddingBottom: 140 }}>
       {/* Timer Bar - NEW */}
       <WorkoutTimerBar 
        timer={timer} 
         onPressDetails={() => setShowTimerDetails(true)} 
       />

       {/* Timer Details Modal - NEW */}
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
        </View>

        {/* Top controls */}
        <View style={{ flexDirection: "row", gap: FR.space.x2 }}>
          <Pressable
            onPress={() => setPickerMode("addBlock")}
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
        </View>

        {/* Exercise blocks */}
        <ExerciseBlocksCard
          exerciseIds={exerciseBlocks}
          sets={sets as any}
          focusedExerciseId={selectedExerciseId}
          focusMode={focusMode}
          onAddSetForExercise={addSetForExercise}
          onJumpToExercise={(id: string) => setSelectedExerciseId(id)}
          isDone={isDoneFn}
          toggleDone={toggleDone}
          setWeightForSet={(session as any).setWeightForSet}
          setRepsForSet={(session as any).setRepsForSet}
          kgToLb={(session as any).kgToLb}
          estimateE1RMLb={(session as any).estimateE1RMLb}
        />

        {/* Selected exercise card */}
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

        {/* Quick add */}
        <QuickAddSetCard
          weightLb={(session as any).weightLb}
          reps={(session as any).reps}
          weightLbText={(session as any).weightLbText}
          repsText={(session as any).repsText}
          onWeightText={(session as any).onWeightText}
          onRepsText={(session as any).onRepsText}
          onWeightCommit={(session as any).onWeightCommit}
          onRepsCommit={(session as any).onRepsCommit}
          onDecWeight={(session as any).decWeight}
          onIncWeight={(session as any).incWeight}
          onDecReps={(session as any).decReps}
          onIncReps={(session as any).incReps}
          onAddSet={addSet}
        />

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
