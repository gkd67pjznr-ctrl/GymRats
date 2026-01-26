// src/lib/chatStore.ts
// ORIGINAL VERSION - Migrated to Zustand
// See src/lib/stores/chatStore.ts for new implementation
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { areFriends, getFriendStatus, hydrateFriends } from "./friendsStore";
import type { ChatMessage, ChatThread, ID } from "./socialModel";

type ReadState = {
  // threadId -> userId -> lastReadAtMs
  [threadId: string]: Record<string, number>;
};

type ChatState = {
  threads: ChatThread[];
  messages: ChatMessage[];
  reads: ReadState;
};

const KEY = "chat.v1";

// ---------- Typing (ephemeral, not persisted) ----------
type TypingState = {
  // threadId -> userId -> lastTypingAtMs
  [threadId: string]: Record<string, number>;
};

const TYPING_TTL_MS = 6500; // treat typing as "active" if updated within this window
let typing: TypingState = {};

function isTypingFresh(lastAtMs: number): boolean {
  return Date.now() - lastAtMs <= TYPING_TTL_MS;
}

export function setTyping(threadId: ID, userId: ID, isTyping: boolean) {
  if (!threadId || !userId) return;

  if (isTyping) {
    if (!typing[threadId]) typing[threadId] = {};
    typing[threadId][userId] = Date.now();
  } else {
    if (typing[threadId]) {
      delete typing[threadId][userId];
      if (Object.keys(typing[threadId]).length === 0) delete typing[threadId];
    }
  }

  notify();
}

export function getIsUserTyping(threadId: ID, userId: ID): boolean {
  const lastAt = typing?.[threadId]?.[userId];
  if (!lastAt) return false;
  return isTypingFresh(lastAt);
}

// -----------------------------------------------

let state: ChatState = {
  threads: [],
  messages: [],
  reads: {},
};

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
      await AsyncStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to persist chat state:', err);
    }
  });
  return persistQueue;
}

async function load(): Promise<ChatState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ChatState;
  } catch (err) {
    console.error('Failed to load chat state:', err);
    return null;
  }
}

export async function hydrateChat(): Promise<void> {
  if (hydrated) return;
  hydrated = true;

  hydrateFriends().catch(() => {});

  const loaded = await load();
  if (loaded) state = loaded;
  else seedMockChat();

  notify();
}

export function subscribeChat(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---------- Selectors ----------
export function getThreadsForUser(myUserId: ID): ChatThread[] {
  return state.threads
    .filter((t) => t.memberUserIds.includes(myUserId))
    .slice()
    .sort((a, b) => (b.updatedAtMs ?? b.createdAtMs) - (a.updatedAtMs ?? a.createdAtMs));
}

export function getThread(threadId: ID): ChatThread | null {
  return state.threads.find((t) => t.id === threadId) ?? null;
}

export function getMessagesForThread(threadId: ID): ChatMessage[] {
  return state.messages
    .filter((m) => m.threadId === threadId)
    .slice()
    .sort((a, b) => a.createdAtMs - b.createdAtMs);
}

export function getOtherUserId(thread: ChatThread, myUserId: ID): ID {
  return thread.memberUserIds.find((id) => id !== myUserId) ?? thread.memberUserIds[0] ?? myUserId;
}

export function getLastReadAt(threadId: ID, userId: ID): number {
  return state.reads?.[threadId]?.[userId] ?? 0;
}

export function getUnreadCount(threadId: ID, userId: ID): number {
  const lastRead = getLastReadAt(threadId, userId);
  return state.messages.filter(
    (m) => m.threadId === threadId && m.createdAtMs > lastRead && m.senderUserId !== userId
  ).length;
}

// ---------- Policy ----------
export function canUserMessageThread(thread: ChatThread, senderUserId: ID): boolean {
  if (!thread.memberUserIds.includes(senderUserId)) return false;

  const otherId = getOtherUserId(thread, senderUserId);

  // Block check either way
  if (getFriendStatus(senderUserId, otherId) === "blocked") return false;
  if (getFriendStatus(otherId, senderUserId) === "blocked") return false;

  if (thread.canMessage === "friendsOnly") {
    return areFriends(senderUserId, otherId);
  }

  return true;
}

// ---------- Mutations ----------
function upsertThread(next: ChatThread) {
  const idx = state.threads.findIndex((t) => t.id === next.id);
  if (idx >= 0) {
    const threads = state.threads.slice();
    threads[idx] = next;
    state = { ...state, threads };
  } else {
    state = { ...state, threads: [next, ...state.threads] };
  }
}

function ensureReadBucket(threadId: ID) {
  if (!state.reads[threadId]) state.reads[threadId] = {};
}

export function markThreadRead(threadId: ID, userId: ID, atMs: number = Date.now()) {
  ensureReadBucket(threadId);
  state.reads[threadId][userId] = Math.max(state.reads[threadId][userId] ?? 0, atMs);
  persist().catch(() => {});
  notify();
}

export function ensureThread(
  myUserId: ID,
  otherUserId: ID,
  canMessage: ChatThread["canMessage"] = "friendsOnly"
): ChatThread {
  const existing =
    state.threads.find(
      (t) =>
        t.type === "dm" &&
        t.memberUserIds.length === 2 &&
        t.memberUserIds.includes(myUserId) &&
        t.memberUserIds.includes(otherUserId)
    ) ?? null;

  if (existing) return existing;

  const now = Date.now();
  const t: ChatThread = {
    id: (`dm_${myUserId}_${otherUserId}_${now}` as unknown) as ID,
    type: "dm",
    memberUserIds: [myUserId, otherUserId],
    createdAtMs: now,
    updatedAtMs: now,
    canMessage,
  };

  upsertThread(t);
  persist().catch(() => {});
  notify();
  return t;
}

export function sendMessage(threadId: ID, senderUserId: ID, text: string) {
  const clean = text.trim();
  if (!clean) return;

  const thread = getThread(threadId);
  if (!thread) return;

  // 🔒 Anti-spam: enforce policy in the store
  if (!canUserMessageThread(thread, senderUserId)) return;

  const now = Date.now();
  const msg: ChatMessage = {
    id: (`m_${now}_${Math.random().toString(16).slice(2)}` as unknown) as ID,
    threadId,
    senderUserId,
    text: clean,
    createdAtMs: now,
  };

  state = { ...state, messages: [...state.messages, msg] };
  upsertThread({ ...thread, updatedAtMs: now });

  // Sender has implicitly read up to now
  ensureReadBucket(threadId);
  state.reads[threadId][senderUserId] = now;

  // Sender is no longer "typing" once message is sent
  setTyping(threadId, senderUserId, false);

  persist().catch(() => {});
  notify();
}

// ---------- Hooks ----------
export function useThreads(myUserId: ID): ChatThread[] {
  const [threads, setThreads] = useState<ChatThread[]>(getThreadsForUser(myUserId));

  useEffect(() => {
    hydrateChat().catch(() => {});
    return subscribeChat(() => setThreads(getThreadsForUser(myUserId)));
  }, [myUserId]);

  return threads;
}

export function useThread(threadId: ID): ChatThread | null {
  const [t, setT] = useState<ChatThread | null>(getThread(threadId));

  useEffect(() => {
    hydrateChat().catch(() => {});
    return subscribeChat(() => setT(getThread(threadId)));
  }, [threadId]);

  return t;
}

export function useThreadMessages(threadId: ID): ChatMessage[] {
  const [msgs, setMsgs] = useState<ChatMessage[]>(getMessagesForThread(threadId));

  useEffect(() => {
    hydrateChat().catch(() => {});
    return subscribeChat(() => setMsgs(getMessagesForThread(threadId)));
  }, [threadId]);

  return msgs;
}

export function useUnreadCount(threadId: ID, myUserId: ID): number {
  const [n, setN] = useState<number>(getUnreadCount(threadId, myUserId));

  useEffect(() => {
    hydrateChat().catch(() => {});
    return subscribeChat(() => setN(getUnreadCount(threadId, myUserId)));
  }, [threadId, myUserId]);

  return n;
}

export function useThreadOtherUserId(thread: ChatThread | null, myUserId: ID): ID | null {
  if (!thread) return null;
  if (thread.type !== "dm") return null;
  return getOtherUserId(thread, myUserId);
}

/**
 * Hook: "is the other user typing right now?"
 * TTL-based so it auto-clears even if an "end typing" event never fires.
 */
export function useOtherUserTyping(threadId: ID, myUserId: ID): boolean {
  const thread = getThread(threadId);
  const otherId = thread ? getOtherUserId(thread, myUserId) : null;

  const [val, setVal] = useState<boolean>(otherId ? getIsUserTyping(threadId, otherId) : false);

  useEffect(() => {
    hydrateChat().catch(() => {});
    return subscribeChat(() => {
      if (!otherId) {
        setVal(false);
        return;
      }
      setVal(getIsUserTyping(threadId, otherId));
    });
  }, [threadId, myUserId, otherId]);

  // TTL refresh tick (so UI clears without any other store event)
  useEffect(() => {
    const t = setInterval(() => {
      if (!otherId) return;
      setVal(getIsUserTyping(threadId, otherId));
    }, 500);
    return () => clearInterval(t);
  }, [threadId, otherId]);

  return val;
}

// ---------- Mock seed ----------
function seedMockChat() {
  const now = Date.now();
  const me: ID = "u_demo_me";

  const t1: ChatThread = {
    id: "dm_1" as ID,
    type: "dm",
    memberUserIds: [me, "u_demo_1" as ID], // Sarah
    createdAtMs: now - 1000 * 60 * 60 * 24,
    updatedAtMs: now - 1000 * 60 * 10,
    canMessage: "friendsOnly",
  };

  const t2: ChatThread = {
    id: "dm_2" as ID,
    type: "dm",
    memberUserIds: [me, "u_demo_3" as ID], // Mark (not friends in mock)
    createdAtMs: now - 1000 * 60 * 60 * 12,
    updatedAtMs: now - 1000 * 60 * 40,
    canMessage: "friendsOnly",
  };

  const m1: ChatMessage = {
    id: "m_1" as ID,
    threadId: t1.id,
    senderUserId: "u_demo_1" as ID,
    text: "Yo — you lifting today?",
    createdAtMs: now - 1000 * 60 * 12,
  };

  const m2: ChatMessage = {
    id: "m_2" as ID,
    threadId: t1.id,
    senderUserId: me,
    text: "Yeah. Hit legs. Regret incoming.",
    createdAtMs: now - 1000 * 60 * 11,
  };

  state = {
    threads: [t1, t2],
    messages: [m1, m2],
    reads: {
      [t1.id]: { [me]: now - 1000 * 60 * 11 },
      [t2.id]: {},
    },
  };

  persist().catch(() => {});
}
