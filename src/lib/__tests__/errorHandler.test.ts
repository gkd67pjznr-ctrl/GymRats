// src/lib/__tests__/errorHandler.test.ts
// Tests for error handler utility

import {
  logError,
  formatErrorMessage,
  createErrorContext,
  isNetworkError,
  isAuthError,
  withErrorHandling,
} from '../errorHandler';

// Mock console methods to track calls
const originalError = console.error;
const originalWarn = console.warn;
let errorLogs: unknown[] = [];
let warnLogs: unknown[] = [];

beforeEach(() => {
  errorLogs = [];
  warnLogs = [];
  console.error = (...args) => errorLogs.push(args);
  console.warn = (...args) => warnLogs.push(args);
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

describe('errorHandler', () => {
  describe('logError', () => {
    it('logs error with context', () => {
      const error = new Error('Test error');
      logError({ context: 'TestContext', error });

      expect(errorLogs.length).toBeGreaterThan(0);
      const log = errorLogs[0] as unknown[];
      expect(log[0]).toContain('TestContext');
    });

    it('includes user message when provided', () => {
      const error = new Error('Test error');
      logError({ context: 'TestContext', error, userMessage: 'User-facing message' });

      expect(errorLogs.length).toBeGreaterThan(0);
      const log = errorLogs[0] as unknown[];
      expect(log[0]).toContain('TestContext');
    });

    it('handles non-Error objects', () => {
      logError({ context: 'TestContext', error: 'String error' });

      expect(errorLogs.length).toBeGreaterThan(0);
    });

    it('handles null/undefined errors gracefully', () => {
      logError({ context: 'TestContext', error: null });
      expect(errorLogs.length).toBeGreaterThan(0);

      errorLogs = [];
      logError({ context: 'TestContext', error: undefined });
      expect(errorLogs.length).toBeGreaterThan(0);
    });
  });

  describe('formatErrorMessage', () => {
    it('extracts message from Error object', () => {
      const error = new Error('Specific error message');
      expect(formatErrorMessage(error)).toBe('Specific error message');
    });

    it('returns string error as-is', () => {
      expect(formatErrorMessage('String error')).toBe('String error');
    });

    it('returns fallback for unknown error types', () => {
      expect(formatErrorMessage({})).toBe('Something went wrong');
      expect(formatErrorMessage(123)).toBe('Something went wrong');
    });

    it('uses custom fallback when provided', () => {
      expect(formatErrorMessage({}, 'Custom fallback')).toBe('Custom fallback');
    });

    it('handles Error without message', () => {
      const error = new Error();
      expect(formatErrorMessage(error, 'Fallback')).toBe('Fallback');
    });
  });

  describe('createErrorContext', () => {
    it('creates properly typed error context', () => {
      const error = new Error('Test');
      const context = createErrorContext('TestContext', error, 'User message');

      expect(context).toEqual({
        context: 'TestContext',
        error,
        userMessage: 'User message',
      });
    });

    it('works without user message', () => {
      const error = new Error('Test');
      const context = createErrorContext('TestContext', error);

      expect(context).toEqual({
        context: 'TestContext',
        error,
        userMessage: undefined,
      });
    });
  });

  describe('isNetworkError', () => {
    it('detects network-related error messages', () => {
      expect(isNetworkError(new Error('Network error'))).toBe(true);
      expect(isNetworkError(new Error('Connection failed'))).toBe(true);
      expect(isNetworkError(new Error('Request timeout'))).toBe(true);
      expect(isNetworkError(new Error('Fetch failed'))).toBe(true);
    });

    it('returns false for non-network errors', () => {
      expect(isNetworkError(new Error('Authentication failed'))).toBe(false);
      expect(isNetworkError(new Error('Validation error'))).toBe(false);
    });

    it('handles non-Error objects', () => {
      expect(isNetworkError('Network error')).toBe(false);
      expect(isNetworkError(null)).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('detects auth-related error messages', () => {
      expect(isAuthError(new Error('Unauthorized'))).toBe(true);
      expect(isAuthError(new Error('Authentication failed'))).toBe(true);
      expect(isAuthError(new Error('Invalid token'))).toBe(true);
      expect(isAuthError(new Error('Auth error'))).toBe(true);
    });

    it('returns false for non-auth errors', () => {
      expect(isAuthError(new Error('Network error'))).toBe(false);
      expect(isAuthError(new Error('Validation error'))).toBe(false);
    });

    it('handles non-Error objects', () => {
      expect(isAuthError('Unauthorized')).toBe(false);
      expect(isAuthError(null)).toBe(false);
    });
  });

  describe('withErrorHandling', () => {
    it('wraps successful async function', async () => {
      const fn = async (arg: number) => arg * 2;
      const wrapped = withErrorHandling('TestContext', fn);

      const result = await wrapped(5);
      expect(result).toBe(10);
    });

    it('logs errors and re-throws', async () => {
      const fn = async () => {
        throw new Error('Test error');
      };
      const wrapped = withErrorHandling('TestContext', fn);

      await expect(wrapped()).rejects.toThrow('Test error');
      expect(errorLogs.length).toBeGreaterThan(0);
    });

    it('preserves function arguments', async () => {
      const fn = async (a: number, b: string) => `${a}-${b}`;
      const wrapped = withErrorHandling('TestContext', fn);

      const result = await wrapped(42, 'test');
      expect(result).toBe('42-test');
    });
  });
});
