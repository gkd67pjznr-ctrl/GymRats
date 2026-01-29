// src/lib/gamification/shop.ts
// Cosmetic shop with purchasable items using currency

/**
 * Shop item categories
 */
export type ShopCategory =
  | 'personalities'
  | 'themes'
  | 'card_skins'
  | 'profile_badges'
  | 'profile_frames'
  | 'titles';

/**
 * Shop item rarity
 */
export type ShopRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Shop item definition
 */
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  rarity: ShopRarity;
  cost: number;
  emoji: string;
  isOwned: boolean;
  isEquipped?: boolean;
  unlockLevel?: number; // Minimum level required
  limited?: boolean; // Limited time item
}

/**
 * All shop items
 *
 * These can be purchased with currency earned from workouts and achievements.
 */
export const SHOP_ITEMS: ShopItem[] = [
  // Personalities (already implemented, added to shop for consistency)
  {
    id: 'personality_classic',
    name: 'Classic Motivator',
    description: 'Your reliable gym buddy. Straightforward encouragement.',
    category: 'personalities',
    rarity: 'common',
    cost: 0, // Free (default)
    emoji: '💪',
    isOwned: true,
    isEquipped: true,
  },
  {
    id: 'personality_hype',
    name: 'Hype Beast',
    description: 'Maximum energy, zero chill. LET\'S GOOOO!',
    category: 'personalities',
    rarity: 'rare',
    cost: 500,
    emoji: '🔥',
    isOwned: false,
    unlockLevel: 5,
  },
  {
    id: 'personality_zen',
    name: 'Zen Coach',
    description: 'Calm, focused guidance. Strength through stillness.',
    category: 'personalities',
    rarity: 'rare',
    cost: 500,
    emoji: '🧘',
    isOwned: false,
    unlockLevel: 10,
  },
  {
    id: 'personality_android',
    name: 'Training Android',
    description: 'Analytical, precise, slightly ominous. Your strength metrics are improving.',
    category: 'personalities',
    rarity: 'epic',
    cost: 1000,
    emoji: '🤖',
    isOwned: false,
    unlockLevel: 15,
  },
  {
    id: 'personality_oldschool',
    name: 'Old School Lifter',
    description: 'No-nonsense motivation from a gym veteran. Put some weight on the bar.',
    category: 'personalities',
    rarity: 'epic',
    cost: 1000,
    emoji: '🏋️',
    isOwned: false,
    unlockLevel: 20,
  },

  // Themes
  {
    id: 'theme_toxic',
    name: 'Toxic Green',
    description: 'Vibrant lime green accent theme.',
    category: 'themes',
    rarity: 'common',
    cost: 0,
    emoji: '🟢',
    isOwned: true,
    isEquipped: true,
  },
  {
    id: 'theme_electric',
    name: 'Electric Purple',
    description: 'Bold purple accent theme.',
    category: 'themes',
    rarity: 'rare',
    cost: 300,
    emoji: '🟣',
    isOwned: false,
  },
  {
    id: 'theme_ember',
    name: 'Ember Pink',
    description: 'Warm pink/orange accent theme.',
    category: 'themes',
    rarity: 'rare',
    cost: 300,
    emoji: '🌸',
    isOwned: false,
  },
  {
    id: 'theme_ice',
    name: 'Ice Cyan',
    description: 'Cool cyan accent theme.',
    category: 'themes',
    rarity: 'rare',
    cost: 300,
    emoji: '🧊',
    isOwned: false,
  },
  {
    id: 'theme_gold',
    name: 'Golden God',
    description: 'Luxurious gold accent theme.',
    category: 'themes',
    rarity: 'legendary',
    cost: 2000,
    emoji: '✨',
    isOwned: false,
    unlockLevel: 25,
  },
  {
    id: 'theme_void',
    name: 'Void Black',
    description: 'Dark mode extraordinaire. Pure black aesthetics.',
    category: 'themes',
    rarity: 'epic',
    cost: 1000,
    emoji: '⚫',
    isOwned: false,
    unlockLevel: 15,
  },

  // Card Skins (for social posts)
  {
    id: 'skin_default',
    name: 'Classic Card',
    description: 'Clean, simple post card design.',
    category: 'card_skins',
    rarity: 'common',
    cost: 0,
    emoji: '📄',
    isOwned: true,
    isEquipped: true,
  },
  {
    id: 'skin_neon',
    name: 'Neon Glow',
    description: 'Vibrant neon border effects.',
    category: 'card_skins',
    rarity: 'rare',
    cost: 400,
    emoji: '💡',
    isOwned: false,
  },
  {
    id: 'skin_holographic',
    name: 'Holographic',
    description: 'Shimmering holographic finish.',
    category: 'card_skins',
    rarity: 'epic',
    cost: 800,
    emoji: '🌈',
    isOwned: false,
    unlockLevel: 10,
  },
  {
    id: 'skin_gold',
    name: 'Gold Plated',
    description: 'Luxurious gold border design.',
    category: 'card_skins',
    rarity: 'legendary',
    cost: 2500,
    emoji: '🏅',
    isOwned: false,
    unlockLevel: 30,
  },

  // Profile Badges
  {
    id: 'badge_early_adopter',
    name: 'Early Adopter',
    description: 'Been here since the beginning.',
    category: 'profile_badges',
    rarity: 'legendary',
    cost: 0,
    emoji: '🌟',
    isOwned: false,
    limited: true,
  },
  {
    id: 'badge_pr_hunter',
    name: 'PR Hunter',
    description: 'Achieved 10 PRs in a single workout.',
    category: 'profile_badges',
    rarity: 'epic',
    cost: 0,
    emoji: '🎯',
    isOwned: false,
  },
  {
    id: 'badge_iron_lifter',
    name: 'Iron Lifter',
    description: 'Reached Iron rank on any exercise.',
    category: 'profile_badges',
    rarity: 'common',
    cost: 0,
    emoji: '🔩',
    isOwned: false,
  },
  {
    id: 'badge_mythic_lifter',
    name: 'Mythic Lifter',
    description: 'Reached Mythic rank on any exercise.',
    category: 'profile_badges',
    rarity: 'legendary',
    cost: 0,
    emoji: '👑',
    isOwned: false,
  },
  {
    id: 'badge_streak_warrior',
    name: 'Streak Warrior',
    description: 'Maintained a 30-day workout streak.',
    category: 'profile_badges',
    rarity: 'epic',
    cost: 0,
    emoji: '🔥',
    isOwned: false,
  },

  // Profile Frames
  {
    id: 'frame_default',
    name: 'No Frame',
    description: 'Simple avatar, no decorations.',
    category: 'profile_frames',
    rarity: 'common',
    cost: 0,
    emoji: '⬜',
    isOwned: true,
    isEquipped: true,
  },
  {
    id: 'frame_silver',
    name: 'Silver Border',
    description: 'Elegant silver frame.',
    category: 'profile_frames',
    rarity: 'rare',
    cost: 500,
    emoji: '🔲',
    isOwned: false,
  },
  {
    id: 'frame_gold',
    name: 'Golden Frame',
    description: 'Premium gold frame.',
    category: 'profile_frames',
    rarity: 'epic',
    cost: 1500,
    emoji: '🔳',
    isOwned: false,
    unlockLevel: 20,
  },

  // Titles
  {
    id: 'title_default',
    name: 'Lifter',
    description: 'Default title.',
    category: 'titles',
    rarity: 'common',
    cost: 0,
    emoji: '💪',
    isOwned: true,
    isEquipped: true,
  },
  {
    id: 'title_beast',
    name: 'BEAST MODE',
    description: 'For those who lift heavy.',
    category: 'titles',
    rarity: 'rare',
    cost: 600,
    emoji: '🦁',
    isOwned: false,
    unlockLevel: 10,
  },
  {
    id: 'title_grinder',
    name: 'The Grinder',
    description: 'Consistency is key.',
    category: 'titles',
    rarity: 'rare',
    cost: 600,
    emoji: '⚙️',
    isOwned: false,
    unlockLevel: 10,
  },
  {
    id: 'title_champion',
    name: 'Champion',
    description: 'Proven excellence.',
    category: 'titles',
    rarity: 'epic',
    cost: 1200,
    emoji: '🏆',
    isOwned: false,
    unlockLevel: 25,
  },
  {
    id: 'title_legend',
    name: 'LEGEND',
    description: 'Living gym mythology.',
    category: 'titles',
    rarity: 'legendary',
    cost: 3000,
    emoji: '👑',
    isOwned: false,
    unlockLevel: 50,
  },
];

/**
 * Get shop items by category
 */
export function getShopItemsByCategory(category: ShopCategory): ShopItem[] {
  return SHOP_ITEMS.filter(item => item.category === category);
}

/**
 * Get shop item by ID
 */
export function getShopItem(itemId: string): ShopItem | undefined {
  return SHOP_ITEMS.find(item => item.id === itemId);
}

/**
 * Get rarity color (for UI)
 */
export function getRarityColor(rarity: ShopRarity): string {
  switch (rarity) {
    case 'common':
      return '#9ca3af'; // Gray
    case 'rare':
      return '#3b82f6'; // Blue
    case 'epic':
      return '#a855f7'; // Purple
    case 'legendary':
      return '#eab308'; // Gold
  }
}

/**
 * User inventory state
 */
export interface UserInventory {
  ownedItems: string[];
  equippedPersonality?: string;
  equippedTheme?: string;
  equippedCardSkin?: string;
  equippedBadges: string[];
  equippedFrame?: string;
  equippedTitle?: string;
}

/**
 * Default empty inventory
 */
export const DEFAULT_INVENTORY: UserInventory = {
  ownedItems: ['personality_classic', 'theme_toxic', 'skin_default', 'frame_default', 'title_default'],
  equippedPersonality: 'personality_classic',
  equippedTheme: 'theme_toxic',
  equippedCardSkin: 'skin_default',
  equippedBadges: [],
  equippedFrame: 'frame_default',
  equippedTitle: 'title_default',
};
