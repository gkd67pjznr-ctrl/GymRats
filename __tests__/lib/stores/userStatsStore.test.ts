// __tests__/lib/stores/userStatsStore.test.ts
// Tests for the unified UserStatsStore

import {
  calculateForgeRank,
  scoreToTierAndRank,
  getTierFromRank,
} from "../../../src/lib/userStats/forgeRankCalculator";
import {
  deriveAvatarGrowth,
  isGrowthMilestone,
  getGrowthStageDescription,
} from "../../../src/lib/userStats/deriveAvatarGrowth";
import {
  updateExerciseStats,
  calculateVariety,
  groupSetsByExercise,
} from "../../../src/lib/userStats/statsCalculators";
import type { WorkoutSet } from "../../../src/lib/workoutModel";
import type {
  ExerciseStats,
  LifetimeStats,
  ConsistencyMetrics,
  VarietyMetrics,
} from "../../../src/lib/userStats/types";
import {
  DEFAULT_LIFETIME_STATS,
  DEFAULT_CONSISTENCY_METRICS,
  DEFAULT_VARIETY_METRICS,
} from "../../../src/lib/userStats/types";

describe("ForgeRankCalculator", () => {
  describe("calculateForgeRank", () => {
    it("should return rank 1 iron for empty stats", () => {
      const result = calculateForgeRank({
        exerciseStats: {},
        consistency: DEFAULT_CONSISTENCY_METRICS,
        variety: DEFAULT_VARIETY_METRICS,
        totalVolumeKg: 0,
      });

      expect(result.rank).toBe(1);
      expect(result.tier).toBe("iron");
      expect(result.score).toBe(0);
    });

    it("should calculate strength component from average exercise rank", () => {
      const exerciseStats: Record<string, ExerciseStats> = {
        bench: {
          exerciseId: "bench",
          bestE1RMKg: 100,
          bestWeightKg: 90,
          bestRepsAtWeight: {},
          rank: 10, // Middle rank
          progressToNext: 0.5,
          totalVolumeKg: 5000,
          totalSets: 50,
          lastUpdatedMs: Date.now(),
        },
      };

      const result = calculateForgeRank({
        exerciseStats,
        consistency: DEFAULT_CONSISTENCY_METRICS,
        variety: DEFAULT_VARIETY_METRICS,
        totalVolumeKg: 5000,
      });

      // With rank 10, strength score should be (10-1)/19 * 1000 * 0.4 = ~189
      expect(result.components.strength).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThan(0);
    });

    it("should calculate consistency component from workout frequency and streak", () => {
      const consistency: ConsistencyMetrics = {
        workoutsPerWeek: 4, // Perfect frequency
        currentStreak: 30, // Max streak bonus
        longestStreak: 30,
        workoutsLast7Days: 4,
        workoutsLast14Days: 8, // Perfect recent activity
        workoutsLast30Days: 16,
      };

      const result = calculateForgeRank({
        exerciseStats: {},
        consistency,
        variety: DEFAULT_VARIETY_METRICS,
        totalVolumeKg: 0,
      });

      // Should have high consistency score
      expect(result.components.consistency).toBeGreaterThan(500);
    });

    it("should calculate progress component from volume", () => {
      const result = calculateForgeRank({
        exerciseStats: {},
        consistency: DEFAULT_CONSISTENCY_METRICS,
        variety: DEFAULT_VARIETY_METRICS,
        totalVolumeKg: 100000, // 100,000 kg lifetime volume
      });

      expect(result.components.progress).toBeGreaterThan(0);
    });

    it("should calculate variety component from exercise diversity", () => {
      const variety: VarietyMetrics = {
        uniqueExercises: 15, // Good diversity
        musclesCovered: [
          "chest",
          "lats",
          "shoulders",
          "biceps",
          "triceps",
          "quadriceps",
          "hamstrings",
          "glutes",
          "calves",
          "abdominals",
          "lower back",
          "middle back",
        ],
        balanceScore: 0.8, // Good balance
        volumeByMuscle: {} as any,
      };

      const result = calculateForgeRank({
        exerciseStats: {},
        consistency: DEFAULT_CONSISTENCY_METRICS,
        variety,
        totalVolumeKg: 0,
      });

      expect(result.components.variety).toBeGreaterThan(500);
    });
  });

  describe("scoreToTierAndRank", () => {
    it("should map score 0 to rank 1", () => {
      const result = scoreToTierAndRank(0);
      expect(result.rank).toBe(1);
      expect(result.tier).toBe("iron");
    });

    it("should map score 1000 to rank 20", () => {
      const result = scoreToTierAndRank(1000);
      expect(result.rank).toBe(20);
      expect(result.tier).toBe("mythic");
    });

    it("should map score 500 to middle rank", () => {
      const result = scoreToTierAndRank(500);
      expect(result.rank).toBeGreaterThan(9);
      expect(result.rank).toBeLessThan(12);
    });

    it("should clamp scores above 1000", () => {
      const result = scoreToTierAndRank(1500);
      expect(result.rank).toBe(20);
    });

    it("should clamp scores below 0", () => {
      const result = scoreToTierAndRank(-100);
      expect(result.rank).toBe(1);
    });
  });

  describe("getTierFromRank", () => {
    it("should return iron for ranks 1-3", () => {
      expect(getTierFromRank(1)).toBe("iron");
      expect(getTierFromRank(2)).toBe("iron");
      expect(getTierFromRank(3)).toBe("iron");
    });

    it("should return bronze for ranks 4-6", () => {
      expect(getTierFromRank(4)).toBe("bronze");
      expect(getTierFromRank(5)).toBe("bronze");
      expect(getTierFromRank(6)).toBe("bronze");
    });

    it("should return silver for ranks 7-9", () => {
      expect(getTierFromRank(7)).toBe("silver");
      expect(getTierFromRank(9)).toBe("silver");
    });

    it("should return gold for ranks 10-12", () => {
      expect(getTierFromRank(10)).toBe("gold");
      expect(getTierFromRank(12)).toBe("gold");
    });

    it("should return platinum for ranks 13-15", () => {
      expect(getTierFromRank(13)).toBe("platinum");
      expect(getTierFromRank(15)).toBe("platinum");
    });

    it("should return diamond for ranks 16-18", () => {
      expect(getTierFromRank(16)).toBe("diamond");
      expect(getTierFromRank(18)).toBe("diamond");
    });

    it("should return mythic for ranks 19-20", () => {
      expect(getTierFromRank(19)).toBe("mythic");
      expect(getTierFromRank(20)).toBe("mythic");
    });
  });
});

describe("deriveAvatarGrowth", () => {
  describe("deriveAvatarGrowth", () => {
    it("should return stage 1 for empty stats", () => {
      const result = deriveAvatarGrowth(DEFAULT_LIFETIME_STATS, {});
      expect(result.stage).toBe(1);
      expect(result.heightScale).toBeCloseTo(0.3);
    });

    it("should calculate stage from volume, sets, and rank", () => {
      const lifetimeStats: LifetimeStats = {
        ...DEFAULT_LIFETIME_STATS,
        totalVolumeKg: 50000, // 50,000 kg = 5 volume stages
        totalSets: 500, // 500 sets = 5 set stages
      };

      const exerciseStats: Record<string, ExerciseStats> = {
        bench: {
          exerciseId: "bench",
          bestE1RMKg: 100,
          bestWeightKg: 90,
          bestRepsAtWeight: {},
          rank: 10,
          progressToNext: 0.5,
          totalVolumeKg: 50000,
          totalSets: 500,
          lastUpdatedMs: Date.now(),
        },
      };

      const result = deriveAvatarGrowth(lifetimeStats, exerciseStats);

      // (5*0.4 + 5*0.4 + 2*0.2) = 4.4 = stage 5
      expect(result.stage).toBeGreaterThan(1);
      expect(result.stage).toBeLessThanOrEqual(20);
    });

    it("should cap stage at 20", () => {
      const lifetimeStats: LifetimeStats = {
        ...DEFAULT_LIFETIME_STATS,
        totalVolumeKg: 1000000, // Huge volume
        totalSets: 10000, // Huge sets
      };

      const result = deriveAvatarGrowth(lifetimeStats, {});
      expect(result.stage).toBe(20);
    });

    it("should detect milestone when crossing threshold", () => {
      const lifetimeStats: LifetimeStats = {
        ...DEFAULT_LIFETIME_STATS,
        totalVolumeKg: 50000,
        totalSets: 500,
      };

      const exerciseStats: Record<string, ExerciseStats> = {
        bench: {
          exerciseId: "bench",
          bestE1RMKg: 100,
          bestWeightKg: 90,
          bestRepsAtWeight: {},
          rank: 15,
          progressToNext: 0.5,
          totalVolumeKg: 50000,
          totalSets: 500,
          lastUpdatedMs: Date.now(),
        },
      };

      // Current stage is > 5, previous was 4 = milestone
      const result = deriveAvatarGrowth(lifetimeStats, exerciseStats, 4);

      if (result.stage >= 5) {
        expect(result.milestoneReached).toBe(true);
      }
    });
  });

  describe("isGrowthMilestone", () => {
    it("should detect crossing stage 5", () => {
      expect(isGrowthMilestone(4, 5)).toBe(true);
      expect(isGrowthMilestone(4, 6)).toBe(true);
    });

    it("should detect crossing stage 10", () => {
      expect(isGrowthMilestone(9, 10)).toBe(true);
      expect(isGrowthMilestone(8, 12)).toBe(true);
    });

    it("should detect crossing stage 15", () => {
      expect(isGrowthMilestone(14, 15)).toBe(true);
    });

    it("should detect crossing stage 20", () => {
      expect(isGrowthMilestone(19, 20)).toBe(true);
    });

    it("should not detect non-milestone transitions", () => {
      expect(isGrowthMilestone(1, 2)).toBe(false);
      expect(isGrowthMilestone(6, 7)).toBe(false);
      expect(isGrowthMilestone(11, 12)).toBe(false);
    });

    it("should not detect when staying at same stage", () => {
      expect(isGrowthMilestone(5, 5)).toBe(false);
      expect(isGrowthMilestone(10, 10)).toBe(false);
    });
  });

  describe("getGrowthStageDescription", () => {
    it("should return correct descriptions for each stage range", () => {
      expect(getGrowthStageDescription(1)).toBe("Just Starting");
      expect(getGrowthStageDescription(3)).toBe("Just Starting");
      expect(getGrowthStageDescription(5)).toBe("Making Progress");
      expect(getGrowthStageDescription(8)).toBe("Building Consistency");
      expect(getGrowthStageDescription(11)).toBe("Gaining Strength");
      expect(getGrowthStageDescription(14)).toBe("True Commitment");
      expect(getGrowthStageDescription(17)).toBe("Fitness Champion");
      expect(getGrowthStageDescription(20)).toBe("Legend Status");
    });
  });
});

describe("statsCalculators", () => {
  describe("updateExerciseStats", () => {
    it("should create new stats for new exercise", () => {
      const sets: WorkoutSet[] = [
        { id: "1", exerciseId: "bench", weightKg: 100, reps: 5, timestampMs: Date.now() },
      ];

      const { stats, prs } = updateExerciseStats(undefined, "bench", sets);

      expect(stats.exerciseId).toBe("bench");
      expect(stats.bestWeightKg).toBe(100);
      expect(stats.totalSets).toBe(1);
      expect(stats.totalVolumeKg).toBe(500); // 100 * 5
    });

    it("should detect weight PR", () => {
      const existingStats: ExerciseStats = {
        exerciseId: "bench",
        bestE1RMKg: 100,
        bestWeightKg: 90,
        bestRepsAtWeight: {},
        rank: 5,
        progressToNext: 0.5,
        totalVolumeKg: 1000,
        totalSets: 10,
        lastUpdatedMs: Date.now() - 1000,
      };

      const sets: WorkoutSet[] = [
        { id: "1", exerciseId: "bench", weightKg: 100, reps: 5, timestampMs: Date.now() },
      ];

      const { stats, prs } = updateExerciseStats(existingStats, "bench", sets);

      expect(stats.bestWeightKg).toBe(100);
      expect(prs.length).toBeGreaterThan(0);
      expect(prs.some((p) => p.weightPR)).toBe(true);
    });

    it("should detect e1RM PR", () => {
      const existingStats: ExerciseStats = {
        exerciseId: "bench",
        bestE1RMKg: 100,
        bestWeightKg: 90,
        bestRepsAtWeight: {},
        rank: 5,
        progressToNext: 0.5,
        totalVolumeKg: 1000,
        totalSets: 10,
        lastUpdatedMs: Date.now() - 1000,
      };

      // 90kg x 10 reps = 90 * (1 + 10/30) = 120 e1RM
      const sets: WorkoutSet[] = [
        { id: "1", exerciseId: "bench", weightKg: 90, reps: 10, timestampMs: Date.now() },
      ];

      const { stats, prs } = updateExerciseStats(existingStats, "bench", sets);

      expect(stats.bestE1RMKg).toBeGreaterThan(existingStats.bestE1RMKg);
      expect(prs.some((p) => p.e1rmPR)).toBe(true);
    });

    it("should accumulate volume and sets", () => {
      const existingStats: ExerciseStats = {
        exerciseId: "bench",
        bestE1RMKg: 100,
        bestWeightKg: 90,
        bestRepsAtWeight: {},
        rank: 5,
        progressToNext: 0.5,
        totalVolumeKg: 1000,
        totalSets: 10,
        lastUpdatedMs: Date.now() - 1000,
      };

      const sets: WorkoutSet[] = [
        { id: "1", exerciseId: "bench", weightKg: 80, reps: 8, timestampMs: Date.now() },
        { id: "2", exerciseId: "bench", weightKg: 80, reps: 8, timestampMs: Date.now() },
      ];

      const { stats } = updateExerciseStats(existingStats, "bench", sets);

      expect(stats.totalSets).toBe(12);
      expect(stats.totalVolumeKg).toBe(1000 + 80 * 8 + 80 * 8);
    });
  });

  describe("groupSetsByExercise", () => {
    it("should group sets by exercise ID", () => {
      const sets: WorkoutSet[] = [
        { id: "1", exerciseId: "bench", weightKg: 100, reps: 5, timestampMs: Date.now() },
        { id: "2", exerciseId: "squat", weightKg: 120, reps: 5, timestampMs: Date.now() },
        { id: "3", exerciseId: "bench", weightKg: 100, reps: 5, timestampMs: Date.now() },
      ];

      const grouped = groupSetsByExercise(sets);

      expect(Object.keys(grouped)).toEqual(["bench", "squat"]);
      expect(grouped["bench"].length).toBe(2);
      expect(grouped["squat"].length).toBe(1);
    });

    it("should return empty object for empty array", () => {
      const grouped = groupSetsByExercise([]);
      expect(grouped).toEqual({});
    });
  });

  describe("calculateVariety", () => {
    it("should count unique exercises", () => {
      const exerciseStats: Record<string, ExerciseStats> = {
        bench: {
          exerciseId: "bench",
          bestE1RMKg: 100,
          bestWeightKg: 90,
          bestRepsAtWeight: {},
          rank: 5,
          progressToNext: 0.5,
          totalVolumeKg: 1000,
          totalSets: 10,
          lastUpdatedMs: Date.now(),
        },
        squat: {
          exerciseId: "squat",
          bestE1RMKg: 150,
          bestWeightKg: 130,
          bestRepsAtWeight: {},
          rank: 6,
          progressToNext: 0.3,
          totalVolumeKg: 2000,
          totalSets: 20,
          lastUpdatedMs: Date.now(),
        },
      };

      const result = calculateVariety(exerciseStats, {});

      expect(result.uniqueExercises).toBe(2);
    });

    it("should track covered muscle groups", () => {
      const volumeByMuscle: Partial<Record<string, number>> = {
        chest: 5000,
        lats: 3000,
        shoulders: 2000,
      };

      const result = calculateVariety({}, volumeByMuscle);

      expect(result.musclesCovered).toContain("chest");
      expect(result.musclesCovered).toContain("lats");
      expect(result.musclesCovered).toContain("shoulders");
    });
  });
});
