// src/ui/components/PersistentTabBar.tsx
// Persistent bottom tab bar that stays visible across all screens

import { View, Pressable, Text, StyleSheet } from "react-native";

// Height of tab bar content (excluding safe area)
export const TAB_BAR_HEIGHT = 60;
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../theme";
import { useIsAuthenticated, useUser } from "../../lib/stores";
import { usePendingFriendRequestCount } from "../../lib/stores/friendsStore";
import { ME_ID } from "../../lib/userDirectory";

type TabConfig = {
  name: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  badgeKey?: string;
};

const TABS: TabConfig[] = [
  { name: "Home", href: "/(tabs)", icon: "home-outline", iconFocused: "home" },
  { name: "Feed", href: "/(tabs)/feed", icon: "people-outline", iconFocused: "people", badgeKey: "friends" },
  { name: "Workout", href: "/(tabs)/workout", icon: "barbell-outline", iconFocused: "barbell" },
  { name: "Gym Lab", href: "/forge-lab", icon: "analytics-outline", iconFocused: "analytics" },
  { name: "Profile", href: "/(tabs)/profile", icon: "person-outline", iconFocused: "person" },
];

// Screens where tab bar should be hidden
const HIDDEN_ON = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password", "/auth/verify-email"];

export function PersistentTabBar() {
  const c = useThemeColors();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const pendingCount = usePendingFriendRequestCount(user?.id ?? ME_ID);

  // Only show when authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Hide on auth screens (shouldn't happen if authenticated, but just in case)
  if (HIDDEN_ON.some((path) => pathname.startsWith(path))) {
    return null;
  }

  const isActive = (href: string) => {
    // pathname might be "/index", "/feed", etc. without the (tabs) prefix
    const tabName = href.replace("/(tabs)/", "/").replace("/(tabs)", "/");
    if (href === "/(tabs)") {
      return pathname === "/" || pathname === "/index" || pathname === "/(tabs)" || pathname === "/(tabs)/index";
    }
    return pathname === tabName || pathname === href || pathname.startsWith(tabName + "/");
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        backgroundColor: c.bg || "#000",
        borderTopWidth: 1,
        borderTopColor: c.border || "#333",
        paddingBottom: insets.bottom || 20,
        paddingTop: 10,
        minHeight: 50,
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.href);
        const badgeCount = tab.badgeKey === "friends" ? pendingCount : 0;
        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(tab.href as any)}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 4,
            }}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={active ? tab.iconFocused : tab.icon}
                size={24}
                color={active ? (c.text || "#fff") : (c.muted || "#888")}
              />
              {badgeCount > 0 && (
                <View style={[styles.badge, { backgroundColor: c.primary || "#FF4444" }]}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
