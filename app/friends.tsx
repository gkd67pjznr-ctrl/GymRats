// app/friends.tsx
import { Stack, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ensureThread } from "../src/lib/stores/chatStore";
import {
  acceptFriendRequest,
  areFriends,
  getFriendStatus,
  hydrateFriends,
  sendFriendRequest,
} from "../src/lib/stores/friendsStore";
import type { ID } from "../src/lib/socialModel";
import { useThemeColors } from "../src/ui/theme";

const ME: ID = "u_demo_me";

// v1 mock directory (later: real profiles)
const DIRECTORY: Array<{ id: ID; name: string; subtitle?: string }> = [
  { id: "u_demo_1", name: "Sarah", subtitle: "Leg day enabler" },
  { id: "u_demo_2", name: "TJ", subtitle: "Chaos + caffeine" },
  { id: "u_demo_3", name: "Mark", subtitle: "Gym homie" },
  { id: "u_demo_4", name: "Olivia", subtitle: "Runner arc" },
];

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

  // make sure friends store is ready
  hydrateFriends().catch(() => {});

  const people = DIRECTORY.filter((p) => p.id !== ME);

  return (
    <>
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
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}>
          <View style={{ gap: 6, marginBottom: 6 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>Friends</Text>
            <Text style={{ color: c.muted, fontWeight: "700" }}>
              Friends-only messaging is enforced in the chat store. Manage requests here.
            </Text>
          </View>

          {people.map((p) => {
            const isFriends = areFriends(ME, p.id);

            // We look both directions to infer a simple request state.
            // Convention we’re assuming:
            // - getFriendStatus(A, B) === "requested" means A requested B
            const outgoing = String(getFriendStatus(ME, p.id) ?? "none");
            const incoming = String(getFriendStatus(p.id, ME) ?? "none");

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
                    <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>{p.name}</Text>
                    {!!p.subtitle ? <Text style={{ color: c.muted, fontWeight: "700" }}>{p.subtitle}</Text> : null}
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
                        sendFriendRequest(ME as any, p.id as any);
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
                        // accept as ME, where p.id was the requester
                        acceptFriendRequest(ME as any, p.id as any);
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
                        const t = ensureThread(ME, p.id, "friendsOnly");
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
    </>
  );
}
