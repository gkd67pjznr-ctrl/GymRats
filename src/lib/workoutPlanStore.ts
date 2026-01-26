import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { WorkoutPlan } from "./workoutPlanModel";

const STORAGE_KEY = "currentPlan.v1";

let currentPlan: WorkoutPlan | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

// Queue for sequential persistence
let persistQueue: Promise<void> = Promise.resolve();

function notify() {
  for (const fn of listeners) fn();
}

/**
 * Persist current plan to AsyncStorage
 */
async function persist() {
  persistQueue = persistQueue.then(async () => {
    try {
      if (!currentPlan) {
        await AsyncStorage.removeItem(STORAGE_KEY);
        return;
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentPlan));
    } catch (err) {
      console.error('Failed to persist current plan:', err);
    }
  });
  
  return persistQueue;
}

/**
 * Load current plan from AsyncStorage
 */
async function load(): Promise<WorkoutPlan | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkoutPlan;
  } catch (err) {
    console.error('Failed to load current plan:', err);
    return null;
  }
}

/**
 * Hydrate from AsyncStorage - call once at app start
 * Safe to call multiple times
 */
export async function hydrateWorkoutPlanStore(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  
  try {
    currentPlan = await load();
    notify();
  } catch (err) {
    console.error('Failed to hydrate workout plan store:', err);
    currentPlan = null;
    notify();
  }
}

export function setCurrentPlan(plan: WorkoutPlan | null) {
  currentPlan = plan;
  persist(); // Queue persistence
  notify();
}

export function getCurrentPlan(): WorkoutPlan | null {
  return currentPlan;
}

export function updateCurrentPlan(updater: (prev: WorkoutPlan) => WorkoutPlan) {
  if (!currentPlan) return;
  currentPlan = updater(currentPlan);
  persist(); // Queue persistence
  notify();
}

export function clearCurrentPlan() {
  currentPlan = null;
  persist(); // Queue persistence
  notify();
}

export function subscribeCurrentPlan(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCurrentPlan(): WorkoutPlan | null {
  const [p, setP] = useState(getCurrentPlan());
  
  useEffect(() => {
    // Lazy hydration on first mount
    hydrateWorkoutPlanStore().catch((err) => {
      console.error('Failed to hydrate in useCurrentPlan:', err);
    });
    
    return subscribeCurrentPlan(() => setP(getCurrentPlan()));
  }, []);
  
  return p;
}
