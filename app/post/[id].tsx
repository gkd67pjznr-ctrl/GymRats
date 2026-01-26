// app/post/[id].tsx
import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { EmoteId } from "../../src/lib/socialModel";
import {
    addComment,
    toggleReaction,
    useMyReaction,
    usePost,
    usePostComments,
} from "../../src/lib/stores/socialStore";
import { useThemeColors } from "../../src/ui/theme";

const MY_USER_ID = "u_demo_me"; // v1 placeholder (later: auth)
const MY_NAME = "You";

function emoteLabel(e: EmoteId): string {
  if (e === "like") return "👍";
  if (e === "fire") return "🔥";
  if (e === "skull") return "💀";
  if (e === "crown") return "👑";
  if (e === "bolt") return "⚡";
  return "👏";
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

export default function PostDetailScreen() {
  const c = useThemeColors();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id ?? "";

  const post = usePost(id);
  const comments = usePostComments(id);
  const myReaction = useMyReaction(id, MY_USER_ID);

  const [text, setText] = useState("");

  const topLines = useMemo(() => post?.workoutSnapshot?.topLines?.slice(0, 8) ?? [], [post]);

  const EmoteButton = (p: { emote: EmoteId }) => {
    const active = myReaction?.emote === p.emote;
    return (
      <Pressable
        onPress={() => toggleReaction(id, MY_USER_ID, p.emote)}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 10,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: active ? c.text : c.border,
          backgroundColor: active ? c.bg : c.card,
        }}
      >
        <Text style={{ color: c.text, fontWeight: "900" }}>{emoteLabel(p.emote)}</Text>
      </Pressable>
    );
  };

  const Button = (p: { title: string; onPress: () => void; disabled?: boolean }) => (
    <Pressable
      onPress={p.onPress}
      disabled={p.disabled}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.card,
        alignItems: "center",
        opacity: p.disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ color: c.text, fontWeight: "900" }}>{p.title}</Text>
    </Pressable>
  );

  function submit() {
    const ok = addComment(id, MY_USER_ID, MY_NAME, text);
    if (!ok) return;
    setText("");
  }

  return (
    <>
      <Stack.Screen options={{ title: "Post" }} />
      <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
        {!post ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: c.border,
              borderRadius: 14,
              padding: 16,
              backgroundColor: c.card,
              gap: 8,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Post not found</Text>
            <Text style={{ color: c.muted }}>This post may have been deleted or hasn’t loaded yet.</Text>
          </View>
        ) : (
          <>
            {/* Header */}
            <View
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 16,
                padding: 14,
                backgroundColor: c.card,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
                <Text style={{ color: c.text, fontWeight: "900", fontSize: 18 }}>
                  {post.authorDisplayName}
                </Text>
                <Text style={{ color: c.muted, fontWeight: "800" }}>{timeAgo(post.createdAtMs)}</Text>
              </View>

              {!!post.title && <Text style={{ color: c.text, fontWeight: "900" }}>{post.title}</Text>}
              {!!post.caption && <Text style={{ color: c.text, lineHeight: 18 }}>{post.caption}</Text>}

              <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                <Text style={{ color: c.muted, fontWeight: "800" }}>❤️ {post.likeCount}</Text>
                <Text style={{ color: c.muted, fontWeight: "800" }}>💬 {post.commentCount}</Text>
                {!!post.durationSec && (
                  <Text style={{ color: c.muted, fontWeight: "800" }}>⏱ {Math.round(post.durationSec / 60)}m</Text>
                )}
                {!!post.exerciseCount && (
                  <Text style={{ color: c.muted, fontWeight: "800" }}>🏋️ {post.exerciseCount} ex</Text>
                )}
                {!!post.setCount && <Text style={{ color: c.muted, fontWeight: "800" }}>✅ {post.setCount} sets</Text>}
              </View>

              <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                <EmoteButton emote="like" />
                <EmoteButton emote="fire" />
                <EmoteButton emote="crown" />
                <EmoteButton emote="clap" />
                <EmoteButton emote="bolt" />
              </View>
            </View>

            {/* Snapshot */}
            {topLines.length > 0 && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: 16,
                  padding: 14,
                  backgroundColor: c.card,
                  gap: 10,
                }}
              >
                <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>
                  Workout Snapshot
                </Text>

                {topLines.map((t, idx) => (
                  <View
                    key={`${t.exerciseName}-${idx}`}
                    style={{
                      borderWidth: 1,
                      borderColor: c.border,
                      borderRadius: 12,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      backgroundColor: c.bg,
                      gap: 2,
                    }}
                  >
                    <Text style={{ color: c.text, fontWeight: "900" }}>{t.exerciseName}</Text>
                    {!!t.bestSet && (
                      <Text style={{ color: c.muted }}>
                        {t.bestSet.weightLabel} × {t.bestSet.reps}
                        {t.bestSet.e1rmLabel ? ` • e1RM ${t.bestSet.e1rmLabel}` : ""}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Add comment */}
            <View
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 16,
                padding: 14,
                backgroundColor: c.card,
                gap: 10,
              }}
            >
              <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>Comments</Text>

              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Write a comment…"
                placeholderTextColor={c.muted}
                style={{
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  color: c.text,
                  backgroundColor: c.bg,
                }}
              />

              <Button title="Post Comment" onPress={submit} disabled={!text.trim()} />

              {comments.length === 0 ? (
                <Text style={{ color: c.muted }}>No comments yet.</Text>
              ) : (
                comments.map((cm) => (
                  <View
                    key={cm.id}
                    style={{
                      borderWidth: 1,
                      borderColor: c.border,
                      borderRadius: 12,
                      padding: 12,
                      backgroundColor: c.bg,
                      gap: 4,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ color: c.text, fontWeight: "900" }}>{cm.userDisplayName}</Text>
                      <Text style={{ color: c.muted, fontWeight: "800", fontSize: 12 }}>{timeAgo(cm.createdAtMs)}</Text>
                    </View>
                    <Text style={{ color: c.text, lineHeight: 18 }}>{cm.text}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}
