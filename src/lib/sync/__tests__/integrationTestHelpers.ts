// Helper utilities for Supabase integration tests
// These tests require a real Supabase test instance with proper tables

/**
 * Check if test Supabase credentials are available
 * Returns true if both URL and anon key are set (not placeholder)
 */
export function hasTestSupabaseCredentials(): boolean {
  // Check for test-specific credentials first
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL_TEST;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY_TEST;

  // Fall back to regular credentials if test-specific ones aren't set
  const supabaseUrl = url || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = key || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  return !!(supabaseUrl && supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder'));
}

/**
 * Get test Supabase credentials
 * @returns Object with url and anonKey
 * @throws Error if credentials missing
 */
export function getTestSupabaseCredentials(): { url: string; anonKey: string } {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL_TEST;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY_TEST;

  const supabaseUrl = url || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = key || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Test Supabase credentials not found. ' +
      'Set EXPO_PUBLIC_SUPABASE_URL_TEST and EXPO_PUBLIC_SUPABASE_ANON_KEY_TEST ' +
      'or EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.test'
    );
  }

  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

/**
 * Skip test if Supabase credentials are not available
 * Use as: testWithSupabase('test name', async () => { ... })
 */
export function testWithSupabase(
  name: string,
  fn: () => Promise<void>,
  timeout?: number
): void {
  if (hasTestSupabaseCredentials()) {
    test(name, fn, timeout);
  } else {
    test.skip(name, fn);
  }
}

/**
 * Describe block that skips all tests if Supabase credentials are not available
 */
export function describeWithSupabase(
  name: string,
  fn: () => void
): void {
  if (hasTestSupabaseCredentials()) {
    describe(name, fn);
  } else {
    describe.skip(name, fn);
  }
}

/**
 * Clean up test data from Supabase tables
 * This function should be called after each test to maintain isolation
 * Implementations will vary based on test setup
 */
export async function cleanupTestTables(): Promise<void> {
  // This is a placeholder - actual implementation depends on test strategy
  console.warn('cleanupTestTables not implemented');
}