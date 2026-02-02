// src/lib/hooks/useSyncStatus.ts
// Hooks for accessing sync status across all stores

import { useState, useEffect } from 'react';
import type { SyncStatus, SyncStats } from '../sync/syncTypes';
import {
  syncOrchestrator,
  useIsSyncing as useOrchestratorSyncing,
  useSyncStats as useOrchestratorStats,
} from '../sync/SyncOrchestrator';
import { getWorkoutSyncStatus } from '../stores/workoutStore';
import { getRoutinesSyncStatus } from '../stores/routinesStore';
import { getWorkoutPlanSyncStatus } from '../stores/workoutPlanStore';
import { getFriendsSyncStatus } from '../stores/friendsStore';
import { getSocialSyncStatus } from '../stores/socialStore';
import { getFeedSyncStatus } from '../stores/feedStore';
import { getChatSyncStatus } from '../stores/chatStore';

/**
 * Get sync status for a specific store
 */
function getStoreSyncStatus(storeName: string): SyncStatus {
  switch (storeName) {
    case 'workout':
      return getWorkoutSyncStatus().syncStatus;
    case 'routines':
      return getRoutinesSyncStatus().syncStatus;
    case 'workoutPlan':
      return getWorkoutPlanSyncStatus().syncStatus;
    case 'friends':
      return getFriendsSyncStatus().syncStatus;
    case 'social':
      return getSocialSyncStatus().syncStatus;
    case 'feed':
      return getFeedSyncStatus().syncStatus;
    case 'chat':
      return getChatSyncStatus().syncStatus;
    default:
      return 'idle';
  }
}

/**
 * Hook to get sync status for all stores
 */
export function useAllSyncStatus(): Record<string, SyncStatus> {
  const [statuses, setStatuses] = useState<Record<string, SyncStatus>>({
    workout: 'idle',
    routines: 'idle',
    workoutPlan: 'idle',
    friends: 'idle',
    social: 'idle',
    feed: 'idle',
    chat: 'idle',
  });

  useEffect(() => {
    // Initial load
    setStatuses({
      workout: getStoreSyncStatus('workout'),
      routines: getStoreSyncStatus('routines'),
      workoutPlan: getStoreSyncStatus('workoutPlan'),
      friends: getStoreSyncStatus('friends'),
      social: getStoreSyncStatus('social'),
      feed: getStoreSyncStatus('feed'),
      chat: getStoreSyncStatus('chat'),
    });

    // Poll for updates (in a real app, this would use a reactive store)
    const interval = setInterval(() => {
      setStatuses({
        workout: getStoreSyncStatus('workout'),
        routines: getStoreSyncStatus('routines'),
        workoutPlan: getStoreSyncStatus('workoutPlan'),
        friends: getStoreSyncStatus('friends'),
        social: getStoreSyncStatus('social'),
        feed: getStoreSyncStatus('feed'),
        chat: getStoreSyncStatus('chat'),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return statuses;
}

/**
 * Hook to check if any store is syncing
 */
export function useIsSyncing(): boolean {
  return useOrchestratorSyncing();
}

/**
 * Hook to get overall sync statistics
 */
export function useSyncStats(): SyncStats {
  return useOrchestratorStats();
}

/**
 * Hook to trigger manual sync
 */
export function useSyncActions() {
  return {
    syncAll: async () => {
      await syncOrchestrator.triggerSync();
    },
    syncStore: async (storeName: string) => {
      await syncOrchestrator.triggerStoreSync(storeName);
    },
  };
}

/**
 * Hook to get sync status for a specific store
 */
export function useStoreSyncStatus(storeName: string): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>('idle');

  useEffect(() => {
    setStatus(getStoreSyncStatus(storeName));

    const interval = setInterval(() => {
      setStatus(getStoreSyncStatus(storeName));
    }, 1000);

    return () => clearInterval(interval);
  }, [storeName]);

  return status;
}

/**
 * Hook to get pending mutation counts
 */
export function usePendingMutations(): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load initial counts
    import('../sync').then(({ getPendingCounts }) => {
      getPendingCounts().then(setCounts);
    });

    // Refresh periodically
    const interval = setInterval(() => {
      import('../sync').then(({ getPendingCounts }) => {
        getPendingCounts().then(setCounts);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return counts;
}

/**
 * Combined hook for sync UI
 * Returns status, pending counts, and sync actions
 */
export function useSyncState() {
  const isSyncing = useIsSyncing();
  const stats = useSyncStats();
  const statuses = useAllSyncStatus();
  const pending = usePendingMutations();
  const { syncAll, syncStore } = useSyncActions();

  return {
    isSyncing,
    stats,
    statuses,
    pending,
    syncAll,
    syncStore,

    // Derived values
    hasErrors: Object.values(statuses).some(s => s === 'error'),
    totalPending: Object.values(pending).reduce((sum, count) => sum + count, 0),
    lastSync: stats.lastSyncAt ? new Date(stats.lastSyncAt) : null,
  };
}
