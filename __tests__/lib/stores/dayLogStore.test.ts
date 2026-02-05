// __tests__/lib/stores/dayLogStore.test.ts
// Tests for Day Log store

import {
  useDayLogStore,
  addDayLog,
  getDayLogForSession,
  getDayLogsInRange,
} from '@/src/lib/stores/dayLogStore';
import type { DayLogDraft } from '@/src/lib/dayLog/types';
import { DEFAULT_DAY_LOG_DRAFT, isDayLogDraftValid } from '@/src/lib/dayLog/types';

// Reset store before each test
beforeEach(() => {
  useDayLogStore.setState({ logs: [], hydrated: true });
});

describe('Day Log Types', () => {
  test('DEFAULT_DAY_LOG_DRAFT has all required fields', () => {
    expect(DEFAULT_DAY_LOG_DRAFT.hydration).toBe(3);
    expect(DEFAULT_DAY_LOG_DRAFT.nutrition).toBe('moderate');
    expect(DEFAULT_DAY_LOG_DRAFT.carbsLevel).toBe('moderate');
    expect(DEFAULT_DAY_LOG_DRAFT.hasPain).toBe(false);
    expect(DEFAULT_DAY_LOG_DRAFT.energyLevel).toBe(3);
    expect(DEFAULT_DAY_LOG_DRAFT.sleepQuality).toBe(3);
  });

  test('isDayLogDraftValid returns true for valid draft', () => {
    expect(isDayLogDraftValid(DEFAULT_DAY_LOG_DRAFT)).toBe(true);
  });

  test('isDayLogDraftValid returns false for incomplete draft', () => {
    expect(isDayLogDraftValid({})).toBe(false);
    expect(isDayLogDraftValid({ hydration: 3 })).toBe(false);
    expect(isDayLogDraftValid({ hydration: 3, nutrition: 'light' })).toBe(false);
  });
});

describe('Day Log Store', () => {
  const validDraft: DayLogDraft = {
    hydration: 4,
    nutrition: 'moderate',
    carbsLevel: 'high',
    hasPain: false,
    energyLevel: 5,
    sleepQuality: 4,
    notes: 'Feeling great!',
  };

  test('addLog creates a new Day Log with valid draft', () => {
    const sessionId = 'test-session-123';
    const log = addDayLog(validDraft, sessionId);

    expect(log).not.toBeNull();
    expect(log?.sessionId).toBe(sessionId);
    expect(log?.hydration).toBe(4);
    expect(log?.nutrition).toBe('moderate');
    expect(log?.carbsLevel).toBe('high');
    expect(log?.hasPain).toBe(false);
    expect(log?.energyLevel).toBe(5);
    expect(log?.sleepQuality).toBe(4);
    expect(log?.notes).toBe('Feeling great!');
    expect(log?.id).toBeDefined();
    expect(log?.createdAt).toBeDefined();
  });

  test('addLog returns null for invalid draft', () => {
    const log = addDayLog({}, 'test-session');
    expect(log).toBeNull();
  });

  test('getLogForSession retrieves the correct log', () => {
    const sessionId = 'session-abc';
    addDayLog(validDraft, sessionId);

    const retrieved = getDayLogForSession(sessionId);
    expect(retrieved).not.toBeUndefined();
    expect(retrieved?.sessionId).toBe(sessionId);
  });

  test('getLogForSession returns undefined for unknown session', () => {
    const retrieved = getDayLogForSession('unknown-session');
    expect(retrieved).toBeUndefined();
  });

  test('getLogsInRange returns logs within time range', () => {
    const now = Date.now();

    // Add first log
    addDayLog(validDraft, 'session-1');

    // Get logs from the last hour
    const logs = getDayLogsInRange(now - 3600000, now + 1000);
    expect(logs.length).toBe(1);
  });

  test('getLogsInRange returns empty array for no matches', () => {
    addDayLog(validDraft, 'session-1');

    // Get logs from 10 hours ago (before any logs were created)
    const now = Date.now();
    const logs = getDayLogsInRange(now - 36000000, now - 35000000);
    expect(logs.length).toBe(0);
  });

  test('pain locations are only saved when hasPain is true', () => {
    const draftWithPain: DayLogDraft = {
      ...validDraft,
      hasPain: true,
      painLocations: ['shoulder_l', 'lower_back'],
    };

    const logWithPain = addDayLog(draftWithPain, 'session-pain');
    expect(logWithPain?.hasPain).toBe(true);
    expect(logWithPain?.painLocations).toEqual(['shoulder_l', 'lower_back']);

    const draftNoPain: DayLogDraft = {
      ...validDraft,
      hasPain: false,
      painLocations: ['shoulder_l'], // Should be ignored
    };

    const logNoPain = addDayLog(draftNoPain, 'session-no-pain');
    expect(logNoPain?.hasPain).toBe(false);
    expect(logNoPain?.painLocations).toBeUndefined();
  });
});
