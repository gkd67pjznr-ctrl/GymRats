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
 * Compute overall Forgerank rankings by averaging scores across exercises
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
