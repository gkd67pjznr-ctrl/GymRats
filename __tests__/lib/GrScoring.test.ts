/**
 * GrScoring.test.ts - Tests for GymRank scoring algorithm
 *
 * The scoring system is the core gamification element.
 * These tests ensure accuracy and prevent regressions.
 */

import {
  scoreGymRank,
  scoreFromE1rm,
  DEFAULT_TIERS,
  type ScoringInput,
  type ScoreBreakdown,
  type Tier,
} from '../../src/lib/GrScoring';

describe('GrScoring - GymRank Scoring Algorithm', () => {
  describe('scoreGymRank', () => {
    describe('basic scoring', () => {
      it('returns a valid score breakdown', () => {
        const input: ScoringInput = {
          exerciseId: 'bench',
          weight: 225,
          reps: 5,
          unit: 'lb',
          bodyweightKg: 90,
        };

        const result = scoreGymRank(input);

        expect(result.total).toBeGreaterThanOrEqual(0);
        expect(result.total).toBeLessThanOrEqual(1000);
        expect(result.tier).toBeDefined();
        expect(result.normalizedStrength).toBeGreaterThanOrEqual(0);
        expect(result.normalizedStrength).toBeLessThanOrEqual(1);
        expect(result.e1rmKg).toBeGreaterThan(0);
        expect(result.parts).toBeInstanceOf(Array);
        expect(result.flags).toBeInstanceOf(Array);
      });

      it('produces deterministic results (same input = same output)', () => {
        const input: ScoringInput = {
          exerciseId: 'squat',
          weight: 315,
          reps: 3,
          unit: 'lb',
          bodyweightKg: 100,
        };

        const result1 = scoreGymRank(input);
        const result2 = scoreGymRank(input);

        expect(result1.total).toBe(result2.total);
        expect(result1.tier).toBe(result2.tier);
        expect(result1.e1rmKg).toBe(result2.e1rmKg);
      });
    });

    describe('e1RM calculation', () => {
      it('calculates reasonable e1RM from set data', () => {
        const input: ScoringInput = {
          exerciseId: 'bench',
          weight: 100,
          reps: 10,
          unit: 'kg',
          bodyweightKg: 80,
        };

        const result = scoreGymRank(input);

        // 100kg x 10 reps should estimate ~133kg e1RM with Epley
        // But with RPE adjustment it might be slightly different
        expect(result.e1rmKg).toBeGreaterThan(110);
        expect(result.e1rmKg).toBeLessThan(150);
      });

      it('uses direct e1RM when provided', () => {
        const input: ScoringInput = {
          exerciseId: 'bench',
          weight: 0,
          reps: 1,
          unit: 'kg',
          e1rmKg: 150,
          bodyweightKg: 80,
        };

        const result = scoreGymRank(input);

        expect(result.e1rmKg).toBe(150);
      });

      it('returns zero score for invalid e1RM', () => {
        const input: ScoringInput = {
          exerciseId: 'bench',
          weight: 0,
          reps: 0,
          unit: 'kg',
          e1rmKg: -50, // Invalid
        };

        const result = scoreGymRank(input);

        expect(result.total).toBe(0);
        expect(result.flags).toContain('insufficient_data');
      });
    });

    describe('tier assignment', () => {
      it('assigns Iron tier for very low scores', () => {
        const result = scoreGymRank({
          exerciseId: 'bench',
          weight: 20,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 90,
        });

        expect(result.tier).toBe('Iron');
      });

      it('assigns higher tiers for stronger lifts', () => {
        // Very strong lift relative to bodyweight
        const result = scoreGymRank({
          exerciseId: 'bench',
          weight: 180, // 180kg bench = elite
          reps: 1,
          unit: 'kg',
          bodyweightKg: 90, // 2x bodyweight bench
          rpe: 10,
        });

        // Should be at least Gold or higher
        const tierOrder: Tier[] = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Mythic'];
        const tierIndex = tierOrder.indexOf(result.tier);
        expect(tierIndex).toBeGreaterThanOrEqual(3); // Gold or higher
      });

      it('respects tier thresholds from DEFAULT_TIERS', () => {
        // Verify thresholds are correctly ordered
        for (let i = 1; i < DEFAULT_TIERS.length; i++) {
          expect(DEFAULT_TIERS[i].minScore).toBeGreaterThan(DEFAULT_TIERS[i - 1].minScore);
        }
      });
    });

    describe('bodyweight normalization', () => {
      it('penalizes missing bodyweight', () => {
        const withBW = scoreGymRank({
          exerciseId: 'bench',
          weight: 100,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 80,
        });

        const withoutBW = scoreGymRank({
          exerciseId: 'bench',
          weight: 100,
          reps: 5,
          unit: 'kg',
          // No bodyweight
        });

        expect(withoutBW.flags).toContain('missing_bodyweight');
        expect(withoutBW.total).toBeLessThan(withBW.total);
      });

      it('scores relative to bodyweight ratio', () => {
        // Same absolute weight, different bodyweights
        const heavy = scoreGymRank({
          exerciseId: 'bench',
          weight: 100,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 120, // 0.83x BW
        });

        const light = scoreGymRank({
          exerciseId: 'bench',
          weight: 100,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 70, // 1.43x BW
        });

        // Lighter person has better ratio, should score higher
        expect(light.total).toBeGreaterThan(heavy.total);
      });
    });

    describe('sex adjustment', () => {
      it('applies mild adjustment for female lifters', () => {
        const male = scoreGymRank({
          exerciseId: 'bench',
          weight: 80,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 70,
          sex: 'male',
        });

        const female = scoreGymRank({
          exerciseId: 'bench',
          weight: 80,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 70,
          sex: 'female',
        });

        // Female should get slight boost for same relative performance
        expect(female.total).toBeGreaterThan(male.total);
      });
    });

    describe('PR bonus', () => {
      it('awards PR bonus when exceeding previous best', () => {
        const noPR = scoreGymRank({
          exerciseId: 'bench',
          weight: 100,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 80,
        });

        const withPR = scoreGymRank({
          exerciseId: 'bench',
          weight: 100,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 80,
          previousBestE1rmKg: 100, // Current e1RM will be ~116kg
        });

        // PR bonus should be applied
        expect(withPR.total).toBeGreaterThan(noPR.total);
        expect(withPR.parts.some(p => p.reason === 'pr_bonus')).toBe(true);
      });

      it('does not award PR bonus when below previous best', () => {
        const result = scoreGymRank({
          exerciseId: 'bench',
          weight: 100,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 80,
          previousBestE1rmKg: 200, // Much higher than current
        });

        expect(result.parts.some(p => p.reason === 'pr_bonus')).toBe(false);
      });
    });

    describe('consistency bonus', () => {
      it('rewards frequent training', () => {
        const noSessions = scoreGymRank({
          exerciseId: 'bench',
          weight: 100,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 80,
          sessionsInLast14Days: 0,
        });

        const manySessions = scoreGymRank({
          exerciseId: 'bench',
          weight: 100,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 80,
          sessionsInLast14Days: 10,
        });

        expect(manySessions.total).toBeGreaterThan(noSessions.total);
        expect(manySessions.parts.some(p => p.reason === 'consistency_bonus')).toBe(true);
      });
    });

    describe('anti-cheat heuristics', () => {
      it('flags implausible jumps from previous best', () => {
        const result = scoreGymRank({
          exerciseId: 'bench',
          weight: 150,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 80,
          previousBestE1rmKg: 100, // 75% jump is suspicious
        });

        expect(result.flags).toContain('implausible_jump');
        expect(result.parts.some(p => p.reason === 'anti_cheat_penalty')).toBe(true);
      });

      it('flags implausible sets (high reps at max effort)', () => {
        const result = scoreGymRank({
          exerciseId: 'bench',
          weight: 100,
          reps: 25,
          unit: 'kg',
          bodyweightKg: 80,
          rpe: 10, // Claims max effort at 25 reps
        });

        expect(result.flags).toContain('implausible_set');
      });

      it('flags too-light weights as unrankable', () => {
        const result = scoreGymRank({
          exerciseId: 'bench',
          weight: 5,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 80,
        });

        expect(result.flags).toContain('too_light_for_ranked');
        expect(result.total).toBe(0);
      });
    });

    describe('unit conversion', () => {
      it('correctly converts lb to kg internally', () => {
        const lbResult = scoreGymRank({
          exerciseId: 'bench',
          weight: 225, // lb
          reps: 5,
          unit: 'lb',
          bodyweightKg: 80,
        });

        const kgResult = scoreGymRank({
          exerciseId: 'bench',
          weight: 102.1, // ~225 lb in kg
          reps: 5,
          unit: 'kg',
          bodyweightKg: 80,
        });

        // Should be very close (within rounding)
        expect(Math.abs(lbResult.e1rmKg - kgResult.e1rmKg)).toBeLessThan(1);
      });
    });

    describe('edge cases', () => {
      it('handles very high reps (capped at 30)', () => {
        const result = scoreGymRank({
          exerciseId: 'bench',
          weight: 50,
          reps: 100, // Should be capped
          unit: 'kg',
          bodyweightKg: 80,
        });

        expect(result.total).toBeGreaterThanOrEqual(0);
        expect(result.total).toBeLessThanOrEqual(1000);
      });

      it('handles very low RPE', () => {
        const result = scoreGymRank({
          exerciseId: 'bench',
          weight: 100,
          reps: 5,
          unit: 'kg',
          bodyweightKg: 80,
          rpe: 3, // Very low effort
        });

        expect(result.total).toBeGreaterThanOrEqual(0);
      });

      it('handles NaN weight gracefully', () => {
        const result = scoreGymRank({
          exerciseId: 'bench',
          weight: NaN,
          reps: 5,
          unit: 'kg',
        });

        // NaN converts to 0 via safeNum, resulting in too-light flag
        expect(result.total).toBe(0);
        expect(result.flags).toContain('too_light_for_ranked');
      });

      it('handles Infinity values gracefully', () => {
        const result = scoreGymRank({
          exerciseId: 'bench',
          weight: Infinity,
          reps: 5,
          unit: 'kg',
        });

        // Infinity is not finite, so safeNum returns 0, resulting in too-light flag
        expect(result.total).toBe(0);
        expect(result.flags).toContain('too_light_for_ranked');
      });
    });
  });

  describe('scoreFromE1rm', () => {
    it('scores from precomputed e1RM', () => {
      const result = scoreFromE1rm('bench', 150, 80); // 150kg e1RM, 80kg BW

      expect(result.e1rmKg).toBe(150);
      expect(result.total).toBeGreaterThan(0);
    });

    it('applies sex adjustment', () => {
      const male = scoreFromE1rm('bench', 100, 70, 'male');
      const female = scoreFromE1rm('bench', 100, 70, 'female');

      expect(female.total).toBeGreaterThan(male.total);
    });

    it('handles missing bodyweight', () => {
      const result = scoreFromE1rm('bench', 150);

      expect(result.flags).toContain('missing_bodyweight');
      expect(result.total).toBeGreaterThan(0); // Still scores, just penalized
    });
  });

  describe('score breakdown parts', () => {
    it('includes base_strength in breakdown', () => {
      const result = scoreGymRank({
        exerciseId: 'bench',
        weight: 100,
        reps: 5,
        unit: 'kg',
        bodyweightKg: 80,
      });

      const baseStrength = result.parts.find(p => p.reason === 'base_strength');
      expect(baseStrength).toBeDefined();
      expect(baseStrength!.delta).toBeGreaterThan(0);
    });

    it('includes rep_quality bonus', () => {
      const result = scoreGymRank({
        exerciseId: 'bench',
        weight: 100,
        reps: 8, // Quality rep range
        unit: 'kg',
        bodyweightKg: 80,
        rpe: 9,
      });

      const repQuality = result.parts.find(p => p.reason === 'rep_quality');
      expect(repQuality).toBeDefined();
      expect(repQuality!.delta).toBeGreaterThan(0);
    });

    it('includes volume_bonus', () => {
      const result = scoreGymRank({
        exerciseId: 'bench',
        weight: 100,
        reps: 10,
        unit: 'kg',
        bodyweightKg: 80,
      });

      const volumeBonus = result.parts.find(p => p.reason === 'volume_bonus');
      expect(volumeBonus).toBeDefined();
      expect(volumeBonus!.delta).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_TIERS constant', () => {
    it('has 7 tiers', () => {
      expect(DEFAULT_TIERS).toHaveLength(7);
    });

    it('starts with Iron at 0', () => {
      expect(DEFAULT_TIERS[0].tier).toBe('Iron');
      expect(DEFAULT_TIERS[0].minScore).toBe(0);
    });

    it('ends with Mythic at 900', () => {
      expect(DEFAULT_TIERS[6].tier).toBe('Mythic');
      expect(DEFAULT_TIERS[6].minScore).toBe(900);
    });

    it('has correct progression', () => {
      const expected = [
        { tier: 'Iron', minScore: 0 },
        { tier: 'Bronze', minScore: 180 },
        { tier: 'Silver', minScore: 320 },
        { tier: 'Gold', minScore: 470 },
        { tier: 'Platinum', minScore: 620 },
        { tier: 'Diamond', minScore: 770 },
        { tier: 'Mythic', minScore: 900 },
      ];

      DEFAULT_TIERS.forEach((tier, i) => {
        expect(tier.tier).toBe(expected[i].tier);
        expect(tier.minScore).toBe(expected[i].minScore);
      });
    });
  });
});
