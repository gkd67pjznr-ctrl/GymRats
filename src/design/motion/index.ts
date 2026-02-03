/**
 * Motion System
 *
 * Animation utilities, spring configs, and timing functions.
 * Built on React Native Reanimated.
 */

import { Easing } from 'react-native-reanimated';
import { duration } from '../tokens/primitives';
import { motion } from '../tokens/semantic';

// =============================================================================
// SPRING CONFIGURATIONS
// =============================================================================

export const springs = motion.spring;

/**
 * Get spring config by name
 */
export function getSpring(name: keyof typeof motion.spring) {
  return motion.spring[name];
}

// =============================================================================
// TIMING CONFIGURATIONS
// =============================================================================

export const durations = {
  instant: duration.instant,
  fast: duration.fast,
  normal: duration.normal,
  slow: duration.slow,
  dramatic: duration.dramatic,
};

// =============================================================================
// EASING PRESETS
// =============================================================================

export const easings = {
  /** Standard ease for most animations */
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  /** Decelerate - for entering elements */
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  /** Accelerate - for exiting elements */
  accelerate: Easing.bezier(0.4, 0, 1, 1),
  /** Sharp - for precise movements */
  sharp: Easing.bezier(0.4, 0, 0.6, 1),
  /** Bounce - for playful effects */
  bounce: Easing.bounce,
  /** Elastic - for springy effects */
  elastic: Easing.elastic(1),
  /** Linear - for continuous animations */
  linear: Easing.linear,
};

// =============================================================================
// ANIMATION PRESETS
// =============================================================================

export interface AnimationPreset {
  duration: number;
  easing: (t: number) => number;
}

export const animationPresets = {
  /** Fade in/out */
  fade: {
    duration: durations.fast,
    easing: easings.standard,
  },
  /** Scale in/out */
  scale: {
    duration: durations.fast,
    easing: easings.decelerate,
  },
  /** Slide in from bottom */
  slideUp: {
    duration: durations.normal,
    easing: easings.decelerate,
  },
  /** Slide in from top */
  slideDown: {
    duration: durations.normal,
    easing: easings.decelerate,
  },
  /** Slide in from left */
  slideLeft: {
    duration: durations.normal,
    easing: easings.decelerate,
  },
  /** Slide in from right */
  slideRight: {
    duration: durations.normal,
    easing: easings.decelerate,
  },
  /** Pop in with scale */
  pop: {
    duration: durations.fast,
    easing: easings.elastic,
  },
  /** Bounce effect */
  bounce: {
    duration: durations.normal,
    easing: easings.bounce,
  },
};

// =============================================================================
// TIMING HELPERS
// =============================================================================

/**
 * Create a staggered delay for list items
 */
export function staggerDelay(index: number, baseDelay = 50): number {
  return index * baseDelay;
}

/**
 * Create timing config
 */
export function timingConfig(
  durationMs: number = durations.normal,
  easing = easings.standard
) {
  return {
    duration: durationMs,
    easing,
  };
}

// =============================================================================
// SPRING HELPERS
// =============================================================================

/**
 * Create spring config with custom values
 */
export function springConfig(
  damping: number = 15,
  stiffness: number = 200,
  mass: number = 1
) {
  return {
    damping,
    stiffness,
    mass,
  };
}

// =============================================================================
// REDUCED MOTION UTILITIES
// =============================================================================

/**
 * Get duration respecting reduced motion preference
 */
export function getReducedMotionDuration(
  normalDuration: number,
  reducedMotion: boolean
): number {
  return reducedMotion ? 0 : normalDuration;
}

/**
 * Get animation config respecting reduced motion
 */
export function getAccessibleAnimation(
  reducedMotion: boolean,
  normalConfig: AnimationPreset
): AnimationPreset {
  if (reducedMotion) {
    return {
      duration: 0,
      easing: Easing.linear,
    };
  }
  return normalConfig;
}

// =============================================================================
// LAYOUT ANIMATION PRESETS
// =============================================================================

export const layoutAnimations = {
  /** Default layout animation */
  default: {
    damping: 15,
    stiffness: 200,
  },
  /** Smooth layout changes */
  smooth: {
    damping: 20,
    stiffness: 150,
  },
  /** Bouncy layout changes */
  bouncy: {
    damping: 10,
    stiffness: 250,
  },
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  springs,
  durations,
  easings,
  animationPresets,
  getSpring,
  staggerDelay,
  timingConfig,
  springConfig,
  layoutAnimations,
};
