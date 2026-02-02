// src/lib/hangout/__tests__/presenceTracker.test.ts
// Unit tests for presence tracker with mocked Supabase realtime

import { useHangoutStore } from '../hangoutStore';
import {
  subscribeToRoomPresence,
  subscribeToRoomDecorations,
  getCurrentUserPresence,
  getRoomPresences,
  isUserWorkingOut,
  getUserActivity,
} from '../presenceTracker';
import { supabase } from '../../supabase/client';
import { act, renderHook } from '@testing-library/react-native';

// Mock Supabase client
jest.mock('../../supabase/client');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(undefined)),
  removeItem: jest.fn(() => Promise.resolve(undefined)),
}));

describe('presenceTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store
    useHangoutStore.getState().clearRoom();
    useHangoutStore.getState().setHydrated(false);
  });

  describe('subscribeToRoomPresence', () => {
    it('should subscribe to presence changes for a room', () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
      };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      const cleanup = subscribeToRoomPresence('room-123');

      expect(supabase.channel).toHaveBeenCalledWith('room_presence:room-123');
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_presence',
          filter: 'room_id=eq.room-123',
        },
        expect.any(Function)
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(typeof cleanup).toBe('function');
    });

    it('should subscribe to INSERT events', () => {
      let insertHandler: ((payload: any) => void) | undefined;

      const mockChannel = {
        on: jest.fn().mockImplementation((event, config, callback) => {
          if (config?.event === 'INSERT') {
            insertHandler = callback;
          }
          return mockChannel;
        }),
        subscribe: jest.fn().mockImplementation((callback) => {
          // Simulate successful subscription
          callback?.('SUBSCRIBED');
          return mockChannel;
        }),
      };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      subscribeToRoomPresence('room-123');

      // Simulate INSERT event
      act(() => {
        insertHandler?.({
          new: {
            id: 'presence-1',
            user_id: 'user-123',
            room_id: 'room-123',
            status: 'online',
            activity: 'Available',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
        });
      });

      const state = useHangoutStore.getState();
      expect(state.userPresences).toHaveLength(1);
      expect(state.userPresences[0]).toEqual({
        id: 'presence-1',
        userId: 'user-123',
        roomId: 'room-123',
        status: 'online',
        activity: 'Available',
        updatedAt: expect.any(Number),
        createdAt: expect.any(Number),
      });
    });

    it('should subscribe to UPDATE events', () => {
      let updateHandler: ((payload: any) => void) | undefined;

      const mockChannel = {
        on: jest.fn().mockImplementation((event, config, callback) => {
          if (config?.event === 'UPDATE') {
            updateHandler = callback;
          }
          return mockChannel;
        }),
        subscribe: jest.fn().mockReturnThis(),
      };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      // Set initial presence
      useHangoutStore.setState({
        userPresences: [{
          id: 'presence-1',
          userId: 'user-123',
          roomId: 'room-123',
          status: 'online' as const,
          activity: 'Available',
          updatedAt: Date.now(),
          createdAt: Date.now(),
        }],
      });

      subscribeToRoomPresence('room-123');

      // Simulate UPDATE event
      act(() => {
        updateHandler?.({
          new: {
            id: 'presence-1',
            user_id: 'user-123',
            room_id: 'room-123',
            status: 'working_out',
            activity: 'Bench pressing',
            updated_at: '2024-01-01T01:00:00.000Z',
          },
        });
      });

      const state = useHangoutStore.getState();
      expect(state.userPresences).toHaveLength(1);
      expect(state.userPresences[0].status).toBe('working_out');
      expect(state.userPresences[0].activity).toBe('Bench pressing');
    });

    it('should subscribe to DELETE events', () => {
      let deleteHandler: ((payload: any) => void) | undefined;

      const mockChannel = {
        on: jest.fn().mockImplementation((event, config, callback) => {
          if (config?.event === 'DELETE') {
            deleteHandler = callback;
          }
          return mockChannel;
        }),
        subscribe: jest.fn().mockReturnThis(),
      };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      // Set initial presence
      useHangoutStore.setState({
        userPresences: [{
          id: 'presence-1',
          userId: 'user-123',
          roomId: 'room-123',
          status: 'online' as const,
          activity: 'Available',
          updatedAt: Date.now(),
          createdAt: Date.now(),
        }],
      });

      subscribeToRoomPresence('room-123');

      // Simulate DELETE event
      act(() => {
        deleteHandler?.({
          old: {
            user_id: 'user-123',
          },
        });
      });

      const state = useHangoutStore.getState();
      expect(state.userPresences).toHaveLength(0);
    });

    it('should cleanup subscription when calling cleanup function', () => {
      const mockUnsubscribe = jest.fn();
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: mockUnsubscribe,
      };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      const cleanup = subscribeToRoomPresence('room-123');
      cleanup();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle CHANNEL_ERROR status', () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockImplementation((callback) => {
          callback?.('CHANNEL_ERROR');
          return mockChannel;
        }),
      };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      subscribeToRoomPresence('room-123');

      // Should log error but not throw
      expect(supabase.channel).toHaveBeenCalledWith('room_presence:room-123');
    });

    it('should handle TIMED_OUT status', () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockImplementation((callback) => {
          callback?.('TIMED_OUT');
          return mockChannel;
        }),
      };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      subscribeToRoomPresence('room-123');

      // Should log error but not throw
      expect(supabase.channel).toHaveBeenCalledWith('room_presence:room-123');
    });
  });

  describe('subscribeToRoomDecorations', () => {
    it('should subscribe to decoration changes for a room', () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
      };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      const cleanup = subscribeToRoomDecorations('room-123');

      expect(supabase.channel).toHaveBeenCalledWith('room_decorations:room-123');
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_decorations',
          filter: 'room_id=eq.room-123',
        },
        expect.any(Function)
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(typeof cleanup).toBe('function');
    });

    it('should handle decoration INSERT events', () => {
      let insertHandler: ((payload: any) => void) | undefined;

      const mockChannel = {
        on: jest.fn().mockImplementation((event, config, callback) => {
          if (config?.event === 'INSERT') {
            insertHandler = callback;
          }
          return mockChannel;
        }),
        subscribe: jest.fn().mockReturnThis(),
      };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      subscribeToRoomDecorations('room-123');

      // Simulate INSERT event
      act(() => {
        insertHandler?.({
          new: {
            id: 'deco-1',
            room_id: 'room-123',
            item_id: 'chair_001',
            item_type: 'furniture',
            position_x: 100,
            position_y: 100,
            contributed_by: 'user-123',
            approved: true,
            created_at: '2024-01-01T00:00:00.000Z',
          },
        });
      });

      const state = useHangoutStore.getState();
      expect(state.decorations).toHaveLength(1);
      expect(state.decorations[0]).toEqual({
        id: 'deco-1',
        roomId: 'room-123',
        itemId: 'chair_001',
        itemType: 'furniture',
        position: { x: 100, y: 100 },
        contributedBy: 'user-123',
        approved: true,
        createdAt: expect.any(Number),
      });
    });

    it('should handle decoration UPDATE events', () => {
      let updateHandler: ((payload: any) => void) | undefined;

      const mockChannel = {
        on: jest.fn().mockImplementation((event, config, callback) => {
          if (config?.event === 'UPDATE') {
            updateHandler = callback;
          }
          return mockChannel;
        }),
        subscribe: jest.fn().mockReturnThis(),
      };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      // Set initial decoration
      useHangoutStore.setState({
        decorations: [{
          id: 'deco-1',
          roomId: 'room-123',
          itemId: 'chair_001',
          itemType: 'furniture' as const,
          position: { x: 100, y: 100 },
          contributedBy: 'user-123',
          approved: true,
          createdAt: Date.now(),
        }],
      });

      subscribeToRoomDecorations('room-123');

      // Simulate UPDATE event (position change)
      act(() => {
        updateHandler?.({
          new: {
            id: 'deco-1',
            room_id: 'room-123',
            item_id: 'chair_001',
            item_type: 'furniture',
            position_x: 200,
            position_y: 200,
            contributed_by: 'user-123',
            approved: false,
            created_at: '2024-01-01T00:00:00.000Z',
          },
        });
      });

      const state = useHangoutStore.getState();
      expect(state.decorations).toHaveLength(1);
      expect(state.decorations[0].position).toEqual({ x: 200, y: 200 });
      expect(state.decorations[0].approved).toBe(false);
    });

    it('should handle decoration DELETE events', () => {
      let deleteHandler: ((payload: any) => void) | undefined;

      const mockChannel = {
        on: jest.fn().mockImplementation((event, config, callback) => {
          if (config?.event === 'DELETE') {
            deleteHandler = callback;
          }
          return mockChannel;
        }),
        subscribe: jest.fn().mockReturnThis(),
      };

      (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

      // Set initial decoration
      useHangoutStore.setState({
        decorations: [{
          id: 'deco-1',
          roomId: 'room-123',
          itemId: 'chair_001',
          itemType: 'furniture' as const,
          position: { x: 100, y: 100 },
          contributedBy: 'user-123',
          approved: true,
          createdAt: Date.now(),
        }],
      });

      subscribeToRoomDecorations('room-123');

      // Simulate DELETE event
      act(() => {
        deleteHandler?.({
          old: {
            id: 'deco-1',
          },
        });
      });

      const state = useHangoutStore.getState();
      expect(state.decorations).toHaveLength(0);
    });
  });

  describe('getCurrentUserPresence', () => {
    it('should return presence for a user in a room', () => {
      const mockPresence = {
        id: 'presence-1',
        userId: 'user-123',
        roomId: 'room-123',
        status: 'online' as const,
        activity: 'Available',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      };

      useHangoutStore.setState({
        userPresences: [mockPresence],
      });

      const result = getCurrentUserPresence('user-123', 'room-123');

      expect(result).toEqual(mockPresence);
    });

    it('should return null when user not in room', () => {
      const mockPresence = {
        id: 'presence-1',
        userId: 'other-user',
        roomId: 'room-123',
        status: 'online' as const,
        activity: 'Available',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      };

      useHangoutStore.setState({
        userPresences: [mockPresence],
      });

      const result = getCurrentUserPresence('user-123', 'room-123');

      expect(result).toBeNull();
    });

    it('should return null when no presences exist', () => {
      useHangoutStore.setState({
        userPresences: [],
      });

      const result = getCurrentUserPresence('user-123', 'room-123');

      expect(result).toBeNull();
    });
  });

  describe('getRoomPresences', () => {
    it('should return all presences for a room', () => {
      const mockPresences = [
        {
          id: 'presence-1',
          userId: 'user-123',
          roomId: 'room-123',
          status: 'online' as const,
          activity: 'Available',
          updatedAt: Date.now(),
          createdAt: Date.now(),
        },
        {
          id: 'presence-2',
          userId: 'user-456',
          roomId: 'room-123',
          status: 'working_out' as const,
          activity: 'Bench pressing',
          updatedAt: Date.now(),
          createdAt: Date.now(),
        },
        {
          id: 'presence-3',
          userId: 'user-789',
          roomId: 'room-456', // Different room
          status: 'online' as const,
          activity: 'Available',
          updatedAt: Date.now(),
          createdAt: Date.now(),
        },
      ];

      useHangoutStore.setState({
        userPresences: mockPresences,
      });

      const result = getRoomPresences('room-123');

      expect(result).toHaveLength(2);
      expect(result.every(p => p.roomId === 'room-123')).toBe(true);
    });

    it('should return empty array when no presences for room', () => {
      useHangoutStore.setState({
        userPresences: [{
          id: 'presence-1',
          userId: 'user-123',
          roomId: 'other-room',
          status: 'online' as const,
          activity: 'Available',
          updatedAt: Date.now(),
          createdAt: Date.now(),
        }],
      });

      const result = getRoomPresences('room-123');

      expect(result).toEqual([]);
    });
  });

  describe('isUserWorkingOut', () => {
    it('should return true when user is working out', () => {
      useHangoutStore.setState({
        userPresences: [{
          id: 'presence-1',
          userId: 'user-123',
          roomId: 'room-123',
          status: 'working_out' as const,
          activity: 'Bench pressing',
          updatedAt: Date.now(),
          createdAt: Date.now(),
        }],
      });

      const result = isUserWorkingOut('user-123', 'room-123');

      expect(result).toBe(true);
    });

    it('should return false when user is not working out', () => {
      useHangoutStore.setState({
        userPresences: [{
          id: 'presence-1',
          userId: 'user-123',
          roomId: 'room-123',
          status: 'online' as const,
          activity: 'Available',
          updatedAt: Date.now(),
          createdAt: Date.now(),
        }],
      });

      const result = isUserWorkingOut('user-123', 'room-123');

      expect(result).toBe(false);
    });

    it('should return false when user has no presence', () => {
      useHangoutStore.setState({
        userPresences: [],
      });

      const result = isUserWorkingOut('user-123', 'room-123');

      expect(result).toBe(false);
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity string', () => {
      useHangoutStore.setState({
        userPresences: [{
          id: 'presence-1',
          userId: 'user-123',
          roomId: 'room-123',
          status: 'working_out' as const,
          activity: 'Bench pressing',
          updatedAt: Date.now(),
          createdAt: Date.now(),
        }],
      });

      const result = getUserActivity('user-123', 'room-123');

      expect(result).toBe('Bench pressing');
    });

    it('should return undefined when user has no presence', () => {
      useHangoutStore.setState({
        userPresences: [],
      });

      const result = getUserActivity('user-123', 'room-123');

      expect(result).toBeUndefined();
    });

    it('should return undefined when presence has no activity', () => {
      useHangoutStore.setState({
        userPresences: [{
          id: 'presence-1',
          userId: 'user-123',
          roomId: 'room-123',
          status: 'online' as const,
          activity: undefined,
          updatedAt: Date.now(),
          createdAt: Date.now(),
        }],
      });

      const result = getUserActivity('user-123', 'room-123');

      expect(result).toBeUndefined();
    });
  });
});
