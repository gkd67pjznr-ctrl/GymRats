// src/lib/types/rankTypes.ts
// Type definitions for the comprehensive ranking system

import type { RankTier } from '../userStats/types';

/**
 * Summary of a user's ranking for a single exercise
 */
export type ExerciseRankSummary = {
  exerciseId: string;
  exerciseName: string;
  /** Current rank (1-20) */
  currentRank: number;
  /** Current tier (Iron, Bronze, etc.) */
  currentTier: RankTier;
  /** Progress towards next rank (0-1) */
  progressToNextRank: number;
  /** Best actual weight lifted in kg */
  bestWeightKg: number;
  /** Best reps achieved at best weight */
  bestReps: number;
  /** Best estimated 1RM in kg */
  bestE1rm: number;
  /** Timestamp of last logged set for this exercise */
  lastLoggedAt: number;
  /** Total sets completed for this exercise */
  totalSets: number;
  /** Total volume (kg) for this exercise */
  totalVolumeKg: number;
};

/**
 * Time ranges for sparkline history
 */
export type SparklineTimeframe = '30d' | '90d' | '1y' | 'all';

/**
 * Data point for sparkline chart
 */
export type SparklineDataPoint = {
  /** Timestamp in ms */
  timestampMs: number;
  /** e1RM value at this point */
  e1rmKg: number;
  /** Optional: rank at this point */
  rank?: number;
};

/**
 * Sort options for exercise rank list
 */
export type ExerciseRankSortOption = 'rank' | 'recent' | 'alphabetical' | 'volume';

/**
 * Scope options for leaderboards
 */
export type LeaderboardScope = 'global' | 'regional' | 'friends';

/**
 * Regional data for leaderboard filtering
 */
export type RegionalData = {
  zipCode: string;
  region: string; // State/province
  country: string;
};

/**
 * Rank settings for user preferences
 */
export type RankSettings = {
  /** Show friend comparison option on rank cards */
  showFriendComparison: boolean;
  /** Enable push notifications for rank-ups */
  enableRankUpNotifications: boolean;
  /** Allow sharing rank cards */
  allowRankSharing: boolean;
};

/**
 * Friend comparison data
 */
export type FriendComparisonData = {
  friendId: string;
  friendName: string;
  friendAvatarUrl?: string;
  exerciseId: string;
  friendRank: number;
  friendTier: RankTier;
  friendBestE1rm: number;
  friendBestWeight: number;
  /** Difference in e1RM (positive = user is stronger) */
  e1rmDifferenceKg: number;
  /** Difference in rank (positive = user has higher rank) */
  rankDifference: number;
};

/**
 * Shareable rank card data
 */
export type ShareableRankCard = {
  exerciseId: string;
  exerciseName: string;
  userName: string;
  userRank: number;
  userTier: RankTier;
  bestE1rm: number;
  bestWeight: number;
  bestReps: number;
  generatedAt: number;
};

/**
 * Rank-up notification payload
 */
export type RankUpNotification = {
  exerciseId: string;
  exerciseName: string;
  oldRank: number;
  newRank: number;
  oldTier: RankTier;
  newTier: RankTier;
  timestamp: number;
};
