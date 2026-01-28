/**
 * Currency (Forge Token) management logic.
 */

import type { CurrencyRewardType, TokenReward } from '../types';

/**
 * Calculate Forge Token reward for a PR based on tier.
 *
 * Weight PR tiers based on rank advancement (1-4 per exercise):
 * - Tier 1: Iron → Bronze (5 tokens)
 * - Tier 2: Bronze → Silver (7 tokens)
 * - Tier 3: Silver → Gold (9 tokens)
 * - Tier 4: Gold → Platinum (11 tokens)
 * - Tier 5+: Platinum → Diamond+ (13 tokens)
 *
 * @param type - Type of PR achievement
 * @param tier - Rank tier (1-7) or undefined for e1RM/rep PRs
 * @returns Token reward
 */
export function calculatePRReward(
  type: 'weight' | 'rep' | 'e1rm',
  tier?: number
): TokenReward {
  if (type === 'weight' && tier !== undefined) {
    // Weight PR rewards based on tier
    const tierRewards: Record<number, number> = {
      1: 5,
      2: 7,
      3: 9,
      4: 11,
      5: 13,
      6: 15,
      7: 20,
    };

    const amount = tierRewards[tier] ?? 5;

    return {
      type: tier === 4 ? 'pr_weight_tier4' : 'pr_weight_tier1',
      amount,
      context: `Tier ${tier}`,
    };
  }

  if (type === 'rep') {
    return {
      type: 'pr_rep',
      amount: 5,
      context: 'Rep PR',
    };
  }

  // e1RM PR - reward based on estimated tier (or default)
  return {
    type: 'pr_e1rm',
    amount: tier ? 5 + tier * 2 : 7,
    context: 'e1RM PR',
  };
}

/**
 * Calculate token reward for a level-up.
 *
 * @param newLevel - The level achieved
 * @returns Token reward
 */
export function calculateLevelUpReward(newLevel: number): TokenReward {
  const amount = 50 + newLevel * 10;

  return {
    type: 'level_up',
    amount,
    context: `Level ${newLevel}`,
  };
}

/**
 * Calculate token reward for a rank-up.
 *
 * @param newRank - The new rank achieved (bronze, silver, etc.)
 * @returns Token reward
 */
export function calculateRankUpReward(newRank: string): TokenReward {
  const rankRewards: Record<string, number> = {
    bronze: 10,
    silver: 25,
    gold: 50,
    platinum: 100,
    diamond: 200,
    mythic: 500,
  };

  const amount = rankRewards[newRank.toLowerCase()] ?? 10;

  return {
    type: 'rank_up',
    amount,
    context: newRank,
  };
}

/**
 * Calculate token reward for streak milestones.
 *
 * @param streakDays - Current streak count
 * @returns Token reward if milestone reached, null otherwise
 */
export function calculateStreakReward(streakDays: number): TokenReward | null {
  const milestones: Record<number, number> = {
    7: 25,
    14: 40,
    21: 60,
    30: 100,
    60: 200,
    90: 300,
    100: 500,
    180: 750,
    365: 1500,
  };

  const amount = milestones[streakDays];
  if (!amount) return null;

  return {
    type: streakDays === 7 ? 'streak_7' : streakDays === 30 ? 'streak_30' : 'streak_100',
    amount,
    context: `${streakDays} day streak`,
  };
}

/**
 * Get base token reward for completing a workout.
 *
 * @param wasPerfectWorkout - Whether the workout was 100% completed
 * @returns Token reward
 */
export function getWorkoutCompletionReward(wasPerfectWorkout = false): TokenReward {
  return {
    type: wasPerfectWorkout ? 'plan_complete' : 'workout_complete',
    amount: wasPerfectWorkout ? 10 : 5,
  };
}

/**
 * Calculate all token rewards for a finished workout.
 *
 * @param params - Workout parameters
 * @returns Array of token rewards earned
 */
export function calculateWorkoutTokenRewards(params: {
  setCount: number;
  wasPerfectWorkout: boolean;
  streakMilestone?: number;
  prsAchieved?: Array<{ type: 'weight' | 'rep' | 'e1rm'; tier?: number }>;
}): TokenReward[] {
  const rewards: TokenReward[] = [];

  // Base completion reward
  rewards.push(getWorkoutCompletionReward(params.wasPerfectWorkout));

  // Streak milestone
  if (params.streakMilestone) {
    const streakReward = calculateStreakReward(params.streakMilestone);
    if (streakReward) rewards.push(streakReward);
  }

  // PR rewards
  params.prsAchieved?.forEach((pr) => {
    rewards.push(calculatePRReward(pr.type, pr.tier));
  });

  return rewards;
}

/**
 * Validate that user has sufficient tokens for a purchase.
 *
 * @param balance - Current token balance
 * @param cost - Cost of item
 * @returns Whether user can afford the purchase
 */
export function canAfford(balance: number, cost: number): boolean {
  return balance >= cost;
}

/**
 * Calculate remaining tokens after a purchase.
 *
 * @param balance - Current token balance
 * @param cost - Cost of item
 * @returns New balance, or null if insufficient funds
 */
export function spendTokens(balance: number, cost: number): number | null {
  if (!canAfford(balance, cost)) return null;
  return balance - cost;
}

/**
 * Get reward type display name.
 *
 * @param type - Currency reward type
 * @returns Human-readable name
 */
export function getRewardTypeName(type: CurrencyRewardType): string {
  const names: Record<CurrencyRewardType, string> = {
    pr_weight_tier1: 'Weight PR',
    pr_weight_tier4: 'Weight PR',
    pr_rep: 'Rep PR',
    pr_e1rm: 'e1RM PR',
    rank_up: 'Rank Up',
    level_up: 'Level Up',
    streak_7: '7-Day Streak',
    streak_30: '30-Day Streak',
    streak_100: '100-Day Streak',
    workout_complete: 'Workout Complete',
    plan_complete: 'Perfect Workout',
    milestone: 'Milestone',
  };

  return names[type] ?? 'Reward';
}

/**
 * Calculate tier from e1RM progression.
 * Used for determining token rewards for e1RM PRs.
 *
 * @param exerciseId - Exercise ID
 * @param newE1RM - New e1RM value
 * @param previousE1RM - Previous e1RM value
 * @returns Tier number (1-7)
 */
export function calculatePRTierFromProgression(
  exerciseId: string,
  newE1RM: number,
  previousE1RM: number
): number {
  // Tier based on percentage improvement
  const improvement = (newE1RM - previousE1RM) / previousE1RM;

  if (improvement >= 0.5) return 7; // 50%+ improvement
  if (improvement >= 0.3) return 6; // 30%+ improvement
  if (improvement >= 0.2) return 5; // 20%+ improvement
  if (improvement >= 0.15) return 4; // 15%+ improvement
  if (improvement >= 0.1) return 3; // 10%+ improvement
  if (improvement >= 0.05) return 2; // 5%+ improvement
  return 1; // Any PR is at least tier 1
}

/**
 * Format token amount for display.
 *
 * @param amount - Token amount
 * @returns Formatted string (e.g., "1,500 Tokens")
 */
export function formatTokenAmount(amount: number): string {
  return amount.toLocaleString() + ' Token' + (amount !== 1 ? 's' : '');
}

/**
 * Get currency reward emoji/icon.
 *
 * @param type - Currency reward type
 * @returns Emoji for the reward type
 */
export function getRewardEmoji(type: CurrencyRewardType): string {
  const emojis: Partial<Record<CurrencyRewardType, string>> = {
    pr_weight_tier1: '🏋️',
    pr_weight_tier4: '🏆',
    pr_rep: '💪',
    pr_e1rm: '📈',
    rank_up: '⬆️',
    level_up: '🎖️',
    streak_7: '🔥',
    streak_30: '🔥',
    streak_100: '🔥',
    workout_complete: '✅',
    plan_complete: '⭐',
    milestone: '🏅',
  };

  return emojis[type] ?? '💎';
}
