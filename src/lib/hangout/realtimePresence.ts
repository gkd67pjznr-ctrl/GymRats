// src/lib/hangout/realtimePresence.ts
// Real-time presence using Supabase Presence API for instant updates

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import type { RealtimePresenceState, PresenceEvent, PresenceEventType } from './hangoutTypes';
import { useHangoutStore } from './hangoutStore';
import { logError } from '../errorHandler';

// Heartbeat interval in ms (30 seconds)
const HEARTBEAT_INTERVAL = 30_000;

// Presence timeout - users are considered offline after this (60 seconds)
const PRESENCE_TIMEOUT = 60_000;

/**
 * RealtimePresenceManager - Manages real-time presence for hangout rooms
 * using Supabase's native Presence API for instant updates
 */
class RealtimePresenceManager {
  private channel: RealtimeChannel | null = null;
  private roomId: string | null = null;
  private userId: string | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private currentPresence: RealtimePresenceState | null = null;
  private onPresenceChange: ((event: PresenceEvent) => void) | null = null;
  private presenceMap: Map<string, RealtimePresenceState> = new Map();

  /**
   * Join a hangout room and start tracking presence
   */
  async joinRoom(
    roomId: string,
    userId: string,
    userInfo: { displayName?: string; avatarUrl?: string },
    onPresenceChange?: (event: PresenceEvent) => void
  ): Promise<boolean> {
    try {
      // Leave any existing room first
      await this.leaveRoom();

      this.roomId = roomId;
      this.userId = userId;
      this.onPresenceChange = onPresenceChange || null;

      // Create presence channel for this room
      const channelName = `hangout:${roomId}`;
      this.channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      // Subscribe to presence sync events
      this.channel.on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync();
      });

      // Subscribe to presence join events
      this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (__DEV__) {
          console.log('[RealtimePresence] User joined:', key, newPresences);
        }
        this.handlePresenceJoin(key, newPresences);
      });

      // Subscribe to presence leave events
      this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (__DEV__) {
          console.log('[RealtimePresence] User left:', key, leftPresences);
        }
        this.handlePresenceLeave(key, leftPresences);
      });

      // Subscribe to the channel
      const status = await new Promise<string>((resolve) => {
        this.channel!.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            resolve(status);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            resolve(status);
          }
        });
      });

      if (status !== 'SUBSCRIBED') {
        logError({
          context: 'RealtimePresence.joinRoom',
          error: new Error(`Channel subscription failed: ${status}`),
          userMessage: 'Failed to join hangout room',
        });
        return false;
      }

      // Track our presence
      this.currentPresence = {
        userId,
        displayName: userInfo.displayName,
        avatarUrl: userInfo.avatarUrl,
        status: 'online',
        activity: 'In hangout',
        joinedAt: Date.now(),
        lastSeenAt: Date.now(),
      };

      await this.channel.track(this.currentPresence);

      // Start heartbeat
      this.startHeartbeat();

      if (__DEV__) {
        console.log('[RealtimePresence] Successfully joined room:', roomId);
      }

      return true;
    } catch (err) {
      logError({
        context: 'RealtimePresence.joinRoom',
        error: err,
        userMessage: 'Failed to join hangout room',
      });
      return false;
    }
  }

  /**
   * Leave the current hangout room
   */
  async leaveRoom(): Promise<void> {
    try {
      // Stop heartbeat
      this.stopHeartbeat();

      // Untrack our presence
      if (this.channel) {
        await this.channel.untrack();
        await supabase.removeChannel(this.channel);
      }

      // Clear state
      this.channel = null;
      this.roomId = null;
      this.userId = null;
      this.currentPresence = null;
      this.onPresenceChange = null;
      this.presenceMap.clear();

      if (__DEV__) {
        console.log('[RealtimePresence] Left room');
      }
    } catch (err) {
      logError({
        context: 'RealtimePresence.leaveRoom',
        error: err,
        userMessage: 'Failed to leave hangout room',
      });
    }
  }

  /**
   * Update our presence status
   */
  async updateStatus(
    status: RealtimePresenceState['status'],
    activity?: string,
    currentExercise?: string
  ): Promise<boolean> {
    if (!this.channel || !this.currentPresence) {
      return false;
    }

    try {
      this.currentPresence = {
        ...this.currentPresence,
        status,
        activity,
        currentExercise,
        lastSeenAt: Date.now(),
      };

      await this.channel.track(this.currentPresence);

      if (__DEV__) {
        console.log('[RealtimePresence] Status updated:', status, activity);
      }

      return true;
    } catch (err) {
      logError({
        context: 'RealtimePresence.updateStatus',
        error: err,
        userMessage: 'Failed to update presence status',
      });
      return false;
    }
  }

  /**
   * Get all current presences in the room
   */
  getPresences(): RealtimePresenceState[] {
    return Array.from(this.presenceMap.values());
  }

  /**
   * Get a specific user's presence
   */
  getPresence(userId: string): RealtimePresenceState | undefined {
    return this.presenceMap.get(userId);
  }

  /**
   * Check if a user is online
   */
  isOnline(userId: string): boolean {
    const presence = this.presenceMap.get(userId);
    if (!presence) return false;

    // Check if presence is stale
    const isStale = Date.now() - presence.lastSeenAt > PRESENCE_TIMEOUT;
    return !isStale && presence.status !== 'offline';
  }

  /**
   * Get online user count
   */
  getOnlineCount(): number {
    return this.getPresences().filter(p => this.isOnline(p.userId)).length;
  }

  // ==================== Private Methods ====================

  private handlePresenceSync(): void {
    if (!this.channel) return;

    const state = this.channel.presenceState<RealtimePresenceState>();

    // Update presence map from channel state
    const newPresenceMap = new Map<string, RealtimePresenceState>();

    for (const [key, presences] of Object.entries(state)) {
      if (presences && presences.length > 0) {
        // Use the most recent presence for this user
        const latestPresence = presences[presences.length - 1] as RealtimePresenceState;
        newPresenceMap.set(key, latestPresence);
      }
    }

    this.presenceMap = newPresenceMap;

    // Update store with new presences
    this.updateStorePresences();

    if (__DEV__) {
      console.log('[RealtimePresence] Synced presences:', this.presenceMap.size);
    }
  }

  private handlePresenceJoin(key: string, newPresences: any[]): void {
    if (newPresences.length === 0) return;

    const presence = newPresences[0] as RealtimePresenceState;
    this.presenceMap.set(key, presence);

    // Update store
    this.updateStorePresences();

    // Notify callback
    if (this.onPresenceChange && key !== this.userId) {
      this.onPresenceChange({
        type: 'join',
        userId: key,
        presence,
      });
    }
  }

  private handlePresenceLeave(key: string, leftPresences: any[]): void {
    this.presenceMap.delete(key);

    // Update store
    this.updateStorePresences();

    // Notify callback
    if (this.onPresenceChange && key !== this.userId && leftPresences.length > 0) {
      const presence = leftPresences[0] as RealtimePresenceState;
      this.onPresenceChange({
        type: 'leave',
        userId: key,
        presence,
      });
    }
  }

  private updateStorePresences(): void {
    // Convert realtime presences to UserPresence format for store
    const userPresences = Array.from(this.presenceMap.values()).map(p => ({
      id: `rt-${p.userId}`,
      userId: p.userId,
      roomId: this.roomId || '',
      status: p.status,
      activity: p.activity,
      updatedAt: p.lastSeenAt,
      createdAt: p.joinedAt,
    }));

    // Update store - only update userPresences, don't touch hydrated state
    useHangoutStore.setState({ userPresences });
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(async () => {
      if (this.channel && this.currentPresence) {
        this.currentPresence.lastSeenAt = Date.now();
        await this.channel.track(this.currentPresence);
      }
    }, HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Singleton instance
export const realtimePresence = new RealtimePresenceManager();

/**
 * Hook-friendly function to join a room
 */
export async function joinHangoutRoom(
  roomId: string,
  userId: string,
  userInfo: { displayName?: string; avatarUrl?: string },
  onPresenceChange?: (event: PresenceEvent) => void
): Promise<boolean> {
  return realtimePresence.joinRoom(roomId, userId, userInfo, onPresenceChange);
}

/**
 * Hook-friendly function to leave a room
 */
export async function leaveHangoutRoom(): Promise<void> {
  return realtimePresence.leaveRoom();
}

/**
 * Hook-friendly function to update status
 */
export async function updatePresenceStatus(
  status: RealtimePresenceState['status'],
  activity?: string,
  currentExercise?: string
): Promise<boolean> {
  return realtimePresence.updateStatus(status, activity, currentExercise);
}

/**
 * Get all online presences
 */
export function getOnlinePresences(): RealtimePresenceState[] {
  return realtimePresence.getPresences().filter(p => realtimePresence.isOnline(p.userId));
}
