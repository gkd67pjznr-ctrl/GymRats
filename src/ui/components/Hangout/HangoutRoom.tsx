// src/ui/components/Hangout/HangoutRoom.tsx
// Main hangout room view component

import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { makeDesignSystem } from "../../designSystem";
import { useThemeColors } from "../../theme";
import { useHangoutStore } from "../../../lib/hangout/hangoutStore";
import { useUser } from "../../../lib/stores/authStore";
import { FriendAvatar } from "./FriendAvatar";
import { RoomDecoration } from "./RoomDecoration";
import { CreateRoomModal } from "./CreateRoomModal";
import { DecorationPicker } from "./DecorationPicker";
import { subscribeToRoomDecorations } from "../../../lib/hangout/presenceTracker";
import { joinHangoutRoom, leaveHangoutRoom, realtimePresence } from "../../../lib/hangout/realtimePresence";
import type { HangoutRoom as HangoutRoomType, PresenceEvent } from "../../../lib/hangout/hangoutTypes";

interface HangoutRoomProps {
  roomId?: string;
  onCustomizeAvatar?: () => void;
  onAddDecoration?: () => void;
}

export function HangoutRoom(props: HangoutRoomProps) {
  const { roomId, onCustomizeAvatar } = props;

  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  const user = useUser();
  const currentRoom = useHangoutStore((state) => state.currentRoom);
  const decorations = useHangoutStore((state) => state.decorations);
  const userPresences = useHangoutStore((state) => state.userPresences);
  const loadRoom = useHangoutStore((state) => state.loadRoom);
  const loadUserRoom = useHangoutStore((state) => state.loadUserRoom);
  const createRoom = useHangoutStore((state) => state.createRoom);
  const loading = useHangoutStore((state) => state.loading);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDecorationPicker, setShowDecorationPicker] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [recentJoin, setRecentJoin] = useState<string | null>(null);
  const addRoomDecoration = useHangoutStore((state) => state.addRoomDecoration);

  // Handle presence events (join/leave)
  const handlePresenceEvent = useCallback((event: PresenceEvent) => {
    if (__DEV__) {
      console.log('[HangoutRoom] Presence event:', event.type, event.userId);
    }

    if (event.type === 'join') {
      // Show join notification briefly
      setRecentJoin(event.presence.displayName || event.userId);
      setTimeout(() => setRecentJoin(null), 3000);
    }

    // Update online count
    setOnlineCount(realtimePresence.getOnlineCount());
  }, []);

  // Load room data
  useEffect(() => {
    const loadRoomData = async () => {
      if (roomId) {
        await loadRoom(roomId);
      } else if (user) {
        await loadUserRoom();
      }
    };

    loadRoomData();
  }, [roomId, user, loadRoom, loadUserRoom]);

  // Join real-time presence when room is loaded
  useEffect(() => {
    if (!currentRoom?.id || !user) return;

    let decorationCleanup: (() => void) | null = null;

    const joinRoom = async () => {
      // Join real-time presence channel
      await joinHangoutRoom(
        currentRoom.id,
        user.id,
        {
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
        handlePresenceEvent
      );

      // Update online count
      setOnlineCount(realtimePresence.getOnlineCount());

      // Subscribe to decoration updates (still uses postgres_changes)
      decorationCleanup = subscribeToRoomDecorations(currentRoom.id);
    };

    joinRoom();

    // Cleanup on unmount
    return () => {
      leaveHangoutRoom();
      decorationCleanup?.();
    };
  }, [currentRoom?.id, user, handlePresenceEvent]);

  // Get friends' presences (excluding current user)
  const friendPresences = userPresences.filter(
    presence => presence.userId !== user?.id
  );

  // Get current user's presence
  const currentUserPresence = userPresences.find(
    presence => presence.userId === user?.id
  );

  if (!currentRoom) {
    return (
      <>
        <View style={[styles.container, { backgroundColor: c.bg }]}>
          <Text style={[styles.emptyText, { color: c.muted }]}>
            {user ? "You don't have a hangout room yet." : "Please sign in to view the hangout room."}
          </Text>
          {user && (
            <Pressable
              onPress={() => setShowCreateModal(true)}
              style={[
                styles.createButton,
                { backgroundColor: ds.tone.accent, borderColor: ds.tone.accent },
              ]}
            >
              <Text style={[styles.createButtonText, { color: c.bg }]}>
                Create Hangout Room
              </Text>
            </Pressable>
          )}
        </View>
        <CreateRoomModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateRoom={async (name, theme) => {
            return await createRoom(name, theme);
          }}
          loading={loading}
        />
      </>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: getRoomBackgroundColor(currentRoom) }]}>
      {/* Room Header */}
      <View style={[styles.header, { backgroundColor: c.card }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.roomName, { color: c.text }]}>
              {currentRoom.name}
            </Text>
            <Text style={[styles.roomOwner, { color: c.muted }]}>
              Owner: {currentRoom.ownerId === user?.id ? "You" : "Friend"}
            </Text>
          </View>
          <View style={[styles.onlineBadge, { backgroundColor: ds.tone.accent + '20' }]}>
            <View style={[styles.onlineDot, { backgroundColor: '#22c55e' }]} />
            <Text style={[styles.onlineCount, { color: c.text }]}>
              {onlineCount} online
            </Text>
          </View>
        </View>
        {recentJoin && (
          <View style={[styles.joinNotification, { backgroundColor: ds.tone.accent + '20' }]}>
            <Text style={[styles.joinText, { color: ds.tone.accent }]}>
              {recentJoin} joined the room
            </Text>
          </View>
        )}
      </View>

      {/* Room Content */}
      <ScrollView
        style={styles.roomContent}
        contentContainerStyle={styles.roomContentContainer}
      >
        {/* Decorations */}
        {decorations.map((decoration) => (
          <RoomDecoration
            key={decoration.id}
            decoration={decoration}
            style={{
              position: "absolute",
              left: decoration.position.x,
              top: decoration.position.y,
            }}
          />
        ))}

        {/* User's Avatar */}
        {user && currentUserPresence && (
          <View
            style={{
              position: "absolute",
              left: 100,
              bottom: 100,
            }}
          >
            <FriendAvatar
              userId={user.id}
              displayName={user.displayName}
              avatarUrl={user.avatarUrl}
              presence={currentUserPresence}
              isCurrentUser
              onPress={onCustomizeAvatar}
            />
          </View>
        )}

        {/* Friends' Avatars */}
        {friendPresences.map((presence) => (
          <View
            key={presence.userId}
            style={{
              position: "absolute",
              left: 200 + Math.random() * 400, // Random placement for demo
              bottom: 100 + Math.random() * 200,
            }}
          >
            <FriendAvatar
              userId={presence.userId}
              presence={presence}
              onPress={() => {
                // TODO: Implement friend profile view
              }}
            />
          </View>
        ))}
      </ScrollView>

      {/* Room Controls */}
      <View style={[styles.controls, { backgroundColor: c.card }]}>
        <Pressable
          onPress={() => setShowDecorationPicker(true)}
          style={[
            styles.controlButton,
            { backgroundColor: ds.tone.accent },
          ]}
        >
          <Text style={[styles.controlButtonText, { color: c.bg }]}>
            Add Decoration
          </Text>
        </Pressable>

        {onCustomizeAvatar && (
          <Pressable
            onPress={onCustomizeAvatar}
            style={[
              styles.controlButton,
              { backgroundColor: c.bg, borderColor: c.border },
            ]}
          >
            <Text style={[styles.controlButtonText, { color: c.text }]}>
              Customize Avatar
            </Text>
          </Pressable>
        )}
      </View>

      {/* Modals */}
      <CreateRoomModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={async (name, theme) => {
          return await createRoom(name, theme);
        }}
        loading={loading}
      />
      <DecorationPicker
        visible={showDecorationPicker}
        onClose={() => setShowDecorationPicker(false)}
        onAddDecoration={async (itemId, itemType, position) => {
          return await addRoomDecoration(itemId, itemType, position);
        }}
        loading={loading}
      />
    </View>
  );
}

// Helper function to get room background color
function getRoomBackgroundColor(room: HangoutRoomType): string {
  // Return theme-based background color
  const themeColors: Record<string, string> = {
    default: "#0a0a0a",
    neon: "#0a0a1a",
    nature: "#0a1a0a",
    industrial: "#0d0d0d",
  };
  return themeColors[room.theme] || themeColors.default;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  createButton: {
    alignSelf: "center",
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  roomName: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  roomOwner: {
    fontSize: 14,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineCount: {
    fontSize: 13,
    fontWeight: "600",
  },
  joinNotification: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinText: {
    fontSize: 13,
    fontWeight: "600",
  },
  roomContent: {
    flex: 1,
  },
  roomContentContainer: {
    flex: 1,
    position: "relative",
  },
  controls: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});