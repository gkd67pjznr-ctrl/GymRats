import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, FlatList, ScrollView, Animated, Easing } from "react-native";
import { useThemeColors } from "../src/ui/theme";

import { lbToKg, kgToLb } from "../src/lib/units";
import type { UnitSystem } from "../src/lib/buckets";
import type { LoggedSet } from "../src/lib/loggerTypes";
import { groupSetsByExercise, generateCuesForExerciseSession } from "../src/lib/simpleSession";
import { EXERCISES_V1 } from "../src/data/exercises";

import {
  type Cue,
  type ExerciseSessionState,
  makeEmptyExerciseState,
  detectCueForWorkingSet,
  randomFallbackCue,
  randomFallbackDurationMs,
  randomHighlightDurationMs,
  randomFallbackEveryN,
  pickPunchyVariant,
} from "../src/lib/perSetCue";

import { getSettings } from "../src/lib/settings";
import { RestTimerOverlay } from "../src/ui/components/RestTimerOverlay";
import { addWorkoutSession } from "../src/lib/workoutStore";
import { uid as uid2, formatDuration, type WorkoutSession, type WorkoutSet } from "../src/lib/workoutModel";

function uid() {
  return Math.random().toString(16).slice(2);
}

// Optional runtime requires (no-op if not installed)
let Haptics: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Haptics = require("expo-haptics");
} catch {
  Haptics = null;
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

  const [selectedExerciseId, setSelectedExerciseId] = useState(EXERCISES_V1[0].id);
  const [isPickingExercise, setIsPickingExercise] = useState(false);

  const [weightLb, setWeightLb] = useState(135);
  const [reps, setReps] = useState(8);

  const [sets, setSets] = useState<LoggedSet[]>([]);
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

  const selectedExerciseName =
    EXERCISES_V1.find((e) => e.id === selectedExerciseId)?.name ?? selectedExerciseId;

  const displayWeight = useMemo(() => `${weightLb.toFixed(1)} lb`, [weightLb]);

  const setsForSelectedExercise = useMemo(() => {
    return sets
      .filter((s) => s.exerciseId === selectedExerciseId)
      .sort((a, b) => a.timestampMs - b.timestampMs);
  }, [sets, selectedExerciseId]);

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

    // show rest overlay after set
    setRestVisible(true);

    const prevState = sessionStateByExercise[selectedExerciseId] ?? makeEmptyExerciseState();

    const result = detectCueForWorkingSet({
      weightKg: next.weightKg,
      reps: next.reps,
      unit,
      exerciseName: selectedExerciseName,
      prev: prevState,
    });

    setSessionStateByExercise((prev) => ({ ...prev, [selectedExerciseId]: result.next }));

    // Cardio behaves like fallback
    if (result.meta.type === "cardio" && result.cue) {
      showInstantCue(result.cue);
      hapticFallback();
      soundFallback();
      return;
    }

    // PR: show always
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

    // No PR: show fallback only every 2–4 such sets
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

  const finishWorkout = () => {
    const end = Date.now();
    const start = workoutStartedAt ?? (sets[0]?.timestampMs ?? end);

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

      const name = EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
      all.push({ message: `— ${name} —`, intensity: "low" });
      all.push(...cueEvents);
    }

    if (all.length === 0) all.push({ message: "No working sets logged yet.", intensity: "low" });
    setRecapCues(all);

    showInstantCue({ message: "Workout saved.", detail: `Duration: ${formatDuration(end - start)}`, intensity: "low" });
    hapticFallback();
    soundFallback();
  };

  const reset = () => {
    setSets([]);
    setRecapCues([]);
    setInstantCue(null);
    setSessionStateByExercise({});
    setFallbackCountdownByExercise({});
    setWorkoutStartedAt(null);
    setRestVisible(false);
    if (cueTimerRef.current) clearTimeout(cueTimerRef.current);
    cueTimerRef.current = null;
  };

  if (isPickingExercise) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: c.text }}>Pick Exercise</Text>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, overflow: "hidden" }}>
          <FlatList
            data={EXERCISES_V1}
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
          <Text style={{ color: c.text, fontSize: toastFontSize, fontWeight: instantCue.intensity === "high" ? "800" : "700" }}>
            {instantCue.message}
          </Text>
          {!!instantCue.detail && <Text style={{ color: c.muted, marginTop: 6, fontSize: 13 }}>{instantCue.detail}</Text>}
        </Animated.View>
      )}

      <RestTimerOverlay visible={restVisible} initialSeconds={90} onClose={() => setRestVisible(false)} />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: c.text }}>Live Workout</Text>
          <Text style={{ color: c.muted, fontWeight: "800" }}>⏱ {workoutElapsedLabel}</Text>
        </View>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, backgroundColor: c.card, gap: 8 }}>
          <Text style={{ color: c.muted }}>Selected Exercise</Text>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: "800" }}>{selectedExerciseName}</Text>
          <Button title="Change Exercise" onPress={() => setIsPickingExercise(true)} />
        </View>

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, gap: 10, backgroundColor: c.card }}>
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

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button title="Finish Workout" onPress={finishWorkout} flex />
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

        <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, gap: 6, backgroundColor: c.card }}>
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
