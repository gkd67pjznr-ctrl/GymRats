// src/lib/hangout/hangoutStore.ts
// Zustand store for hangout room state management

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "../stores/storage/createQueuedAsyncStorage";
import type { HangoutRoom, RoomDecoration, UserPresence } from "./hangoutTypes";
import {
  createHangoutRoom,
  getHangoutRoom,
  getUserHangoutRoom,
  addDecoration,
  getRoomDecorations,
  updateUserPresence,
  getRoomUserPresences
} from "./hangoutRepository";
import { getUser } from "../stores/authStore";
import { logError } from "../errorHandler";

const STORAGE_KEY = "hangout.v1";

export interface HangoutStoreState {
  // Room state
  currentRoom: HangoutRoom | null;
  decorations: RoomDecoration[];
  userPresences: UserPresence[];

  // Loading state
  hydrated: boolean;
  loading: boolean;
  error: string | null;
}

export interface HangoutStoreActions {
  // Room management
  createRoom: (name: string, theme: string) => Promise<boolean>;
  loadRoom: (roomId: string) => Promise<boolean>;
  loadUserRoom: () => Promise<boolean>;

  // Decorations
  addRoomDecoration: (
    itemId: string,
    itemType: string,
    position: { x: number; y: number }
  ) => Promise<boolean>;
  loadRoomDecorations: (roomId: string) => Promise<boolean>;

  // Presence
  updatePresence: (status: UserPresence["status"], activity?: string) => Promise<boolean>;
  loadRoomPresences: (roomId: string) => Promise<boolean>;

  // State management
  hydrate: () => Promise<void>;
  setHydrated: (value: boolean) => void;
  setError: (error: string | null) => void;
  clearRoom: () => void;
}

const initialState: HangoutStoreState = {
  currentRoom: null,
  decorations: [],
  userPresences: [],
  hydrated: false,
  loading: false,
  error: null,
};

export const useHangoutStore = create<HangoutStoreState & HangoutStoreActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Create a new hangout room
      createRoom: async (name: string, theme: string) => {
        const user = getUser();
        if (!user) {
          set({ error: "User not authenticated" });
          return false;
        }

        set({ loading: true, error: null });

        try {
          const result = await createHangoutRoom(user.id, name, theme);

          if (result.success && result.data) {
            set({
              currentRoom: result.data,
              loading: false,
            });
            return true;
          } else {
            set({ error: result.error || "Failed to create hangout room", loading: false });
            return false;
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          set({ error: errorMessage, loading: false });
          logError({ context: "HangoutStore.createRoom", error: err, userMessage: "Failed to create hangout room" });
          return false;
        }
      },

      // Load a specific hangout room
      loadRoom: async (roomId: string) => {
        set({ loading: true, error: null });

        try {
          const roomResult = await getHangoutRoom(roomId);
          const decorationsResult = await getRoomDecorations(roomId);
          const presencesResult = await getRoomUserPresences(roomId);

          if (roomResult.success && roomResult.data) {
            set({
              currentRoom: roomResult.data,
              decorations: decorationsResult.success ? decorationsResult.data : [],
              userPresences: presencesResult.success ? presencesResult.data : [],
              loading: false,
            });
            return true;
          } else {
            set({ error: roomResult.error || "Failed to load hangout room", loading: false });
            return false;
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          set({ error: errorMessage, loading: false });
          logError({ context: "HangoutStore.loadRoom", error: err, userMessage: "Failed to load hangout room" });
          return false;
        }
      },

      // Load the current user's hangout room
      loadUserRoom: async () => {
        const user = getUser();
        if (!user) {
          set({ error: "User not authenticated" });
          return false;
        }

        set({ loading: true, error: null });

        try {
          const result = await getUserHangoutRoom(user.id);

          if (result.success) {
            if (result.data) {
              // Load room details
              await get().loadRoom(result.data.id);
              return true;
            } else {
              // User has no room - this is not an error
              set({
                currentRoom: null,
                decorations: [],
                userPresences: [],
                loading: false,
              });
              return true;
            }
          } else {
            set({ error: result.error || "Failed to load user hangout room", loading: false });
            return false;
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          set({ error: errorMessage, loading: false });
          logError({ context: "HangoutStore.loadUserRoom", error: err, userMessage: "Failed to load user hangout room" });
          return false;
        }
      },

      // Add a decoration to the current room
      addRoomDecoration: async (
        itemId: string,
        itemType: string,
        position: { x: number; y: number }
      ) => {
        const user = getUser();
        const currentRoom = get().currentRoom;

        if (!user) {
          set({ error: "User not authenticated" });
          return false;
        }

        if (!currentRoom) {
          set({ error: "No active hangout room" });
          return false;
        }

        set({ loading: true, error: null });

        try {
          const result = await addDecoration({
            roomId: currentRoom.id,
            itemId,
            itemType: itemType as any,
            position,
            contributedBy: user.id,
            approved: true, // Auto-approve for now
          });

          if (result.success && result.data) {
            set({
              decorations: [...get().decorations, result.data],
              loading: false,
            });
            return true;
          } else {
            set({ error: result.error || "Failed to add decoration", loading: false });
            return false;
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          set({ error: errorMessage, loading: false });
          logError({ context: "HangoutStore.addRoomDecoration", error: err, userMessage: "Failed to add decoration" });
          return false;
        }
      },

      // Load decorations for a room
      loadRoomDecorations: async (roomId: string) => {
        set({ loading: true, error: null });

        try {
          const result = await getRoomDecorations(roomId);

          if (result.success) {
            set({
              decorations: result.data || [],
              loading: false,
            });
            return true;
          } else {
            set({ error: result.error || "Failed to load room decorations", loading: false });
            return false;
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          set({ error: errorMessage, loading: false });
          logError({ context: "HangoutStore.loadRoomDecorations", error: err, userMessage: "Failed to load room decorations" });
          return false;
        }
      },

      // Update user presence in the current room
      updatePresence: async (status: UserPresence["status"], activity?: string) => {
        const user = getUser();
        const currentRoom = get().currentRoom;

        if (!user) {
          set({ error: "User not authenticated" });
          return false;
        }

        if (!currentRoom) {
          set({ error: "No active hangout room" });
          return false;
        }

        set({ loading: true, error: null });

        try {
          const result = await updateUserPresence({
            userId: user.id,
            roomId: currentRoom.id,
            status,
            activity,
          });

          if (result.success && result.data) {
            // Update local presence state
            const currentPresences = get().userPresences;
            const existingIndex = currentPresences.findIndex(p => p.userId === user.id);

            if (existingIndex >= 0) {
              // Update existing presence
              const updatedPresences = [...currentPresences];
              updatedPresences[existingIndex] = result.data;
              set({
                userPresences: updatedPresences,
                loading: false,
              });
            } else {
              // Add new presence
              set({
                userPresences: [...currentPresences, result.data],
                loading: false,
              });
            }
            return true;
          } else {
            set({ error: result.error || "Failed to update presence", loading: false });
            return false;
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          set({ error: errorMessage, loading: false });
          logError({ context: "HangoutStore.updatePresence", error: err, userMessage: "Failed to update presence" });
          return false;
        }
      },

      // Load user presences for a room
      loadRoomPresences: async (roomId: string) => {
        set({ loading: true, error: null });

        try {
          const result = await getRoomUserPresences(roomId);

          if (result.success) {
            set({
              userPresences: result.data || [],
              loading: false,
            });
            return true;
          } else {
            set({ error: result.error || "Failed to load user presences", loading: false });
            return false;
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          set({ error: errorMessage, loading: false });
          logError({ context: "HangoutStore.loadRoomPresences", error: err, userMessage: "Failed to load user presences" });
          return false;
        }
      },

      // Hydrate hangout data
      hydrate: async () => {
        set({ loading: true, error: null });

        try {
          // Load user's hangout room on startup
          await get().loadUserRoom();
          set({ hydrated: true, loading: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          set({ error: errorMessage, hydrated: true, loading: false });
          logError({ context: "HangoutStore.hydrate", error: err, userMessage: "Failed to hydrate hangout data" });
        }
      },

      // Set hydrated state
      setHydrated: (value: boolean) => set({ hydrated: value }),

      // Set error state
      setError: (error: string | null) => set({ error }),

      // Clear current room
      clearRoom: () => set({
        currentRoom: null,
        decorations: [],
        userPresences: [],
      }),
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        currentRoom: state.currentRoom,
        decorations: state.decorations,
        userPresences: state.userPresences,
      }),
    }
  )
);

// Selectors
export const useCurrentRoom = () => useHangoutStore((state) => state.currentRoom);
export const useRoomDecorations = () => useHangoutStore((state) => state.decorations);
export const useRoomPresences = () => useHangoutStore((state) => state.userPresences);

export const useHangoutLoading = () => useHangoutStore((state) => state.loading);
export const useHangoutError = () => useHangoutStore((state) => state.error);
export const useIsHangoutHydrated = () => useHangoutStore((state) => state.hydrated);