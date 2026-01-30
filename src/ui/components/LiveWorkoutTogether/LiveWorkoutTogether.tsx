import React from "react";
import { View, StyleSheet } from "react-native";
import { PresenceIndicator, type PresenceUser } from "./PresenceIndicator";
import { ReactionsBar, type Reaction, type ReactionType } from "./ReactionsBar";
import { LiveReactionAnimation } from "./LiveReactionAnimation";

export interface LiveWorkoutTogetherProps {
  users: PresenceUser[];
  reactions: Reaction[];
  currentUserId: string;
  onAddReaction: (type: ReactionType) => void;
  activeReactions?: { reaction: string; userName: string }[];
  onReactionAnimationComplete?: (index: number) => void;
}

export function LiveWorkoutTogether(props: LiveWorkoutTogetherProps) {
  const {
    users,
    reactions,
    currentUserId,
    onAddReaction,
    activeReactions = [],
    onReactionAnimationComplete,
  } = props;

  return (
    <View style={styles.container}>
      {/* Presence indicators at the top */}
      <PresenceIndicator users={users} />

      {/* Reactions bar at the bottom */}
      <ReactionsBar
        reactions={reactions}
        onAddReaction={onAddReaction}
        currentUserId={currentUserId}
      />

      {/* Live reaction animations */}
      {activeReactions.map((reaction, index) => (
        <LiveReactionAnimation
          key={`${reaction.reaction}-${reaction.userName}-${index}`}
          reaction={reaction.reaction}
          userName={reaction.userName}
          onAnimationComplete={() => onReactionAnimationComplete?.(index)}
          position={index % 3 === 0 ? 'left' : index % 3 === 1 ? 'center' : 'right'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
});