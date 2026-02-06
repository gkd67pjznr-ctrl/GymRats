/**
 * Default Theme Packs
 *
 * Built-in theme packs that ship with the app.
 * Includes free starter packs and examples of premium/legendary packs.
 */

import type { ThemePack } from './types';

export const DEFAULT_PACK_ID = 'toxic-energy';

/**
 * Default theme packs
 */
export const DEFAULT_THEME_PACKS: ThemePack[] = [
  // ===== FREE PACKS =====

  {
    id: 'toxic-energy',
    name: 'Toxic Energy',
    description: 'The signature GymRats look. Lime green accents that pop against deep black.',
    tier: 'free',
    tags: ['default', 'dark', 'energetic', 'lime'],
    colors: {
      background: '#0a0a0a',
      surface: '#141414',
      surfaceElevated: '#1a1a1a',
      border: '#2a2a2a',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      textMuted: '#666666',
      success: '#22c55e',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      primary: '#b4f72a',
      primarySoft: 'rgba(180, 247, 42, 0.15)',
      secondary: '#a855f7',
      accent: '#b4f72a',
      accentGlow: 'rgba(180, 247, 42, 0.5)',
    },
    motion: {
      enableParticles: true,
      enableGlow: true,
    },
    particles: {
      colors: ['#b4f72a', '#22c55e', '#84cc16'],
    },
    buddyId: 'coach', // Default buddy
  },

  {
    id: 'iron-forge',
    name: 'Iron Forge',
    description: 'Forged in fire. Warm amber and orange tones for the serious lifter.',
    tier: 'free',
    tags: ['warm', 'dark', 'intense', 'orange'],
    colors: {
      background: '#0c0a08',
      surface: '#161310',
      surfaceElevated: '#1c1814',
      border: '#2d2620',
      text: '#ffffff',
      textSecondary: '#b0a090',
      textMuted: '#706050',
      success: '#22c55e',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      primary: '#f97316',
      primarySoft: 'rgba(249, 115, 22, 0.15)',
      secondary: '#fbbf24',
      accent: '#f97316',
      accentGlow: 'rgba(249, 115, 22, 0.5)',
    },
    motion: {
      enableParticles: true,
      enableGlow: true,
    },
    particles: {
      shape: 'ember',
      colors: ['#f97316', '#fbbf24', '#ef4444'],
    },
  },

  {
    id: 'midnight-ice',
    name: 'Midnight Ice',
    description: 'Cool and focused. Ice blue accents for precision training.',
    tier: 'free',
    tags: ['cool', 'dark', 'calm', 'blue'],
    colors: {
      background: '#080a0c',
      surface: '#101418',
      surfaceElevated: '#141a1e',
      border: '#202830',
      text: '#ffffff',
      textSecondary: '#90a0b0',
      textMuted: '#506070',
      success: '#22c55e',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      primary: '#06b6d4',
      primarySoft: 'rgba(6, 182, 212, 0.15)',
      secondary: '#0ea5e9',
      accent: '#06b6d4',
      accentGlow: 'rgba(6, 182, 212, 0.5)',
    },
    motion: {
      enableParticles: true,
      enableGlow: true,
    },
    particles: {
      shape: 'spark',
      colors: ['#06b6d4', '#0ea5e9', '#38bdf8'],
    },
  },

  // ===== PREMIUM PACKS =====

  {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    description: 'Jack in and level up. Pink and cyan neon for the future of fitness.',
    tier: 'premium',
    iapProductId: 'theme_neon_cyberpunk',
    priceUsd: 2.99,
    tags: ['neon', 'dark', 'futuristic', 'pink', 'cyan'],
    colors: {
      background: '#0a0a10',
      surface: '#12121a',
      surfaceElevated: '#1a1a24',
      border: '#2a2a3a',
      text: '#ffffff',
      textSecondary: '#a0a0c0',
      textMuted: '#606080',
      success: '#22c55e',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      primary: '#ec4899',
      primarySoft: 'rgba(236, 72, 153, 0.15)',
      secondary: '#06b6d4',
      accent: '#ec4899',
      accentGlow: 'rgba(236, 72, 153, 0.6)',
      gradients: {
        hero: ['#ec4899', '#8b5cf6', '#06b6d4'],
        celebration: ['#ec4899', '#06b6d4'],
      },
    },
    motion: {
      easing: {
        enter: 'spring',
        emphasis: 'elastic',
      },
      enableParticles: true,
      enableGlow: true,
    },
    particles: {
      colors: ['#ec4899', '#06b6d4', '#8b5cf6', '#ffffff'],
      count: 80,
    },
    celebrations: {
      prCelebration: {
        style: 'glow-burst',
        intensity: 'epic',
      },
    },
    buddyId: 'hype', // Pairs with Hype Beast
  },

  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Train like royalty. Deep purple tones for the distinguished athlete.',
    tier: 'premium',
    iapProductId: 'theme_royal_purple',
    priceUsd: 2.99,
    tags: ['purple', 'dark', 'elegant', 'premium'],
    colors: {
      background: '#0a080c',
      surface: '#141018',
      surfaceElevated: '#1a141e',
      border: '#2a2030',
      text: '#ffffff',
      textSecondary: '#b0a0c0',
      textMuted: '#705080',
      success: '#22c55e',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      primary: '#a855f7',
      primarySoft: 'rgba(168, 85, 247, 0.15)',
      secondary: '#c084fc',
      accent: '#a855f7',
      accentGlow: 'rgba(168, 85, 247, 0.5)',
    },
    motion: {
      enableParticles: true,
      enableGlow: true,
    },
    particles: {
      shape: 'star',
      colors: ['#a855f7', '#c084fc', '#e879f9'],
    },
  },

  // ===== LEGENDARY PACKS =====

  {
    id: 'mythic-aurora',
    name: 'Mythic Aurora',
    description: 'Witness the northern lights with every PR. A legendary visual experience.',
    tier: 'legendary',
    iapProductId: 'theme_mythic_aurora',
    priceUsd: 7.99,
    tags: ['legendary', 'aurora', 'magical', 'animated'],
    colors: {
      background: '#050510',
      surface: '#0a0a18',
      surfaceElevated: '#101020',
      border: '#202040',
      text: '#ffffff',
      textSecondary: '#a0b0c0',
      textMuted: '#506070',
      success: '#22c55e',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      primary: '#22d3ee',
      primarySoft: 'rgba(34, 211, 238, 0.15)',
      secondary: '#a78bfa',
      accent: '#22d3ee',
      accentGlow: 'rgba(34, 211, 238, 0.6)',
      gradients: {
        hero: ['#22d3ee', '#a78bfa', '#f472b6'],
        celebration: ['#22d3ee', '#a78bfa', '#f472b6', '#22d3ee'],
      },
    },
    motion: {
      durationScale: 1.2, // Slightly slower for dramatic effect
      easing: {
        enter: 'spring',
        emphasis: 'elastic',
      },
      toastAnimation: {
        enter: 'scale',
        holdDurationMs: 4000,
      },
      enableParticles: true,
      enableGlow: true,
    },
    particles: {
      shape: 'star',
      colors: ['#22d3ee', '#a78bfa', '#f472b6', '#ffffff'],
      count: 100,
      speed: 0.7,
    },
    celebrations: {
      prCelebration: {
        style: 'particle-shower',
        intensity: 'epic',
      },
      rankUpCelebration: {
        style: 'tier-glow',
        showBadge: true,
      },
    },
    audio: {
      volumes: {
        sfx: 1.0,
        voice: 1.0,
      },
    },
  },

  {
    id: 'shadow-realm',
    name: 'Shadow Realm',
    description: 'Embrace the darkness. For those who train in the shadows.',
    tier: 'legendary',
    iapProductId: 'theme_shadow_realm',
    priceUsd: 7.99,
    tags: ['legendary', 'dark', 'minimal', 'intense'],
    colors: {
      background: '#000000',
      surface: '#0a0a0a',
      surfaceElevated: '#121212',
      border: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#808080',
      textMuted: '#404040',
      success: '#22c55e',
      danger: '#dc2626',
      warning: '#d97706',
      info: '#2563eb',
      primary: '#ffffff',
      primarySoft: 'rgba(255, 255, 255, 0.1)',
      secondary: '#a3a3a3',
      accent: '#ffffff',
      accentGlow: 'rgba(255, 255, 255, 0.3)',
      ranks: {
        iron: '#404040',
        bronze: '#8b5a2b',
        silver: '#708090',
        gold: '#c9a227',
        platinum: '#4a6670',
        diamond: '#6a5acd',
        mythic: '#800020',
      },
    },
    motion: {
      durationScale: 0.8, // Snappy
      easing: {
        enter: 'ease-out',
        exit: 'fade',
      },
      enableParticles: false, // Minimal aesthetic
      enableGlow: false,
      enableShake: true,
    },
    particles: {
      shape: 'spark',
      colors: ['#ffffff', '#808080'],
      count: 20,
    },
    celebrations: {
      prCelebration: {
        style: 'glow-burst',
        intensity: 'subtle',
      },
    },
  },
];

/**
 * Get a pack by ID
 */
export function getPackById(packId: string): ThemePack | undefined {
  return DEFAULT_THEME_PACKS.find(p => p.id === packId);
}

/**
 * Get all free packs
 */
export function getFreePacks(): ThemePack[] {
  return DEFAULT_THEME_PACKS.filter(p => p.tier === 'free');
}

/**
 * Get all premium packs
 */
export function getPremiumPacks(): ThemePack[] {
  return DEFAULT_THEME_PACKS.filter(p => p.tier === 'premium');
}

/**
 * Get all legendary packs
 */
export function getLegendaryPacks(): ThemePack[] {
  return DEFAULT_THEME_PACKS.filter(p => p.tier === 'legendary');
}
