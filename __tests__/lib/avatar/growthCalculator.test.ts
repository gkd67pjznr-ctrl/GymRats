// __tests__/lib/avatar/growthCalculator.test.ts
// Tests for avatar growth calculator

import {
  calculateAvatarGrowth,
  isGrowthMilestone,
  getGrowthStageDescription,
  getGrowthStagePercentage
} from '../../../src/lib/avatar/growthCalculator';
import type { AvatarGrowth } from '../../../src/lib/avatar/avatarTypes';

describe('growthCalculator', () => {
  describe('calculateAvatarGrowth', () => {
    it('should calculate initial growth correctly', () => {
      const initialGrowth: AvatarGrowth = {
        stage: 1,
        heightScale: 0.3,
        volumeTotal: 0,
        setsTotal: 0,
        avgRank: 0,
      };

      const result = calculateAvatarGrowth(initialGrowth, 10000, 100, 5);

      expect(result.stage).toBeGreaterThan(1);
      expect(result.volumeTotal).toBe(10000);
      expect(result.setsTotal).toBe(100);
      expect(result.avgRank).toBeCloseTo(5, 2);
    });

    it('should cap growth stage at 20', () => {
      const highGrowth: AvatarGrowth = {
        stage: 19,
        heightScale: 0.9,
        volumeTotal: 190000,
        setsTotal: 1900,
        avgRank: 19,
      };

      const result = calculateAvatarGrowth(highGrowth, 50000, 500, 20);

      expect(result.stage).toBe(20); // Should be capped at 20
      expect(result.heightScale).toBeCloseTo(1.0, 3); // Should be capped at 1.0
    });

    it('should calculate growth stage correctly', () => {
      const initialGrowth: AvatarGrowth = {
        stage: 1,
        heightScale: 0.3,
        volumeTotal: 0,
        setsTotal: 0,
        avgRank: 0,
      };

      // Test with values that should result in stage 4
      // volumeProgress = 30000/10000 = 3
      // setProgress = 300/100 = 3
      // rankProgress = 4/5 = 0.8
      // combinedProgress = (3*0.4) + (3*0.4) + (0.8*0.2) = 1.2 + 1.2 + 0.16 = 2.56
      // newStage = floor(2.56) + 1 = 2 + 1 = 3
      const result = calculateAvatarGrowth(initialGrowth, 30000, 300, 4);
      expect(result.stage).toBe(3);

      // Height scale should be between 0.3 and 1.0
      expect(result.heightScale).toBeGreaterThan(0.3);
      expect(result.heightScale).toBeLessThanOrEqual(1.0);
    });
  });

  describe('isGrowthMilestone', () => {
    it('should detect milestone stages', () => {
      expect(isGrowthMilestone(4, 5)).toBe(true); // 5 is milestone
      expect(isGrowthMilestone(9, 10)).toBe(true); // 10 is milestone
      expect(isGrowthMilestone(14, 15)).toBe(true); // 15 is milestone
      expect(isGrowthMilestone(19, 20)).toBe(true); // 20 is milestone
    });

    it('should not detect non-milestone stages', () => {
      expect(isGrowthMilestone(1, 2)).toBe(false);
      expect(isGrowthMilestone(6, 7)).toBe(false);
      expect(isGrowthMilestone(11, 12)).toBe(false);
      expect(isGrowthMilestone(16, 17)).toBe(false);
    });

    it('should handle multiple stage jumps', () => {
      expect(isGrowthMilestone(3, 7)).toBe(true); // Crosses milestone 5
      expect(isGrowthMilestone(8, 16)).toBe(true); // Crosses milestones 10 and 15
    });
  });

  describe('getGrowthStageDescription', () => {
    it('should return correct descriptions for stages', () => {
      expect(getGrowthStageDescription(1)).toBe("Just Starting");
      expect(getGrowthStageDescription(5)).toBe("Making Progress");
      expect(getGrowthStageDescription(10)).toBe("Gaining Strength");
      expect(getGrowthStageDescription(15)).toBe("True Commitment");
      expect(getGrowthStageDescription(20)).toBe("Legend Status");
    });

    it('should handle edge cases', () => {
      expect(getGrowthStageDescription(0)).toBe("Just Starting");
      expect(getGrowthStageDescription(25)).toBe("Beginner"); // Out of range
    });
  });

  describe('getGrowthStagePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(getGrowthStagePercentage(1)).toBe(0);
      expect(getGrowthStagePercentage(5)).toBe(20);
      expect(getGrowthStagePercentage(10)).toBe(45);
      expect(getGrowthStagePercentage(20)).toBe(95);
    });

    it('should clamp values', () => {
      expect(getGrowthStagePercentage(0)).toBe(0);
      expect(getGrowthStagePercentage(25)).toBe(100);
    });
  });
});