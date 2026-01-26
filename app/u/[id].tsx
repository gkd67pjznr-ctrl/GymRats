// app/u/[id].tsx
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ensureThread } from "../../src/lib/stores/chatStore";
import {
    canUserInteractWithPost,
    canUserViewPost,
    getAllPosts,
    toggleLike,
    useVisibleFeed,
    type FeedPost,
} from "../../src/lib/stores/feedStore";
import {
    acceptFriendRequest,
    areFriends,
    getFriendStatus,
    hydrateFriends,
    sendFriendRequest,
} from "../../src/lib/stores/friendsStore";
import type { ID } from "../../src/lib/socialModel";
import { getUser, ME_ID } from "../../src/lib/userDirectory";
import { useThemeColors } from "../../src/ui/theme";

const ME: ID = ME_ID;

function labelForStatus(opts: { isFriends: boolean; outgoing: string; incoming: string }): string {
  const { isFriends, outgoing, incoming } = opts;
  if (isFriends) return "friends";
  if (outgoing === "blocked" || incoming === "blocked") return "blocked";
  if (incoming === "requested") return "incoming request";
  if (outgoing === "requested") return "request sent";
  return "not friends";
}

function timeAgo(ms: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function visibilityLabel(v: FeedPost["visibility"]): string {
  return v === "public" ? "public" : "friends";
}

export default function PublicProfileScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  hydrateFriends().catch(() => {});

  const userId = (params?.id ?? "") as ID;

  if (!userId) {
    return (
      <>
        <Stack.Screen options={{ title: "Profile" }} />
        <View style={{ flex: 1, backgroundColor: c.bg, padding: 16, gap: 12 }}>
          <Text style={{ color: c.text, fontWeight: "900", fontSize: 18 }}>Missing user id</Text>
          <Pressable
            onPress={() => router.back()}
            style={{
              alignSelf: "flex-start",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900" }}>Back</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const u = getUser(userId);

  const isMe = userId === ME;
  const isFriends = !isMe && areFriends(ME, userId);

  // Convention: getFriendStatus(A, B) === "requested" means A requested B
  const outgoing = String(getFriendStatus(ME, userId) ?? "none");
  const incoming = String(getFriendStatus(userId, ME) ?? "none");
  const label = isMe ? "you" : labelForStatus({ isFriends, outgoing, incoming });

  const blocked = outgoing === "blocked" || incoming === "blocked";
  const canSendRequest = !isMe && !isFriends && !blocked && outgoing !== "requested" && incoming !== "requested";
  const canAccept = !isMe && !isFriends && !blocked && incoming === "requested";

  const { liked, likeCount } = useVisibleFeed(ME);
  const all = getAllPosts();

  const theirPosts = all
    .filter((p) => p.authorUserId === userId)
    .filter((p) => canUserViewPost(p, ME));

  return (
    <>
      <Stack.Screen
        options={{
          title: "Profile",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: c.text, fontWeight: "900" }}>Back</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => router.push(("/friends" as any) as any)} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: c.text, fontWeight: "900" }}>Friends</Text>
            </Pressable>
          ),
        }}
      />

      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}>
          {/* Header card */}
          <View
            style={{
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              borderRadius: 18,
              padding: 16,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <View style={{ gap: 6, flexShrink: 1 }}>
                <Text style={{ color: c.text, fontWeight: "900", fontSize: 20 }}>{u.name}</Text>
                {u.subtitle ? <Text style={{ color: c.muted, fontWeight: "700" }}>{u.subtitle}</Text> : null}
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

            {u.bio ? <Text style={{ color: c.muted, fontWeight: "700", lineHeight: 18 }}>{u.bio}</Text> : null}

            {/* Action row */}
            {!isMe ? (
              <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                {canSendRequest ? (
                  <Pressable
                    onPress={() => sendFriendRequest(ME as any, userId as any)}
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
                    <Text style={{ color: c.text, fontWeight: "900" }}>Send friend request</Text>
                  </Pressable>
                ) : null}

                {canAccept ? (
                  <Pressable
                    onPress={() => acceptFriendRequest(ME as any, userId as any)}
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
                    <Text style={{ color: c.text, fontWeight: "900" }}>Accept request</Text>
                  </Pressable>
                ) : null}

                {isFriends ? (
                  <Pressable
                    onPress={() => {
                      const t = ensureThread(ME, userId, "friendsOnly");
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
                    <Text style={{ color: c.text, fontWeight: "900" }}>Message</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* Posts */}
          <View style={{ gap: 10 }}>
            <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Posts</Text>

            {theirPosts.length === 0 ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.card,
                  borderRadius: 18,
                  padding: 16,
                  gap: 6,
                }}
              >
                <Text style={{ color: c.text, fontWeight: "900" }}>No posts to show</Text>
                <Text style={{ color: c.muted, fontWeight: "700" }}>
                  If they have friends-only posts, you’ll see them once you’re friends.
                </Text>
              </View>
            ) : null}

            {theirPosts.map((p) => {
              const isLiked = liked(p.id);
              const nLikes = likeCount(p.id);
              const canInteract = canUserInteractWithPost(p, ME);

              return (
                <View
                  key={p.id}
                  style={{
                    borderWidth: 1,
                    borderColor: c.border,
                    backgroundColor: c.card,
                    borderRadius: 18,
                    padding: 14,
                    gap: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View
                        style={{
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: c.border,
                          backgroundColor: c.bg,
                        }}
                      >
                        <Text style={{ color: c.muted, fontWeight: "900", fontSize: 11 }}>
                          {visibilityLabel(p.visibility)}
                        </Text>
                      </View>

                      <Text style={{ color: c.muted, fontWeight: "800", fontSize: 12 }}>{timeAgo(p.createdAtMs)}</Text>
                    </View>

                    <Text style={{ color: c.muted, fontWeight: "800", fontSize: 12 }}>{nLikes} likes</Text>
                  </View>

                  <Text style={{ color: c.text, fontWeight: "700", lineHeight: 20 }}>{p.text}</Text>

                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                    <Pressable
                      onPress={() => {
                        if (!canInteract) return;
                        toggleLike(p.id, ME);
                      }}
                      disabled={!canInteract}
                      style={({ pressed }) => ({
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: c.border,
                        backgroundColor: c.bg,
                        opacity: !canInteract ? 0.45 : pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ color: c.text, fontWeight: "900", fontSize: 12 }}>
                        {isLiked ? "Liked" : "Like"}
                      </Text>
                    </Pressable>
                  </View>

                  {!canInteract ? (
                    <Text style={{ color: c.muted, fontWeight: "800", fontSize: 12 }}>
                      Friends-only interaction. Add friend to like/comment.
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
