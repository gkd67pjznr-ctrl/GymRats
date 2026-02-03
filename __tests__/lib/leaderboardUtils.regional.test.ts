/**
 * Tests for regional filtering in leaderboardUtils
 */
import { filterByRegion, recomputeRanks } from '../../src/lib/leaderboardUtils';

describe('filterByRegion', () => {
  const mockEntries = [
    { userId: '1', value: 100, rank: 1, country: 'United States', region: 'California' },
    { userId: '2', value: 90, rank: 2, country: 'United States', region: 'Texas' },
    { userId: '3', value: 80, rank: 3, country: 'Canada', region: 'Ontario' },
    { userId: '4', value: 70, rank: 4, country: 'United States', region: 'California' },
    { userId: '5', value: 60, rank: 5, country: 'United Kingdom', region: 'England' },
    { userId: '6', value: 50, rank: 6, country: null, region: null },
    { userId: '7', value: 40, rank: 7, country: 'united states', region: 'california' }, // lowercase
  ];

  it('filters by country only', () => {
    const result = filterByRegion(mockEntries, 'United States');

    expect(result).toHaveLength(4);
    expect(result.map(e => e.userId)).toEqual(['1', '2', '4', '7']);
  });

  it('filters by country and region', () => {
    const result = filterByRegion(mockEntries, 'United States', 'California');

    expect(result).toHaveLength(3);
    expect(result.map(e => e.userId)).toEqual(['1', '4', '7']);
  });

  it('handles case-insensitive country matching', () => {
    const result = filterByRegion(mockEntries, 'UNITED STATES');

    expect(result).toHaveLength(4);
    expect(result.map(e => e.userId)).toEqual(['1', '2', '4', '7']);
  });

  it('handles case-insensitive region matching', () => {
    const result = filterByRegion(mockEntries, 'united states', 'CALIFORNIA');

    expect(result).toHaveLength(3);
    expect(result.map(e => e.userId)).toEqual(['1', '4', '7']);
  });

  it('excludes entries with null country', () => {
    const result = filterByRegion(mockEntries, 'United States');

    expect(result.map(e => e.userId)).not.toContain('6');
  });

  it('returns empty array when no matches', () => {
    const result = filterByRegion(mockEntries, 'Australia');

    expect(result).toHaveLength(0);
  });

  it('returns empty array when region does not match', () => {
    const result = filterByRegion(mockEntries, 'United States', 'Florida');

    expect(result).toHaveLength(0);
  });

  it('works with entries missing region when only country filter', () => {
    const entriesWithMissingRegion = [
      { userId: '1', value: 100, rank: 1, country: 'Canada', region: undefined },
      { userId: '2', value: 90, rank: 2, country: 'Canada', region: 'Ontario' },
    ];

    const result = filterByRegion(entriesWithMissingRegion, 'Canada');

    expect(result).toHaveLength(2);
  });

  it('excludes entries with missing region when region filter specified', () => {
    const entriesWithMissingRegion = [
      { userId: '1', value: 100, rank: 1, country: 'Canada', region: undefined },
      { userId: '2', value: 90, rank: 2, country: 'Canada', region: 'Ontario' },
    ];

    const result = filterByRegion(entriesWithMissingRegion, 'Canada', 'Ontario');

    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe('2');
  });
});

describe('recomputeRanks after regional filter', () => {
  it('recomputes ranks correctly after regional filtering', () => {
    const mockEntries = [
      { userId: '1', value: 100, rank: 1, country: 'United States', region: 'California' },
      { userId: '2', value: 90, rank: 2, country: 'Canada', region: 'Ontario' },
      { userId: '3', value: 80, rank: 3, country: 'United States', region: 'California' },
      { userId: '4', value: 70, rank: 4, country: 'Canada', region: 'Ontario' },
    ];

    const filtered = filterByRegion(mockEntries, 'United States', 'California');
    const reranked = recomputeRanks(filtered);

    expect(reranked).toHaveLength(2);
    expect(reranked[0]).toMatchObject({ userId: '1', rank: 1 });
    expect(reranked[1]).toMatchObject({ userId: '3', rank: 2 });
  });
});
