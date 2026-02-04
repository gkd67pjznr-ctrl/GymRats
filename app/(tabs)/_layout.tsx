import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../src/ui/theme";

// Note: Authentication is now handled centrally in app/_layout.tsx via useRouteProtection
// This layout no longer needs an AuthGuard wrapper

export default function TabsLayout() {
  const c = useThemeColors();

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
