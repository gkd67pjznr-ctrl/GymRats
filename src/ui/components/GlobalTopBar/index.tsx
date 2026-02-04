// src/ui/components/GlobalTopBar/index.tsx
// Main container for global top bar with visibility logic

import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/src/ui/theme';
import { makeDesignSystem, alpha } from '@/src/ui/designSystem';
import { useIsAuthenticated } from '@/src/lib/stores/authStore';
import { useWorkoutDrawerStore } from '@/src/lib/stores/workoutDrawerStore';
import { useTopBarStore, useDropdownOpen } from '@/src/lib/stores/topBarStore';
import { TopBarAvatar } from './TopBarAvatar';
import { XPProgressMini } from './XPProgressMini';
import { NotificationBell } from './NotificationBell';
import { NotificationDropdown } from './NotificationDropdown';
import type { AppNotification } from '@/src/lib/socialModel';

// Height of the top bar (excluding safe area)
export const TOP_BAR_HEIGHT = 28;

// Routes where the top bar should be hidden
const HIDDEN_ROUTES = ['/auth', '/onboarding'];

/**
 * GlobalTopBar Component
 *
 * Persistent top bar with user avatar + level, XP progress,
 * placeholder action icons, and notification bell.
 *
 * Hidden when:
 * - Workout drawer is expanded (full-screen workout mode)
 * - User is not authenticated
 * - Current route is auth or onboarding
 */
export function GlobalTopBar() {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthenticated = useIsAuthenticated();
  const drawerPosition = useWorkoutDrawerStore(s => s.position);
  const dropdownOpen = useDropdownOpen();
  const closeDropdown = useTopBarStore(s => s.closeDropdown);
  const fetchNotifications = useTopBarStore(s => s.fetchNotifications);
  const subscribeToNotifications = useTopBarStore(s => s.subscribeToNotifications);
  const unsubscribe = useTopBarStore(s => s.unsubscribe);

  // Determine visibility
  const shouldHide =
    drawerPosition === 'expanded' ||
    !isAuthenticated ||
    HIDDEN_ROUTES.some(r => pathname.startsWith(r));

  // Fetch notifications and subscribe on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      subscribeToNotifications();

      return () => {
        unsubscribe();
      };
    }
  }, [isAuthenticated]);

  // Handle notification press - navigate based on type
  const handleNotificationPress = (notification: AppNotification) => {
    // Navigate based on notification type
    if (notification.postId) {
      // Navigate to post detail (if we have that route)
      router.push('/(tabs)/feed');
    } else if (notification.threadId) {
      // Navigate to DM thread
      router.push(`/dm/${notification.threadId}`);
    } else if (notification.type === 'friend_request' || notification.type === 'friend_accept') {
      // Navigate to friends
      router.push('/friends');
    } else {
      // Default to feed
      router.push('/(tabs)/feed');
    }
  };

  // Handle placeholder icon press
  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  const handleSearchPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to search when implemented
    // For now, show a placeholder action
  };

  if (shouldHide) return null;

  return (
    <>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: c.bg,
            borderBottomColor: alpha(ds.tone.border, 0.5),
          },
        ]}
      >
        <View style={styles.content}>
          {/* Left section: Avatar + Level + XP */}
          <View style={styles.leftSection}>
            <TopBarAvatar size={22} />
            <View style={styles.levelSection}>
              <XPProgressMini width={60} height={4} />
            </View>
          </View>

          {/* Right section: Action icons + Notification bell */}
          <View style={styles.rightSection}>
            {/* Settings icon */}
            <Pressable
              onPress={handleSettingsPress}
              style={({ pressed }) => [
                styles.iconButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="settings-outline"
                size={18}
                color={c.muted}
              />
            </Pressable>

            {/* Search icon */}
            <Pressable
              onPress={handleSearchPress}
              style={({ pressed }) => [
                styles.iconButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="search-outline"
                size={18}
                color={c.muted}
              />
            </Pressable>

            {/* Notification bell */}
            <NotificationBell size={18} />
          </View>
        </View>
      </View>

      {/* Notification dropdown */}
      <NotificationDropdown
        isVisible={dropdownOpen}
        anchorRight={12}
        onClose={closeDropdown}
        onNotificationPress={handleNotificationPress}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 500,
    borderBottomWidth: 1,
  },
  content: {
    height: TOP_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelSection: {
    marginLeft: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconButton: {
    padding: 4,
  },
});

// Re-export height constant for layout calculations
export { TOP_BAR_HEIGHT as GLOBAL_TOP_BAR_HEIGHT };
