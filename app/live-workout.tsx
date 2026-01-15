import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useThemeColors } from "../src/ui/theme";

import { EXERCISES_V1 } from "../src/data/exercises";
import type { UnitSystem } from "../src/lib/buckets";
import type { LoggedSet } from "../src/lib/loggerTypes";
import { generateCuesForExerciseSession, groupSetsByExercise } from "../src/lib/simpleSession";
import { lbToKg } from "../src/lib/units";

import {
  type Cue,
  detectCueForWorkingSet,
  type ExerciseSessionState,
  makeEmptyExerciseState,
  pickPunchyVariant,
  randomFallbackCue,
  randomFallbackDurationMs,
  randomFallbackEveryN,
  randomHighlightDurationMs,
} from "../src/lib/perSetCue";

import { getSettings } from "../src/lib/settings";
import { formatDuration, uid as uid2, type WorkoutSession, type WorkoutSet } from "../src/lib/workoutModel";
import { setCurrentPlan, updateCurrentPlan, useCurrentPlan } from "../src/lib/workoutPlanStore";
import { clampPlanIndex, completionPct as planCompletionPct } from "../src/lib/workoutPlanUtils";
import { addWorkoutSession } from "../src/lib/workoutStore";
import { upsertRoutine } from "../src/lib/routinesStore";
import { uid as routineUid, type RoutineExercise, type Routine } from "../src/lib/routinesModel";

import { RestTimerOverlay } from "../src/ui/components/RestTimerOverlay";
import { ExercisePicker } from "../src/ui/components/LiveWorkout/ExercisePicker";
import { PlanHeaderCard } from "../src/ui/components/LiveWorkout/PlanHeaderCard";
import { QuickAddSetCard } from "../src/ui/components/LiveWorkout/QuickAddSetCard";
import { InstantCueToast, type InstantCue } from "../src/ui/components/LiveWorkout/InstantCueToast";
import { ExerciseBlocksCard } from "../src/ui/components/LiveWorkout/ExerciseBlocksCard";

import { useLiveWorkoutSession } from "../src/lib/hooks/useLiveWorkoutSession";

function uid() {
  return Math.random().toString(16).slice(2);
}

function exerciseName(exerciseId: string) {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

// Optional runtime requires (no-op if not installed)
let Haptics: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Haptics = require("expo-haptics");
} catch {
  Haptics = null;
}

let Speech: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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

function hapticFallback() {
  const s = getSettings();
  if (!s.hapticsEnabled || !Haptics) return;
  Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light).catch?.(() => {});
}

function hapticPR() {
  const s = getSettings();
  if (!s.hapticsEnabled || !Haptics) return;
  Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success).catch?.(() => {});
}

function soundFallback() {
  const s = getSettings();
  if (!s.soundsEnabled) return;
}
function soundPR() {
  const s = getSettings();
  if (!s.soundsEnabled) return;
}

export default function LiveWorkout() {
  const c = useThemeColors();
  const unit: UnitSystem = "lb";

  const plan = useCurrentPlan();
  const planMode = !!plan && plan.exercises.length > 0;

  const plannedExerciseIds = plan?.exercises.map((x) => x.exerciseId) ?? [];
  const currentPlannedExerciseId = planMode ? plan!.exercises[plan!.currentExerciseIndex]?.exerciseId : null;

  const [selectedExerciseId, setSelectedExerciseId] = useState(
    currentPlannedExerciseId ?? EXERCISES_V1[0].id
  );

  // Picker now used for BOTH: change selected exercise, and add exercise blocks
  const [pickerMode, setPickerMode] = useState<null | "changeSelected" | "addBlock">(null);

  // Exercise Blocks v1: ordered list of exerciseIds shown as blocks
  const [exerciseBlocks, setExerciseBlocks] = useState<string[]>(() =>
    planMode ? plannedExerciseIds.slice() : []
  );

  // Focus mode (show only selected block)
  const [focusMode, setFocusMode] = useState(false);

  // session hook (sets + locking + quick add + per-exercise defaults)
  const session = useLiveWorkoutSession({ weightLb: 135, reps: 8 });

  // sync selection to current plan exercise
  useEffect(() => {
    if (planMode && currentPlannedExerciseId) setSelectedExerciseId(currentPlannedExerciseId);
  }, [planMode, currentPlannedExerciseId]);

  // if plan switches on, seed blocks (don’t fight user if they’ve already started adding)
  useEffect(() => {
    if (!planMode) return;
    setExerciseBlocks((prev) => (prev.length ? prev : plannedExerciseIds.slice()));
  }, [planMode, plannedExerciseIds]);

  // Per-exercise last-used behavior:
  // - save previous exercise defaults when switching
  // - when switching to a new exercise, pull its defaults into Quick Add fields (if any)
  const prevSelectedRef = useRef<string>(selectedExerciseId);
  useEffect(() => {
    const prevId = prevSelectedRef.current;
    if (prevId && prevId !== selectedExerciseId) {
      session.setDefaultsForExercise(prevId, { weightLb: session.weightLb, reps: session.reps });
    }
    prevSelectedRef.current = selectedExerciseId;
    session.syncQuickAddToExercise(selectedExerciseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExerciseId]);

  // Also keep defaults updated for the currently selected exercise as user edits Quick Add
  useEffect(() => {
    session.setDefaultsForExercise(selectedExerciseId, { weightLb: session.weightLb, reps: session.reps });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExerciseId, session.weightLb, session.reps]);

  const [recapCues, setRecapCues] = useState<Cue[]>([]);
  const [instantCue, setInstantCue] = useState<InstantCue | null>(null);

  const [sessionStateByExercise, setSessionStateByExercise] = useState<Record<string, ExerciseSessionState>>({});
  const [fallbackCountdownByExercise, setFallbackCountdownByExercise] = useState<Record<string, number>>({});

  // Workout timing
  const [workoutStartedAt, setWorkoutStartedAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(Date.now());

  // Rest overlay
  const [restVisible, setRestVisible] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const selectedExerciseName = exerciseName(selectedExerciseId);

  const Button = (props: { title: string; onPress: () => void; flex?: boolean }) => (
    <Pressable
      onPress={props.onPress}
      style={{
        flex: props.flex ? 1 : undefined,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.card,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", color: c.text }}>{props.title}</Text>
    </Pressable>
  );

  function showInstantCue(cue: InstantCue) {
    setInstantCue(cue);
  }

  function randomHoldMs(isHighlight: boolean) {
    return isHighlight ? randomHighlightDurationMs() : randomFallbackDurationMs();
  }

  function ensureCountdown(exId: string): number {
    return fallbackCountdownByExercise[exId] ?? randomFallbackEveryN();
  }

  function formatPRDetail(meta: {
    type: "weight" | "rep" | "e1rm";
    repDeltaAtWeight: number;
    weightDeltaLb: number;
    e1rmDeltaLb: number;
    weightLabel: string;
  }): string {
    if (meta.type === "rep") return `+${meta.repDeltaAtWeight} reps @ ${meta.weightLabel}`;
    if (meta.type === "weight") return `+${Math.round(meta.weightDeltaLb)} lb (new top weight)`;
    return `+${Math.round(meta.e1rmDeltaLb)} lb e1RM`;
  }

  const workoutElapsedLabel = useMemo(() => {
    if (!workoutStartedAt) return "0:00";
    return formatDuration(nowMs - workoutStartedAt);
  }, [nowMs, workoutStartedAt]);

  const planHeader = useMemo(() => {
    if (!plan) return null;
    if (!planMode) return { title: "Free Workout (started)", subtitle: "No plan. Log anything." };

    const ex = plan.exercises[plan.currentExerciseIndex];
    const done = plan.completedSetsByExerciseId[ex.exerciseId] ?? 0;

    return {
      title: plan.routineName ?? "Routine Workout",
      subtitle: `Exercise ${plan.currentExerciseIndex + 1}/${plan.exercises.length}: ${exerciseName(ex.exerciseId)} • Sets ${done}/${ex.targetSets}`,
    };
  }, [plan, planMode]);

  function jumpToPlanIndex(index: number) {
    if (!planMode || !plan) return;
    const clamped = clampPlanIndex(plan, index);
    updateCurrentPlan((p) => ({ ...p, currentExerciseIndex: clamped }));
    setSelectedExerciseId(plan.exercises[clamped].exerciseId);
  }

  function advanceToNextPlannedExercise() {
    if (!planMode || !plan) return;
    jumpToPlanIndex(plan.currentExerciseIndex + 1);
  }

  function ensureBlock(exerciseId: string) {
    setExerciseBlocks((prev) => (prev.includes(exerciseId) ? prev : [...prev, exerciseId]));
  }

  function addSetInternal(exerciseId: string, source: "block" | "quick") {
    const now = Date.now();
    if (!workoutStartedAt) setWorkoutStartedAt(now);

    // 1) Auto-add a block if missing
    ensureBlock(exerciseId);

    // 2) Use per-exercise last-used values
    const d = session.getDefaultsForExercise(exerciseId);

    const next: LoggedSet = {
      id: uid(),
      exerciseId,
      setType: "working",
      weightKg: lbToKg(d.weightLb),
      reps: d.reps,
      timestampMs: now,
    };

    session.setSets((prev) => [...prev, next]);
    setRestVisible(true);

    // Plan progress only counts if it's the CURRENT planned exercise
    if (planMode && plan && exerciseId === currentPlannedExerciseId) {
      updateCurrentPlan((p) => {
        const cur = p.exercises[p.currentExerciseIndex];
        const prevDone = p.completedSetsByExerciseId[cur.exerciseId] ?? 0;
        const nextDone = prevDone + 1;

        const completedSetsByExerciseId = {
          ...p.completedSetsByExerciseId,
          [cur.exerciseId]: nextDone,
        };

        const shouldAdvance = nextDone >= cur.targetSets && p.currentExerciseIndex < p.exercises.length - 1;

        return {
          ...p,
          completedSetsByExerciseId,
          currentExerciseIndex: shouldAdvance ? p.currentExerciseIndex + 1 : p.currentExerciseIndex,
        };
      });
    }

    // Per-set cues / feedback
    const prevState = sessionStateByExercise[exerciseId] ?? makeEmptyExerciseState();

    const result = detectCueForWorkingSet({
      weightKg: next.weightKg,
      reps: next.reps,
      unit,
      exerciseName: exerciseName(exerciseId),
      prev: prevState,
    });

    setSessionStateByExercise((prev) => ({ ...prev, [exerciseId]: result.next }));

    if (result.meta.type === "cardio" && result.cue) {
      showInstantCue(result.cue as any);
      hapticFallback();
      soundFallback();
      return;
    }

    if (result.cue && (result.meta.type === "rep" || result.meta.type === "weight" || result.meta.type === "e1rm")) {
      let title = result.cue.message;

      const detail = formatPRDetail({
        type: result.meta.type,
        repDeltaAtWeight: result.meta.repDeltaAtWeight,
        weightDeltaLb: result.meta.weightDeltaLb,
        e1rmDeltaLb: result.meta.e1rmDeltaLb,
        weightLabel: result.meta.weightLabel,
      });

      const isBigRep = result.meta.type === "rep" && result.meta.repDeltaAtWeight >= 3;
      const isBigWeight = result.meta.type === "weight" && result.meta.weightDeltaLb >= 25;
      const isBigE1RM = result.meta.type === "e1rm" && result.meta.e1rmDeltaLb >= 15;

      if (isBigRep) title = pickPunchyVariant("rep");
      else if (isBigWeight) title = pickPunchyVariant("weight");
      else if (isBigE1RM) title = pickPunchyVariant("e1rm");

      showInstantCue({ message: title, detail, intensity: "high" });
      hapticPR();
      soundPR();
      return;
    }

    const current = ensureCountdown(exerciseId);
    if (current <= 1) {
      showInstantCue(randomFallbackCue() as any);
      hapticFallback();
      soundFallback();
      setFallbackCountdownByExercise((prev) => ({ ...prev, [exerciseId]: randomFallbackEveryN() }));
    } else {
      setFallbackCountdownByExercise((prev) => ({ ...prev, [exerciseId]: current - 1 }));
    }

    // UX nicety: Quick Add keeps selection aligned with what you just logged
    if (source === "quick") {
      setSelectedExerciseId(exerciseId);
    }
  }

  const addSet = () => addSetInternal(selectedExerciseId, "quick");
  const addSetForExercise = (exerciseId: string) => addSetInternal(exerciseId, "block");

  function makeRoutineNameNow(): string {
    const d = new Date();
    const date = d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
    const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    return `Workout • ${date} ${time}`;
  }

  function saveAsRoutine() {
    const now = Date.now();

    if (session.sets.length === 0) {
      showInstantCue({ message: "No sets yet.", detail: "Log at least one set first.", intensity: "low" });
      hapticFallback();
      soundFallback();
      return;
    }

    // Preserve order of blocks if available
    const orderedExerciseIds =
      exerciseBlocks.length > 0
        ? exerciseBlocks.slice()
        : (() => {
            const seen = new Set<string>();
            const ordered: string[] = [];
            for (const s of session.sets) {
              if (!seen.has(s.exerciseId)) {
                seen.add(s.exerciseId);
                ordered.push(s.exerciseId);
              }
            }
            return ordered;
          })();

    // Map plan targets if available
    const planTargetsByExerciseId: Record<
      string,
      { targetSets?: number; targetRepsMin?: number; targetRepsMax?: number }
    > = {};
    if (plan?.exercises?.length) {
      for (const e of plan.exercises) {
        planTargetsByExerciseId[e.exerciseId] = {
          targetSets: e.targetSets,
          targetRepsMin: e.targetRepsMin,
          targetRepsMax: e.targetRepsMax,
        };
      }
    }

    const exercises: RoutineExercise[] = orderedExerciseIds.map((exerciseId) => {
      const t = planTargetsByExerciseId[exerciseId];
      return {
        id: routineUid(),
        exerciseId,
        targetSets: t?.targetSets ?? 3,
        targetRepsMin: t?.targetRepsMin ?? 6,
        targetRepsMax: t?.targetRepsMax ?? 12,
      };
    });

    const routine: Routine = {
      id: routineUid(),
      name: plan?.routineName ? `${plan.routineName} (Saved Copy)` : makeRoutineNameNow(),
      createdAtMs: now,
      updatedAtMs: now,
      exercises,
    };

    upsertRoutine(routine);

    showInstantCue({
      message: "Routine saved.",
      detail: `${routine.exercises.length} exercises`,
      intensity: "low",
    });
    hapticFallback();
    soundFallback();
  }

  const finishWorkout = () => {
    const end = Date.now();
    const start = workoutStartedAt ?? (session.sets[0]?.timestampMs ?? end);

    const completionPct = planMode && plan ? planCompletionPct(plan) : undefined;

    const sessionObj: WorkoutSession = {
      id: uid2(),
      startedAtMs: start,
      endedAtMs: end,
      sets: session.sets.map<WorkoutSet>((s) => ({
        id: s.id,
        exerciseId: s.exerciseId,
        weightKg: s.weightKg,
        reps: s.reps,
        timestampMs: s.timestampMs,
      })),

      routineId: plan?.routineId,
      routineName: plan?.routineName,
      planId: plan?.id,
      plannedExercises: plan?.exercises?.map((e) => ({
        exerciseId: e.exerciseId,
        targetSets: e.targetSets,
        targetRepsMin: e.targetRepsMin,
        targetRepsMax: e.targetRepsMax,
      })),
      completionPct,
    };

    addWorkoutSession(sessionObj);

    const grouped = groupSetsByExercise(session.sets);
    const all: Cue[] = [];

    for (const [exerciseId, exerciseSets] of Object.entries(grouped)) {
      const cueEvents = generateCuesForExerciseSession({
        exerciseId,
        sets: exerciseSets,
        unit,
        previous: { bestE1RMKg: 0, bestRepsAtWeight: {} },
      });

      const name = exerciseName(exerciseId);
      all.push({ message: `— ${name} —`, intensity: "low" });
      all.push(...cueEvents);
    }

    if (all.length === 0) all.push({ message: "No working sets logged yet.", intensity: "low" });
    setRecapCues(all);

    showInstantCue({
      message: "Workout saved.",
      detail:
        completionPct == null
          ? `Duration: ${formatDuration(end - start)}`
          : `Duration: ${formatDuration(end - start)} • ${Math.round(completionPct * 100)}%`,
      intensity: "low",
    });
    hapticFallback();
    soundFallback();

    setCurrentPlan(null);
  };

  const reset = () => {
    session.resetSession();
    setExerciseBlocks(planMode ? plannedExerciseIds.slice() : []);
    setFocusMode(false);
    setRecapCues([]);
    setInstantCue(null);
    setSessionStateByExercise({});
    setFallbackCountdownByExercise({});
    setWorkoutStartedAt(null);
    setRestVisible(false);
  };

  // Exercise picker: in planMode only allow choosing within plan (v1)
  const allowedExerciseIds = planMode ? plannedExerciseIds : undefined;

  if (pickerMode) {
    return (
      <ExercisePicker
        visible
        allowedExerciseIds={allowedExerciseIds}
        selectedExerciseId={selectedExerciseId}
        onSelect={(id) => {
          if (pickerMode === "changeSelected") {
            setSelectedExerciseId(id);
          } else if (pickerMode === "addBlock") {
            setExerciseBlocks((prev) => (prev.includes(id) ? prev : [...prev, id]));
            setSelectedExerciseId(id);
          }
          setPickerMode(null);
        }}
        onBack={() => setPickerMode(null)}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <InstantCueToast cue={instantCue} onClear={() => setInstantCue(null)} randomHoldMs={randomHoldMs} />

      <RestTimerOverlay
        visible={restVisible}
        initialSeconds={90}
        onClose={() => setRestVisible(false)}
        onDone={onRestTimerDoneFeedback}
      />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 140 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: c.text }}>Live Workout</Text>
          <Text style={{ color: c.muted, fontWeight: "800" }}>{`⏱ ${workoutElapsedLabel}`}</Text>
        </View>

        <PlanHeaderCard
          header={planHeader}
          planExercises={plan?.exercises ?? []}
          currentExerciseIndex={plan?.currentExerciseIndex ?? 0}
          completedSetsByExerciseId={plan?.completedSetsByExerciseId ?? {}}
          onJumpToIndex={jumpToPlanIndex}
          onNext={advanceToNextPlannedExercise}
          visible={planMode && !!plan}
        />

        {/* Blocks header controls */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => setPickerMode("addBlock")}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900" }}>Add Exercise</Text>
          </Pressable>

          <Pressable
            onPress={() => setFocusMode((v) => !v)}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: focusMode ? c.bg : c.card,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900" }}>{focusMode ? "Focus ✓" : "Focus"}</Text>
          </Pressable>

          <Pressable
            onPress={() => setPickerMode("changeSelected")}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900" }}>Pick</Text>
          </Pressable>
        </View>

        {/* Exercise Blocks v1 (main UX) */}
        <ExerciseBlocksCard
          exerciseIds={exerciseBlocks}
          sets={session.sets}
          onAddSetForExercise={addSetForExercise}
          onJumpToExercise={(id) => setSelectedExerciseId(id)}
          focusMode={focusMode}
          focusedExerciseId={selectedExerciseId}
          isDone={session.isDone}
          toggleDone={session.toggleDone}
          setWeightForSet={session.setWeightForSet}
          setRepsForSet={session.setRepsForSet}
          kgToLb={session.kgToLb}
          estimateE1RMLb={session.estimateE1RMLb}
        />

        {/* Quick Add stays (fast/global) */}
        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 12,
            padding: 12,
            backgroundColor: c.card,
            gap: 8,
          }}
        >
          <Text style={{ color: c.muted }}>Selected Exercise (Quick Add)</Text>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: "800" }}>{selectedExerciseName}</Text>
          <Button title="Change Selected Exercise" onPress={() => setPickerMode("changeSelected")} />
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

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button title="Finish Workout" onPress={finishWorkout} flex />

          <Pressable
            onPress={saveAsRoutine}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              alignItems: "center",
              justifyContent: "center",
              opacity: session.sets.length === 0 ? 0.5 : 1,
            }}
            disabled={session.sets.length === 0}
          >
            <Text style={{ color: c.text, fontWeight: "700" }}>Save as Routine</Text>
          </Pressable>

          <Pressable
            onPress={reset}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: c.text }}>Reset</Text>
          </Pressable>
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 12,
            padding: 12,
            gap: 6,
            backgroundColor: c.card,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: c.text }}>Recap Cues</Text>
          {recapCues.length === 0 ? (
            <Text style={{ opacity: 0.8, color: c.muted }}>Tap Finish Workout to generate recap cues.</Text>
          ) : (
            recapCues.map((cue, idx) => (
              <Text key={idx} style={{ color: c.text, fontWeight: cue.intensity === "high" ? "700" : "400" }}>
                • {cue.message}
              </Text>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
