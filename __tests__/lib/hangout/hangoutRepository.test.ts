// __tests__/lib/hangout/hangoutRepository.test.ts
// Tests for hangout repository

// Mock must be self-contained in the factory to avoid hoisting issues
// (jest.mock is hoisted above variable declarations)
jest.mock('../../../src/lib/supabase/client', () => {
  const chain: Record<string, jest.Mock> = {};
  const methods = ['from', 'insert', 'select', 'update', 'eq', 'single', 'limit', 'or', 'cs', 'delete'];
  for (const m of methods) {
    chain[m] = jest.fn(() => chain);
  }
  return { supabase: chain };
});

// Mock error handler
jest.mock('../../../src/lib/errorHandler', () => ({
  logError: jest.fn(),
}));

import {
  createHangoutRoom,
  getHangoutRoom,
  getUserHangoutRoom,
  addDecoration,
  getRoomDecorations,
  updateUserPresence,
  getRoomUserPresences
} from '../../../src/lib/hangout/hangoutRepository';

// Get reference to the mock chain after imports
const { supabase: mockChain } = require('../../../src/lib/supabase/client') as { supabase: Record<string, jest.Mock> };

describe('hangoutRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all chain methods to return the chain object
    for (const key of Object.keys(mockChain)) {
      mockChain[key].mockImplementation(() => mockChain);
    }
  });

  describe('createHangoutRoom', () => {
    it('should create hangout room successfully', async () => {
      const mockData = {
        id: 'room123',
        owner_id: 'user123',
        name: 'Test Room',
        theme: 'default',
        members: ['user123'],
        created_at: '2026-01-29T00:00:00Z',
        updated_at: '2026-01-29T00:00:00Z',
      };

      // The chain: from().insert().select().single()
      // single() is the terminal and should resolve
      mockChain.single.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await createHangoutRoom('user123', 'Test Room', 'default');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('room123');
      expect(result.data?.ownerId).toBe('user123');
    });

    it('should handle error when creating hangout room', async () => {
      // single() resolves with error
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'Failed to create' } });

      const result = await createHangoutRoom('user123', 'Test Room', 'default');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create');
    });
  });

  describe('getHangoutRoom', () => {
    it('should get hangout room successfully', async () => {
      const mockData = {
        id: 'room123',
        owner_id: 'user123',
        name: 'Test Room',
        theme: 'default',
        members: ['user123'],
        created_at: '2026-01-29T00:00:00Z',
        updated_at: '2026-01-29T00:00:00Z',
      };

      // The chain: from().select().eq().single()
      mockChain.single.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await getHangoutRoom('room123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('room123');
    });

    it('should handle error when getting hangout room', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'Room not found' } });

      const result = await getHangoutRoom('room123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Room not found');
    });
  });

  describe('addDecoration', () => {
    it('should add decoration successfully', async () => {
      const mockDecoration = {
        id: 'deco123',
        room_id: 'room123',
        item_id: 'chair_001',
        item_type: 'furniture',
        position_x: 100,
        position_y: 200,
        contributed_by: 'user123',
        approved: true,
        created_at: '2026-01-29T00:00:00Z',
      };

      // The chain: from().insert().select().single()
      mockChain.single.mockResolvedValueOnce({ data: mockDecoration, error: null });

      const result = await addDecoration({
        roomId: 'room123',
        itemId: 'chair_001',
        itemType: 'furniture',
        position: { x: 100, y: 200 },
        contributedBy: 'user123',
        approved: true,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('deco123');
    });
  });
});
