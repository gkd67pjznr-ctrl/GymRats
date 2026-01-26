import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import type { PremadePlan, PlanCategory } from "./types";
import { SAMPLE_PLANS } from "./samplePlans";
import { logError } from "../errorHandler";
import { safeJSONParseArray } from "../storage/safeJSONParse";

const STORAGE_KEY = "premadePlans.v1";

let plans: PremadePlan[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

// Queue for sequential persistence
let persistQueue: Promise<void> = Promise.resolve();

function notify() {
  for (const fn of listeners) fn();
}

/**
 * Persist plans to AsyncStorage
 */
async function persist() {
  persistQueue = persistQueue.then(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    } catch (err) {
      logError({ context: 'PremadePlansStore', error: err, userMessage: 'Failed to save workout plans' });
    }
  });

  return persistQueue;
}

/**
 * Load plans from AsyncStorage
 */
async function load(): Promise<PremadePlan[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return safeJSONParseArray<PremadePlan>(raw);
  } catch (err) {
    logError({ context: 'PremadePlansStore', error: err, userMessage: 'Failed to load workout plans' });
    return [];
  }
}

/**
 * Hydrate from AsyncStorage - call once at app start
 * Seeds with sample plans if storage is empty
 */
export async function hydratePremadePlansStore(): Promise<void> {
  if (hydrated) return;
  hydrated = true;

  try {
    plans = await load();

    // Seed with sample plans if empty
    if (plans.length === 0) {
      console.log('Seeding premade plans with samples...');
      plans = SAMPLE_PLANS.slice();
      await persist();
    }

    notify();
  } catch (err) {
    logError({ context: 'PremadePlansStore', error: err, userMessage: 'Failed to initialize workout plans' });
    // Fallback to sample plans
    plans = SAMPLE_PLANS.slice();
    notify();
  }
}

/**
 * Get all plans
 */
export function getAllPlans(): PremadePlan[] {
  return plans.slice();
}

/**
 * Get plans by category
 */
export function getPlansByCategory(category: PlanCategory): PremadePlan[] {
  return plans.filter(p => p.category === category);
}

/**
 * Get plan by ID
 */
export function getPlanById(id: string): PremadePlan | undefined {
  return plans.find(p => p.id === id);
}

/**
 * Add a new plan (for AI generation or user creation)
 */
export function addPlan(plan: PremadePlan): void {
  plans = [plan, ...plans];
  persist();
  notify();
}

/**
 * Update existing plan
 */
export function updatePlan(id: string, updates: Partial<PremadePlan>): void {
  const index = plans.findIndex(p => p.id === id);
  if (index === -1) return;

  plans[index] = { ...plans[index], ...updates };
  persist();
  notify();
}

/**
 * Delete a plan
 */
export function deletePlan(id: string): void {
  plans = plans.filter(p => p.id !== id);
  persist();
  notify();
}

/**
 * Reset to sample plans (useful for dev/testing)
 */
export function resetToSamplePlans(): void {
  plans = SAMPLE_PLANS.slice();
  persist();
  notify();
}

/**
 * Subscribe to plan changes
 */
export function subscribePlans(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * React hook - get all plans
 */
export function usePremadePlans(): PremadePlan[] {
  const [data, setData] = useState(getAllPlans());

  useEffect(() => {
    const unsub = subscribePlans(() => setData(getAllPlans()));

    hydratePremadePlansStore().catch((err) => {
      logError({ context: 'PremadePlansStore', error: err, userMessage: 'Failed to load workout plans' });
    });

    return unsub;
  }, []);

  return data;
}

/**
 * React hook - get plans by category
 */
export function usePlansByCategory(category: PlanCategory): PremadePlan[] {
  const [data, setData] = useState(getPlansByCategory(category));

  useEffect(() => {
    const unsub = subscribePlans(() => setData(getPlansByCategory(category)));

    hydratePremadePlansStore().catch((err) => {
      logError({ context: 'PremadePlansStore', error: err, userMessage: 'Failed to load workout plans' });
    });

    return unsub;
  }, [category]);

  return data;
}

/**
 * React hook - get single plan
 */
export function usePlan(id: string): PremadePlan | undefined {
  const [data, setData] = useState(getPlanById(id));

  useEffect(() => {
    const unsub = subscribePlans(() => setData(getPlanById(id)));

    hydratePremadePlansStore().catch((err) => {
      logError({ context: 'PremadePlansStore', error: err, userMessage: 'Failed to load workout plans' });
    });

    return unsub;
  }, [id]);

  return data;
}

/**
 * Get count by category (for badges/UI)
 */
export function getPlanCountByCategory(category: PlanCategory): number {
  return plans.filter(p => p.category === category).length;
}
