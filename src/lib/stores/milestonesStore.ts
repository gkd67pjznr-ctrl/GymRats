/**
 * Milestones Store
 * Zustand store for Forge Milestones with AsyncStorage persistence and Supabase sync
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createQueuedJSONStorage } from './storage/createQueuedAsyncStorage';
import type {
  ForgeMilestone,
  EarnedMilestone,
  MilestoneUserStats,
  MilestoneCelebration,
} from '../milestones/types';
import { getNewlyEarnedMilestones, getMilestonesWithProgress } from '../milestones/checker';
import { getUser } from './authStore';
import type { SyncMetadata } from '../sync/syncTypes';
import { networkMonitor } from '../sync/NetworkMonitor';

const STORAGE_KEY = 'milestones.v1';

interface MilestonesState {
  // ========== Data ==========
  /** Map of milestone ID to earned timestamp */
  earnedMilestones: Record<string, number>;
  /** Pending milestone celebration to show */
  pendingCelebration: MilestoneCelebration | null;

  // ========== Hydration & Sync ==========
  hydrated: boolean;
  _sync: SyncMetadata;

  // ========== Actions ==========
  setHydrated: (value: boolean) => void;

  /** Check and award new milestones based on current stats */
  checkMilestones: (stats: MilestoneUserStats) => MilestoneCelebration[];

  /** Manually award a milestone (for testing/admin) */
  awardMilestone: (milestoneId: string) => void;

  /** Dismiss pending celebration */
  dismissCelebration: () => void;

  /** Get all milestones with progress for UI display */
  getMilestonesWithProgress: (stats: MilestoneUserStats) => void;

  /** Sync actions */
  pullFromServer: () => Promise<void>;
  pushToServer: () => Promise<void>;
  sync: () => Promise<void>;
}

export const useMilestonesStore = create<MilestonesState>()(
  persist(
    (set, get) => ({
      earnedMilestones: {},
      pendingCelebration: null,
      hydrated: false,
      _sync: {
        lastSyncAt: null,
        lastSyncHash: null,
        syncStatus: 'idle',
        syncError: null,
        pendingMutations: 0,
      },

      setHydrated: (value) => set({ hydrated: value }),

      /**
       * Check for newly earned milestones based on current stats
       * Returns array of celebrations (one per newly earned milestone)
       */
      checkMilestones: (stats) => {
        const state = get();
        const previouslyEarnedIds = Object.keys(state.earnedMilestones);

        const newlyEarned = getNewlyEarnedMilestones(stats, previouslyEarnedIds);

        if (newlyEarned.length === 0) {
          return [];
        }

        // Update earned milestones
        const now = Date.now();
        const newEarnedEntries: Record<string, number> = {};

        for (const milestone of newlyEarned) {
          newEarnedEntries[milestone.id] = now;
        }

        set((state) => ({
          earnedMilestones: { ...state.earnedMilestones, ...newEarnedEntries },
        }));

        // Create celebrations for each new milestone
        const celebrations: MilestoneCelebration[] = newlyEarned.map(milestone => ({
          milestone,
          isNew: true,
          earnedAt: now,
        }));

        // Set the first celebration as pending (show one at a time)
        if (celebrations.length > 0) {
          set({ pendingCelebration: celebrations[0] });
        }

        return celebrations;
      },

      /**
       * Manually award a milestone (for testing/admin purposes)
       */
      awardMilestone: (milestoneId) => {
        const state = get();

        if (state.earnedMilestones[milestoneId]) {
          return; // Already earned
        }

        set((state) => ({
          earnedMilestones: {
            ...state.earnedMilestones,
            [milestoneId]: Date.now(),
          },
        }));
      },

      /**
       * Dismiss the pending celebration
       */
      dismissCelebration: () => {
        set({ pendingCelebration: null });
      },

      /**
       * Get milestones with progress (this is a selector, not a state updater)
       * This method is for imperative use outside React
       */
      getMilestonesWithProgress: (stats) => {
        // This is a no-op in the store - use the selector function instead
        // Kept for API compatibility
        return;
      },

      // ========== Sync Actions ==========

      /**
       * Pull earned milestones from server
       */
      pullFromServer: async () => {
        const user = getUser();
        if (!user) {
          console.warn('[milestonesStore] Cannot pull: no user signed in');
          return;
        }

        set({ _sync: { ...get()._sync, syncStatus: 'syncing', syncError: null } });

        try {
          // TODO: Implement fetch from Supabase when table is created
          // For now, we'll use local-only storage
          set({
            _sync: {
              ...get()._sync,
              syncStatus: 'success',
              lastSyncAt: Date.now(),
            },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          set({
            _sync: {
              ...get()._sync,
              syncStatus: 'error',
              syncError: errorMessage,
            },
          });
        }
      },

      /**
       * Push earned milestones to server
       */
      pushToServer: async () => {
        const user = getUser();
        if (!user) {
          console.warn('[milestonesStore] Cannot push: no user signed in');
          return;
        }

        if (!networkMonitor.isOnline()) {
          console.warn('[milestonesStore] Cannot push: offline');
          return;
        }

        set({
          _sync: { ...get()._sync, syncStatus: 'syncing', syncError: null },
        });

        try {
          // TODO: Implement push to Supabase when table is created
          // For now, we'll use local-only storage
          set({
            _sync: {
              ...get()._sync,
              syncStatus: 'success',
              lastSyncAt: Date.now(),
            },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          set({
            _sync: {
              ...get()._sync,
              syncStatus: 'error',
              syncError: errorMessage,
            },
          });
        }
      },

      /**
       * Full sync (pull then push)
       */
      sync: async () => {
        const user = getUser();
        if (!user) {
          console.warn('[milestonesStore] Cannot sync: no user signed in');
          return;
        }

        set({
          _sync: { ...get()._sync, syncStatus: 'syncing', syncError: null },
        });

        try {
          // Pull first (server wins)
          await get().pullFromServer();

          // Then push local changes
          await get().pushToServer();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          set({
            _sync: {
              ...get()._sync,
              syncStatus: 'error',
              syncError: errorMessage,
            },
          });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        earnedMilestones: state.earnedMilestones,
        pendingCelebration: state.pendingCelebration,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// ========== Selectors ==========

export const selectEarnedMilestones = (state: MilestonesState) => state.earnedMilestones;
export const selectPendingCelebration = (state: MilestonesState) => state.pendingCelebration;
export const selectIsHydrated = (state: MilestonesState) => state.hydrated;

// ========== Hooks ==========

/**
 * Get map of earned milestone IDs to timestamps
 */
export function useEarnedMilestones(): Record<string, number> {
  return useMilestonesStore(selectEarnedMilestones);
}

/**
 * Get pending milestone celebration
 */
export function usePendingMilestoneCelebration(): MilestoneCelebration | null {
  return useMilestonesStore(selectPendingCelebration);
}

/**
 * Check if store is hydrated
 */
export function useIsMilestonesHydrated(): boolean {
  return useMilestonesStore(selectIsHydrated);
}

// ========== Imperative Functions ==========

/**
 * Check milestones and return any newly earned ones (imperative)
 */
export function checkForgeMilestones(stats: MilestoneUserStats): MilestoneCelebration[] {
  return useMilestonesStore.getState().checkMilestones(stats);
}

/**
 * Award a specific milestone (for testing/admin)
 */
export function awardForgeMilestone(milestoneId: string): void {
  useMilestonesStore.getState().awardMilestone(milestoneId);
}

/**
 * Dismiss pending celebration (imperative)
 */
export function dismissMilestoneCelebration(): void {
  useMilestonesStore.getState().dismissCelebration();
}

/**
 * Get milestones with progress for UI
 */
export function useMilestonesWithProgress(stats: MilestoneUserStats) {
  const earnedMilestones = useEarnedMilestones();
  return getMilestonesWithProgress(stats, earnedMilestones);
}
