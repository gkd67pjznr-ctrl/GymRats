// src/ui/themes/themeTokens.ts
// Theme token type definitions for the visual theme system

/**
 * Complete theme token interface
 * Defines all customizable aspects of a visual theme
 */
export interface ThemeTokens {
  /** Unique theme identifier */
  id: string;

  /** Display name for theme selector */
  name: string;

  /** Color palette */
  colors: {
    // Backgrounds
    bg: string;
    bgElevated: string;
    card: string;
    cardElevated: string;
    border: string;
    borderSubtle: string;

    // Text
    text: string;
    textMuted: string;
    textInverse: string;

    // Accents
    primary: string;
    primaryMuted: string;
    secondary: string;
    secondaryMuted: string;

    // Semantic
    success: string;
    warning: string;
    error: string;

    // Rank colors (themed per palette)
    rankIron: string;
    rankBronze: string;
    rankSilver: string;
    rankGold: string;
    rankPlatinum: string;
    rankDiamond: string;
    rankMythic: string;
  };

  /** Gradient definitions [start, ...middle, end] */
  gradients: {
    primary: string[];
    accent: string[];
    card: string[];
    prCelebration: string[];
  };

  /** Typography settings */
  typography: {
    fontFamily: {
      display: string;
      body: string;
      mono: string;
    };
    fontWeight: {
      regular: string;
      medium: string;
      bold: string;
      black: string;
    };
  };

  /** Surface properties */
  surfaces: {
    cardOpacity: number;
    overlayOpacity: number;
    glowIntensity: number;
  };

  /** Animation presets */
  motion: {
    prEntryDuration: number;
    prHoldDuration: number;
    springTension: number;
    springFriction: number;
  };

  /** Asset references */
  assets: {
    illustrationSet: string;
    iconSet: string;
    textureOverlay?: string;
  };
}

/** Available theme IDs */
export type ThemeId = 'iron-forge' | 'toxic-energy' | 'neon-glow';

/** Default theme ID */
export const DEFAULT_THEME_ID: ThemeId = 'toxic-energy';
