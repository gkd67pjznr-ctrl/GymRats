// src/ui/themes/ironForge.ts
// Iron Forge theme - Medieval blacksmith aesthetic

import type { ThemeTokens } from './themeTokens';

/**
 * Iron Forge Theme
 *
 * Aesthetic: Medieval blacksmith, gritty, powerful
 * Primary: Forge orange (#FF6B35)
 * Secondary: Molten gold (#FFB347)
 * Mood: Heavy, impactful, earned through fire
 */
export const ironForgeTheme: ThemeTokens = {
  id: 'iron-forge',
  name: 'Iron Forge',

  colors: {
    // Backgrounds - charcoal/ash tones
    bg: '#0D0D0D',
    bgElevated: '#1A1A1A',
    card: '#1F1F1F',
    cardElevated: '#2A2A2A',
    border: '#3D3D3D',
    borderSubtle: '#2A2A2A',

    // Text - warm whites
    text: '#F5F5F5',
    textMuted: '#A0A0A0',
    textInverse: '#0D0D0D',

    // Accents - forge fire colors
    primary: '#FF6B35',      // Forge orange
    primaryMuted: '#CC5629',
    secondary: '#FFB347',    // Molten gold
    secondaryMuted: '#CC8F39',

    // Semantic
    success: '#4CAF50',
    warning: '#FFB347',
    error: '#FF5252',

    // Rank colors - metallic/forge themed
    rankIron: '#71797E',
    rankBronze: '#CD7F32',
    rankSilver: '#C0C0C0',
    rankGold: '#FFD700',
    rankPlatinum: '#E5E4E2',
    rankDiamond: '#B9F2FF',
    rankMythic: '#FF6B35',   // Theme accent for mythic
  },

  gradients: {
    primary: ['#FF6B35', '#FF8C42'],
    accent: ['#FFB347', '#FF6B35'],
    card: ['#1F1F1F', '#2A2A2A'],
    prCelebration: ['#FF6B35', '#FFB347', '#FF6B35'],
  },

  typography: {
    fontFamily: {
      display: 'System',
      body: 'System',
      mono: 'SpaceMono',
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      bold: '700',
      black: '900',
    },
  },

  surfaces: {
    cardOpacity: 0.95,
    overlayOpacity: 0.85,
    glowIntensity: 0.3,      // Subtle ember glow
  },

  motion: {
    prEntryDuration: 300,    // Heavier, more deliberate
    prHoldDuration: 3000,
    springTension: 40,       // Lower tension = heavier feel
    springFriction: 7,
  },

  assets: {
    illustrationSet: 'iron-forge',
    iconSet: 'iron-forge',
    textureOverlay: 'metal-texture',
  },
};
