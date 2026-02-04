// src/ui/themes/neonGlow.ts
// Neon Glow theme - Cosmic cyberpunk aesthetic

import type { ThemeTokens } from './themeTokens';

/**
 * Neon Glow Theme
 *
 * Aesthetic: Cosmic, cyberpunk, futuristic
 * Primary: Neon magenta (#FF00FF)
 * Secondary: Cyan (#00FFFF)
 * Mood: Fluid, ethereal, otherworldly power
 */
export const neonGlowTheme: ThemeTokens = {
  id: 'neon-glow',
  name: 'Neon Glow',

  colors: {
    // Backgrounds - deep space blue-black
    bg: '#050510',
    bgElevated: '#0A0A1A',
    card: '#12122A',
    cardElevated: '#1A1A3A',
    border: '#2A2A4A',
    borderSubtle: '#1A1A3A',

    // Text - pure white for neon contrast
    text: '#FFFFFF',
    textMuted: '#8888AA',
    textInverse: '#050510',

    // Accents - neon spectrum
    primary: '#FF00FF',      // Neon magenta
    primaryMuted: '#CC00CC',
    secondary: '#00FFFF',    // Cyan
    secondaryMuted: '#00CCCC',

    // Semantic - cosmic variants
    success: '#00FF88',      // Neon green
    warning: '#FFFF00',      // Bright yellow
    error: '#FF3366',        // Hot pink

    // Rank colors - cosmic spectrum
    rankIron: '#4A4A6A',     // Muted purple-gray
    rankBronze: '#8B5A2B',
    rankSilver: '#9090B0',   // Purple-tinted silver
    rankGold: '#FFD700',
    rankPlatinum: '#C0C0E0', // Platinum with blue tint
    rankDiamond: '#00FFFF',  // Pure cyan
    rankMythic: '#FF00FF',   // Neon magenta for mythic
  },

  gradients: {
    primary: ['#FF00FF', '#FF66FF'],
    accent: ['#00FFFF', '#FF00FF'],
    card: ['#12122A', '#1A1A3A'],
    prCelebration: ['#FF00FF', '#00FFFF', '#FF00FF'],
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
    cardOpacity: 0.85,
    overlayOpacity: 0.75,
    glowIntensity: 0.6,      // Maximum glow for neon effect
  },

  motion: {
    prEntryDuration: 250,    // Smooth, fluid
    prHoldDuration: 3000,
    springTension: 50,       // Balanced
    springFriction: 6,
  },

  assets: {
    illustrationSet: 'neon',
    iconSet: 'neon',
    textureOverlay: 'scanlines',
  },
};
