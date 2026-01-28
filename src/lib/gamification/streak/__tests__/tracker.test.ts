/**
 * Unit tests for streak tracker
 */

import {
  updateStreak,
  updateWorkoutCalendar,
  getWorkoutIntensity,
  checkStreakMilestone,
  daysBetween,
  isWithinStreakThreshold,
  getStreakBreakDate,
  getDaysRemainingInStreak,
} from '../tracker';

// Use a fixed reference date for tests
const TEST_TODAY = '2024-01-15';

describe('updateStreak', () => {
  const today = '2024-01-15';

  it('should start streak at 1 for first workout', () => {
    const profile = {
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: undefined,
    };

    const result = updateStreak(profile, today);

    expect(result.streak).toBe(1);
    expect(result.wasReset).toBe(false);
    expect(result.isNewRecord).toBe(true);
  });

  it('should continue streak for workout within threshold', () => {
    const profile = {
      currentStreak: 5,
      longestStreak: 10,
      lastWorkoutDate: '2024-01-14',
    };

    const result = updateStreak(profile, today);

    expect(result.streak).toBe(6);
    expect(result.wasReset).toBe(false);
  });

  it('should reset streak when threshold exceeded', () => {
    const profile = {
      currentStreak: 10,
      longestStreak: 10,
      lastWorkoutDate: '2024-01-08', // 7 days ago (> 5 day threshold)
    };

    const result = updateStreak(profile, today);

    expect(result.streak).toBe(1);
    expect(result.wasReset).toBe(true);
    expect(result.previousStreak).toBe(10);
  });

  it('should not increment on same-day workout', () => {
    const profile = {
      currentStreak: 5,
      longestStreak: 5,
      lastWorkoutDate: today,
    };

    const result = updateStreak(profile, today);

    expect(result.streak).toBe(5);
    expect(result.wasReset).toBe(false);
  });

  it('should update longest streak on new record', () => {
    const profile = {
      currentStreak: 10,
      longestStreak: 10,
      lastWorkoutDate: '2024-01-14',
    };

    const result = updateStreak(profile, today);

    expect(result.streak).toBe(11);
    // Note: longestStreak is not updated by updateStreak itself,
    // but the caller should check isNewRecord and update it
    expect(result.isNewRecord).toBe(true);
  });

  it('should handle workout exactly at threshold (5 days)', () => {
    const profile = {
      currentStreak: 5,
      longestStreak: 5,
      lastWorkoutDate: '2024-01-10', // 5 days ago (within threshold)
    };

    const result = updateStreak(profile, today);

    expect(result.streak).toBe(6);
    expect(result.wasReset).toBe(false);
  });
});

describe('updateWorkoutCalendar', () => {
  it('should add new workout entry', () => {
    const calendar = [];
    // Use today's date to avoid being filtered out
    const date = new Date().toISOString().split('T')[0];
    const xp = 150;

    const result = updateWorkoutCalendar(calendar, date, xp);

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe(date);
    expect(result[0].count).toBe(1);
    expect(result[0].xp).toBe(xp);
  });

  it('should update existing date entry', () => {
    // Use today's date to avoid being filtered out
    const today = new Date().toISOString().split('T')[0];
    const calendar = [{ date: today, count: 1, xp: 100 }];
    const date = today;
    const xp = 150;

    const result = updateWorkoutCalendar(calendar, date, xp);

    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2); // 1 + 1
    expect(result[0].xp).toBe(250); // 100 + 150
  });

  it('should remove entries older than 365 days', () => {
    // Create an entry that's definitely older than 365 days
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 2);
    const oldDateStr = oldDate.toISOString().split('T')[0];

    const today = new Date().toISOString().split('T')[0];
    const oldCalendar = [
      { date: oldDateStr, count: 1, xp: 100 }, // Too old
      { date: today, count: 1, xp: 100 }, // Recent
    ];

    const result = updateWorkoutCalendar(oldCalendar, today, 50);

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe(today);
  });
});

describe('getWorkoutIntensity', () => {
  it('should return 0 for no workout', () => {
    expect(getWorkoutIntensity(0, 0)).toBe(0);
  });

  it('should return 1 for light workout', () => {
    expect(getWorkoutIntensity(1, 30)).toBe(1);
  });

  it('should return 2 for moderate workout', () => {
    expect(getWorkoutIntensity(1, 100)).toBe(2);
  });

  it('should return 3 for heavy workout', () => {
    expect(getWorkoutIntensity(1, 150)).toBe(3);
  });

  it('should return 4 for very heavy workout', () => {
    expect(getWorkoutIntensity(1, 200)).toBe(4);
  });

  it('should return 4 for multiple workouts', () => {
    expect(getWorkoutIntensity(2, 50)).toBe(4);
  });
});

describe('checkStreakMilestone', () => {
  it('should return milestone for 7 days', () => {
    const result = checkStreakMilestone(7);
    expect(result).toEqual({ days: 7, tokens: 25 });
  });

  it('should return milestone for 30 days', () => {
    const result = checkStreakMilestone(30);
    expect(result).toEqual({ days: 30, tokens: 100 });
  });

  it('should return milestone for 100 days', () => {
    const result = checkStreakMilestone(100);
    expect(result).toEqual({ days: 100, tokens: 500 });
  });

  it('should return null for non-milestone streak', () => {
    const result = checkStreakMilestone(5);
    expect(result).toBeNull();
  });
});

describe('daysBetween', () => {
  it('should calculate days between dates', () => {
    expect(daysBetween('2024-01-01', '2024-01-02')).toBe(1);
    expect(daysBetween('2024-01-01', '2024-01-10')).toBe(9);
  });

  it('should handle same date', () => {
    expect(daysBetween('2024-01-01', '2024-01-01')).toBe(0);
  });
});

describe('isWithinStreakThreshold', () => {
  it('should return true for recent workout', () => {
    expect(isWithinStreakThreshold('2024-01-14', '2024-01-15')).toBe(true);
  });

  it('should return true for workout at threshold', () => {
    expect(isWithinStreakThreshold('2024-01-10', '2024-01-15')).toBe(true);
  });

  it('should return false for old workout', () => {
    expect(isWithinStreakThreshold('2024-01-08', '2024-01-15')).toBe(false);
  });
});

describe('getStreakBreakDate', () => {
  it('should calculate date when streak breaks', () => {
    const breakDate = getStreakBreakDate('2024-01-15');
    expect(breakDate).toBe('2024-01-21'); // 5 days + 1
  });
});

describe('getDaysRemainingInStreak', () => {
  it('should return days remaining for recent workout', () => {
    // Use a recent date - 1 day ago
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const days = getDaysRemainingInStreak(yesterdayStr);
    expect(days).toBe(4); // Threshold is 5, 1 day passed
  });

  it('should return 0 when streak breaks today', () => {
    // Use a date that's exactly 5 days ago (streak breaks today)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const fiveDaysAgoStr = fiveDaysAgo.toISOString().split('T')[0];

    const days = getDaysRemainingInStreak(fiveDaysAgoStr);
    expect(days).toBe(0);
  });

  it('should return -1 for already broken streak', () => {
    // Use a date that's more than 5 days ago
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    const sixDaysAgoStr = sixDaysAgo.toISOString().split('T')[0];

    const days = getDaysRemainingInStreak(sixDaysAgoStr);
    expect(days).toBe(-1);
  });
});
