// src/lib/auth/__tests__/apple.test.ts
// Tests for Apple Sign In implementation

import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

import {
  isAppleAuthAvailable,
  parseAppleCredential,
  isRealUser,
  getRealUserStatusString,
  getAppleDisplayName,
  hasEmail,
  isFirstSignIn,
  useAppleAuth,
} from '../apple';

// Mock expo-apple-authentication
jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn(),
  AppleAuthenticationButton: 'Button',
  AppleAuthenticationButtonType: {
    SIGN_IN: 'SIGN_IN',
    CONTINUE: 'CONTINUE',
  },
  AppleAuthenticationStyle: {
    BLACK: 'BLACK',
    WHITE: 'WHITE',
    WHITE_OUTLINE: 'WHITE_OUTLINE',
  },
  AppleAuthenticationScope: {
    FULL_NAME: 'FULL_NAME',
    EMAIL: 'EMAIL',
  },
  AppleAuthenticationRealUserStatus: {
    UNSUPPORTED: 0,
    UNKNOWN: 1,
    LIKELY_REAL: 2,
  },
}));

// Mock supabase
jest.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      signInWithIdToken: jest.fn(),
    },
  },
}));

describe('Apple Sign In', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isAppleAuthAvailable', () => {
    it('should return true on iOS', () => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('ios');
      expect(isAppleAuthAvailable()).toBe(true);
    });

    it('should return true on macOS', () => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('macos');
      expect(isAppleAuthAvailable()).toBe(true);
    });

    it('should return false on Android', () => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('android');
      expect(isAppleAuthAvailable()).toBe(false);
    });

    it('should return false on web (without MSStream)', () => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('web');
      delete (window as any).MSStream;
      expect(isAppleAuthAvailable()).toBe(false);
    });
  });

  describe('parseAppleCredential', () => {
    const mockCredential: AppleAuthentication.AppleAuthenticationCredential = {
      user: 'apple-user-123',
      email: 'apple@example.com',
      fullName: {
        givenName: 'John',
        familyName: 'Appleseed',
      },
      authorizationCode: 'auth-code-123',
      identityToken: 'id-token-123',
      realUserStatus: AppleAuthentication.AppleAuthenticationRealUserStatus.LIKELY_REAL,
    };

    it('should parse Apple credential correctly', () => {
      const parsed = parseAppleCredential(mockCredential);

      expect(parsed.user).toBe('apple-user-123');
      expect(parsed.email).toBe('apple@example.com');
      expect(parsed.fullName).toEqual({
        givenName: 'John',
        familyName: 'Appleseed',
      });
      expect(parsed.authorizationCode).toBe('auth-code-123');
      expect(parsed.identityToken).toBe('id-token-123');
      expect(parsed.realUserStatus).toBe(
        AppleAuthentication.AppleAuthenticationRealUserStatus.LIKELY_REAL
      );
    });

    it('should handle null email', () => {
      const credential = {
        ...mockCredential,
        email: null,
      };
      const parsed = parseAppleCredential(credential);

      expect(parsed.email).toBeNull();
    });

    it('should handle null fullName', () => {
      const credential = {
        ...mockCredential,
        fullName: null,
      };
      const parsed = parseAppleCredential(credential);

      expect(parsed.fullName).toBeNull();
    });
  });

  describe('isRealUser', () => {
    it('should return true for LIKELY_REAL status', () => {
      const credential: AppleAuthentication.AppleAuthenticationCredential = {
        user: '123',
        email: 'test@example.com',
        fullName: null,
        authorizationCode: 'auth',
        identityToken: 'token',
        realUserStatus: AppleAuthentication.AppleAuthenticationRealUserStatus.LIKELY_REAL,
      };

      expect(isRealUser(credential)).toBe(true);
    });

    it('should return true for UNKNOWN status', () => {
      const credential: AppleAuthentication.AppleAuthenticationCredential = {
        user: '123',
        email: 'test@example.com',
        fullName: null,
        authorizationCode: 'auth',
        identityToken: 'token',
        realUserStatus: AppleAuthentication.AppleAuthenticationRealUserStatus.UNKNOWN,
      };

      expect(isRealUser(credential)).toBe(true);
    });

    it('should return true for UNSUPPORTED status', () => {
      const credential: AppleAuthentication.AppleAuthenticationCredential = {
        user: '123',
        email: 'test@example.com',
        fullName: null,
        authorizationCode: 'auth',
        identityToken: 'token',
        realUserStatus: AppleAuthentication.AppleAuthenticationRealUserStatus.UNSUPPORTED,
      };

      expect(isRealUser(credential)).toBe(true);
    });
  });

  describe('getRealUserStatusString', () => {
    it('should return correct string for UNSUPPORTED', () => {
      const status =
        AppleAuthentication.AppleAuthenticationRealUserStatus.UNSUPPORTED;
      expect(getRealUserStatusString(status)).toBe('Not supported (iOS 12 or earlier)');
    });

    it('should return correct string for UNKNOWN', () => {
      const status = AppleAuthentication.AppleAuthenticationRealUserStatus.UNKNOWN;
      expect(getRealUserStatusString(status)).toBe('Unknown (cannot determine)');
    });

    it('should return correct string for LIKELY_REAL', () => {
      const status =
        AppleAuthentication.AppleAuthenticationRealUserStatus.LIKELY_REAL;
      expect(getRealUserStatusString(status)).toBe('Likely a real user');
    });
  });

  describe('getAppleDisplayName', () => {
    it('should combine first and last name', () => {
      const fullName = {
        givenName: 'Jane',
        familyName: 'Doe',
      };

      expect(getAppleDisplayName(fullName)).toBe('Jane Doe');
    });

    it('should handle missing last name', () => {
      const fullName = {
        givenName: 'Madonna',
        familyName: undefined,
      };

      expect(getAppleDisplayName(fullName)).toBe('Madonna');
    });

    it('should handle missing first name', () => {
      const fullName = {
        givenName: undefined,
        familyName: 'Prince',
      };

      expect(getAppleDisplayName(fullName)).toBe('Prince');
    });

    it('should return undefined for null fullName', () => {
      expect(getAppleDisplayName(null)).toBeUndefined();
    });

    it('should return undefined for empty names', () => {
      const fullName = {
        givenName: '',
        familyName: '',
      };

      expect(getAppleDisplayName(fullName)).toBeUndefined();
    });
  });

  describe('hasEmail', () => {
    it('should return true when email is present', () => {
      const credential: AppleAuthentication.AppleAuthenticationCredential = {
        user: '123',
        email: 'test@example.com',
        fullName: null,
        authorizationCode: 'auth',
        identityToken: 'token',
        realUserStatus: 0,
      };

      expect(hasEmail(credential)).toBe(true);
    });

    it('should return false when email is null', () => {
      const credential: AppleAuthentication.AppleAuthenticationCredential = {
        user: '123',
        email: null,
        fullName: null,
        authorizationCode: 'auth',
        identityToken: 'token',
        realUserStatus: 0,
      };

      expect(hasEmail(credential)).toBe(false);
    });

    it('should return false when email is empty string', () => {
      const credential: AppleAuthentication.AppleAuthenticationCredential = {
        user: '123',
        email: '',
        fullName: null,
        authorizationCode: 'auth',
        identityToken: 'token',
        realUserStatus: 0,
      };

      expect(hasEmail(credential)).toBe(false);
    });
  });

  describe('isFirstSignIn', () => {
    it('should return true when email and fullName are present', () => {
      const credential: AppleAuthentication.AppleAuthenticationCredential = {
        user: '123',
        email: 'test@example.com',
        fullName: {
          givenName: 'John',
          familyName: 'Doe',
        },
        authorizationCode: 'auth',
        identityToken: 'token',
        realUserStatus: 0,
      };

      expect(isFirstSignIn(credential)).toBe(true);
    });

    it('should return false when email is missing', () => {
      const credential: AppleAuthentication.AppleAuthenticationCredential = {
        user: '123',
        email: null,
        fullName: {
          givenName: 'John',
          familyName: 'Doe',
        },
        authorizationCode: 'auth',
        identityToken: 'token',
        realUserStatus: 0,
      };

      expect(isFirstSignIn(credential)).toBe(false);
    });

    it('should return false when fullName is null', () => {
      const credential: AppleAuthentication.AppleAuthenticationCredential = {
        user: '123',
        email: 'test@example.com',
        fullName: null,
        authorizationCode: 'auth',
        identityToken: 'token',
        realUserStatus: 0,
      };

      expect(isFirstSignIn(credential)).toBe(false);
    });
  });

  describe('useAppleAuth hook', () => {
    it('should be defined as a function', () => {
      expect(typeof useAppleAuth).toBe('function');
    });

    it('should return object with signInWithApple and isAvailable', () => {
      const hookResult = useAppleAuth();

      expect(hookResult).toHaveProperty('signInWithApple');
      expect(hookResult).toHaveProperty('isAvailable');
      expect(typeof hookResult.signInWithApple).toBe('function');
      expect(typeof hookResult.isAvailable).toBe('boolean');
    });

    it('should reflect correct availability on iOS', () => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('ios');
      const hookResult = useAppleAuth();

      expect(hookResult.isAvailable).toBe(true);
    });

    it('should reflect correct availability on Android', () => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('android');
      const hookResult = useAppleAuth();

      expect(hookResult.isAvailable).toBe(false);
    });
  });

  describe('getAppleErrorMessage', () => {
    const { getAppleErrorMessage } = require('../apple');

    it('should return message for ERR_REQUEST_CANCELED', () => {
      const error = new Error('Cancelled');
      (error as any).code = 'ERR_REQUEST_CANCELED';

      expect(getAppleErrorMessage(error)).toBe('Sign in was cancelled.');
    });

    it('should return message for ERR_REQUEST_FAILED', () => {
      const error = new Error('Failed');
      (error as any).code = 'ERR_REQUEST_FAILED';

      expect(getAppleErrorMessage(error)).toContain('try again');
    });

    it('should return error message for other errors', () => {
      const error = new Error('Some error');

      expect(getAppleErrorMessage(error)).toBe('Some error');
    });

    it('should return generic message for non-Error objects', () => {
      expect(getAppleErrorMessage('string error')).toContain('unexpected error');
    });
  });
});
