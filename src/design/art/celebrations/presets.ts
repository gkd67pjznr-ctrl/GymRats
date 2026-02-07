/**
 * Celebration Presets
 *
 * Pre-configured celebration effects for different events.
 */

import { CelebrationPreset, ParticleEmitterConfig } from '../types';
import { colors } from '../../tokens/primitives';

// =============================================================================
// PARTICLE CONFIGS
// =============================================================================

const confettiBurst: ParticleEmitterConfig = {
  rate: 0,
  count: 50,
  lifetime: [2000, 3000],
  size: [8, 16],
  velocity: {
    x: [-150, 150],
    y: [-400, -200],
  },
  angularVelocity: [-180, 180],
  gravity: 400,
  colors: [
    colors.toxic.primary,
    colors.electric.primary,
    colors.ember.primary,
    colors.ice.primary,
    colors.rank.gold,
    colors.white,
  ],
  shapes: ['confetti', 'square'],
  opacity: [0.8, 1],
  area: {
    x: [0.3, 0.7],
    y: [0.4, 0.5],
  },
};

const sparkShower: ParticleEmitterConfig = {
  rate: 30,
  lifetime: [500, 1000],
  size: [2, 6],
  velocity: {
    x: [-50, 50],
    y: [50, 150],
  },
  gravity: -50,
  colors: [colors.toxic.primary, colors.toxic.secondary],
  shapes: ['spark', 'circle'],
  opacity: [0.6, 1],
  area: {
    x: [0.2, 0.8],
    y: [0, 0.1],
  },
};

const epicExplosion: ParticleEmitterConfig = {
  rate: 0,
  count: 100,
  lifetime: [1500, 2500],
  size: [4, 20],
  velocity: {
    x: [-300, 300],
    y: [-500, -100],
  },
  angularVelocity: [-360, 360],
  gravity: 300,
  colors: [
    colors.rank.mythic,
    colors.rank.legendary,
    colors.rank.gold,
    colors.white,
    colors.toxic.primary,
  ],
  shapes: ['star', 'confetti', 'spark'],
  opacity: [0.9, 1],
  area: {
    x: [0.4, 0.6],
    y: [0.45, 0.55],
  },
};

const subtleGlow: ParticleEmitterConfig = {
  rate: 5,
  lifetime: [1000, 2000],
  size: [4, 12],
  velocity: {
    x: [-20, 20],
    y: [-80, -40],
  },
  gravity: -10,
  colors: [colors.toxic.primary],
  shapes: ['circle'],
  opacity: [0.3, 0.6],
  area: {
    x: [0.3, 0.7],
    y: [0.6, 0.8],
  },
};

// =============================================================================
// CELEBRATION PRESETS
// =============================================================================

export const celebrationPresets: Record<string, CelebrationPreset> = {
  // Personal Record - moderate celebration
  pr: {
    name: 'Personal Record',
    particles: confettiBurst,
    duration: 2500,
    sound: 'pr',
    haptic: 'success',
    flash: {
      color: colors.toxic.primary,
      duration: 150,
    },
    glow: {
      color: colors.toxic.primary,
      intensity: 0.4,
      radius: 100,
      pulse: true,
      pulseSpeed: 1.5,
    },
  },

  // Rank Up - big celebration
  rankUp: {
    name: 'Rank Up',
    particles: epicExplosion,
    duration: 3500,
    sound: 'rankUp',
    haptic: 'heavy',
    flash: {
      color: colors.rank.gold,
      duration: 200,
    },
    glow: {
      color: colors.rank.gold,
      intensity: 0.6,
      radius: 150,
      pulse: true,
      pulseSpeed: 2,
    },
  },

  // Workout Complete - satisfying finish
  workoutComplete: {
    name: 'Workout Complete',
    particles: sparkShower,
    duration: 2000,
    sound: 'success',
    haptic: 'medium',
    glow: {
      color: colors.green[500],
      intensity: 0.3,
      radius: 80,
      pulse: false,
    },
  },

  // Streak - subtle but proud
  streak: {
    name: 'Streak Maintained',
    particles: subtleGlow,
    duration: 1500,
    sound: 'success',
    haptic: 'light',
    glow: {
      color: colors.ember.primary,
      intensity: 0.25,
      radius: 60,
      pulse: true,
      pulseSpeed: 1,
    },
  },

  // Milestone - medium celebration
  milestone: {
    name: 'Milestone Reached',
    particles: {
      ...confettiBurst,
      count: 30,
    },
    duration: 2000,
    sound: 'celebration',
    haptic: 'medium',
    flash: {
      color: colors.electric.primary,
      duration: 100,
    },
  },

  // Achievement - badge unlock
  achievement: {
    name: 'Achievement Unlocked',
    particles: {
      ...sparkShower,
      colors: [colors.rank.legendary, colors.rank.master, colors.white],
    },
    duration: 2500,
    sound: 'celebration',
    haptic: 'success',
    glow: {
      color: colors.rank.legendary,
      intensity: 0.35,
      radius: 90,
      pulse: true,
      pulseSpeed: 1.2,
    },
  },

  // Mythic Rank - epic celebration
  mythicRankUp: {
    name: 'Mythic Rank Achieved',
    particles: {
      ...epicExplosion,
      count: 150,
      colors: [
        colors.rank.mythic,
        '#00CED1',
        '#20B2AA',
        colors.white,
        colors.rank.legendary,
      ],
    },
    duration: 5000,
    sound: 'rankUp',
    haptic: 'heavy',
    flash: {
      color: colors.rank.mythic,
      duration: 300,
    },
    glow: {
      color: colors.rank.mythic,
      intensity: 0.8,
      radius: 200,
      pulse: true,
      pulseSpeed: 2.5,
    },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get celebration preset by type and intensity
 */
export function getCelebrationPreset(
  type: string,
  intensity: 'low' | 'medium' | 'high' | 'epic' = 'medium'
): CelebrationPreset {
  const base = celebrationPresets[type] ?? celebrationPresets.milestone;

  // Scale based on intensity
  const intensityMultipliers = {
    low: 0.5,
    medium: 1,
    high: 1.5,
    epic: 2,
  };

  const multiplier = intensityMultipliers[intensity];

  return {
    ...base,
    particles: {
      ...base.particles,
      count: base.particles.count
        ? Math.round(base.particles.count * multiplier)
        : undefined,
      rate: base.particles.rate * multiplier,
    },
    duration: Math.round(base.duration * (intensity === 'epic' ? 1.5 : 1)),
    glow: base.glow
      ? {
          ...base.glow,
          intensity: Math.min(base.glow.intensity * multiplier, 1),
          radius: Math.round(base.glow.radius * multiplier),
        }
      : undefined,
  };
}

export default celebrationPresets;
