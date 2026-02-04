// src/ui/components/Social/AnimatedReactionButton.tsx
// Animated reaction button with bounce and particle effects

import React, { useRef, useCallback } from "react";
import { Pressable, Text, Animated, View, StyleSheet } from "react-native";
import type { EmoteId } from "../../../lib/socialModel";
import { FR } from "../../GrStyle";

const EMOTE_LABELS: Record<EmoteId, string> = {
  like: "👍",
  fire: "🔥",
  skull: "💀",
  crown: "👑",
  bolt: "⚡",
  clap: "👏",
};

interface AnimatedReactionButtonProps {
  emote: EmoteId;
  active: boolean;
  count?: number;
  onPress: () => void;
  onLongPress?: () => void;
  colors: {
    text: string;
    border: string;
    bg: string;
    card: string;
  };
}

export function AnimatedReactionButton({
  emote,
  active,
  count = 0,
  onPress,
  onLongPress,
  colors,
}: AnimatedReactionButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;
  const particleScale = useRef(new Animated.Value(0.5)).current;

  const handlePress = useCallback(() => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Particle burst if activating (not already active)
    if (!active) {
      particleOpacity.setValue(1);
      particleScale.setValue(0.5);

      Animated.parallel([
        Animated.timing(particleOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(particleScale, {
          toValue: 1.5,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onPress();
  }, [active, onPress, scaleAnim, particleOpacity, particleScale]);

  return (
    <View style={styles.container}>
      {/* Particle burst effect */}
      <Animated.View
        style={[
          styles.particleBurst,
          {
            opacity: particleOpacity,
            transform: [{ scale: particleScale }],
            backgroundColor: active ? colors.text : "transparent",
          },
        ]}
        pointerEvents="none"
      />

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={handlePress}
          onLongPress={onLongPress}
          delayLongPress={300}
          style={({ pressed }) => [
            styles.button,
            {
              borderColor: active ? colors.text : colors.border,
              backgroundColor: active ? colors.bg : colors.card,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={styles.emote}>{EMOTE_LABELS[emote]}</Text>
          {count > 0 && (
            <Text style={[styles.count, { color: colors.text }]}>
              {count > 99 ? "99+" : count}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: FR.space.x2,
    paddingHorizontal: FR.space.x3,
    borderRadius: FR.radius.pill,
    borderWidth: 1,
  },
  emote: {
    fontSize: 16,
  },
  count: {
    fontSize: 12,
    fontWeight: "600",
  },
  particleBurst: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 20,
    height: 20,
    borderRadius: 10,
    marginTop: -10,
    marginLeft: -10,
  },
});

export default AnimatedReactionButton;
