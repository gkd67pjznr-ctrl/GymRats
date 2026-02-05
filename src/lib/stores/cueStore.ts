import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createQueuedJSONStorage } from './storage/createQueuedAsyncStorage';
import { supabase } from '../supabase/client';

/**
 * Cue Store - Zustand store for AI Buddy text cues
 *
 * Fetches cues from Supabase and caches locally for offline use.
 * Each cue is tied to a specific personality and category.
 */

// ============================================
// TYPES
// ============================================

export type CueCategory =
  | 'SHORT'      // Quick acknowledgment after any set
  | 'HYPE'       // PR moments, rank-ups, big achievements
  | 'CULTURE'    // Random flavor, personality expression
  | 'START'      // Workout session begins
  | 'END'        // Workout session completes
  | 'REST'       // During rest timer between sets
  | 'NUDGE'      // Long rest detected, gentle reminder
  | 'FAILURE'    // Missed rep, failed set
  | 'COMEBACK'   // Return after 3+ days away
  | 'MILESTONE'; // Major achievements

export interface Cue {
  id: number;
  text: string;
  voiceUrl?: string;
}

export interface PersonalityCues {
  [category: string]: Cue[];
}

export interface CueStoreState {
  // Cached cues by personality ID
  cuesByPersonality: Record<string, PersonalityCues>;

  // Track which personalities have been fetched
  fetchedPersonalities: Record<string, number>; // personality -> timestamp

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Last sync timestamp
  lastSyncAt: number | null;

  // Recently shown cue IDs (to avoid repetition)
  recentCueIds: number[];
}

export interface CueStoreActions {
  // Fetch cues for a personality from Supabase
  fetchCuesForPersonality: (personalityId: string, forceRefresh?: boolean) => Promise<void>;

  // Fetch all cues (for preloading)
  fetchAllCues: () => Promise<void>;

  // Get a random cue (avoids recent repetition)
  getRandomCue: (personalityId: string, category: CueCategory) => Cue | null;

  // Get multiple random cues
  getRandomCues: (personalityId: string, category: CueCategory, count: number) => Cue[];

  // Track shown cue to avoid repetition
  markCueShown: (cueId: number) => void;

  // Clear recent cues (e.g., on new session)
  clearRecentCues: () => void;

  // Clear all cached cues
  clearCache: () => void;
}

// ============================================
// CONSTANTS
// ============================================

// How long to cache cues before refreshing (24 hours)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// How many recent cues to track for avoiding repetition
const RECENT_CUES_LIMIT = 20;

// ============================================
// INITIAL STATE
// ============================================

const initialState: CueStoreState = {
  cuesByPersonality: {},
  fetchedPersonalities: {},
  isLoading: false,
  error: null,
  lastSyncAt: null,
  recentCueIds: [],
};

// ============================================
// STORE
// ============================================

export const useCueStore = create<CueStoreState & CueStoreActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Fetch cues for a specific personality
      fetchCuesForPersonality: async (personalityId: string, forceRefresh = false) => {
        const state = get();

        // Check if we have fresh cached data
        const lastFetched = state.fetchedPersonalities[personalityId];
        if (!forceRefresh && lastFetched && Date.now() - lastFetched < CACHE_TTL_MS) {
          // Cache is still fresh
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Fetch from Supabase using the helper function
          const { data, error } = await supabase
            .rpc('get_personality_cues', { p_personality_id: personalityId });

          if (error) {
            throw error;
          }

          // Transform the data into our format
          const personalityCues: PersonalityCues = {};

          if (data) {
            for (const row of data) {
              const category = row.category as CueCategory;
              const cues = row.cues as Array<{ id: number; text: string; voice_url?: string }>;

              personalityCues[category] = cues.map(c => ({
                id: c.id,
                text: c.text,
                voiceUrl: c.voice_url,
              }));
            }
          }

          set(state => ({
            cuesByPersonality: {
              ...state.cuesByPersonality,
              [personalityId]: personalityCues,
            },
            fetchedPersonalities: {
              ...state.fetchedPersonalities,
              [personalityId]: Date.now(),
            },
            isLoading: false,
            lastSyncAt: Date.now(),
          }));

          console.log(`[CueStore] Fetched ${Object.keys(personalityCues).length} categories for ${personalityId}`);
        } catch (error) {
          console.error(`[CueStore] Failed to fetch cues for ${personalityId}:`, error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch cues',
          });
        }
      },

      // Fetch all cues (for preloading all personalities)
      fetchAllCues: async () => {
        set({ isLoading: true, error: null });

        try {
          // Fetch all active personalities first
          const { data: personalities, error: persError } = await supabase
            .from('buddy_personalities')
            .select('id')
            .eq('is_active', true);

          if (persError) throw persError;

          // Fetch cues for each personality
          const allCues: Record<string, PersonalityCues> = {};
          const timestamps: Record<string, number> = {};

          for (const personality of personalities || []) {
            const { data, error } = await supabase
              .rpc('get_personality_cues', { p_personality_id: personality.id });

            if (error) {
              console.warn(`[CueStore] Failed to fetch cues for ${personality.id}:`, error);
              continue;
            }

            const personalityCues: PersonalityCues = {};
            if (data) {
              for (const row of data) {
                const category = row.category as CueCategory;
                const cues = row.cues as Array<{ id: number; text: string; voice_url?: string }>;
                personalityCues[category] = cues.map(c => ({
                  id: c.id,
                  text: c.text,
                  voiceUrl: c.voice_url,
                }));
              }
            }

            allCues[personality.id] = personalityCues;
            timestamps[personality.id] = Date.now();
          }

          set({
            cuesByPersonality: allCues,
            fetchedPersonalities: timestamps,
            isLoading: false,
            lastSyncAt: Date.now(),
          });

          const totalCues = Object.values(allCues).reduce(
            (sum, p) => sum + Object.values(p).reduce((s, c) => s + c.length, 0),
            0
          );
          console.log(`[CueStore] Fetched ${totalCues} total cues for ${Object.keys(allCues).length} personalities`);
        } catch (error) {
          console.error('[CueStore] Failed to fetch all cues:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch cues',
          });
        }
      },

      // Get a random cue, avoiding recently shown ones
      getRandomCue: (personalityId: string, category: CueCategory): Cue | null => {
        const state = get();
        const personalityCues = state.cuesByPersonality[personalityId];

        if (!personalityCues || !personalityCues[category]) {
          console.warn(`[CueStore] No cues found for ${personalityId}/${category}`);
          return null;
        }

        const cues = personalityCues[category];
        if (cues.length === 0) return null;

        // Filter out recently shown cues
        const availableCues = cues.filter(c => !state.recentCueIds.includes(c.id));

        // If all cues have been shown recently, reset and use all
        const pool = availableCues.length > 0 ? availableCues : cues;

        // Select random cue
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
      },

      // Get multiple random cues
      getRandomCues: (personalityId: string, category: CueCategory, count: number): Cue[] => {
        const state = get();
        const personalityCues = state.cuesByPersonality[personalityId];

        if (!personalityCues || !personalityCues[category]) {
          return [];
        }

        const cues = personalityCues[category];
        const shuffled = [...cues].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      },

      // Mark a cue as shown (to avoid repetition)
      markCueShown: (cueId: number) => {
        set(state => {
          const recentCueIds = [...state.recentCueIds, cueId];
          // Keep only the last N cues
          if (recentCueIds.length > RECENT_CUES_LIMIT) {
            recentCueIds.shift();
          }
          return { recentCueIds };
        });
      },

      // Clear recent cues (e.g., when starting a new workout)
      clearRecentCues: () => {
        set({ recentCueIds: [] });
      },

      // Clear all cached cues
      clearCache: () => {
        set({
          cuesByPersonality: {},
          fetchedPersonalities: {},
          lastSyncAt: null,
        });
      },
    }),
    {
      name: 'cue-store.v1',
      storage: createQueuedJSONStorage(),
      // Persist everything except loading state
      partialize: (state) => ({
        cuesByPersonality: state.cuesByPersonality,
        fetchedPersonalities: state.fetchedPersonalities,
        lastSyncAt: state.lastSyncAt,
        recentCueIds: state.recentCueIds,
      }),
    }
  )
);

// ============================================
// SELECTORS
// ============================================

/**
 * Hook to get cues loading state
 */
export const useCuesLoading = () => useCueStore(state => state.isLoading);

/**
 * Hook to get cues error state
 */
export const useCuesError = () => useCueStore(state => state.error);

/**
 * Hook to check if cues are cached for a personality
 */
export const useHasCachedCues = (personalityId: string) =>
  useCueStore(state => !!state.cuesByPersonality[personalityId]);

/**
 * Hook to get last sync timestamp
 */
export const useLastCueSync = () => useCueStore(state => state.lastSyncAt);

// ============================================
// IMPERATIVE API
// ============================================

/**
 * Get a random cue text (non-hook version for use in engine)
 */
export function getRandomCueText(personalityId: string, category: CueCategory): string | null {
  const cue = useCueStore.getState().getRandomCue(personalityId, category);
  if (cue) {
    useCueStore.getState().markCueShown(cue.id);
    return cue.text;
  }
  return null;
}

/**
 * Get a random cue with voice URL (non-hook version)
 */
export function getRandomCueWithVoice(personalityId: string, category: CueCategory): { text: string; voiceUrl?: string } | null {
  const cue = useCueStore.getState().getRandomCue(personalityId, category);
  if (cue) {
    useCueStore.getState().markCueShown(cue.id);
    return { text: cue.text, voiceUrl: cue.voiceUrl };
  }
  return null;
}

/**
 * Ensure cues are loaded for a personality (call before using)
 */
export async function ensureCuesLoaded(personalityId: string): Promise<boolean> {
  const state = useCueStore.getState();

  // Check if already cached and fresh
  if (state.cuesByPersonality[personalityId]) {
    return true;
  }

  // Fetch from Supabase
  try {
    await state.fetchCuesForPersonality(personalityId);
    return !!useCueStore.getState().cuesByPersonality[personalityId];
  } catch {
    return false;
  }
}
