// src/lib/leaderboardUtils.ts
// Utility functions for leaderboard filtering, ranking, and user visibility

export type LeaderboardScope = 'friends' | 'global' | 'regional';

export type EnhancedLeaderboardEntry = {
  rank: number;
  userId: string;
  userName: string;
  value: number;
  display: string;
  isCurrentUser?: boolean;
  showSeparator?: boolean;
};

/**
 * Filter leaderboard entries to only include friends and the current user
 * @param entries - Raw leaderboard entries
 * @param friendUserIds - Set of user IDs who are friends
 * @param currentUserId - Current user's ID
 * @returns Filtered entries (friends + current user only)
 */
export function filterByFriends<T extends { userId: string; rank: number }>(
  entries: T[],
  friendUserIds: Set<string>,
  currentUserId: string
): T[] {
  return entries.filter(
    (entry) => friendUserIds.has(entry.userId) || entry.userId === currentUserId
  );
}

/**
 * Filter leaderboard entries to only include users from a specific region
 * @param entries - Raw leaderboard entries with location data
 * @param country - Country to filter by (case-insensitive)
 * @param region - Optional region/state to filter by (case-insensitive)
 * @returns Filtered entries from the specified region
 */
export function filterByRegion<T extends { country?: string | null; region?: string | null }>(
  entries: T[],
  country: string,
  region?: string
): T[] {
  const countryLower = country.toLowerCase();
  const regionLower = region?.toLowerCase();

  return entries.filter((entry) => {
    // Must match country
    if (!entry.country || entry.country.toLowerCase() !== countryLower) {
      return false;
    }
    // If region filter specified, must also match region
    if (regionLower && (!entry.region || entry.region.toLowerCase() !== regionLower)) {
      return false;
    }
    return true;
  });
}

/**
 * Recompute ranks after filtering
 * Assumes entries are already sorted by value descending
 * @param entries - Filtered entries with old ranks
 * @returns Entries with updated ranks (1-indexed)
 */
export function recomputeRanks<T extends { rank: number }>(entries: T[]): T[] {
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Ensure the current user is visible in the list, even if outside top N
 * If user is not in top N, appends them with a separator indicator
 * @param entries - Ranked entries
 * @param currentUserId - Current user's ID
 * @param maxVisible - Maximum entries to show before potentially adding user
 * @returns Enhanced entries with user guaranteed visible
 */
export function ensureCurrentUserVisible<T extends { userId: string; rank: number }>(
  entries: T[],
  currentUserId: string,
  maxVisible: number = 10
): (T & { isCurrentUser?: boolean; showSeparator?: boolean })[] {
  const userIndex = entries.findIndex((e) => e.userId === currentUserId);

  // If no entries or no current user in list, return sliced entries
  if (entries.length === 0) return [];
  if (userIndex === -1) return entries.slice(0, maxVisible);

  // Mark all entries with isCurrentUser flag
  const marked = entries.map((e) => ({
    ...e,
    isCurrentUser: e.userId === currentUserId,
  }));

  // User is in top N, just return top N
  if (userIndex < maxVisible) {
    return marked.slice(0, maxVisible);
  }

  // User is outside top N, show top (N-1) + separator + user
  const topEntries = marked.slice(0, maxVisible - 1);
  const userEntry = {
    ...marked[userIndex],
    showSeparator: true,
  };

  return [...topEntries, userEntry];
}

/**
 * Compute overall GymRank rankings by averaging scores across exercises
 * @param exerciseRankings - Map of exerciseId to rankings
 * @param getScoreFromEntry - Function to extract score from entry
 * @returns Overall rankings sorted by average score descending
 */
export function computeOverallRankings<T extends { userId: string; userName: string; value: number }>(
  exerciseRankings: Map<string, T[]>
): EnhancedLeaderboardEntry[] {
  // Aggregate scores per user
  const userScores = new Map<string, {
    userName: string;
    totalScore: number;
    exerciseCount: number;
  }>();

  for (const rankings of exerciseRankings.values()) {
    for (const entry of rankings) {
      const existing = userScores.get(entry.userId);
      if (existing) {
        existing.totalScore += entry.value;
        existing.exerciseCount += 1;
      } else {
        userScores.set(entry.userId, {
          userName: entry.userName,
          totalScore: entry.value,
          exerciseCount: 1,
        });
      }
    }
  }

  // Compute averages and sort
  const rankings: EnhancedLeaderboardEntry[] = [];
  for (const [userId, data] of userScores.entries()) {
    const avgScore = data.exerciseCount > 0
      ? Math.round(data.totalScore / data.exerciseCount)
      : 0;
    rankings.push({
      rank: 0, // Will be set below
      userId,
      userName: data.userName,
      value: avgScore,
      display: `${avgScore} avg`,
    });
  }

  // Sort by average score descending, then by name for ties
  rankings.sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return a.userName.localeCompare(b.userName);
  });

  // Assign ranks
  return rankings.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Format e1RM value for display
 * @param e1rm - e1RM in kg
 * @param preferLbs - Whether to display in lbs
 * @returns Formatted string like "100 kg" or "220 lbs"
 */
export function formatE1rmDisplay(e1rm: number, preferLbs: boolean = false): string {
  if (preferLbs) {
    const lbs = Math.round(e1rm * 2.20462);
    return `${lbs} lbs`;
  }
  return `${Math.round(e1rm)} kg`;
}

// ============================================================================
// Volume Leaderboard Utilities
// ============================================================================

export type VolumeMetric = 'sets' | 'volume' | 'workouts';

export type VolumeLeaderboardEntry = EnhancedLeaderboardEntry & {
  totalSets: number;
  totalVolume: number;  // kg lifted (weight × reps)
  workoutCount: number;
};

export type WorkoutSessionForVolume = {
  id: string;
  userId: string;
  userName?: string;
  startedAtMs: number;
  sets: Array<{
    weightKg: number;
    reps: number;
  }>;
};

/**
 * Filter workout sessions by time period
 * @param sessions - Workout sessions to filter
 * @param period - Time period ('all', 'monthly', 'weekly')
 * @returns Filtered sessions within the time period
 */
export function filterSessionsByPeriod<T extends { startedAtMs: number }>(
  sessions: T[],
  period: 'all' | 'monthly' | 'weekly'
): T[] {
  if (period === 'all') return sessions;

  const now = Date.now();
  let cutoffMs: number;

  if (period === 'weekly') {
    // Start of current week (Sunday)
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    cutoffMs = startOfWeek.getTime();
  } else {
    // Start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    cutoffMs = startOfMonth.getTime();
  }

  return sessions.filter((s) => s.startedAtMs >= cutoffMs);
}

/**
 * Compute volume leaderboard rankings from workout sessions
 * @param sessions - All workout sessions
 * @param metric - Metric to rank by ('sets', 'volume', 'workouts')
 * @param userNameMap - Map of userId to displayName
 * @returns Volume leaderboard entries sorted by the specified metric
 */
export function computeVolumeRankings(
  sessions: WorkoutSessionForVolume[],
  metric: VolumeMetric,
  userNameMap: Map<string, string> = new Map()
): VolumeLeaderboardEntry[] {
  // Aggregate stats per user
  const userStats = new Map<string, {
    userName: string;
    totalSets: number;
    totalVolume: number;
    workoutCount: number;
    workoutIds: Set<string>;
  }>();

  for (const session of sessions) {
    const existing = userStats.get(session.userId);
    const setCount = session.sets.length;
    const sessionVolume = session.sets.reduce(
      (sum, set) => sum + set.weightKg * set.reps,
      0
    );

    if (existing) {
      existing.totalSets += setCount;
      existing.totalVolume += sessionVolume;
      if (!existing.workoutIds.has(session.id)) {
        existing.workoutIds.add(session.id);
        existing.workoutCount += 1;
      }
    } else {
      userStats.set(session.userId, {
        userName: session.userName || userNameMap.get(session.userId) || 'Unknown',
        totalSets: setCount,
        totalVolume: sessionVolume,
        workoutCount: 1,
        workoutIds: new Set([session.id]),
      });
    }
  }

  // Convert to entries and sort by the selected metric
  const entries: VolumeLeaderboardEntry[] = [];
  for (const [userId, stats] of userStats.entries()) {
    let value: number;
    let display: string;

    switch (metric) {
      case 'sets':
        value = stats.totalSets;
        display = `${value} sets`;
        break;
      case 'volume':
        value = Math.round(stats.totalVolume);
        display = `${formatVolumeCompact(value)}`;
        break;
      case 'workouts':
        value = stats.workoutCount;
        display = `${value} workouts`;
        break;
    }

    entries.push({
      rank: 0,
      userId,
      userName: stats.userName,
      value,
      display,
      totalSets: stats.totalSets,
      totalVolume: stats.totalVolume,
      workoutCount: stats.workoutCount,
    });
  }

  // Sort by value descending
  entries.sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return a.userName.localeCompare(b.userName);
  });

  // Assign ranks
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Format volume number in a compact way
 * @param volume - Volume in kg
 * @returns Formatted string like "12.5k kg" or "1.2m kg"
 */
export function formatVolumeCompact(volume: number): string {
  if (volume < 1000) return `${volume} kg`;
  if (volume < 1000000) return `${(volume / 1000).toFixed(1).replace('.0', '')}k kg`;
  return `${(volume / 1000000).toFixed(2).replace('.00', '')}m kg`;
}

// ============================================================================
// Level/XP Leaderboard Utilities
// ============================================================================

export type LevelMetric = 'level' | 'totalXP' | 'weeklyXP';

export type LevelLeaderboardEntry = EnhancedLeaderboardEntry & {
  currentLevel: number;
  totalXP: number;
  levelTier: string;  // Novice, Apprentice, Adept, Expert, Master, Grandmaster
};

export type GamificationProfileForLeaderboard = {
  userId: string;
  userName?: string;
  currentLevel: number;
  totalXP: number;
  workoutCalendar?: Array<{ date: string; xp: number }>;
};

/**
 * Get the level tier name based on level
 */
export function getLevelTierName(level: number): string {
  if (level <= 5) return 'Novice';
  if (level <= 10) return 'Apprentice';
  if (level <= 15) return 'Adept';
  if (level <= 20) return 'Expert';
  if (level <= 30) return 'Master';
  return 'Grandmaster';
}

/**
 * Get the tier color key for a level
 */
export function getLevelTierColorKey(level: number): string {
  if (level <= 5) return 'copper';
  if (level <= 10) return 'bronze';
  if (level <= 15) return 'iron';
  if (level <= 20) return 'silver';
  if (level <= 25) return 'gold';
  if (level <= 35) return 'master';
  if (level <= 45) return 'legendary';
  if (level <= 55) return 'mythic';
  if (level <= 70) return 'supreme_being';
  return 'goat';
}

/**
 * Calculate XP earned in a specific time period from workout calendar
 * @param calendar - Workout calendar with daily XP
 * @param period - Time period to filter
 * @returns Total XP in the period
 */
export function calculatePeriodXP(
  calendar: Array<{ date: string; xp: number }> | undefined,
  period: 'all' | 'monthly' | 'weekly'
): number {
  if (!calendar || calendar.length === 0) return 0;
  if (period === 'all') {
    return calendar.reduce((sum, day) => sum + day.xp, 0);
  }

  const now = new Date();
  let cutoffDate: Date;

  if (period === 'weekly') {
    // Start of current week (Sunday)
    cutoffDate = new Date(now);
    cutoffDate.setHours(0, 0, 0, 0);
    cutoffDate.setDate(cutoffDate.getDate() - cutoffDate.getDay());
  } else {
    // Start of current month
    cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const cutoffStr = cutoffDate.toISOString().split('T')[0];
  return calendar
    .filter((day) => day.date >= cutoffStr)
    .reduce((sum, day) => sum + day.xp, 0);
}

/**
 * Compute Level/XP leaderboard rankings
 * @param profiles - Gamification profiles to rank
 * @param metric - Metric to rank by ('level', 'totalXP', 'weeklyXP')
 * @param period - Time period for XP metrics
 * @param userNameMap - Map of userId to displayName
 * @returns Level leaderboard entries sorted by the specified metric
 */
export function computeLevelRankings(
  profiles: GamificationProfileForLeaderboard[],
  metric: LevelMetric,
  period: 'all' | 'monthly' | 'weekly' = 'all',
  userNameMap: Map<string, string> = new Map()
): LevelLeaderboardEntry[] {
  const entries: LevelLeaderboardEntry[] = [];

  for (const profile of profiles) {
    let value: number;
    let display: string;

    switch (metric) {
      case 'level':
        value = profile.currentLevel;
        display = `Level ${value}`;
        break;
      case 'totalXP':
        value = profile.totalXP;
        display = formatXPCompact(value);
        break;
      case 'weeklyXP':
        value = calculatePeriodXP(profile.workoutCalendar, period);
        display = formatXPCompact(value);
        break;
    }

    entries.push({
      rank: 0,
      userId: profile.userId,
      userName: profile.userName || userNameMap.get(profile.userId) || 'Unknown',
      value,
      display,
      currentLevel: profile.currentLevel,
      totalXP: profile.totalXP,
      levelTier: getLevelTierName(profile.currentLevel),
    });
  }

  // Sort by value descending, then by total XP for ties on level
  entries.sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    if (metric === 'level' && b.totalXP !== a.totalXP) return b.totalXP - a.totalXP;
    return a.userName.localeCompare(b.userName);
  });

  // Assign ranks
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Format XP number in a compact way
 * @param xp - XP amount
 * @returns Formatted string like "12.5k XP" or "1.2m XP"
 */
export function formatXPCompact(xp: number): string {
  if (xp < 1000) return `${xp} XP`;
  if (xp < 1000000) return `${(xp / 1000).toFixed(1).replace('.0', '')}k XP`;
  return `${(xp / 1000000).toFixed(2).replace('.00', '')}m XP`;
}
