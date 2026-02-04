// app/post/[id].tsx
import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    toggleReaction,
    useMyReaction,
    usePost,
    usePostReactions,
} from "../../src/lib/stores/socialStore";
import { useUser } from "../../src/lib/stores/authStore";
import { useThemeColors } from "../../src/ui/theme";
import { KeyboardAwareScrollView } from "../../src/ui/components/KeyboardAwareScrollView";
import { timeAgo } from "../../src/lib/units";
import { ProtectedRoute } from "../../src/ui/components/ProtectedRoute";
import { ME_ID } from "../../src/lib/userDirectory";
import { FR } from "../../src/ui/GrStyle";
import {
  AnimatedReactionButton,
  ReactionsModal,
  CommentsSection,
  RankBadge,
  PhotoCard,
} from "../../src/ui/components/Social";

export default function PostDetailScreen() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id ?? "";
  const user = useUser();

  const post = usePost(id);
  const reactions = usePostReactions(id);
  const userId = user?.id ?? ME_ID;
  const myReaction = useMyReaction(id, userId);
  const [showReactionsModal, setShowReactionsModal] = useState(false);

  const topLines = useMemo(() => post?.workoutSnapshot?.topLines?.slice(0, 8) ?? [], [post]);

  // Count reactions by emote type
  const emoteCounts = useMemo(() => {
    const counts: Record<string, number> = { like: 0, fire: 0, skull: 0, crown: 0, bolt: 0, clap: 0 };
    for (const r of reactions) {
      if (r.emote in counts) counts[r.emote]++;
    }
    return counts;
  }, [reactions]);

  return (
    <ProtectedRoute>
      <Stack.Screen options={{ title: "Post" }} />
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ padding: FR.space.x4, gap: FR.space.x3, paddingBottom: insets.bottom + 20 }}
      >
        {!post ? (
          <View style={{ ...FR.card({ card: c.card, border: c.border }), gap: 8 }}>
            <Text style={{ color: c.text, ...FR.type.h3 }}>Post not found</Text>
            <Text style={{ color: c.muted, ...FR.type.sub }}>
              This post may have been deleted or hasn't loaded yet.
            </Text>
          </View>
        ) : (
          <>
            {/* Post Header */}
            <View style={{ ...FR.card({ card: c.card, border: c.border }), gap: FR.space.x3 }}>
              {/* Author info */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x2 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: c.bg,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: c.border,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>
                      {post.authorDisplayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: FR.space.x2 }}>
                      <Text style={{ color: c.text, ...FR.type.h3 }}>
                        {post.authorDisplayName}
                      </Text>
                      <RankBadge post={post} size="sm" variant="minimal" showLabel={false} />
                    </View>
                    <Text style={{ color: c.muted, ...FR.type.sub }}>{timeAgo(post.createdAtMs)}</Text>
                  </View>
                </View>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: c.border,
                    backgroundColor: c.bg,
                    borderRadius: FR.radius.pill,
                    paddingVertical: 4,
                    paddingHorizontal: FR.space.x2,
                  }}
                >
                  <Text style={{ color: c.text, ...FR.type.mono }}>{post.privacy.toUpperCase()}</Text>
                </View>
              </View>

              {/* Title and caption */}
              {!!post.title && (
                <Text style={{ color: c.text, ...FR.type.h2 }}>{post.title}</Text>
              )}
              {!!post.caption && (
                <Text style={{ color: c.text, ...FR.type.body, lineHeight: 22 }}>{post.caption}</Text>
              )}

              {/* Photos */}
              {post.photoUrls && post.photoUrls.length > 0 && (
                <PhotoCard photoUrls={post.photoUrls} />
              )}

              {/* Stats row */}
              <View style={{ flexDirection: "row", gap: FR.space.x4, flexWrap: "wrap" }}>
                {!!post.durationSec && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ color: c.muted }}>⏱</Text>
                    <Text style={{ color: c.muted, ...FR.type.sub }}>{Math.round(post.durationSec / 60)}m</Text>
                  </View>
                )}
                {!!post.exerciseCount && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ color: c.muted }}>🏋️</Text>
                    <Text style={{ color: c.muted, ...FR.type.sub }}>{post.exerciseCount} exercises</Text>
                  </View>
                )}
                {!!post.setCount && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ color: c.muted }}>✅</Text>
                    <Text style={{ color: c.muted, ...FR.type.sub }}>{post.setCount} sets</Text>
                  </View>
                )}
              </View>

              {/* Reactions */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: FR.space.x2, flexWrap: "wrap" }}>
                <View style={{ flexDirection: "row", gap: FR.space.x2, flexWrap: "wrap" }}>
                  <AnimatedReactionButton
                    emote="like"
                    active={myReaction?.emote === "like"}
                    count={emoteCounts.like}
                    onPress={() => toggleReaction(id, userId, "like")}
                    onLongPress={() => setShowReactionsModal(true)}
                    colors={{ text: c.text, border: c.border, bg: c.bg, card: c.card }}
                  />
                  <AnimatedReactionButton
                    emote="fire"
                    active={myReaction?.emote === "fire"}
                    count={emoteCounts.fire}
                    onPress={() => toggleReaction(id, userId, "fire")}
                    onLongPress={() => setShowReactionsModal(true)}
                    colors={{ text: c.text, border: c.border, bg: c.bg, card: c.card }}
                  />
                  <AnimatedReactionButton
                    emote="crown"
                    active={myReaction?.emote === "crown"}
                    count={emoteCounts.crown}
                    onPress={() => toggleReaction(id, userId, "crown")}
                    onLongPress={() => setShowReactionsModal(true)}
                    colors={{ text: c.text, border: c.border, bg: c.bg, card: c.card }}
                  />
                  <AnimatedReactionButton
                    emote="bolt"
                    active={myReaction?.emote === "bolt"}
                    count={emoteCounts.bolt}
                    onPress={() => toggleReaction(id, userId, "bolt")}
                    onLongPress={() => setShowReactionsModal(true)}
                    colors={{ text: c.text, border: c.border, bg: c.bg, card: c.card }}
                  />
                  <AnimatedReactionButton
                    emote="clap"
                    active={myReaction?.emote === "clap"}
                    count={emoteCounts.clap}
                    onPress={() => toggleReaction(id, userId, "clap")}
                    onLongPress={() => setShowReactionsModal(true)}
                    colors={{ text: c.text, border: c.border, bg: c.bg, card: c.card }}
                  />
                </View>
                <Pressable onPress={() => setShowReactionsModal(true)}>
                  <Text style={{ color: c.primary, ...FR.type.sub }}>
                    {reactions.length > 0 ? `${reactions.length} reactions` : ""}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Workout Snapshot */}
            {topLines.length > 0 && (
              <View style={{ ...FR.card({ card: c.card, border: c.border }), gap: FR.space.x3 }}>
                <Text style={{ color: c.text, ...FR.type.h3 }}>
                  Workout Snapshot
                </Text>

                {topLines.map((t, idx) => (
                  <View
                    key={`${t.exerciseName}-${idx}`}
                    style={{
                      borderWidth: 1,
                      borderColor: c.border,
                      borderRadius: FR.radius.md,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      backgroundColor: c.bg,
                      gap: 2,
                    }}
                  >
                    <Text style={{ color: c.text, ...FR.type.body, fontWeight: "700" }}>{t.exerciseName}</Text>
                    {!!t.bestSet && (
                      <Text style={{ color: c.muted, ...FR.type.sub }}>
                        {t.bestSet.weightLabel} × {t.bestSet.reps}
                        {t.bestSet.e1rmLabel ? ` • e1RM ${t.bestSet.e1rmLabel}` : ""}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Comments Section */}
            <View style={{ ...FR.card({ card: c.card, border: c.border }) }}>
              <CommentsSection postId={id} showInput={true} />
            </View>
          </>
        )}
      </KeyboardAwareScrollView>

      {/* Reactions Modal */}
      <ReactionsModal
        visible={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        reactions={reactions}
      />
    </ProtectedRoute>
  );
}
