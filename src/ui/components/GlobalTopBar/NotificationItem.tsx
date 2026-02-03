// src/ui/components/GlobalTopBar/NotificationItem.tsx
// Individual notification row for dropdown

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/src/ui/theme';
import { makeDesignSystem, alpha } from '@/src/ui/designSystem';
import type { AppNotification } from '@/src/lib/socialModel';

interface NotificationItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
}

/**
 * NotificationItem Component
 *
 * Displays a single notification with type icon, content, and time.
 */
export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem('dark', 'toxic');

  const isUnread = !notification.readAtMs;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(notification);
  };

  // Get icon and color based on notification type
  const { icon, iconColor } = getNotificationIcon(notification.type, ds);

  // Format relative time
  const timeAgo = formatTimeAgo(notification.createdAtMs);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed
            ? alpha(c.card, 0.8)
            : isUnread
            ? alpha(ds.tone.accent, 0.08)
            : 'transparent',
        },
      ]}
    >
      {/* Unread indicator dot */}
      {isUnread && (
        <View
          style={[
            styles.unreadDot,
            { backgroundColor: ds.tone.accent },
          ]}
        />
      )}

      {/* Type icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: alpha(iconColor, 0.15),
          },
        ]}
      >
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: c.text,
              fontWeight: isUnread ? '700' : '600',
            },
          ]}
          numberOfLines={1}
        >
          {notification.title}
        </Text>
        <Text
          style={[styles.body, { color: c.muted }]}
          numberOfLines={2}
        >
          {notification.body}
        </Text>
      </View>

      {/* Time */}
      <Text style={[styles.time, { color: c.muted }]}>{timeAgo}</Text>
    </Pressable>
  );
}

/**
 * Get icon and color for notification type
 */
function getNotificationIcon(
  type: string,
  ds: ReturnType<typeof makeDesignSystem>
): { icon: keyof typeof Ionicons.glyphMap; iconColor: string } {
  switch (type) {
    case 'reaction':
    case 'like':
      return { icon: 'heart', iconColor: ds.tone.danger };
    case 'comment':
      return { icon: 'chatbubble', iconColor: ds.tone.info };
    case 'friend_request':
    case 'friend_accept':
      return { icon: 'person-add', iconColor: ds.tone.accent };
    case 'message':
    case 'dm':
      return { icon: 'mail', iconColor: ds.tone.info };
    case 'workout':
    case 'pr':
      return { icon: 'barbell', iconColor: ds.tone.success };
    case 'level_up':
    case 'achievement':
      return { icon: 'trophy', iconColor: ds.tone.gold };
    case 'streak':
      return { icon: 'flame', iconColor: ds.tone.warning };
    default:
      return { icon: 'notifications', iconColor: ds.tone.muted };
  }
}

/**
 * Format timestamp to relative time
 */
function formatTimeAgo(timestampMs: number): string {
  const now = Date.now();
  const diffMs = now - timestampMs;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}d`;

  // Older than a week - show date
  const date = new Date(timestampMs);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    minHeight: 56,
  },
  unreadDot: {
    position: 'absolute',
    left: 4,
    top: '50%',
    marginTop: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 12,
    lineHeight: 16,
  },
  time: {
    fontSize: 11,
    fontWeight: '600',
  },
});
