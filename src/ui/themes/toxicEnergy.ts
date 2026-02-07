// src/ui/themes/toxicEnergy.ts
// Toxic Energy theme - Radioactive neon aesthetic

import type { ThemeTokens } from './themeTokens';

/**
 * Toxic Energy Theme
 *
 * Aesthetic: Radioactive, electric, aggressive
 * Primary: Toxic lime (#ADFF2F)
 * Secondary: Electric magenta (#FF00FF)
 * Mood: High energy, dangerous, unstable power
 */
export const toxicEnergyTheme: ThemeTokens = {
  id: 'toxic-energy',
  name: 'Toxic Energy',

  colors: {
    // Backgrounds - pure black for max contrast
    bg: '#0A0A0A',
    bgElevated: '#121212',
    card: '#1A1A1A',
    cardElevated: '#222222',
    border: '#2D2D2D',
    borderSubtle: '#1F1F1F',

    // Text - bright for readability against neon
    text: '#F0F0F0',
    textMuted: '#808080',
    textInverse: '#0A0A0A',

    // Accents - radioactive colors
    primary: '#ADFF2F',      // Toxic lime (chartreuse)
    primaryMuted: '#8BCC26',
    secondary: '#FF00FF',    // Electric magenta
    secondaryMuted: '#CC00CC',

    // Semantic - toxic themed
    success: '#ADFF2F',      // Success = toxic green
    warning: '#FFFF00',      // Caution yellow
    error: '#FF3366',        // Hot pink error

    // Rank colors - neon variants (10 tiers)
    rankCopper: '#B87333',
    rankBronze: '#8B4513',
    rankIron: '#5A5A5A',
    rankSilver: '#A8A8A8',
    rankGold: '#CCCC00',     // Toxic gold
    rankMaster: '#FFFACD',   // Bright white-gold
    rankLegendary: '#9400D3', // Dark violet
    rankMythic: '#ADFF2F',   // Toxic lime for mythic
    rankSupremeBeing: '#FF4500', // Cosmic fire
    rankGoat: '#FFFFFF',     // Pure white
  },

  gradients: {
    primary: ['#ADFF2F', '#7CFC00'],
    accent: ['#FF00FF', '#ADFF2F'],
    card: ['#1A1A1A', '#222222'],
    prCelebration: ['#ADFF2F', '#FF00FF', '#ADFF2F'],
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
    cardOpacity: 0.9,
    overlayOpacity: 0.8,
    glowIntensity: 0.5,      // High glow for toxic effect
  },

  motion: {
    prEntryDuration: 200,    // Fast, aggressive
    prHoldDuration: 2500,
    springTension: 60,       // Snappy, electric
    springFriction: 5,
  },

  assets: {
    illustrationSet: 'toxic',
    iconSet: 'toxic',
    textureOverlay: 'noise-texture',
  },
};
