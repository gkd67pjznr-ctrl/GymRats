// src/lib/stores/friendsStore.ts
// Zustand store for friend relationships with AsyncStorage persistence
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import type { FriendEdge, FriendStatus, ID } from "../socialModel";
import { uid } from "../uid";
import { logError } from "../errorHandler";
import { safeJSONParse } from "../storage/safeJSONParse";

const STORAGE_KEY = "friends.v2";

interface FriendsState {
  edges: FriendEdge[];
  hydrated: boolean;

  // Actions
  sendFriendRequest: (myUserId: ID, otherUserId: ID) => void;
  acceptFriendRequest: (myUserId: ID, otherUserId: ID) => void;
  removeFriend: (myUserId: ID, otherUserId: ID) => void;
  blockUser: (myUserId: ID, otherUserId: ID) => void;
  setHydrated: (value: boolean) => void;
}

// Mock seed data for fresh installs
function seedMockFriends(): FriendEdge[] {
  const now = Date.now();
  const me: ID = "u_demo_me";

  return [
    { userId: me, otherUserId: "u_demo_1", status: "friends", updatedAtMs: now - 1000 * 60 * 60 },
    { userId: "u_demo_1", otherUserId: me, status: "friends", updatedAtMs: now - 1000 * 60 * 60 },
    { userId: me, otherUserId: "u_demo_3", status: "requested", updatedAtMs: now - 1000 * 60 * 20 },
    { userId: "u_demo_3", otherUserId: me, status: "pending", updatedAtMs: now - 1000 * 60 * 20 },
    { userId: me, otherUserId: "u_demo_spam", status: "blocked", updatedAtMs: now - 1000 * 60 * 5 },
  ];
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      edges: [],
      hydrated: false,

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
      },

      removeFriend: (myUserId, otherUserId) => {
        set((state) => ({
          edges: state.edges.filter(
            (e) => !((e.userId === myUserId && e.otherUserId === otherUserId) ||
                     (e.userId === otherUserId && e.otherUserId === myUserId))
          ),
        }));
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
      },

      setHydrated: (value) => set({ hydrated: value }),
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

          // Seed mock data if empty
          if (state && state.edges.length === 0) {
            state.edges = seedMockFriends();
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

export const selectFriendEdges = (myUserId: ID) => (state: FriendsState) =>
  state.edges
    .filter((e) => e.userId === myUserId)
    .slice()
    .sort((a, b) => b.updatedAtMs - a.updatedAtMs);

export const selectFriendStatus = (myUserId: ID, otherUserId: ID) => (state: FriendsState) =>
  state.edges.find((x) => x.userId === myUserId && x.otherUserId === otherUserId)?.status ?? "none";

export const selectAreFriends = (myUserId: ID, otherUserId: ID) => (state: FriendsState) =>
  state.edges.find((x) => x.userId === myUserId && x.otherUserId === otherUserId)?.status === "friends";

// ============================================================================
// Hooks (match old API)
// ============================================================================

export function useFriendEdges(myUserId: ID): FriendEdge[] {
  return useFriendsStore(selectFriendEdges(myUserId));
}

export function useFriendStatus(myUserId: ID, otherUserId: ID): FriendStatus {
  return useFriendsStore(selectFriendStatus(myUserId, otherUserId));
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
