import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, FlatList, Pressable, ScrollView, Text, TextInput, View } from "react-native";
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

import { type Routine, type RoutineExercise, uid as routineUid } from "../src/lib/routinesModel";
import { upsertRoutine } from "../src/lib/routinesStore";
import { getSettings } from "../src/lib/settings";
import { formatDuration, uid as uid2, type WorkoutSession, type WorkoutSet } from "../src/lib/workoutModel";
import { setCurrentPlan, updateCurrentPlan, useCurrentPlan } from "../src/lib/workoutPlanStore";
import { clampPlanIndex, completionPct as planCompletionPct } from "../src/lib/workoutPlanUtils";
import { addWorkoutSession } from "../src/lib/workoutStore";
import { RestTimerOverlay } from "../src/ui/components/RestTimerOverlay";

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

  // haptic feedback
  if (s.hapticsEnabled && Haptics) {
    Haptics.notificationAsync?.(
      Haptics.NotificationFeedbackType.Success
    ).catch?.(() => {});
  }

  // audio feedback
  if (s.soundsEnabled && Speech) {
    Speech.stop?.();
    Speech.speak?.("Rest over.", {
      rate: 1.05,
      pitch: 1.1,
    });
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

// Sound placeholder (we’ll wire expo-av + actual sounds later)
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
  const [isPickingExercise, setIsPickingExercise] = useState(false);

  // sync selection to current plan exercise
  useEffect(() => {
    if (planMode && currentPlannedExerciseId) setSelectedExerciseId(currentPlannedExerciseId);
  }, [planMode, currentPlannedExerciseId]);

  const [weightLb, setWeightLb] = useState(135);
  const [reps, setReps] = useState(8);

  const [sets, setSets] = useState<LoggedSet[]>([]);
    // Per-set lock state (Done = locked)
  const [doneBySetId, setDoneBySetId] = useState<Record<string, boolean>>({});

  function isDone(setId: string): boolean {
    return !!doneBySetId[setId];
  }

  function toggleDone(setId: string) {
    setDoneBySetId((prev) => ({ ...prev, [setId]: !prev[setId] }));
  }

  function kgToLb(kg: number): number {
    return kg * 2.2046226218;
  }

  function estimateE1RMLb(weightLb: number, reps: number): number {
    // Epley: 1RM = w * (1 + reps/30)
    if (!weightLb || reps <= 0) return 0;
    return weightLb * (1 + reps / 30);
  }

  function updateSet(setId: string, patch: Partial<LoggedSet>) {
    setSets((prev) => prev.map((s) => (s.id === setId ? { ...s, ...patch } : s)));
  }

  function setWeightForSet(setId: string, text: string) {
    // allow "135" or "135.5"
    const parsed = Number(text);
    if (!Number.isFinite(parsed)) return;
    updateSet(setId, { weightKg: lbToKg(Math.max(0, parsed)) });
  }

  function setRepsForSet(setId: string, text: string) {
    const parsed = Math.floor(Number(text));
    if (!Number.isFinite(parsed)) return;
    updateSet(setId, { reps: Math.max(0, parsed) });
  }

  const [recapCues, setRecapCues] = useState<Cue[]>([]);
  const [instantCue, setInstantCue] = useState<Cue | null>(null);

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

  const cueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-18)).current;

  const selectedExerciseName = exerciseName(selectedExerciseId);
  const displayWeight = useMemo(() => `${weightLb.toFixed(1)} lb`, [weightLb]);

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

  function showInstantCue(cue: Cue) {
    setInstantCue(cue);

    if (cueTimerRef.current) clearTimeout(cueTimerRef.current);

    toastOpacity.setValue(0);
    toastTranslateY.setValue(-18);

    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const isHighlight = cue.intensity !== "low";
    const holdMs = isHighlight ? randomHighlightDurationMs() : randomFallbackDurationMs();

    cueTimerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: -10,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setInstantCue(null);
      });

      cueTimerRef.current = null;
    }, holdMs);
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

  const addSet = () => {
    const now = Date.now();
    if (!workoutStartedAt) setWorkoutStartedAt(now);

    const next: LoggedSet = {
      id: uid(),
      exerciseId: selectedExerciseId,
      setType: "working",
      weightKg: lbToKg(weightLb),
      reps,
      timestampMs: now,
    };

    setSets((prev) => [...prev, next]);
    setRestVisible(true);

    // plan progress only counts if it's the CURRENT planned exercise
    if (planMode && plan && selectedExerciseId === currentPlannedExerciseId) {
      updateCurrentPlan((p) => {
        const cur = p.exercises[p.currentExerciseIndex];
        const prevDone = p.completedSetsByExerciseId[cur.exerciseId] ?? 0;
        const nextDone = prevDone + 1;
    
        const completedSetsByExerciseId = {
          ...p.completedSetsByExerciseId,
          [cur.exerciseId]: nextDone,
        };
    
        const shouldAdvance =
          nextDone >= cur.targetSets &&
          p.currentExerciseIndex < p.exercises.length - 1;
    
        return {
          ...p,
          completedSetsByExerciseId,
          currentExerciseIndex: shouldAdvance
            ? p.currentExerciseIndex + 1
            : p.currentExerciseIndex,
        };
      });
    }
    
    const prevState = sessionStateByExercise[selectedExerciseId] ?? makeEmptyExerciseState();

    const result = detectCueForWorkingSet({
      weightKg: next.weightKg,
      reps: next.reps,
      unit,
      exerciseName: selectedExerciseName,
      prev: prevState,
    });

    setSessionStateByExercise((prev) => ({ ...prev, [selectedExerciseId]: result.next }));

    if (result.meta.type === "cardio" && result.cue) {
      showInstantCue(result.cue);
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

    const current = ensureCountdown(selectedExerciseId);
    if (current <= 1) {
      showInstantCue(randomFallbackCue());
      hapticFallback();
      soundFallback();
      setFallbackCountdownByExercise((prev) => ({ ...prev, [selectedExerciseId]: randomFallbackEveryN() }));
    } else {
      setFallbackCountdownByExercise((prev) => ({ ...prev, [selectedExerciseId]: current - 1 }));
    }
  };

  function makeRoutineNameNow(): string {
    // Keep it simple + readable, local device timezone
    const d = new Date();
    const date = d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
    const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    return `Workout • ${date} ${time}`;
  }

  function saveAsRoutine() {
    const now = Date.now();

    if (sets.length === 0) {
      showInstantCue({ message: "No sets yet.", detail: "Log at least one set first.", intensity: "low" });
      hapticFallback();
      soundFallback();
      return;
    }

    // Preserve order of first appearance in the session
    const seen = new Set<string>();
    const orderedExerciseIds: string[] = [];
    for (const s of sets) {
      if (!seen.has(s.exerciseId)) {
        seen.add(s.exerciseId);
        orderedExerciseIds.push(s.exerciseId);
      }
    }

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
        // sensible defaults if no plan targets
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
    const start = workoutStartedAt ?? (sets[0]?.timestampMs ?? end);

    const completionPct = planMode && plan ? planCompletionPct(plan) : undefined;

    const session: WorkoutSession = {
      id: uid2(),
      startedAtMs: start,
      endedAtMs: end,
      sets: sets.map<WorkoutSet>((s) => ({
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

    addWorkoutSession(session);

    const grouped = groupSetsByExercise(sets);
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
    setSets([]);
    setDoneBySetId({});
    setRecapCues([]);
    setInstantCue(null);
    setSessionStateByExercise({});
    setFallbackCountdownByExercise({});
    setWorkoutStartedAt(null);
    setRestVisible(false);
    if (cueTimerRef.current) clearTimeout(cueTimerRef.current);
    cueTimerRef.current = null;
  };

  // Exercise picker: in planMode only allow choosing within plan (v1)
  const pickerExercises = planMode
    ? EXERCISES_V1.filter((e) => plannedExerciseIds.includes(e.id))
    : EXERCISES_V1;

  if (isPickingExercise) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: c.text }}>Pick Exercise</Text>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, overflow: "hidden" }}>
          <FlatList
            data={pickerExercises}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedExerciseId;
              return (
                <Pressable
                  onPress={() => {
                    setSelectedExerciseId(item.id);
                    setIsPickingExercise(false);
                  }}
                  style={{
                    padding: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: c.border,
                    backgroundColor: isSelected ? c.card : c.bg,
                  }}
                >
                  <Text style={{ color: c.text, fontWeight: isSelected ? "700" : "500" }}>{item.name}</Text>
                </Pressable>
              );
            }}
          />
        </View>

        <Button title="Back" onPress={() => setIsPickingExercise(false)} />
      </View>
    );
  }

  const toastFontSize = instantCue?.intensity === "low" ? 16 : 28;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {instantCue && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            zIndex: 1000,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 14,
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: c.card,
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
            shadowOpacity: 0.2,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          }}
        >
          <Text style={{ color: c.muted, marginBottom: 4, fontSize: 12 }}>Cue</Text>
          <Text
            style={{
              color: c.text,
              fontSize: toastFontSize,
              fontWeight: instantCue.intensity === "high" ? "800" : "700",
            }}
          >
            {instantCue.message}
          </Text>
          {!!instantCue.detail && (
            <Text style={{ color: c.muted, marginTop: 6, fontSize: 13 }}>{instantCue.detail}</Text>
          )}
        </Animated.View>
      )}

      <RestTimerOverlay visible={restVisible} initialSeconds={90} onClose={() => setRestVisible(false)} onDone={onRestTimerDoneFeedback} />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: c.text }}>Live Workout</Text>
          <Text style={{ color: c.muted, fontWeight: "800" }}>{`⏱ ${workoutElapsedLabel}`}</Text>
        </View>

        {!!planHeader && (
          <View
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 12,
              padding: 12,
              backgroundColor: c.card,
              gap: 6,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900" }}>{planHeader.title}</Text>
            <Text style={{ color: c.muted }}>{planHeader.subtitle}</Text>
          </View>
        )}

        {planMode && plan && (
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
            <Text style={{ color: c.text, fontWeight: "900" }}>Planned Exercises</Text>

            {plan.exercises.map((ex, idx) => {
              const done = plan.completedSetsByExerciseId[ex.exerciseId] ?? 0;
              const isCurrent = idx === plan.currentExerciseIndex;

              return (
                <Pressable
                  key={`${ex.exerciseId}-${idx}`}
                  onPress={() => jumpToPlanIndex(idx)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: c.border,
                    backgroundColor: isCurrent ? c.bg : c.card,
                    gap: 3,
                  }}
                >
                  <Text style={{ color: c.text, fontWeight: isCurrent ? "900" : "700" }}>
                    {idx + 1}. {exerciseName(ex.exerciseId)}
                  </Text>
                  <Text style={{ color: c.muted }}>
                    Sets: {done}/{ex.targetSets}{" "}
                    {ex.targetRepsMin != null && ex.targetRepsMax != null
                      ? `• ${ex.targetRepsMin}-${ex.targetRepsMax} reps`
                      : ""}
                  </Text>
                </Pressable>
              );
            })}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <Button title="Next Exercise" onPress={advanceToNextPlannedExercise} flex />
            </View>
          </View>
        )}

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
          <Text style={{ color: c.muted }}>Selected Exercise</Text>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: "800" }}>{selectedExerciseName}</Text>
          <Button title="Change Exercise" onPress={() => setIsPickingExercise(true)} />
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 12,
            padding: 12,
            gap: 10,
            backgroundColor: c.card,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: c.text }}>Quick Add Set</Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button title="- 2.5 lb" onPress={() => setWeightLb((w) => Math.max(0, w - 2.5))} flex />
            <Button title="+ 2.5 lb" onPress={() => setWeightLb((w) => w + 2.5)} flex />
          </View>

          <Text style={{ fontSize: 18, fontWeight: "700", color: c.text }}>{displayWeight}</Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button title="- 1 rep" onPress={() => setReps((r) => Math.max(0, r - 1))} flex />
            <Button title="+ 1 rep" onPress={() => setReps((r) => r + 1)} flex />
          </View>

          <Text style={{ fontSize: 18, fontWeight: "700", color: c.text }}>{reps} reps</Text>

          <Button title="Add Set" onPress={addSet} />
        </View>

                {/* Workout Log */}
        <View
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 12,
            padding: 12,
            gap: 10,
            backgroundColor: c.card,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={{ fontSize: 16, fontWeight: "900", color: c.text }}>Workout Log</Text>
            <Text style={{ color: c.muted, fontWeight: "800" }}>{sets.length} sets</Text>
          </View>

          {sets.length === 0 ? (
            <Text style={{ color: c.muted, opacity: 0.9 }}>No sets yet. Add your first set above.</Text>
          ) : (
            (() => {
              // Order exercises by first appearance
              const seen = new Set<string>();
              const orderedExerciseIds: string[] = [];
              for (const s of sets) {
                if (!seen.has(s.exerciseId)) {
                  seen.add(s.exerciseId);
                  orderedExerciseIds.push(s.exerciseId);
                }
              }

              return orderedExerciseIds.map((exerciseId) => {
                const exSets = sets.filter((s) => s.exerciseId === exerciseId);

                return (
                  <View key={exerciseId} style={{ gap: 8 }}>
                    <Text style={{ color: c.text, fontWeight: "900", marginTop: 6 }}>
                      {exerciseName(exerciseId)}
                    </Text>

                    {exSets.map((s, idx) => {
                      const weightLb = kgToLb(s.weightKg);
                      const e1rm = estimateE1RMLb(weightLb, s.reps);
                      const done = isDone(s.id);

                      return (
                        <View
                          key={s.id}
                          style={{
                            borderWidth: 1,
                            borderColor: c.border,
                            borderRadius: 12,
                            padding: 10,
                            backgroundColor: done ? c.bg : c.card,
                            gap: 8,
                          }}
                        >
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={{ color: c.muted, fontWeight: "800" }}>Set {idx + 1}</Text>

                            <Pressable
                              onPress={() => toggleDone(s.id)}
                              style={{
                                paddingVertical: 6,
                                paddingHorizontal: 10,
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: c.border,
                                backgroundColor: done ? c.card : c.bg,
                              }}
                            >
                              <Text style={{ color: c.text, fontWeight: "900" }}>{done ? "Done ✓" : "Mark Done"}</Text>
                            </Pressable>
                          </View>

                          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                            {/* Weight */}
                            <View style={{ flex: 1, gap: 4 }}>
                              <Text style={{ color: c.muted, fontSize: 12 }}>Weight (lb)</Text>
                              {done ? (
                                <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>
                                  {weightLb.toFixed(1)}
                                </Text>
                              ) : (
                                <TextInput
                                  defaultValue={weightLb.toFixed(1)}
                                  keyboardType="decimal-pad"
                                  onChangeText={(t) => setWeightForSet(s.id, t)}
                                  style={{
                                    borderWidth: 1,
                                    borderColor: c.border,
                                    borderRadius: 10,
                                    paddingVertical: 10,
                                    paddingHorizontal: 10,
                                    color: c.text,
                                    backgroundColor: c.bg,
                                    fontWeight: "900",
                                  }}
                                />
                              )}
                            </View>

                            {/* Reps */}
                            <View style={{ width: 90, gap: 4 }}>
                              <Text style={{ color: c.muted, fontSize: 12 }}>Reps</Text>
                              {done ? (
                                <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>{s.reps}</Text>
                              ) : (
                                <TextInput
                                  defaultValue={String(s.reps)}
                                  keyboardType="number-pad"
                                  onChangeText={(t) => setRepsForSet(s.id, t)}
                                  style={{
                                    borderWidth: 1,
                                    borderColor: c.border,
                                    borderRadius: 10,
                                    paddingVertical: 10,
                                    paddingHorizontal: 10,
                                    color: c.text,
                                    backgroundColor: c.bg,
                                    fontWeight: "900",
                                  }}
                                />
                              )}
                            </View>

                            {/* e1RM */}
                            <View style={{ width: 90, alignItems: "flex-end", gap: 4 }}>
                              <Text style={{ color: c.muted, fontSize: 12 }}>e1RM</Text>
                              <Text style={{ color: c.text, fontWeight: "900" }}>
                                {e1rm > 0 ? `${Math.round(e1rm)}` : "—"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              });
            })()
          )}
        </View>


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
              opacity: sets.length === 0 ? 0.5 : 1,
            }}
            disabled={sets.length === 0}
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
              <Text
                key={idx}
                style={{ color: c.text, fontWeight: cue.intensity === "high" ? "700" : "400" }}
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
