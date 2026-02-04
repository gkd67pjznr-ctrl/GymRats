// src/ui/components/Home/FriendsDropdown.tsx
// Friends header dropdown with online/working out counts

import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useThemeColors } from "../../theme";
import { makeDesignSystem } from "../../designSystem";
import { useUser } from "../../../lib/stores/authStore";
import { useFriendEdges } from "../../../lib/stores/friendsStore";
import { useRoomPresences } from "../../../lib/hangout/hangoutStore";
import { useUserProfileStore } from "../../../lib/stores/userProfileStore";
import type { UserPresence } from "../../../lib/hangout/hangoutTypes";
import { AvatarView } from "../Avatar/AvatarView";

interface FriendsDropdownProps {
  onSelectFriend?: (friendId: string) => void;
}

interface FriendWithPresence {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  presence?: UserPresence;
  isOnline: boolean;
  isWorkingOut: boolean;
}

export function FriendsDropdown({ onSelectFriend }: FriendsDropdownProps) {
  const c = useThemeColors();
  const ds = makeDesignSystem("dark", "toxic");
  const router = useRouter();

  const user = useUser();
  const friendEdges = useFriendEdges(user?.id || "");
  const roomPresences = useRoomPresences();
  const userProfiles = useUserProfileStore(s => s.profiles);

  const [isExpanded, setIsExpanded] = useState(false);

  // Get friends with presence data
  const friendsWithPresence: FriendWithPresence[] = useMemo(() => {
    return friendEdges
      .filter(edge => edge.status === "friends")
      .map(edge => {
        const presence = roomPresences.find(p => p.userId === edge.otherUserId);
        const profile = userProfiles[edge.otherUserId];
        return {
          userId: edge.otherUserId,
          displayName: profile?.displayName || "Friend",
          avatarUrl: profile?.avatarUrl || undefined,
          presence,
          isOnline: presence?.status === "online" || presence?.status === "working_out" || presence?.status === "resting",
          isWorkingOut: presence?.status === "working_out",
        };
      });
  }, [friendEdges, roomPresences, userProfiles]);

  // Count online and working out friends
  const onlineCount = friendsWithPresence.filter(f => f.isOnline).length;
  const workingOutCount = friendsWithPresence.filter(f => f.isWorkingOut).length;

  const handleSelectFriend = useCallback((friendId: string) => {
    setIsExpanded(false);
    onSelectFriend?.(friendId);
  }, [onSelectFriend]);

  const handleViewAllFriends = useCallback(() => {
    setIsExpanded(false);
    router.push("/friends");
  }, [router]);

  const renderFriendItem = ({ item }: { item: FriendWithPresence }) => (
    <Pressable
      style={[styles.friendItem, { borderBottomColor: c.border }]}
      onPress={() => handleSelectFriend(item.userId)}
    >
      <AvatarView
        userId={item.userId}
        displayName={item.displayName}
        avatarUrl={item.avatarUrl}
        size="small"
        showStatus
        status={item.presence?.status || "offline"}
      />
      <View style={styles.friendInfo}>
        <Text style={[styles.friendName, { color: c.text }]} numberOfLines={1}>
          {item.displayName}
        </Text>
        <Text style={[styles.friendStatus, { color: item.isWorkingOut ? ds.tone.accent : c.muted }]}>
          {item.isWorkingOut
            ? item.presence?.activity || "Working out"
            : item.isOnline
              ? "Online"
              : "Offline"}
        </Text>
      </View>
      {item.isWorkingOut && (
        <View style={[styles.workingOutBadge, { backgroundColor: ds.tone.accent + "20" }]}>
          <Ionicons name="barbell" size={14} color={ds.tone.accent} />
        </View>
      )}
    </Pressable>
  );

  return (
    <>
      {/* Dropdown Toggle Button */}
      <Pressable
        onPress={() => setIsExpanded(true)}
        style={[styles.dropdownButton, { backgroundColor: c.card, borderColor: c.border }]}
      >
        <View style={styles.dropdownLeft}>
          <Ionicons name="people" size={20} color={c.text} />
          <Text style={[styles.dropdownLabel, { color: c.text }]}>Friends</Text>
        </View>

        <View style={styles.dropdownRight}>
          {/* Online indicator */}
          <View style={styles.countBadge}>
            <View style={[styles.onlineDot, { backgroundColor: "#22c55e" }]} />
            <Text style={[styles.countText, { color: c.text }]}>{onlineCount}</Text>
          </View>

          {/* Working out indicator */}
          {workingOutCount > 0 && (
            <View style={[styles.workoutCountBadge, { backgroundColor: ds.tone.accent + "20" }]}>
              <Ionicons name="barbell" size={12} color={ds.tone.accent} />
              <Text style={[styles.countText, { color: ds.tone.accent }]}>{workingOutCount}</Text>
            </View>
          )}

          <Ionicons name="chevron-down" size={18} color={c.muted} />
        </View>
      </Pressable>

      {/* Dropdown Modal */}
      <Modal
        visible={isExpanded}
        transparent
        animationType="fade"
        onRequestClose={() => setIsExpanded(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsExpanded(false)}
        >
          <View
            style={[styles.dropdownContent, { backgroundColor: c.card, borderColor: c.border }]}
          >
            {/* Header */}
            <View style={[styles.dropdownHeader, { borderBottomColor: c.border }]}>
              <Text style={[styles.dropdownTitle, { color: c.text }]}>Friends</Text>
              <View style={styles.headerStats}>
                <View style={styles.statItem}>
                  <View style={[styles.onlineDot, { backgroundColor: "#22c55e" }]} />
                  <Text style={[styles.statText, { color: c.text }]}>{onlineCount} online</Text>
                </View>
                {workingOutCount > 0 && (
                  <View style={styles.statItem}>
                    <Ionicons name="barbell" size={14} color={ds.tone.accent} />
                    <Text style={[styles.statText, { color: ds.tone.accent }]}>
                      {workingOutCount} training
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Friends List */}
            {friendsWithPresence.length > 0 ? (
              <FlatList
                data={friendsWithPresence}
                keyExtractor={(item) => item.userId}
                renderItem={renderFriendItem}
                style={styles.friendsList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: c.muted }]}>
                  No friends yet
                </Text>
                <Pressable
                  onPress={() => {
                    setIsExpanded(false);
                    router.push("/friends");
                  }}
                  style={[styles.addFriendsButton, { borderColor: ds.tone.accent }]}
                >
                  <Text style={[styles.addFriendsText, { color: ds.tone.accent }]}>
                    Add Friends
                  </Text>
                </Pressable>
              </View>
            )}

            {/* View All Button */}
            {friendsWithPresence.length > 0 && (
              <Pressable
                onPress={handleViewAllFriends}
                style={[styles.viewAllButton, { borderTopColor: c.border }]}
              >
                <Text style={[styles.viewAllText, { color: ds.tone.accent }]}>
                  View All Friends
                </Text>
                <Ionicons name="chevron-forward" size={16} color={ds.tone.accent} />
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  dropdownRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
  },
  workoutCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-start",
    paddingTop: 120,
    paddingHorizontal: 16,
  },
  dropdownContent: {
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: 400,
    overflow: "hidden",
  },
  dropdownHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  headerStats: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: "500",
  },
  friendsList: {
    maxHeight: 250,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 15,
    fontWeight: "600",
  },
  friendStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  workingOutBadge: {
    padding: 8,
    borderRadius: 20,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  addFriendsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  addFriendsText: {
    fontSize: 14,
    fontWeight: "600",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 14,
    borderTopWidth: 1,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
