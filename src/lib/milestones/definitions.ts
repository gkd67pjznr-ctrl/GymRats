/**
 * Forge Milestone Definitions
 * Non-repeatable lifetime achievements with tiered rarity.
 */

import type { ForgeMilestone, MilestoneRarity } from './types';

/**
 * All Forge Milestones organized by rarity tier
 */

// === COMMON TIER (0) ===
// Standard badges, subtle border
const COMMON_MILESTONES: ForgeMilestone[] = [
  {
    id: 'first_workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    rarity: 'common',
    icon: '🚀',
    condition: { type: 'workouts', threshold: 1 },
    tokens: 5,
  },
  {
    id: 'workouts_10',
    name: 'Getting Started',
    description: 'Complete 10 workouts',
    rarity: 'common',
    icon: '💪',
    condition: { type: 'workouts', threshold: 10 },
    tokens: 10,
  },
  {
    id: 'first_pr',
    name: 'Breakthrough',
    description: 'Set your first PR',
    rarity: 'common',
    icon: '⭐',
    condition: { type: 'prs', threshold: 1 },
    tokens: 15,
  },
  {
    id: 'first_rank_up',
    name: 'Ranked Lifter',
    description: 'Achieve your first exercise rank',
    rarity: 'common',
    icon: '🏅',
    condition: { type: 'exercises_ranked', threshold: 1 },
    tokens: 10,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day workout streak',
    rarity: 'common',
    icon: '🔥',
    condition: { type: 'streak', threshold: 7 },
    tokens: 20,
  },
  {
    id: 'exercises_5',
    name: 'Variety Pack',
    description: 'Log 5 different exercises',
    rarity: 'common',
    icon: '🎯',
    condition: { type: 'exercises_logged', threshold: 5 },
    tokens: 10,
  },
  {
    id: 'first_share',
    name: 'Social Lifter',
    description: 'Share your first workout to the feed',
    rarity: 'common',
    icon: '📢',
    condition: { type: 'workout_shared', threshold: 1 },
    tokens: 10,
  },
  {
    id: 'pr_types_all',
    name: 'Triple Threat',
    description: 'Achieve all 3 PR types (weight, rep, e1RM)',
    rarity: 'common',
    icon: '🎯',
    condition: { type: 'pr_types', threshold: 3 },
    tokens: 15,
  },
];

// === RARE TIER (1) ===
// Blue/purple tint, slight glow
const RARE_MILESTONES: ForgeMilestone[] = [
  {
    id: 'workouts_100',
    name: 'Centurion',
    description: 'Complete 100 workouts',
    rarity: 'rare',
    icon: '💯',
    condition: { type: 'workouts', threshold: 100 },
    tokens: 50,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    rarity: 'rare',
    icon: '🔥',
    condition: { type: 'streak', threshold: 30 },
    tokens: 75,
  },
  {
    id: 'exercises_ranked_5',
    name: 'Well-Rounded',
    description: 'Rank 5 different exercises',
    rarity: 'rare',
    icon: '🏆',
    condition: { type: 'exercises_ranked', threshold: 5 },
    tokens: 50,
  },
  {
    id: 'prs_50',
    name: 'PR Hunter',
    description: 'Achieve 50 PRs',
    rarity: 'rare',
    icon: '⭐',
    condition: { type: 'prs', threshold: 50 },
    tokens: 50,
  },
  {
    id: 'hat_trick',
    name: 'Hat Trick',
    description: 'Achieve 3+ PRs in a single workout',
    rarity: 'rare',
    icon: '🎩',
    condition: { type: 'prs_in_workout', threshold: 3 },
    tokens: 40,
  },
  {
    id: 'pr_streak_5',
    name: 'Streak Master',
    description: '5 consecutive workouts with PRs',
    rarity: 'rare',
    icon: '🔥',
    condition: { type: 'pr_streak', threshold: 5 },
    tokens: 50,
  },
  {
    id: 'exercises_10',
    name: 'Exercise Explorer',
    description: 'Log 10 different exercises',
    rarity: 'rare',
    icon: '🎯',
    condition: { type: 'exercises_logged', threshold: 10 },
    tokens: 30,
  },
  {
    id: 'level_10',
    name: 'Double Digits',
    description: 'Reach Level 10',
    rarity: 'rare',
    icon: '🎖️',
    condition: { type: 'level', threshold: 10 },
    tokens: 50,
  },
  {
    id: 'sets_1000',
    name: 'Volume King',
    description: 'Log 1,000 total sets',
    rarity: 'rare',
    icon: '📊',
    condition: { type: 'sets', threshold: 1000 },
    tokens: 40,
  },
];

// === EPIC TIER (2) ===
// Gold/orange glow, animated border
const EPIC_MILESTONES: ForgeMilestone[] = [
  {
    id: 'club_1000lb',
    name: '1000lb Club',
    description: 'Squat + Bench + Deadlift total 1000+ lbs',
    rarity: 'epic',
    icon: '🏋️',
    condition: { type: 'club', threshold: 453, clubExercises: ['squat', 'bench', 'deadlift'] }, // 453kg = ~1000lb
    tokens: 150,
  },
  {
    id: 'all_silver_plus',
    name: 'Silver Standard',
    description: 'All exercises ranked Silver or above',
    rarity: 'epic',
    icon: '🥈',
    condition: { type: 'exercises_ranked', threshold: 50, minRankTier: 3 }, // Silver is tier 3
    tokens: 200,
  },
  {
    id: 'streak_365',
    name: 'Year of Iron',
    description: 'Maintain a 365-day streak',
    rarity: 'epic',
    icon: '🔥',
    condition: { type: 'streak', threshold: 365 },
    tokens: 250,
  },
  {
    id: 'workouts_500',
    name: 'Dedicated',
    description: 'Complete 500 workouts',
    rarity: 'epic',
    icon: '💪',
    condition: { type: 'workouts', threshold: 500 },
    tokens: 150,
  },
  {
    id: 'prs_100',
    name: 'PR Legend',
    description: 'Achieve 100 PRs',
    rarity: 'epic',
    icon: '⭐',
    condition: { type: 'prs', threshold: 100 },
    tokens: 150,
  },
  {
    id: 'prs_in_workout_5',
    name: 'PR Machine',
    description: 'Achieve 5+ PRs in a single workout',
    rarity: 'epic',
    icon: '🏆',
    condition: { type: 'prs_in_workout', threshold: 5 },
    tokens: 100,
  },
  {
    id: 'pr_streak_10',
    name: 'Unstoppable',
    description: '10 consecutive workouts with PRs',
    rarity: 'epic',
    icon: '🔥',
    condition: { type: 'pr_streak', threshold: 10 },
    tokens: 125,
  },
  {
    id: 'three_gold',
    name: 'Golden Trio',
    description: 'Rank 3 exercises Gold or above',
    rarity: 'epic',
    icon: '🥇',
    condition: { type: 'exercises_ranked', threshold: 3, minRankTier: 4 }, // Gold is tier 4
    tokens: 175,
  },
  {
    id: 'level_25',
    name: 'Elite Level',
    description: 'Reach Level 25',
    rarity: 'epic',
    icon: '🎖️',
    condition: { type: 'level', threshold: 25 },
    tokens: 150,
  },
  {
    id: 'sets_10000',
    name: 'Volume God',
    description: 'Log 10,000 total sets',
    rarity: 'epic',
    icon: '📊',
    condition: { type: 'sets', threshold: 10000 },
    tokens: 125,
  },
];

// === LEGENDARY TIER (3) ===
// Prismatic/rainbow glow, particle effects, special animation
const LEGENDARY_MILESTONES: ForgeMilestone[] = [
  {
    id: 'all_gold_plus',
    name: 'Golden God',
    description: 'All exercises ranked Gold or above',
    rarity: 'legendary',
    icon: '👑',
    condition: { type: 'exercises_ranked', threshold: 50, minRankTier: 4 },
    tokens: 500,
  },
  {
    id: 'streak_730',
    name: 'Two Year Streak',
    description: 'Maintain a 730-day (2 year) streak',
    rarity: 'legendary',
    icon: '🔥',
    condition: { type: 'streak', threshold: 730 },
    tokens: 500,
  },
  {
    id: 'workouts_1000',
    name: 'Millennium Lifter',
    description: 'Complete 1,000 workouts',
    rarity: 'legendary',
    icon: '💪',
    condition: { type: 'workouts', threshold: 1000 },
    tokens: 400,
  },
  {
    id: 'first_legendary',
    name: 'Legendary Status',
    description: 'Rank any exercise Legendary',
    rarity: 'legendary',
    icon: '👑',
    condition: { type: 'rank', threshold: 7, exerciseId: 'any' }, // Legendary is tier 7
    tokens: 400,
  },
  {
    id: 'first_mythic',
    name: 'Mythic Status',
    description: 'Rank any exercise Mythic',
    rarity: 'legendary',
    icon: '⚡',
    condition: { type: 'rank', threshold: 6, exerciseId: 'any' }, // Mythic is tier 6
    tokens: 750,
  },
  {
    id: 'prs_500',
    name: 'PR Immortal',
    description: 'Achieve 500 PRs',
    rarity: 'legendary',
    icon: '⭐',
    condition: { type: 'prs', threshold: 500 },
    tokens: 350,
  },
  {
    id: 'level_50',
    name: 'Level Legend',
    description: 'Reach Level 50',
    rarity: 'legendary',
    icon: '🎖️',
    condition: { type: 'level', threshold: 50 },
    tokens: 350,
  },
];

/**
 * All milestones combined
 */
export const ALL_MILESTONES: ForgeMilestone[] = [
  ...COMMON_MILESTONES,
  ...RARE_MILESTONES,
  ...EPIC_MILESTONES,
  ...LEGENDARY_MILESTONES,
];

/**
 * Get milestone by ID
 */
export function getMilestoneById(id: string): ForgeMilestone | undefined {
  return ALL_MILESTONES.find(m => m.id === id);
}

/**
 * Get all milestones of a specific rarity
 */
export function getMilestonesByRarity(rarity: MilestoneRarity): ForgeMilestone[] {
  return ALL_MILESTONES.filter(m => m.rarity === rarity);
}

/**
 * Get milestones grouped by rarity
 */
export function getMilestonesByRarityGroup(): Record<MilestoneRarity, ForgeMilestone[]> {
  return {
    common: COMMON_MILESTONES,
    rare: RARE_MILESTONES,
    epic: EPIC_MILESTONES,
    legendary: LEGENDARY_MILESTONES,
  };
}

/**
 * Rarity display names and colors
 */
export const RARITY_INFO: Record<MilestoneRarity, { name: string; color: string; borderStyle: string }> = {
  common: {
    name: 'Common',
    color: '#C0C0C0', // Silver
    borderStyle: 'solid',
  },
  rare: {
    name: 'Rare',
    color: '#9B59B6', // Purple
    borderStyle: 'solid',
  },
  epic: {
    name: 'Epic',
    color: '#F39C12', // Gold/Orange
    borderStyle: 'solid',
  },
  legendary: {
    name: 'Legendary',
    color: '#E74C3C', // Red/Pink for prismatic
    borderStyle: 'solid',
  },
};
