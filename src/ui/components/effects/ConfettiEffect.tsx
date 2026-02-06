// src/ui/components/effects/ConfettiEffect.tsx
// Confetti particle effect for legendary celebrations

import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
}

interface ConfettiEffectProps {
  active: boolean;
  onComplete?: () => void;
  particleCount?: number;
  duration?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "#FFD700", // Gold
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#FF69B4", // Pink
];

export function ConfettiEffect({
  active,
  onComplete,
  particleCount = 50,
  duration = 3000,
  colors = DEFAULT_COLORS,
}: ConfettiEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    if (active) {
      startConfetti();
    } else {
      stopConfetti();
    }

    return () => {
      stopConfetti();
    };
  }, [active]);

  const startConfetti = () => {
    // Create particles
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: new Animated.Value(Math.random() * SCREEN_WIDTH),
        y: new Animated.Value(-50 - Math.random() * 100),
        rotation: new Animated.Value(0),
        scale: new Animated.Value(0.5 + Math.random() * 0.5),
        opacity: new Animated.Value(1),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
      });
    }

    setParticles(newParticles);

    // Animate particles
    const animations: Animated.CompositeAnimation[] = [];

    newParticles.forEach((particle, index) => {
      const delay = Math.random() * 500;
      const fallDuration = duration + Math.random() * 1000;
      const swayAmount = 50 + Math.random() * 100;
      const rotations = 2 + Math.random() * 4;

      const animation = Animated.parallel([
        // Fall down
        Animated.timing(particle.y, {
          toValue: SCREEN_HEIGHT + 50,
          duration: fallDuration,
          delay,
          useNativeDriver: true,
        }),
        // Sway left and right
        Animated.sequence([
          Animated.timing(particle.x, {
            toValue: (particle.x as any)._value + swayAmount,
            duration: fallDuration / 4,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: (particle.x as any)._value - swayAmount,
            duration: fallDuration / 4,
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: (particle.x as any)._value + swayAmount / 2,
            duration: fallDuration / 4,
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: (particle.x as any)._value,
            duration: fallDuration / 4,
            useNativeDriver: true,
          }),
        ]),
        // Rotate
        Animated.timing(particle.rotation, {
          toValue: rotations * 360,
          duration: fallDuration,
          delay,
          useNativeDriver: true,
        }),
        // Fade out towards the end
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: fallDuration,
          delay: delay + fallDuration * 0.7,
          useNativeDriver: true,
        }),
      ]);

      animations.push(animation);
    });

    animationsRef.current = animations;

    Animated.parallel(animations).start(() => {
      setParticles([]);
      onComplete?.();
    });
  };

  const stopConfetti = () => {
    animationsRef.current.forEach((anim) => anim.stop());
    animationsRef.current = [];
    setParticles([]);
  };

  if (particles.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: Math.random() > 0.5 ? particle.size / 2 : 2,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  particle: {
    position: "absolute",
  },
});

export default ConfettiEffect;
