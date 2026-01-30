import { useCallback, useState } from "react";
import type { LoggedSet } from "../loggerTypes";
import type { Cue, ExerciseSessionState, InstantCue, DetectCueResult, DetectCueMeta } from "../perSetCue";
import type { CelebrationSelectorParams } from "../celebration";
import {
  detectCueForWorkingSet,
  makeEmptyExerciseState,
  pickPunchyVariant,
  randomFallbackCue,
  randomFallbackEveryN,
} from "../perSetCue";
import { generateCuesForExerciseSession, groupSetsByExercise } from "../simpleSession";
import type { UnitSystem } from "../buckets";
import { lbToKg } from "../units";
import { EXERCISES_V1 } from "../../data/exercises";
import type { WorkoutPlan } from "../workoutPlanModel";
import { formatDuration, uid as uid2, type WorkoutSession, type WorkoutSet } from "../workoutModel";
import { setCurrentPlan } from "../workoutPlanStore";
import { uid as routineUid, type Routine, type RoutineExercise } from "../routinesModel";
// [MIGRATED 2026-01-23] Using Zustand stores
import { addWorkoutSession, clearCurrentSession, ensureCurrentSession, useCurrentSession, useIsHydrated, upsertRoutine, useUser } from "../stores";
// Gamification integration
import { toWorkoutForCalculation } from "../hooks/useGamificationWorkoutFinish";
import { useGamificationStore, processGamificationWorkout } from "../stores/gamificationStore";
// AI Gym Buddy integration
import type { CueMessage } from "../buddyTypes";
import { evaluateSetTriggers, evaluateSessionTriggers, formatCueMessage } from "../buddyEngine";
import { useBuddyStore } from "../stores/buddyStore";

function exerciseName(exerciseId: string) {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

export interface WorkoutOrchestratorOptions {
  plan?: WorkoutPlan | null;
  unit?: UnitSystem;
  onHaptic?: (type: 'light' | 'pr') => void;
  onSound?: (type: 'light' | 'pr') => void;
  onWorkoutFinished?: (sessionId: string) => void;
  onPRCelebration?: (params: CelebrationSelectorParams) => void;
}

export interface WorkoutOrchestratorResult {
  // State
  instantCue: InstantCue | null;
  buddyMessage: CueMessage | null;
  recapCues: Cue[];
  sessionStateByExercise: Record<string, ExerciseSessionState>;

  // Actions
  addSetForExercise: (exerciseId: string, weightLb: number, reps: number) => void;
  finishWorkout: () => void;
  saveAsRoutine: (exerciseBlocks: string[], sets: LoggedSet[]) => void;
  reset: (plannedExerciseIds: string[]) => void;
  clearInstantCue: () => void;
  clearBuddyMessage: () => void;

  // Utilities
  ensureExerciseState: (exerciseId: string) => ExerciseSessionState;
}

export function useWorkoutOrchestrator(options: WorkoutOrchestratorOptions): WorkoutOrchestratorResult {
  const { plan, unit = 'lb', onHaptic, onSound, onWorkoutFinished, onPRCelebration } = options;

  const [instantCue, setInstantCue] = useState<InstantCue | null>(null);
  const [buddyMessage, setBuddyMessage] = useState<CueMessage | null>(null);
  const [recapCues, setRecapCues] = useState<Cue[]>([]);
  const [sessionStateByExercise, setSessionStateByExercise] = useState<Record<string, ExerciseSessionState>>({});
  const [fallbackCountdownByExercise, setFallbackCountdownByExercise] = useState<Record<string, number>>({});

  // Hydration gate: wait for store to hydrate before accessing session
  // IMPORTANT: All hooks must be called before any conditional returns (Rules of Hooks)
  const hydrated = useIsHydrated();
  const persisted = useCurrentSession();
  const user = useUser();

  // Define all callback hooks BEFORE the early return to satisfy Rules of Hooks
  const ensureExerciseState = useCallback((exerciseId: string): ExerciseSessionState => {
    const existing = sessionStateByExercise[exerciseId];
    if (existing) return existing;

    const next = makeEmptyExerciseState();
    setSessionStateByExercise((prev) => ({ ...prev, [exerciseId]: next }));
    return next;
  }, [sessionStateByExercise]);

  const ensureCountdown = useCallback((exerciseId: string): number => {
    const v = fallbackCountdownByExercise[exerciseId];
    if (typeof v === "number") return v;

    const next = randomFallbackEveryN();
    setFallbackCountdownByExercise((prev) => ({ ...prev, [exerciseId]: next }));
    return next;
  }, [fallbackCountdownByExercise]);

  const addSetForExercise = useCallback((exerciseId: string, weightLb: number, reps: number) => {
    // Before hydration, actions are no-ops
    if (!hydrated) return;

    const wKg = lbToKg(weightLb);
    const prev = ensureExerciseState(exerciseId);

    const res: DetectCueResult = detectCueForWorkingSet({
      weightKg: wKg,
      reps,
      unit,
      exerciseName: exerciseName(exerciseId),
      prev,
    });

    const cue = res.cue;
    const nextState = res.next;
    const meta = res.meta;

    // Get current set count for trigger evaluation
    const currentSetCount = Object.values(sessionStateByExercise).reduce(
      (total, state) => total + Object.keys(state.bestRepsAtWeight).length, 0
    );

    // Evaluate buddy triggers
    const buddyCue = evaluateSetTriggers({
      weightKg: wKg,
      reps,
      unit,
      exerciseName: exerciseName(exerciseId),
      prev,
      setCue: res,
      setIndex: currentSetCount,
      totalSets: currentSetCount + 1,
    });

    // Record the set in buddy store session memory
    useBuddyStore.getState().recordSet();

    if (buddyCue) {
      setBuddyMessage(buddyCue);
      // Also show the formatted buddy message as instant cue for backward compatibility
      const formatted = formatCueMessage(buddyCue);
      setInstantCue({
        message: formatted.title,
        detail: formatted.detail,
        intensity: buddyCue.intensity === "epic" ? "high" : buddyCue.intensity
      });

      // Trigger haptics/sound for buddy messages
      if (buddyCue.intensity === "high" || buddyCue.intensity === "epic") {
        onHaptic?.('pr');
        onSound?.('pr');
      } else {
        onHaptic?.('light');
        onSound?.('light');
      }
    } else if (cue) {
      // PR detected!
      setSessionStateByExercise((p) => ({ ...p, [exerciseId]: nextState }));

      const t: "weight" | "rep" | "e1rm" =
        meta.type === "rep" ? "rep" : meta.type === "e1rm" ? "e1rm" : "weight";

      const title = pickPunchyVariant(t);
      const detail = meta.weightLabel;

      setInstantCue({ message: title, detail, intensity: "high" });
      onHaptic?.('pr');
      onSound?.('pr');

      // Award Forge Tokens for PR
      const { calculatePRReward } = require("../gamification");
      const { addGamificationTokens } = require("../stores/gamificationStore");
      const tier = meta.tier as number | undefined;
      const reward = calculatePRReward(t, tier);
      addGamificationTokens(reward.amount);

      // Trigger PR celebration callback
      onPRCelebration?.({
        prType: meta.type,
        deltaLb: meta.weightDeltaLb || meta.e1rmDeltaLb || meta.repDeltaAtWeight,
        exerciseName: exerciseName(exerciseId),
        weightLabel: meta.weightLabel,
        reps,
      });
    } else {
      // No PR - check fallback cue
      const current = ensureCountdown(exerciseId);
      if (current <= 1) {
        const fallbackCue = randomFallbackCue();
        setInstantCue({ message: fallbackCue.message, intensity: fallbackCue.intensity === "med" ? "high" : fallbackCue.intensity });
        onHaptic?.('light');
        onSound?.('light');
        setFallbackCountdownByExercise((p) => ({ ...p, [exerciseId]: randomFallbackEveryN() }));
      } else {
        setFallbackCountdownByExercise((p) => ({ ...p, [exerciseId]: current - 1 }));
      }
    }
  }, [hydrated, ensureExerciseState, ensureCountdown, sessionStateByExercise, unit, onHaptic, onSound]);

  const finishWorkout = useCallback(() => {
    // Before hydration, actions are no-ops
    if (!hydrated) return;

    const now = Date.now();
    const persistedState = persisted;
    const start = persistedState?.startedAtMs ?? now;
    const sets: LoggedSet[] = persistedState?.sets ?? [];

    const sessionObj: WorkoutSession = {
      id: uid2(),
      userId: user?.id ?? 'anonymous',
      startedAtMs: start,
      endedAtMs: now,
      sets: sets.map(
        (s): WorkoutSet => ({
          id: s.id ?? uid2(),
          exerciseId: s.exerciseId,
          weightKg: typeof s.weightKg === "number" ? s.weightKg : lbToKg(typeof s.weightLb === "number" ? s.weightLb : 0),
          reps: typeof s.reps === "number" ? s.reps : 0,
          timestampMs:
            typeof s.timestampMs === "number"
              ? s.timestampMs
              : typeof s.createdAtMs === "number"
                ? s.createdAtMs
                : now,
        })
      ),
      routineId: plan?.routineId,
      routineName: plan?.routineName,
      planId: plan?.id,
      plannedExercises: plan?.exercises?.map((e) => ({
        exerciseId: e.exerciseId,
        targetSets: e.targetSets,
        targetRepsMin: e.targetRepsMin,
        targetRepsMax: e.targetRepsMax,
      })),
      completionPct: undefined,
    };

    addWorkoutSession(sessionObj);

    // Process gamification after workout is saved
    const currentStreak = useGamificationStore.getState().profile.currentStreak;
    const workoutForGamification = toWorkoutForCalculation(
      sessionObj.sets,
      currentStreak,
      plan?.completionPct === 100
    );
    processGamificationWorkout(workoutForGamification);

    // Generate recap cues
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

    if (all.length === 0) {
      all.push({ message: "No working sets logged yet.", intensity: "low" });
    }

    setRecapCues(all);

    // Calculate total volume in kg
    const volumeKg = sessionObj.sets.reduce((total, set) => {
      return total + (set.weightKg * set.reps);
    }, 0);

    // Check for rank progress (this would need to be implemented based on actual rank calculation)
    // For now, we'll pass null and can enhance this later with actual rank detection
    const rankProgress = null;

    // Evaluate session completion triggers
    const sessionCue = evaluateSessionTriggers({
      session: sessionObj,
      volumeKg,
      rankProgress
    });

    if (sessionCue) {
      // Set the session cue as the final message
      const formatted = formatCueMessage(sessionCue);
      setInstantCue({
        message: formatted.title,
        detail: formatted.detail,
        intensity: sessionCue.intensity === "epic" ? "high" : sessionCue.intensity
      });

      // Also set as buddy message for full experience
      setBuddyMessage(sessionCue);
    } else {
      setInstantCue({
        message: "Workout saved.",
        detail: `Duration: ${formatDuration(now - start)}`,
        intensity: "low"
      });
    }

    onHaptic?.('light');
    onSound?.('light');

    clearCurrentSession();
    setCurrentPlan(null);

    // Notify that workout is finished with session ID for navigation
    onWorkoutFinished?.(sessionObj.id);
  }, [hydrated, persisted, plan, unit, onHaptic, onSound, onWorkoutFinished, user]);

  const saveAsRoutine = useCallback((exerciseBlocks: string[], sets: LoggedSet[]) => {
    // Before hydration, actions are no-ops
    if (!hydrated) return;

    const now = Date.now();

    if (!sets.length) {
      setInstantCue({
        message: "No sets yet.",
        detail: "Log at least one set first.",
        intensity: "low"
      });
      onHaptic?.('light');
      onSound?.('light');
      return;
    }

    const orderedExerciseIds = exerciseBlocks.length > 0
      ? exerciseBlocks.slice()
      : (() => {
          const seen = new Set<string>();
          const ordered: string[] = [];
          for (const s of sets) {
            if (!seen.has(s.exerciseId)) {
              seen.add(s.exerciseId);
              ordered.push(s.exerciseId);
            }
          }
          return ordered;
        })();

    const exercises = orderedExerciseIds.map((exerciseId): RoutineExercise => ({
      id: routineUid(),
      exerciseId,
      targetSets: 3,
      targetRepsMin: 6,
      targetRepsMax: 12,
    }));

    const makeRoutineNameNow = (): string => {
      const d = new Date();
      const date = d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
      const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      return `Workout • ${date} ${time}`;
    };

    const routine: Routine = {
      id: routineUid(),
      name: plan?.routineName ? `${plan.routineName} (Saved Copy)` : makeRoutineNameNow(),
      createdAtMs: now,
      updatedAtMs: now,
      exercises,
    };

    upsertRoutine(routine);

    setInstantCue({
      message: "Routine saved.",
      detail: `${routine.exercises.length} exercises`,
      intensity: "low"
    });

    onHaptic?.('light');
    onSound?.('light');
  }, [hydrated, plan, onHaptic, onSound]);

  const reset = useCallback((plannedExerciseIds: string[]) => {
    // Before hydration, actions are no-ops
    if (!hydrated) return;

    clearCurrentSession();

    const first = plannedExerciseIds[0] ?? EXERCISES_V1[0]?.id ?? "unknown";
    ensureCurrentSession({
      selectedExerciseId: first,
      exerciseBlocks: first ? [first] : []
    });

    setRecapCues([]);
    setInstantCue(null);
    setBuddyMessage(null);
    setSessionStateByExercise({});
    setFallbackCountdownByExercise({});
  }, [hydrated]);

  const clearInstantCue = useCallback(() => {
    setInstantCue(null);
  }, []);

  const clearBuddyMessage = useCallback(() => {
    setBuddyMessage(null);
  }, []);

  // Return early with loading state if not yet hydrated
  // This prevents UI from rendering with stale/missing persisted data
  // All hooks have already been called above, so this is safe
  if (!hydrated) {
    return {
      instantCue: null,
      buddyMessage: null,
      recapCues: [],
      sessionStateByExercise: {},
      addSetForExercise,
      finishWorkout,
      saveAsRoutine,
      reset,
      clearInstantCue,
      clearBuddyMessage,
      ensureExerciseState,
    };
  }

  // Return the result when hydrated
  return {
    instantCue,
    buddyMessage,
    recapCues,
    sessionStateByExercise,
    addSetForExercise,
    finishWorkout,
    saveAsRoutine,
    reset,
    clearInstantCue,
    clearBuddyMessage,
    ensureExerciseState,
  };
}
