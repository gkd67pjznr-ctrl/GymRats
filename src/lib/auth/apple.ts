// src/lib/auth/apple.ts
// Apple Sign In implementation using expo-apple-authentication

import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

import {
  signInWithOAuthToken,
  extractAppleProfile,
  type OAuthResult,
  type OAuthError,
  parseOAuthError,
  type OAuthUserProfile,
} from './oauth';

// ============================================================================
// Types
// ============================================================================

/**
 * Apple auth hook state
 */
export interface UseAppleAuthState {
  isLoading: boolean;
  isAvailable: boolean;
  error: OAuthError | null;
  profile: OAuthUserProfile | null;
}

/**
 * Options for useAppleAuth hook
 */
export interface UseAppleAuthOptions {
  onSuccess?: (profile: OAuthUserProfile) => void;
  onError?: (error: OAuthError) => void;
}

/**
 * Apple credential response
 */
interface AppleCredential {
  user: string;
  email: string | null;
  fullName: AppleAuthentication.AppleAuthenticationFullName | null;
  authorizationCode: string | null;
  identityToken: string | null;
  realUserStatus: AppleAuthentication.AppleAuthenticationRealUserStatus;
}

// ============================================================================
// Platform Detection
// ============================================================================

/**
 * Check if Apple Authentication is available on this platform
 *
 * Apple Sign In is only available on:
 * - iOS 13+
 * - macOS 10.15+
 * - web (via OAuth)
 *
 * @returns True if Apple Sign In is available
 */
export function isAppleAuthAvailable(): boolean {
  return !!(
    Platform.OS === 'ios' ||
    Platform.OS === 'macos' ||
    (typeof window !== 'undefined' && window.MSStream)
  );
}

// ============================================================================
// Apple Sign In Hook
// ============================================================================

/**
 * React hook for Apple Sign In authentication
 *
 * Provides a function to initiate Apple sign-in and manages
 * the authentication state.
 *
 * @param options - Callback options for success/error
 * @returns Object with signIn function and auth state
 *
 * @example
 * ```tsx
 * const { signInWithApple, isAvailable, isLoading, error } = useAppleAuth({
 *   onSuccess: (profile) => console.log('Signed in!', profile),
 *   onError: (error) => console.error('Error:', error),
 * });
 *
 * {isAvailable && (
 *   <AppleAuthentication.AppleAuthenticationButton
 *     onPress={signInWithApple}
 *     buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
 *     buttonStyle={AppleAuthentication.AppleAuthenticationStyle.BLACK}
 *   />
 * )}
 * ```
 */
export function useAppleAuth(options: UseAppleAuthOptions = {}) {
  const { onSuccess, onError } = options;

  /**
   * Initiate Apple Sign In flow
   */
  const signInWithApple = async (): Promise<OAuthResult> => {
    // Check if Apple Authentication is available
    if (!isAppleAuthAvailable()) {
      const error: OAuthError = {
        type: 'provider_error',
        message: 'Apple Sign In is not available on this platform',
      };
      onError?.(error);
      return { success: false, error };
    }

    try {
      // Request Apple Sign In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Validate the credential
      if (!credential.identityToken) {
        const error: OAuthError = {
          type: 'invalid_token',
          message: 'No identity token received from Apple',
        };
        onError?.(error);
        return { success: false, error };
      }

      // Extract user profile
      const profile = extractAppleProfile(
        credential.identityToken,
        credential.email || undefined,
        credential.fullName || undefined
      );

      if (!profile) {
        const error: OAuthError = {
          type: 'invalid_token',
          message: 'Failed to extract user profile from Apple token',
        };
        onError?.(error);
        return { success: false, error };
      }

      // Sign in with Supabase
      const authResult = await signInWithOAuthToken(
        'apple',
        credential.identityToken,
        credential.authorizationCode || undefined
      );

      if (authResult.error) {
        const error = parseOAuthError(authResult.error);
        onError?.(error);
        return { success: false, error };
      }

      const result: OAuthResult = {
        success: true,
        user: profile,
      };

      onSuccess?.(profile);
      return result;
    } catch (err) {
      // Handle cancellation
      if (err instanceof Error && err.code === 'ERR_REQUEST_CANCELED') {
        const error: OAuthError = {
          type: 'cancelled',
          message: 'Sign in was cancelled',
        };
        onError?.(error);
        return { success: false, error };
      }

      const error = parseOAuthError(err);
      onError?.(error);
      return { success: false, error };
    }
  };

  return {
    signInWithApple,
    isAvailable: isAppleAuthAvailable(),
  };
}

// ============================================================================
// Credential Utilities
// ============================================================================

/**
 * Parse Apple credential response
 *
 * Extracts relevant information from Apple's authentication response
 *
 * @param credential - Raw credential from Apple
 * @returns Parsed credential with identity token and user info
 */
export function parseAppleCredential(
  credential: AppleAuthentication.AppleAuthenticationCredential
): AppleCredential {
  return {
    user: credential.user,
    email: credential.email,
    fullName: credential.fullName,
    authorizationCode: credential.authorizationCode,
    identityToken: credential.identityToken,
    realUserStatus: credential.realUserStatus,
  };
}

/**
 * Check if the Apple user is a "real" user (not a fake/share account)
 *
 * Apple provides a hint about whether the user is likely to be a real user.
 * This can help detect fake accounts used for testing.
 *
 * @param credential - Apple credential to check
 * @returns True if the user appears to be a real user
 */
export function isRealUser(
  credential: AppleAuthentication.AppleAuthenticationCredential
): boolean {
  // AppleAuthenticationRealUserStatus:
  // - 0: unsupported (iOS 12 or earlier)
  // - 1: unknown (cannot determine)
  // - 2: likely real
  return (
    credential.realUserStatus ===
      AppleAuthentication.AppleAuthenticationRealUserStatus.LIKELY_REAL ||
    credential.realUserStatus ===
      AppleAuthentication.AppleAuthenticationRealUserStatus.UNKNOWN
  );
}

// ============================================================================
// Real User Status
// ============================================================================

/**
 * Get a description of the real user status
 *
 * @param status - Apple real user status
 * @returns Human-readable status description
 */
export function getRealUserStatusString(
  status: AppleAuthentication.AppleAuthenticationRealUserStatus
): string {
  switch (status) {
    case AppleAuthentication.AppleAuthenticationRealUserStatus.UNSUPPORTED:
      return 'Not supported (iOS 12 or earlier)';
    case AppleAuthentication.AppleAuthenticationRealUserStatus.UNKNOWN:
      return 'Unknown (cannot determine)';
    case AppleAuthentication.AppleAuthenticationRealUserStatus.LIKELY_REAL:
      return 'Likely a real user';
    default:
      return 'Unknown status';
  }
}

// ============================================================================
// Web Implementation (for web platform)
// ============================================================================

/**
 * Initialize Apple Sign In for web platform
 *
 * On web, Apple Sign In uses OAuth flow rather than the native API.
 * This requires loading Apple's JS SDK and configuring it.
 *
 * @param clientId - Apple client ID for web
 * @param redirectUri - Redirect URI for OAuth flow
 * @param scope - OAuth scopes (default: email name)
 */
export async function initializeAppleWebAuth(
  clientId: string,
  redirectUri: string,
  scope: string = 'email name'
): Promise<void> {
  if (Platform.OS !== 'web') {
    if (__DEV__) console.warn('Apple web auth should only be initialized on web platform');
    return;
  }

  // Load Apple's JS SDK
  // Note: This is a placeholder for web implementation
  // In production, you would load Apple's JS SDK from their CDN
  if (__DEV__) console.info('Apple web auth initialization requires Apple JS SDK');
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Get a user-friendly error message for Apple Sign In errors
 *
 * @param error - Error from Apple Sign In
 * @returns User-friendly error message
 */
export function getAppleErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    switch (error.code) {
      case 'ERR_REQUEST_CANCELED':
        return 'Sign in was cancelled.';
      case 'ERR_REQUEST_NOT_HANDLED':
        return 'Sign in request was not handled.';
      case 'ERR_REQUEST_FAILED':
        return 'Sign in request failed. Please try again.';
      case 'ERR_REQUEST_RESPONSE':
        return 'Invalid sign in response.';
      case 'ERR_REQUEST_UNKNOWN':
        return 'An unknown error occurred.';
      default:
        return error.message || 'An error occurred during sign in.';
    }
  }
  return 'An unexpected error occurred. Please try again.';
}

// ============================================================================
// Re-exports
// ============================================================================

// Export AppleAuthentication types for convenience
export { AppleAuthentication };

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get the display name from Apple's full name response
 *
 * Apple provides first and last name separately.
 * This combines them into a full name.
 *
 * @param fullName - Apple full name object
 * @returns Combined full name or undefined if not provided
 */
export function getAppleDisplayName(
  fullName: AppleAuthentication.AppleAuthenticationFullName | null
): string | undefined {
  if (!fullName) {
    return undefined;
  }

  const firstName = fullName.givenName?.trim() || '';
  const lastName = fullName.familyName?.trim() || '';

  if (!firstName && !lastName) {
    return undefined;
  }

  return `${firstName} ${lastName}`.trim();
}

/**
 * Check if the Apple credential has an email
 *
 * Apple only provides the email on the first sign-in.
 * Subsequent sign-ins will have null email.
 *
 * @param credential - Apple credential to check
 * @returns True if email is present
 */
export function hasEmail(
  credential: AppleAuthentication.AppleAuthenticationCredential
): boolean {
  return credential.email !== null && credential.email !== undefined && credential.email !== '';
}

/**
 * Check if this is the first Apple Sign In
 *
 * Apple only provides the user's name and email on the first sign-in.
 * Subsequent sign-ins will have null values.
 *
 * @param credential - Apple credential to check
 * @returns True if this appears to be the first sign in
 */
export function isFirstSignIn(
  credential: AppleAuthentication.AppleAuthenticationCredential
): boolean {
  return hasEmail(credential) && credential.fullName !== null;
}
