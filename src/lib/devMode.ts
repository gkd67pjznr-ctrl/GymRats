import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const DEV_MODE_KEY = "devMode.enabled";

let devModeEnabled = false;
let hydrated = false;
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

/**
 * Load dev mode state from storage
 */
async function load(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(DEV_MODE_KEY);
    return raw === "true";
  } catch (err) {
    console.error('Failed to load dev mode:', err);
    return false;
  }
}

/**
 * Save dev mode state to storage
 */
async function save(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(DEV_MODE_KEY, enabled ? "true" : "false");
  } catch (err) {
    console.error("Failed to save dev mode:", err);
  }
}

/**
 * Hydrate dev mode state
 */
export async function hydrateDevMode(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  
  devModeEnabled = await load();
  notify();
}

/**
 * Check if dev mode is enabled
 */
export function isDevMode(): boolean {
  return devModeEnabled;
}

/**
 * Enable dev mode
 */
export async function enableDevMode(): Promise<void> {
  devModeEnabled = true;
  await save(true);
  notify();
}

/**
 * Disable dev mode
 */
export async function disableDevMode(): Promise<void> {
  devModeEnabled = false;
  await save(false);
  notify();
}

/**
 * Toggle dev mode
 */
export async function toggleDevMode(): Promise<boolean> {
  const newState = !devModeEnabled;
  devModeEnabled = newState;
  await save(newState);
  notify();
  return newState;
}

/**
 * Subscribe to dev mode changes
 */
export function subscribeDevMode(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * React hook for dev mode state
 */
export function useDevMode(): {
  isEnabled: boolean;
  toggle: () => Promise<boolean>;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
} {
  const [isEnabled, setIsEnabled] = useState(isDevMode());

  useEffect(() => {
    hydrateDevMode().catch(() => {});
    return subscribeDevMode(() => setIsEnabled(isDevMode()));
  }, []);

  return {
    isEnabled,
    toggle: toggleDevMode,
    enable: enableDevMode,
    disable: disableDevMode,
  };
}