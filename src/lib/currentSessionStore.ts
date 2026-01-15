// src/lib/currentSessionStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { LoggedSet } from "./loggerTypes";

const KEY = "currentSession.v1";

export type CurrentSession = {
  id: string;
  startedAtMs: number;

  // UX state
  selectedExerciseId: string | null;
  exerciseBlocks: string[];

  // Data
  sets: LoggedSet[];
  doneBySetId: Record<string, boolean>;

  // Optional: link to plan/routine later
  planId?: string;
  routineId?: string;
  routineName?: string;
};

let current: CurrentSession | null = null;
let hydrated = false;

const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

function uid(): string {
  return Math.random().toString(16).slice(2) + "-" + Math.random().toString(16).slice(2);
}

async function persist() {
  try {
    if (!current) {
      await AsyncStorage.removeItem(KEY);
      return;
    }
    await AsyncStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // ignore persistence errors (app still works in-memory)
  }
}

async function load(): Promise<CurrentSession | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CurrentSession;
  } catch {
    return null;
  }
}

/**
 * Call once at app start (or lazily from first consumer).
 * Safe to call multiple times.
 */
export async function hydrateCurrentSession(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  current = await load();
  notify();
}

export function getCurrentSession(): CurrentSession | null {
  return current;
}

export function hasCurrentSession(): boolean {
  return !!current;
}

export function subscribeCurrentSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Create a new session if none exists. If one exists, returns it.
 */
export function ensureCurrentSession(seed?: Partial<Pick<CurrentSession, "selectedExerciseId" | "exerciseBlocks">>): CurrentSession {
  if (current) return current;

  const now = Date.now();
  current = {
    id: uid(),
    startedAtMs: now,
    selectedExerciseId: seed?.selectedExerciseId ?? null,
    exerciseBlocks: seed?.exerciseBlocks ?? [],
    sets: [],
    doneBySetId: {},
  };

  // fire-and-forget persist
  persist();
  notify();
  return current;
}

/**
 * Replace the whole session. (Use sparingly)
 */
export function setCurrentSession(next: CurrentSession | null) {
  current = next;
  persist();
  notify();
}

/**
 * Update session immutably via updater.
 * If session doesn't exist, creates one first.
 */
export function updateCurrentSession(updater: (s: CurrentSession) => CurrentSession) {
  const base = ensureCurrentSession();
  current = updater(base);
  persist();
  notify();
}

/**
 * End session (clears from store). Finalization into workout history
 * will be done by the LiveWorkout screen when the user taps Finish.
 */
export function clearCurrentSession() {
  current = null;
  persist();
  notify();
}

/**
 * React hook for UI screens.
 * It hydrates lazily once mounted.
 */
export function useCurrentSession(): CurrentSession | null {
  const [s, setS] = useState<CurrentSession | null>(getCurrentSession());

  useEffect(() => {
    // Lazy hydration
    hydrateCurrentSession().catch(() => {});
    return subscribeCurrentSession(() => setS(getCurrentSession()));
  }, []);

  return s;
}

/**
 * Convenience: derived stats for badges/labels.
 */
export function getCurrentSessionSummary(): { hasSession: boolean; setCount: number; startedAtMs: number | null } {
  const s = current;
  return {
    hasSession: !!s,
    setCount: s?.sets?.length ?? 0,
    startedAtMs: s?.startedAtMs ?? null,
  };
}
