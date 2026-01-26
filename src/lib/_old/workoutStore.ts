import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { WorkoutSession } from "./workoutModel";

const STORAGE_KEY = "workoutSessions.v1";

let sessions: WorkoutSession[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

// Queue for sequential persistence (same pattern as currentSessionStore)
let persistQueue: Promise<void> = Promise.resolve();

function notify() {
  for (const fn of listeners) fn();
}

/**
 * Persist sessions to AsyncStorage with sequential queuing
 */
async function persist() {
  persistQueue = persistQueue.then(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (err) {
      console.error('Failed to persist workout sessions:', err);
    }
  });
  
  return persistQueue;
}

/**
 * Load sessions from AsyncStorage
 */
async function load(): Promise<WorkoutSession[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WorkoutSession[];
  } catch (err) {
    console.error('Failed to load workout sessions:', err);
    return [];
  }
}

/**
 * Hydrate from AsyncStorage - call once at app start
 * Safe to call multiple times
 */
export async function hydrateWorkoutStore(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  
  try {
    sessions = await load();
    notify();
  } catch (err) {
    console.error('Failed to hydrate workout store:', err);
    // Continue with empty sessions
    sessions = [];
    notify();
  }
}

export function addWorkoutSession(session: WorkoutSession) {
  sessions = [session, ...sessions];
  persist(); // Queue persistence
  notify();
}

export function getWorkoutSessions(): WorkoutSession[] {
  return sessions;
}

export function clearWorkoutSessions() {
  sessions = [];
  persist(); // Queue persistence
  notify();
}

export function subscribeWorkoutSessions(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useWorkoutSessions(): WorkoutSession[] {
  const [data, setData] = useState(getWorkoutSessions());

  useEffect(() => {
    // Lazy hydration on first mount
    hydrateWorkoutStore().catch((err) => {
      console.error('Failed to hydrate in useWorkoutSessions:', err);
    });
    
    return subscribeWorkoutSessions(() => setData(getWorkoutSessions()));
  }, []);

  return data;
}

/**
 * Get a specific session by ID
 */
export function getWorkoutSessionById(id: string): WorkoutSession | undefined {
  return sessions.find(s => s.id === id);
}
