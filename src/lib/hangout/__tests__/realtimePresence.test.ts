// src/lib/hangout/__tests__/realtimePresence.test.ts
// Tests for real-time presence functionality

import { realtimePresence, updatePresenceStatus, getOnlinePresences } from '../realtimePresence';

// Mock Supabase
jest.mock('../../supabase/client', () => {
  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn((callback) => {
      setTimeout(() => callback('SUBSCRIBED'), 0);
      return mockChannel;
    }),
    track: jest.fn().mockResolvedValue(undefined),
    untrack: jest.fn().mockResolvedValue(undefined),
    presenceState: jest.fn().mockReturnValue({}),
  };

  return {
    supabase: {
      channel: jest.fn().mockReturnValue(mockChannel),
      removeChannel: jest.fn().mockResolvedValue(undefined),
    },
  };
});

// Mock hangout store
jest.mock('../hangoutStore', () => ({
  useHangoutStore: {
    setState: jest.fn(),
    getState: jest.fn().mockReturnValue({
      currentRoom: null,
      userPresences: [],
    }),
  },
}));

// Mock error handler
jest.mock('../../errorHandler', () => ({
  logError: jest.fn(),
}));

describe('RealtimePresenceManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPresences', () => {
    it('should return empty array when no presences', () => {
      const presences = realtimePresence.getPresences();
      expect(presences).toEqual([]);
    });
  });

  describe('getOnlineCount', () => {
    it('should return 0 when no presences', () => {
      expect(realtimePresence.getOnlineCount()).toBe(0);
    });
  });

  describe('isOnline', () => {
    it('should return false for unknown user', () => {
      expect(realtimePresence.isOnline('unknown-user')).toBe(false);
    });
  });

  describe('updatePresenceStatus', () => {
    it('should return false when not connected to a room', async () => {
      const result = await updatePresenceStatus('online', 'Available');
      expect(result).toBe(false);
    });

    it('should return false with no activity', async () => {
      const result = await updatePresenceStatus('working_out');
      expect(result).toBe(false);
    });
  });

  describe('getOnlinePresences', () => {
    it('should return empty array when no online presences', () => {
      const presences = getOnlinePresences();
      expect(presences).toEqual([]);
    });
  });
});

describe('Presence Status Types', () => {
  it('should accept valid status values', () => {
    const validStatuses: Array<'online' | 'working_out' | 'resting' | 'offline'> = [
      'online',
      'working_out',
      'resting',
      'offline',
    ];

    validStatuses.forEach(status => {
      expect(['online', 'working_out', 'resting', 'offline']).toContain(status);
    });
  });
});
