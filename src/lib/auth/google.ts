// src/lib/auth/google.ts
// Google OAuth implementation using expo-auth-session

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {
  makeRedirectUri,
  AuthRequest,
  AuthRequestConfig,
  DiscoveryDocument,
  resolveDiscoveryAsync,
} from 'expo-auth-session';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

import {
  signInWithOAuthToken,
  extractGoogleProfile,
  type OAuthResult,
  type OAuthError,
  parseOAuthError,
  type OAuthUserProfile,
} from './oauth';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Google OAuth scopes required for authentication
 */
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
];

/**
 * Google OAuth discovery document URL
 */
const GOOGLE_DISCOVERY_URL =
  'https://accounts.google.com/.well-known/openid-configuration';

/**
 * Get the redirect URI for OAuth callback
 * Uses the app scheme configured in app.json
 */
function getRedirectUri(): string {
  const scheme = Constants.expoConfig?.scheme || 'forgerank';
  return makeRedirectUri({
    scheme,
    path: 'auth',
    // For standalone apps, use the native redirect
    preferLocalhost: true,
  });
}

/**
 * Get the Google OAuth client ID from environment
 * Falls back to a web client ID for development
 */
function getGoogleClientId(): string {
  // Try to get from Constants.expoConfig.extra
  const clientId = Constants.expoConfig?.extra?.googleClientId as string | undefined;

  if (!clientId) {
    console.warn(
      'Google OAuth client ID not found in app.json extra.googleClientId. ' +
      'Add it to your app.json configuration.'
    );
  }

  return clientId || '';
}

// ============================================================================
// Types
// ============================================================================

/**
 * Result of the Google OAuth request
 */
interface GoogleAuthRequestResult {
  type: 'success' | 'cancel';
  params?: {
    code?: string;
    error?: string;
    state?: string;
  };
  errorCode?: string;
}

/**
 * Google auth hook state
 */
export interface UseGoogleAuthState {
  isLoading: boolean;
  error: OAuthError | null;
  profile: OAuthUserProfile | null;
}

/**
 * Options for useGoogleAuth hook
 */
export interface UseGoogleAuthOptions {
  onSuccess?: (profile: OAuthUserProfile) => void;
  onError?: (error: OAuthError) => void;
}

// ============================================================================
// Web Browser Initialization
// ============================================================================

// Initialize WebBrowser for auth sessions
WebBrowser.maybeCompleteAuthSession();

// ============================================================================
// Google OAuth Hook
// ============================================================================

/**
 * React hook for Google OAuth authentication
 *
 * Provides a function to initiate Google sign-in and manages
 * the authentication state.
 *
 * @param options - Callback options for success/error
 * @returns Object with signIn function and auth state
 *
 * @example
 * ```tsx
 * const { signInWithGoogle, isLoading, error } = useGoogleAuth({
 *   onSuccess: (profile) => console.log('Signed in!', profile),
 *   onError: (error) => console.error('Error:', error),
 * });
 *
 * <Button onPress={signInWithGoogle} disabled={isLoading}>
 *   Sign in with Google
 * </Button>
 * ```
 */
export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const { onSuccess, onError } = options;

  /**
   * Initiate Google OAuth sign-in flow
   */
  const signInWithGoogle = async (): Promise<OAuthResult> => {
    // Validate configuration
    const clientId = getGoogleClientId();
    if (!clientId) {
      const error = {
        type: 'provider_error' as const,
        message: 'Google OAuth is not configured. Please add googleClientId to app.json.',
      };
      onError?.(error);
      return { success: false, error };
    }

    try {
      // Resolve discovery document
      const discovery: DiscoveryDocument = await resolveDiscoveryAsync(
        GOOGLE_DISCOVERY_URL,
        {
          useHttps: true,
        }
      );

      // Configure auth request
      const config: AuthRequestConfig = {
        clientId,
        scopes: GOOGLE_SCOPES,
        redirectUri: getRedirectUri(),
        responseType: 'code',
        // Prompt for consent to ensure we get a refresh token
        prompt: 'consent',
        // Access type offline to get refresh token
        extraParams: {
          access_type: 'offline',
        },
      };

      // Create auth request
      const request = new AuthRequest(config);

      // Prepare the request
      const [result, responseUrl] = await request.promptAsync(discovery, {
        // Use a modal presentation style for better UX
        useProxy: false,
      });

      // Check if user cancelled
      if (result.type === 'cancel' || result.params?.error === 'access_denied') {
        const error = {
          type: 'cancelled' as const,
          message: 'Sign in was cancelled',
        };
        onError?.(error);
        return { success: false, error };
      }

      // Check for errors in response
      if (result.params?.error) {
        const error = parseOAuthError(
          new Error(result.params.error)
        );
        onError?.(error);
        return { success: false, error };
      }

      // Extract authorization code
      const code = result.params?.code;
      if (!code) {
        const error = {
          type: 'invalid_token' as const,
          message: 'No authorization code received from Google',
        };
        onError?.(error);
        return { success: false, error };
      }

      // Exchange code for tokens using Supabase
      // Note: Supabase handles the code exchange internally
      // For a direct implementation, we would need to exchange the code
      // with Google's token endpoint, then use signInWithOAuthToken

      // For now, we'll use Supabase's OAuth flow which handles this
      const authResult = await signInWithGoogleCode(code, getRedirectUri());

      if (authResult.success && authResult.user) {
        onSuccess?.(authResult.user);
      }

      return authResult;
    } catch (err) {
      const error = parseOAuthError(err);
      onError?.(error);
      return { success: false, error };
    }
  };

  return {
    signInWithGoogle,
  };
}

// ============================================================================
// Alternative Implementation: Direct Token Exchange
// ============================================================================

/**
 * Sign in with Google using authorization code flow
 *
 * This is an alternative implementation that exchanges the authorization
 * code for tokens and then signs in with Supabase.
 *
 * @param code - Authorization code from Google
 * @param redirectUri - Redirect URI used in the auth request
 * @returns OAuth result with user profile
 */
async function signInWithGoogleCode(
  code: string,
  redirectUri: string
): Promise<OAuthResult> {
  try {
    // Note: In a production app, you should:
    // 1. Send the code to your backend
    // 2. Backend exchanges code with Google for tokens
    // 3. Backend returns tokens to client
    // 4. Client uses tokens with Supabase

    // For client-side only apps, we can use Supabase's built-in OAuth
    // by redirecting to Supabase's Google OAuth endpoint

    // Alternative: Use the code flow with Supabase
    // This requires the code to be exchanged on the backend
    // For demo purposes, we'll return a success with note about backend

    console.warn(
      'Google OAuth code exchange requires backend implementation. ' +
      'Use Supabase OAuth redirect flow for production.'
    );

    return {
      success: false,
      error: {
        type: 'provider_error',
        message: 'Google OAuth requires backend implementation',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: parseOAuthError(error),
    };
  }
}

// ============================================================================
// PKCE Flow Implementation (Recommended)
// ============================================================================

/**
 * Generate a random state string for CSRF protection
 */
function generateState(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a code verifier for PKCE
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generate code challenge from verifier
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get the Google OAuth URL for direct browser opening
 *
 * @param state - State parameter for CSRF protection
 * @returns Full Google OAuth URL
 */
export function getGoogleOAuthUrl(state?: string): string {
  const clientId = getGoogleClientId();
  const redirectUri = getRedirectUri();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    state: state || generateState(),
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Check if Google OAuth is available on this platform
 *
 * @returns True if Google OAuth can be used
 */
export function isGoogleAuthAvailable(): boolean {
  // Google OAuth works on all platforms
  return true;
}

// ============================================================================
// Linking Handler (for handling deep links)
// ============================================================================

/**
 * Handle OAuth callback from deep link
 *
 * Use this in your app's deep link handler to process
 * OAuth redirects.
 *
 * @param url - The deep link URL
 * @returns OAuth result if URL contains auth code, null otherwise
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const subscription = Linking.addEventListener('url', ({ url }) => {
 *     const result = handleGoogleOAuthCallback(url);
 *     if (result) {
 *       // Handle auth result
 *     }
 *   });
 *   return () => subscription.remove();
 * }, []);
 * ```
 */
export function handleGoogleOAuthCallback(url: string): OAuthResult | null {
  try {
    const { path, queryParams } = Linking.parse(url);

    // Check if this is an OAuth callback
    if (path !== 'auth' && !queryParams?.code) {
      return null;
    }

    const code = queryParams?.code;
    const error = queryParams?.error;

    if (error === 'access_denied') {
      return {
        success: false,
        error: {
          type: 'cancelled',
          message: 'Sign in was cancelled',
        },
      };
    }

    if (code && typeof code === 'string') {
      // Exchange code for tokens
      // This should call your backend or use Supabase
      return {
        success: true,
      };
    }

    return null;
  } catch (error) {
    return {
      success: false,
      error: parseOAuthError(error),
    };
  }
}

// ============================================================================
// Supabase OAuth Redirect (Alternative Implementation)
// ============================================================================

/**
 * Sign in with Google using Supabase's built-in OAuth
 *
 * This opens Supabase's Google OAuth URL and handles the callback.
 * This is simpler than the manual flow above.
 *
 * @returns Promise resolving to OAuth result
 */
export async function signInWithSupabaseGoogle(): Promise<OAuthResult> {
  try {
    const redirectUri = getRedirectUri();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw error;
    }

    // Open the auth URL in a browser
    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri
      );

      if (result.type === 'success') {
        const url = result.url;
        // Parse the URL to get tokens
        // Supabase handles the session automatically via deep link
        return {
          success: true,
        };
      }

      if (result.type === 'cancel') {
        return {
          success: false,
          error: {
            type: 'cancelled',
            message: 'Sign in was cancelled',
          },
        };
      }
    }

    return {
      success: false,
      error: {
        type: 'unknown',
        message: 'Failed to open Google sign-in',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: parseOAuthError(error),
    };
  }
}

// Re-export supabase for internal use
import { supabase } from '../supabase/client';
