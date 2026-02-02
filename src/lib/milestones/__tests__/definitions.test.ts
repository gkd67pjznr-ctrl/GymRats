/**
 * Unit tests for milestone definitions
 */

import {
  ALL_MILESTONES,
  getMilestoneById,
  getMilestonesByRarity,
  getMilestonesByRarityGroup,
  RARITY_INFO,
} from '../definitions';

describe('Milestone Definitions', () => {
  describe('ALL_MILESTONES', () => {
    it('should have all milestones with required fields', () => {
      ALL_MILESTONES.forEach((milestone) => {
        expect(milestone.id).toBeDefined();
        expect(milestone.name).toBeDefined();
        expect(milestone.description).toBeDefined();
        expect(milestone.rarity).toBeDefined();
        expect(milestone.icon).toBeDefined();
        expect(milestone.condition).toBeDefined();
        expect(milestone.condition.type).toBeDefined();
        expect(milestone.condition.threshold).toBeGreaterThan(0);
      });
    });

    it('should have unique milestone IDs', () => {
      const ids = ALL_MILESTONES.map(m => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid rarity values', () => {
      const validRarities = ['common', 'rare', 'epic', 'legendary'];
      ALL_MILESTONES.forEach(milestone => {
        expect(validRarities).toContain(milestone.rarity);
      });
    });

    it('should have at least one milestone per rarity', () => {
      const rarities = getMilestonesByRarityGroup();
      expect(rarities.common.length).toBeGreaterThan(0);
      expect(rarities.rare.length).toBeGreaterThan(0);
      expect(rarities.epic.length).toBeGreaterThan(0);
      expect(rarities.legendary.length).toBeGreaterThan(0);
    });
  });

  describe('getMilestoneById', () => {
    it('should return milestone for valid ID', () => {
      const milestone = getMilestoneById('first_workout');
      expect(milestone).toBeDefined();
      expect(milestone?.id).toBe('first_workout');
    });

    it('should return undefined for invalid ID', () => {
      const milestone = getMilestoneById('invalid_milestone');
      expect(milestone).toBeUndefined();
    });
  });

  describe('getMilestonesByRarity', () => {
    it('should return only common milestones', () => {
      const common = getMilestonesByRarity('common');
      common.forEach(m => expect(m.rarity).toBe('common'));
    });

    it('should return only rare milestones', () => {
      const rare = getMilestonesByRarity('rare');
      rare.forEach(m => expect(m.rarity).toBe('rare'));
    });

    it('should return only epic milestones', () => {
      const epic = getMilestonesByRarity('epic');
      epic.forEach(m => expect(m.rarity).toBe('epic'));
    });

    it('should return only legendary milestones', () => {
      const legendary = getMilestonesByRarity('legendary');
      legendary.forEach(m => expect(m.rarity).toBe('legendary'));
    });
  });

  describe('RARITY_INFO', () => {
    it('should have info for all rarities', () => {
      const rarities: (keyof typeof RARITY_INFO)[] = ['common', 'rare', 'epic', 'legendary'];
      rarities.forEach(rarity => {
        expect(RARITY_INFO[rarity]).toBeDefined();
        expect(RARITY_INFO[rarity].name).toBeDefined();
        expect(RARITY_INFO[rarity].color).toBeDefined();
        expect(RARITY_INFO[rarity].borderStyle).toBeDefined();
      });
    });
  });
});
