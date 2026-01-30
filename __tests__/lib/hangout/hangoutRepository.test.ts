// __tests__/lib/hangout/hangoutRepository.test.ts
// Tests for hangout repository

// Mock Supabase client
const mockFrom = jest.fn().mockReturnThis();
const mockInsert = jest.fn().mockReturnThis();
const mockSelect = jest.fn().mockReturnThis();
const mockUpdate = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockReturnThis();
const mockOr = jest.fn().mockReturnThis();
const mockCs = jest.fn().mockReturnThis();

const mockSupabase = {
  from: mockFrom,
  insert: mockInsert,
  select: mockSelect,
  update: mockUpdate,
  eq: mockEq,
  single: mockSingle,
  limit: mockLimit,
  or: mockOr,
  cs: mockCs,
};

jest.mock('../../../src/lib/supabase/client', () => ({
  supabase: mockSupabase,
}));

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

describe('hangoutRepository', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
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

      mockFrom.mockReturnValueOnce(mockSupabase);
      mockInsert.mockResolvedValueOnce({ data: [mockData], error: null });
      mockSelect.mockReturnValueOnce(mockSupabase);
      mockSingle.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await createHangoutRoom('user123', 'Test Room', 'default');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('room123');
      expect(result.data?.ownerId).toBe('user123');
    });

    it('should handle error when creating hangout room', async () => {
      mockFrom.mockReturnValueOnce(mockSupabase);
      mockInsert.mockResolvedValueOnce({ data: null, error: { message: 'Failed to create' } });

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

      mockFrom.mockReturnValueOnce(mockSupabase);
      mockSelect.mockResolvedValueOnce({ data: mockData, error: null });
      mockEq.mockReturnThis();
      mockSingle.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await getHangoutRoom('room123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('room123');
    });

    it('should handle error when getting hangout room', async () => {
      mockFrom.mockReturnValueOnce(mockSupabase);
      mockSelect.mockResolvedValueOnce({ data: null, error: { message: 'Room not found' } });
      mockEq.mockReturnThis();
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Room not found' } });

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

      mockFrom.mockReturnValueOnce(mockSupabase);
      mockInsert.mockResolvedValueOnce({ data: [mockDecoration], error: null });
      mockSelect.mockReturnValueOnce(mockSupabase);
      mockSingle.mockResolvedValueOnce({ data: mockDecoration, error: null });

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