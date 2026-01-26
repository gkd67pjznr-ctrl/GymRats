// src/lib/notificationPrefs.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const KEY = "notificationPrefs.v1";

export type NotificationPrefs = {
  // Social
  likes: boolean;
  comments: boolean;
  friendRequests: boolean;

  // Chat
  messages: boolean;

  // System-ish
  marketing: boolean; // future store/emote bundles/etc.
};

const DEFAULTS: NotificationPrefs = {
  likes: true,
  comments: true,
  friendRequests: true,
  messages: true,
  marketing: false,
};

let prefs: NotificationPrefs = { ...DEFAULTS };
let hydrated = false;

const listeners = new Set<() => void>();

// [FIX 2026-01-23] Queue for sequential persistence (consistent with other stores)
let persistQueue: Promise<void> = Promise.resolve();

function notify() {
  for (const fn of listeners) fn();
}

async function persist() {
  persistQueue = persistQueue.then(async () => {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
    } catch (err) {
      console.error('Failed to persist notification prefs:', err);
    }
  });
  return persistQueue;
}

async function load(): Promise<NotificationPrefs | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NotificationPrefs;
  } catch (err) {
    console.error('Failed to load notification prefs:', err);
    return null;
  }
}

export async function hydrateNotificationPrefs(): Promise<void> {
  if (hydrated) return;
  hydrated = true;

  const loaded = await load();
  prefs = loaded ? { ...DEFAULTS, ...loaded } : { ...DEFAULTS };

  notify();
}

export function subscribeNotificationPrefs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNotificationPrefs(): NotificationPrefs {
  return prefs;
}

export function setNotificationPrefs(next: NotificationPrefs) {
  prefs = { ...DEFAULTS, ...next };
  persist();
  notify();
}

export function updateNotificationPrefs(updater: (p: NotificationPrefs) => NotificationPrefs) {
  prefs = { ...DEFAULTS, ...updater(prefs) };
  persist();
  notify();
}

export function setNotificationPref<K extends keyof NotificationPrefs>(key: K, value: NotificationPrefs[K]) {
  prefs = { ...prefs, [key]: value };
  persist();
  notify();
}

// React hook for screens
export function useNotificationPrefs(): NotificationPrefs {
  const [p, setP] = useState<NotificationPrefs>(getNotificationPrefs());

  useEffect(() => {
    hydrateNotificationPrefs().catch(() => {});
    return subscribeNotificationPrefs(() => setP(getNotificationPrefs()));
  }, []);

  return p;
}
