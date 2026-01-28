/**
 * Level thresholds and rewards for the gamification system.
 */

import type { LevelThresholds, TokenReward } from '../types';

/**
 * XP required for each level.
 * Level 1 starts at 0 XP (no threshold).
 * Exponential growth curve with accelerating requirements.
 *
 * Formula: roughly doubles every 2-3 levels after level 5
 */
export const LEVEL_THRESHOLDS: LevelThresholds = [
  0, // Level 1 (starting)
  100, // Level 2
  250, // Level 3
  500, // Level 4
  1000, // Level 5
  2000, // Level 6
  4000, // Level 7
  7000, // Level 8
  12000, // Level 9
  20000, // Level 10
  32000, // Level 11
  50000, // Level 12
  75000, // Level 13
  110000, // Level 14
  160000, // Level 15
  230000, // Level 16
  320000, // Level 17
  440000, // Level 18
  590000, // Level 19
  780000, // Level 20
  1000000, // Level 21 (1M - major milestone)
  1300000,
  1700000,
  2200000,
  2800000,
  3500000, // Level 26
  4400000,
  5500000,
  6800000,
  8300000,
  10000000, // Level 31 (10M)
  // Continue exponential growth...
];

/**
 * Get the XP threshold for a given level.
 * @param level - The level to get threshold for (1-indexed)
 * @returns XP required to reach this level
 */
export function getThresholdForLevel(level: number): number {
  if (level < 1 || level > LEVEL_THRESHOLDS.length) {
    // For levels beyond defined thresholds, use exponential extrapolation
    if (level > LEVEL_THRESHOLDS.length) {
      const lastThreshold = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
      const levelsBeyond = level - LEVEL_THRESHOLDS.length;
      // Roughly 1.5x growth per level beyond defined range
      return Math.floor(lastThreshold * Math.pow(1.5, levelsBeyond));
    }
    return 0;
  }
  return LEVEL_THRESHOLDS[level - 1];
}

/**
 * Calculate the current level from total XP.
 * @param totalXP - Total XP earned
 * @returns Current level
 */
export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Calculate XP progress toward next level.
 * @param totalXP - Total XP earned
 * @returns Object with current level, XP into current level, and XP needed for next level
 */
export function getLevelProgress(totalXP: number): {
  currentLevel: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
} {
  const currentLevel = getLevelFromXP(totalXP);
  const currentThreshold = getThresholdForLevel(currentLevel);
  const nextThreshold = getThresholdForLevel(currentLevel + 1);

  const xpIntoLevel = totalXP - currentThreshold;
  const xpToNextLevel = nextThreshold - currentThreshold;
  const progressPercent = xpToNextLevel > 0 ? (xpIntoLevel / xpToNextLevel) * 100 : 100;

  return {
    currentLevel,
    xpIntoLevel,
    xpToNextLevel,
    progressPercent: Math.min(100, Math.max(0, progressPercent)),
  };
}

/**
 * Calculate Forge Token reward for leveling up.
 * @param newLevel - The level achieved
 * @returns Token reward details
 */
export function getLevelUpReward(newLevel: number): TokenReward {
  // Base reward of 50 tokens + level × 10
  // This makes higher levels worth more
  const amount = 50 + newLevel * 10;

  return {
    type: 'level_up',
    amount,
    context: `Level ${newLevel}`,
  };
}

/**
 * Get display name for a level tier.
 * Tiers group levels into meaningful categories.
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
 * Get the rank-style color for a level tier.
 * Returns a color key compatible with the design system.
 */
export function getLevelTierColor(level: number): string {
  if (level <= 5) return 'iron';
  if (level <= 10) return 'bronze';
  if (level <= 15) return 'silver';
  if (level <= 20) return 'gold';
  if (level <= 30) return 'platinum';
  return 'mythic';
}
