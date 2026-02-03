/**
 * Art System Types
 *
 * Type definitions for illustrations, celebrations, decorations, and particles.
 */

import { ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

// =============================================================================
// ILLUSTRATION TYPES
// =============================================================================

export interface IllustrationProps {
  /** Width of the illustration */
  width?: number;
  /** Height of the illustration */
  height?: number;
  /** Primary color (uses accent if not specified) */
  primaryColor?: string;
  /** Secondary color */
  secondaryColor?: string;
  /** Animation enabled */
  animated?: boolean;
  /** Container style */
  style?: ViewStyle;
}

export type IllustrationComponent = React.FC<IllustrationProps>;

export interface IllustrationSet {
  /** Empty workout history */
  noWorkouts?: IllustrationComponent;
  /** No history data */
  noHistory?: IllustrationComponent;
  /** No friends added */
  noFriends?: IllustrationComponent;
  /** No routines created */
  noRoutines?: IllustrationComponent;
  /** Search returned nothing */
  noResults?: IllustrationComponent;
  /** Connection error */
  connectionError?: IllustrationComponent;
  /** Success state */
  success?: IllustrationComponent;
}

// =============================================================================
// CELEBRATION TYPES
// =============================================================================

export type CelebrationType =
  | 'pr' // Personal record
  | 'rankUp' // Rank increase
  | 'workout_complete' // Finished workout
  | 'streak' // Maintained streak
  | 'milestone' // Volume/session milestone
  | 'achievement'; // Badge unlock

export interface CelebrationConfig {
  /** Type of celebration */
  type: CelebrationType;
  /** Intensity level (affects duration, particle count, etc.) */
  intensity: 'low' | 'medium' | 'high' | 'epic';
  /** Primary color for effects */
  primaryColor?: string;
  /** Secondary color for effects */
  secondaryColor?: string;
  /** Duration in ms (auto-calculated if not specified) */
  duration?: number;
  /** Callback when celebration ends */
  onComplete?: () => void;
}

export interface CelebrationState {
  /** Is a celebration currently active */
  isActive: boolean;
  /** Current celebration config */
  config: CelebrationConfig | null;
  /** Progress (0-1) */
  progress: SharedValue<number>;
}

// =============================================================================
// PARTICLE TYPES
// =============================================================================

export type ParticleShape = 'circle' | 'square' | 'star' | 'confetti' | 'spark';

export interface Particle {
  /** Unique ID */
  id: string;
  /** X position (0-1, relative to container) */
  x: number;
  /** Y position (0-1, relative to container) */
  y: number;
  /** Size in pixels */
  size: number;
  /** Rotation in degrees */
  rotation: number;
  /** Color */
  color: string;
  /** Shape */
  shape: ParticleShape;
  /** Velocity X */
  vx: number;
  /** Velocity Y */
  vy: number;
  /** Angular velocity */
  vr: number;
  /** Opacity */
  opacity: number;
  /** Scale */
  scale: number;
  /** Gravity multiplier */
  gravity: number;
  /** Lifetime in ms */
  lifetime: number;
  /** Age in ms */
  age: number;
}

export interface ParticleEmitterConfig {
  /** Emission rate (particles per second) */
  rate: number;
  /** Particle count (for burst mode) */
  count?: number;
  /** Particle lifetime range [min, max] ms */
  lifetime: [number, number];
  /** Size range [min, max] px */
  size: [number, number];
  /** Initial velocity range */
  velocity: {
    x: [number, number];
    y: [number, number];
  };
  /** Angular velocity range */
  angularVelocity?: [number, number];
  /** Gravity (positive = down) */
  gravity?: number;
  /** Colors to randomly pick from */
  colors: string[];
  /** Shapes to randomly pick from */
  shapes: ParticleShape[];
  /** Opacity range */
  opacity?: [number, number];
  /** Emission area */
  area?: {
    x: [number, number];
    y: [number, number];
  };
}

// =============================================================================
// DECORATION TYPES
// =============================================================================

export interface DecorationProps {
  /** Primary color (uses accent if not specified) */
  color?: string;
  /** Size multiplier */
  scale?: number;
  /** Opacity */
  opacity?: number;
  /** Animation enabled */
  animated?: boolean;
  /** Container style */
  style?: ViewStyle;
}

export type DecorationComponent = React.FC<DecorationProps>;

export interface DecorationSet {
  /** Card corner flourish */
  cardCorner?: DecorationComponent;
  /** Header accent line */
  headerLine?: DecorationComponent;
  /** Divider with flair */
  fancyDivider?: DecorationComponent;
  /** Background glow */
  backgroundGlow?: DecorationComponent;
  /** Subtle pattern overlay */
  pattern?: DecorationComponent;
}

// =============================================================================
// GLOW EFFECT TYPES
// =============================================================================

export interface GlowConfig {
  /** Glow color */
  color: string;
  /** Glow intensity (0-1) */
  intensity: number;
  /** Glow radius in pixels */
  radius: number;
  /** Pulsing animation */
  pulse?: boolean;
  /** Pulse speed (1 = normal) */
  pulseSpeed?: number;
}

// =============================================================================
// CELEBRATION PRESET TYPES
// =============================================================================

export interface CelebrationPreset {
  /** Preset name */
  name: string;
  /** Particle emitter config */
  particles: ParticleEmitterConfig;
  /** Duration in ms */
  duration: number;
  /** Sound effect key */
  sound?: string;
  /** Haptic pattern */
  haptic?: 'light' | 'medium' | 'heavy' | 'success';
  /** Screen flash */
  flash?: {
    color: string;
    duration: number;
  };
  /** Glow effect */
  glow?: GlowConfig;
}
