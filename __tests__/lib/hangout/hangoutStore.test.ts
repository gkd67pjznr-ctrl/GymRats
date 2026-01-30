// __tests__/lib/hangout/hangoutStore.test.ts
// Tests for hangout store

import { useHangoutStore } from '../../../src/lib/hangout/hangoutStore';

// Mock the hangout repository
jest.mock('../../../src/lib/hangout/hangoutRepository', () => ({
  createHangoutRoom: jest.fn(),
  getHangoutRoom: jest.fn(),
  getUserHangoutRoom: jest.fn(),
  addDecoration: jest.fn(),
  getRoomDecorations: jest.fn(),
  updateUserPresence: jest.fn(),
  getRoomUserPresences: jest.fn(),
}));

// Mock auth store
jest.mock('../../../src/lib/stores/authStore', () => ({
  getUser: jest.fn(),
}));

describe('hangoutStore', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset store state
    useHangoutStore.setState({
      currentRoom: null,
      decorations: [],
      userPresences: [],
      hydrated: false,
      loading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useHangoutStore.getState();

      expect(state.currentRoom).toBeNull();
      expect(state.decorations).toEqual([]);
      expect(state.userPresences).toEqual([]);
      expect(state.hydrated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('createRoom', () => {
    it('should create room successfully', async () => {
      const mockRoom = {
        id: 'room123',
        ownerId: 'user123',
        name: 'Test Room',
        theme: 'default',
        members: ['user123'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const { createHangoutRoom } = require('../../../src/lib/hangout/hangoutRepository');
      createHangoutRoom.mockResolvedValue({ success: true, data: mockRoom });

      const { getUser } = require('../../../src/lib/stores/authStore');
      getUser.mockReturnValue({ id: 'user123' });

      const result = await useHangoutStore.getState().createRoom('Test Room', 'default');

      expect(result).toBe(true);
      expect(useHangoutStore.getState().currentRoom).toEqual(mockRoom);
      expect(createHangoutRoom).toHaveBeenCalledWith('user123', 'Test Room', 'default');
    });

    it('should handle error when creating room', async () => {
      const { createHangoutRoom } = require('../../../src/lib/hangout/hangoutRepository');
      createHangoutRoom.mockResolvedValue({ success: false, error: 'Failed to create' });

      const { getUser } = require('../../../src/lib/stores/authStore');
      getUser.mockReturnValue({ id: 'user123' });

      const result = await useHangoutStore.getState().createRoom('Test Room', 'default');

      expect(result).toBe(false);
      expect(useHangoutStore.getState().error).toBe('Failed to create');
    });
  });

  describe('loadUserRoom', () => {
    it('should load user room successfully', async () => {
      const mockRoom = {
        id: 'room123',
        ownerId: 'user123',
        name: 'Test Room',
        theme: 'default',
        members: ['user123'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const { getUserHangoutRoom, getHangoutRoom, getRoomDecorations, getRoomUserPresences } =
        require('../../../src/lib/hangout/hangoutRepository');

      getUserHangoutRoom.mockResolvedValue({ success: true, data: mockRoom });
      getHangoutRoom.mockResolvedValue({ success: true, data: mockRoom });
      getRoomDecorations.mockResolvedValue({ success: true, data: [] });
      getRoomUserPresences.mockResolvedValue({ success: true, data: [] });

      const { getUser } = require('../../../src/lib/stores/authStore');
      getUser.mockReturnValue({ id: 'user123' });

      const result = await useHangoutStore.getState().loadUserRoom();

      expect(result).toBe(true);
      expect(useHangoutStore.getState().currentRoom).toEqual(mockRoom);
    });

    it('should handle user with no room', async () => {
      const { getUserHangoutRoom } = require('../../../src/lib/hangout/hangoutRepository');
      getUserHangoutRoom.mockResolvedValue({ success: true, data: undefined });

      const { getUser } = require('../../../src/lib/stores/authStore');
      getUser.mockReturnValue({ id: 'user123' });

      const result = await useHangoutStore.getState().loadUserRoom();

      expect(result).toBe(true);
      expect(useHangoutStore.getState().currentRoom).toBeNull();
    });
  });
});