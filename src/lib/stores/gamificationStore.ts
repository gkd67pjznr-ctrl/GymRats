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
  SHOP_ITEMS,
  getShopItem,
  DEFAULT_INVENTORY,
  type ShopItem,
  type ShopCategory,
  type UserInventory,
} from '../gamification';
import { getDefaultRoomDecorations } from '../hangout/roomSlots';
import type { RoomDecorationsState } from '../hangout/roomSlots';
import {
  dbUserToGamificationProfile,
  gamificationProfileToDbUpdate,
  fetchGamificationProfile,
  pushGamificationProfile,
  syncGamificationProfile,
} from '../gamification/repositories/gamificationRepository';
import { getUser } from './authStore';
import { getLifetimeStats } from './userStatsStore';
import { networkMonitor } from '../sync/NetworkMonitor';
import type { SyncMetadata } from '../sync/syncTypes';
import { getTodayISO } from '../gamification/streak/tracker';

const STORAGE_KEY = 'gamification.v1';

interface GamificationState {
  profile: GamificationProfile;
  hydrated: boolean;
  _sync: SyncMetadata;
  pendingLevelUp: LevelUpCelebration | null;

  // Shop/Inventory
  inventory: UserInventory;

  // Room Decorations (slot-based)
  roomDecorations: RoomDecorationsState;

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

  // Shop actions
  purchaseItem: (itemId: string) => { success: boolean; error?: string };
  equipItem: (itemId: string, category: ShopCategory) => { success: boolean; error?: string };
  equipRoomDecoration: (slotId: string, itemId: string) => { success: boolean; error?: string };

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
      inventory: { ...DEFAULT_INVENTORY },
      roomDecorations: getDefaultRoomDecorations(),

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
        // Get totalPRs from userStatsStore (single source of truth for user statistics)
        const userLifetimeStats = getLifetimeStats();
        const newMilestones = getNewMilestones(
          state.profile.milestonesCompleted,
          {
            totalWorkouts,
            totalXP: state.profile.totalXP + xpEarned,
            currentLevel: levelUpResult.newLevel ?? state.profile.currentLevel,
            currentStreak: streakResult.streak,
            totalPRs: userLifetimeStats.totalPRs,
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

      /**
       * Purchase shop item with forge tokens
       */
      purchaseItem: (itemId) => {
        const state = get();
        const item = getShopItem(itemId);

        if (!item) {
          return { success: false, error: 'Item not found' };
        }

        // Check if already owned
        if (state.inventory.ownedItems.includes(itemId)) {
          return { success: false, error: 'Already owned' };
        }

        // Check currency (forge tokens)
        if (state.profile.forgeTokens < item.cost) {
          return { success: false, error: 'Insufficient tokens' };
        }

        // Purchase successful - deduct tokens and add to inventory
        set((state) => ({
          profile: {
            ...state.profile,
            forgeTokens: state.profile.forgeTokens - item.cost,
            tokensSpentTotal: state.profile.tokensSpentTotal + item.cost,
            updatedAt: Date.now(),
          },
          inventory: {
            ...state.inventory,
            ownedItems: [...state.inventory.ownedItems, itemId],
          },
        }));

        return { success: true };
      },

      /**
       * Equip item from inventory
       */
      equipItem: (itemId, category) => {
        const state = get();
        const item = getShopItem(itemId);

        if (!item) {
          return { success: false, error: 'Item not found' };
        }

        // Check if owned
        if (!state.inventory.ownedItems.includes(itemId)) {
          return { success: false, error: 'Not owned' };
        }

        // Update equipped item based on category
        set((state) => {
          const inventory = { ...state.inventory };

          switch (category) {
            case 'personalities':
              inventory.equippedPersonality = itemId;
              break;
            case 'themes':
              inventory.equippedTheme = itemId;
              break;
            case 'card_skins':
              inventory.equippedCardSkin = itemId;
              break;
            case 'profile_frames':
              inventory.equippedFrame = itemId;
              break;
            case 'titles':
              inventory.equippedTitle = itemId;
              break;
            case 'profile_badges':
              // Badges can have multiple equipped
              if (!inventory.equippedBadges.includes(itemId)) {
                inventory.equippedBadges = [...inventory.equippedBadges, itemId];
              }
              break;
            case 'avatar_cosmetics':
              // Handle avatar cosmetics based on item ID prefix
              if (itemId.startsWith('hair_')) {
                inventory.equippedHairstyle = itemId;
              } else if (itemId.startsWith('outfit_')) {
                inventory.equippedOutfit = itemId;
              } else if (itemId.startsWith('acc_')) {
                // Accessories can have multiple equipped (but not 'acc_none')
                if (itemId === 'acc_none') {
                  inventory.equippedAccessories = ['acc_none'];
                } else if (!inventory.equippedAccessories.includes(itemId)) {
                  // Remove 'acc_none' if equipping a real accessory
                  const withoutNone = inventory.equippedAccessories.filter(a => a !== 'acc_none');
                  inventory.equippedAccessories = [...withoutNone, itemId];
                }
              }
              break;
            case 'room_decorations':
              // Decorations are added to owned but not equipped here
              // They are placed in the room separately
              if (!inventory.ownedDecorations.includes(itemId)) {
                inventory.ownedDecorations = [...inventory.ownedDecorations, itemId];
              }
              break;
          }

          return { inventory };
        });

        return { success: true };
      },

      /**
       * Equip decoration to a specific room slot
       */
      equipRoomDecoration: (slotId, itemId) => {
        const state = get();
        const item = getShopItem(itemId);

        if (!item) {
          return { success: false, error: 'Item not found' };
        }

        // Check if owned (or is free/default)
        const isOwned = state.inventory.ownedItems.includes(itemId) ||
                        state.inventory.ownedDecorations.includes(itemId) ||
                        item.cost === 0;

        if (!isOwned) {
          return { success: false, error: 'Not owned' };
        }

        // Update room decoration state
        set((state) => ({
          roomDecorations: {
            ...state.roomDecorations,
            [slotId]: itemId,
          },
        }));

        return { success: true };
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
        inventory: state.inventory,
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

// ========== Shop/Inventory Hooks ==========

export const selectInventory = (state: GamificationState) => state.inventory;
export const selectOwnedItems = (state: GamificationState) => state.inventory.ownedItems;

export function useInventory(): UserInventory {
  return useGamificationStore(selectInventory);
}

export function useOwnedItems(): string[] {
  return useGamificationStore(selectOwnedItems);
}

// ========== Room Decorations Hooks ==========

export const selectRoomDecorations = (state: GamificationState) => state.roomDecorations;

export function useRoomDecorations(): RoomDecorationsState {
  return useGamificationStore(selectRoomDecorations);
}

export function useShopItems(category?: ShopCategory): ShopItem[] {
  const inventory = useGamificationStore(selectInventory);
  const items = category
    ? SHOP_ITEMS.filter(item => item.category === category)
    : SHOP_ITEMS;

  return items.map(item => ({
    ...item,
    isOwned:
      inventory.ownedItems.includes(item.id) ||
      (item.category === 'room_decorations' && inventory.ownedDecorations.includes(item.id)) ||
      item.cost === 0,
    isEquipped: getCategoryEquipped(item.category, item.id, inventory),
  }));
}

function getCategoryEquipped(category: ShopCategory, itemId: string, inventory: UserInventory): boolean {
  switch (category) {
    case 'personalities':
      return inventory.equippedPersonality === itemId;
    case 'themes':
      return inventory.equippedTheme === itemId;
    case 'card_skins':
      return inventory.equippedCardSkin === itemId;
    case 'profile_frames':
      return inventory.equippedFrame === itemId;
    case 'titles':
      return inventory.equippedTitle === itemId;
    case 'profile_badges':
      return inventory.equippedBadges.includes(itemId);
    case 'avatar_cosmetics':
      if (itemId.startsWith('hair_')) {
        return inventory.equippedHairstyle === itemId;
      } else if (itemId.startsWith('outfit_')) {
        return inventory.equippedOutfit === itemId;
      } else if (itemId.startsWith('acc_')) {
        return inventory.equippedAccessories.includes(itemId);
      }
      return false;
    case 'room_decorations':
      return inventory.ownedDecorations.includes(itemId);
    default:
      return false;
  }
}

// ========== Imperative Shop Functions ==========

export function purchaseShopItem(itemId: string): { success: boolean; error?: string } {
  return useGamificationStore.getState().purchaseItem(itemId);
}

export function equipShopItem(itemId: string, category: ShopCategory): { success: boolean; error?: string } {
  return useGamificationStore.getState().equipItem(itemId, category);
}

export function equipRoomDecoration(slotId: string, itemId: string): { success: boolean; error?: string } {
  return useGamificationStore.getState().equipRoomDecoration(slotId, itemId);
}

export function getUserInventory(): UserInventory {
  return useGamificationStore.getState().inventory;
}

export function getRoomDecorations(): RoomDecorationsState {
  return useGamificationStore.getState().roomDecorations;
}
