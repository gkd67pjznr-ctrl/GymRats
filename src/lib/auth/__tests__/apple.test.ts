// src/lib/auth/__tests__/apple.test.ts
// Tests for Apple Sign In implementation

import { renderHook, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

// Store OS value that can be modified by tests
let mockOS = 'ios';

// Mock Platform module with getter to allow OS modification
jest.mock('react-native', () => ({
  Platform: {
    get OS() { return mockOS; },
    set OS(value: string) { mockOS = value; },
    isPad: false,
    isTV: false,
    Version: 0,
    Constants: {},
    select: jest.fn(),
  },
  // Add other exports if needed
}));

// Import the functions after mocking react-native
import {
  isAppleAuthAvailable,
  parseAppleCredential,
  isRealUser,
  getRealUserStatusString,
  getAppleDisplayName,
  hasEmail,
  isFirstSignIn,
  useAppleAuth,
  getAppleErrorMessage,
} from '../apple';
import {
  signInWithOAuthToken,
  extractAppleProfile,
  parseOAuthError,
  type OAuthUserProfile,
  type OAuthError,
} from '../oauth';

// Mock oauth module functions
jest.mock('../oauth', () => ({
  parseOAuthError: jest.fn(),
  signInWithOAuthToken: jest.fn(),
  extractAppleProfile: jest.fn(),
}));

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

// Mock oauth module functions

describe('Apple Sign In', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isAppleAuthAvailable - Platform Detection', () => {
    const originalOS = Platform.OS;

    afterEach(() => {
      (Platform as any).OS = originalOS;
    });

    it('should return true on iOS', () => {
      (Platform as any).OS = 'ios';
      expect(isAppleAuthAvailable()).toBe(true);
    });

    it('should return true on macOS', () => {
      (Platform as any).OS = 'macos';
      expect(isAppleAuthAvailable()).toBe(true);
    });

    it('should return false on Android', () => {
      (Platform as any).OS = 'android';
      expect(isAppleAuthAvailable()).toBe(false);
    });

    it('should return false on web (without MSStream)', () => {
      (Platform as any).OS = 'web';
      delete (window as any).MSStream;
      expect(isAppleAuthAvailable()).toBe(false);
    });

    it('should return true on web with MSStream (IE11)', () => {
      (Platform as any).OS = 'web';
      (window as any).MSStream = true;
      expect(isAppleAuthAvailable()).toBe(true);
      delete (window as any).MSStream;
    });

    it('should return true on iOS simulator', () => {
      (Platform as any).OS = 'ios';
      (Platform as any).isPad = false;
      (Platform as any).isTV = false;
      expect(isAppleAuthAvailable()).toBe(true);
    });
  });

  describe('useAppleAuth hook', () => {
    it('should return object with signInWithApple and isAvailable', () => {
      const hookResult = useAppleAuth();

      expect(hookResult).toHaveProperty('signInWithApple');
      expect(hookResult).toHaveProperty('isAvailable');
      expect(typeof hookResult.signInWithApple).toBe('function');
      expect(typeof hookResult.isAvailable).toBe('boolean');
    });

    it('should reflect correct availability on iOS', () => {
      (Platform as any).OS = 'ios';
      const hookResult = useAppleAuth();

      expect(hookResult.isAvailable).toBe(true);
    });

    it('should reflect correct availability on Android', () => {
      (Platform as any).OS = 'android';
      const hookResult = useAppleAuth();

      expect(hookResult.isAvailable).toBe(false);
    });

    it('should call onSuccess callback when sign in succeeds', async () => {
      (Platform as any).OS = 'ios';

      const mockProfile: OAuthUserProfile = {
        id: 'apple-user-123',
        email: 'apple@example.com',
        emailVerified: true,
        name: 'Apple User',
      };

      const mockCredential: AppleAuthentication.AppleAuthenticationCredential = {
        user: 'apple-user-123',
        email: 'apple@example.com',
        fullName: { givenName: 'Apple', familyName: 'User' },
        authorizationCode: 'auth-code-123',
        identityToken: 'valid-id-token',
        realUserStatus: AppleAuthentication.AppleAuthenticationRealUserStatus.LIKELY_REAL,
      };

      const onSuccessMock = jest.fn();
      const onErrorMock = jest.fn();

      // Update the mock implementations
      (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue(mockCredential);
      (extractAppleProfile as jest.Mock).mockReturnValue(mockProfile);
      (signInWithOAuthToken as jest.Mock).mockResolvedValue({ data: { user: {} }, error: null });

      const { result } = renderHook(() => useAppleAuth({
        onSuccess: onSuccessMock,
        onError: onErrorMock,
      }));

      await act(async () => {
        await result.current.signInWithApple();
      });

      expect(onSuccessMock).toHaveBeenCalledWith(mockProfile);
      expect(onErrorMock).not.toHaveBeenCalled();
    });

    it('should call onError callback when sign in fails', async () => {
      (Platform as any).OS = 'ios';

      const mockError: OAuthError = {
        type: 'cancelled',
        message: 'Sign in was cancelled',
      };

      const onSuccessMock = jest.fn();
      const onErrorMock = jest.fn();

      (AppleAuthentication.signInAsync as jest.Mock).mockRejectedValue(
        new Error('ERR_REQUEST_CANCELED')
      );
      (parseOAuthError as jest.Mock).mockReturnValue(mockError);

      const { result } = renderHook(() => useAppleAuth({
        onSuccess: onSuccessMock,
        onError: onErrorMock,
      }));

      await act(async () => {
        await result.current.signInWithApple();
      });

      expect(onSuccessMock).not.toHaveBeenCalled();
      expect(onErrorMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe('parseAppleCredential - Credential Utilities', () => {
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

    it('should handle null authorizationCode', () => {
      const credential = {
        ...mockCredential,
        authorizationCode: null,
      };
      const parsed = parseAppleCredential(credential);

      expect(parsed.authorizationCode).toBeNull();
    });
  });

  describe('isRealUser - Real User Detection', () => {
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

    it('should return false for UNSUPPORTED status', () => {
      const credential: AppleAuthentication.AppleAuthenticationCredential = {
        user: '123',
        email: 'test@example.com',
        fullName: null,
        authorizationCode: 'auth',
        identityToken: 'token',
        realUserStatus: AppleAuthentication.AppleAuthenticationRealUserStatus.UNSUPPORTED,
      };

      expect(isRealUser(credential)).toBe(false);
    });
  });

  describe('getRealUserStatusString', () => {
    it('should return correct string for UNSUPPORTED', () => {
      const status = AppleAuthentication.AppleAuthenticationRealUserStatus.UNSUPPORTED;
      expect(getRealUserStatusString(status)).toBe('Not supported (iOS 12 or earlier)');
    });

    it('should return correct string for UNKNOWN', () => {
      const status = AppleAuthentication.AppleAuthenticationRealUserStatus.UNKNOWN;
      expect(getRealUserStatusString(status)).toBe('Unknown (cannot determine)');
    });

    it('should return correct string for LIKELY_REAL', () => {
      const status = AppleAuthentication.AppleAuthenticationRealUserStatus.LIKELY_REAL;
      expect(getRealUserStatusString(status)).toBe('Likely a real user');
    });

    it('should return unknown status string for invalid status', () => {
      expect(getRealUserStatusString(999 as any)).toBe('Unknown status');
    });
  });

  describe('getAppleDisplayName - Display Name Utilities', () => {
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

    it('should trim whitespace from combined name', () => {
      const fullName = {
        givenName: '  John  ',
        familyName: '  Doe  ',
      };

      expect(getAppleDisplayName(fullName)).toBe('John Doe');
    });
  });

  describe('hasEmail - Email Detection', () => {
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

    it('should return false when email is undefined', () => {
      const credential: AppleAuthentication.AppleAuthenticationCredential = {
        user: '123',
        email: undefined as any,
        fullName: null,
        authorizationCode: 'auth',
        identityToken: 'token',
        realUserStatus: 0,
      };

      expect(hasEmail(credential)).toBe(false);
    });
  });

  describe('isFirstSignIn - First Sign In Detection', () => {
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

    it('should return false when both email and fullName are missing', () => {
      const credential: AppleAuthentication.AppleAuthenticationCredential = {
        user: '123',
        email: null,
        fullName: null,
        authorizationCode: 'auth',
        identityToken: 'token',
        realUserStatus: 0,
      };

      expect(isFirstSignIn(credential)).toBe(false);
    });
  });

  describe('getAppleErrorMessage - Error Messages', () => {
    it('should return message for ERR_REQUEST_CANCELED', () => {
      const error = new Error('Cancelled');
      (error as any).code = 'ERR_REQUEST_CANCELED';

      expect(getAppleErrorMessage(error)).toBe('Sign in was cancelled.');
    });

    it('should return message for ERR_REQUEST_NOT_HANDLED', () => {
      const error = new Error('Not handled');
      (error as any).code = 'ERR_REQUEST_NOT_HANDLED';

      expect(getAppleErrorMessage(error)).toBe('Sign in request was not handled.');
    });

    it('should return message for ERR_REQUEST_FAILED', () => {
      const error = new Error('Failed');
      (error as any).code = 'ERR_REQUEST_FAILED';

      expect(getAppleErrorMessage(error)).toBe('Sign in request failed. Please try again.');
    });

    it('should return message for ERR_REQUEST_RESPONSE', () => {
      const error = new Error('Invalid response');
      (error as any).code = 'ERR_REQUEST_RESPONSE';

      expect(getAppleErrorMessage(error)).toBe('Invalid sign in response.');
    });

    it('should return message for ERR_REQUEST_UNKNOWN', () => {
      const error = new Error('Unknown');
      (error as any).code = 'ERR_REQUEST_UNKNOWN';

      expect(getAppleErrorMessage(error)).toBe('An unknown error occurred.');
    });

    it('should return error message for other error codes', () => {
      const error = new Error('Some error');

      expect(getAppleErrorMessage(error)).toBe('Some error');
    });

    it('should return generic message for non-Error objects', () => {
      expect(getAppleErrorMessage('string error')).toBe('An unexpected error occurred. Please try again.');
    });

    it('should return generic message for null', () => {
      expect(getAppleErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
    });

    it('should return generic message for undefined', () => {
      expect(getAppleErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('signInWithApple - Complete Sign In Flow', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
    });

    it('should successfully complete Apple sign in flow', async () => {
      const mockProfile: OAuthUserProfile = {
        id: 'apple-user-123',
        email: 'apple@example.com',
        emailVerified: true,
        name: 'Apple User',
      };

      const mockCredential: AppleAuthentication.AppleAuthenticationCredential = {
        user: 'apple-user-123',
        email: 'apple@example.com',
        fullName: { givenName: 'Apple', familyName: 'User' },
        authorizationCode: 'auth-code-123',
        identityToken: 'valid-id-token',
        realUserStatus: AppleAuthentication.AppleAuthenticationRealUserStatus.LIKELY_REAL,
      };

      // Update the mock implementations
      (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue(mockCredential);
      (extractAppleProfile as jest.Mock).mockReturnValue(mockProfile);
      (signInWithOAuthToken as jest.Mock).mockResolvedValue({ data: { user: {} }, error: null });

      const { result } = renderHook(() => useAppleAuth());

      const response = await act(async () => {
        return await result.current.signInWithApple();
      });

      expect(AppleAuthentication.signInAsync).toHaveBeenCalledWith({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      expect(extractAppleProfile).toHaveBeenCalledWith(
        'valid-id-token',
        'apple@example.com',
        { givenName: 'Apple', familyName: 'User' }
      );
      expect(signInWithOAuthToken).toHaveBeenCalledWith('apple', 'valid-id-token', 'auth-code-123');
      expect(response).toEqual({ success: true, user: mockProfile });
    });

    it('should return provider_error when platform is Android', async () => {
      (Platform as any).OS = 'android';

      const onErrorMock = jest.fn();
      const { result } = renderHook(() => useAppleAuth({
        onError: onErrorMock,
      }));

      const response = await act(async () => {
        return await result.current.signInWithApple();
      });

      expect(AppleAuthentication.signInAsync).not.toHaveBeenCalled();
      expect(response).toEqual({
        success: false,
        error: {
          type: 'provider_error',
          message: 'Apple Sign In is not available on this platform',
        },
      });
      expect(onErrorMock).toHaveBeenCalled();
    });

    it('should return invalid_token when identityToken is missing', async () => {
      const mockCredential: AppleAuthentication.AppleAuthenticationCredential = {
        user: 'apple-user-123',
        email: 'apple@example.com',
        fullName: null,
        authorizationCode: 'auth-code-123',
        identityToken: null, // Missing identity token
        realUserStatus: AppleAuthentication.AppleAuthenticationRealUserStatus.LIKELY_REAL,
      };

      (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue(mockCredential);

      const onErrorMock = jest.fn();
      const { result } = renderHook(() => useAppleAuth({
        onError: onErrorMock,
      }));

      const response = await act(async () => {
        return await result.current.signInWithApple();
      });

      expect(response).toEqual({
        success: false,
        error: {
          type: 'invalid_token',
          message: 'No identity token received from Apple',
        },
      });
      expect(onErrorMock).toHaveBeenCalled();
    });

    it('should return cancelled when user cancels', async () => {
      const cancelError = new Error('User cancelled');
      (cancelError as any).code = 'ERR_REQUEST_CANCELED';

      (AppleAuthentication.signInAsync as jest.Mock).mockRejectedValue(cancelError);
      (parseOAuthError as jest.Mock).mockReturnValue({
        type: 'cancelled',
        message: 'Sign in was cancelled',
      });

      const onErrorMock = jest.fn();
      const { result } = renderHook(() => useAppleAuth({
        onError: onErrorMock,
      }));

      const response = await act(async () => {
        return await result.current.signInWithApple();
      });

      expect(response).toEqual({
        success: false,
        error: {
          type: 'cancelled',
          message: 'Sign in was cancelled',
        },
      });
      expect(onErrorMock).toHaveBeenCalled();
    });

    it('should return invalid_token when profile extraction fails', async () => {
      const mockCredential: AppleAuthentication.AppleAuthenticationCredential = {
        user: 'apple-user-123',
        email: 'apple@example.com',
        fullName: { givenName: 'Apple', familyName: 'User' },
        authorizationCode: 'auth-code-123',
        identityToken: 'invalid-token',
        realUserStatus: AppleAuthentication.AppleAuthenticationRealUserStatus.LIKELY_REAL,
      };

      (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue(mockCredential);
      (extractAppleProfile as jest.Mock).mockReturnValue(null);

      const onErrorMock = jest.fn();
      const { result } = renderHook(() => useAppleAuth({
        onError: onErrorMock,
      }));

      const response = await act(async () => {
        return await result.current.signInWithApple();
      });

      expect(response).toEqual({
        success: false,
        error: {
          type: 'invalid_token',
          message: 'Failed to extract user profile from Apple token',
        },
      });
      expect(onErrorMock).toHaveBeenCalled();
    });

    it('should return OAuth error when Supabase auth fails', async () => {
      const mockProfile: OAuthUserProfile = {
        id: 'apple-user-123',
        email: 'apple@example.com',
        emailVerified: true,
        name: 'Apple User',
      };

      const mockCredential: AppleAuthentication.AppleAuthenticationCredential = {
        user: 'apple-user-123',
        email: 'apple@example.com',
        fullName: { givenName: 'Apple', familyName: 'User' },
        authorizationCode: 'auth-code-123',
        identityToken: 'valid-id-token',
        realUserStatus: AppleAuthentication.AppleAuthenticationRealUserStatus.LIKELY_REAL,
      };

      const mockSupabaseError = { message: 'Supabase auth failed' };

      (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue(mockCredential);
      (extractAppleProfile as jest.Mock).mockReturnValue(mockProfile);
      (signInWithOAuthToken as jest.Mock).mockResolvedValue({
        data: null,
        error: mockSupabaseError,
      });
      (parseOAuthError as jest.Mock).mockReturnValue({
        type: 'supabase_error',
        message: 'Supabase auth failed',
      });

      const onErrorMock = jest.fn();
      const { result } = renderHook(() => useAppleAuth({
        onError: onErrorMock,
      }));

      const response = await act(async () => {
        return await result.current.signInWithApple();
      });

      expect(parseOAuthError).toHaveBeenCalledWith(mockSupabaseError);
      expect(response).toEqual({
        success: false,
        error: {
          type: 'supabase_error',
          message: 'Supabase auth failed',
        },
      });
      expect(onErrorMock).toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network connection failed');

      (AppleAuthentication.signInAsync as jest.Mock).mockRejectedValue(networkError);
      (parseOAuthError as jest.Mock).mockReturnValue({
        type: 'network',
        message: 'Network error. Please check your connection.',
      });

      const onErrorMock = jest.fn();
      const { result } = renderHook(() => useAppleAuth({
        onError: onErrorMock,
      }));

      const response = await act(async () => {
        return await result.current.signInWithApple();
      });

      expect(parseOAuthError).toHaveBeenCalledWith(networkError);
      expect(response).toEqual({
        success: false,
        error: {
          type: 'network',
          message: 'Network error. Please check your connection.',
        },
      });
    });
  });

  describe('initializeAppleWebAuth - Web Platform', () => {
    it('should log warning when called on non-web platform', () => {
      (Platform as any).OS = 'ios';
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { initializeAppleWebAuth } = require('../apple');

      initializeAppleWebAuth('client-id', 'redirect-uri');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Apple web auth should only be initialized on web platform'
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
