// src/lib/auth/__tests__/oauth.test.ts
// Tests for OAuth helper utilities

import {
  createOAuthError,
  parseOAuthError,
  getOAuthErrorMessage,
  decodeIdToken,
  extractGoogleProfile,
  extractAppleProfile,
  validateOAuthConfig,
  isOAuthProviderAvailable,
  type OAuthError,
} from '../oauth';

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      googleClientId: 'test-google-client-id',
    },
  },
}));

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithIdToken: jest.fn(),
      signOut: jest.fn(),
    },
  })),
}));

describe('OAuth Helper Utilities', () => {
  describe('createOAuthError', () => {
    it('should create an OAuth error with correct structure', () => {
      const error = createOAuthError('cancelled', 'Sign in was cancelled');

      expect(error).toEqual({
        type: 'cancelled',
        message: 'Sign in was cancelled',
        originalError: undefined,
      });
    });

    it('should include original error when provided', () => {
      const originalError = new Error('Network failure');
      const error = createOAuthError('network', 'Network error', originalError);

      expect(error.originalError).toBe(originalError);
    });
  });

  describe('parseOAuthError', () => {
    it('should parse cancellation errors', () => {
      const error = new Error('User cancelled the request');
      const result = parseOAuthError(error);

      expect(result.type).toBe('cancelled');
      expect(result.message).toContain('cancelled');
    });

    it('should parse network errors', () => {
      const error = new Error('Network connection failed');
      const result = parseOAuthError(error);

      expect(result.type).toBe('network');
      expect(result.message).toContain('Network');
    });

    it('should parse invalid token errors', () => {
      const error = new Error('Invalid token provided');
      const result = parseOAuthError(error);

      expect(result.type).toBe('invalid_token');
      expect(result.message).toContain('token');
    });

    it('should handle generic errors', () => {
      const error = new Error('Some unknown error');
      const result = parseOAuthError(error);

      expect(result.type).toBe('provider_error');
      expect(result.message).toBe('Some unknown error');
    });

    it('should handle non-Error objects', () => {
      const result = parseOAuthError('string error');

      expect(result.type).toBe('unknown');
    });
  });

  describe('getOAuthErrorMessage', () => {
    it('should return user-friendly message for cancelled errors', () => {
      const error: OAuthError = {
        type: 'cancelled',
        message: 'Cancelled by user',
      };
      expect(getOAuthErrorMessage(error)).toBe('Sign in was cancelled.');
    });

    it('should return user-friendly message for network errors', () => {
      const error: OAuthError = {
        type: 'network',
        message: 'Network failed',
      };
      expect(getOAuthErrorMessage(error)).toContain('Network');
    });

    it('should return user-friendly message for invalid token errors', () => {
      const error: OAuthError = {
        type: 'invalid_token',
        message: 'Invalid token',
      };
      expect(getOAuthErrorMessage(error)).toContain('token');
    });

    it('should return provider error message', () => {
      const error: OAuthError = {
        type: 'provider_error',
        message: 'Provider unavailable',
      };
      expect(getOAuthErrorMessage(error)).toContain('Provider error');
    });

    it('should return Supabase error message', () => {
      const error: OAuthError = {
        type: 'supabase_error',
        message: 'Supabase failed',
      };
      expect(getOAuthErrorMessage(error)).toContain('Authentication error');
    });
  });

  describe('decodeIdToken', () => {
    it('should decode a valid JWT token', () => {
      // Create a mock JWT (header.payload.signature)
      const payload = JSON.stringify({
        sub: 'user123',
        email: 'test@example.com',
        email_verified: true,
      });
      const base64Payload = btoa(payload)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Payload}.signature`;

      const decoded = decodeIdToken(mockToken);

      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe('user123');
      expect(decoded?.email).toBe('test@example.com');
      expect(decoded?.email_verified).toBe(true);
    });

    it('should return null for invalid JWT format', () => {
      const invalidToken = 'not-a-jwt';
      const decoded = decodeIdToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('should return null for malformed JWT', () => {
      const malformedToken = 'only.two.parts';
      const decoded = decodeIdToken(malformedToken);

      expect(decoded).toBeNull();
    });

    it('should handle base64url encoded payload correctly', () => {
      const payload = { sub: '123', email: 'test@test.com' };
      const jsonPayload = JSON.stringify(payload);
      const base64Url = btoa(jsonPayload)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const token = `header.${base64Url}.sig`;
      const decoded = decodeIdToken(token);

      expect(decoded).toEqual(payload);
    });
  });

  describe('extractGoogleProfile', () => {
    it('should extract user profile from Google ID token', () => {
      const payload = {
        sub: 'google-user-123',
        email: 'google@example.com',
        email_verified: true,
        name: 'John Doe',
        picture: 'https://example.com/avatar.jpg',
      };
      const base64Payload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const mockToken = `header.${base64Payload}.signature`;
      const profile = extractGoogleProfile(mockToken);

      expect(profile).not.toBeNull();
      expect(profile?.id).toBe('google-user-123');
      expect(profile?.email).toBe('google@example.com');
      expect(profile?.emailVerified).toBe(true);
      expect(profile?.name).toBe('John Doe');
      expect(profile?.picture).toBe('https://example.com/avatar.jpg');
    });

    it('should construct name from given and family name', () => {
      const payload = {
        sub: '123',
        email: 'test@example.com',
        email_verified: true,
        given_name: 'Jane',
        family_name: 'Smith',
      };
      const base64Payload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const mockToken = `header.${base64Payload}.signature`;
      const profile = extractGoogleProfile(mockToken);

      expect(profile?.name).toBe('Jane Smith');
    });

    it('should handle missing name fields', () => {
      const payload = {
        sub: '123',
        email: 'test@example.com',
        email_verified: true,
      };
      const base64Payload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const mockToken = `header.${base64Payload}.signature`;
      const profile = extractGoogleProfile(mockToken);

      expect(profile?.name).toBeUndefined();
    });

    it('should return null for invalid token', () => {
      const profile = extractGoogleProfile('invalid-token');
      expect(profile).toBeNull();
    });
  });

  describe('extractAppleProfile', () => {
    it('should extract user profile from Apple ID token', () => {
      const payload = {
        sub: 'apple-user-123',
        email: 'apple@example.com',
        email_verified: 'true',
      };
      const base64Payload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const mockToken = `header.${base64Payload}.signature`;
      const profile = extractAppleProfile(mockToken, 'apple@example.com', {
        firstName: 'John',
        lastName: 'Appleseed',
      });

      expect(profile).not.toBeNull();
      expect(profile?.id).toBe('apple-user-123');
      expect(profile?.email).toBe('apple@example.com');
      expect(profile?.emailVerified).toBe(true);
      expect(profile?.name).toBe('John Appleseed');
    });

    it('should use email from token when userEmail not provided', () => {
      const payload = {
        sub: '123',
        email: 'token@example.com',
        email_verified: 'true',
      };
      const base64Payload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const mockToken = `header.${base64Payload}.signature`;
      const profile = extractAppleProfile(mockToken);

      expect(profile?.email).toBe('token@example.com');
    });

    it('should handle missing email gracefully', () => {
      const payload = {
        sub: '123',
        email_verified: 'false',
      };
      const base64Payload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const mockToken = `header.${base64Payload}.signature`;
      const profile = extractAppleProfile(mockToken);

      expect(profile?.email).toBe('');
    });

    it('should return null for invalid token', () => {
      const profile = extractAppleProfile('invalid-token');
      expect(profile).toBeNull();
    });
  });

  describe('validateOAuthConfig', () => {
    it('should validate correct Google config', () => {
      const config = {
        provider: 'google' as const,
        clientId: 'google-client-id',
        redirectUri: 'https://example.com/auth',
        discoveryUrl: 'https://accounts.google.com/.well-known/openid-configuration',
      };

      expect(() => validateOAuthConfig(config)).not.toThrow();
      expect(validateOAuthConfig(config)).toBe(true);
    });

    it('should validate correct Apple config', () => {
      const config = {
        provider: 'apple' as const,
        clientId: 'apple-client-id',
        redirectUri: 'https://example.com/auth',
      };

      expect(() => validateOAuthConfig(config)).not.toThrow();
      expect(validateOAuthConfig(config)).toBe(true);
    });

    it('should throw when clientId is missing', () => {
      const config = {
        provider: 'google' as const,
        clientId: '',
        redirectUri: 'https://example.com/auth',
        discoveryUrl: 'https://example.com',
      };

      expect(() => validateOAuthConfig(config)).toThrow('client ID');
    });

    it('should throw when redirectUri is missing', () => {
      const config = {
        provider: 'google' as const,
        clientId: 'client-id',
        redirectUri: '',
        discoveryUrl: 'https://example.com',
      };

      expect(() => validateOAuthConfig(config)).toThrow('redirect URI');
    });

    it('should throw when Google discoveryUrl is missing', () => {
      const config = {
        provider: 'google' as const,
        clientId: 'client-id',
        redirectUri: 'https://example.com/auth',
      };

      expect(() => validateOAuthConfig(config)).toThrow('discovery');
    });
  });

  describe('isOAuthProviderAvailable', () => {
    it('should return true for Google provider', () => {
      expect(isOAuthProviderAvailable('google')).toBe(true);
    });

    it('should return true for Apple provider', () => {
      expect(isOAuthProviderAvailable('apple')).toBe(true);
    });
  });
});
