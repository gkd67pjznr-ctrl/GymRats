import { useCallback, useMemo, useState } from "react";
import type { LoggedSet, SetType } from "../loggerTypes";
import { lbToKg, kgToLb } from "../units";
import { validateWeight, validateReps } from "../validators/workout";
import { uid } from "../uid";
import { estimate1RM_Epley } from "../e1rm";

type Defaults = { weightLb: number; reps: number };

/**
 * Validation feedback callbacks for toast notifications
 * Optional - if not provided, validation errors will be logged to console only
 */
export type ValidationCallbacks = {
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
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

  onWeightText: (t: string) => void;
  onRepsText: (t: string) => void;
  onWeightCommit: () => void;
  onRepsCommit: () => void;

  decWeight: () => void;
  incWeight: () => void;
  decReps: () => void;
  incReps: () => void;

  // edit existing set rows
  setWeightForSet: (setId: string, text: string) => void;
  setRepsForSet: (setId: string, text: string) => void;

  // helpers
  kgToLb: (kg: number) => number;
  estimateE1RMLb: (weightLb: number, reps: number) => number;

  // per-exercise "last used"
  getDefaultsForExercise: (exerciseId: string) => Defaults;
  setDefaultsForExercise: (exerciseId: string, d: Defaults) => void;
  syncQuickAddToExercise: (exerciseId: string) => void;

  // add set (main action)
  addSet: (exerciseId: string, setType?: SetType) => { weightLb: number; reps: number; set: LoggedSet };

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

  const onWeightText = useCallback((t: string) => {
    setWeightLbText(t);
    
    const result = validateWeight(t);
    if (result.valid && result.value !== undefined) {
      setWeightLb(result.value);
    }
  }, []);

  const onRepsText = useCallback((t: string) => {
    setRepsText(t);
    
    const result = validateReps(t);
    if (result.valid && result.value !== undefined) {
      setReps(result.value);
    }
  }, []);

  const onWeightCommit = useCallback(() => {
    const result = validateWeight(weightLbText);

    if (!result.valid) {
      callbacks?.onError?.(result.error ?? "Invalid weight");
      // Reset to last valid value
      setWeightLbText(weightLb.toFixed(1));
      return;
    }

    if (result.value !== undefined) {
      setWeightLb(result.value);
      setWeightLbText(result.value.toFixed(1));
    }
  }, [weightLb, weightLbText, callbacks]);

  const onRepsCommit = useCallback(() => {
    const result = validateReps(repsText);

    if (!result.valid) {
      callbacks?.onError?.(result.error ?? "Invalid reps");
      // Reset to last valid value
      setRepsText(String(reps));
      return;
    }

    if (result.value !== undefined) {
      setReps(result.value);
      setRepsText(String(result.value));
    }
  }, [reps, repsText, callbacks]);

  const decWeight = useCallback(() => {
    setWeightLb((w) => {
      const next = Math.max(0, w - 2.5);
      setWeightLbText(next.toFixed(1));
      return next;
    });
  }, []);

  const incWeight = useCallback(() => {
    setWeightLb((w) => {
      const next = Math.min(2000, w + 2.5); // Max 2000 lbs
      setWeightLbText(next.toFixed(1));
      return next;
    });
  }, []);

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
      if (!d) return;

      setWeightLb(d.weightLb);
      setReps(d.reps);
      setWeightLbText(d.weightLb.toFixed(1));
      setRepsText(String(d.reps));
    },
    [defaultsByExerciseId]
  );

  // Add set to the workout session
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

      onWeightText,
      onRepsText,
      onWeightCommit,
      onRepsCommit,

      decWeight,
      incWeight,
      decReps,
      incReps,

      setWeightForSet,
      setRepsForSet,

      kgToLb: kgToLbFn,
      estimateE1RMLb,

      getDefaultsForExercise,
      setDefaultsForExercise,
      syncQuickAddToExercise,

      addSet,

      resetSession,
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
      onWeightText,
      onRepsText,
      onWeightCommit,
      onRepsCommit,
      decWeight,
      incWeight,
      decReps,
      incReps,
      setWeightForSet,
      setRepsForSet,
      kgToLbFn,
      estimateE1RMLb,
      getDefaultsForExercise,
      setDefaultsForExercise,
      syncQuickAddToExercise,
      addSet,
      resetSession,
    ]
  );
}
