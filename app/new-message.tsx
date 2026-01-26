// app/new-message.tsx
import { Stack, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ensureThread } from "../src/lib/stores/chatStore";
import { areFriends, hydrateFriends } from "../src/lib/stores/friendsStore";
import type { ID } from "../src/lib/socialModel";
import { useThemeColors } from "../src/ui/theme";

const ME: ID = "u_demo_me";

// v1 mock directory (later: search + real profiles)
const DIRECTORY: Array<{ id: ID; name: string; subtitle?: string }> = [
  { id: "u_demo_1", name: "Sarah", subtitle: "Leg day enabler" },
  { id: "u_demo_2", name: "TJ", subtitle: "Chaos + caffeine" },
  { id: "u_demo_3", name: "Mark", subtitle: "Gym homie" },
  { id: "u_demo_4", name: "Olivia", subtitle: "Runner arc" },
];

export default function NewMessageScreen() {
  const c = useThemeColors();
  const router = useRouter();

  hydrateFriends().catch(() => {});

  const [q, setQ] = useState("");

  const people = useMemo(() => {
    const base = DIRECTORY.filter((p) => p.id !== ME);
    const query = q.trim().toLowerCase();
    if (!query) return base;
    return base.filter((p) => p.name.toLowerCase().includes(query));
  }, [q]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "New Message",
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
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}>
          <View style={{ gap: 6 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "900" }}>Pick someone</Text>
            <Text style={{ color: c.muted, fontWeight: "700" }}>
              Tap a person to view their profile. You can add them or message if friends.
            </Text>
          </View>

          {/* Search */}
          <View
            style={{
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search…"
              placeholderTextColor={c.muted}
              style={{ color: c.text, fontWeight: "700" }}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>

          {people.length === 0 ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.card,
                borderRadius: 16,
                padding: 14,
                gap: 6,
              }}
            >
              <Text style={{ color: c.text, fontWeight: "900" }}>No results</Text>
              <Text style={{ color: c.muted }}>Try a different name.</Text>
            </View>
          ) : null}

          {people.map((p) => {
            const isFriends = areFriends(ME, p.id);

            return (
              <Pressable
                key={p.id}
                onPress={() => router.push((`/u/${p.id}` as any) as any)}
                style={({ pressed }) => ({
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.card,
                  borderRadius: 16,
                  padding: 14,
                  opacity: pressed ? 0.7 : 1,
                  gap: 8,
                })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <View style={{ gap: 4, flexShrink: 1 }}>
                    <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>{p.name}</Text>
                    {!!p.subtitle ? <Text style={{ color: c.muted, fontWeight: "700" }}>{p.subtitle}</Text> : null}
                  </View>

                  <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                    {/* Status pill */}
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
                      <Text style={{ color: c.muted, fontWeight: "900", fontSize: 12 }}>
                        {isFriends ? "friends" : "friends-only"}
                      </Text>
                    </View>

                    {/* Power-user shortcut: message if friends */}
                    {isFriends ? (
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation?.();
                          const thread = ensureThread(ME, p.id, "friendsOnly");
                          router.push((`/dm/${thread.id}` as any) as any);
                        }}
                        style={({ pressed }) => ({
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: c.border,
                          backgroundColor: c.bg,
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Text style={{ color: c.text, fontWeight: "900", fontSize: 12 }}>Message</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
}
