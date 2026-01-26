import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { PlanProgress } from "./planToRoutine";

const STORAGE_KEY = "planProgress.v1";

let progressByRoutineId: Record<string, PlanProgress> = {};
let hydrated = false;
const listeners = new Set<() => void>();

// Queue for sequential persistence
let persistQueue: Promise<void> = Promise.resolve();

function notify() {
  for (const fn of listeners) fn();
}

/**
 * Persist progress to AsyncStorage
 */
async function persist() {
  persistQueue = persistQueue.then(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progressByRoutineId));
    } catch (err) {
      console.error('Failed to persist plan progress:', err);
    }
  });
  
  return persistQueue;
}

/**
 * Load progress from AsyncStorage
 */
async function load(): Promise<Record<string, PlanProgress>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, PlanProgress>;
  } catch (err) {
    console.error('Failed to load plan progress:', err);
    return {};
  }
}

/**
 * Hydrate from AsyncStorage
 */
export async function hydratePlanProgressStore(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  
  try {
    progressByRoutineId = await load();
    notify();
  } catch (err) {
    console.error('Failed to hydrate plan progress store:', err);
    progressByRoutineId = {};
    notify();
  }
}

/**
 * Save or update progress for a routine
 */
export function savePlanProgress(progress: PlanProgress): void {
  progressByRoutineId[progress.routineId] = progress;
  persist();
  notify();
}

/**
 * Get progress for a specific routine
 */
export function getPlanProgress(routineId: string): PlanProgress | undefined {
  return progressByRoutineId[routineId];
}

/**
 * Get all active plan progress
 */
export function getAllPlanProgress(): PlanProgress[] {
  return Object.values(progressByRoutineId);
}

/**
 * Delete progress (when plan is completed or abandoned)
 */
export function deletePlanProgress(routineId: string): void {
  delete progressByRoutineId[routineId];
  persist();
  notify();
}

/**
 * Subscribe to progress changes
 */
export function subscribePlanProgress(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * React hook - get progress for a routine
 */
export function usePlanProgress(routineId: string): PlanProgress | undefined {
  const [data, setData] = useState(getPlanProgress(routineId));

  useEffect(() => {
    const unsub = subscribePlanProgress(() => setData(getPlanProgress(routineId)));
    
    hydratePlanProgressStore().catch((err) => {
      console.error('Failed to hydrate in usePlanProgress:', err);
    });
    
    return unsub;
  }, [routineId]);

  return data;
}

/**
 * React hook - get all progress
 */
export function useAllPlanProgress(): PlanProgress[] {
  const [data, setData] = useState(getAllPlanProgress());

  useEffect(() => {
    const unsub = subscribePlanProgress(() => setData(getAllPlanProgress()));
    
    hydratePlanProgressStore().catch((err) => {
      console.error('Failed to hydrate in useAllPlanProgress:', err);
    });
    
    return unsub;
  }, []);

  return data;
}
