import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { PlanProgress } from "./planToRoutine";
import { logError } from "../errorHandler";
import { safeJSONParseRecord } from "../storage/safeJSONParse";

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
      logError({ context: 'PlanProgressStore', error: err, userMessage: 'Failed to save workout progress' });
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
    return safeJSONParseRecord<PlanProgress>(raw);
  } catch (err) {
    logError({ context: 'PlanProgressStore', error: err, userMessage: 'Failed to load workout progress' });
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
    logError({ context: 'PlanProgressStore', error: err, userMessage: 'Failed to initialize workout progress' });
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
      logError({ context: 'PlanProgressStore', error: err, userMessage: 'Failed to load workout progress' });
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
      logError({ context: 'PlanProgressStore', error: err, userMessage: 'Failed to load workout progress' });
    });

    return unsub;
  }, []);

  return data;
}
