/**
 * Milestone definitions for the gamification system.
 */

import type { Milestone, MilestoneId } from '../types';

/**
 * All available milestones.
 * Users earn Forge Tokens for completing each milestone.
 */
export const MILESTONES: Milestone[] = [
  // === Streak Milestones ===
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Complete a workout every day for 7 days',
    tokens: 25,
    icon: '🔥',
  },
  {
    id: 'streak_14',
    name: 'Two Week Titan',
    description: 'Maintain a 14-day workout streak',
    tokens: 40,
    icon: '🔥',
  },
  {
    id: 'streak_21',
    name: 'Three Week Champion',
    description: 'Maintain a 21-day workout streak',
    tokens: 60,
    icon: '🔥',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day workout streak',
    tokens: 100,
    icon: '🔥',
  },
  {
    id: 'streak_60',
    name: 'Iron Will',
    description: 'Maintain a 60-day workout streak',
    tokens: 200,
    icon: '🔥',
  },
  {
    id: 'streak_90',
    name: 'Quarter Consistency',
    description: 'Maintain a 90-day workout streak',
    tokens: 300,
    icon: '🔥',
  },
  {
    id: 'streak_100',
    name: 'Century Streak',
    description: 'Maintain a 100-day workout streak',
    tokens: 500,
    icon: '🔥',
  },
  {
    id: 'streak_180',
    name: 'Half Year Hero',
    description: 'Maintain a 180-day workout streak',
    tokens: 750,
    icon: '🔥',
  },
  {
    id: 'streak_365',
    name: 'Year of Iron',
    description: 'Maintain a 365-day workout streak',
    tokens: 1500,
    icon: '🔥',
  },

  // === Total Workout Milestones ===
  {
    id: 'total_workouts_10',
    name: 'Getting Started',
    description: 'Complete 10 total workouts',
    tokens: 25,
    icon: '🏋️',
  },
  {
    id: 'total_workouts_50',
    name: 'Regular',
    description: 'Complete 50 total workouts',
    tokens: 50,
    icon: '🏋️',
  },
  {
    id: 'total_workouts_100',
    name: 'Centurion',
    description: 'Complete 100 total workouts',
    tokens: 100,
    icon: '🏋️',
  },
  {
    id: 'total_workouts_500',
    name: 'Dedicated',
    description: 'Complete 500 total workouts',
    tokens: 500,
    icon: '🏋️',
  },
  {
    id: 'total_workouts_1000',
    name: 'Million Club',
    description: 'Complete 1000 total workouts',
    tokens: 1500,
    icon: '🏋️',
  },

  // === XP Milestones ===
  {
    id: 'total_xp_1000',
    name: 'XP Pioneer',
    description: 'Earn 1,000 total XP',
    tokens: 25,
    icon: '⭐',
  },
  {
    id: 'total_xp_10000',
    name: 'XP Hunter',
    description: 'Earn 10,000 total XP',
    tokens: 100,
    icon: '⭐',
  },
  {
    id: 'total_xp_50000',
    name: 'XP Master',
    description: 'Earn 50,000 total XP',
    tokens: 500,
    icon: '⭐',
  },
  {
    id: 'total_xp_100000',
    name: 'XP Legend',
    description: 'Earn 100,000 total XP',
    tokens: 1500,
    icon: '⭐',
  },

  // === Level Milestones ===
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    tokens: 25,
    icon: '🎖️',
  },
  {
    id: 'level_10',
    name: 'Double Digits',
    description: 'Reach Level 10',
    tokens: 100,
    icon: '🎖️',
  },
  {
    id: 'level_20',
    name: 'Top Tier',
    description: 'Reach Level 20',
    tokens: 500,
    icon: '🎖️',
  },
  {
    id: 'level_30',
    name: 'Master Level',
    description: 'Reach Level 30',
    tokens: 1000,
    icon: '🎖️',
  },

  // === PR Milestones ===
  {
    id: 'first_pr',
    name: 'First PR',
    description: 'Set your first personal record',
    tokens: 10,
    icon: '🏆',
  },
  {
    id: 'ten_prs',
    name: 'PR Collector',
    description: 'Set 10 personal records',
    tokens: 50,
    icon: '🏆',
  },
  {
    id: 'hundred_prs',
    name: 'PR Legend',
    description: 'Set 100 personal records',
    tokens: 500,
    icon: '🏆',
  },
];

/**
 * Get milestone by ID.
 */
export function getMilestone(id: MilestoneId): Milestone | undefined {
  return MILESTONES.find((m) => m.id === id);
}

/**
 * Get all milestones of a specific type.
 */
export function getMilestonesByType(type: 'streak' | 'total_workouts' | 'total_xp' | 'level'): Milestone[] {
  return MILESTONES.filter((m) => m.id.startsWith(type + '_'));
}

/**
 * Get next milestone for a given type and value.
 *
 * @param type - Milestone type
 * @param currentValue - Current value to compare
 * @returns Next milestone, or null if all complete
 */
export function getNextMilestone(
  type: 'streak' | 'total_workouts' | 'total_xp' | 'level',
  currentValue: number
): Milestone | null {
  const milestones = getMilestonesByType(type)
    .filter((m) => {
      const value = parseInt(m.id.split('_')[2] || m.id.split('_')[1] || '0', 10);
      return value > currentValue;
    })
    .sort((a, b) => {
      const aValue = parseInt(a.id.split('_')[2] || a.id.split('_')[1] || '0', 10);
      const bValue = parseInt(b.id.split('_')[2] || b.id.split('_')[1] || '0', 10);
      return aValue - bValue;
    });

  return milestones[0] || null;
}

/**
 * Check if a milestone is complete based on current value.
 *
 * @param milestone - Milestone to check
 * @param currentValue - Current value
 * @returns Whether milestone is complete
 */
export function isMilestoneComplete(milestone: MilestoneId, currentValue: number): boolean {
  const milestoneValue = parseInt(milestone.split('_')[2] || milestone.split('_')[1] || '0', 10);
  return currentValue >= milestoneValue;
}

/**
 * Get completed milestone IDs for a given profile state.
 *
 * @param totalWorkouts - Total workouts completed
 * @param totalXP - Total XP earned
 * @param currentLevel - Current level
 * @param currentStreak - Current streak
 * @param totalPRs - Total PRs achieved
 * @returns Array of completed milestone IDs
 */
export function getCompletedMilestones(params: {
  totalWorkouts: number;
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  totalPRs: number;
}): MilestoneId[] {
  const completed: MilestoneId[] = [];

  for (const milestone of MILESTONES) {
    const parts = milestone.id.split('_');
    const type = parts[0];
    const value = parseInt(parts[2] || parts[1] || '0', 10);

    let isComplete = false;

    switch (type) {
      case 'streak':
        isComplete = params.currentStreak >= value;
        break;
      case 'total_workouts':
        isComplete = params.totalWorkouts >= value;
        break;
      case 'total_xp':
        isComplete = params.totalXP >= value;
        break;
      case 'level':
        isComplete = params.currentLevel >= value;
        break;
      case 'first_pr':
        isComplete = params.totalPRs >= 1;
        break;
      case 'ten_prs':
        isComplete = params.totalPRs >= 10;
        break;
      case 'hundred_prs':
        isComplete = params.totalPRs >= 100;
        break;
    }

    if (isComplete) {
      completed.push(milestone.id);
    }
  }

  return completed;
}

/**
 * Get newly completed milestones since last check.
 *
 * @param previousCompleted - Previously completed milestone IDs
 * @param currentParams - Current profile state
 * @returns Array of newly completed milestones
 */
export function getNewMilestones(
  previousCompleted: MilestoneId[],
  currentParams: {
    totalWorkouts: number;
    totalXP: number;
    currentLevel: number;
    currentStreak: number;
    totalPRs: number;
  }
): Milestone[] {
  const nowCompleted = getCompletedMilestones(currentParams);
  const newIds = nowCompleted.filter((id) => !previousCompleted.includes(id));

  return newIds.map((id) => getMilestone(id)).filter((m): m is Milestone => m !== undefined);
}

/**
 * Calculate total tokens earned from all completed milestones.
 */
export function calculateMilestoneTokens(completedIds: MilestoneId[]): number {
  return completedIds.reduce((sum, id) => {
    const milestone = getMilestone(id);
    return sum + (milestone?.tokens || 0);
  }, 0);
}
