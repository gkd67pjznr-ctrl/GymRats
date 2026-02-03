// src/ui/components/GlobalTopBar/NotificationBell.tsx
// Notification bell icon with unread badge

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/src/ui/theme';
import { makeDesignSystem } from '@/src/ui/designSystem';
import { useUnreadCount, useDropdownOpen, useTopBarStore } from '@/src/lib/stores/topBarStore';

interface NotificationBellProps {
  size?: number;
}

/**
 * NotificationBell Component
 *
 * Bell icon that shows unread count badge.
 * Toggles notification dropdown on press.
 */
export function NotificationBell({ size = 24 }: NotificationBellProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');
  const unreadCount = useUnreadCount();
  const dropdownOpen = useDropdownOpen();
  const toggleDropdown = useTopBarStore(s => s.toggleDropdown);

  const hasUnread = unreadCount > 0;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleDropdown();
  };

  // Format badge count (max 99+)
  const badgeText = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {/* Bell icon */}
      <Ionicons
        name={hasUnread ? 'notifications' : 'notifications-outline'}
        size={size}
        color={dropdownOpen ? ds.tone.accent : c.text}
      />

      {/* Unread badge */}
      {hasUnread && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: ds.tone.danger,
              minWidth: unreadCount > 9 ? 20 : 16,
            },
          ]}
        >
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
