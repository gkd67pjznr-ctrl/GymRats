import { useCallback, useMemo, useRef, useState } from "react";
import type { LoggedSet, SetType } from "../loggerTypes";
import { lbToKg, kgToLb } from "../units";
import { validateWeight, validateReps } from "../validators/workout";
import { uid } from "../uid";
import { estimate1RM_Epley } from "../e1rm";
import { getLastSetForExercise } from '../stores/workoutStore';

type Defaults = { weightLb: number; reps: number };

// TAG-SPEC-003-INTEGRATION-validation-callbacks-type
/**
 * Validation feedback callbacks for toast notifications
 * Optional - if not provided, validation errors will be logged to console only
 */
export type ValidationCallbacks = {
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
  onDismiss?: () => void;
};

export type UseLiveWorkoutSessionResult = {
  // session data
  sets: LoggedSet[];
  setSets: React.Dispatch<React.SetStateAction<LoggedSet[]>>;

  // per-set locking
  doneBySetId: Record<string, boolean>;
  isDone: (setId: string) => boolean;
  toggleDone: (setId: string) => void;

  // quick add controls (current inputs)
  weightLb: number;
  reps: number;
  weightLbText: string;
  repsText: string;
  weightStep: number; // Current weight increment step

  onWeightText: (t: string) => void;
  onRepsText: (t: string) => void;
  onWeightCommit: () => void;
  onRepsCommit: () => void;
  onWeightStepChange: (step: number) => void;

  decWeight: () => void;
  incWeight: () => void;
  decReps: () => void;
  incReps: () => void;

  // edit existing set rows
  setWeightForSet: (setId: string, text: string) => void;
  setRepsForSet: (setId: string, text: string) => void;
  incrementWeightForSet: (setId: string) => void;
  decrementWeightForSet: (setId: string) => void;
  incrementRepsForSet: (setId: string) => void;
  decrementRepsForSet: (setId: string) => void;

  // "same as previous" helpers for exercise blocks
  getLastSetForExercise: (exerciseId: string) => LoggedSet | null;
  copyFromLastSet: (exerciseId: string, setId: string) => void;

  // helpers
  kgToLb: (kg: number) => number;
  estimateE1RMLb: (weightLb: number, reps: number) => number;

  // per-exercise "last used"
  getDefaultsForExercise: (exerciseId: string) => Defaults;
  setDefaultsForExercise: (exerciseId: string, d: Defaults) => void;
  syncQuickAddToExercise: (exerciseId: string) => void;

  // add set (main action)
  addSet: (exerciseId: string, setType?: SetType) => { weightLb: number; reps: number; set: LoggedSet };

  // delete set
  deleteSet: (setId: string) => void;

  // reset
  resetSession: () => void;
};

export function useLiveWorkoutSession(
  initial?: { weightLb?: number; reps?: number },
  callbacks?: ValidationCallbacks
): UseLiveWorkoutSessionResult {
  const startWeight = initial?.weightLb ?? 135;
  const startReps = initial?.reps ?? 8;

  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [doneBySetId, setDoneBySetId] = useState<Record<string, boolean>>({});

  // global quick-add inputs
  const [weightLb, setWeightLb] = useState(startWeight);
  const [reps, setReps] = useState(startReps);
  const [weightLbText, setWeightLbText] = useState(String(startWeight));
  const [repsText, setRepsText] = useState(String(startReps));
  const [weightStep, setWeightStep] = useState(2.5); // Default 2.5 lb increments

  // Refs to track latest text values for commit handlers (avoids stale closures
  // when changeText + blur fire in the same React batch)
  const weightLbTextRef = useRef(String(startWeight));
  const repsTextRef = useRef(String(startReps));

  // per-exercise defaults (last-used)
  const [defaultsByExerciseId, setDefaultsByExerciseId] = useState<Record<string, Defaults>>({});

  const isDone = useCallback((setId: string) => !!doneBySetId[setId], [doneBySetId]);

  const toggleDone = useCallback((setId: string) => {
    setDoneBySetId((prev) => ({ ...prev, [setId]: !prev[setId] }));
  }, []);

  // [FIX 2026-01-23] Use canonical implementations from units.ts and e1rm.ts
  const kgToLbFn = useCallback((kg: number) => kgToLb(kg), []);
  // E1RM in lb: convert to kg, use canonical Epley, convert back
  const estimateE1RMLb = useCallback((wLb: number, r: number) => {
    if (!wLb || r <= 0) return 0;
    const e1rmKg = estimate1RM_Epley(lbToKg(wLb), r);
    return kgToLb(e1rmKg);
  }, []);

  const updateSet = useCallback((setId: string, patch: Partial<LoggedSet>) => {
    setSets((prev) => prev.map((s) => (s.id === setId ? { ...s, ...patch } : s)));
  }, []);

  // TAG-SPEC-003-INTEGRATION-set-weight-validation
  const setWeightForSet = useCallback(
    (setId: string, text: string) => {
      const result = validateWeight(text);

      if (!result.valid) {
        callbacks?.onError?.(result.error ?? "Invalid weight");
        return;
      }

      if (result.value !== undefined) {
        updateSet(setId, { weightKg: lbToKg(result.value) });
      }
    },
    [updateSet, callbacks]
  );

  // TAG-SPEC-003-INTEGRATION-set-reps-validation
  const setRepsForSet = useCallback(
    (setId: string, text: string) => {
      const result = validateReps(text);

      if (!result.valid) {
        callbacks?.onError?.(result.error ?? "Invalid reps");
        return;
      }

      if (result.value !== undefined) {
        updateSet(setId, { reps: result.value });
      }
    },
    [updateSet, callbacks]
  );

  // Smart weight increment: 2.5lb for lighter weights, 5lb for heavier
  const getSmartWeightStep = useCallback((weightLb: number): number => {
    return weightLb >= 200 ? 5 : 2.5;
  }, []);

  // Increment/decrement weight for a specific set
  const incrementWeightForSet = useCallback((setId: string) => {
    setSets((prev) => prev.map((s) => {
      if (s.id === setId) {
        const wLb = kgToLb(s.weightKg);
        const step = getSmartWeightStep(wLb);
        const next = Math.min(2000, wLb + step);
        return { ...s, weightKg: lbToKg(next) };
      }
      return s;
    }));
  }, [getSmartWeightStep]);

  const decrementWeightForSet = useCallback((setId: string) => {
    setSets((prev) => prev.map((s) => {
      if (s.id === setId) {
        const wLb = kgToLb(s.weightKg);
        const step = getSmartWeightStep(wLb);
        const next = Math.max(0, wLb - step);
        return { ...s, weightKg: lbToKg(next) };
      }
      return s;
    }));
  }, [getSmartWeightStep]);

  // Increment/decrement reps for a specific set
  const incrementRepsForSet = useCallback((setId: string) => {
    setSets((prev) => prev.map((s) => {
      if (s.id === setId) {
        return { ...s, reps: Math.min(100, s.reps + 1) };
      }
      return s;
    }));
  }, []);

  const decrementRepsForSet = useCallback((setId: string) => {
    setSets((prev) => prev.map((s) => {
      if (s.id === setId) {
        return { ...s, reps: Math.max(1, s.reps - 1) };
      }
      return s;
    }));
  }, []);

  const onWeightText = useCallback((t: string) => {
    setWeightLbText(t);
    weightLbTextRef.current = t;

    const result = validateWeight(t);
    if (result.valid && result.value !== undefined) {
      setWeightLb(result.value);
    }
  }, []);

  const onRepsText = useCallback((t: string) => {
    setRepsText(t);
    repsTextRef.current = t;

    const result = validateReps(t);
    if (result.valid && result.value !== undefined) {
      setReps(result.value);
    }
  }, []);

  // TAG-SPEC-003-INTEGRATION-weight-commit-validation
  const onWeightCommit = useCallback(() => {
    const result = validateWeight(weightLbTextRef.current);

    if (!result.valid) {
      callbacks?.onError?.(result.error ?? "Invalid weight");
      // Reset to last valid value
      setWeightLbText(weightLb.toFixed(1));
      weightLbTextRef.current = weightLb.toFixed(1);
      return;
    }

    if (result.value !== undefined) {
      setWeightLb(result.value);
      setWeightLbText(result.value.toFixed(1));
      weightLbTextRef.current = result.value.toFixed(1);
      callbacks?.onDismiss?.();
    }
  }, [weightLb, callbacks]);

  // TAG-SPEC-003-INTEGRATION-reps-commit-validation
  const onRepsCommit = useCallback(() => {
    const result = validateReps(repsTextRef.current);

    if (!result.valid) {
      callbacks?.onError?.(result.error ?? "Invalid reps");
      // Reset to last valid value
      setRepsText(String(reps));
      repsTextRef.current = String(reps);
      return;
    }

    if (result.value !== undefined) {
      setReps(result.value);
      setRepsText(String(result.value));
      repsTextRef.current = String(result.value);
      callbacks?.onDismiss?.();
    }
  }, [reps, callbacks]);

  const decWeight = useCallback(() => {
    setWeightLb((w) => {
      const next = Math.max(0, w - weightStep);
      setWeightLbText(next.toFixed(1));
      return next;
    });
  }, [weightStep]);

  const incWeight = useCallback(() => {
    setWeightLb((w) => {
      const next = Math.min(2000, w + weightStep); // Max 2000 lbs
      setWeightLbText(next.toFixed(1));
      return next;
    });
  }, [weightStep]);

  const onWeightStepChange = useCallback((step: number) => {
    setWeightStep(step);
  }, []);

  // Get the last logged set for an exercise
  const getLastSetForExercise = useCallback((exerciseId: string): LoggedSet | null => {
    const exerciseSets = sets.filter((s) => s.exerciseId === exerciseId);
    if (exerciseSets.length === 0) return null;
    // Return the most recent set
    return exerciseSets[exerciseSets.length - 1];
  }, [sets]);

  // Copy weight/reps from the last set for an exercise
  const copyFromLastSet = useCallback((exerciseId: string, targetSetId: string) => {
    const lastSet = getLastSetForExercise(exerciseId);
    if (!lastSet) {
      callbacks?.onError?.("No previous set to copy from");
      return;
    }

    const wLb = kgToLb(lastSet.weightKg);
    updateSet(targetSetId, {
      weightKg: lastSet.weightKg,
      reps: lastSet.reps,
    });

    callbacks?.onSuccess?.("Copied from previous set");
  }, [getLastSetForExercise, updateSet, callbacks]);

  const decReps = useCallback(() => {
    setReps((r) => {
      const next = Math.max(1, r - 1); // Min 1 rep
      setRepsText(String(next));
      return next;
    });
  }, []);

  const incReps = useCallback(() => {
    setReps((r) => {
      const next = Math.min(100, r + 1); // Max 100 reps
      setRepsText(String(next));
      return next;
    });
  }, []);

  const getDefaultsForExercise = useCallback(
    (exerciseId: string): Defaults => {
      return defaultsByExerciseId[exerciseId] ?? { weightLb, reps };
    },
    [defaultsByExerciseId, weightLb, reps]
  );

  const setDefaultsForExercise = useCallback((exerciseId: string, d: Defaults) => {
    setDefaultsByExerciseId((prev) => ({ ...prev, [exerciseId]: d }));
  }, []);

  const syncQuickAddToExercise = useCallback(
    (exerciseId: string) => {
      const d = defaultsByExerciseId[exerciseId];
      if (d) {
        setWeightLb(d.weightLb);
        setReps(d.reps);
        setWeightLbText(d.weightLb.toFixed(1));
        setRepsText(String(d.reps));
        return;
      }

      // No defaults for this exercise in current session, try to get from workout history
      const lastSet = getLastSetForExercise(exerciseId);
      if (lastSet) {
        const weightLbFromHistory = kgToLb(lastSet.weightKg);
        const repsFromHistory = lastSet.reps;
        // Set as defaults for this exercise in current session
        setDefaultsForExercise(exerciseId, { weightLb: weightLbFromHistory, reps: repsFromHistory });
        // Update quick-add inputs
        setWeightLb(weightLbFromHistory);
        setReps(repsFromHistory);
        setWeightLbText(weightLbFromHistory.toFixed(1));
        setRepsText(String(repsFromHistory));
      }
      // If no history, keep current inputs unchanged
    },
    [defaultsByExerciseId, setDefaultsForExercise, kgToLb]
  );

  // Add set to the workout session
  // TAG-SPEC-003-INTEGRATION-add-set-success-feedback
  const addSet = useCallback(
    (exerciseId: string, setType: SetType = "working") => {
      const newSet: LoggedSet = {
        id: uid(),
        exerciseId,
        setType,
        weightKg: lbToKg(weightLb),
        reps,
        timestampMs: Date.now(),
      };

      setSets((prev) => [...prev, newSet]);

      // Save as defaults for this exercise
      setDefaultsByExerciseId((prev) => ({
        ...prev,
        [exerciseId]: { weightLb, reps },
      }));

      // Trigger success feedback
      callbacks?.onSuccess?.("Set logged!");

      return { weightLb, reps, set: newSet };
    },
    [weightLb, reps, callbacks]
  );

  // Delete a set from the workout session
  const deleteSet = useCallback(
    (setId: string) => {
      setSets((prev) => prev.filter((s) => s.id !== setId));
      // Also remove from done tracking
      setDoneBySetId((prev) => {
        const next = { ...prev };
        delete next[setId];
        return next;
      });
      callbacks?.onSuccess?.("Set deleted");
    },
    [callbacks]
  );

  const resetSession = useCallback(() => {
    setSets([]);
    setDoneBySetId({});
    setDefaultsByExerciseId({});

    setWeightLb(startWeight);
    setReps(startReps);
    setWeightLbText(String(startWeight));
    setRepsText(String(startReps));
  }, [startWeight, startReps]);

  return useMemo(
    () => ({
      sets,
      setSets,

      doneBySetId,
      isDone,
      toggleDone,

      weightLb,
      reps,
      weightLbText,
      repsText,
      weightStep,

      onWeightText,
      onRepsText,
      onWeightCommit,
      onRepsCommit,
      onWeightStepChange,

      decWeight,
      incWeight,
      decReps,
      incReps,

      setWeightForSet,
      setRepsForSet,
      incrementWeightForSet,
      decrementWeightForSet,
      incrementRepsForSet,
      decrementRepsForSet,

      kgToLb: kgToLbFn,
      estimateE1RMLb,

      getDefaultsForExercise,
      setDefaultsForExercise,
      syncQuickAddToExercise,

      addSet,
      deleteSet,

      resetSession,

      getLastSetForExercise,
      copyFromLastSet,
    }),
    [
      sets,
      doneBySetId,
      isDone,
      toggleDone,
      weightLb,
      reps,
      weightLbText,
      repsText,
      weightStep,
      onWeightText,
      onRepsText,
      onWeightCommit,
      onRepsCommit,
      onWeightStepChange,
      decWeight,
      incWeight,
      decReps,
      incReps,
      setWeightForSet,
      setRepsForSet,
      incrementWeightForSet,
      decrementWeightForSet,
      incrementRepsForSet,
      decrementRepsForSet,
      kgToLbFn,
      estimateE1RMLb,
      getDefaultsForExercise,
      setDefaultsForExercise,
      syncQuickAddToExercise,
      addSet,
      deleteSet,
      resetSession,
      getLastSetForExercise,
      copyFromLastSet,
    ]
  );
}
