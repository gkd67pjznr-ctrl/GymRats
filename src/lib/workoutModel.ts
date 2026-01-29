export type WorkoutSet = {
  id: string;
  exerciseId: string;
  weightKg: number;
  reps: number;
  timestampMs: number;
};

export type WorkoutSession = {
  id: string;
  userId: string;
  startedAtMs: number;
  endedAtMs: number;
  sets: WorkoutSet[];

  // optional linkage
  routineId?: string;
  routineName?: string;
  planId?: string;

  plannedExercises?: Array<{
    exerciseId: string;
    targetSets: number;
    targetRepsMin?: number;
    targetRepsMax?: number;
  }>;

  // 0..1 if planned
  completionPct?: number;
};

// [CHANGED 2026-01-23] Re-export from centralized uid
export { uid } from "./uid";

export function durationMs(session: WorkoutSession): number {
  return Math.max(0, session.endedAtMs - session.startedAtMs);
}

export function startOfDayMs(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  const h = Math.floor(m / 60);
  const mm = m % 60;

  if (h > 0) {
    return `${h}:${String(mm).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }

  return `${mm}:${String(r).padStart(2, "0")}`;
}

export function formatDateShort(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTimeShort(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
