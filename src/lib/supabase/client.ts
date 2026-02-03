// src/lib/supabase/client.ts
// Supabase client initialization with production hardening

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  status: 'connected' | 'error' | 'placeholder';
  message: string;
  timestamp: Date;
  latencyMs?: number;
}

/**
 * Connection state for monitoring
 */
export interface ConnectionState {
  isConnected: boolean;
  lastHealthCheck: HealthCheckResult | null;
  consecutiveFailures: number;
}

// Connection state singleton
let connectionState: ConnectionState = {
  isConnected: false,
  lastHealthCheck: null,
  consecutiveFailures: 0,
};

/**
 * Retrieve Supabase URL from environment
 */
function getSupabaseUrl(): string | undefined {
  return Constants.expoConfig?.extra?.supabaseUrl as string | undefined;
}

/**
 * Retrieve Supabase anon key from environment
 */
function getSupabaseAnonKey(): string | undefined {
  return Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined;
}

/**
 * Validate Supabase configuration
 */
function validateEnvironment(): { url: string; key: string } | null {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  // Check for missing credentials
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Check for empty strings
  if (supabaseUrl.trim() === '' || supabaseAnonKey.trim() === '') {
    return null;
  }

  // Validate URL format
  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes('supabase')) {
      console.warn('[Supabase] URL does not appear to be a Supabase URL:', supabaseUrl);
    }
  } catch {
    console.error('[Supabase] Invalid URL format:', supabaseUrl);
    return null;
  }

  // Validate key format (should be a JWT-like string)
  if (!supabaseAnonKey.includes('.') || supabaseAnonKey.length < 100) {
    console.warn('[Supabase] Anon key appears invalid (too short or wrong format)');
  }

  return { url: supabaseUrl, key: supabaseAnonKey };
}

// Validate and get credentials
const credentials = validateEnvironment();

/**
 * Whether Supabase is using placeholder (non-functional) configuration
 */
export const isSupabasePlaceholder = !credentials;

/**
 * PRODUCTION GUARD
 *
 * In production builds, we MUST have valid Supabase credentials.
 * Fail fast rather than running with broken backend.
 */
if (!__DEV__ && isSupabasePlaceholder) {
  throw new Error(
    '[FATAL] Supabase credentials not configured for production build. ' +
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in environment.'
  );
}

// Log configuration status
if (__DEV__) {
  if (isSupabasePlaceholder) {
    console.warn(
      '[Supabase] Running with placeholder configuration. ' +
      'Backend features disabled. Set env vars to enable.'
    );
  } else {
    console.log('[Supabase] Configured with project:', credentials!.url);
  }
}

/**
 * Supabase client instance
 *
 * In development: Falls back to placeholder if not configured
 * In production: Throws error if not configured (see guard above)
 */
export const supabase: SupabaseClient = createClient(
  credentials?.url || 'https://placeholder.supabase.co',
  credentials?.key || 'placeholder-key',
  {
    auth: {
      // Persist session to AsyncStorage
      persistSession: true,
      // Auto-refresh tokens before expiry
      autoRefreshToken: true,
      // Detect session from URL (for OAuth callbacks)
      detectSessionInUrl: true,
    },
    global: {
      // Add custom headers for debugging
      headers: {
        'x-client-info': `gymrats/${Constants.expoConfig?.version || '1.0.0'}`,
      },
    },
    // Realtime configuration
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

/**
 * Perform health check with latency measurement
 */
export async function healthCheck(): Promise<HealthCheckResult> {
  // Return placeholder status if not configured
  if (isSupabasePlaceholder) {
    return {
      status: 'placeholder',
      message: 'Supabase not configured - using placeholder',
      timestamp: new Date(),
    };
  }

  const startTime = Date.now();

  try {
    // Use a simple auth check instead of RPC (more reliable)
    const { error } = await supabase.auth.getSession();

    const latencyMs = Date.now() - startTime;

    if (error) {
      // Auth error but connection worked
      connectionState.isConnected = true;
      connectionState.consecutiveFailures = 0;

      const result: HealthCheckResult = {
        status: 'connected',
        message: `Connected (auth state: ${error.message})`,
        timestamp: new Date(),
        latencyMs,
      };
      connectionState.lastHealthCheck = result;
      return result;
    }

    connectionState.isConnected = true;
    connectionState.consecutiveFailures = 0;

    const result: HealthCheckResult = {
      status: 'connected',
      message: 'Successfully connected to Supabase',
      timestamp: new Date(),
      latencyMs,
    };
    connectionState.lastHealthCheck = result;
    return result;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    connectionState.isConnected = false;
    connectionState.consecutiveFailures += 1;

    const result: HealthCheckResult = {
      status: 'error',
      message: `Connection failed: ${errorMessage}`,
      timestamp: new Date(),
      latencyMs,
    };
    connectionState.lastHealthCheck = result;
    return result;
  }
}

/**
 * Get current connection state
 */
export function getConnectionState(): ConnectionState {
  return { ...connectionState };
}

/**
 * Check if backend is currently available
 *
 * Use this to guard backend-dependent features.
 */
export function isBackendAvailable(): boolean {
  if (isSupabasePlaceholder) return false;
  return connectionState.isConnected || connectionState.consecutiveFailures < 3;
}

/**
 * Wrapper for Supabase calls with automatic retry
 *
 * Use for important operations that should survive transient failures.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { maxRetries?: number; delayMs?: number } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000 } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on auth errors or client errors (4xx)
      const message = lastError.message || '';
      if (
        message.includes('401') ||
        message.includes('403') ||
        message.includes('Invalid') ||
        message.includes('not found')
      ) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        console.warn(`[Supabase] Attempt ${attempt} failed, retrying in ${delayMs}ms:`, message);
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}

/**
 * Safe query wrapper that handles placeholder mode
 *
 * Returns null data in placeholder mode instead of making failed requests.
 */
export function guardedQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: Error | null }>
): Promise<{ data: T | null; error: Error | null }> {
  if (isSupabasePlaceholder) {
    return Promise.resolve({
      data: null,
      error: new Error('Supabase not configured'),
    });
  }
  return queryFn();
}

/**
 * Re-export types
 */
export type { SupabaseClient };
