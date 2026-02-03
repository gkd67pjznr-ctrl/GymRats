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

// Re-export supabase for internal use
import { supabase } from '../supabase/client';

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
  // Use the simple scheme://path format for deep linking
  // This works better with Supabase OAuth than makeRedirectUri
  const redirectUri = `${scheme}://auth`;
  if (__DEV__) {
    console.log('[Google OAuth] Redirect URI:', redirectUri);
  }
  return redirectUri;
}

/**
 * Get the Google OAuth client ID from environment
 * Falls back to a web client ID for development
 */
function getGoogleClientId(): string {
  // Try to get from Constants.expoConfig.extra
  const clientId = Constants.expoConfig?.extra?.googleClientId as string | undefined;

  if (!clientId) {
    if (__DEV__) console.warn(
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
   * Uses Supabase's built-in OAuth flow for simplicity
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
      // Use Supabase's built-in OAuth flow
      // This handles code exchange and session creation automatically
      const authResult = await signInWithSupabaseGoogle();

      if (authResult.success) {
        if (authResult.user) {
          onSuccess?.(authResult.user);
        }
      } else if (authResult.error) {
        onError?.(authResult.error);
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

    if (__DEV__) console.warn(
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
 * This opens Supabase's Google OAuth URL in an in-app browser.
 * The OAuth callback is handled via deep linking in the root layout.
 *
 * IMPORTANT: The actual session creation happens when the deep link
 * callback is processed by the URL listener. This function only
 * initiates the auth flow.
 *
 * @returns Promise resolving to OAuth result
 */
export async function signInWithSupabaseGoogle(): Promise<OAuthResult> {
  try {
    const redirectUri = getRedirectUri();

    if (__DEV__) {
      console.log('[Google OAuth] Initiating sign in with redirect URI:', redirectUri);
    }

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
      if (__DEV__) {
        console.error('[Google OAuth] Supabase OAuth error:', error);
      }
      throw error;
    }

    if (__DEV__) {
      console.log('[Google OAuth] Auth URL generated:', data.url);
    }

    // Open the auth URL in a browser
    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri
      );

      if (__DEV__) {
        console.log('[Google OAuth] WebBrowser result:', result.type);
      }

      if (result.type === 'success') {
        // openAuthSessionAsync intercepts the redirect URL, so the
        // Linking event listener won't fire. We need to extract the
        // tokens from result.url and establish the session ourselves.
        if (result.url) {
          if (__DEV__) {
            console.log('[Google OAuth] Processing callback URL');
          }

          // Supabase returns tokens in the URL hash fragment:
          // forgerank://auth#access_token=xxx&refresh_token=yyy&...
          const hashIndex = result.url.indexOf('#');
          if (hashIndex !== -1) {
            const hashParams = new URLSearchParams(result.url.substring(hashIndex + 1));
            const access_token = hashParams.get('access_token');
            const refresh_token = hashParams.get('refresh_token');

            if (access_token && refresh_token) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });

              if (sessionError) {
                if (__DEV__) {
                  console.error('[Google OAuth] Failed to set session:', sessionError);
                }
                return {
                  success: false,
                  error: {
                    type: 'supabase_error',
                    message: sessionError.message,
                    originalError: sessionError,
                  },
                };
              }

              if (__DEV__) {
                console.log('[Google OAuth] Session established successfully');
              }
            }
          }

          // Also handle PKCE flow where code is in query params:
          // forgerank://auth?code=xxx
          const urlObj = new URL(result.url);
          const code = urlObj.searchParams.get('code');
          if (code) {
            const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
            if (codeError) {
              if (__DEV__) {
                console.error('[Google OAuth] Code exchange failed:', codeError);
              }
              return {
                success: false,
                error: {
                  type: 'supabase_error',
                  message: codeError.message,
                  originalError: codeError,
                },
              };
            }

            if (__DEV__) {
              console.log('[Google OAuth] PKCE session established successfully');
            }
          }
        }

        return {
          success: true,
        };
      }

      if (result.type === 'cancel') {
        if (__DEV__) {
          console.log('[Google OAuth] User cancelled sign in');
        }
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
    if (__DEV__) {
      console.error('[Google OAuth] Sign in error:', error);
    }
    return {
      success: false,
      error: parseOAuthError(error),
    };
  }
}
