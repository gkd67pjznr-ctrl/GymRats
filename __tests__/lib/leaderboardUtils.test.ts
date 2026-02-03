// __tests__/lib/leaderboardUtils.test.ts

import {
  filterByFriends,
  recomputeRanks,
  ensureCurrentUserVisible,
  computeOverallRankings,
  formatE1rmDisplay,
  type EnhancedLeaderboardEntry,
} from '../../src/lib/leaderboardUtils';

describe('filterByFriends', () => {
  const entries = [
    { rank: 1, userId: 'u1', userName: 'Alice', value: 100 },
    { rank: 2, userId: 'u2', userName: 'Bob', value: 90 },
    { rank: 3, userId: 'u3', userName: 'Charlie', value: 80 },
    { rank: 4, userId: 'u4', userName: 'Diana', value: 70 },
  ];

  it('filters to only friends and current user', () => {
    const friendIds = new Set(['u2', 'u4']);
    const currentUserId = 'u1';

    const result = filterByFriends(entries, friendIds, currentUserId);

    expect(result).toHaveLength(3);
    expect(result.map(e => e.userId)).toEqual(['u1', 'u2', 'u4']);
  });

  it('includes current user even if not in friends set', () => {
    const friendIds = new Set(['u2']);
    const currentUserId = 'u3';

    const result = filterByFriends(entries, friendIds, currentUserId);

    expect(result).toHaveLength(2);
    expect(result.map(e => e.userId)).toEqual(['u2', 'u3']);
  });

  it('returns empty array when no matches', () => {
    const friendIds = new Set<string>();
    const currentUserId = 'u_nonexistent';

    const result = filterByFriends(entries, friendIds, currentUserId);

    expect(result).toHaveLength(0);
  });

  it('returns only current user when no friends', () => {
    const friendIds = new Set<string>();
    const currentUserId = 'u1';

    const result = filterByFriends(entries, friendIds, currentUserId);

    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe('u1');
  });
});

describe('recomputeRanks', () => {
  it('assigns sequential ranks starting from 1', () => {
    const entries = [
      { rank: 5, userId: 'u1', value: 100 },
      { rank: 10, userId: 'u2', value: 90 },
      { rank: 15, userId: 'u3', value: 80 },
    ];

    const result = recomputeRanks(entries);

    expect(result.map(e => e.rank)).toEqual([1, 2, 3]);
    // Preserves other properties
    expect(result.map(e => e.userId)).toEqual(['u1', 'u2', 'u3']);
    expect(result.map(e => e.value)).toEqual([100, 90, 80]);
  });

  it('handles empty array', () => {
    const result = recomputeRanks([]);
    expect(result).toEqual([]);
  });

  it('handles single entry', () => {
    const entries = [{ rank: 42, userId: 'u1', value: 100 }];
    const result = recomputeRanks(entries);
    expect(result[0].rank).toBe(1);
  });
});

describe('ensureCurrentUserVisible', () => {
  const entries = [
    { rank: 1, userId: 'u1', userName: 'Alice', value: 100 },
    { rank: 2, userId: 'u2', userName: 'Bob', value: 90 },
    { rank: 3, userId: 'u3', userName: 'Charlie', value: 80 },
    { rank: 4, userId: 'u4', userName: 'Diana', value: 70 },
    { rank: 5, userId: 'u5', userName: 'Eve', value: 60 },
    { rank: 6, userId: 'u6', userName: 'Frank', value: 50 },
    { rank: 7, userId: 'u7', userName: 'Grace', value: 40 },
    { rank: 8, userId: 'u8', userName: 'Henry', value: 30 },
    { rank: 9, userId: 'u9', userName: 'Ivy', value: 20 },
    { rank: 10, userId: 'u10', userName: 'Jack', value: 15 },
    { rank: 11, userId: 'u11', userName: 'Kate', value: 10 },
    { rank: 12, userId: 'u12', userName: 'Leo', value: 5 },
  ];

  it('returns top N when user is in top N', () => {
    const result = ensureCurrentUserVisible(entries, 'u3', 10);

    expect(result).toHaveLength(10);
    expect(result.map(e => e.userId)).toEqual([
      'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10'
    ]);
    expect(result.find(e => e.userId === 'u3')?.isCurrentUser).toBe(true);
  });

  it('appends user with separator when outside top N', () => {
    const result = ensureCurrentUserVisible(entries, 'u12', 10);

    // Should have top 9 + user (10 total)
    expect(result).toHaveLength(10);
    expect(result.slice(0, 9).map(e => e.userId)).toEqual([
      'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9'
    ]);

    // Last entry should be the user with separator
    const lastEntry = result[9];
    expect(lastEntry.userId).toBe('u12');
    expect(lastEntry.isCurrentUser).toBe(true);
    expect(lastEntry.showSeparator).toBe(true);
    expect(lastEntry.rank).toBe(12);
  });

  it('marks current user correctly when in top N', () => {
    const result = ensureCurrentUserVisible(entries, 'u1', 10);

    const userEntry = result.find(e => e.userId === 'u1');
    expect(userEntry?.isCurrentUser).toBe(true);
    expect(userEntry?.showSeparator).toBeUndefined();
  });

  it('returns empty array for empty entries', () => {
    const result = ensureCurrentUserVisible([], 'u1', 10);
    expect(result).toEqual([]);
  });

  it('returns sliced entries when user not in list', () => {
    const result = ensureCurrentUserVisible(entries, 'u_nonexistent', 5);

    expect(result).toHaveLength(5);
    expect(result.map(e => e.userId)).toEqual(['u1', 'u2', 'u3', 'u4', 'u5']);
  });

  it('handles custom maxVisible', () => {
    const result = ensureCurrentUserVisible(entries, 'u1', 3);

    expect(result).toHaveLength(3);
    expect(result.map(e => e.userId)).toEqual(['u1', 'u2', 'u3']);
  });
});

describe('computeOverallRankings', () => {
  it('computes average scores across exercises', () => {
    const exerciseRankings = new Map([
      ['bench', [
        { userId: 'u1', userName: 'Alice', value: 100 },
        { userId: 'u2', userName: 'Bob', value: 80 },
      ]],
      ['squat', [
        { userId: 'u1', userName: 'Alice', value: 120 },
        { userId: 'u2', userName: 'Bob', value: 100 },
        { userId: 'u3', userName: 'Charlie', value: 90 },
      ]],
    ]);

    const result = computeOverallRankings(exerciseRankings);

    // Alice: (100 + 120) / 2 = 110
    // Bob: (80 + 100) / 2 = 90
    // Charlie: 90 / 1 = 90 (tied with Bob, sorted by name)
    expect(result).toHaveLength(3);

    expect(result[0].userId).toBe('u1');
    expect(result[0].value).toBe(110);
    expect(result[0].rank).toBe(1);

    expect(result[1].userId).toBe('u2');
    expect(result[1].value).toBe(90);
    expect(result[1].rank).toBe(2);

    expect(result[2].userId).toBe('u3');
    expect(result[2].value).toBe(90);
    expect(result[2].rank).toBe(3);
  });

  it('handles empty exercise rankings', () => {
    const result = computeOverallRankings(new Map());
    expect(result).toEqual([]);
  });

  it('handles single exercise', () => {
    const exerciseRankings = new Map([
      ['deadlift', [
        { userId: 'u1', userName: 'Alice', value: 150 },
      ]],
    ]);

    const result = computeOverallRankings(exerciseRankings);

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(150);
    expect(result[0].display).toBe('150 avg');
  });

  it('rounds average scores', () => {
    const exerciseRankings = new Map([
      ['bench', [{ userId: 'u1', userName: 'Alice', value: 100 }]],
      ['squat', [{ userId: 'u1', userName: 'Alice', value: 101 }]],
      ['deadlift', [{ userId: 'u1', userName: 'Alice', value: 102 }]],
    ]);

    const result = computeOverallRankings(exerciseRankings);

    // (100 + 101 + 102) / 3 = 101
    expect(result[0].value).toBe(101);
  });
});

describe('formatE1rmDisplay', () => {
  it('formats in kg by default', () => {
    expect(formatE1rmDisplay(100)).toBe('100 kg');
  });

  it('rounds kg values', () => {
    expect(formatE1rmDisplay(100.7)).toBe('101 kg');
    expect(formatE1rmDisplay(100.4)).toBe('100 kg');
  });

  it('converts to lbs when requested', () => {
    expect(formatE1rmDisplay(100, true)).toBe('220 lbs');
  });

  it('rounds lbs values', () => {
    expect(formatE1rmDisplay(45.359237, true)).toBe('100 lbs');
  });
});
