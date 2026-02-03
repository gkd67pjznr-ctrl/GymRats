/**
 * Particle System Component
 *
 * Renders animated particles for celebrations and effects.
 * Uses React Native Reanimated for performance.
 */

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Particle, ParticleEmitterConfig, ParticleShape } from '../types';
import { uid } from '@/src/lib/uid';

// =============================================================================
// TYPES
// =============================================================================

export interface ParticleSystemProps {
  /** Emitter configuration */
  config: ParticleEmitterConfig;
  /** Is system active */
  active: boolean;
  /** Container width */
  width?: number;
  /** Container height */
  height?: number;
  /** Duration in ms (for burst mode) */
  duration?: number;
  /** Callback when system completes */
  onComplete?: () => void;
}

interface ParticleData extends Particle {
  startTime: number;
}

// =============================================================================
// PARTICLE COMPONENT
// =============================================================================

interface ParticleViewProps {
  particle: ParticleData;
  containerWidth: number;
  containerHeight: number;
}

function ParticleView({ particle, containerWidth, containerHeight }: ParticleViewProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: particle.lifetime,
      easing: Easing.linear,
    });
  }, [particle.lifetime]);

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const elapsed = t * particle.lifetime;

    // Physics simulation
    const x = particle.x * containerWidth + particle.vx * (elapsed / 1000);
    const y =
      particle.y * containerHeight +
      particle.vy * (elapsed / 1000) +
      0.5 * particle.gravity * Math.pow(elapsed / 1000, 2);
    const rotation = particle.rotation + particle.vr * (elapsed / 1000);
    const opacity = particle.opacity * (1 - t * 0.5); // Fade out
    const scale = particle.scale * (1 - t * 0.3); // Shrink

    return {
      position: 'absolute',
      left: x - particle.size / 2,
      top: y - particle.size / 2,
      width: particle.size,
      height: particle.size,
      backgroundColor: particle.color,
      opacity,
      transform: [
        { rotate: `${rotation}deg` },
        { scale },
      ],
      borderRadius: particle.shape === 'circle' ? particle.size / 2 : 0,
    };
  });

  // Shape-specific styling
  const shapeStyle = useMemo(() => {
    switch (particle.shape) {
      case 'star':
        return { transform: [{ rotate: '45deg' }] };
      case 'confetti':
        return { borderRadius: 2, width: particle.size * 0.4 };
      case 'spark':
        return { borderRadius: particle.size / 2, width: particle.size * 0.3 };
      default:
        return {};
    }
  }, [particle.shape, particle.size]);

  return <Animated.View style={[animatedStyle, shapeStyle]} />;
}

// =============================================================================
// PARTICLE SYSTEM
// =============================================================================

export function ParticleSystem({
  config,
  active,
  width = Dimensions.get('window').width,
  height = Dimensions.get('window').height,
  duration = 3000,
  onComplete,
}: ParticleSystemProps) {
  const particlesRef = useRef<ParticleData[]>([]);
  const [particles, setParticles] = React.useState<ParticleData[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Create a single particle
  const createParticle = useCallback((): ParticleData => {
    const [minLife, maxLife] = config.lifetime;
    const [minSize, maxSize] = config.size;
    const [minVx, maxVx] = config.velocity.x;
    const [minVy, maxVy] = config.velocity.y;
    const [minVr, maxVr] = config.angularVelocity ?? [0, 0];
    const [minOpacity, maxOpacity] = config.opacity ?? [1, 1];
    const [minX, maxX] = config.area?.x ?? [0, 1];
    const [minY, maxY] = config.area?.y ?? [0, 1];

    const random = (min: number, max: number) => Math.random() * (max - min) + min;
    const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    return {
      id: uid(),
      x: random(minX, maxX),
      y: random(minY, maxY),
      size: random(minSize, maxSize),
      rotation: Math.random() * 360,
      color: randomItem(config.colors),
      shape: randomItem(config.shapes),
      vx: random(minVx, maxVx),
      vy: random(minVy, maxVy),
      vr: random(minVr, maxVr),
      opacity: random(minOpacity, maxOpacity),
      scale: 1,
      gravity: config.gravity ?? 0,
      lifetime: random(minLife, maxLife),
      age: 0,
      startTime: Date.now(),
    };
  }, [config]);

  // Burst mode - emit all at once
  const emitBurst = useCallback(() => {
    if (!config.count) return;
    const newParticles = Array.from({ length: config.count }, createParticle);
    particlesRef.current = newParticles;
    setParticles(newParticles);
  }, [config.count, createParticle]);

  // Start/stop emitter
  useEffect(() => {
    if (!active) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    startTimeRef.current = Date.now();

    // Burst mode
    if (config.count && config.count > 0) {
      emitBurst();

      // Complete after duration
      const timeout = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timeout);
    }

    // Continuous mode
    if (config.rate > 0) {
      const intervalMs = 1000 / config.rate;

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed >= duration) {
          clearInterval(intervalRef.current!);
          setTimeout(() => {
            setParticles([]);
            onComplete?.();
          }, Math.max(...config.lifetime));
          return;
        }

        const newParticle = createParticle();
        particlesRef.current = [...particlesRef.current, newParticle].slice(-100); // Max 100
        setParticles(particlesRef.current);
      }, intervalMs);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [active, config, duration, createParticle, emitBurst, onComplete]);

  // Cleanup dead particles
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      particlesRef.current = particlesRef.current.filter(
        p => now - p.startTime < p.lifetime
      );
      setParticles(particlesRef.current);
    }, 500);

    return () => clearInterval(cleanup);
  }, []);

  if (!active && particles.length === 0) return null;

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      {particles.map(particle => (
        <ParticleView
          key={particle.id}
          particle={particle}
          containerWidth={width}
          containerHeight={height}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
});

export default ParticleSystem;
