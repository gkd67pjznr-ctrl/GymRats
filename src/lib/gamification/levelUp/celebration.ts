/**
 * Level up celebration logic.
 */

import type { LevelUpCelebration } from '../types';
import { getLevelUpContent } from './content';
import { getLevelUpReward } from '../xp/levels';

/**
 * Create a level up celebration for the given level.
 *
 * @param newLevel - The new level achieved
 * @param previousLevel - The level before leveling up
 * @returns Complete level up celebration data
 */
export function createLevelUpCelebration(
  newLevel: number,
  previousLevel: number
): LevelUpCelebration {
  const reward = getLevelUpReward(newLevel);
  const content = getLevelUpContent(newLevel);

  return {
    level: newLevel,
    previousLevel,
    tokensAwarded: reward.amount,
    content,
  };
}

/**
 * Check if a level up should trigger a celebration.
 * Prevents duplicate celebrations for the same level.
 *
 * @param newLevel - The new level achieved
 * @param lastCelebratedLevel - The last level that had a celebration shown
 * @returns Whether to show celebration
 */
export function shouldShowLevelUpCelebration(
  newLevel: number,
  lastCelebratedLevel?: number
): boolean {
  // Always show if no previous celebration
  if (!lastCelebratedLevel) return true;

  // Only show if this is a new level (not already celebrated)
  return newLevel > lastCelebratedLevel;
}

/**
 * Calculate how many levels were gained (for rare multi-level jumps).
 *
 * @param previousLevel - Previous level
 * @param newLevel - New level
 * @returns Number of levels gained
 */
export function calculateLevelsGained(previousLevel: number, newLevel: number): number {
  return Math.max(0, newLevel - previousLevel);
}

/**
 * Get the tier name for a level.
 *
 * @param level - Level number
 * @returns Tier name
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
 * Get the color key for a level tier.
 *
 * @param level - Level number
 * @returns Design system color key
 */
export function getLevelTierColor(level: number): string {
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
