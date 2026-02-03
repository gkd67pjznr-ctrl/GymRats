// src/lib/hangout/useRealtimePresence.ts
// React hook for using real-time presence in components

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '../stores/authStore';
import { useHangoutStore } from './hangoutStore';
import {
  realtimePresence,
  joinHangoutRoom,
  leaveHangoutRoom,
  updatePresenceStatus,
} from './realtimePresence';
import type { RealtimePresenceState, PresenceEvent } from './hangoutTypes';

export interface UseRealtimePresenceResult {
  // State
  isConnected: boolean;
  onlineCount: number;
  presences: RealtimePresenceState[];
  myPresence: RealtimePresenceState | undefined;

  // Actions
  updateStatus: (
    status: RealtimePresenceState['status'],
    activity?: string,
    currentExercise?: string
  ) => Promise<boolean>;
  updateActivity: (activity: string, currentExercise?: string) => Promise<boolean>;
}

/**
 * Hook to use real-time presence in a component
 *
 * Automatically joins the user's hangout room and tracks presence.
 * Leaves the room when the component unmounts.
 *
 * @param onPresenceEvent - Optional callback for presence events (join/leave/update)
 */
export function useRealtimePresence(
  onPresenceEvent?: (event: PresenceEvent) => void
): UseRealtimePresenceResult {
  const user = useUser();
  const currentRoom = useHangoutStore((state) => state.currentRoom);

  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [presences, setPresences] = useState<RealtimePresenceState[]>([]);

  // Handle presence events
  const handlePresenceEvent = useCallback(
    (event: PresenceEvent) => {
      // Update local state
      setPresences(realtimePresence.getPresences());
      setOnlineCount(realtimePresence.getOnlineCount());

      // Call user callback
      onPresenceEvent?.(event);
    },
    [onPresenceEvent]
  );

  // Join/leave room effect
  useEffect(() => {
    if (!currentRoom?.id || !user) {
      setIsConnected(false);
      return;
    }

    let mounted = true;

    const join = async () => {
      const success = await joinHangoutRoom(
        currentRoom.id,
        user.id,
        {
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
        handlePresenceEvent
      );

      if (mounted) {
        setIsConnected(success);
        if (success) {
          setPresences(realtimePresence.getPresences());
          setOnlineCount(realtimePresence.getOnlineCount());
        }
      }
    };

    join();

    return () => {
      mounted = false;
      leaveHangoutRoom();
      setIsConnected(false);
    };
  }, [currentRoom?.id, user, handlePresenceEvent]);

  // Update status action
  const updateStatus = useCallback(
    async (
      status: RealtimePresenceState['status'],
      activity?: string,
      currentExercise?: string
    ): Promise<boolean> => {
      return updatePresenceStatus(status, activity, currentExercise);
    },
    []
  );

  // Update activity action (keep current status)
  const updateActivity = useCallback(
    async (activity: string, currentExercise?: string): Promise<boolean> => {
      const myPresence = user ? realtimePresence.getPresence(user.id) : undefined;
      const currentStatus = myPresence?.status || 'online';
      return updatePresenceStatus(currentStatus, activity, currentExercise);
    },
    [user]
  );

  // Get my presence
  const myPresence = user ? realtimePresence.getPresence(user.id) : undefined;

  return {
    isConnected,
    onlineCount,
    presences,
    myPresence,
    updateStatus,
    updateActivity,
  };
}

/**
 * Hook to update workout presence with exercise info
 *
 * Call this when the selected exercise changes during a workout
 * to show friends what exercise you're currently doing.
 */
export function useWorkoutPresenceUpdater() {
  const updateWorkoutExercise = useCallback(
    async (exerciseName: string) => {
      return updatePresenceStatus(
        'working_out',
        `Doing ${exerciseName}`,
        exerciseName
      );
    },
    []
  );

  const startWorkout = useCallback(async () => {
    return updatePresenceStatus('working_out', 'Workout in progress');
  }, []);

  const endWorkout = useCallback(async () => {
    return updatePresenceStatus('online', 'Available');
  }, []);

  const takeRest = useCallback(async (duration?: number) => {
    const activity = duration
      ? `Resting (${Math.ceil(duration / 60)}min)`
      : 'Taking a rest';
    return updatePresenceStatus('resting', activity);
  }, []);

  return {
    updateWorkoutExercise,
    startWorkout,
    endWorkout,
    takeRest,
  };
}
