// src/lib/hangout/presenceTracker.ts
// Real-time presence tracking for hangout rooms

import { supabase } from "../supabase/client";
import type { UserPresence } from "./hangoutTypes";
import { useHangoutStore } from "./hangoutStore";
import { logError } from "../errorHandler";

/**
 * Setup real-time subscription for user presence in a room
 *
 * @param roomId - Room ID to subscribe to
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToRoomPresence(roomId: string): () => void {
  console.log('[PresenceTracker] Setting up presence subscription for room:', roomId);

  const subscription = supabase
    .channel(`room_presence:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_presence',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        console.log('[PresenceTracker] New presence INSERT:', payload);
        const presence: UserPresence = {
          id: payload.new.id,
          userId: payload.new.user_id,
          roomId: payload.new.room_id,
          status: payload.new.status as any,
          activity: payload.new.activity,
          updatedAt: new Date(payload.new.updated_at).getTime(),
          createdAt: new Date(payload.new.updated_at).getTime(),
        };

        // Add to store
        useHangoutStore.getState().setHydrated(false); // Temporarily mark as not hydrated
        useHangoutStore.setState((state) => ({
          userPresences: [...state.userPresences, presence],
        }));
        useHangoutStore.getState().setHydrated(true);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_presence',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        console.log('[PresenceTracker] Presence UPDATE:', payload);
        const presence: UserPresence = {
          id: payload.new.id,
          userId: payload.new.user_id,
          roomId: payload.new.room_id,
          status: payload.new.status as any,
          activity: payload.new.activity,
          updatedAt: new Date(payload.new.updated_at).getTime(),
          createdAt: new Date(payload.new.updated_at).getTime(),
        };

        // Update in store
        useHangoutStore.setState((state) => ({
          userPresences: state.userPresences.map(p =>
            p.userId === presence.userId ? presence : p
          ),
        }));
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'user_presence',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        console.log('[PresenceTracker] Presence DELETE:', payload);
        const userId = payload.old.user_id;

        // Remove from store
        useHangoutStore.setState((state) => ({
          userPresences: state.userPresences.filter(p => p.userId !== userId),
        }));
      }
    )
    .subscribe((status) => {
      console.log('[PresenceTracker] Subscription status changed:', status);
      if (status === 'SUBSCRIBED') {
        console.log('[PresenceTracker] Successfully subscribed to presence updates');
      } else if (status === 'CHANNEL_ERROR') {
        logError({
          context: "PresenceTracker.subscribeToRoomPresence",
          error: new Error("Channel error"),
          userMessage: "Failed to subscribe to presence updates"
        });
      } else if (status === 'TIMED_OUT') {
        logError({
          context: "PresenceTracker.subscribeToRoomPresence",
          error: new Error("Subscription timed out"),
          userMessage: "Presence subscription timed out"
        });
      }
    });

  // Return cleanup function
  return () => {
    console.log('[PresenceTracker] Cleaning up presence subscription');
    subscription.unsubscribe();
  };
}

/**
 * Setup real-time subscription for room decorations
 *
 * @param roomId - Room ID to subscribe to
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToRoomDecorations(roomId: string): () => void {
  console.log('[PresenceTracker] Setting up decoration subscription for room:', roomId);

  const subscription = supabase
    .channel(`room_decorations:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'room_decorations',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        console.log('[PresenceTracker] New decoration INSERT:', payload);
        const decoration = {
          id: payload.new.id,
          roomId: payload.new.room_id,
          itemId: payload.new.item_id,
          itemType: payload.new.item_type as any,
          position: {
            x: payload.new.position_x,
            y: payload.new.position_y,
          },
          contributedBy: payload.new.contributed_by,
          approved: payload.new.approved,
          createdAt: new Date(payload.new.created_at).getTime(),
        };

        // Add to store
        useHangoutStore.setState((state) => ({
          decorations: [...state.decorations, decoration],
        }));
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'room_decorations',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        console.log('[PresenceTracker] Decoration UPDATE:', payload);
        const decoration = {
          id: payload.new.id,
          roomId: payload.new.room_id,
          itemId: payload.new.item_id,
          itemType: payload.new.item_type as any,
          position: {
            x: payload.new.position_x,
            y: payload.new.position_y,
          },
          contributedBy: payload.new.contributed_by,
          approved: payload.new.approved,
          createdAt: new Date(payload.new.created_at).getTime(),
        };

        // Update in store
        useHangoutStore.setState((state) => ({
          decorations: state.decorations.map(d =>
            d.id === decoration.id ? decoration : d
          ),
        }));
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'room_decorations',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        console.log('[PresenceTracker] Decoration DELETE:', payload);
        const decorationId = payload.old.id;

        // Remove from store
        useHangoutStore.setState((state) => ({
          decorations: state.decorations.filter(d => d.id !== decorationId),
        }));
      }
    )
    .subscribe((status) => {
      console.log('[PresenceTracker] Decoration subscription status changed:', status);
      if (status === 'SUBSCRIBED') {
        console.log('[PresenceTracker] Successfully subscribed to decoration updates');
      } else if (status === 'CHANNEL_ERROR') {
        logError({
          context: "PresenceTracker.subscribeToRoomDecorations",
          error: new Error("Channel error"),
          userMessage: "Failed to subscribe to decoration updates"
        });
      } else if (status === 'TIMED_OUT') {
        logError({
          context: "PresenceTracker.subscribeToRoomDecorations",
          error: new Error("Subscription timed out"),
          userMessage: "Decoration subscription timed out"
        });
      }
    });

  // Return cleanup function
  return () => {
    console.log('[PresenceTracker] Cleaning up decoration subscription');
    subscription.unsubscribe();
  };
}

/**
 * Get current user presence for a room
 *
 * @param userId - User ID
 * @param roomId - Room ID
 * @returns User presence or null if not found
 */
export function getCurrentUserPresence(userId: string, roomId: string): UserPresence | null {
  const presences = useHangoutStore.getState().userPresences;
  return presences.find(p => p.userId === userId && p.roomId === roomId) || null;
}

/**
 * Get all presences for a room
 *
 * @param roomId - Room ID
 * @returns Array of user presences
 */
export function getRoomPresences(roomId: string): UserPresence[] {
  const presences = useHangoutStore.getState().userPresences;
  return presences.filter(p => p.roomId === roomId);
}

/**
 * Check if user is currently working out
 *
 * @param userId - User ID
 * @param roomId - Room ID
 * @returns Boolean indicating if user is working out
 */
export function isUserWorkingOut(userId: string, roomId: string): boolean {
  const presence = getCurrentUserPresence(userId, roomId);
  return presence?.status === 'working_out';
}

/**
 * Get user's current activity
 *
 * @param userId - User ID
 * @param roomId - Room ID
 * @returns User's activity string or undefined
 */
export function getUserActivity(userId: string, roomId: string): string | undefined {
  const presence = getCurrentUserPresence(userId, roomId);
  return presence?.activity;
}