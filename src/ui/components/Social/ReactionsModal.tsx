// src/ui/components/Social/ReactionsModal.tsx
// Modal showing who reacted to a post, grouped by emote type

import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { EmoteId, Reaction } from "../../../lib/socialModel";
import { displayName } from "../../../lib/userDirectory";
import { useThemeColors } from "../../theme";
import { FR } from "../../GrStyle";
import { timeAgo } from "../../../lib/units";

const EMOTE_LABELS: Record<EmoteId, string> = {
  like: "👍",
  fire: "🔥",
  skull: "💀",
  crown: "👑",
  bolt: "⚡",
  clap: "👏",
};

const ALL_EMOTES: EmoteId[] = ["like", "fire", "skull", "crown", "bolt", "clap"];

interface ReactionsModalProps {
  visible: boolean;
  onClose: () => void;
  reactions: Reaction[];
}

export function ReactionsModal({
  visible,
  onClose,
  reactions,
}: ReactionsModalProps) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [selectedEmote, setSelectedEmote] = useState<EmoteId | "all">("all");

  // Group reactions by emote
  const groupedReactions = useMemo(() => {
    const groups: Record<EmoteId, Reaction[]> = {
      like: [],
      fire: [],
      skull: [],
      crown: [],
      bolt: [],
      clap: [],
    };

    for (const r of reactions) {
      groups[r.emote].push(r);
    }

    return groups;
  }, [reactions]);

  // Count per emote
  const emoteCounts = useMemo(() => {
    const counts: Record<EmoteId, number> = {
      like: 0,
      fire: 0,
      skull: 0,
      crown: 0,
      bolt: 0,
      clap: 0,
    };

    for (const r of reactions) {
      counts[r.emote]++;
    }

    return counts;
  }, [reactions]);

  // Filter reactions based on selected emote
  const filteredReactions = useMemo(() => {
    if (selectedEmote === "all") {
      return reactions.slice().sort((a, b) => b.createdAtMs - a.createdAtMs);
    }
    return groupedReactions[selectedEmote].slice().sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [reactions, selectedEmote, groupedReactions]);

  // Available emotes (those with at least 1 reaction)
  const availableEmotes = useMemo(() => {
    return ALL_EMOTES.filter(e => emoteCounts[e] > 0);
  }, [emoteCounts]);

  const renderReaction = ({ item }: { item: Reaction }) => (
    <View style={[styles.reactionRow, { borderBottomColor: c.border }]}>
      <View style={styles.userInfo}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: c.card }]}>
          <Text style={styles.avatarEmoji}>
            {EMOTE_LABELS[item.emote]}
          </Text>
        </View>
        <View style={styles.userText}>
          <Text style={[styles.userName, { color: c.text }]}>
            {displayName(item.userId)}
          </Text>
          <Text style={[styles.timestamp, { color: c.muted }]}>
            {timeAgo(item.createdAtMs)}
          </Text>
        </View>
      </View>
      <Text style={styles.emoteDisplay}>{EMOTE_LABELS[item.emote]}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.content,
            {
              backgroundColor: c.bg,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <Text style={[styles.title, { color: c.text }]}>Reactions</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={c.text} />
            </Pressable>
          </View>

          {/* Emote filter tabs */}
          <View style={styles.filterTabs}>
            <Pressable
              onPress={() => setSelectedEmote("all")}
              style={[
                styles.filterTab,
                {
                  backgroundColor: selectedEmote === "all" ? c.primary : c.card,
                  borderColor: selectedEmote === "all" ? c.primary : c.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: selectedEmote === "all" ? "#fff" : c.text },
                ]}
              >
                All ({reactions.length})
              </Text>
            </Pressable>

            {availableEmotes.map((emote) => (
              <Pressable
                key={emote}
                onPress={() => setSelectedEmote(emote)}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: selectedEmote === emote ? c.primary : c.card,
                    borderColor: selectedEmote === emote ? c.primary : c.border,
                  },
                ]}
              >
                <Text style={styles.filterEmoji}>{EMOTE_LABELS[emote]}</Text>
                <Text
                  style={[
                    styles.filterCount,
                    { color: selectedEmote === emote ? "#fff" : c.text },
                  ]}
                >
                  {emoteCounts[emote]}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Reactions list */}
          <FlatList
            data={filteredReactions}
            renderItem={renderReaction}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: c.muted }]}>
                  No reactions yet
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  filterTabs: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: FR.radius.pill,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    padding: 12,
  },
  reactionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 18,
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  emoteDisplay: {
    fontSize: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
});

export default ReactionsModal;
