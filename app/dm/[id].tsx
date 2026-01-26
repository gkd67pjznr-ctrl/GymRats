// app/dm/[id].tsx
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import {
    markThreadRead,
    sendMessage,
    setTyping,
    useOtherUserTyping,
    useThread,
    useThreadMessages,
    useThreadOtherUserId,
} from "../../src/lib/stores/chatStore";
import type { ID } from "../../src/lib/socialModel";
import { useThemeColors } from "../../src/ui/theme";

const ME: ID = "u_demo_me";

// v1 mock directory (later: user profiles + search)
const DIRECTORY: Array<{ id: ID; name: string }> = [
  { id: "u_demo_1", name: "Sarah" },
  { id: "u_demo_2", name: "TJ" },
  { id: "u_demo_3", name: "Mark" },
  { id: "u_demo_4", name: "Olivia" },
];

function displayName(userId: ID): string {
  return DIRECTORY.find((u) => u.id === userId)?.name ?? userId;
}

function timeLabel(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function DMThreadScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const threadId = (params?.id ?? "") as ID;

  const thread = useThread(threadId);
  const messages = useThreadMessages(threadId);
  const otherId = useThreadOtherUserId(thread, ME);

  const otherTyping = useOtherUserTyping(threadId, ME);

  const title = useMemo(() => {
    if (!otherId) return "DM";
    return displayName(otherId);
  }, [otherId]);

  const [draft, setDraftText] = useState("");

  // ✅ Proper ref type for RN ScrollView
  const scrollerRef = useRef<ScrollView>(null);

  // Mark read on open + whenever this screen regains focus-ish (cheap + correct for v1)
  useEffect(() => {
    if (!threadId) return;
    markThreadRead(threadId, ME);
  }, [threadId]);

  // Scroll down + mark read when messages change
  useEffect(() => {
    if (!threadId) return;

    const t = setTimeout(() => {
      scrollerRef.current?.scrollToEnd({ animated: true });
      markThreadRead(threadId, ME);
    }, 50);

    return () => clearTimeout(t);
  }, [threadId, messages.length]);

  const canSend = draft.trim().length > 0;

  function setDraft(next: string) {
    setDraftText(next);

    // Typing state: on while there is any non-empty draft
    const typingNow = next.trim().length > 0;
    setTyping(threadId, ME, typingNow);
  }

  function onSend() {
    const clean = draft.trim();
    if (!clean) return;

    sendMessage(threadId, ME, clean);

    // Clear draft + clear typing
    setDraftText("");
    setTyping(threadId, ME, false);

    // Mark read immediately (sender)
    markThreadRead(threadId, ME);
  }

  // Thread not found (bad route / stale id)
  if (!threadId || !thread) {
    return (
      <>
        <Stack.Screen options={{ title: "DM" }} />
        <View style={{ flex: 1, backgroundColor: c.bg, padding: 16, gap: 12 }}>
          <Text style={{ color: c.text, fontWeight: "900", fontSize: 18 }}>Thread not found</Text>
          <Text style={{ color: c.muted }}>
            This DM id doesn’t exist in the chat store yet. Go back to Chat and open an existing thread.
          </Text>

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

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerLeft: () => (
            <Pressable
              onPress={() => {
                // leaving thread: stop typing
                setTyping(threadId, ME, false);
                router.back();
              }}
              style={{ paddingHorizontal: 8, paddingVertical: 4 }}
            >
              <Text style={{ color: c.text, fontWeight: "900" }}>Back</Text>
            </Pressable>
          ),
        }}
      />

      <View style={{ flex: 1, backgroundColor: c.bg }}>
        {/* Messages */}
        <ScrollView
          ref={scrollerRef}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 110 }}
          onContentSizeChange={() => scrollerRef.current?.scrollToEnd({ animated: true })}
          onScrollBeginDrag={() => markThreadRead(threadId, ME)}
        >
          {messages.length === 0 ? (
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
              <Text style={{ color: c.text, fontWeight: "900" }}>No messages yet</Text>
              <Text style={{ color: c.muted }}>Say something to start the thread.</Text>
            </View>
          ) : null}

          {messages.map((m) => {
            const mine = m.senderUserId === ME;
            return (
              <View
                key={m.id}
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "84%",
                  gap: 4,
                }}
              >
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: c.border,
                    backgroundColor: mine ? c.card : c.bg,
                    borderRadius: 16,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text style={{ color: c.text, fontWeight: "700", lineHeight: 20 }}>{m.text}</Text>
                </View>

                <Text
                  style={{
                    color: c.muted,
                    fontSize: 11,
                    fontWeight: "800",
                    alignSelf: mine ? "flex-end" : "flex-start",
                  }}
                >
                  {timeLabel(m.createdAtMs)}
                </Text>
              </View>
            );
          })}

          {/* Typing indicator (other user) */}
          {otherTyping ? (
            <View style={{ alignSelf: "flex-start", marginTop: 2 }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.card,
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ color: c.muted, fontWeight: "900", fontSize: 12 }}>Typing…</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Composer */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: 12,
            borderTopWidth: 1,
            borderTopColor: c.border,
            backgroundColor: c.bg,
          }}
        >
          <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-end" }}>
            <View
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.card,
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Message…"
                placeholderTextColor={c.muted}
                style={{ color: c.text, fontWeight: "700" }}
                multiline
                autoCorrect
                onBlur={() => setTyping(threadId, ME, false)}
              />
            </View>

            <Pressable
              onPress={onSend}
              disabled={!canSend}
              style={({ pressed }) => ({
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: canSend ? c.text : c.border,
                backgroundColor: canSend ? c.card : c.bg,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: c.text, fontWeight: "900" }}>Send</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}
