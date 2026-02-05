import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Buddy, BuddyTier } from '../buddyTypes';
import { buddies } from '../buddyData';
import { createQueuedJSONStorage } from './storage/createQueuedAsyncStorage';
import { RevenueCatService } from '../iap/RevenueCatService';

/**
 * Buddy Store - Zustand store for AI Gym Buddy system state
 *
 * Manages:
 * - Currently equipped buddy
 * - Unlocked buddies
 * - User's buddy tier (basic/premium/legendary)
 * - Session memory for buddy interactions
 */

export interface BuddyStoreState {
  // Current buddy selection
  currentBuddyId: string | null;

  // Unlocked buddies (buddyId -> unlocked)
  unlockedBuddies: Record<string, boolean>;

  // User's tier level
  tier: BuddyTier;

  // Session memory for context-aware messaging
  sessionMemory: {
    workoutStartTime: number | null;
    setCount: number;
    lastRestDuration: number | null;
    lastCueTime: number | null;
    cuesShown: string[]; // track recent cues to avoid repetition
  };

  // IAP purchase status
  purchasedBuddies: Record<string, boolean>;

  // Forge token balance for unlocking basic buddies
  forgeTokens: number;
}

export interface BuddyStoreActions {
  // Buddy selection
  equipBuddy: (buddyId: string) => boolean;
  unlockBuddy: (buddyId: string) => boolean;

  // Tier management
  setTier: (tier: BuddyTier) => void;

  // Session memory
  startWorkoutSession: () => void;
  recordSet: () => void;
  recordRest: (durationMs: number) => void;
  recordCue: (cueId: string) => void;

  // IAP integration
  purchaseBuddy: (buddyId: string) => Promise<boolean>;
  initializeIAP: () => Promise<void>;
  getProductInfo: (buddyId: string) => Promise<{ title: string; price: string; currency: string; localizedPrice: string } | null>;
  restorePurchases: () => Promise<void>;

  // Forge tokens
  addForgeTokens: (amount: number) => void;
  spendForgeTokens: (amount: number) => boolean;

  // Reset for new sessions
  resetSession: () => void;
}

const initialState: BuddyStoreState = {
  currentBuddyId: 'coach', // Default to Coach buddy
  unlockedBuddies: {
    'coach': true,
    'hype': true,
    'chill': true,
    'girl_power': true,
    'mindful_movement': true,
  },
  tier: 'basic',
  sessionMemory: {
    workoutStartTime: null,
    setCount: 0,
    lastRestDuration: null,
    lastCueTime: null,
    cuesShown: [],
  },
  purchasedBuddies: {},
  forgeTokens: 100, // Starting balance for demo
};

export const useBuddyStore = create<BuddyStoreState & BuddyStoreActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Equip a buddy (must be unlocked)
      equipBuddy: (buddyId: string) => {
        const state = get();
        if (state.unlockedBuddies[buddyId]) {
          set({ currentBuddyId: buddyId });
          return true;
        }
        return false;
      },

      // Unlock a buddy (free, forge tokens, or IAP)
      unlockBuddy: (buddyId: string) => {
        const buddy = buddies.find(b => b.id === buddyId);
        if (!buddy) return false;

        const state = get();

        // Check if already unlocked
        if (state.unlockedBuddies[buddyId]) return true;

        // Check unlock method
        switch (buddy.unlockMethod) {
          case 'free':
            set({
              unlockedBuddies: { ...state.unlockedBuddies, [buddyId]: true }
            });
            return true;

          case 'forge_tokens':
            if (buddy.unlockCost && state.forgeTokens >= buddy.unlockCost) {
              set({
                unlockedBuddies: { ...state.unlockedBuddies, [buddyId]: true },
                forgeTokens: state.forgeTokens - (buddy.unlockCost || 0)
              });
              return true;
            }
            return false;

          case 'iap':
            // IAP buddies are unlocked via purchaseBuddy
            return state.purchasedBuddies[buddyId] === true;

          default:
            return false;
        }
      },

      // Set user tier
      setTier: (tier: BuddyTier) => set({ tier }),

      // Session memory management
      startWorkoutSession: () => set({
        sessionMemory: {
          workoutStartTime: Date.now(),
          setCount: 0,
          lastRestDuration: null,
          lastCueTime: null,
          cuesShown: [],
        }
      }),

      recordSet: () => set(state => ({
        sessionMemory: {
          ...state.sessionMemory,
          setCount: state.sessionMemory.setCount + 1
        }
      })),

      recordRest: (durationMs: number) => set(state => ({
        sessionMemory: {
          ...state.sessionMemory,
          lastRestDuration: durationMs
        }
      })),

      recordCue: (cueId: string) => set(state => {
        const updatedCues = [...state.sessionMemory.cuesShown, cueId];
        // Keep only last 10 cues to avoid repetition
        if (updatedCues.length > 10) {
          updatedCues.shift();
        }
        return {
          sessionMemory: {
            ...state.sessionMemory,
            lastCueTime: Date.now(),
            cuesShown: updatedCues
          }
        };
      }),

      // IAP purchase - using RevenueCat
      purchaseBuddy: async (buddyId: string) => {
        const buddy = buddies.find(b => b.id === buddyId);
        if (!buddy || buddy.unlockMethod !== 'iap') return false;

        try {
          // Start purchase flow through RevenueCat
          const success = await RevenueCatService.purchaseBuddy(buddyId);
          if (success) {
            console.log(`[BuddyStore] Purchase completed for ${buddyId}`);
            // Unlock the buddy immediately since RevenueCat confirmed success
            set(state => ({
              purchasedBuddies: { ...state.purchasedBuddies, [buddyId]: true },
              unlockedBuddies: { ...state.unlockedBuddies, [buddyId]: true }
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error(`[BuddyStore] Failed to purchase buddy ${buddyId}:`, error);
          return false;
        }
      },

      // Initialize RevenueCat service
      initializeIAP: async () => {
        try {
          // Set up success callback that updates store when purchase completes
          RevenueCatService.setPurchaseSuccessCallback((buddyId: string) => {
            set(state => ({
              purchasedBuddies: { ...state.purchasedBuddies, [buddyId]: true },
              unlockedBuddies: { ...state.unlockedBuddies, [buddyId]: true }
            }));
            console.log(`[BuddyStore] Buddy ${buddyId} unlocked via RevenueCat`);
          });

          await RevenueCatService.initialize();
          console.log('[BuddyStore] RevenueCat service initialized');
        } catch (error) {
          console.error('[BuddyStore] Failed to initialize RevenueCat service:', error);
        }
      },

      // Get product info for display in UI
      getProductInfo: async (buddyId: string) => {
        const buddy = buddies.find(b => b.id === buddyId);
        if (!buddy || !buddy.iapProductId) return null;

        try {
          const productInfo = await RevenueCatService.getProductForBuddy(buddyId);
          if (!productInfo) return null;

          return {
            title: productInfo.title,
            price: String(productInfo.price),
            currency: productInfo.currencyCode,
            localizedPrice: productInfo.priceString,
          };
        } catch (error) {
          console.error(`[BuddyStore] Failed to get product info for ${buddyId}:`, error);
          return null;
        }
      },

      // Restore previous purchases (important for iOS)
      restorePurchases: async () => {
        try {
          await RevenueCatService.restorePurchases();

          // After restoring, check which buddies are unlocked via entitlements
          const unlockedIds = RevenueCatService.getUnlockedBuddyIds();
          if (unlockedIds.length > 0) {
            set(state => {
              const newPurchased = { ...state.purchasedBuddies };
              const newUnlocked = { ...state.unlockedBuddies };
              for (const id of unlockedIds) {
                newPurchased[id] = true;
                newUnlocked[id] = true;
              }
              return { purchasedBuddies: newPurchased, unlockedBuddies: newUnlocked };
            });
          }

          console.log('[BuddyStore] Purchases restored via RevenueCat');
        } catch (error) {
          console.error('[BuddyStore] Failed to restore purchases:', error);
        }
      },

      // Forge tokens
      addForgeTokens: (amount: number) => set(state => ({
        forgeTokens: state.forgeTokens + amount
      })),

      spendForgeTokens: (amount: number) => {
        const state = get();
        if (state.forgeTokens >= amount) {
          set({ forgeTokens: state.forgeTokens - amount });
          return true;
        }
        return false;
      },

      // Reset session memory
      resetSession: () => set({
        sessionMemory: {
          workoutStartTime: null,
          setCount: 0,
          lastRestDuration: null,
          lastCueTime: null,
          cuesShown: [],
        }
      }),
    }),
    {
      name: 'buddy-store.v1',
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        // Only persist certain parts of state
        currentBuddyId: state.currentBuddyId,
        unlockedBuddies: state.unlockedBuddies,
        tier: state.tier,
        purchasedBuddies: state.purchasedBuddies,
        forgeTokens: state.forgeTokens,
      }),
    }
  )
);

// Selectors
export const useCurrentBuddy = () => {
  const buddyId = useBuddyStore(state => state.currentBuddyId);
  return buddies.find(b => b.id === buddyId) || null;
};

export const useUnlockedBuddies = () => {
  const unlocked = useBuddyStore(state => state.unlockedBuddies);
  return buddies.filter(buddy => unlocked[buddy.id]);
};

export const useBuddyTier = () => useBuddyStore(state => state.tier);

export const useForgeTokens = () => useBuddyStore(state => state.forgeTokens);

export const useSessionMemory = () => useBuddyStore(state => state.sessionMemory);