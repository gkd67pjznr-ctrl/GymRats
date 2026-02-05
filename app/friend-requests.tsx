// app/friend-requests.tsx
// Dedicated screen for managing incoming friend requests with accept/decline actions
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { Pressable, ScrollView, Text, View, RefreshControl } from "react-native";
import { useUser } from "../src/lib/stores/authStore";
import {
  acceptFriendRequest,
  declineFriendRequest,
  usePendingFriendRequests,
  useFriendsStore,
} from "../src/lib/stores/friendsStore";
import { useUserProfiles } from "../src/lib/stores/userProfileStore";
import type { ID } from "../src/lib/socialModel";
import { useThemeColors } from "../src/ui/theme";
import { ProtectedRoute } from "../src/ui/components/ProtectedRoute";
import { ScreenHeader } from "../src/ui/components/ScreenHeader";
import { FR } from "../src/ui/GrStyle";

export default function FriendRequestsScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const user = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const { pullFromServer } = useFriendsStore();

  const userId = user?.id ?? "";

  // Get pending friend requests (incoming)
  const pendingRequests = usePendingFriendRequests(userId);
  const requestUserIds = pendingRequests.map(e => e.otherUserId);
  const requestProfiles = useUserProfiles(requestUserIds);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await pullFromServer();
    } catch (err) {
      console.error('[FriendRequests] Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  }

  const handleAccept = useCallback((otherUserId: ID) => {
    acceptFriendRequest(userId, otherUserId);
  }, [userId]);

  const handleDecline = useCallback((otherUserId: ID) => {
    declineFriendRequest(userId, otherUserId);
  }, [userId]);

  return (
    <ProtectedRoute>
      <ScreenHeader title="Friend Requests" />

      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header with count */}
          <View style={{ gap: 4, marginBottom: 8 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>
              Pending Requests
            </Text>
            <Text style={{ color: c.muted, fontWeight: "700" }}>
              {pendingRequests.length === 0
                ? "No pending friend requests"
                : `${pendingRequests.length} ${pendingRequests.length === 1 ? "person wants" : "people want"} to be your friend`}
            </Text>
          </View>

          {/* Empty state */}
          {pendingRequests.length === 0 && (
            <View
              style={{
                padding: 32,
                alignItems: "center",
                gap: 12,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 16,
                backgroundColor: c.card,
              }}
            >
              <Text style={{ fontSize: 48 }}>👋</Text>
              <Text style={{ color: c.muted, textAlign: "center", fontWeight: "700" }}>
                All caught up! No pending friend requests.
              </Text>
              <Pressable
                onPress={() => router.push("/friends")}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: c.accent,
                }}
              >
                <Text style={{ color: c.bg, fontWeight: "900" }}>Find Friends</Text>
              </Pressable>
            </View>
          )}

          {/* Request cards */}
          {pendingRequests.map((edge) => {
            const profile = requestProfiles[edge.otherUserId];
            const displayName = profile?.displayName ?? edge.otherUserId;
            const avatarUrl = profile?.avatarUrl;

            return (
              <View
                key={edge.otherUserId}
                style={{
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.card,
                  borderRadius: 16,
                  padding: 16,
                  gap: 12,
                }}
              >
                {/* User info row */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  {/* Avatar placeholder */}
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: c.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>
                      {displayName}
                    </Text>
                    <Text style={{ color: c.muted, fontSize: 12, fontWeight: "700" }}>
                      Sent you a friend request
                    </Text>
                  </View>
                </View>

                {/* Action buttons */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={() => handleAccept(edge.otherUserId)}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: c.accent,
                      alignItems: "center",
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ color: c.bg, fontWeight: "900" }}>Accept</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleDecline(edge.otherUserId)}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: c.border,
                      backgroundColor: c.bg,
                      alignItems: "center",
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ color: c.text, fontWeight: "900" }}>Decline</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          {/* Link back to Friends */}
          {pendingRequests.length > 0 && (
            <Pressable
              onPress={() => router.push("/friends")}
              style={{
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: c.muted, fontWeight: "700" }}>
                View all friends
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}
