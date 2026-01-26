import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export type Settings = {
  hapticsEnabled: boolean;
  soundsEnabled: boolean;
  unitSystem: "lb" | "kg";
  defaultRestSeconds: number;
};

const STORAGE_KEY = "forgerank.settings.v1";

const DEFAULTS: Settings = {
  hapticsEnabled: true,
  soundsEnabled: true,
  unitSystem: "lb",
  defaultRestSeconds: 90,
};

let _settings: Settings = { ...DEFAULTS };
let _loaded = false;

// super lightweight subscribers so screens can react to changes
const subs = new Set<(s: Settings) => void>();
function notify() {
  for (const fn of subs) fn(_settings);
}

export function getSettings(): Settings {
  return _settings;
}

export async function loadSettings(): Promise<Settings> {
  if (_loaded) return _settings;

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      _settings = { ...DEFAULTS, ...parsed };
    } else {
      _settings = { ...DEFAULTS };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
    _settings = { ...DEFAULTS };
  } finally {
    _loaded = true;
    notify();
  }

  return _settings;
}

// [FIX 2026-01-23] Queue for sequential persistence (consistent with other stores)
let persistQueue: Promise<void> = Promise.resolve();

async function persist() {
  persistQueue = persistQueue.then(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(_settings));
    } catch (err) {
      console.error('Failed to persist settings:', err);
    }
  });
  return persistQueue;
}

export function updateSettings(patch: Partial<Settings>) {
  _settings = { ..._settings, ...patch };
  notify();
  void persist();
}

// React hook for screens
export function useSettings() {
  const [s, setS] = useState<Settings>(() => getSettings());

  useEffect(() => {
    let alive = true;

    // load once on first mount
    loadSettings().then((loaded) => {
      if (alive) setS(loaded);
    });

    const fn = (next: Settings) => setS(next);
    subs.add(fn);

    return () => {
      alive = false;
      subs.delete(fn);
    };
  }, []);

  return {
    settings: s,
    updateSettings,
  };
}