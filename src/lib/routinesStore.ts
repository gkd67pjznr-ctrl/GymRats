import { useEffect, useState } from "react";
import type { Routine } from "./routinesModel";

let routines: Routine[] = [];
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

export function getRoutines(): Routine[] {
  return routines.slice().sort((a, b) => b.updatedAtMs - a.updatedAtMs);
}

export function getRoutineById(id: string): Routine | undefined {
  return routines.find((r) => r.id === id);
}

export function upsertRoutine(next: Routine) {
  const idx = routines.findIndex((r) => r.id === next.id);
  if (idx >= 0) routines[idx] = next;
  else routines.unshift(next);
  notify();
}

export function deleteRoutine(id: string) {
  routines = routines.filter((r) => r.id !== id);
  notify();
}

export function subscribeRoutines(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useRoutines(): Routine[] {
  const [data, setData] = useState(getRoutines());
  useEffect(() => subscribeRoutines(() => setData(getRoutines())), []);
  return data;
}

export function useRoutine(id: string): Routine | undefined {
  const [r, setR] = useState(getRoutineById(id));
  useEffect(() => subscribeRoutines(() => setR(getRoutineById(id))), [id]);
  return r;
}
