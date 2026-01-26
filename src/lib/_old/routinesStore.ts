import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { Routine } from "./routinesModel";

const KEY = "routines.v1";

// Queue for sequential persistence (prevents race conditions)
let persistQueue: Promise<void> = Promise.resolve();

async function persistRoutines(routines: Routine[]) {
  persistQueue = persistQueue.then(async () => {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(routines));
    } catch (err) {
      console.error('Failed to persist routines:', err);
    }
  });
  
  return persistQueue;
}

async function loadRoutines(): Promise<Routine[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Routine[];
  } catch (err) {
    console.error('Failed to load routines:', err);
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
    try {
      routines = await loadRoutines();
      hydrated = true;
      notify();
    } catch (err) {
      console.error('Failed to hydrate routines store:', err);
      routines = [];
      hydrated = true;
      notify();
    }
  })().finally(() => {
    hydrating = null;
  });

  return hydrating;
}

/**
 * Exported hydration function for eager loading
 */
export async function hydrateRoutinesStore(): Promise<void> {
  return ensureHydrated();
}

export function getRoutines(): Routine[] {
  return routines.slice().sort((a, b) => b.updatedAtMs - a.updatedAtMs);
}

export function getRoutineById(id: string): Routine | undefined {
  return routines.find((r) => r.id === id);
}

export function upsertRoutine(next: Routine) {
  const idx = routines.findIndex((r) => r.id === next.id);
  if (idx >= 0) {
    routines[idx] = next;
  } else {
    routines.unshift(next);
  }

  // Queue persistence (non-blocking)
  persistRoutines(routines);
  notify();
}

export function deleteRoutine(id: string) {
  routines = routines.filter((r) => r.id !== id);
  
  // Queue persistence (non-blocking)
  persistRoutines(routines);
  notify();
}

export function clearRoutines() {
  routines = [];
  
  // Queue persistence (non-blocking)
  persistRoutines(routines);
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
    
    // Hydrate after subscribing so notify triggers UI refresh
    ensureHydrated().catch((err) => {
      console.error('Failed to hydrate in useRoutines:', err);
    });
    
    return unsub;
  }, []);

  return data;
}

export function useRoutine(id: string): Routine | undefined {
  const [r, setR] = useState(getRoutineById(id));

  useEffect(() => {
    const unsub = subscribeRoutines(() => setR(getRoutineById(id)));
    
    ensureHydrated().catch((err) => {
      console.error('Failed to hydrate in useRoutine:', err);
    });
    
    return unsub;
  }, [id]);

  return r;
}
