// app/(tabs)/feed.tsx
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { EmoteId, WorkoutPost } from "../../src/lib/socialModel";
import { toggleReaction, useFeedAll, useMyReaction } from "../../src/lib/stores/socialStore";
import { useThemeColors } from "../../src/ui/theme";
import { TabErrorBoundary } from "../../src/ui/tab-error-boundary";

const MY_USER_ID = "u_demo_me"; // v1 placeholder (later: auth user id)

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

function emoteLabel(e: EmoteId): string {
  if (e === "like") return "👍";
  if (e === "fire") return "🔥";
  if (e === "skull") return "💀";
  if (e === "crown") return "👑";
  if (e === "bolt") return "⚡";
  return "👏";
}

function compactNum(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(1).replace(".0", "")}k`;
  return `${(n / 1000000).toFixed(1).replace(".0", "")}m`;
}

export default function FeedTab() {
  const c = useThemeColors();
  const posts = useFeedAll();

  const EmoteButton = (p: { postId: string; emote: EmoteId; active?: boolean }) => (
    <Pressable
      onPress={() => toggleReaction(p.postId, MY_USER_ID, p.emote)}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: p.active ? c.text : c.border,
        backgroundColor: p.active ? c.bg : c.card,
      }}
    >
      <Text style={{ color: c.text, fontWeight: "900" }}>{emoteLabel(p.emote)}</Text>
    </Pressable>
  );

  const PostCard = (p: { post: WorkoutPost }) => {
    const my = useMyReaction(p.post.id, MY_USER_ID);
    const top = p.post.workoutSnapshot?.topLines?.slice(0, 2) ?? [];

    return (
      <Link href={`/post/${p.post.id}` as any} asChild>
        <Pressable
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 16,
            padding: 14,
            backgroundColor: c.card,
            gap: 10,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <View style={{ gap: 2 }}>
              <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>
                {p.post.authorDisplayName}
                <Text style={{ color: c.muted, fontWeight: "900" }}>
                  {" "}
                  • {p.post.privacy === "friends" ? "Friends" : "Public"}
                </Text>
              </Text>
              <Text style={{ color: c.muted, fontWeight: "800", fontSize: 12 }}>
                {timeAgo(p.post.createdAtMs)}
              </Text>
            </View>

            {!!p.post.title && (
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
                <Text style={{ color: c.text, fontWeight: "900", fontSize: 12 }}>{p.post.title}</Text>
              </View>
            )}
          </View>

          {/* Caption */}
          {!!p.post.caption && <Text style={{ color: c.text, lineHeight: 18 }}>{p.post.caption}</Text>}

          {/* Snapshot lines */}
          {top.length > 0 && (
            <View style={{ gap: 6 }}>
              {top.map((t, idx) => (
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

          {/* Meta row */}
          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            <Text style={{ color: c.muted, fontWeight: "800" }}>❤️ {compactNum(p.post.likeCount)}</Text>
            <Text style={{ color: c.muted, fontWeight: "800" }}>💬 {compactNum(p.post.commentCount)}</Text>
            {!!p.post.durationSec && (
              <Text style={{ color: c.muted, fontWeight: "800" }}>⏱ {Math.round(p.post.durationSec / 60)}m</Text>
            )}
            {!!p.post.exerciseCount && (
              <Text style={{ color: c.muted, fontWeight: "800" }}>🏋️ {p.post.exerciseCount} ex</Text>
            )}
            {!!p.post.setCount && <Text style={{ color: c.muted, fontWeight: "800" }}>✅ {p.post.setCount} sets</Text>}
          </View>

          {/* Reactions */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <EmoteButton postId={p.post.id} emote="like" active={my?.emote === "like"} />
            <EmoteButton postId={p.post.id} emote="fire" active={my?.emote === "fire"} />
            <EmoteButton postId={p.post.id} emote="crown" active={my?.emote === "crown"} />
            <EmoteButton postId={p.post.id} emote="clap" active={my?.emote === "clap"} />
          </View>

          <Text style={{ color: c.muted, fontSize: 12 }}>Tap to open post.</Text>
        </Pressable>
      </Link>
    );
  };

  return (
    <TabErrorBoundary screenName="Home">
      <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ color: c.text, fontSize: 26, fontWeight: "900" }}>Friends</Text>
        <Text style={{ color: c.muted, lineHeight: 18 }}>
          Public workouts from the community (local-first mock for now).
        </Text>

        {posts.length === 0 ? (
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
            <Text style={{ color: c.text, fontWeight: "900", fontSize: 16 }}>No posts yet</Text>
            <Text style={{ color: c.muted, lineHeight: 18 }}>
              Soon you'll be able to post a workout when you finish, and it will show up here.
            </Text>
          </View>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </ScrollView>
    </TabErrorBoundary>
  );
}
