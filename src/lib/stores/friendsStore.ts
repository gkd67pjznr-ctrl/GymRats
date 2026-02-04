// src/lib/stores/friendsStore.ts
// Zustand store for friend relationships with AsyncStorage persistence and Supabase sync/realtime
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import type { FriendEdge, FriendStatus, ID } from "../socialModel";
import { uid } from "../uid";
import { logError } from "../errorHandler";
import { safeJSONParse } from "../storage/safeJSONParse";
import type { SyncMetadata } from "../sync/syncTypes";
import { getUser } from "./authStore";
import { friendRepository } from "../sync/repositories/friendRepository";
import { networkMonitor } from "../sync/NetworkMonitor";
import { resolveFriendConflict } from "../sync/ConflictResolver";
import { subscribeToUserFriendships } from "../sync/RealtimeManager";
import { useMemo } from "react";
import { shallow } from "zustand/shallow";
import { sendFriendRequestNotification } from "../notifications/notificationService";
import { getUserProfile } from "./userProfileStore";

const STORAGE_KEY = "friends.v2";

interface FriendsState {
  edges: FriendEdge[];
  hydrated: boolean;
  _sync: SyncMetadata;

  // Actions
  sendFriendRequest: (myUserId: ID, otherUserId: ID) => void;
  acceptFriendRequest: (myUserId: ID, otherUserId: ID) => void;
  removeFriend: (myUserId: ID, otherUserId: ID) => void;
  blockUser: (myUserId: ID, otherUserId: ID) => void;
  setHydrated: (value: boolean) => void;

  // Sync actions
  pullFromServer: () => Promise<void>;
  pushToServer: () => Promise<void>;
  sync: () => Promise<void>;
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      edges: [],
      hydrated: false,
      _sync: {
        lastSyncAt: null,
        lastSyncHash: null,
        syncStatus: 'idle',
        syncError: null,
        pendingMutations: 0,
      },

      sendFriendRequest: (myUserId, otherUserId) => {
        const now = Date.now();
        const currentEdges = get().edges;

        // If blocked either way, do nothing
        const existingStatus = currentEdges.find(
          (e) => e.userId === myUserId && e.otherUserId === otherUserId
        )?.status;
        if (existingStatus === "blocked") return;

        const newEdges = [...currentEdges];

        // Upsert my edge
        const myEdgeIdx = newEdges.findIndex(
          (e) => e.userId === myUserId && e.otherUserId === otherUserId
        );
        if (myEdgeIdx >= 0) {
          newEdges[myEdgeIdx] = { userId: myUserId, otherUserId, status: "requested", updatedAtMs: now };
        } else {
          newEdges.push({ userId: myUserId, otherUserId, status: "requested", updatedAtMs: now });
        }

        // Upsert their edge
        const theirEdgeIdx = newEdges.findIndex(
          (e) => e.userId === otherUserId && e.otherUserId === myUserId
        );
        if (theirEdgeIdx >= 0) {
          newEdges[theirEdgeIdx] = { userId: otherUserId, otherUserId: myUserId, status: "pending", updatedAtMs: now };
        } else {
          newEdges.push({ userId: otherUserId, otherUserId: myUserId, status: "pending", updatedAtMs: now });
        }

        set({ edges: newEdges });

        // Queue sync if online
        if (networkMonitor.isOnline()) {
          queueSync('sendFriendRequest', { myUserId, otherUserId });
        }
      },

      acceptFriendRequest: (myUserId, otherUserId) => {
        const now = Date.now();
        const newEdges = get().edges.map((e) => {
          if ((e.userId === myUserId && e.otherUserId === otherUserId) ||
              (e.userId === otherUserId && e.otherUserId === myUserId)) {
            return { ...e, status: "friends" as FriendStatus, updatedAtMs: now };
          }
          return e;
        });
        set({ edges: newEdges });

        // Queue sync if online
        if (networkMonitor.isOnline()) {
          queueSync('acceptFriendRequest', { myUserId, otherUserId });
        }
      },

      removeFriend: (myUserId, otherUserId) => {
        set((state) => ({
          edges: state.edges.filter(
            (e) => !((e.userId === myUserId && e.otherUserId === otherUserId) ||
                     (e.userId === otherUserId && e.otherUserId === myUserId))
          ),
        }));

        // Queue sync if online
        if (networkMonitor.isOnline()) {
          queueSync('removeFriend', { myUserId, otherUserId });
        }
      },

      blockUser: (myUserId, otherUserId) => {
        const now = Date.now();
        set((state) => {
          const filtered = state.edges.filter(
            (e) => !((e.userId === myUserId && e.otherUserId === otherUserId) ||
                     (e.userId === otherUserId && e.otherUserId === myUserId))
          );
          return {
            edges: [
              ...filtered,
              { userId: myUserId, otherUserId, status: "blocked", updatedAtMs: now },
            ],
          };
        });

        // Queue sync if online
        if (networkMonitor.isOnline()) {
          queueSync('blockUser', { myUserId, otherUserId });
        }
      },

      setHydrated: (value) => set({ hydrated: value }),

      // Sync actions
      pullFromServer: async () => {
        const user = getUser();
        if (!user) {
          console.warn('[friendsStore] Cannot pull: no user signed in');
          return;
        }

        set({ _sync: { ...get()._sync, syncStatus: 'syncing', syncError: null } });

        try {
          const remoteEdges = await friendRepository.fetchAll(user.id);

          // Merge with local edges using conflict resolution
          const localEdges = get().edges;
          const mergedEdges = mergeFriendEdges(localEdges, remoteEdges);

          set({
            edges: mergedEdges,
            _sync: {
              ...get()._sync,
              syncStatus: 'success',
              lastSyncAt: Date.now(),
            },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          // Don't throw for table-not-found errors - just log and continue with local data
          const isTableMissing = errorMessage.includes('Could not find the') ||
                                  errorMessage.includes('relation') ||
                                  errorMessage.includes('does not exist');

          if (isTableMissing) {
            console.warn('[friendsStore] Backend tables not set up yet, using local data only');
            set({
              _sync: {
                ...get()._sync,
                syncStatus: 'idle',
                syncError: null,
              },
            });
            return;
          }

          set({
            _sync: {
              ...get()._sync,
              syncStatus: 'error',
              syncError: errorMessage,
            },
          });
          throw error;
        }
      },

      pushToServer: async () => {
        const user = getUser();
        if (!user) {
          console.warn('[friendsStore] Cannot push: no user signed in');
          return;
        }

        if (!networkMonitor.isOnline()) {
          console.warn('[friendsStore] Cannot push: offline');
          return;
        }

        try {
          const edges = get().edges;
          await friendRepository.syncUp(edges);

          set({
            _sync: {
              ...get()._sync,
              pendingMutations: 0,
            },
          });
        } catch (error) {
          console.error('[friendsStore] Push failed:', error);
          throw error;
        }
      },

      sync: async () => {
        await get().pullFromServer();
        await get().pushToServer();
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({ edges: state.edges }),
      onRehydrateStorage: () => (state) => {
        // V1 to V2 migration
        AsyncStorage.getItem("friends.v1").then((v1Data) => {
          if (v1Data && state) {
            const parsed = safeJSONParse<{ edges: FriendEdge[] }>(v1Data, null);
            if (parsed && parsed.edges && parsed.edges.length > 0 && state.edges.length === 0) {
              state.edges = parsed.edges;
              AsyncStorage.removeItem("friends.v1").catch((err) => {
                logError({ context: 'FriendsStore', error: err, userMessage: 'Failed to remove old friends data' });
              });
            }
          }

          state?.setHydrated(true);
        }).catch((err) => {
          logError({ context: 'FriendsStore', error: err, userMessage: 'Failed to load friends data' });
          state?.setHydrated(true);
        });
      },
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

// Memoized selector cache for friend edges
const friendEdgesCache = new Map<string, { edges: FriendEdge[]; result: FriendEdge[] }>();

export const selectFriendEdges = (myUserId: ID) => (state: FriendsState): FriendEdge[] => {
  const cached = friendEdgesCache.get(myUserId);
  if (cached && cached.edges === state.edges) {
    return cached.result;
  }
  const result = state.edges
    .filter((e) => e.userId === myUserId)
    .slice()
    .sort((a, b) => b.updatedAtMs - a.updatedAtMs);
  friendEdgesCache.set(myUserId, { edges: state.edges, result });
  return result;
};

export const selectFriendStatus = (myUserId: ID, otherUserId: ID) => (state: FriendsState) =>
  state.edges.find((x) => x.userId === myUserId && x.otherUserId === otherUserId)?.status ?? "none";

export const selectAreFriends = (myUserId: ID, otherUserId: ID) => (state: FriendsState) =>
  state.edges.find((x) => x.userId === myUserId && x.otherUserId === otherUserId)?.status === "friends";

export const selectPendingFriendRequests = (myUserId: ID) => (state: FriendsState): FriendEdge[] =>
  state.edges.filter((e) => e.userId === myUserId && e.status === "pending");

export const selectPendingFriendRequestCount = (myUserId: ID) => (state: FriendsState): number =>
  state.edges.filter((e) => e.userId === myUserId && e.status === "pending").length;

// ============================================================================
// Hooks (match old API)
// ============================================================================

export function useFriendEdges(myUserId: ID): FriendEdge[] {
  const selector = useMemo(() => selectFriendEdges(myUserId), [myUserId]);
  return useFriendsStore(selector, shallow);
}

export function useFriendStatus(myUserId: ID, otherUserId: ID): FriendStatus {
  const selector = useMemo(() => selectFriendStatus(myUserId, otherUserId), [myUserId, otherUserId]);
  return useFriendsStore(selector, shallow);
}

export function useFriendEdge(myUserId: ID, otherUserId: ID): FriendEdge | undefined {
  const selector = useMemo(
    () => (state: FriendsState) =>
      state.edges.find((x) => x.userId === myUserId && x.otherUserId === otherUserId),
    [myUserId, otherUserId]
  );
  return useFriendsStore(selector);
}

export function usePendingFriendRequests(myUserId: ID): FriendEdge[] {
  const selector = useMemo(() => selectPendingFriendRequests(myUserId), [myUserId]);
  return useFriendsStore(selector, shallow);
}

export function usePendingFriendRequestCount(myUserId: ID): number {
  const selector = useMemo(() => selectPendingFriendRequestCount(myUserId), [myUserId]);
  return useFriendsStore(selector);
}

// ============================================================================
// Imperative getters for non-React code
// ============================================================================

export function getFriendEdges(myUserId: ID): FriendEdge[] {
  return selectFriendEdges(myUserId)(useFriendsStore.getState());
}

export function getFriendStatus(myUserId: ID, otherUserId: ID): FriendStatus {
  return selectFriendStatus(myUserId, otherUserId)(useFriendsStore.getState());
}

export function areFriends(myUserId: ID, otherUserId: ID): boolean {
  return selectAreFriends(myUserId, otherUserId)(useFriendsStore.getState());
}

// Legacy hydrate function (no-op with Zustand, hydration is automatic)
export async function hydrateFriends(): Promise<void> {
  // Zustand handles hydration automatically
  // This function exists for API compatibility
}

// Legacy subscribe function (no-op with Zustand, components use hooks directly)
export function subscribeFriends(listener: () => void): () => void {
  // Zustand handles subscriptions through hooks
  // This function exists for API compatibility - it won't work the same way
  return () => {};
}

// ============================================================================
// Imperative action wrappers for non-React code
// ============================================================================

export function sendFriendRequest(myUserId: ID, otherUserId: ID): void {
  useFriendsStore.getState().sendFriendRequest(myUserId, otherUserId);
}

export function acceptFriendRequest(myUserId: ID, otherUserId: ID): void {
  useFriendsStore.getState().acceptFriendRequest(myUserId, otherUserId);
}

export function removeFriend(myUserId: ID, otherUserId: ID): void {
  useFriendsStore.getState().removeFriend(myUserId, otherUserId);
}

export function blockUser(myUserId: ID, otherUserId: ID): void {
  useFriendsStore.getState().blockUser(myUserId, otherUserId);
}

// ============================================================================
// Sync Helpers
// ============================================================================

/**
 * Merge local and remote friend edges with conflict resolution
 */
function mergeFriendEdges(
  local: FriendEdge[],
  remote: FriendEdge[]
): FriendEdge[] {
  const edgeMap = new Map<string, FriendEdge>();

  // Create composite key for edges
  const getEdgeKey = (userId: ID, otherUserId: ID) => `${userId}_${otherUserId}`;

  // Add all remote edges
  for (const edge of remote) {
    edgeMap.set(getEdgeKey(edge.userId, edge.otherUserId), edge);
  }

  // Merge local edges
  for (const localEdge of local) {
    const key = getEdgeKey(localEdge.userId, localEdge.otherUserId);
    const remoteEdge = edgeMap.get(key);

    if (!remoteEdge) {
      // New local edge - add it
      edgeMap.set(key, localEdge);
    } else {
      // Conflict - resolve using conflict resolver
      const result = resolveFriendConflict(localEdge, remoteEdge);
      edgeMap.set(key, result.merged ?? remoteEdge);
    }
  }

  // Return sorted by updatedAtMs descending
  return Array.from(edgeMap.values()).sort(
    (a, b) => b.updatedAtMs - a.updatedAtMs
  );
}

/**
 * Queue a sync operation
 */
function queueSync(operation: string, data: unknown): void {
  // This would integrate with the pending operations queue
  // For now, it's a placeholder
  if (__DEV__) {
    console.log('[friendsStore] Queued sync:', operation, data);
  }
}

/**
 * Get sync status for friends store
 */
export function getFriendsSyncStatus(): SyncMetadata {
  return useFriendsStore.getState()._sync;
}

/**
 * Setup realtime subscription for friends
 */
export function setupFriendsRealtime(userId: ID): () => void {
  return subscribeToUserFriendships(userId, {
    onInsert: async (edge) => {
      // Handle new friendship edge
      useFriendsStore.setState((state) => ({
        edges: [...state.edges, edge],
      }));

      // Send notification if this is a friend request for the current user
      if (edge.otherUserId === userId && edge.status === 'pending') {
        // This is a friend request TO the current user
        try {
          const senderProfile = await getUserProfile(edge.userId);
          if (senderProfile) {
            await sendFriendRequestNotification(
              edge.userId,
              senderProfile.displayName || edge.userId,
              userId
            );
          }
        } catch (error) {
          console.error('[friendsStore] Failed to send friend request notification:', error);
        }
      }
    },
    onUpdate: (edge) => {
      // Handle updated friendship edge
      useFriendsStore.setState((state) => ({
        edges: state.edges.map(e =>
          (e.userId === edge.userId && e.otherUserId === edge.otherUserId) ||
          (e.userId === edge.otherUserId && e.otherUserId === edge.userId)
            ? edge
            : e
        ),
      }));
    },
    onDelete: (userId, otherUserId) => {
      // Handle deleted friendship
      useFriendsStore.setState((state) => ({
        edges: state.edges.filter(
          e => !((e.userId === userId && e.otherUserId === otherUserId) ||
                (e.userId === otherUserId && e.otherUserId === userId))
        ),
      }));
    },
  });
}
