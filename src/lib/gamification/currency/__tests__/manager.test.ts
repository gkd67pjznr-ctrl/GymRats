/**
 * Unit tests for currency manager
 */

import {
  calculatePRReward,
  calculateLevelUpReward,
  calculateStreakReward,
  getWorkoutCompletionReward,
  calculateWorkoutTokenRewards,
  canAfford,
  spendTokens,
  getRewardTypeName,
  calculatePRTierFromProgression,
  formatTokenAmount,
  getRewardEmoji,
} from '../manager';

describe('calculatePRReward', () => {
  describe('weight PR', () => {
    it('should return tier 1 reward', () => {
      const reward = calculatePRReward('weight', 1);

      expect(reward.type).toBe('pr_weight_tier1');
      expect(reward.amount).toBe(5);
      expect(reward.context).toBe('Tier 1');
    });

    it('should return tier 4 reward', () => {
      const reward = calculatePRReward('weight', 4);

      expect(reward.type).toBe('pr_weight_tier4');
      expect(reward.amount).toBe(11);
    });

    it('should scale reward by tier', () => {
      const tier1 = calculatePRReward('weight', 1);
      const tier4 = calculatePRReward('weight', 4);
      const tier7 = calculatePRReward('weight', 7);

      expect(tier1.amount).toBeLessThan(tier4.amount);
      expect(tier4.amount).toBeLessThan(tier7.amount);
    });
  });

  describe('rep PR', () => {
    it('should return standard reward', () => {
      const reward = calculatePRReward('rep');

      expect(reward.type).toBe('pr_rep');
      expect(reward.amount).toBe(5);
      expect(reward.context).toBe('Rep PR');
    });
  });

  describe('e1RM PR', () => {
    it('should return reward without tier', () => {
      const reward = calculatePRReward('e1rm');

      expect(reward.type).toBe('pr_e1rm');
      expect(reward.amount).toBe(7);
    });

    it('should scale reward by tier', () => {
      const tier1 = calculatePRReward('e1rm', 1);
      const tier3 = calculatePRReward('e1rm', 3);

      expect(tier1.amount).toBeLessThan(tier3.amount);
    });
  });
});

describe('calculateLevelUpReward', () => {
  it('should calculate base reward + level bonus', () => {
    const reward = calculateLevelUpReward(5);

    // 50 base + 5 × 10 = 100
    expect(reward.amount).toBe(100);
    expect(reward.type).toBe('level_up');
  });

  it('should scale with level', () => {
    const level5 = calculateLevelUpReward(5);
    const level10 = calculateLevelUpReward(10);

    expect(level10.amount).toBeGreaterThan(level5.amount);
  });
});

describe('calculateStreakReward', () => {
  it('should return milestone for 7 days', () => {
    const reward = calculateStreakReward(7);

    expect(reward).not.toBeNull();
    expect(reward?.amount).toBe(25);
  });

  it('should return milestone for 30 days', () => {
    const reward = calculateStreakReward(30);

    expect(reward).not.toBeNull();
    expect(reward?.amount).toBe(100);
  });

  it('should return milestone for 100 days', () => {
    const reward = calculateStreakReward(100);

    expect(reward).not.toBeNull();
    expect(reward?.amount).toBe(500);
  });

  it('should return null for non-milestone', () => {
    const reward = calculateStreakReward(5);

    expect(reward).toBeNull();
  });
});

describe('getWorkoutCompletionReward', () => {
  it('should return standard reward for normal workout', () => {
    const reward = getWorkoutCompletionReward(false);

    expect(reward.type).toBe('workout_complete');
    expect(reward.amount).toBe(5);
  });

  it('should return higher reward for perfect workout', () => {
    const reward = getWorkoutCompletionReward(true);

    expect(reward.type).toBe('plan_complete');
    expect(reward.amount).toBe(10);
  });
});

describe('calculateWorkoutTokenRewards', () => {
  it('should calculate total rewards', () => {
    const rewards = calculateWorkoutTokenRewards({
      setCount: 10,
      wasPerfectWorkout: true,
      streakMilestone: 7,
      prsAchieved: [
        { type: 'weight', tier: 2 },
        { type: 'rep' },
      ],
    });

    const total = rewards.reduce((sum, r) => sum + r.amount, 0);

    // Perfect workout (10) + streak 7 (25) + weight PR tier 2 (7) + rep PR (5) = 47
    expect(total).toBe(47);
  });

  it('should handle workout with no bonuses', () => {
    const rewards = calculateWorkoutTokenRewards({
      setCount: 5,
      wasPerfectWorkout: false,
    });

    expect(rewards).toHaveLength(1);
    expect(rewards[0].amount).toBe(5);
  });
});

describe('canAfford', () => {
  it('should return true when sufficient balance', () => {
    expect(canAfford(100, 50)).toBe(true);
  });

  it('should return false when insufficient balance', () => {
    expect(canAfford(50, 100)).toBe(false);
  });

  it('should return true for exact match', () => {
    expect(canAfford(100, 100)).toBe(true);
  });
});

describe('spendTokens', () => {
  it('should deduct tokens when sufficient', () => {
    const result = spendTokens(100, 30);

    expect(result).toBe(70);
  });

  it('should return null when insufficient', () => {
    const result = spendTokens(50, 100);

    expect(result).toBeNull();
  });
});

describe('getRewardTypeName', () => {
  it('should return human-readable names', () => {
    expect(getRewardTypeName('pr_weight_tier1')).toBe('Weight PR');
    expect(getRewardTypeName('level_up')).toBe('Level Up');
    expect(getRewardTypeName('streak_7')).toBe('7-Day Streak');
    expect(getRewardTypeName('workout_complete')).toBe('Workout Complete');
  });
});

describe('calculatePRTierFromProgression', () => {
  it('should calculate tier from improvement percentage', () => {
    // Implementation: >=50%→7, >=30%→6, >=20%→5, >=15%→4, >=10%→3, >=5%→2, <5%→1
    expect(calculatePRTierFromProgression('bench', 102, 100)).toBe(1); // 2%
    expect(calculatePRTierFromProgression('bench', 105, 100)).toBe(2); // 5%
    expect(calculatePRTierFromProgression('bench', 110, 100)).toBe(3); // 10%
    expect(calculatePRTierFromProgression('bench', 115, 100)).toBe(4); // 15%
    expect(calculatePRTierFromProgression('bench', 120, 100)).toBe(5); // 20%
    expect(calculatePRTierFromProgression('bench', 130, 100)).toBe(6); // 30%
    expect(calculatePRTierFromProgression('bench', 150, 100)).toBe(7); // 50%
    expect(calculatePRTierFromProgression('bench', 200, 100)).toBe(7); // 100%
  });
});

describe('formatTokenAmount', () => {
  it('should format small amounts', () => {
    expect(formatTokenAmount(5)).toBe('5 Tokens');
  });

  it('should use plural for multiple', () => {
    expect(formatTokenAmount(100)).toBe('100 Tokens');
  });

  it('should add commas for large amounts', () => {
    expect(formatTokenAmount(1500)).toBe('1,500 Tokens');
  });
});

describe('getRewardEmoji', () => {
  it('should return emoji for each type', () => {
    expect(getRewardEmoji('pr_weight_tier1')).toBe('🏋️');
    expect(getRewardEmoji('level_up')).toBe('🎖️');
    expect(getRewardEmoji('streak_7')).toBe('🔥');
    expect(getRewardEmoji('workout_complete')).toBe('✅');
  });
});
