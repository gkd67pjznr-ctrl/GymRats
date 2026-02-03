import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../src/ui/theme";
import { TOP_BAR_HEIGHT } from "../../src/ui/components/GlobalTopBar";

// Note: Authentication is now handled centrally in app/_layout.tsx via useRouteProtection
// This layout no longer needs an AuthGuard wrapper

export default function TabsLayout() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: c.text,
          tabBarInactiveTintColor: c.muted,
          tabBarStyle: {
            display: 'none', // Hidden - using PersistentTabBar instead
          },
          sceneStyle: {
            paddingTop: insets.top + TOP_BAR_HEIGHT,
            paddingBottom: 60, // Space for persistent tab bar
            backgroundColor: c.bg,
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
  );
}
