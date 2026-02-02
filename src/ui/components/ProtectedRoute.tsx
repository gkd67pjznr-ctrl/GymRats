// src/ui/components/ProtectedRoute.tsx
// Wrapper component that protects routes requiring authentication
// Redirects to login if user is not authenticated

import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { Text, View , ActivityIndicator } from "react-native";
import { useThemeColors } from "../theme";
import { useUser } from "../../lib/stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional fallback to show while checking auth
}

/**
 * Higher-order component that protects routes requiring authentication
 * Wraps any screen component that should only be accessible to logged-in users
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
 * ```
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const c = useThemeColors();
  const user = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Only redirect if we're not on auth screens
    const isAuthScreen = segments[0] === "auth";

    if (!user && !isAuthScreen) {
      // User is not authenticated and not on auth screen
      router.replace("/auth/login");
    }
  }, [user, segments, router]);

  // Show loading while checking auth state
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={{ color: c.muted, marginTop: 16 }}>Checking authentication...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if current route is protected
 * Returns true if the route requires authentication
 *
 * @example
 * ```tsx
 * const isProtected = useIsProtectedRoute();
 * if (isProtected && !user) {
 *   // Redirect to login
 * }
 * ```
 */
export function useIsProtectedRoute(): boolean {
  const segments = useSegments();

  // List of segments that require authentication
  const protectedSegments = new Set([
    "profile",
    "settings",
    "calendar",
    "history",
    "friends",
    "notifications",
    "u",      // Public profile viewing (but we require login to view)
    "post",   // Post details and comments
    "new-message",
    "dm",
    "routines",
  ]);

  // Check if any segment in the current route is protected
  return segments.some(segment => protectedSegments.has(segment));
}
