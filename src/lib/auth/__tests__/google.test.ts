// src/lib/auth/__tests__/google.test.ts
// Tests for Google OAuth implementation

import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

import {
  isGoogleAuthAvailable,
  getGoogleOAuthUrl,
  handleGoogleOAuthCallback,
} from '../google';

// Mock dependencies
jest.mock('expo-constants', () => ({
  expoConfig: {
    scheme: 'forgerank',
    extra: {
      googleClientId: 'test-google-client-id.apps.googleusercontent.com',
    },
  },
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'forgerank://auth'),
  resolveDiscoveryAsync: jest.fn(),
  AuthRequest: jest.fn(),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  parse: jest.fn(),
}));

// Mock supabase
jest.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      signInWithIdToken: jest.fn(),
    },
  },
}));

describe('Google OAuth', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isGoogleAuthAvailable', () => {
    it('should return true on iOS', () => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('ios');
      expect(isGoogleAuthAvailable()).toBe(true);
    });

    it('should return true on Android', () => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('android');
      expect(isGoogleAuthAvailable()).toBe(true);
    });

    it('should return true on web', () => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('web');
      expect(isGoogleAuthAvailable()).toBe(true);
    });
  });

  describe('getGoogleOAuthUrl', () => {
    it('should generate correct OAuth URL with state', () => {
      const state = 'test-state-123';
      const url = getGoogleOAuthUrl(state);

      expect(url).toContain('accounts.google.com');
      expect(url).toContain('client_id=test-google-client-id');
      expect(url).toContain(`state=${state}`);
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=openid');
      expect(url).toContain('access_type=offline');
      expect(url).toContain('prompt=consent');
    });

    it('should generate OAuth URL with default state when not provided', () => {
      const url = getGoogleOAuthUrl();

      expect(url).toContain('state=');
      expect(url).toContain('client_id=');
    });

    it('should include required scopes', () => {
      const url = getGoogleOAuthUrl('state');

      expect(url).toContain('openid');
      expect(url).toContain('email');
      expect(url).toContain('profile');
    });

    it('should use the correct redirect URI', () => {
      const url = getGoogleOAuthUrl('state');

      expect(url).toContain('redirect_uri=');
    });
  });

  describe('handleGoogleOAuthCallback', () => {
    const { parse } = require('expo-linking');

    beforeEach(() => {
      parse.mockReturnValue({
        path: 'auth',
        queryParams: {},
      });
    });

    it('should return null for non-OAuth URLs', () => {
      parse.mockReturnValue({
        path: 'other',
        queryParams: {},
      });

      const result = handleGoogleOAuthCallback('forgerank://other');
      expect(result).toBeNull();
    });

    it('should handle access_denied error', () => {
      parse.mockReturnValue({
        path: 'auth',
        queryParams: {
          error: 'access_denied',
        },
      });

      const result = handleGoogleOAuthCallback('forgerank://auth?error=access_denied');

      expect(result).toEqual({
        success: false,
        error: {
          type: 'cancelled',
          message: 'Sign in was cancelled',
        },
      });
    });

    it('should handle successful auth with code', () => {
      parse.mockReturnValue({
        path: 'auth',
        queryParams: {
          code: 'auth-code-123',
        },
      });

      const result = handleGoogleOAuthCallback('forgerank://auth?code=auth-code-123');

      expect(result).toEqual({
        success: true,
      });
    });

    it('should handle callback URLs with query params', () => {
      parse.mockReturnValue({
        path: 'auth',
        queryParams: {
          code: 'test-code',
          state: 'test-state',
        },
      });

      const result = handleGoogleOAuthCallback('forgerank://auth?code=test-code&state=test-state');

      expect(result?.success).toBe(true);
    });

    it('should handle parse errors gracefully', () => {
      parse.mockImplementation(() => {
        throw new Error('Parse error');
      });

      const result = handleGoogleOAuthCallback('invalid-url');

      expect(result).toEqual({
        success: false,
        error: expect.objectContaining({
          type: expect.any(String),
        }),
      });
    });
  });

  describe('useGoogleAuth hook behavior', () => {
    it('should be defined as a function', () => {
      const { useGoogleAuth } = require('../google');
      expect(typeof useGoogleAuth).toBe('function');
    });

    it('should return an object with signInWithGoogle method', () => {
      const { useGoogleAuth } = require('../google');
      const hookResult = useGoogleAuth();

      expect(hookResult).toHaveProperty('signInWithGoogle');
      expect(typeof hookResult.signInWithGoogle).toBe('function');
    });
  });

  describe('signInWithSupabaseGoogle', () => {
    it('should be defined as a function', () => {
      const { signInWithSupabaseGoogle } = require('../google');
      expect(typeof signInWithSupabaseGoogle).toBe('function');
    });

    it('should return a promise', async () => {
      const { signInWithSupabaseGoogle } = require('../google');
      const result = signInWithSupabaseGoogle();

      expect(result).toBeInstanceOf(Promise);
    });
  });
});
