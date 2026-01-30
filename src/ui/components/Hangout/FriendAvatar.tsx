// src/ui/components/Hangout/FriendAvatar.tsx
// Individual friend avatar component

import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { makeDesignSystem } from "../../designSystem";
import { useThemeColors } from "../../theme";
import { AvatarView } from "../Avatar/AvatarView";
import type { UserPresence } from "../../../lib/hangout/hangoutTypes";
import { useUser } from "../../../lib/stores/authStore";
import { useFriendEdges } from "../../../lib/stores/friendsStore";

interface FriendAvatarProps {
  userId: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  presence: UserPresence;
  isCurrentUser?: boolean;
  onPress?: () => void;
}

export function FriendAvatar(props: FriendAvatarProps) {
  const { userId, displayName, avatarUrl, presence, isCurrentUser = false, onPress } = props;

  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const user = useUser();
  const friendEdges = useFriendEdges(user?.id || "");

  // Animation values
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  // Get friend relationship
  const friendEdge = friendEdges.find(edge => edge.otherUserId === userId);
  const isFriend = friendEdge?.status === "friends";

  // Animation effects
  useEffect(() => {
    if (presence.status === "working_out") {
      // Animate when user starts working out
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animations and reset
      scaleValue.stopAnimation();
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [presence.status, scaleValue]);

  // Leave/return animations
  useEffect(() => {
    if (presence.status === "offline") {
      // Fade out when user goes offline
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade in when user comes online
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [presence.status, opacityValue]);

  // Get status display text
  const statusText = getStatusDisplayText(presence.status, presence.activity);

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Animated.View
        style={[
          styles.avatarWrapper,
          {
            opacity: opacityValue,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <AvatarView
          userId={userId}
          displayName={displayName}
          avatarUrl={avatarUrl}
          size="large"
          showStatus
          status={presence.status}
          activity={presence.activity}
        />

        {/* Avatar label */}
        <Text
          style={[
            styles.avatarLabel,
            {
              color: c.text,
              backgroundColor: c.card,
              borderColor: c.border,
            },
          ]}
          numberOfLines={1}
        >
          {isCurrentUser ? "You" : (displayName || "User")}
        </Text>

        {/* Status badge */}
        {statusText && (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusBackgroundColor(presence.status, ds),
                borderColor: c.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusTextColor(presence.status, ds) },
              ]}
              numberOfLines={1}
            >
              {statusText}
            </Text>
          </View>
        )}

        {/* Friend indicator */}
        {isFriend && !isCurrentUser && (
          <View
            style={[
              styles.friendIndicator,
              { backgroundColor: ds.tone.success, borderColor: c.bg },
            ]}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

// Helper function to get status display text
function getStatusDisplayText(
  status: UserPresence["status"],
  activity?: string
): string {
  switch (status) {
    case "working_out":
      return activity || "Working out";
    case "resting":
      return "Resting";
    case "online":
      return "Online";
    case "offline":
      return "Offline";
    default:
      return "";
  }
}

// Helper function to get status background color
function getStatusBackgroundColor(
  status: UserPresence["status"],
  ds: ReturnType<typeof makeDesignSystem>
): string {
  switch (status) {
    case "working_out":
      return ds.tone.accent;
    case "resting":
      return ds.tone.warning;
    case "online":
      return ds.tone.success;
    case "offline":
      return ds.tone.muted;
    default:
      return ds.tone.border;
  }
}

// Helper function to get status text color
function getStatusTextColor(
  status: UserPresence["status"],
  ds: ReturnType<typeof makeDesignSystem>
): string {
  switch (status) {
    case "working_out":
    case "resting":
    case "online":
      return ds.tone.bg;
    case "offline":
      return ds.tone.text;
    default:
      return ds.tone.text;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    alignItems: "center",
  },
  avatarLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 100,
  },
  statusBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 24,
    alignItems: "center",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  friendIndicator: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
});