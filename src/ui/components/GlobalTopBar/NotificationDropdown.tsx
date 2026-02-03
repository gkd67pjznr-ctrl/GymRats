// src/ui/components/GlobalTopBar/NotificationDropdown.tsx
// Scrollable notification dropdown

import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/ui/theme';
import { makeDesignSystem, alpha } from '@/src/ui/designSystem';
import {
  useNotifications,
  useUnreadCount,
  useIsLoadingNotifications,
  useTopBarStore,
} from '@/src/lib/stores/topBarStore';
import type { AppNotification } from '@/src/lib/socialModel';
import { NotificationItem } from './NotificationItem';

// Top bar height constant
const TOP_BAR_HEIGHT = 56;

interface NotificationDropdownProps {
  isVisible: boolean;
  anchorRight?: number;
  onClose: () => void;
  onNotificationPress?: (notification: AppNotification) => void;
}

/**
 * NotificationDropdown Component
 *
 * Animated dropdown showing list of notifications.
 * Max height is 25% of screen.
 */
export function NotificationDropdown({
  isVisible,
  anchorRight = 12,
  onClose,
  onNotificationPress,
}: NotificationDropdownProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');
  const insets = useSafeAreaInsets();

  const notifications = useNotifications();
  const unreadCount = useUnreadCount();
  const isLoading = useIsLoadingNotifications();
  const markAsRead = useTopBarStore(s => s.markAsRead);
  const markAllAsRead = useTopBarStore(s => s.markAllAsRead);

  const { height: screenHeight } = Dimensions.get('window');
  const maxHeight = screenHeight * 0.25;

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-10);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 150 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
    } else {
      opacity.value = withTiming(0, { duration: 100 });
      translateY.value = withTiming(-10, { duration: 100 });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleNotificationPress = async (notification: AppNotification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Mark as read
    if (!notification.readAtMs) {
      await markAsRead(notification.id);
    }

    // Call handler
    onNotificationPress?.(notification);

    // Close dropdown
    onClose();
  };

  const handleMarkAllAsRead = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markAllAsRead();
  };

  const handleBackdropPress = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleBackdropPress} />

      {/* Dropdown */}
      <Animated.View
        style={[
          styles.dropdown,
          {
            top: insets.top + TOP_BAR_HEIGHT + 4,
            right: anchorRight,
            maxHeight,
            backgroundColor: c.card,
            borderColor: ds.tone.border,
          },
          animatedStyle,
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: ds.tone.border }]}>
          <Text style={[styles.headerTitle, { color: c.text }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Pressable onPress={handleMarkAllAsRead}>
              <Text style={[styles.markAllText, { color: ds.tone.accent }]}>
                Mark all read
              </Text>
            </Pressable>
          )}
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: c.muted }]}>
              Loading...
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: c.muted }]}>
              No notifications yet
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={handleNotificationPress}
              />
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    width: 300,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
