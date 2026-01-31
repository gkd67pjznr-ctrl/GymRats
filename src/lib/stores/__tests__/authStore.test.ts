// src/lib/stores/__tests__/authStore.test.ts
// Tests for authStore - Zustand authentication store with Supabase integration

import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  useAuthStore,
  setupAuthListener,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  useAuth,
  selectUser,
  selectSession,
  selectIsHydrated,
  selectLoading,
  selectError,
  selectIsAuthenticated,
  getUser,
  getSession,
  isAuthenticated,
} from '../authStore';
import type { DatabaseUser } from '../../supabase/types';

// Helper to convert DatabaseUser to UserProfile format
function toUserProfile(dbUser: DatabaseUser) {
  return {
    id: dbUser.id,
    email: dbUser.email,
    displayName: dbUser.display_name,
    avatarUrl: dbUser.avatar_url,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    subscriptionTier: (dbUser as any).subscription_tier || 'basic',
    avatarArtStyle: (dbUser as any).avatar_art_style || null,
    avatarGrowthStage: (dbUser as any).avatar_growth_stage || null,
    avatarHeightScale: (dbUser as any).avatar_height_scale || null,
    avatarCosmetics: (dbUser as any).avatar_cosmetics || null,
    totalVolumeKg: (dbUser as any).total_volume_kg || null,
    totalSets: (dbUser as any).total_sets || null,
    hangoutRoomId: (dbUser as any).hangout_room_id || null,
    hangoutRoomRole: (dbUser as any).hangout_room_role || null,
  };
}

// Mock supabase client
jest.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('authStore', () => {
  // Mock database user response (with all new UserProfile fields)
  const mockDatabaseUser: DatabaseUser = {
    id: 'user-123',
    email: 'test@example.com',
    display_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    subscription_tier: 'basic',
    avatar_art_style: null,
    avatar_growth_stage: null,
    avatar_height_scale: null,
    avatar_cosmetics: null,
    total_volume_kg: null,
    total_sets: null,
    hangout_room_id: null,
    hangout_room_role: null,
  };

  // Helper to reset store state
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      session: null,
      hydrated: false,
      loading: true,
      error: null,
    });
  });

  // Helper function to create supabase chain mock
  function createSupabaseChainMock(data: any, error: any) {
    return {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({ data, error })),
        })),
      })),
    };
  }

  describe('signUp', () => {
    const { supabase } = require('../../supabase/client');

    it('should call supabase.auth.signUp with correct parameters', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      supabase.from.mockReturnValue(createSupabaseChainMock(mockDatabaseUser, null));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signUp('test@example.com', 'password123', 'Test User');
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            display_name: 'Test User',
          },
        },
      });
    });

    it('should successfully sign up and fetch user profile', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
          session: { access_token: 'token-123' },
        },
        error: null,
      });

      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockDatabaseUser,
              error: null,
            })),
          })),
        })),
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signUp('test@example.com', 'password123', 'Test User');
      });

      expect(result.current.user).toEqual(
        expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          avatarUrl: 'https://example.com/avatar.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        })
      );
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fallback to auth metadata when profile fetch fails', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: 'user-456',
            email: 'fallback@example.com',
            user_metadata: { display_name: 'Fallback User', avatar_url: null },
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          session: { access_token: 'token-456' },
        },
        error: null,
      });

      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Profile not found' },
            })),
          })),
        })),
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signUp('fallback@example.com', 'password123', 'Fallback User');
      });

      expect(result.current.user).toEqual(
        expect.objectContaining({
          id: 'user-456',
          email: 'fallback@example.com',
          displayName: 'Fallback User',
          avatarUrl: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
      expect(result.current.loading).toBe(false);
    });

    it('should handle email already exists error', async () => {
      const authError = { message: 'Email already exists' };
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: authError,
      });

      const { result } = renderHook(() => useAuthStore());

      let response;
      await act(async () => {
        response = await result.current.signUp('existing@example.com', 'password123', 'Test User');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Email already exists');
      expect(result.current.loading).toBe(false);
      expect(response).toEqual({ success: false, error: 'Email already exists' });
    });

    it('should handle network errors', async () => {
      supabase.auth.signUp.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStore());

      let response;
      await act(async () => {
        response = await result.current.signUp('test@example.com', 'password123', 'Test User');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
      expect(response).toEqual({ success: false, error: 'Network error' });
    });

    it('should handle validation errors', async () => {
      const validationError = { message: 'Invalid email format' };
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: validationError,
      });

      const { result } = renderHook(() => useAuthStore());

      let response;
      await act(async () => {
        response = await result.current.signUp('invalid-email', 'password123', 'Test User');
      });

      expect(result.current.error).toBe('Invalid email format');
      expect(response).toEqual({ success: false, error: 'Invalid email format' });
    });

    it('should set loading to true during signUp', async () => {
      supabase.auth.signUp.mockImplementation(
        () => new Promise(resolve => setTimeout(() =>
          resolve({ data: { user: { id: '123' } }, error: null }), 10))
      );

      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockDatabaseUser,
              error: null,
            })),
          })),
        })),
      });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.signUp('test@example.com', 'password123', 'Test User');
      });

      expect(result.current.loading).toBe(true);
    });
  });

  describe('signIn', () => {
    const { supabase } = require('../../supabase/client');

    it('should successfully sign in and fetch user profile', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
          session: { access_token: 'token-123' },
        },
        error: null,
      });

      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockDatabaseUser,
              error: null,
            })),
          })),
        })),
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(
        expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          avatarUrl: 'https://example.com/avatar.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        })
      );
      expect(result.current.session).toEqual({ access_token: 'token-123' });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle invalid credentials error', async () => {
      const authError = { message: 'Invalid login credentials' };
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      const { result } = renderHook(() => useAuthStore());

      let response;
      await act(async () => {
        response = await result.current.signIn('test@example.com', 'wrong-password');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Invalid login credentials');
      expect(result.current.loading).toBe(false);
      expect(response).toEqual({ success: false, error: 'Invalid login credentials' });
    });

    it('should handle user not found error', async () => {
      const authError = { message: 'User not found' };
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      const { result } = renderHook(() => useAuthStore());

      let response;
      await act(async () => {
        response = await result.current.signIn('nonexistent@example.com', 'password123');
      });

      expect(result.current.error).toBe('User not found');
      expect(response).toEqual({ success: false, error: 'User not found' });
    });

    it('should fallback to auth metadata when profile fetch fails', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: 'user-789',
            email: 'fallback@example.com',
            user_metadata: { display_name: 'Fallback User', avatar_url: null },
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          session: { access_token: 'token-789' },
        },
        error: null,
      });

      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Profile not found' },
            })),
          })),
        })),
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.signIn('fallback@example.com', 'password123');
      });

      expect(result.current.user).toEqual(
        expect.objectContaining({
          id: 'user-789',
          email: 'fallback@example.com',
          displayName: 'Fallback User',
          avatarUrl: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        })
      );
      expect(result.current.loading).toBe(false);
    });

    it('should set loading to true during signIn', async () => {
      supabase.auth.signInWithPassword.mockImplementation(
        () => new Promise(resolve => setTimeout(() =>
          resolve({ data: { user: { id: '123' } }, error: null }), 10))
      );

      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockDatabaseUser,
              error: null,
            })),
          })),
        })),
      });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.signIn('test@example.com', 'password123');
      });

      expect(result.current.loading).toBe(true);
    });
  });

  describe('signOut', () => {
    const { supabase } = require('../../supabase/client');

    it('should sign out and clear store state', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      // Set initial authenticated state
      useAuthStore.setState({
        user: toUserProfile(mockDatabaseUser) as any,
        session: { access_token: 'token' } as any,
        hydrated: true,
        loading: false,
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signOut();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should still clear state when supabase signOut throws', async () => {
      // Mock signOut to throw an error
      supabase.auth.signOut.mockImplementation(() => {
        throw new Error('Sign out failed');
      });

      // Set initial authenticated state
      useAuthStore.setState({
        user: toUserProfile(mockDatabaseUser) as any,
        session: { access_token: 'token' } as any,
        hydrated: true,
        loading: false,
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signOut();
      });

      // State should still be cleared even if Supabase call fails
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('state management', () => {
    it('should clear error when clearError is called', () => {
      useAuthStore.setState({
        user: null,
        session: null,
        hydrated: false,
        loading: false,
        error: 'Some error',
      });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should set hydrated state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.hydrated).toBe(false);

      act(() => {
        result.current.setHydrated(true);
      });

      expect(result.current.hydrated).toBe(true);
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.loading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('auth state listener', () => {
    const { supabase } = require('../../supabase/client');

    it('should setup auth listener and return cleanup function', () => {
      const mockUnsubscribe = jest.fn();
      supabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const cleanup = setupAuthListener();

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(typeof cleanup).toBe('function');

      cleanup();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should call optional callback on auth state change', async () => {
      const mockCallback = jest.fn();
      const mockSession = { access_token: 'token-123', user: { id: 'user-123' } };

      supabase.auth.onAuthStateChange.mockImplementation((callback) => {
        callback('INITIAL_SESSION', mockSession);
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        };
      });

      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockDatabaseUser,
              error: null,
            })),
          })),
        })),
      });

      setupAuthListener(mockCallback);

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith('INITIAL_SESSION', expect.any(Object));
      });
    });

    it('should update store state on INITIAL_SESSION event', async () => {
      const mockSession = {
        access_token: 'token-123',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: { display_name: 'Test User', avatar_url: null },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      };

      supabase.auth.onAuthStateChange.mockImplementation((callback) => {
        // Simulate async callback execution
        setTimeout(() => callback('INITIAL_SESSION', mockSession), 0);
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        };
      });

      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockDatabaseUser,
              error: null,
            })),
          })),
        })),
      });

      setupAuthListener();

      await waitFor(() => {
        const store = useAuthStore.getState();
        expect(store.hydrated).toBe(true);
        expect(store.loading).toBe(false);
        expect(store.session).toEqual(mockSession);
      });
    });

    it('should clear user and session on SIGNED_OUT event', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: toUserProfile(mockDatabaseUser) as any,
        session: { access_token: 'token' } as any,
        hydrated: true,
        loading: false,
        error: null,
      });

      supabase.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => callback('SIGNED_OUT', null), 0);
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        };
      });

      setupAuthListener();

      await waitFor(() => {
        const store = useAuthStore.getState();
        expect(store.user).toBeNull();
        expect(store.session).toBeNull();
      });
    });
  });

  describe('selectors and hooks', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: toUserProfile(mockDatabaseUser) as any,
        session: { access_token: 'token-123' } as any,
        hydrated: true,
        loading: false,
        error: null,
      });
    });

    it('selectUser should return user from state', () => {
      const state = useAuthStore.getState();
      expect(selectUser(state)).toEqual(
        expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          avatarUrl: 'https://example.com/avatar.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        })
      );
    });

    it('selectSession should return session from state', () => {
      const state = useAuthStore.getState();
      expect(selectSession(state)).toEqual({ access_token: 'token-123' });
    });

    it('selectIsHydrated should return hydrated state', () => {
      const state = useAuthStore.getState();
      expect(selectIsHydrated(state)).toBe(true);
    });

    it('selectLoading should return loading state', () => {
      useAuthStore.setState({ loading: true });
      const state = useAuthStore.getState();
      expect(selectLoading(state)).toBe(true);
    });

    it('selectError should return error from state', () => {
      useAuthStore.setState({ error: 'Test error' });
      const state = useAuthStore.getState();
      expect(selectError(state)).toBe('Test error');
    });

    it('selectIsAuthenticated should return true when user exists', () => {
      const state = useAuthStore.getState();
      expect(selectIsAuthenticated(state)).toBe(true);
    });

    it('selectIsAuthenticated should return false when user is null', () => {
      useAuthStore.setState({ user: null });
      const state = useAuthStore.getState();
      expect(selectIsAuthenticated(state)).toBe(false);
    });

    it('useUser hook should return user profile', () => {
      const { result } = renderHook(() => useUser());

      expect(result.current).toEqual(
        expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          avatarUrl: 'https://example.com/avatar.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        })
      );
    });
  });

  describe('imperative getters', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: toUserProfile(mockDatabaseUser) as any,
        session: { access_token: 'token-123' } as any,
        hydrated: true,
        loading: false,
        error: null,
      });
    });

    it('getUser should return current user', () => {
      const user = getUser();

      expect(user).toEqual(
        expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          avatarUrl: 'https://example.com/avatar.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        })
      );
    });

    it('getSession should return current session', () => {
      const session = getSession();

      expect(session).toEqual({ access_token: 'token-123' });
    });

    it('isAuthenticated should return true when user exists', () => {
      expect(isAuthenticated()).toBe(true);

      useAuthStore.setState({ user: null });
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('additional hooks', () => {
    it('useIsAuthenticated should return authentication status', () => {
      useAuthStore.setState({
        user: toUserProfile(mockDatabaseUser) as any,
        session: { access_token: 'token' } as any,
        hydrated: true,
        loading: false,
        error: null,
      });

      const { result } = renderHook(() => useIsAuthenticated());
      expect(result.current).toBe(true);
    });

    it('useAuthLoading should return loading state', () => {
      useAuthStore.setState({ loading: true });

      const { result } = renderHook(() => useAuthLoading());
      expect(result.current).toBe(true);
    });

    it('useAuthError should return error state', () => {
      useAuthStore.setState({ error: 'Test error' });

      const { result } = renderHook(() => useAuthError());
      expect(result.current).toBe('Test error');
    });

    it('useAuth should return full auth store', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('session');
      expect(result.current).toHaveProperty('signUp');
      expect(result.current).toHaveProperty('signIn');
      expect(result.current).toHaveProperty('signOut');
    });
  });
});
