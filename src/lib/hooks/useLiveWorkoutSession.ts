import { useCallback, useMemo, useState } from "react";
import type { LoggedSet } from "../loggerTypes";
import { lbToKg } from "../units";

type Defaults = { weightLb: number; reps: number };

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

  // reset
  resetSession: () => void;
};

export function useLiveWorkoutSession(initial?: { weightLb?: number; reps?: number }): UseLiveWorkoutSessionResult {
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

  const kgToLb = useCallback((kg: number) => kg * 2.2046226218, []);
  const estimateE1RMLb = useCallback((wLb: number, r: number) => {
    if (!wLb || r <= 0) return 0;
    return wLb * (1 + r / 30);
  }, []);

  const updateSet = useCallback((setId: string, patch: Partial<LoggedSet>) => {
    setSets((prev) => prev.map((s) => (s.id === setId ? { ...s, ...patch } : s)));
  }, []);

  const setWeightForSet = useCallback(
    (setId: string, text: string) => {
      const parsed = Number(text);
      if (!Number.isFinite(parsed)) return;
      updateSet(setId, { weightKg: lbToKg(Math.max(0, parsed)) });
    },
    [updateSet]
  );

  const setRepsForSet = useCallback(
    (setId: string, text: string) => {
      const parsed = Math.floor(Number(text));
      if (!Number.isFinite(parsed)) return;
      updateSet(setId, { reps: Math.max(0, parsed) });
    },
    [updateSet]
  );

  const onWeightText = useCallback((t: string) => {
    setWeightLbText(t);
    const n = Number(t);
    if (Number.isFinite(n)) setWeightLb(Math.max(0, n));
  }, []);

  const onRepsText = useCallback((t: string) => {
    setRepsText(t);
    const n = Math.floor(Number(t));
    if (Number.isFinite(n)) setReps(Math.max(0, n));
  }, []);

  const onWeightCommit = useCallback(() => {
    setWeightLbText(weightLb.toFixed(1));
  }, [weightLb]);

  const onRepsCommit = useCallback(() => {
    setRepsText(String(reps));
  }, [reps]);

  const decWeight = useCallback(() => {
    setWeightLb((w) => {
      const next = Math.max(0, w - 2.5);
      setWeightLbText(next.toFixed(1));
      return next;
    });
  }, []);

  const incWeight = useCallback(() => {
    setWeightLb((w) => {
      const next = w + 2.5;
      setWeightLbText(next.toFixed(1));
      return next;
    });
  }, []);

  const decReps = useCallback(() => {
    setReps((r) => {
      const next = Math.max(0, r - 1);
      setRepsText(String(next));
      return next;
    });
  }, []);

  const incReps = useCallback(() => {
    setReps((r) => {
      const next = r + 1;
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

      kgToLb,
      estimateE1RMLb,

      getDefaultsForExercise,
      setDefaultsForExercise,
      syncQuickAddToExercise,

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
      kgToLb,
      estimateE1RMLb,
      getDefaultsForExercise,
      setDefaultsForExercise,
      syncQuickAddToExercise,
      resetSession,
    ]
  );
}
