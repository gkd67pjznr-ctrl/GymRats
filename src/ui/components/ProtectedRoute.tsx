// src/ui/components/ProtectedRoute.tsx
// Wrapper component that protects routes requiring authentication
// Redirects to login if user is not authenticated

import { Text, View, ActivityIndicator } from "react-native";
import { useThemeColors } from "../theme";
import { useRouteProtection } from "../../lib/hooks/useRouteProtection";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional fallback to show while checking auth */
  fallback?: React.ReactNode;
  /** Custom redirect path (default: /auth/login) */
  redirectTo?: string;
  /** Whether to show loading indicator (default: true) */
  showLoading?: boolean;
}

/**
 * Higher-order component that protects routes requiring authentication
 * Wraps any screen component that should only be accessible to logged-in users
 *
 * Note: With centralized route protection in _layout.tsx, this component is
 * typically not needed for most screens. Use it for:
 * - Screens that need custom loading/fallback UI
 * - Nested components that need auth checks
 * - Additional protection layer for sensitive screens
 *
 * @example
 * ```tsx
 * // In a protected route file:
 * export default function ProtectedScreen() {
 *   return (
 *     <ProtectedRoute>
 *       <YourScreenContent />
 *     </ProtectedRoute>
 *   );
 * }
 *
 * // With custom fallback:
 * export default function ProtectedScreen() {
 *   return (
 *     <ProtectedRoute fallback={<CustomLoadingUI />}>
 *       <YourScreenContent />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export function ProtectedRoute({
  children,
  fallback,
  showLoading = true,
}: ProtectedRouteProps) {
  const c = useThemeColors();
  const { isAuthenticated, isLoading, isHydrated } = useRouteProtection();

  // Show loading while checking auth state
  if (!isHydrated || isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showLoading) {
      return null;
    }

    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={{ color: c.muted, marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  // If not authenticated, show nothing (redirect is handled by useRouteProtection)
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={{ color: c.muted, marginTop: 16 }}>Redirecting to login...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if current route is protected
 * Returns true if the route requires authentication
 *
 * @deprecated Use useRequiresAuth from useRouteProtection instead
 *
 * @example
 * ```tsx
 * import { useRequiresAuth } from '@/src/lib/hooks/useRouteProtection';
 * const requiresAuth = useRequiresAuth();
 * ```
 */
export function useIsProtectedRoute(): boolean {
  const { isPublicRoute } = useRouteProtection({ autoRedirect: false });
  return !isPublicRoute;
}
