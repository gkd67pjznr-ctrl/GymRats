// src/lib/stores/chatStore.ts
// Zustand store for chat threads and messages with AsyncStorage persistence and Supabase sync/realtime
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import type { ChatMessage, ChatThread, ID } from "../socialModel";
import { logError } from "../errorHandler";
import { safeJSONParse } from "../storage/safeJSONParse";
import type { SyncMetadata } from "../sync/syncTypes";
import { getUser } from "./authStore";
import { networkMonitor } from "../sync/NetworkMonitor";
import { realtimeManager } from "../sync/RealtimeManager";
import { sendDirectMessageNotification } from "../notifications/notificationService";
import { getUserProfile } from "./userProfileStore";
import { getUser } from "./authStore";

// Import from new Zustand friendsStore location
import {
  areFriends as checkAreFriends,
  getFriendStatus,
} from "./friendsStore";

const STORAGE_KEY = "chat.v2";

type ReadState = {
  // threadId -> userId -> lastReadAtMs
  [threadId: string]: Record<string, number>;
};

interface ChatState {
  threads: ChatThread[];
  messages: ChatMessage[];
  reads: ReadState;
  hydrated: boolean;
  _sync: SyncMetadata;

  // Actions
  ensureThread: (
    myUserId: ID,
    otherUserId: ID,
    canMessage?: ChatThread["canMessage"]
  ) => ChatThread;
  sendMessage: (threadId: ID, senderUserId: ID, text: string) => void;
  markThreadRead: (threadId: ID, userId: ID, atMs?: number) => void;
  setHydrated: (value: boolean) => void;

  // Sync actions
  pullFromServer: () => Promise<void>;
  pushToServer: () => Promise<void>;
  sync: () => Promise<void>;
}

// ============================================================================
// Typing (ephemeral, not persisted)
// ============================================================================

const TYPING_TTL_MS = 6500; // treat typing as "active" if updated within this window

type TypingState = {
  // threadId -> userId -> lastTypingAtMs
  [threadId: string]: Record<string, number>;
};

let typing: TypingState = {};

function isTypingFresh(lastAtMs: number): boolean {
  return Date.now() - lastAtMs <= TYPING_TTL_MS;
}

export function setTyping(threadId: ID, userId: ID, isTyping: boolean): void {
  if (!threadId || !userId) return;

  const currentlyTyping = getIsUserTyping(threadId, userId);

  if (isTyping === currentlyTyping) {
    // Typing state unchanged, but update timestamp if typing
    if (isTyping && typing[threadId]?.[userId]) {
      typing[threadId][userId] = Date.now();
    }
    return;
  }

  if (isTyping) {
    if (!typing[threadId]) typing[threadId] = {};
    typing[threadId][userId] = Date.now();
  } else {
    if (typing[threadId]) {
      delete typing[threadId][userId];
      if (Object.keys(typing[threadId]).length === 0) delete typing[threadId];
    }
  }

  // Trigger Zustand update for typing listeners
  useChatStore.setState((state) => ({ ...state }));
}

export function getIsUserTyping(threadId: ID, userId: ID): boolean {
  const lastAt = typing?.[threadId]?.[userId];
  if (!lastAt) return false;
  return isTypingFresh(lastAt);
}

export function resetTyping(): void {
  typing = {};
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => {
      // Helper function to upsert a thread
      function upsertThread(next: ChatThread): ChatState {
        const idx = get().threads.findIndex((t) => t.id === next.id);
        if (idx >= 0) {
          const threads = get().threads.slice();
          threads[idx] = next;
          return { ...get(), threads };
        }
        return { ...get(), threads: [next, ...get().threads] };
      }

      // Helper to ensure read bucket exists
      function ensureReadBucket(threadId: ID): ChatState {
        const reads = { ...get().reads };
        if (!reads[threadId]) reads[threadId] = {};
        return { ...get(), reads };
      }

      return {
        threads: [],
        messages: [],
        reads: {},
        hydrated: false,
        _sync: {
          lastSyncAt: null,
          lastSyncHash: null,
          syncStatus: 'idle',
          syncError: null,
          pendingMutations: 0,
        },

        ensureThread: (myUserId, otherUserId, canMessage = "friendsOnly") => {
          const existing =
            get().threads.find(
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

          const newState = upsertThread(t);
          set({ threads: newState.threads, messages: newState.messages, reads: newState.reads });
          return t;
        },

        sendMessage: (threadId, senderUserId, text) => {
          const clean = text.trim();
          if (!clean) return;

          const thread = get().threads.find((t) => t.id === threadId);
          if (!thread) return;

          // Anti-spam: enforce policy in the store
          if (!canUserMessageThread(thread, senderUserId)) return;

          const now = Date.now();
          const msg: ChatMessage = {
            id: (`m_${now}_${Math.random().toString(16).slice(2)}` as unknown) as ID,
            threadId,
            senderUserId,
            text: clean,
            createdAtMs: now,
          };

          const updatedState = upsertThread({ ...thread, updatedAtMs: now });
          updatedState.messages = [...updatedState.messages, msg];

          // Sender has implicitly read up to now
          if (!updatedState.reads[threadId]) {
            updatedState.reads[threadId] = {};
          }
          updatedState.reads[threadId][senderUserId] = now;

          set({
            threads: updatedState.threads,
            messages: updatedState.messages,
            reads: updatedState.reads,
          });

          // Sender is no longer "typing" once message is sent
          setTyping(threadId, senderUserId, false);

          // Broadcast message via realtime if online
          if (networkMonitor.isOnline()) {
            realtimeManager.broadcast(`chat:${threadId}`, 'message', msg);
          }
        },

        markThreadRead: (threadId, userId, atMs = Date.now()) => {
          const withBucket = ensureReadBucket(threadId);
          withBucket.reads[threadId][userId] = Math.max(withBucket.reads[threadId][userId] ?? 0, atMs);
          set({ reads: withBucket.reads });
        },

        setHydrated: (value) => set({ hydrated: value }),

        // Sync actions
        pullFromServer: async () => {
          const user = getUser();
          if (!user) {
            console.warn('[chatStore] Cannot pull: no user signed in');
            return;
          }

          set({ _sync: { ...get()._sync, syncStatus: 'syncing', syncError: null } });

          try {
            // Note: Chat messages would be fetched from a chat_messages table
            // This is a placeholder for future implementation
            set((state) => ({
              _sync: {
                ...state._sync,
                syncStatus: 'success',
                lastSyncAt: Date.now(),
              },
            }));
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            set((state) => ({
              _sync: {
                ...state._sync,
                syncStatus: 'error',
                syncError: errorMessage,
              },
            }));
            throw error;
          }
        },

        pushToServer: async () => {
          const user = getUser();
          if (!user) {
            console.warn('[chatStore] Cannot push: no user signed in');
            return;
          }

          if (!networkMonitor.isOnline()) {
            console.warn('[chatStore] Cannot push: offline');
            return;
          }

          try {
            // Messages are broadcast via realtime immediately
            // This is for any pending messages
            set((state) => ({
              _sync: {
                ...state._sync,
                pendingMutations: 0,
              },
            }));
          } catch (error) {
            console.error('[chatStore] Push failed:', error);
            throw error;
          }
        },

        sync: async () => {
          await get().pullFromServer();
          await get().pushToServer();
        },
      };
    },
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        threads: state.threads,
        messages: state.messages,
        reads: state.reads,
      }),
      onRehydrateStorage: () => (state) => {
        // V1 to V2 migration
        AsyncStorage.getItem("chat.v1").then((v1Data) => {
          if (v1Data && state) {
            const parsed = safeJSONParse<{ threads: ChatThread[]; messages: ChatMessage[]; reads: ReadState }>(v1Data, null);
            if (parsed && parsed.threads && parsed.threads.length > 0 && state.threads.length === 0) {
              state.threads = parsed.threads;
              state.messages = parsed.messages ?? [];
              state.reads = parsed.reads ?? {};
              AsyncStorage.removeItem("chat.v1").catch((err) => {
                logError({ context: 'ChatStore', error: err, userMessage: 'Failed to remove old chat data' });
              });
            }
          }

          state?.setHydrated(true);
        }).catch((err) => {
          logError({ context: 'ChatStore', error: err, userMessage: 'Failed to load chat data' });
          state?.setHydrated(true);
        });
      },
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectThreadsForUser = (myUserId: ID) => (state: ChatState) =>
  state.threads
    .filter((t) => t.memberUserIds.includes(myUserId))
    .slice()
    .sort((a, b) => (b.updatedAtMs ?? b.createdAtMs) - (a.updatedAtMs ?? a.createdAtMs));

export const selectThread = (threadId: ID) => (state: ChatState) =>
  state.threads.find((t) => t.id === threadId) ?? null;

export const selectMessagesForThread = (threadId: ID) => (state: ChatState) =>
  state.messages
    .filter((m) => m.threadId === threadId)
    .slice()
    .sort((a, b) => a.createdAtMs - b.createdAtMs);

export const selectLastReadAt = (threadId: ID, userId: ID) => (state: ChatState) =>
  state.reads?.[threadId]?.[userId] ?? 0;

export const selectUnreadCount = (threadId: ID, userId: ID) => (state: ChatState) => {
  const lastRead = selectLastReadAt(threadId, userId)(state);
  return state.messages.filter(
    (m) => m.threadId === threadId && m.createdAtMs > lastRead && m.senderUserId !== userId
  ).length;
};

// ============================================================================
// Policy functions
// ============================================================================

export function getOtherUserId(thread: ChatThread, myUserId: ID): ID {
  return thread.memberUserIds.find((id) => id !== myUserId) ?? thread.memberUserIds[0] ?? myUserId;
}

export function canUserMessageThread(thread: ChatThread, senderUserId: ID): boolean {
  if (!thread.memberUserIds.includes(senderUserId)) return false;

  const otherId = getOtherUserId(thread, senderUserId);

  // Block check either way
  if (getFriendStatus(senderUserId, otherId) === "blocked") return false;
  if (getFriendStatus(otherId, senderUserId) === "blocked") return false;

  if (thread.canMessage === "friendsOnly") {
    return checkAreFriends(senderUserId, otherId);
  }

  return true;
}

// ============================================================================
// Hooks (match old API)
// ============================================================================

export function useThreads(myUserId: ID): ChatThread[] {
  const threads = useChatStore(state => state.threads);
  return useMemo(() =>
    threads
      .filter(t => t.memberUserIds.includes(myUserId))
      .slice()
      .sort((a, b) => (b.updatedAtMs ?? b.createdAtMs) - (a.updatedAtMs ?? a.createdAtMs))
  , [threads, myUserId]);
}

export function useThread(threadId: ID): ChatThread | null {
  const threads = useChatStore(state => state.threads);
  return useMemo(() => threads.find(t => t.id === threadId) ?? null, [threads, threadId]);
}

export function useThreadMessages(threadId: ID): ChatMessage[] {
  const messages = useChatStore(state => state.messages);
  return useMemo(() =>
    messages
      .filter(m => m.threadId === threadId)
      .slice()
      .sort((a, b) => a.createdAtMs - b.createdAtMs)
  , [messages, threadId]);
}

export function useUnreadCount(threadId: ID, myUserId: ID): number {
  const messages = useChatStore(state => state.messages);
  const reads = useChatStore(state => state.reads);
  return useMemo(() => {
    const lastRead = reads?.[threadId]?.[myUserId] ?? 0;
    return messages.filter(
      m => m.threadId === threadId && m.createdAtMs > lastRead && m.senderUserId !== myUserId
    ).length;
  }, [messages, reads, threadId, myUserId]);
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
  const thread = useThread(threadId);
  const otherId = thread ? getOtherUserId(thread, myUserId) : null;

  const [val, setVal] = useState<boolean>(otherId ? getIsUserTyping(threadId, otherId) : false);

  useEffect(() => {
    if (!otherId) {
      setVal(false);
      return;
    }
    setVal(getIsUserTyping(threadId, otherId));

    // TTL refresh tick (so UI clears without any other store event)
    const t = setInterval(() => {
      setVal(getIsUserTyping(threadId, otherId));
    }, 500);
    return () => clearInterval(t);
  }, [threadId, myUserId, otherId]);

  return val;
}

// ============================================================================
// Imperative getters for non-React code
// ============================================================================

export function getThreadsForUser(myUserId: ID): ChatThread[] {
  return selectThreadsForUser(myUserId)(useChatStore.getState());
}

export function getThread(threadId: ID): ChatThread | null {
  return selectThread(threadId)(useChatStore.getState());
}

export function getMessagesForThread(threadId: ID): ChatMessage[] {
  return selectMessagesForThread(threadId)(useChatStore.getState());
}

export function getLastReadAt(threadId: ID, userId: ID): number {
  return selectLastReadAt(threadId, userId)(useChatStore.getState());
}

export function getUnreadCount(threadId: ID, userId: ID): number {
  return selectUnreadCount(threadId, userId)(useChatStore.getState());
}

// Legacy hydrate function (no-op with Zustand)
export async function hydrateChat(): Promise<void> {
  // Zustand handles hydration automatically
}

// Legacy subscribe function (no-op with Zustand)
export function subscribeChat(listener: () => void): () => void {
  return () => {};
}

// ============================================================================
// Imperative action wrappers for non-React code
// ============================================================================

export function ensureThread(myUserId: ID, otherUserId: ID, canMessage?: ChatThread["canMessage"]): ID {
  return useChatStore.getState().ensureThread(myUserId, otherUserId, canMessage).id;
}

export function sendMessage(threadId: string, senderId: ID, text: string): void {
  useChatStore.getState().sendMessage(threadId, senderId, text);
}

export function markThreadRead(threadId: string, userId: ID): void {
  useChatStore.getState().markThreadRead(threadId, userId);
}

// ============================================================================
// Sync Helpers
// ============================================================================

/**
 * Get sync status for chat store
 */
export function getChatSyncStatus(): SyncMetadata {
  return useChatStore.getState()._sync;
}

/**
 * Setup realtime subscription for chat thread
 */
export function setupChatRealtime(threadId: ID): () => void {
  return realtimeManager.subscribeToBroadcast(
    `chat:${threadId}`,
    'message',
    async (payload) => {
      // Handle incoming message
      const msg = payload as ChatMessage;
      const currentUser = getUser();

      useChatStore.setState((state) => {
        // Check if message already exists
        if (state.messages.find(m => m.id === msg.id)) {
          return state;
        }

        return {
          messages: [...state.messages, msg],
          threads: state.threads.map(t =>
            t.id === msg.threadId
              ? { ...t, updatedAtMs: Math.max(t.updatedAtMs ?? 0, msg.createdAtMs) }
              : t
          ),
        };
      });

      // Send notification if message is from another user
      if (currentUser && msg.senderUserId !== currentUser.id) {
        try {
          const senderProfile = await getUserProfile(msg.senderUserId);
          if (senderProfile) {
            await sendDirectMessageNotification(
              msg.senderUserId,
              senderProfile.displayName || msg.senderUserId,
              currentUser.id,
              threadId,
              msg.text
            );
          }
        } catch (error) {
          console.error('[chatStore] Failed to send DM notification:', error);
        }
      }
    }
  );
}

/**
 * Setup realtime subscription for typing indicators
 */
export function setupTypingRealtime(threadId: ID): () => void {
  return realtimeManager.subscribeToBroadcast(
    `chat:${threadId}`,
    'typing',
    (payload) => {
      const { userId, isTyping } = payload as { userId: ID; isTyping: boolean };
      setTyping(threadId, userId, isTyping);
    }
  );
}

/**
 * Broadcast typing indicator
 */
export function broadcastTyping(threadId: ID, userId: ID, isTyping: boolean): void {
  if (networkMonitor.isOnline()) {
    realtimeManager.broadcast(`chat:${threadId}`, 'typing', { userId, isTyping });
  }
}
