/**
 * Theme Pack Store
 *
 * Zustand store for managing theme pack state, purchases, and equipment.
 * Integrates with RevenueCat for IAP and existing themeStore for legacy support.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createQueuedJSONStorage } from '../stores/storage/createQueuedAsyncStorage';
import { RevenueCatService } from '../iap/RevenueCatService';
import { useThemeStore } from '../stores/themeStore';
import { useBuddyStore } from '../stores/buddyStore';
import type {
  ThemePack,
  ThemePackState,
  ThemePackActions,
  ResolvedTheme,
  ThemePackColors,
  ThemePackTypography,
  ThemePackMotion,
  ThemePackAudio,
  ThemePackParticles,
  ThemePackCelebrations,
} from './types';
import { DEFAULT_THEME_PACKS, DEFAULT_PACK_ID } from './defaultPacks';

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'theme-packs.v1';

// ============================================
// DEFAULT VALUES
// ============================================

const DEFAULT_COLORS: Required<ThemePackColors> = {
  background: '#0a0a0a',
  surface: '#141414',
  surfaceElevated: '#1a1a1a',
  border: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#666666',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  primary: '#b4f72a',
  primarySoft: 'rgba(180, 247, 42, 0.15)',
  secondary: '#a855f7',
  accent: '#b4f72a',
  accentGlow: 'rgba(180, 247, 42, 0.5)',
  ranks: {
    iron: '#71717a',
    bronze: '#d97706',
    silver: '#9ca3af',
    gold: '#fbbf24',
    platinum: '#06b6d4',
    diamond: '#a78bfa',
    mythic: '#f472b6',
  },
  gradients: {
    hero: ['#b4f72a', '#22c55e'],
    card: ['#1a1a1a', '#141414'],
    celebration: ['#b4f72a', '#a855f7', '#ec4899'],
  },
};

const DEFAULT_TYPOGRAPHY: Required<ThemePackTypography> = {
  fontFamily: 'System',
  weights: {
    hero: '900',
    heading: '800',
    body: '600',
    caption: '600',
  },
  sizeScale: 1.0,
  letterSpacing: {
    hero: -0.5,
    heading: -0.3,
    body: 0,
  },
  treatment: 'none',
};

const DEFAULT_MOTION: Required<ThemePackMotion> = {
  durationScale: 1.0,
  easing: {
    enter: 'ease-out-back',
    exit: 'ease-in',
    emphasis: 'spring',
  },
  toastAnimation: {
    enter: 'slide-up',
    exit: 'fade',
    holdDurationMs: 3000,
  },
  enableParticles: true,
  enableGlow: true,
  enableShake: true,
};

const DEFAULT_AUDIO: Required<ThemePackAudio> = {
  sfx: {
    setLogged: undefined,
    prWeight: undefined,
    prRep: undefined,
    prE1rm: undefined,
    rankUp: undefined,
    levelUp: undefined,
    workoutComplete: undefined,
    celebration: undefined,
    error: undefined,
    tap: undefined,
  },
  volumes: {
    sfx: 0.8,
    voice: 1.0,
    ambient: 0.3,
  },
  ambientTrack: undefined,
};

const DEFAULT_PARTICLES: Required<ThemePackParticles> = {
  shape: 'confetti',
  colors: ['#b4f72a', '#22c55e', '#a855f7', '#ec4899'],
  count: 50,
  speed: 1.0,
  gravity: 0.5,
  spread: 45,
  events: {
    pr: { shape: 'confetti', count: 80 },
    rankUp: { shape: 'star', count: 100 },
    levelUp: { shape: 'spark', count: 60 },
    workoutComplete: { shape: 'confetti', count: 150, duration: 5000 },
  },
};

const DEFAULT_CELEBRATIONS: Required<ThemePackCelebrations> = {
  prCelebration: {
    style: 'confetti',
    intensity: 'normal',
  },
  rankUpCelebration: {
    style: 'badge-reveal',
    showBadge: true,
  },
  workoutCompleteCelebration: {
    style: 'summary-card',
    showStats: true,
  },
};

// ============================================
// INITIAL STATE
// ============================================

const initialState: ThemePackState = {
  availablePacks: DEFAULT_THEME_PACKS,
  purchasedPackIds: [],
  equippedPackId: DEFAULT_PACK_ID,
  isLoading: false,
  error: null,
  lastSyncAt: null,
};

// ============================================
// STORE
// ============================================

export const useThemePackStore = create<ThemePackState & ThemePackActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Fetch packs from remote (Supabase or config)
      fetchPacks: async () => {
        set({ isLoading: true, error: null });

        try {
          // For now, use default packs
          // TODO: Fetch from Supabase for dynamic pack management
          set({
            availablePacks: DEFAULT_THEME_PACKS,
            isLoading: false,
            lastSyncAt: Date.now(),
          });
        } catch (error) {
          console.error('[ThemePackStore] Failed to fetch packs:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch packs',
          });
        }
      },

      // Equip a pack
      equipPack: (packId: string) => {
        const state = get();
        const pack = state.availablePacks.find(p => p.id === packId);

        if (!pack) {
          console.warn(`[ThemePackStore] Pack not found: ${packId}`);
          return false;
        }

        // Check if owned (free packs are always owned)
        if (pack.tier !== 'free' && !state.purchasedPackIds.includes(packId)) {
          console.warn(`[ThemePackStore] Pack not purchased: ${packId}`);
          return false;
        }

        set({ equippedPackId: packId });

        // Sync with legacy themeStore if pack has theme config
        // This ensures backwards compatibility
        syncToLegacyThemeStore(pack);

        // If pack has a buddy, equip it
        if (pack.buddyId) {
          useBuddyStore.getState().equipBuddy(pack.buddyId);
        }

        console.log(`[ThemePackStore] Equipped pack: ${packId}`);
        return true;
      },

      // Purchase a pack via IAP
      purchasePack: async (packId: string) => {
        const state = get();
        const pack = state.availablePacks.find(p => p.id === packId);

        if (!pack || !pack.iapProductId) {
          console.warn(`[ThemePackStore] Invalid pack for purchase: ${packId}`);
          return false;
        }

        if (pack.tier === 'free') {
          // Free packs don't need purchase
          set(s => ({
            purchasedPackIds: [...s.purchasedPackIds, packId],
          }));
          return true;
        }

        try {
          // Purchase through RevenueCat
          const success = await RevenueCatService.purchaseProduct(pack.iapProductId);

          if (success) {
            set(s => ({
              purchasedPackIds: [...s.purchasedPackIds, packId],
            }));

            // Auto-equip after purchase
            get().equipPack(packId);

            console.log(`[ThemePackStore] Purchased pack: ${packId}`);
            return true;
          }

          return false;
        } catch (error) {
          console.error(`[ThemePackStore] Failed to purchase pack ${packId}:`, error);
          return false;
        }
      },

      // Restore purchases
      restorePurchases: async () => {
        try {
          await RevenueCatService.restorePurchases();

          // Get all active entitlements and map to pack IDs
          const state = get();
          const restoredPackIds: string[] = [];

          for (const pack of state.availablePacks) {
            if (pack.iapProductId) {
              // Check if user has entitlement for this product
              const hasAccess = await RevenueCatService.hasEntitlement(pack.iapProductId);
              if (hasAccess) {
                restoredPackIds.push(pack.id);
              }
            }
          }

          if (restoredPackIds.length > 0) {
            set(s => ({
              purchasedPackIds: [...new Set([...s.purchasedPackIds, ...restoredPackIds])],
            }));
            console.log(`[ThemePackStore] Restored ${restoredPackIds.length} packs`);
          }
        } catch (error) {
          console.error('[ThemePackStore] Failed to restore purchases:', error);
        }
      },

      // Get equipped pack
      getEquippedPack: () => {
        const state = get();
        return state.availablePacks.find(p => p.id === state.equippedPackId) || null;
      },

      // Check ownership
      isPackOwned: (packId: string) => {
        const state = get();
        const pack = state.availablePacks.find(p => p.id === packId);

        if (!pack) return false;
        if (pack.tier === 'free') return true;
        return state.purchasedPackIds.includes(packId);
      },

      // Reset to default
      resetToDefault: () => {
        set({ equippedPackId: DEFAULT_PACK_ID });
        console.log('[ThemePackStore] Reset to default pack');
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        purchasedPackIds: state.purchasedPackIds,
        equippedPackId: state.equippedPackId,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sync theme pack colors to legacy themeStore
 * Ensures backwards compatibility with components using old theme system
 */
function syncToLegacyThemeStore(pack: ThemePack): void {
  // The legacy themeStore uses a different structure
  // We map our pack colors to their palette format
  // This is a no-op if themeStore isn't being used
  try {
    const themeStore = useThemeStore.getState();
    // If themeStore has a method to update palette, use it
    // For now, log that we would sync
    console.log(`[ThemePackStore] Would sync to legacy themeStore: ${pack.id}`);
  } catch {
    // Legacy store not available, that's fine
  }
}

/**
 * Resolve a theme pack to full values by merging with defaults
 */
export function resolveThemePack(pack: ThemePack | null): ResolvedTheme {
  if (!pack) {
    return {
      colors: DEFAULT_COLORS,
      typography: DEFAULT_TYPOGRAPHY,
      motion: DEFAULT_MOTION,
      audio: DEFAULT_AUDIO,
      particles: DEFAULT_PARTICLES,
      celebrations: DEFAULT_CELEBRATIONS,
    };
  }

  return {
    colors: { ...DEFAULT_COLORS, ...pack.colors, ranks: { ...DEFAULT_COLORS.ranks, ...pack.colors.ranks } },
    typography: { ...DEFAULT_TYPOGRAPHY, ...pack.typography },
    motion: { ...DEFAULT_MOTION, ...pack.motion },
    audio: { ...DEFAULT_AUDIO, ...pack.audio },
    particles: { ...DEFAULT_PARTICLES, ...pack.particles },
    celebrations: { ...DEFAULT_CELEBRATIONS, ...pack.celebrations },
  };
}

// ============================================
// SELECTORS / HOOKS
// ============================================

export const useEquippedPack = () =>
  useThemePackStore(state => state.availablePacks.find(p => p.id === state.equippedPackId) || null);

export const useAvailablePacks = () =>
  useThemePackStore(state => state.availablePacks);

export const usePurchasedPackIds = () =>
  useThemePackStore(state => state.purchasedPackIds);

export const useIsPackOwned = (packId: string) =>
  useThemePackStore(state => {
    const pack = state.availablePacks.find(p => p.id === packId);
    if (!pack) return false;
    if (pack.tier === 'free') return true;
    return state.purchasedPackIds.includes(packId);
  });

export const useThemePackLoading = () =>
  useThemePackStore(state => state.isLoading);

/**
 * Hook to get resolved theme values for the equipped pack
 * Use this in components that need theme values
 */
export const useResolvedTheme = (): ResolvedTheme => {
  const pack = useEquippedPack();
  return resolveThemePack(pack);
};

/**
 * Hook to get just the colors from the equipped pack
 */
export const useThemePackColors = () => {
  const resolved = useResolvedTheme();
  return resolved.colors;
};

/**
 * Hook to get just the motion config from the equipped pack
 */
export const useThemePackMotion = () => {
  const resolved = useResolvedTheme();
  return resolved.motion;
};

// ============================================
// IMPERATIVE API
// ============================================

export const equipThemePack = (packId: string) =>
  useThemePackStore.getState().equipPack(packId);

export const getEquippedThemePack = () =>
  useThemePackStore.getState().getEquippedPack();

export const getResolvedTheme = (): ResolvedTheme =>
  resolveThemePack(getEquippedThemePack());
