// src/ui/components/Home/HomeHangoutRoom.tsx
// Full-width hangout room for the home tab with decoration layers

import { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../theme";
import { makeDesignSystem } from "../../designSystem";
import { useUser } from "../../../lib/stores/authStore";
import {
  useHangoutStore,
  useCurrentRoom,
  useRoomDecorations,
  useRoomPresences,
  useIsHangoutHydrated,
} from "../../../lib/hangout/hangoutStore";
import { ROOM_SLOTS, type RoomSlotType } from "../../../lib/hangout/roomSlots";
import type { RoomDecoration, HangoutRoom } from "../../../lib/hangout/hangoutTypes";
import { FriendAvatar } from "../Hangout/FriendAvatar";
import { AvatarView } from "../Avatar/AvatarView";
import { joinHangoutRoom, leaveHangoutRoom, realtimePresence } from "../../../lib/hangout/realtimePresence";
import type { PresenceEvent } from "../../../lib/hangout/hangoutTypes";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ROOM_ASPECT_RATIO = 16 / 10; // Wide room aspect
const ROOM_HEIGHT = (SCREEN_WIDTH - 32) / ROOM_ASPECT_RATIO;

interface HomeHangoutRoomProps {
  onCustomizeAvatar?: () => void;
  onEditRoom?: () => void;
}

// Decoration slot placeholder component
function DecorationSlot({
  slot,
  decoration,
  roomWidth,
  roomHeight,
  onPress,
}: {
  slot: typeof ROOM_SLOTS[0];
  decoration?: RoomDecoration;
  roomWidth: number;
  roomHeight: number;
  onPress?: () => void;
}) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  // Scale positions to room size (original slots are for 800x500 room)
  const scaledX = (slot.position.x / 800) * roomWidth;
  const scaledY = (slot.position.y / 500) * roomHeight;

  // Different sizes for different slot types
  const getSlotSize = () => {
    if (slot.id.startsWith("wall_art")) return { width: 60, height: 50 };
    if (slot.id.startsWith("furniture")) return { width: 70, height: 60 };
    if (slot.id === "trophy_shelf") return { width: 80, height: 40 };
    if (slot.id.startsWith("plant")) return { width: 40, height: 50 };
    if (slot.id === "lighting") return { width: 50, height: 30 };
    return { width: 50, height: 50 };
  };

  const size = getSlotSize();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.decorationSlot,
        {
          left: scaledX - size.width / 2,
          top: scaledY - size.height / 2,
          width: size.width,
          height: size.height,
          borderColor: decoration ? "transparent" : c.border,
          backgroundColor: decoration ? "transparent" : c.card + "40",
        },
      ]}
    >
      {decoration ? (
        // Show actual decoration (placeholder for now)
        <View style={styles.decorationContent}>
          <Text style={styles.decorationEmoji}>{slot.icon}</Text>
        </View>
      ) : (
        // Show empty slot indicator
        <View style={styles.emptySlot}>
          <Text style={[styles.slotIcon, { opacity: 0.5 }]}>{slot.icon}</Text>
        </View>
      )}
    </Pressable>
  );
}

// Room canvas layers
function RoomCanvas({
  room,
  decorations,
  presences,
  user,
  roomWidth,
  roomHeight,
  onEditRoom,
  onCustomizeAvatar,
}: {
  room: HangoutRoom;
  decorations: RoomDecoration[];
  presences: ReturnType<typeof useRoomPresences>;
  user: ReturnType<typeof useUser>;
  roomWidth: number;
  roomHeight: number;
  onEditRoom?: () => void;
  onCustomizeAvatar?: () => void;
}) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");

  // Get room background based on theme
  const getRoomBackground = () => {
    const themes: Record<string, string[]> = {
      default: ["#0a0a0a", "#111111", "#0a0a0a"],
      neon: ["#0a0a1a", "#0f0f2a", "#0a0a1a"],
      nature: ["#0a1a0a", "#0f2a0f", "#0a1a0a"],
      industrial: ["#0d0d0d", "#151515", "#0d0d0d"],
    };
    return themes[room.theme] || themes.default;
  };

  // Get current user's presence
  const currentUserPresence = presences.find(p => p.userId === user?.id);

  // Get friends' presences (excluding current user)
  const friendPresences = presences.filter(p => p.userId !== user?.id);

  return (
    <View style={[styles.roomCanvas, { width: roomWidth, height: roomHeight }]}>
      {/* Layer 1: Background gradient */}
      <LinearGradient
        colors={getRoomBackground() as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Layer 2: Floor line */}
      <View style={[styles.floorLine, { top: roomHeight * 0.7, backgroundColor: c.border }]} />

      {/* Layer 3: Wall decorations (back layer) */}
      {ROOM_SLOTS.filter(s => s.id.startsWith("wall_art") || s.id === "trophy_shelf" || s.id === "lighting").map(slot => {
        const decoration = decorations.find(d => d.position.x === slot.position.x && d.position.y === slot.position.y);
        return (
          <DecorationSlot
            key={slot.id}
            slot={slot}
            decoration={decoration}
            roomWidth={roomWidth}
            roomHeight={roomHeight}
            onPress={onEditRoom}
          />
        );
      })}

      {/* Layer 4: Furniture and plants (middle layer) */}
      {ROOM_SLOTS.filter(s => s.id.startsWith("furniture") || s.id.startsWith("plant") || s.id === "floor_rug").map(slot => {
        const decoration = decorations.find(d => d.position.x === slot.position.x && d.position.y === slot.position.y);
        return (
          <DecorationSlot
            key={slot.id}
            slot={slot}
            decoration={decoration}
            roomWidth={roomWidth}
            roomHeight={roomHeight}
            onPress={onEditRoom}
          />
        );
      })}

      {/* Layer 5: Avatars (front layer) */}
      <View style={styles.avatarsLayer}>
        {/* Current user's avatar - center bottom */}
        {user && (
          <Pressable
            onPress={onCustomizeAvatar}
            style={[
              styles.avatarPosition,
              {
                left: roomWidth * 0.5 - 35,
                bottom: roomHeight * 0.1,
              },
            ]}
          >
            <AvatarView
              userId={user.id}
              displayName={user.displayName}
              avatarUrl={user.avatarUrl}
              size="medium"
              showStatus
              status={currentUserPresence?.status || "online"}
            />
            <Text style={[styles.avatarLabel, { color: c.text, backgroundColor: c.card }]}>
              You
            </Text>
          </Pressable>
        )}

        {/* Friends' avatars - scattered positions */}
        {friendPresences.slice(0, 4).map((presence, index) => {
          // Calculate scattered positions
          const positions = [
            { left: 0.2, bottom: 0.15 },
            { left: 0.7, bottom: 0.12 },
            { left: 0.35, bottom: 0.08 },
            { left: 0.6, bottom: 0.18 },
          ];
          const pos = positions[index] || positions[0];

          return (
            <View
              key={presence.userId}
              style={[
                styles.avatarPosition,
                {
                  left: roomWidth * pos.left - 25,
                  bottom: roomHeight * pos.bottom,
                },
              ]}
            >
              <FriendAvatar
                userId={presence.userId}
                presence={presence}
                onPress={() => {
                  // TODO: View friend profile
                }}
              />
            </View>
          );
        })}
      </View>

      {/* Room name badge */}
      <View style={[styles.roomNameBadge, { backgroundColor: c.card + "CC" }]}>
        <Text style={[styles.roomNameText, { color: c.text }]} numberOfLines={1}>
          {room.name}
        </Text>
      </View>

      {/* Edit room button */}
      <Pressable
        onPress={onEditRoom}
        style={[styles.editRoomButton, { backgroundColor: ds.tone.accent + "20", borderColor: ds.tone.accent }]}
      >
        <Ionicons name="brush" size={14} color={ds.tone.accent} />
      </Pressable>
    </View>
  );
}

export function HomeHangoutRoom({ onCustomizeAvatar, onEditRoom }: HomeHangoutRoomProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");
  const router = useRouter();

  const user = useUser();
  const room = useCurrentRoom();
  const decorations = useRoomDecorations();
  const presences = useRoomPresences();
  const hydrated = useIsHangoutHydrated();
  const loading = useHangoutStore(s => s.loading);
  const createRoom = useHangoutStore(s => s.createRoom);

  const [onlineCount, setOnlineCount] = useState(0);

  const roomWidth = SCREEN_WIDTH - 32;
  const roomHeight = ROOM_HEIGHT;

  // Handle presence events
  const handlePresenceEvent = useCallback((event: PresenceEvent) => {
    setOnlineCount(realtimePresence.getOnlineCount());
  }, []);

  // Hydrate hangout data on mount
  useEffect(() => {
    const hydrate = async () => {
      if (user) {
        await useHangoutStore.getState().hydrate();
      }
    };
    hydrate();
  }, [user]);

  // Join real-time presence when room loads
  useEffect(() => {
    if (!room?.id || !user) return;

    const joinRoom = async () => {
      await joinHangoutRoom(
        room.id,
        user.id,
        {
          displayName: user.displayName ?? undefined,
          avatarUrl: user.avatarUrl ?? undefined,
        },
        handlePresenceEvent
      );
      setOnlineCount(realtimePresence.getOnlineCount());
    };

    joinRoom();

    return () => {
      leaveHangoutRoom();
    };
  }, [room?.id, user, handlePresenceEvent]);

  // Handle navigation
  const handleCustomizeAvatar = onCustomizeAvatar || (() => router.push("/avatar"));
  const handleEditRoom = onEditRoom || (() => router.push("/hangout"));

  // Loading state
  if (!hydrated || loading) {
    return (
      <View style={[styles.container, { backgroundColor: c.card }]}>
        <View style={[styles.loadingContainer, { height: roomHeight }]}>
          <ActivityIndicator size="small" color={c.muted} />
          <Text style={[styles.loadingText, { color: c.muted }]}>
            Loading your room...
          </Text>
        </View>
      </View>
    );
  }

  // No room state - show create room prompt
  if (!room) {
    return (
      <View style={[styles.container, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={[styles.createRoomContainer, { height: roomHeight }]}>
          <LinearGradient
            colors={["#0a0a0a", "#111111", "#0a0a0a"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.createRoomContent}>
            <View style={[styles.createRoomIcon, { backgroundColor: ds.tone.accent + "20" }]}>
              <Ionicons name="home" size={32} color={ds.tone.accent} />
            </View>
            <Text style={[styles.createRoomTitle, { color: c.text }]}>
              Create Your Room
            </Text>
            <Text style={[styles.createRoomSubtitle, { color: c.muted }]}>
              Set up your personal hangout space where friends can visit
            </Text>
            <Pressable
              onPress={async () => {
                await createRoom("My Room", "default");
              }}
              style={[styles.createRoomButton, { backgroundColor: ds.tone.accent }]}
            >
              <Text style={[styles.createRoomButtonText, { color: c.bg }]}>
                Create Room
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Has room - show the room canvas
  return (
    <View style={[styles.container, { borderColor: c.border }]}>
      <RoomCanvas
        room={room}
        decorations={decorations}
        presences={presences}
        user={user}
        roomWidth={roomWidth}
        roomHeight={roomHeight}
        onEditRoom={handleEditRoom}
        onCustomizeAvatar={handleCustomizeAvatar}
      />

      {/* Online count badge */}
      {onlineCount > 0 && (
        <View style={[styles.onlineBadge, { backgroundColor: c.card + "CC" }]}>
          <View style={[styles.onlineDot, { backgroundColor: "#22c55e" }]} />
          <Text style={[styles.onlineText, { color: c.text }]}>
            {onlineCount} here
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  createRoomContainer: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  createRoomContent: {
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  createRoomIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  createRoomTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  createRoomSubtitle: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 250,
  },
  createRoomButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  createRoomButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  roomCanvas: {
    position: "relative",
    overflow: "hidden",
  },
  floorLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.3,
  },
  decorationSlot: {
    position: "absolute",
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  decorationContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  decorationEmoji: {
    fontSize: 24,
  },
  emptySlot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slotIcon: {
    fontSize: 20,
  },
  avatarsLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarPosition: {
    position: "absolute",
    alignItems: "center",
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  roomNameBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roomNameText: {
    fontSize: 12,
    fontWeight: "700",
  },
  editRoomButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
