// src/lib/monitoring/sentry.ts
// Sentry crash reporting and error monitoring for production builds

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

/**
 * Sentry DSN from environment
 * Set EXPO_PUBLIC_SENTRY_DSN in .env for production
 */
const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn as string | undefined;

/**
 * Whether Sentry is enabled (has valid DSN)
 */
export const isSentryEnabled = !!SENTRY_DSN && !__DEV__;

/**
 * Initialize Sentry for crash reporting
 *
 * Call this early in app startup (before any other code that might crash).
 * Only initializes in production builds with valid DSN.
 */
export function initializeSentry(): void {
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.log('[Sentry] No DSN configured, skipping initialization');
    }
    return;
  }

  if (__DEV__) {
    console.log('[Sentry] Skipping initialization in development mode');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,

      // Performance monitoring sample rate (0.0 to 1.0)
      tracesSampleRate: 0.2,

      // Enable native crash handling
      enableNative: true,
      enableNativeCrashHandling: true,

      // Capture unhandled promise rejections
      enableAutoPerformanceTracing: true,

      // App version for release tracking
      release: `gymrats@${Constants.expoConfig?.version || '1.0.0'}`,

      // Environment tag
      environment: __DEV__ ? 'development' : 'production',

      // Filter out sensitive data
      beforeSend(event) {
        // Scrub any potential PII from user data
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }

        // Don't send events with "placeholder" in the message (dev artifacts)
        if (event.message?.includes('placeholder')) {
          return null;
        }

        return event;
      },

      // Breadcrumb filtering
      beforeBreadcrumb(breadcrumb) {
        // Filter out noisy console breadcrumbs in production
        if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
          return null;
        }
        return breadcrumb;
      },
    });

    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
}

/**
 * Set user context for Sentry events
 *
 * Call this after user signs in to associate crashes with users.
 */
export function setSentryUser(userId: string, username?: string): void {
  if (!isSentryEnabled) return;

  Sentry.setUser({
    id: userId,
    username: username,
  });
}

/**
 * Clear user context (call on sign out)
 */
export function clearSentryUser(): void {
  if (!isSentryEnabled) return;

  Sentry.setUser(null);
}

/**
 * Capture an exception manually
 *
 * Use this for caught errors that should still be reported.
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>
): void {
  if (!isSentryEnabled) {
    console.error('[Sentry] Would capture:', error.message, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  if (!isSentryEnabled) {
    console.log(`[Sentry] Would capture message (${level}):`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Add a breadcrumb for debugging crash context
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (!isSentryEnabled) return;

  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

/**
 * Set a tag for filtering events in Sentry dashboard
 */
export function setTag(key: string, value: string): void {
  if (!isSentryEnabled) return;

  Sentry.setTag(key, value);
}

/**
 * Wrap a component with Sentry error boundary
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * Create a navigation integration for route tracking
 * Call this with your navigation ref for automatic screen tracking
 */
export const reactNavigationIntegration = Sentry.reactNavigationIntegration;

/**
 * Export Sentry for advanced usage
 */
export { Sentry };
