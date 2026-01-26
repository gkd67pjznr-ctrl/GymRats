// app/create-post.tsx
import { Stack, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { createPost, hydrateFeed, type PostVisibility } from "../src/lib/stores/feedStore";
import type { ID } from "../src/lib/socialModel";
import { useThemeColors } from "../src/ui/theme";

const ME: ID = "u_demo_me";

export default function CreatePostScreen() {
  const c = useThemeColors();
  const router = useRouter();

  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [error, setError] = useState<string | null>(null);

  const remaining = useMemo(() => 240 - text.length, [text.length]);
  const canPublish = text.trim().length >= 1 && remaining >= 0;

  function onPublish() {
    const clean = text.trim();
    if (!clean) return;

    setError(null);

    try {
      hydrateFeed().catch(() => {});
      createPost({ authorUserId: ME, text: clean, visibility });
      router.back();
    } catch {
      setError("Could not publish post.");
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Create Post",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: c.text, fontWeight: "900" }}>Back</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={onPublish} disabled={!canPublish} style={{ paddingHorizontal: 8, paddingVertical: 4, opacity: canPublish ? 1 : 0.45 }}>
              <Text style={{ color: c.text, fontWeight: "900" }}>Post</Text>
            </Pressable>
          ),
        }}
      />

      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}>
          {/* Visibility toggle */}
          <View
            style={{
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              borderRadius: 18,
              padding: 14,
              gap: 10,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Visibility</Text>

            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              <Pressable
                onPress={() => setVisibility("public")}
                style={({ pressed }) => ({
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: visibility === "public" ? c.bg : c.card,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: c.text, fontWeight: "900" }}>Public</Text>
              </Pressable>

              <Pressable
                onPress={() => setVisibility("friends")}
                style={({ pressed }) => ({
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: visibility === "friends" ? c.bg : c.card,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: c.text, fontWeight: "900" }}>Friends</Text>
              </Pressable>
            </View>

            <Text style={{ color: c.muted, fontWeight: "700" }}>
              {visibility === "public"
                ? "Anyone can view and like (unless blocked)."
                : "Only friends can view and like. Perfect for training logs."}
            </Text>
          </View>

          {/* Composer */}
          <View
            style={{
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.card,
              borderRadius: 18,
              padding: 14,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Post</Text>
              <Text style={{ color: remaining < 0 ? c.text : c.muted, fontWeight: "900", fontSize: 12 }}>
                {remaining}
              </Text>
            </View>

            <View
              style={{
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.bg,
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="What’s the move today?"
                placeholderTextColor={c.muted}
                style={{ color: c.text, fontWeight: "700", minHeight: 120 }}
                multiline
                autoCorrect
              />
            </View>

            {error ? <Text style={{ color: c.text, fontWeight: "900" }}>{error}</Text> : null}

            <Pressable
              onPress={onPublish}
              disabled={!canPublish}
              style={({ pressed }) => ({
                alignSelf: "flex-end",
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.bg,
                opacity: !canPublish ? 0.45 : pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: c.text, fontWeight: "900" }}>Publish</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
