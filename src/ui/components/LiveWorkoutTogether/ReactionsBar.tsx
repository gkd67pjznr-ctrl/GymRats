import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { makeDesignSystem } from "../../designSystem";

export type ReactionType = 'fire' | 'muscle' | 'heart' | 'clap' | 'rocket' | 'thumbsup';

export interface Reaction {
  id: string;
  userId: string;
  userName: string;
  type: ReactionType;
  timestamp: number;
}

export interface ReactionsBarProps {
  reactions: Reaction[];
  onAddReaction: (type: ReactionType) => void;
  currentUserId: string;
}

export function ReactionsBar(props: ReactionsBarProps) {
  const ds = makeDesignSystem("dark", "toxic");
  const { reactions, onAddReaction, currentUserId } = props;
  const [showPicker, setShowPicker] = useState(false);

  // Group reactions by type and count
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {} as Record<ReactionType, number>);

  // Check if current user has already reacted
  const userReactionTypes = reactions
    .filter(r => r.userId === currentUserId)
    .map(r => r.type);

  const togglePicker = () => setShowPicker(!showPicker);

  return (
    <View style={styles.container}>
      {/* Display existing reactions */}
      {(Object.entries(reactionCounts) as [ReactionType, number][])
        .filter(([type]) => reactionCounts[type] > 0)
        .map(([type, count]) => (
          <View key={type} style={styles.reactionItem}>
            <Text style={styles.reactionText}>{getReactionEmoji(type)}</Text>
            <Text style={styles.reactionCount}>{count}</Text>
          </View>
        ))}

      {/* Add reaction button */}
      <Pressable
        style={styles.addReactionButton}
        onPress={togglePicker}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.addReactionText}>+</Text>
      </Pressable>

      {/* Reaction picker (modal-like overlay) */}
      {showPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            {REACTION_TYPES.map((type) => {
              const isActive = userReactionTypes.includes(type);
              return (
                <Pressable
                  key={type}
                  style={[styles.reactionPickerItem, isActive && styles.reactionPickerItemActive]}
                  onPress={() => {
                    onAddReaction(type);
                    setShowPicker(false);
                  }}
                  disabled={isActive}
                >
                  <Text style={styles.reactionPickerEmoji}>{getReactionEmoji(type)}</Text>
                  {isActive && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const REACTION_TYPES: ReactionType[] = ['fire', 'muscle', 'heart', 'clap', 'rocket', 'thumbsup'];

function getReactionEmoji(type: ReactionType): string {
  const emojiMap: Record<ReactionType, string> = {
    fire: '🔥',
    muscle: '💪',
    heart: '❤️',
    clap: '👏',
    rocket: '🚀',
    thumbsup: '👍',
  };
  return emojiMap[type];
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: 'rgba(17, 17, 24, 0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(38, 38, 58, 0.6)',
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(38, 38, 58, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reactionText: {
    fontSize: 16,
  },
  reactionCount: {
    color: '#F2F4FF',
    fontSize: 12,
    fontWeight: '800',
  },
  addReactionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#26263A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#383852',
  },
  addReactionText: {
    color: '#F2F4FF',
    fontSize: 18,
    fontWeight: '900',
  },
  pickerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    zIndex: 1000,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#111118',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#26263A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  reactionPickerItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#151522',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#26263A',
  },
  reactionPickerItemActive: {
    backgroundColor: '#A6FF00',
    borderColor: '#A6FF00',
  },
  reactionPickerEmoji: {
    fontSize: 20,
  },
  checkmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0A0A0D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A6FF00',
  },
  checkmarkText: {
    color: '#A6FF00',
    fontSize: 10,
    fontWeight: '900',
  },
});