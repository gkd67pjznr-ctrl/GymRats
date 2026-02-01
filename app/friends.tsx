// app/friends.tsx
import { Stack, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator, RefreshControl, TextInput } from "react-native";
import { useUser } from "../src/lib/stores/authStore";
import { ensureThread } from "../src/lib/stores/chatStore";
import {
  acceptFriendRequest,
  areFriends,
  getFriendStatus,
  sendFriendRequest,
  useFriendEdges,
  setupFriendsRealtime,
  useFriendsStore,
} from "../src/lib/stores/friendsStore";
import {
  useUserProfile,
  searchUserProfiles,
} from "../src/lib/stores/userProfileStore";
import type { ID, UserProfile } from "../src/lib/socialModel";
import { useThemeColors } from "../src/ui/theme";
import { ProtectedRoute } from "../src/ui/components/ProtectedRoute";
import { SyncStatusIndicator } from "../src/ui/components/SyncStatusIndicator";
import { FR } from "../src/ui/forgerankStyle";

const ME: ID = "u_demo_me";

function labelForStatus(opts: {
  isFriends: boolean;
  outgoing: string;
  incoming: string;
}): string {
  const { isFriends, outgoing, incoming } = opts;
  if (isFriends) return "friends";
  if (outgoing === "blocked" || incoming === "blocked") return "blocked";
  if (incoming === "requested") return "incoming request";
  if (outgoing === "requested") return "request sent";
  return "not friends";
}

export default function FriendsScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const user = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const { pullFromServer } = useFriendsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const userId = user?.id ?? ME;

  // Get friend edges from store (now sync-enabled)
  const friendEdges = useFriendEdges(userId);

  // Setup realtime subscriptions for friends
  useEffect(() => {
    if (user?.id) {
      const cleanup = setupFriendsRealtime(user.id);
      return cleanup;
    }
  }, [user?.id]);

  // Pull to refresh
  async function onRefresh() {
    setRefreshing(true);
    try {
      await pullFromServer();
    } catch (err) {
      console.error('[Friends] Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  }

  // User search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchUserProfiles(searchQuery.trim());
          setSearchResults(results.filter((p) => p.id !== userId));
        } catch (err) {
          console.error('[Friends] Search failed:', err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, userId]);

  // Combine search results with friends (show search results when searching)
  const showSearchResults = searchQuery.trim().length >= 2;
  const displayedUsers = showSearchResults ? searchResults : friendEdges.map((e) => {
    const profile = useUserProfile(e.otherUserId);
    return {
      id: e.otherUserId,
      displayName: profile?.displayName ?? e.otherUserId,
      email: "",
      avatarUrl: profile?.avatarUrl ?? null,
      createdAt: 0,
      updatedAt: 0,
    };
  });

  return (
    <ProtectedRoute>
      <Stack.Screen
        options={{
          title: "Friends",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: c.text, fontWeight: "900" }}>Back</Text>
            </Pressable>
          ),
        }}
      />

      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={{ gap: 6, marginBottom: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>Friends</Text>
              <SyncStatusIndicator displayMode="compact" storeName="friends" />
            </View>
            <Text style={{ color: c.muted, fontWeight: "700" }}>
              Friends-only messaging is enforced in the chat store. Manage requests here.
            </Text>
          </View>

          {/* Search Bar */}
          <View style={{ gap: 4 }}>
            <Text style={{ color: c.muted, ...FR.type.sub }}>Find people</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or email..."
              placeholderTextColor={c.muted}
              style={{
                ...FR.card({ card: c.card, border: c.border }),
                color: c.text,
                ...FR.type.body,
                paddingVertical: FR.space.x3,
                paddingHorizontal: FR.space.x3,
                minHeight: 44,
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Search results indicator */}
          {showSearchResults && (
            <Text style={{ color: c.muted, ...FR.type.sub }}>
              {isSearching
                ? "Searching..."
                : searchResults.length === 0
                  ? "No results found"
                  : `Found ${searchResults.length} ${searchResults.length === 1 ? "person" : "people"}`
              }
            </Text>
          )}

          {displayedUsers.map((p) => {
            const isFriends = areFriends(userId, p.id);

            // We look both directions to infer a simple request state.
            // Convention we're assuming:
            // - getFriendStatus(A, B) === "requested" means A requested B
            const outgoing = String(getFriendStatus(userId, p.id) ?? "none");
            const incoming = String(getFriendStatus(p.id, userId) ?? "none");

            const label = labelForStatus({ isFriends, outgoing, incoming });

            const blocked = outgoing === "blocked" || incoming === "blocked";
            const canSendRequest = !isFriends && !blocked && outgoing !== "requested" && incoming !== "requested";
            const canAccept = !isFriends && !blocked && incoming === "requested";

            return (
              <View
                key={p.id}
                style={{
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.card,
                  borderRadius: 16,
                  padding: 14,
                  gap: 10,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <View style={{ gap: 4, flexShrink: 1 }}>
                    <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>{p.displayName}</Text>
                    {showSearchResults && (
                      <Text style={{ color: c.muted, fontWeight: "700", fontSize: 12 }}>
                        {p.email}
                      </Text>
                    )}
                  </View>

                  <View
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: c.border,
                      backgroundColor: c.bg,
                    }}
                  >
                    <Text style={{ color: c.text, fontWeight: "900", fontSize: 12 }}>{label}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                  {canSendRequest ? (
                    <Pressable
                      onPress={() => {
                        sendFriendRequest(userId, p.id);
                      }}
                      style={({ pressed }) => ({
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: c.border,
                        backgroundColor: c.bg,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ color: c.text, fontWeight: "900" }}>Send request</Text>
                    </Pressable>
                  ) : null}

                  {canAccept ? (
                    <Pressable
                      onPress={() => {
                        // accept as userId, where p.id was the requester
                        acceptFriendRequest(userId, p.id);
                      }}
                      style={({ pressed }) => ({
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: c.border,
                        backgroundColor: c.bg,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ color: c.text, fontWeight: "900" }}>Accept</Text>
                    </Pressable>
                  ) : null}

                  {isFriends ? (
                    <Pressable
                      onPress={() => {
                        const t = ensureThread(userId, p.id, "friendsOnly");
                        router.push((`/dm/${t.id}` as any) as any);
                      }}
                      style={({ pressed }) => ({
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: c.border,
                        backgroundColor: c.bg,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ color: c.text, fontWeight: "900" }}>Open DM</Text>
                    </Pressable>
                  ) : null}
                </View>

                {/* tiny debug line (remove later if you want) */}
                <Text style={{ color: c.muted, fontWeight: "700", fontSize: 12 }}>
                  outgoing: {outgoing} • incoming: {incoming}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}
