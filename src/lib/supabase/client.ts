// src/lib/supabase/client.ts
// Supabase client initialization and health check for Forgerank app

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

/**
 * Health check result interface for Supabase connection status
 */
export interface HealthCheckResult {
  status: 'connected' | 'error';
  message: string;
  timestamp: Date;
}

/**
 * Retrieve Supabase URL from Expo environment configuration
 * @returns Supabase URL or undefined if not configured
 */
function getSupabaseUrl(): string | undefined {
  return Constants.expoConfig?.extra?.supabaseUrl as string | undefined;
}

/**
 * Retrieve Supabase anonymous key from Expo environment configuration
 * @returns Supabase anonymous key or undefined if not configured
 */
function getSupabaseAnonKey(): string | undefined {
  return Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined;
}

/**
 * Validate that required Supabase environment variables are present
 * @throws Error if Supabase URL or anon key is missing
 */
function validateEnvironment(): void {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl) {
    throw new Error(
      'Missing Supabase URL. Please set EXPO_PUBLIC_SUPABASE_URL in .env file and add it to app.json extra section.'
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'Missing Supabase anonymous key. Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in .env file and add it to app.json extra section.'
    );
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch (error) {
    throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`);
  }
}

/**
 * Create and configure Supabase client
 * Uses Expo Constants to access environment variables configured in app.json
 *
 * For local development without Supabase, the client will be created with placeholder values.
 * Real Supabase features will be disabled until proper credentials are provided.
 */
const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Validate environment only if credentials are provided
// This allows local development without Supabase
if (supabaseUrl || supabaseAnonKey) {
  validateEnvironment();
}

/**
 * Supabase client instance
 * Singleton pattern ensures single connection throughout the app
 *
 * If credentials are not provided, creates a client with placeholder values.
 * The client will be non-functional but won't crash the app.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Check if Supabase is configured with real credentials
 * Returns true if using placeholder values
 */
export const isSupabasePlaceholder = !supabaseUrl || !supabaseAnonKey;

/**
 * Perform health check on Supabase connection
 * Tests connectivity by attempting a simple query
 *
 * @returns Promise resolving to health check result with status and message
 *
 * @example
 * ```ts
 * const result = await healthCheck();
 * if (result.status === 'connected') {
 *   console.log('Supabase is ready');
 * }
 * ```
 */
export async function healthCheck(): Promise<HealthCheckResult> {
  try {
    // Simple connection test using rpc to call a built-in function
    // This tests network connectivity and authentication
    const { error } = await supabase.rpc('get_table_columns', {
      table_name: 'nonexistent_table_for_health_check',
    });

    // We expect an error (table doesn't exist), but that proves we can reach Supabase
    // If we get a network error or auth error, that's a real problem
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }

    return {
      status: 'connected',
      message: 'Successfully connected to Supabase',
      timestamp: new Date(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'error',
      message: `Connection failed: ${errorMessage}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Re-export Supabase types for convenience
 */
export type { SupabaseClient };
