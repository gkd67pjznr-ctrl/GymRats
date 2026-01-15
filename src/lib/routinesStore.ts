import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { Routine } from "./routinesModel";

const KEY = "routines.v1";

async function persistRoutines(routines: Routine[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(routines));
}

async function loadRoutines(): Promise<Routine[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Routine[];
  } catch {
    return [];
  }
}

let routines: Routine[] = [];
const listeners = new Set<() => void>();

let hydrated = false;
let hydrating: Promise<void> | null = null;

function notify() {
  for (const fn of listeners) fn();
}

async function ensureHydrated() {
  if (hydrated) return;
  if (hydrating) return hydrating;

  hydrating = (async () => {
    routines = await loadRoutines();
    hydrated = true;
    notify();
  })().finally(() => {
    hydrating = null;
  });

  return hydrating;
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

  // fire-and-forget persistence; UI shouldn't stall
  void persistRoutines(routines);

  notify();
}

export function deleteRoutine(id: string) {
  routines = routines.filter((r) => r.id !== id);

  void persistRoutines(routines);

  notify();
}

export function subscribeRoutines(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useRoutines(): Routine[] {
  const [data, setData] = useState(getRoutines());

  useEffect(() => {
    const unsub = subscribeRoutines(() => setData(getRoutines()));
    void ensureHydrated(); // hydrate after subscribing so notify triggers UI refresh
    return unsub;
  }, []);

  return data;
}

export function useRoutine(id: string): Routine | undefined {
  const [r, setR] = useState(getRoutineById(id));

  useEffect(() => {
    const unsub = subscribeRoutines(() => setR(getRoutineById(id)));
    void ensureHydrated();
    return unsub;
  }, [id]);

  return r;
}
