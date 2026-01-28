// src/lib/stores/gamificationStore.ts
// Zustand store for gamification state with AsyncStorage persistence and Supabase sync
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createQueuedJSONStorage } from './storage/createQueuedAsyncStorage';
import type {
  GamificationProfile,
  LevelUpCelebration,
  WorkoutForCalculation,
  MilestoneId,
} from '../gamification/types';
import {
  DEFAULT_GAMIFICATION_PROFILE,
  calculateWorkoutXP,
  getLevelProgress,
  updateStreak,
  updateWorkoutCalendar,
  getLevelTierColor,
  getLevelTierName,
  checkStreakMilestone,
  getCompletedMilestones,
  getNewMilestones,
  calculateLevelUpReward,
} from '../gamification';
import {
  dbUserToGamificationProfile,
  gamificationProfileToDbUpdate,
  fetchGamificationProfile,
  pushGamificationProfile,
  syncGamificationProfile,
} from '../gamification/repositories/gamificationRepository';
import { getUser } from './authStore';
import { networkMonitor } from '../sync/NetworkMonitor';
import type { SyncMetadata } from '../sync/syncTypes';
import { getTodayISO } from '../gamification/streak/tracker';

const STORAGE_KEY = 'gamification.v1';

interface GamificationState {
  profile: GamificationProfile;
  hydrated: boolean;
  _sync: SyncMetadata;
  pendingLevelUp: LevelUpCelebration | null;

  // Actions
  setProfile: (profile: GamificationProfile) => void;
  setHydrated: (value: boolean) => void;

  // Gamification actions
  addXP: (xp: number) => { didLevelUp: boolean; newLevel?: number; previousLevel?: number };
  addTokens: (amount: number) => void;
  spendTokens: (amount: number) => { success: boolean; newBalance?: number };
  updateStreak: (workoutDate?: string) => void;
  processWorkout: (workout: WorkoutForCalculation, xp?: number) => {
    xpEarned: number;
    didLevelUp: boolean;
    newLevel?: number;
    tokensEarned: number;
    streakMilestoneTokens?: number;
  };
  dismissLevelUp: () => void;

  // Sync actions
  pullFromServer: () => Promise<void>;
  pushToServer: () => Promise<void>;
  sync: () => Promise<void>;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      profile: { ...DEFAULT_GAMIFICATION_PROFILE },
      hydrated: false,
      _sync: {
        lastSyncAt: null,
        lastSyncHash: null,
        syncStatus: 'idle',
        syncError: null,
        pendingMutations: 0,
      },
      pendingLevelUp: null,

      setProfile: (profile) =>
        set({
          profile: { ...profile, updatedAt: Date.now() },
        }),

      setHydrated: (value) => set({ hydrated: value }),

      /**
       * Add XP to the profile and check for level ups
       */
      addXP: (xp) => {
        const state = get();
        const newTotalXP = state.profile.totalXP + xp;
        const progress = getLevelProgress(newTotalXP);
        const didLevelUp = progress.currentLevel > state.profile.currentLevel;

        const updates: Partial<GamificationProfile> = {
          totalXP: newTotalXP,
        };

        let newLevel: number | undefined;
        let previousLevel: number | undefined;

        if (didLevelUp) {
          previousLevel = state.profile.currentLevel;
          newLevel = progress.currentLevel;
          updates.currentLevel = newLevel;
          updates.xpToNextLevel = progress.xpToNextLevel;

          // Calculate token reward for level up
          const reward = calculateLevelUpReward(newLevel);

          // Create pending level up celebration
          const celebration: LevelUpCelebration = {
            level: newLevel,
            previousLevel,
            tokensAwarded: reward.amount,
            content: {
              headline: `LEVEL ${newLevel}!`,
              subtitle: `You've reached ${getLevelTierName(newLevel)} tier`,
              flavorText: 'Keep pushing forward!',
            },
          };

          set({ pendingLevelUp: celebration });

          // Add tokens from level up
          updates.forgeTokens = state.profile.forgeTokens + reward.amount;
          updates.tokensEarnedTotal = state.profile.tokensEarnedTotal + reward.amount;
          updates.levelUpCelebrationShown = Date.now();
        }

        set({
          profile: { ...state.profile, ...updates, updatedAt: Date.now() },
        });

        return { didLevelUp, newLevel, previousLevel };
      },

      /**
       * Add Forge Tokens to the profile
       */
      addTokens: (amount) => {
        const state = get();
        set({
          profile: {
            ...state.profile,
            forgeTokens: state.profile.forgeTokens + amount,
            tokensEarnedTotal: state.profile.tokensEarnedTotal + amount,
            updatedAt: Date.now(),
          },
        });
      },

      /**
       * Spend Forge Tokens (if sufficient balance)
       */
      spendTokens: (amount) => {
        const state = get();
        if (state.profile.forgeTokens < amount) {
          return { success: false };
        }

        const newBalance = state.profile.forgeTokens - amount;
        set({
          profile: {
            ...state.profile,
            forgeTokens: newBalance,
            tokensSpentTotal: state.profile.tokensSpentTotal + amount,
            updatedAt: Date.now(),
          },
        });

        return { success: true, newBalance };
      },

      /**
       * Update streak based on a completed workout
       */
      updateStreak: (workoutDate = getTodayISO()) => {
        const state = get();
        const result = updateStreak(state.profile, workoutDate);

        const updates: Partial<GamificationProfile> = {
          currentStreak: result.streak,
          lastWorkoutDate: workoutDate,
        };

        if (result.streak > state.profile.longestStreak) {
          updates.longestStreak = result.streak;
        }

        set({
          profile: { ...state.profile, ...updates, updatedAt: Date.now() },
        });

        return result;
      },

      /**
       * Process a completed workout: calculate XP, update streak, check milestones
       */
      processWorkout: (workout, xpOverride) => {
        const state = get();
        const today = getTodayISO();

        // Calculate XP
        const xpBreakdown = calculateWorkoutXP(workout);
        const xpEarned = xpOverride ?? xpBreakdown.total;

        // Update streak
        const streakResult = updateStreak(state.profile, today);

        // Update workout calendar
        const updatedCalendar = updateWorkoutCalendar(
          state.profile.workoutCalendar,
          today,
          xpEarned
        );

        // Add XP and check for level up
        const levelUpResult = get().addXP(xpEarned);

        // Check for streak milestone
        const streakMilestone = checkStreakMilestone(streakResult.streak);
        let streakMilestoneTokens = 0;
        if (streakMilestone) {
          streakMilestoneTokens = streakMilestone.tokens;
          get().addTokens(streakMilestoneTokens);
        }

        // Check for other milestones
        const totalWorkouts = updatedCalendar.reduce((sum, day) => sum + day.count, 0);
        const newMilestones = getNewMilestones(
          state.profile.milestonesCompleted,
          {
            totalWorkouts,
            totalXP: state.profile.totalXP + xpEarned,
            currentLevel: levelUpResult.newLevel ?? state.profile.currentLevel,
            currentStreak: streakResult.streak,
            totalPRs: 0, // TODO: Track PRs
          }
        );

        let milestoneTokens = 0;
        for (const milestone of newMilestones) {
          milestoneTokens += milestone.tokens;
        }
        get().addTokens(milestoneTokens);

        // Update profile with streak and calendar
        set({
          profile: {
            ...get().profile,
            currentStreak: streakResult.streak,
            lastWorkoutDate: today,
            longestStreak: Math.max(state.profile.longestStreak, streakResult.streak),
            workoutCalendar: updatedCalendar,
            milestonesCompleted: [
              ...state.profile.milestonesCompleted,
              ...newMilestones.map((m) => m.id),
            ],
            updatedAt: Date.now(),
          },
        });

        // Calculate base tokens for workout completion
        const baseTokens = 5 + (workout.fullyCompleted ? 5 : 0);
        get().addTokens(baseTokens);

        return {
          xpEarned,
          didLevelUp: levelUpResult.didLevelUp,
          newLevel: levelUpResult.newLevel,
          tokensEarned: baseTokens + milestoneTokens + streakMilestoneTokens,
          streakMilestoneTokens: streakMilestoneTokens || undefined,
        };
      },

      /**
       * Dismiss the pending level up celebration
       */
      dismissLevelUp: () => {
        set({ pendingLevelUp: null });
      },

      // Sync actions
      pullFromServer: async () => {
        const user = getUser();
        if (!user) {
          console.warn('[gamificationStore] Cannot pull: no user signed in');
          return;
        }

        set({ _sync: { ...get()._sync, syncStatus: 'syncing', syncError: null } });

        try {
          const remoteProfile = await fetchGamificationProfile();

          if (remoteProfile) {
            set({
              profile: remoteProfile,
              _sync: {
                ...get()._sync,
                syncStatus: 'success',
                lastSyncAt: Date.now(),
              },
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
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
          console.warn('[gamificationStore] Cannot push: no user signed in');
          return;
        }

        if (!networkMonitor.isOnline()) {
          console.warn('[gamificationStore] Cannot push: offline');
          return;
        }

        set({
          _sync: { ...get()._sync, syncStatus: 'syncing', syncError: null },
        });

        try {
          const success = await pushGamificationProfile(get().profile);

          set({
            _sync: {
              ...get()._sync,
              syncStatus: success ? 'success' : 'error',
              lastSyncAt: success ? Date.now() : get()._sync.lastSyncAt,
            },
          });

          if (!success) {
            throw new Error('Failed to push gamification data');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
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

      sync: async () => {
        const user = getUser();
        if (!user) {
          console.warn('[gamificationStore] Cannot sync: no user signed in');
          return;
        }

        set({
          _sync: { ...get()._sync, syncStatus: 'syncing', syncError: null },
        });

        try {
          const syncedProfile = await syncGamificationProfile(get().profile);

          if (syncedProfile) {
            set({
              profile: syncedProfile,
              _sync: {
                ...get()._sync,
                syncStatus: 'success',
                lastSyncAt: Date.now(),
              },
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
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
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        profile: state.profile,
        pendingLevelUp: state.pendingLevelUp,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Convenience selectors
export const selectGamificationProfile = (state: GamificationState) => state.profile;
export const selectIsHydrated = (state: GamificationState) => state.hydrated;
export const selectPendingLevelUp = (state: GamificationState) => state.pendingLevelUp;
export const selectCurrentLevel = (state: GamificationState) => state.profile.currentLevel;
export const selectTotalXP = (state: GamificationState) => state.profile.totalXP;
export const selectCurrentStreak = (state: GamificationState) => state.profile.currentStreak;
export const selectForgeTokens = (state: GamificationState) => state.profile.forgeTokens;

// Hooks for common access patterns
export function useGamificationProfile(): GamificationProfile {
  return useGamificationStore(selectGamificationProfile);
}

export function useIsGamificationHydrated(): boolean {
  return useGamificationStore(selectIsHydrated);
}

export function usePendingLevelUp(): LevelUpCelebration | null {
  return useGamificationStore(selectPendingLevelUp);
}

export function useCurrentLevel(): number {
  return useGamificationStore(selectCurrentLevel);
}

export function useTotalXP(): number {
  return useGamificationStore(selectTotalXP);
}

export function useCurrentStreak(): number {
  return useGamificationStore(selectCurrentStreak);
}

export function useForgeTokens(): number {
  return useGamificationStore(selectForgeTokens);
}

// Imperative getters for non-React code
export function getGamificationProfile(): GamificationProfile {
  return useGamificationStore.getState().profile;
}

export function addGamificationXP(xp: number) {
  return useGamificationStore.getState().addXP(xp);
}

export function addGamificationTokens(amount: number) {
  useGamificationStore.getState().addTokens(amount);
}

export function updateGamificationStreak(workoutDate?: string) {
  useGamificationStore.getState().updateStreak(workoutDate);
}

export function processGamificationWorkout(
  workout: WorkoutForCalculation,
  xp?: number
) {
  return useGamificationStore.getState().processWorkout(workout, xp);
}

export function dismissGamificationLevelUp() {
  useGamificationStore.getState().dismissLevelUp();
}
