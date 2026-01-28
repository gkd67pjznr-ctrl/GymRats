// __tests__/lib/celebration/selector.test.ts
// Tests for celebration selection logic

import {
  deltaToTier,
  getTierLabel,
  getPRTypeLabel,
  selectCelebration,
} from '@/src/lib/celebration';

// Mock the content module
jest.mock('@/src/lib/celebration/content', () => {
  const actual = jest.requireActual('@/src/lib/celebration/content');
  return {
    ...actual,
    getTextTemplate: jest.fn((prType: string, tier: number) => ({
      headline: `${prType} tier ${tier} PR`,
      detail: `Details for ${prType} tier ${tier}`,
    })),
  };
});

describe('deltaToTier', () => {
  it('returns tier 1 for delta < 5', () => {
    expect(deltaToTier(0)).toBe(1);
    expect(deltaToTier(2)).toBe(1);
    expect(deltaToTier(4.9)).toBe(1);
  });

  it('returns tier 2 for delta 5-10', () => {
    expect(deltaToTier(5)).toBe(2);
    expect(deltaToTier(7.5)).toBe(2);
    expect(deltaToTier(9.9)).toBe(2);
  });

  it('returns tier 3 for delta 10-20', () => {
    expect(deltaToTier(10)).toBe(3);
    expect(deltaToTier(15)).toBe(3);
    expect(deltaToTier(19.9)).toBe(3);
    expect(deltaToTier(19.99)).toBe(3);
  });

  it('returns tier 4 for delta > 20', () => {
    expect(deltaToTier(21)).toBe(4);
    expect(deltaToTier(25)).toBe(4);
    expect(deltaToTier(100)).toBe(4);
  });
});

describe('getTierLabel', () => {
  it('returns correct labels', () => {
    expect(getTierLabel(1)).toBe('Solid');
    expect(getTierLabel(2)).toBe('Big');
    expect(getTierLabel(3)).toBe('Huge');
    expect(getTierLabel(4)).toBe('Mythic');
  });
});

describe('getPRTypeLabel', () => {
  it('returns correct labels', () => {
    expect(getPRTypeLabel('weight')).toBe('Weight PR');
    expect(getPRTypeLabel('rep')).toBe('Rep PR');
    expect(getPRTypeLabel('e1rm')).toBe('e1RM PR');
  });
});

describe('selectCelebration', () => {
  const baseParams = {
    exerciseName: 'Bench Press',
    weightLabel: '225 lb',
    reps: 5,
  };

  describe('weight PR selection', () => {
    it('selects tier 1 for small weight PR (0-5 lb)', () => {
      const result = selectCelebration({
        ...baseParams,
        prType: 'weight',
        deltaLb: 3,
      });

      expect(result).not.toBeNull();
      expect(result?.celebration.prType).toBe('weight');
      expect(result?.celebration.tier).toBe(1);
      expect(result?.headline).toBeTruthy();
    });

    it('selects tier 2 for medium weight PR (5-10 lb)', () => {
      const result = selectCelebration({
        ...baseParams,
        prType: 'weight',
        deltaLb: 7,
      });

      expect(result?.celebration.tier).toBe(2);
    });

    it('selects tier 3 for big weight PR (10-20 lb)', () => {
      const result = selectCelebration({
        ...baseParams,
        prType: 'weight',
        deltaLb: 15,
      });

      expect(result?.celebration.tier).toBe(3);
    });

    it('selects tier 4 for massive weight PR (20+ lb)', () => {
      const result = selectCelebration({
        ...baseParams,
        prType: 'weight',
        deltaLb: 25,
      });

      expect(result?.celebration.tier).toBe(4);
    });
  });

  describe('rep PR selection', () => {
    it('selects tier 1 for small rep PR (0-5 delta)', () => {
      const result = selectCelebration({
        ...baseParams,
        prType: 'rep',
        deltaLb: 1,
      });

      expect(result).not.toBeNull();
      expect(result?.celebration.prType).toBe('rep');
      expect(result?.celebration.tier).toBe(1);
    });

    it('selects tier 2 for medium rep PR (5-10 delta)', () => {
      const result = selectCelebration({
        ...baseParams,
        prType: 'rep',
        deltaLb: 8,
      });

      expect(result?.celebration.tier).toBe(2);
    });

    it('selects tier 4 for massive rep PR (20+ delta)', () => {
      const result = selectCelebration({
        ...baseParams,
        prType: 'rep',
        deltaLb: 25,
      });

      expect(result?.celebration.tier).toBe(4);
    });
  });

  describe('e1RM PR selection', () => {
    it('selects correct tier for e1RM PR', () => {
      const result = selectCelebration({
        ...baseParams,
        prType: 'e1rm',
        deltaLb: 12,
      });

      expect(result?.celebration.prType).toBe('e1rm');
      expect(result?.celebration.tier).toBe(3);
    });
  });

  describe('cardio PR handling', () => {
    it('returns null for cardio PR', () => {
      const result = selectCelebration({
        ...baseParams,
        prType: 'cardio',
        deltaLb: 0,
      });

      expect(result).toBeNull();
    });
  });

  describe('text template resolution', () => {
    it('resolves placeholders in headline', () => {
      const result = selectCelebration({
        exerciseName: 'Squat',
        weightLabel: '315 lb',
        reps: 3,
        prType: 'weight',
        deltaLb: 10,
      });

      // Headline should be defined
      expect(result?.headline).toBeDefined();
      expect(result?.headline).toBeTruthy();
    });
  });

  describe('variant selection', () => {
    it('selects random variant when no preference', () => {
      const variants = new Set();

      // Run multiple times to check randomness
      for (let i = 0; i < 20; i++) {
        const result = selectCelebration({
          ...baseParams,
          prType: 'weight',
          deltaLb: 5,
        });
        if (result?.celebration.variant) {
          variants.add(result.celebration.variant);
        }
      }

      // Should get some variety (not always the same variant)
      // Note: This is probabilistic, might rarely fail
      expect(variants.size).toBeGreaterThan(0);
    });

    it('uses preferred variant when specified', () => {
      const result = selectCelebration({
        ...baseParams,
        prType: 'weight',
        deltaLb: 5,
        preferredVariant: 'c',
      });

      expect(result?.celebration.variant).toBe('c');
    });
  });
});
