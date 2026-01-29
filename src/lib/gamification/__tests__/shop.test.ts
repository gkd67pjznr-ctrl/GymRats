// src/lib/gamification/__tests__/shop.test.ts
// Tests for the cosmetic shop system

import {
  SHOP_ITEMS,
  getShopItemsByCategory,
  getShopItem,
  getRarityColor,
  DEFAULT_INVENTORY,
  type ShopCategory,
  type ShopRarity,
  type ShopItem,
  type UserInventory,
} from '../shop';

describe('Shop System', () => {
  describe('SHOP_ITEMS', () => {
    it('should have shop items', () => {
      expect(SHOP_ITEMS.length).toBeGreaterThan(0);
    });

    it('should have all required item properties', () => {
      for (const item of SHOP_ITEMS) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('rarity');
        expect(item).toHaveProperty('cost');
        expect(item).toHaveProperty('emoji');
        expect(item).toHaveProperty('isOwned');
      }
    });

    it('should have default items with zero cost', () => {
      const freeItems = SHOP_ITEMS.filter(item => item.cost === 0);
      expect(freeItems.length).toBeGreaterThan(0);

      // Free items exist in the shop
      for (const item of freeItems) {
        expect(item.cost).toBe(0);
      }

      // Check that DEFAULT_INVENTORY includes the starter free items
      for (const itemId of DEFAULT_INVENTORY.ownedItems) {
        const item = getShopItem(itemId);
        expect(item?.cost).toBe(0);
      }
    });
  });

  describe('Shop Categories', () => {
    it('should have personalities category', () => {
      const personalities = getShopItemsByCategory('personalities');
      expect(personalities.length).toBeGreaterThan(0);

      for (const item of personalities) {
        expect(item.category).toBe('personalities');
        expect(item.emoji).toBeTruthy();
      }
    });

    it('should have themes category', () => {
      const themes = getShopItemsByCategory('themes');
      expect(themes.length).toBeGreaterThan(0);

      for (const item of themes) {
        expect(item.category).toBe('themes');
      }
    });

    it('should have card_skins category', () => {
      const skins = getShopItemsByCategory('card_skins');
      expect(skins.length).toBeGreaterThan(0);
    });

    it('should have profile_badges category', () => {
      const badges = getShopItemsByCategory('profile_badges');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should have profile_frames category', () => {
      const frames = getShopItemsByCategory('profile_frames');
      expect(frames.length).toBeGreaterThan(0);
    });

    it('should have titles category', () => {
      const titles = getShopItemsByCategory('titles');
      expect(titles.length).toBeGreaterThan(0);
    });
  });

  describe('getShopItem', () => {
    it('should return item by id', () => {
      const item = getShopItem('personality_classic');
      expect(item).toBeDefined();
      expect(item?.name).toBe('Classic Motivator');
    });

    it('should return undefined for unknown item', () => {
      const item = getShopItem('unknown_item');
      expect(item).toBeUndefined();
    });

    it('should have all default personalities', () => {
      expect(getShopItem('personality_classic')).toBeDefined();
      expect(getShopItem('personality_hype')).toBeDefined();
      expect(getShopItem('personality_zen')).toBeDefined();
      expect(getShopItem('personality_android')).toBeDefined();
      expect(getShopItem('personality_oldschool')).toBeDefined();
    });

    it('should have all default themes', () => {
      expect(getShopItem('theme_toxic')).toBeDefined();
      expect(getShopItem('theme_electric')).toBeDefined();
      expect(getShopItem('theme_ember')).toBeDefined();
      expect(getShopItem('theme_ice')).toBeDefined();
    });
  });

  describe('getRarityColor', () => {
    it('should return gray for common', () => {
      const color = getRarityColor('common');
      expect(color).toBe('#9ca3af');
    });

    it('should return blue for rare', () => {
      const color = getRarityColor('rare');
      expect(color).toBe('#3b82f6');
    });

    it('should return purple for epic', () => {
      const color = getRarityColor('epic');
      expect(color).toBe('#a855f7');
    });

    it('should return gold for legendary', () => {
      const color = getRarityColor('legendary');
      expect(color).toBe('#eab308');
    });
  });

  describe('DEFAULT_INVENTORY', () => {
    it('should have default inventory', () => {
      expect(DEFAULT_INVENTORY).toBeDefined();
      expect(DEFAULT_INVENTORY.ownedItems).toBeInstanceOf(Array);
      expect(DEFAULT_INVENTORY.ownedItems.length).toBeGreaterThan(0);
    });

    it('should include default items', () => {
      expect(DEFAULT_INVENTORY.ownedItems).toContain('personality_classic');
      expect(DEFAULT_INVENTORY.ownedItems).toContain('theme_toxic');
      expect(DEFAULT_INVENTORY.ownedItems).toContain('skin_default');
      expect(DEFAULT_INVENTORY.ownedItems).toContain('frame_default');
      expect(DEFAULT_INVENTORY.ownedItems).toContain('title_default');
    });

    it('should have equipped defaults', () => {
      expect(DEFAULT_INVENTORY.equippedPersonality).toBe('personality_classic');
      expect(DEFAULT_INVENTORY.equippedTheme).toBe('theme_toxic');
      expect(DEFAULT_INVENTORY.equippedCardSkin).toBe('skin_default');
      expect(DEFAULT_INVENTORY.equippedFrame).toBe('frame_default');
      expect(DEFAULT_INVENTORY.equippedTitle).toBe('title_default');
    });

    it('should have empty badges array', () => {
      expect(DEFAULT_INVENTORY.equippedBadges).toEqual([]);
    });
  });

  describe('Shop Item Pricing', () => {
    it('should have reasonable pricing for personalities', () => {
      const personalities = getShopItemsByCategory('personalities');

      for (const item of personalities) {
        if (item.id !== 'personality_classic') {
          expect(item.cost).toBeGreaterThan(0);
          expect(item.cost).toBeLessThanOrEqual(1000);
        }
      }
    });

    it('should have premium personality pricing', () => {
      const hype = getShopItem('personality_hype');
      const zen = getShopItem('personality_zen');
      const android = getShopItem('personality_android');
      const oldschool = getShopItem('personality_oldschool');

      expect(hype?.cost).toBe(500);
      expect(zen?.cost).toBe(500);
      expect(android?.cost).toBe(1000);
      expect(oldschool?.cost).toBe(1000);
    });

    it('should have level requirements for premium items', () => {
      const android = getShopItem('personality_android');
      expect(android?.unlockLevel).toBe(15);

      const oldschool = getShopItem('personality_oldschool');
      expect(oldschool?.unlockLevel).toBe(20);
    });
  });

  describe('Shop Item Structure', () => {
    it('should have proper personality items', () => {
      const personalities = getShopItemsByCategory('personalities');

      for (const item of personalities) {
        expect(item.id).toMatch(/^personality_/);
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(item.emoji.length).toBeGreaterThan(0);
      }
    });

    it('should have proper theme items', () => {
      const themes = getShopItemsByCategory('themes');

      for (const item of themes) {
        expect(item.id).toMatch(/^theme_/);
        expect(item.name).toBeTruthy();
        expect(item.emoji.length).toBeGreaterThan(0);
      }
    });

    it('should have proper badge items', () => {
      const badges = getShopItemsByCategory('profile_badges');

      for (const item of badges) {
        expect(item.id).toMatch(/^badge_/);
        expect(item.emoji.length).toBeGreaterThan(0);
      }
    });
  });
});
