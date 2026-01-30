/**
 * Gamification data repository for Supabase sync.
 *
 * Handles CRUD operations for the users table gamification columns.
 */

import { supabase } from '@/src/lib/supabase/client';
import type { GamificationProfile, WorkoutCalendarEntry } from '../types';
import { DEFAULT_GAMIFICATION_PROFILE } from '../types';
import type { DatabaseUser, JsonWorkoutCalendarEntry } from '@/src/lib/supabase/types';

/**
 * Convert database user row to GamificationProfile.
 */
export function dbUserToGamificationProfile(dbUser: DatabaseUser | null): GamificationProfile {
  if (!dbUser) {
    return { ...DEFAULT_GAMIFICATION_PROFILE };
  }

  return {
    totalXP: dbUser.total_xp,
    currentLevel: dbUser.current_level,
    xpToNextLevel: dbUser.xp_to_next_level,
    levelUpCelebrationShown: dbUser.level_up_celebration_shown
      ? new Date(dbUser.level_up_celebration_shown).getTime()
      : undefined,
    currentStreak: dbUser.current_streak,
    longestStreak: dbUser.longest_streak,
    lastWorkoutDate: dbUser.last_workout_date ?? undefined,
    workoutCalendar: dbUser.workout_calendar.map((entry): WorkoutCalendarEntry => ({
      date: entry.date,
      count: entry.count,
      xp: entry.xp,
    })),
    forgeTokens: dbUser.forge_tokens,
    tokensEarnedTotal: dbUser.tokens_earned_total,
    tokensSpentTotal: dbUser.tokens_spent_total,
    milestonesCompleted: dbUser.milestones_completed as any,
    updatedAt: dbUser.updated_at ? new Date(dbUser.updated_at).getTime() : Date.now(),
  };
}

/**
 * Convert GamificationProfile to database update format.
 */
export function gamificationProfileToDbUpdate(
  profile: GamificationProfile
): Partial<DatabaseUser> {
  return {
    total_xp: profile.totalXP,
    current_level: profile.currentLevel,
    xp_to_next_level: profile.xpToNextLevel,
    level_up_celebration_shown: profile.levelUpCelebrationShown
      ? new Date(profile.levelUpCelebrationShown).toISOString()
      : null,
    current_streak: profile.currentStreak,
    longest_streak: profile.longestStreak,
    last_workout_date: profile.lastWorkoutDate ?? null,
    workout_calendar: profile.workoutCalendar.map((entry): JsonWorkoutCalendarEntry => ({
      date: entry.date,
      count: entry.count,
      xp: entry.xp,
    })),
    forge_tokens: profile.forgeTokens,
    tokens_earned_total: profile.tokensEarnedTotal,
    tokens_spent_total: profile.tokensSpentTotal,
    milestones_completed: profile.milestonesCompleted,
  };
}

/**
 * Fetch gamification profile from Supabase for current user.
 *
 * @returns Gamification profile or null if not authenticated
 */
export async function fetchGamificationProfile(): Promise<GamificationProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    const msg = error.message ?? '';
    const isTableMissing = msg.includes('Could not find the') || msg.includes('does not exist');
    if (isTableMissing) {
      if (__DEV__) {
        console.warn('[gamificationRepository] Backend tables not set up yet, using local data');
      }
    } else {
      if (__DEV__) {
        console.error('Error fetching gamification profile:', error);
      }
    }
    return null;
  }

  return dbUserToGamificationProfile(data);
}

/**
 * Push gamification profile to Supabase.
 *
 * @param profile - Profile to sync
 * @returns Success status
 */
export async function pushGamificationProfile(
  profile: GamificationProfile
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const update = gamificationProfileToDbUpdate(profile);

  const { error } = await supabase
    .from('users')
    .update(update)
    .eq('id', user.id);

  if (error) {
    const msg = error.message ?? '';
    const isTableMissing = msg.includes('Could not find the') || msg.includes('does not exist');
    if (isTableMissing) {
      if (__DEV__) {
        console.warn('[gamificationRepository] Backend tables not set up yet, skipping push');
      }
    } else {
      if (__DEV__) {
        console.error('Error pushing gamification profile:', error);
      }
    }
    return false;
  }

  return true;
}

/**
 * Fetch gamification profile for a specific user ID.
 * Used for leaderboards and friend profiles.
 *
 * @param userId - User ID to fetch
 * @returns Gamification profile or null
 */
export async function fetchUserGamificationProfile(
  userId: string
): Promise<GamificationProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    if (__DEV__) {
      console.error('Error fetching user gamification profile:', error);
    }
    return null;
  }

  return dbUserToGamificationProfile(data);
}

/**
 * Fetch top users by total XP (leaderboard).
 *
 * @param limit - Maximum number of users to return
 * @returns Array of user profiles with XP data
 */
export async function fetchTopUsersByXP(limit: number = 50): Promise<
  Array<{
    userId: string;
    displayName: string | null;
    avatarUrl: string | null;
    totalXP: number;
    currentLevel: number;
    currentStreak: number;
  }>
> {
  const { data, error } = await supabase
    .from('users')
    .select('id, display_name, avatar_url, total_xp, current_level, current_streak')
    .order('total_xp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top users:', error);
    return [];
  }

  return (data ?? []).map((user) => ({
    userId: user.id,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    totalXP: user.total_xp,
    currentLevel: user.current_level,
    currentStreak: user.current_streak,
  }));
}

/**
 * Fetch top users by streak (leaderboard).
 *
 * @param limit - Maximum number of users to return
 * @returns Array of user profiles with streak data
 */
export async function fetchTopUsersByStreak(limit: number = 50): Promise<
  Array<{
    userId: string;
    displayName: string | null;
    avatarUrl: string | null;
    currentStreak: number;
    longestStreak: number;
  }>
> {
  const { data, error } = await supabase
    .from('users')
    .select('id, display_name, avatar_url, current_streak, longest_streak')
    .order('current_streak', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top streak users:', error);
    return [];
  }

  return (data ?? []).map((user) => ({
    userId: user.id,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    currentStreak: user.current_streak,
    longestStreak: user.longest_streak,
  }));
}

/**
 * Merge local profile with server profile using conflict resolution.
 * Uses timestamp-based "last write wins" strategy.
 *
 * @param localProfile - Local profile from AsyncStorage
 * @param serverProfile - Remote profile from Supabase
 * @returns Merged profile
 */
export function mergeGamificationProfiles(
  localProfile: GamificationProfile,
  serverProfile: GamificationProfile
): GamificationProfile {
  // If server is newer, use server values
  if (serverProfile.updatedAt > localProfile.updatedAt) {
    return { ...serverProfile };
  }

  // If local is newer, use local values
  if (localProfile.updatedAt > serverProfile.updatedAt) {
    return { ...localProfile };
  }

  // Same timestamp - prefer max values for cumulative fields
  return {
    ...localProfile,
    totalXP: Math.max(localProfile.totalXP, serverProfile.totalXP),
    currentLevel: Math.max(localProfile.currentLevel, serverProfile.currentLevel),
    currentStreak: Math.max(localProfile.currentStreak, serverProfile.currentStreak),
    longestStreak: Math.max(localProfile.longestStreak, serverProfile.longestStreak),
    forgeTokens: Math.max(localProfile.forgeTokens, serverProfile.forgeTokens),
    tokensEarnedTotal: Math.max(
      localProfile.tokensEarnedTotal,
      serverProfile.tokensEarnedTotal
    ),
    // Merge calendars (dedupe by date, take max values)
    workoutCalendar: mergeWorkoutCalendars(
      localProfile.workoutCalendar,
      serverProfile.workoutCalendar
    ),
    // Union of milestone completions
    milestonesCompleted: Array.from(
      new Set([
        ...localProfile.milestonesCompleted,
        ...serverProfile.milestonesCompleted,
      ])
    ),
    // Use local if celebration shown
    levelUpCelebrationShown: localProfile.levelUpCelebrationShown,
  };
}

/**
 * Merge two workout calendars, preferring higher values for each date.
 */
function mergeWorkoutCalendars(
  local: WorkoutCalendarEntry[],
  server: WorkoutCalendarEntry[]
): WorkoutCalendarEntry[] {
  const map = new Map<string, WorkoutCalendarEntry>();

  for (const entry of [...local, ...server]) {
    const existing = map.get(entry.date);
    if (!existing) {
      map.set(entry.date, entry);
    } else {
      // Take max values for each date
      map.set(entry.date, {
        date: entry.date,
        count: Math.max(existing.count, entry.count),
        xp: Math.max(existing.xp, entry.xp),
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Sync gamification profile with server.
 * Fetches server profile, merges with local, pushes back.
 *
 * @param localProfile - Local profile to sync
 * @returns Synced profile or null on error
 */
export async function syncGamificationProfile(
  localProfile: GamificationProfile
): Promise<GamificationProfile | null> {
  const serverProfile = await fetchGamificationProfile();

  if (!serverProfile) {
    // No server profile yet, push local
    const success = await pushGamificationProfile(localProfile);
    return success ? localProfile : null;
  }

  // Merge profiles
  const merged = mergeGamificationProfiles(localProfile, serverProfile);

  // Push merged profile back
  const success = await pushGamificationProfile(merged);
  return success ? merged : null;
}
