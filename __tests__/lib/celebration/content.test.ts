// __tests__/lib/celebration/content.test.ts
// Tests for celebration content registry

import {
  contentKey,
  getAssetForKey,
  getTextTemplate,
  CELEBRATIONS,
} from '@/src/lib/celebration/content';
import type { Celebration } from '@/src/lib/celebration/types';

describe('contentKey', () => {
  it('generates correct key format', () => {
    expect(contentKey('weight', 1, 'a')).toBe('weight_tier_1_a');
    expect(contentKey('rep', 3, 'c')).toBe('rep_tier_3_c');
    expect(contentKey('e1rm', 4, 'e')).toBe('e1rm_tier_4_e');
  });
});

describe('getAssetForKey', () => {
  it('returns asset for valid key', () => {
    const asset = getAssetForKey('weight_tier_1_a');
    expect(asset).toBeDefined();
    expect(asset.emoji).toBeDefined();
    expect(asset.aspectRatio).toBeDefined();
  });

  it('returns fallback for unknown key', () => {
    const asset = getAssetForKey('unknown_key');
    expect(asset).toBeDefined();
    // Should return a fallback asset
    expect(asset.emoji).toBeDefined();
  });

  it('all tier 1 keys have assets', () => {
    const keys = [
      'weight_tier_1_a',
      'rep_tier_1_a',
      'e1rm_tier_1_a',
    ];

    keys.forEach(key => {
      const asset = getAssetForKey(key);
      expect(asset).toBeDefined();
      expect(asset.emoji).toBeTruthy();
    });
  });
});

describe('getTextTemplate', () => {
  it('returns template with headline and detail', () => {
    const template = getTextTemplate('weight', 1);

    expect(template).toBeDefined();
    expect(template.headline).toBeDefined();
    expect(template.detail).toBeDefined();
    expect(typeof template.headline).toBe('string');
    expect(typeof template.detail).toBe('string');
  });

  it('returns different templates for different tiers', () => {
    const tier1 = getTextTemplate('weight', 1);
    const tier4 = getTextTemplate('weight', 4);

    // Tier 4 should be more intense (different templates)
    expect(tier4.headline).not.toBe(tier1.headline);
  });

  it('returns different templates for different PR types', () => {
    const weight = getTextTemplate('weight', 2);
    const rep = getTextTemplate('rep', 2);

    expect(weight.headline).not.toBe(rep.headline);
  });
});

describe('CELEBRATIONS registry', () => {
  it('has exactly 60 celebrations', () => {
    // 3 PR types × 4 tiers × 5 variants = 60
    expect(CELEBRATIONS.length).toBe(60);
  });

  it('has all weight PR celebrations', () => {
    const weightCelebrations = CELEBRATIONS.filter(c => c.prType === 'weight');
    expect(weightCelebrations.length).toBe(20); // 4 tiers × 5 variants

    // Check all tiers are present
    const tiers = new Set(weightCelebrations.map(c => c.tier));
    expect(tiers.has(1)).toBe(true);
    expect(tiers.has(2)).toBe(true);
    expect(tiers.has(3)).toBe(true);
    expect(tiers.has(4)).toBe(true);
  });

  it('has all rep PR celebrations', () => {
    const repCelebrations = CELEBRATIONS.filter(c => c.prType === 'rep');
    expect(repCelebrations.length).toBe(20); // 4 tiers × 5 variants
  });

  it('has all e1RM PR celebrations', () => {
    const e1rmCelebrations = CELEBRATIONS.filter(c => c.prType === 'e1rm');
    expect(e1rmCelebrations.length).toBe(20); // 4 tiers × 5 variants
  });

  it('all celebrations have required fields', () => {
    CELEBRATIONS.forEach(celebration => {
      expect(celebration.id).toBeDefined();
      expect(celebration.prType).toBeDefined();
      expect(celebration.tier).toBeGreaterThanOrEqual(1);
      expect(celebration.tier).toBeLessThanOrEqual(4);
      expect(celebration.variant).toMatch(/^[a-e]$/);
      expect(celebration.contentKey).toBeDefined();
      expect(celebration.sound).toBeDefined();
      expect(celebration.sound.key).toBeDefined();
      expect(celebration.haptic).toBeDefined();
      expect(celebration.text).toBeDefined();
      expect(typeof celebration.minDeltaLb).toBe('number');
    });
  });

  it('tier deltas are correctly set', () => {
    const tier1 = CELEBRATIONS.find(c => c.prType === 'weight' && c.tier === 1 && c.variant === 'a');
    expect(tier1?.minDeltaLb).toBe(0);
    expect(tier1?.maxDeltaLb).toBe(5);

    const tier2 = CELEBRATIONS.find(c => c.prType === 'weight' && c.tier === 2 && c.variant === 'a');
    expect(tier2?.minDeltaLb).toBe(5);
    expect(tier2?.maxDeltaLb).toBe(10);

    const tier3 = CELEBRATIONS.find(c => c.prType === 'weight' && c.tier === 3 && c.variant === 'a');
    expect(tier3?.minDeltaLb).toBe(10);
    expect(tier3?.maxDeltaLb).toBe(20);

    const tier4 = CELEBRATIONS.find(c => c.prType === 'weight' && c.tier === 4 && c.variant === 'a');
    expect(tier4?.minDeltaLb).toBe(20);
    expect(tier4?.maxDeltaLb).toBeUndefined();
  });

  it('sound volume increases with tier', () => {
    const tier1 = CELEBRATIONS.find(c => c.prType === 'weight' && c.tier === 1);
    const tier4 = CELEBRATIONS.find(c => c.prType === 'weight' && c.tier === 4);

    expect(tier1?.sound.volume).toBeLessThan(tier4?.sound.volume);
  });
});

describe('makeCelebrations', () => {
  it('generates celebrations with unique IDs', () => {
    const ids = new Set(CELEBRATIONS.map(c => c.id));
    expect(ids.size).toBe(CELEBRATIONS.length);
  });

  it('generates celebrations with unique content keys', () => {
    const keys = new Set(CELEBRATIONS.map(c => c.contentKey));
    expect(keys.size).toBe(CELEBRATIONS.length);
  });
});
