// src/lib/auth/oauth.ts
// OAuth helper utilities for Supabase authentication with external providers

import { supabase } from '../supabase/client';
import type { AuthResponse } from '@supabase/supabase-js';
import { safeJSONParse } from '../storage/safeJSONParse';
import { logError } from '../errorHandler';

// ============================================================================
// Types
// ============================================================================

/**
 * Supported OAuth providers
 */
export type OAuthProvider = 'google' | 'apple';

/**
 * OAuth configuration for a provider
 */
export interface OAuthConfig {
  provider: OAuthProvider;
  clientId: string;
  redirectUri: string;
  discoveryUrl?: string; // For OpenID Connect discovery
}

/**
 * OAuth tokens returned from external provider
 */
export interface OAuthTokens {
  idToken: string;
  accessToken?: string;
  refreshToken?: string;
}

/**
 * User profile extracted from OAuth tokens
 */
export interface OAuthUserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

/**
 * Result of OAuth authentication
 */
export interface OAuthResult {
  success: boolean;
  user?: OAuthUserProfile;
  error?: OAuthError;
}

/**
 * OAuth error types
 */
export type OAuthErrorType =
  | 'cancelled'
  | 'network'
  | 'invalid_token'
  | 'provider_error'
  | 'supabase_error'
  | 'unknown';

/**
 * OAuth error with user-friendly message
 */
export interface OAuthError {
  type: OAuthErrorType;
  message: string;
  originalError?: unknown;
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Create a standardized OAuth error
 */
export function createOAuthError(
  type: OAuthErrorType,
  message: string,
  originalError?: unknown
): OAuthError {
  return { type, message, originalError };
}

/**
 * Convert an error to an OAuthError with appropriate type
 */
export function parseOAuthError(error: unknown): OAuthError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Check for cancellation
    if (
      message.includes('cancel') ||
      message.includes('user cancelled') ||
      message.includes('canceled')
    ) {
      return createOAuthError('cancelled', 'Sign in was cancelled', error);
    }

    // Check for network errors
    if (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('timeout')
    ) {
      return createOAuthError(
        'network',
        'Network error. Please check your connection.',
        error
      );
    }

    // Check for invalid token
    if (
      message.includes('token') ||
      message.includes('invalid') ||
      message.includes('unauthorized')
    ) {
      return createOAuthError(
        'invalid_token',
        'Invalid authentication token. Please try again.',
        error
      );
    }

    // Generic error
    return createOAuthError('provider_error', error.message, error);
  }

  return createOAuthError('unknown', 'An unknown error occurred', error);
}

/**
 * Get a user-friendly message for an OAuth error
 */
export function getOAuthErrorMessage(error: OAuthError): string {
  switch (error.type) {
    case 'cancelled':
      return 'Sign in was cancelled.';
    case 'network':
      return 'Network error. Please check your connection and try again.';
    case 'invalid_token':
      return 'Invalid authentication token. Please try again.';
    case 'provider_error':
      return `Provider error: ${error.message}`;
    case 'supabase_error':
      return `Authentication error: ${error.message}`;
    case 'unknown':
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

// ============================================================================
// Supabase Integration
// ============================================================================

/**
 * Exchange OAuth ID token with Supabase for a session
 *
 * Uses Supabase's signInWithIdToken method to authenticate with
 * an external OAuth provider's ID token.
 *
 * @param provider - The OAuth provider ('google' or 'apple')
 * @param idToken - The ID token from the OAuth provider
 * @param accessToken - Optional access token for additional user info
 * @returns Promise resolving to AuthResponse from Supabase
 *
 * @example
 * ```ts
 * const result = await signInWithOAuthToken('google', googleIdToken);
 * if (result.data.user) {
 *   console.log('Authenticated!', result.data.user);
 * }
 * ```
 */
export async function signInWithOAuthToken(
  provider: OAuthProvider,
  idToken: string,
  accessToken?: string
): Promise<AuthResponse> {
  try {
    // Map our provider names to Supabase's expected provider names
    const supabaseProvider = provider === 'google' ? 'google' : 'apple';

    const result = await supabase.auth.signInWithIdToken({
      provider: supabaseProvider,
      token: idToken,
      access_token: accessToken,
    });

    return result;
  } catch (error) {
    console.error('OAuth sign in error:', error);
    throw createOAuthError(
      'supabase_error',
      'Failed to authenticate with Supabase',
      error
    );
  }
}

/**
 * Sign out the current user
 *
 * @returns Promise that resolves when sign out is complete
 */
export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
}

// ============================================================================
// Profile Extraction
// ============================================================================

/**
 * Decode a JWT ID token (basic implementation)
 * Note: This is a simplified decoder. For production, verify the token signature.
 *
 * @param idToken - The JWT token to decode
 * @returns Decoded token payload
 */
export function decodeIdToken<T = Record<string, unknown>>(idToken: string): T | null {
  try {
    // JWT format: header.payload.signature
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode base64url payload
    const payload = parts[1];
    // Replace base64url characters with base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    // Decode and parse safely
    const decoded = atob(padded);
    return safeJSONParse<T>(decoded, null);
  } catch (error) {
    logError({ context: 'OAuth', error, userMessage: 'Failed to decode ID token' });
    return null;
  }
}

/**
 * Extract user profile from Google ID token
 *
 * @param idToken - Google ID token
 * @returns User profile information
 */
export function extractGoogleProfile(idToken: string): OAuthUserProfile | null {
  const decoded = decodeIdToken<{
    sub: string;
    email: string;
    email_verified: boolean;
    name?: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
  }>(idToken);

  if (!decoded) {
    return null;
  }

  return {
    id: decoded.sub,
    email: decoded.email,
    emailVerified: decoded.email_verified,
    name: decoded.name || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim(),
    picture: decoded.picture,
  };
}

/**
 * Extract user profile from Apple ID token
 *
 * @param idToken - Apple ID token
 * @param userEmail - Email from Apple auth response (may not be in token)
 * @param userName - Name from Apple auth response (one-time only)
 * @returns User profile information
 */
export function extractAppleProfile(
  idToken: string,
  userEmail?: string,
  userName?: { firstName?: string; lastName?: string }
): OAuthUserProfile | null {
  const decoded = decodeIdToken<{
    sub: string;
    email?: string;
    email_verified?: string;
  }>(idToken);

  if (!decoded) {
    return null;
  }

  // Apple may not include email in the token after first sign-in
  // Use the email from the auth response if available
  const email = userEmail || decoded.email;

  // Construct name from Apple's response (only provided on first sign-in)
  const name = userName
    ? `${userName.firstName || ''} ${userName.lastName || ''}`.trim()
    : undefined;

  return {
    id: decoded.sub,
    email: email || '',
    emailVerified: decoded.email_verified === 'true',
    name,
  };
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate that required OAuth configuration is present
 *
 * @param config - OAuth configuration to validate
 * @returns True if valid, throws error if invalid
 */
export function validateOAuthConfig(config: OAuthConfig): boolean {
  if (!config.clientId) {
    throw new Error('OAuth client ID is required');
  }

  if (!config.redirectUri) {
    throw new Error('OAuth redirect URI is required');
  }

  if (config.provider === 'google' && !config.discoveryUrl) {
    throw new Error('Google OAuth requires a discovery URL');
  }

  return true;
}

/**
 * Check if OAuth is available (has required environment configuration)
 *
 * @param provider - OAuth provider to check
 * @returns True if provider is configured
 */
export function isOAuthProviderAvailable(provider: OAuthProvider): boolean {
  // Check if Supabase has the provider enabled
  // This is a basic check; production apps should verify with backend
  return provider === 'google' || provider === 'apple';
}
