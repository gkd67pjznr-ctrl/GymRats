// src/lib/hooks/useRouteProtection.ts
// Centralized route protection hook for authentication-based routing

import { useEffect, useRef } from 'react';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

/**
 * Routes that don't require authentication
 * These can be accessed by anyone, including unauthenticated users
 */
const PUBLIC_ROUTES = new Set([
  'auth',           // All auth screens (login, signup, etc.)
  'onboarding',     // Onboarding flow
  'index',          // Root redirect
]);

/**
 * Routes that are only accessible in development mode
 */
const DEV_ONLY_ROUTES = new Set([
  'debug',
  'dev',
  'dev-menu',
]);

/**
 * Check if a route segment indicates a public route
 */
function isPublicRoute(segments: string[]): boolean {
  if (segments.length === 0) return true; // Root path

  const firstSegment = segments[0];

  // Check if it's a public route
  if (PUBLIC_ROUTES.has(firstSegment)) {
    return true;
  }

  // In development, allow dev routes
  if (__DEV__ && DEV_ONLY_ROUTES.has(firstSegment)) {
    return true;
  }

  return false;
}

/**
 * Check if a route is an auth route (login, signup, etc.)
 */
function isAuthRoute(segments: string[]): boolean {
  return segments[0] === 'auth';
}

export interface RouteProtectionState {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is still loading */
  isLoading: boolean;
  /** Whether auth state has been hydrated */
  isHydrated: boolean;
  /** Whether current route is public (doesn't require auth) */
  isPublicRoute: boolean;
  /** Whether current route is an auth route */
  isAuthRoute: boolean;
  /** Whether the user should be redirected to login */
  shouldRedirectToLogin: boolean;
  /** Whether the user should be redirected away from auth (already logged in) */
  shouldRedirectFromAuth: boolean;
}

/**
 * Hook that provides route protection state and handles automatic redirects
 *
 * @param options.autoRedirect - Whether to automatically redirect (default: true)
 * @returns Route protection state
 *
 * @example
 * ```tsx
 * // In _layout.tsx or any screen
 * const { isLoading, shouldRedirectToLogin } = useRouteProtection();
 *
 * if (isLoading) {
 *   return <LoadingScreen />;
 * }
 * ```
 */
export function useRouteProtection(options: { autoRedirect?: boolean } = {}): RouteProtectionState {
  const { autoRedirect = true } = options;

  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const hydrated = useAuthStore(state => state.hydrated);

  const isAuthenticated = user !== null;
  const publicRoute = isPublicRoute(segments);
  const authRoute = isAuthRoute(segments);

  // Determine if redirects are needed
  const shouldRedirectToLogin = !isAuthenticated && !publicRoute && hydrated && !loading;
  const shouldRedirectFromAuth = isAuthenticated && authRoute && hydrated && !loading;

  // Track if we've already redirected to prevent loops
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Reset redirect flag when route changes
    hasRedirected.current = false;
  }, [pathname]);

  useEffect(() => {
    if (!autoRedirect || hasRedirected.current) return;
    if (loading || !hydrated) return;

    if (shouldRedirectToLogin) {
      if (__DEV__) {
        console.log('[useRouteProtection] Redirecting to login - not authenticated');
      }
      hasRedirected.current = true;
      router.replace('/auth/login');
    } else if (shouldRedirectFromAuth) {
      if (__DEV__) {
        console.log('[useRouteProtection] Redirecting from auth - already authenticated');
      }
      hasRedirected.current = true;
      router.replace('/(tabs)');
    }
  }, [
    autoRedirect,
    shouldRedirectToLogin,
    shouldRedirectFromAuth,
    router,
    loading,
    hydrated,
  ]);

  return {
    isAuthenticated,
    isLoading: loading,
    isHydrated: hydrated,
    isPublicRoute: publicRoute,
    isAuthRoute: authRoute,
    shouldRedirectToLogin,
    shouldRedirectFromAuth,
  };
}

/**
 * Hook to check if current route requires authentication
 * Simpler version that just returns a boolean
 */
export function useRequiresAuth(): boolean {
  const segments = useSegments();
  return !isPublicRoute(segments);
}

/**
 * Hook to check if UI elements should be shown (tab bar, top bar, etc.)
 * Returns true only when user is authenticated and not on auth/onboarding screens
 */
export function useShowAuthenticatedUI(): boolean {
  const segments = useSegments();
  const user = useAuthStore(state => state.user);
  const hydrated = useAuthStore(state => state.hydrated);

  if (!hydrated) return false;
  if (!user) return false;

  const firstSegment = segments[0];

  // Don't show on auth screens
  if (firstSegment === 'auth') return false;

  // Don't show on onboarding
  if (firstSegment === 'onboarding') return false;

  return true;
}
