import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../src/ui/theme";
import { useIsAuthenticated, useAuthLoading, useAuth } from "../../src/lib/stores";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const loading = useAuthLoading();
  const authStore = useAuth();

  console.log('[AuthGuard] Render:', { loading, isAuthenticated });

  useEffect(() => {
    console.log('[AuthGuard] Effect:', { loading, isAuthenticated });
    // Only check authentication after hydration is complete
    if (!loading && !isAuthenticated) {
      console.log('[AuthGuard] Redirecting to login...');
      // Clear any stale errors
      authStore.clearError();
      // Redirect to login
      router.replace("/auth/login");
    }
  }, [isAuthenticated, loading, router, authStore]);

  // Show loading spinner while checking auth
  if (loading) {
    console.log('[AuthGuard] Showing loading spinner');
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    console.log('[AuthGuard] Not authenticated, showing empty');
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} />
    );
  }

  console.log('[AuthGuard] Rendering children');
  return <>{children}</>;
}

export default function TabsLayout() {
  const c = useThemeColors();

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: c.text,
          tabBarInactiveTintColor: c.muted,
          tabBarStyle: {
            backgroundColor: c.bg,
            borderTopColor: c.border,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="feed"
          options={{
            title: "Friends",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="workout"
          options={{
            title: "Workout",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "barbell" : "barbell-outline"} size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="leaderboard"
          options={{
            title: "Ranks",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "trophy" : "trophy-outline"} size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
