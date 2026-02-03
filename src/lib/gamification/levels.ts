// src/lib/gamification/levels.ts
// User level system with XP thresholds and rewards

/**
 * XP earning sources
 */
export type XPSource =
  | 'workout_complete'    // Completing a workout
  | 'set_logged'          // Logging a set
  | 'pr_achieved'         // Achieving a PR
  | 'streak_milestone'    // Streak milestones (3, 7, 14, 30 days)
  | 'rank_up'            // GymRank rank increase
  | 'first_workout'      // First workout ever
  | 'returning_user'     // Returning after break
  | 'workout_plan'       // Following a plan/routine
  | 'social_post'        // Creating a post
  | 'social_reaction';   // Reacting to a post

/**
 * XP rewards for different actions
 */
export const XP_REWARDS: Record<XPSource, number> = {
  workout_complete: 100,
  set_logged: 5,
  pr_achieved: 50,
  streak_milestone: 200,
  rank_up: 150,
  first_workout: 500,
  returning_user: 100,
  workout_plan: 50, // Bonus for following a plan
  social_post: 25,
  social_reaction: 5,
};

/**
 * Level thresholds and rewards
 *
 * Each level requires a cumulative XP total and gives currency rewards.
 */
export interface LevelInfo {
  level: number;
  totalXP: number;
  xpToNext: number;
  currencyReward: number;
  unlocks?: string[];
}

/**
 * Calculate level info from total XP
 */
export function getLevelFromXP(totalXP: number): LevelInfo {
  // Level formula: each level requires 100 * level XP
  // Level 1: 0 XP
  // Level 2: 100 XP
  // Level 3: 300 XP (100 + 200)
  // Level 4: 600 XP (100 + 200 + 300)
  // ...

  let level = 1;
  let xpForCurrentLevel = 0;
  let xpNeededForNext = 100;

  while (totalXP >= xpNeededForNext && level < 100) {
    level++;
    xpForCurrentLevel = xpNeededForNext;
    xpNeededForNext += 100 * level;
  }

  const xpToNext = xpNeededForNext - totalXP;
  const xpProgress = totalXP - xpForCurrentLevel;
  const xpRequired = xpNeededForNext - xpForCurrentLevel;

  // Currency reward: 10 coins per level (bonus every 5 levels)
  const baseReward = level * 10;
  const milestoneBonus = level % 5 === 0 ? 50 : 0;
  const currencyReward = baseReward + milestoneBonus;

  // Unlocks at specific levels
  const unlocks: string[] = [];
  if (level >= 5) unlocks.push('hype_beast_personality');
  if (level >= 10) unlocks.push('zen_coach_personality');
  if (level >= 15) unlocks.push('android_personality');
  if (level >= 20) unlocks.push('oldschool_personality');

  return {
    level,
    totalXP,
    xpToNext: xpToNext,
    currencyReward,
    unlocks: unlocks.length > 0 ? unlocks : undefined,
  };
}

/**
 * Calculate progress percentage for current level
 */
export function getLevelProgress(totalXP: number): number {
  const levelInfo = getLevelFromXP(totalXP);
  const xpForCurrentLevel = levelInfo.totalXP - (levelInfo.xpToNext - (100 * levelInfo.level));
  const xpRequired = 100 * levelInfo.level;
  const xpProgress = totalXP - xpForCurrentLevel;
  return Math.min(100, Math.max(0, (xpProgress / xpRequired) * 100));
}

/**
 * Streak milestones and their XP rewards
 */
export interface StreakMilestone {
  days: number;
  xp: number;
  currency: number;
  label: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, xp: 100, currency: 25, label: '3 Day Streak!' },
  { days: 7, xp: 200, currency: 50, label: 'Week Warrior!' },
  { days: 14, xp: 400, currency: 100, label: 'Two Week Titan!' },
  { days: 30, xp: 1000, currency: 250, label: 'Monthly Master!' },
  { days: 60, xp: 2500, currency: 500, label: 'Two Month Legend!' },
  { days: 90, xp: 5000, currency: 1000, label: 'Quarter Champion!' },
  { days: 180, xp: 10000, currency: 2000, label: 'Half Year Hero!' },
  { days: 365, xp: 25000, currency: 5000, label: 'Yearly God!' },
];

/**
 * Get streak milestone for current streak
 */
export function getStreakMilestone(streakDays: number): StreakMilestone | null {
  // Find the highest milestone achieved
  for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
    if (streakDays >= STREAK_MILESTONES[i].days) {
      // Check if this milestone was just achieved (within the same day range)
      const prevMilestoneDays = i > 0 ? STREAK_MILESTONES[i - 1].days : 0;
      if (streakDays === STREAK_MILESTONES[i].days || (streakDays > STREAK_MILESTONES[i].days && streakDays < (STREAK_MILESTONES[i + 1]?.days || Infinity))) {
        return STREAK_MILESTONES[i];
      }
      break;
    }
  }
  return null;
}

/**
 * Daily login rewards
 */
export interface DailyReward {
  day: number;
  currency: number;
  streakBonus: number;
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, currency: 10, streakBonus: 0 },
  { day: 2, currency: 15, streakBonus: 5 },
  { day: 3, currency: 20, streakBonus: 10 },
  { day: 4, currency: 25, streakBonus: 15 },
  { day: 5, currency: 30, streakBonus: 20 },
  { day: 6, currency: 35, streakBonus: 25 },
  { day: 7, currency: 50, streakBonus: 50 }, // Weekly bonus
];

/**
 * Get daily login reward
 */
export function getDailyReward(consecutiveDays: number): DailyReward {
  const dayIndex = Math.min(consecutiveDays - 1, DAILY_REWARDS.length - 1);
  return DAILY_REWARDS[Math.max(0, dayIndex)];
}
