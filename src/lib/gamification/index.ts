// src/lib/gamification/index.ts
// Central exports for gamification module

// Types
export type { GamificationProfile, LevelUpCelebration, WorkoutForCalculation, MilestoneId } from './types';
export { DEFAULT_GAMIFICATION_PROFILE } from './types';

// Shop
export { SHOP_ITEMS, getShopItem, DEFAULT_INVENTORY, type ShopItem, type ShopCategory, type UserInventory } from './shop';

// XP
export { calculateWorkoutXP } from './xp/calculator';

// Levels
export { getLevelProgress, getLevelTierColor, getLevelTierName } from './xp/levels';

// Streak
export { updateStreak, updateWorkoutCalendar, checkStreakMilestone } from './streak/tracker';

// Currency
export { calculateLevelUpReward } from './currency/manager';
export { getCompletedMilestones, getNewMilestones } from './currency/milestones';