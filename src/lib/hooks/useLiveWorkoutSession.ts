import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LoggedSet } from "../loggerTypes";
import { lbToKg } from "../units";

type LastByExercise = Record<string, { weightLb: number; reps: number }>;

export type UseLiveWorkoutSessionResult = {
  // session data
  sets: LoggedSet[];
  setSets: React.Dispatch<React.SetStateAction<LoggedSet[]>>;

  // per-set locking
  doneBySetId: Record<string, boolean>;
  isDone: (setId: string) => boolean;
  toggleDone: (setId: string) => void;

  // quick add controls (bound to activeExerciseId)
  activeExerciseId: string | null;
  setActiveExercise: (exerciseId: string) => void;

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

  // per-exercise last-used values
  getLastForExercise: (exerciseId: string) => { weightLb: number; reps: number };
  setLastForExercise: (exerciseId: string, next: { weightLb?: number; reps?: number }) => void;

  // edit existing set rows (also updates last-used for that exercise)
  setWeightForSet: (setId: string, text: string) => void;
  setRepsForSet: (setId: string, text: string) => void;

  // helpers
  kgToLb: (kg: number) => number;
  estimateE1RMLb: (weightLb: number, reps: number) => number;

  // reset
  resetSession: () => void;
};

export function useLiveWorkoutSession(initial?: { weightLb?: number; reps?: number }): UseLiveWorkoutSessionResult {
  const startWeight = initial?.weightLb ?? 135;
  const startReps = initial?.reps ?? 8;

  const [sets, setSets] = useState<LoggedSet[]>([]);
  const setsRef = useRef<LoggedSet[]>([]);
  useEffect(() => {
    setsRef.current = sets;
  }, [sets]);

  const [doneBySetId, setDoneBySetId] = useState<Record<string, boolean>>({});

  const [lastByExerciseId, setLastByExerciseId] = useState<LastByExercise>({});

  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  const [weightLb, setWeightLb] = useState(startWeight);
  const [reps, setReps] = useState(startReps);

  const [weightLbText, setWeightLbText] = useState(String(startWeight));
  const [repsText, setRepsText] = useState(String(startReps));

  const isDone = useCallback((setId: string) => !!doneBySetId[setId], [doneBySetId]);

  const toggleDone = useCallback((setId: string) => {
    setDoneBySetId((prev) => ({ ...prev, [setId]: !prev[setId] }));
  }, []);

  const kgToLb = useCallback((kg: number) => kg * 2.2046226218, []);
  const estimateE1RMLb = useCallback((wLb: number, r: number) => {
    if (!wLb || r <= 0) return 0;
    return wLb * (1 + r / 30);
  }, []);

  const getLastForExercise = useCallback(
    (exerciseId: string) => {
      const found = lastByExerciseId[exerciseId];
      return {
        weightLb: found?.weightLb ?? startWeight,
        reps: found?.reps ?? startReps,
      };
    },
    [lastByExerciseId, startWeight, startReps]
  );

  const setLastForExercise = useCallback(
    (exerciseId: string, next: { weightLb?: number; reps?: number }) => {
      setLastByExerciseId((prev) => {
        const cur = prev[exerciseId] ?? { weightLb: startWeight, reps: startReps };
        const merged = {
          weightLb: next.weightLb ?? cur.weightLb,
          reps: next.reps ?? cur.reps,
        };
        return { ...prev, [exerciseId]: merged };
      });
    },
    [startWeight, startReps]
  );

  const setActiveExercise = useCallback(
    (exerciseId: string) => {
      setActiveExerciseId(exerciseId);

      const last = getLastForExercise(exerciseId);
      setWeightLb(last.weightLb);
      setReps(last.reps);
      setWeightLbText(last.weightLb.toFixed(1));
      setRepsText(String(last.reps));
    },
    [getLastForExercise]
  );

  const onWeightText = useCallback(
    (t: string) => {
      setWeightLbText(t);
      const n = Number(t);
      if (!Number.isFinite(n)) return;

      const nextW = Math.max(0, n);
      setWeightLb(nextW);

      if (activeExerciseId) {
        setLastForExercise(activeExerciseId, { weightLb: nextW });
      }
    },
    [activeExerciseId, setLastForExercise]
  );

  const onRepsText = useCallback(
    (t: string) => {
      setRepsText(t);
      const n = Math.floor(Number(t));
      if (!Number.isFinite(n)) return;

      const nextR = Math.max(0, n);
      setReps(nextR);

      if (activeExerciseId) {
        setLastForExercise(activeExerciseId, { reps: nextR });
      }
    },
    [activeExerciseId, setLastForExercise]
  );

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
      if (activeExerciseId) setLastForExercise(activeExerciseId, { weightLb: next });
      return next;
    });
  }, [activeExerciseId, setLastForExercise]);

  const incWeight = useCallback(() => {
    setWeightLb((w) => {
      const next = w + 2.5;
      setWeightLbText(next.toFixed(1));
      if (activeExerciseId) setLastForExercise(activeExerciseId, { weightLb: next });
      return next;
    });
  }, [activeExerciseId, setLastForExercise]);

  const decReps = useCallback(() => {
    setReps((r) => {
      const next = Math.max(0, r - 1);
      setRepsText(String(next));
      if (activeExerciseId) setLastForExercise(activeExerciseId, { reps: next });
      return next;
    });
  }, [activeExerciseId, setLastForExercise]);

  const incReps = useCallback(() => {
    setReps((r) => {
      const next = r + 1;
      setRepsText(String(next));
      if (activeExerciseId) setLastForExercise(activeExerciseId, { reps: next });
      return next;
    });
  }, [activeExerciseId, setLastForExercise]);

  const setWeightForSet = useCallback(
    (setId: string, text: string) => {
      const parsed = Number(text);
      if (!Number.isFinite(parsed)) return;
      const nextW = Math.max(0, parsed);

      const setObj = setsRef.current.find((s) => s.id === setId);
      if (setObj?.exerciseId) {
        setLastForExercise(setObj.exerciseId, { weightLb: nextW });
      }

      setSets((prev) =>
        prev.map((s) => (s.id === setId ? { ...s, weightKg: lbToKg(nextW) } : s))
      );
    },
    [setLastForExercise]
  );

  const setRepsForSet = useCallback(
    (setId: string, text: string) => {
      const parsed = Math.floor(Number(text));
      if (!Number.isFinite(parsed)) return;
      const nextR = Math.max(0, parsed);

      const setObj = setsRef.current.find((s) => s.id === setId);
      if (setObj?.exerciseId) {
        setLastForExercise(setObj.exerciseId, { reps: nextR });
      }

      setSets((prev) => prev.map((s) => (s.id === setId ? { ...s, reps: nextR } : s)));
    },
    [setLastForExercise]
  );

  const resetSession = useCallback(() => {
    setSets([]);
    setDoneBySetId({});
    setLastByExerciseId({});
    setActiveExerciseId(null);

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

      activeExerciseId,
      setActiveExercise,

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

      getLastForExercise,
      setLastForExercise,

      setWeightForSet,
      setRepsForSet,

      kgToLb,
      estimateE1RMLb,

      resetSession,
    }),
    [
      sets,
      doneBySetId,
      isDone,
      toggleDone,
      activeExerciseId,
      setActiveExercise,
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
      getLastForExercise,
      setLastForExercise,
      setWeightForSet,
      setRepsForSet,
      kgToLb,
      estimateE1RMLb,
      resetSession,
    ]
  );
}
