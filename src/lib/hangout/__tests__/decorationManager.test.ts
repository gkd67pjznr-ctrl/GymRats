// src/lib/hangout/__tests__/decorationManager.test.ts
// Unit tests for decoration manager utility functions

import {
  DECORATION_ITEMS,
  ROOM_THEMES,
  getDecorationsByCategory,
  getDecorationById,
  getThemeById,
  getAffordableDecorations,
  getAffordableThemes,
  isValidDecorationPosition,
  getDecorationCategoryName,
} from '../decorationManager';

describe('decorationManager', () => {
  describe('DECORATION_ITEMS', () => {
    it('should have 11 decoration items', () => {
      expect(DECORATION_ITEMS).toHaveLength(11);
    });

    it('should have all required categories', () => {
      const categories = new Set(DECORATION_ITEMS.map(item => item.category));
      expect(categories).toContain('furniture');
      expect(categories).toContain('poster');
      expect(categories).toContain('equipment');
      expect(categories).toContain('trophies');
      expect(categories).toContain('plants');
    });

    it('should have items with valid structure', () => {
      DECORATION_ITEMS.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('price');
        expect(typeof item.id).toBe('string');
        expect(typeof item.name).toBe('string');
        expect(typeof item.description).toBe('string');
        expect(typeof item.price).toBe('number');
        expect(item.price).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('ROOM_THEMES', () => {
    it('should have 4 room themes', () => {
      expect(ROOM_THEMES).toHaveLength(4);
    });

    it('should have themes with valid structure', () => {
      ROOM_THEMES.forEach(theme => {
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('description');
        expect(theme).toHaveProperty('backgroundColor');
        expect(typeof theme.id).toBe('string');
        expect(typeof theme.name).toBe('string');
        expect(typeof theme.description).toBe('string');
        expect(typeof theme.backgroundColor).toBe('string');
        // Price can be undefined (free theme)
        if (theme.price !== undefined) {
          expect(typeof theme.price).toBe('number');
          expect(theme.price).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('getDecorationsByCategory', () => {
    it('should return furniture items', () => {
      const result = getDecorationsByCategory('furniture');
      expect(result).toHaveLength(3);
      expect(result.every(item => item.category === 'furniture')).toBe(true);
    });

    it('should return poster items', () => {
      const result = getDecorationsByCategory('poster');
      expect(result).toHaveLength(2);
      expect(result.every(item => item.category === 'poster')).toBe(true);
    });

    it('should return equipment items', () => {
      const result = getDecorationsByCategory('equipment');
      expect(result).toHaveLength(2);
      expect(result.every(item => item.category === 'equipment')).toBe(true);
    });

    it('should return trophies items', () => {
      const result = getDecorationsByCategory('trophies');
      expect(result).toHaveLength(2);
      expect(result.every(item => item.category === 'trophies')).toBe(true);
    });

    it('should return plants items', () => {
      const result = getDecorationsByCategory('plants');
      expect(result).toHaveLength(2);
      expect(result.every(item => item.category === 'plants')).toBe(true);
    });

    it('should return empty array for category with no items', () => {
      const result = getDecorationsByCategory('nonexistent' as any);
      expect(result).toEqual([]);
    });
  });

  describe('getDecorationById', () => {
    it('should return decoration by ID', () => {
      const result = getDecorationById('chair_001');
      expect(result).toBeDefined();
      expect(result?.id).toBe('chair_001');
      expect(result?.name).toBe('Basic Chair');
      expect(result?.category).toBe('furniture');
    });

    it('should return undefined for non-existent ID', () => {
      const result = getDecorationById('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should return correct item for trophy_001', () => {
      const result = getDecorationById('trophy_001');
      expect(result?.name).toBe('First PR Trophy');
      expect(result?.category).toBe('trophies');
      expect(result?.price).toBe(75);
    });
  });

  describe('getThemeById', () => {
    it('should return theme by ID', () => {
      const result = getThemeById('default');
      expect(result).toBeDefined();
      expect(result?.id).toBe('default');
      expect(result?.name).toBe('Gym Standard');
    });

    it('should return undefined for non-existent theme', () => {
      const result = getThemeById('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should return retro theme with correct properties', () => {
      const result = getThemeById('retro');
      expect(result?.name).toBe('Retro 80s');
      expect(result?.backgroundColor).toBe('#121220');
      expect(result?.price).toBe(250);
    });
  });

  describe('getAffordableDecorations', () => {
    it('should return decorations affordable with 50 tokens', () => {
      const result = getAffordableDecorations(50);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(item => item.price <= 50)).toBe(true);
    });

    it('should include Basic Chair at 50 tokens', () => {
      const result = getAffordableDecorations(50);
      const hasChair = result.some(item => item.id === 'chair_001');
      expect(hasChair).toBe(true);
    });

    it('should not include Power Rack at 500 tokens with 50 budget', () => {
      const result = getAffordableDecorations(50);
      const hasRack = result.some(item => item.id === 'rack_001');
      expect(hasRack).toBe(false);
    });

    it('should return all items with 1000 tokens', () => {
      const result = getAffordableDecorations(1000);
      expect(result).toHaveLength(DECORATION_ITEMS.length);
    });

    it('should return empty array with 0 tokens', () => {
      const result = getAffordableDecorations(0);
      expect(result).toEqual([]);
    });
  });

  describe('getAffordableThemes', () => {
    it('should return free themes with 0 tokens', () => {
      const result = getAffordableThemes(0);
      expect(result.length).toBeGreaterThan(0);
      // Default theme is free
      const hasDefault = result.some(theme => theme.id === 'default');
      expect(hasDefault).toBe(true);
    });

    it('should include themes with price <= token balance', () => {
      const result = getAffordableThemes(100);
      const hasDarkTheme = result.some(theme => theme.id === 'dark');
      expect(hasDarkTheme).toBe(true);
    });

    it('should not include themes more expensive than token balance', () => {
      const result = getAffordableThemes(100);
      const hasRetroTheme = result.some(theme => theme.id === 'retro');
      expect(hasRetroTheme).toBe(false); // Retro costs 250
    });

    it('should include all themes with 500 tokens', () => {
      const result = getAffordableThemes(500);
      expect(result).toHaveLength(ROOM_THEMES.length);
    });
  });

  describe('isValidDecorationPosition', () => {
    it('should validate position within bounds', () => {
      expect(isValidDecorationPosition(100, 100, 800, 600)).toBe(true);
      expect(isValidDecorationPosition(50, 50, 800, 600)).toBe(true);
      expect(isValidDecorationPosition(750, 550, 800, 600)).toBe(true);
    });

    it('should reject positions outside bounds', () => {
      expect(isValidDecorationPosition(0, 100, 800, 600)).toBe(false);
      expect(isValidDecorationPosition(100, 0, 800, 600)).toBe(false);
      expect(isValidDecorationPosition(800, 100, 800, 600)).toBe(false);
      expect(isValidDecorationPosition(100, 600, 800, 600)).toBe(false);
    });

    it('should use default room size when not specified', () => {
      expect(isValidDecorationPosition(100, 100)).toBe(true);
      expect(isValidDecorationPosition(0, 100)).toBe(false);
      expect(isValidDecorationPosition(100, 0)).toBe(false);
    });

    it('should apply padding to bounds', () => {
      const padding = 20;
      expect(isValidDecorationPosition(padding, padding, 800, 600)).toBe(true);
      expect(isValidDecorationPosition(padding - 1, padding, 800, 600)).toBe(false);
      expect(isValidDecorationPosition(padding, padding - 1, 800, 600)).toBe(false);
    });
  });

  describe('getDecorationCategoryName', () => {
    it('should return display names for all categories', () => {
      expect(getDecorationCategoryName('furniture')).toBe('Furniture');
      expect(getDecorationCategoryName('poster')).toBe('Posters');
      expect(getDecorationCategoryName('equipment')).toBe('Equipment');
      expect(getDecorationCategoryName('trophies')).toBe('Trophies');
      expect(getDecorationCategoryName('plants')).toBe('Plants');
    });

    it('should return category name for unknown types', () => {
      const result = getDecorationCategoryName('unknown' as any);
      expect(result).toBe('unknown');
    });
  });

  describe('data integrity', () => {
    it('should have unique decoration IDs', () => {
      const ids = DECORATION_ITEMS.map(item => item.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have unique theme IDs', () => {
      const ids = ROOM_THEMES.map(theme => theme.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have sorted items by price within category (optional check)', () => {
      const furniture = getDecorationsByCategory('furniture');
      const prices = furniture.map(item => item.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });
  });

  describe('example items', () => {
    it('should have correct Basic Chair properties', () => {
      const chair = getDecorationById('chair_001');
      expect(chair?.name).toBe('Basic Chair');
      expect(chair?.category).toBe('furniture');
      expect(chair?.price).toBe(50);
    });

    it('should have correct Power Rack properties', () => {
      const rack = getDecorationById('rack_001');
      expect(rack?.name).toBe('Power Rack');
      expect(rack?.category).toBe('furniture');
      expect(rack?.price).toBe(500);
    });

    it('should have correct First PR Trophy properties', () => {
      const trophy = getDecorationById('trophy_001');
      expect(trophy?.name).toBe('First PR Trophy');
      expect(trophy?.category).toBe('trophies');
      expect(trophy?.price).toBe(75);
    });
  });
});
