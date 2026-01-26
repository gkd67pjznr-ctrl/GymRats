// src/lib/errorHandler.ts
// Centralized error handling with logging and optional toast notifications

export interface ErrorContext {
  context: string;  // e.g., 'FriendsStore', 'FeedStore', 'AuthService'
  error: Error | unknown;
  userMessage?: string;  // Optional user-friendly message
  silent?: boolean;  // If true, only log to console (no toast)
}

/**
 * Log error with context information
 *
 * Provides consistent error logging across the application.
 * In development mode, logs detailed error information including stack traces.
 * In production, logs concise error messages.
 *
 * @param params - Error context including where it occurred and the error itself
 */
export function logError(params: ErrorContext): void {
  const { context, error, userMessage } = params;

  // Build error details for logging
  const errorDetails = {
    context,
    message: userMessage || 'An error occurred',
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : {
      message: String(error),
    },
    timestamp: new Date().toISOString(),
  };

  // Log with appropriate level
  if (__DEV__) {
    console.error(`[${context}] Error:`, errorDetails);
  } else {
    // In production, log concise error message
    console.error(`[${context}] ${userMessage || 'Error'}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return __DEV__ ?? false;
}

/**
 * Format error for user display
 *
 * Extracts a user-friendly message from an error.
 * Returns a generic message for unknown errors.
 *
 * @param error - The error to format
 * @param fallback - Fallback message if error cannot be parsed
 * @returns User-friendly error message
 */
export function formatErrorMessage(error: Error | unknown, fallback: string = 'Something went wrong'): string {
  if (error instanceof Error) {
    return error.message || fallback;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
}

/**
 * Create an error context object
 *
 * Helper function to create properly typed error context
 *
 * @param context - Where the error occurred
 * @param error - The error itself
 * @param userMessage - Optional user-friendly message
 * @returns Error context object
 */
export function createErrorContext(
  context: string,
  error: Error | unknown,
  userMessage?: string
): ErrorContext {
  return { context, error, userMessage };
}

/**
 * Check if error is a network error
 *
 * @param error - Error to check
 * @returns True if error appears to be network-related
 */
export function isNetworkError(error: Error | unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('fetch')
    );
  }
  return false;
}

/**
 * Check if error is an authentication error
 *
 * @param error - Error to check
 * @returns True if error appears to be auth-related
 */
export function isAuthError(error: Error | unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('unauthorized') ||
      message.includes('authentication') ||
      message.includes('token') ||
      message.includes('auth')
    );
  }
  return false;
}

/**
 * Wrap an async function with error handling
 *
 * @param context - Error context prefix
 * @param fn - Async function to wrap
 * @returns Wrapped function that logs errors
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  context: string,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError({ context, error });
      throw error; // Re-throw for caller to handle
    }
  }) as T;
}
