// src/ui/themes/themeAssets.ts
// Theme-specific asset loading utilities

import type { PRType } from '@/src/lib/cues/cueTypes';

// ============================================================================
// Asset Map Types
// ============================================================================

type IllustrationKey = 'weight' | 'rep' | 'e1rm' | 'legendary' | 'rank_up' | 'volume' | 'streak' | 'cardio';
type TextureKey = 'metal' | 'noise' | 'scanlines';

// ============================================================================
// Asset Maps (Placeholder - replace with actual requires when assets exist)
// ============================================================================

/**
 * Theme illustration assets
 *
 * Structure: assetMap[themeSet][illustrationType]
 *
 * NOTE: These are placeholder nulls until actual assets are created.
 * Replace with require() statements when assets are added:
 *
 * @example
 * ```typescript
 * 'iron-forge': {
 *   'weight': require('@/assets/themes/iron-forge/illustrations/pr-weight.png'),
 *   // ...
 * }
 * ```
 */
const illustrationAssets: Record<string, Record<IllustrationKey, any>> = {
  'iron-forge': {
    'weight': null,    // require('@/assets/themes/iron-forge/illustrations/pr-weight.png')
    'rep': null,       // require('@/assets/themes/iron-forge/illustrations/pr-rep.png')
    'e1rm': null,      // require('@/assets/themes/iron-forge/illustrations/pr-e1rm.png')
    'legendary': null, // require('@/assets/themes/iron-forge/illustrations/pr-legendary.png')
    'rank_up': null,   // require('@/assets/themes/iron-forge/illustrations/rank-up.png')
    'volume': null,
    'streak': null,
    'cardio': null,
  },
  'toxic': {
    'weight': null,
    'rep': null,
    'e1rm': null,
    'legendary': null,
    'rank_up': null,
    'volume': null,
    'streak': null,
    'cardio': null,
  },
  'neon': {
    'weight': null,
    'rep': null,
    'e1rm': null,
    'legendary': null,
    'rank_up': null,
    'volume': null,
    'streak': null,
    'cardio': null,
  },
};

/**
 * Texture overlay assets
 */
const textureAssets: Record<string, any> = {
  'metal-texture': null,   // require('@/assets/themes/iron-forge/textures/metal.png')
  'noise-texture': null,   // require('@/assets/themes/toxic-energy/textures/noise.png')
  'scanlines': null,       // require('@/assets/themes/neon-glow/textures/scanlines.png')
};

// ============================================================================
// Asset Getters
// ============================================================================

/**
 * Get illustration asset for a theme and PR type
 *
 * @param themeSet - Theme's illustration set ID (from theme.assets.illustrationSet)
 * @param prType - Type of PR/cue to get illustration for
 * @returns Image source or null if not available
 *
 * @example
 * ```tsx
 * const theme = useTheme();
 * const illustration = getThemeIllustration(theme.assets.illustrationSet, 'weight');
 *
 * {illustration && <Image source={illustration} />}
 * ```
 */
export function getThemeIllustration(
  themeSet: string,
  prType: PRType | string
): any | null {
  const themeIllustrations = illustrationAssets[themeSet];
  if (!themeIllustrations) return null;

  // Map PRType to illustration key
  const keyMap: Record<string, IllustrationKey> = {
    'weight': 'weight',
    'rep': 'rep',
    'e1rm': 'e1rm',
    'rank_up': 'rank_up',
    'volume': 'volume',
    'streak': 'streak',
    'cardio': 'cardio',
  };

  const key = keyMap[prType];
  if (!key) return null;

  return themeIllustrations[key] || null;
}

/**
 * Get legendary celebration illustration for a theme
 *
 * @param themeSet - Theme's illustration set ID
 * @returns Legendary illustration source or null
 */
export function getLegendaryIllustration(themeSet: string): any | null {
  return illustrationAssets[themeSet]?.legendary || null;
}

/**
 * Get texture overlay asset
 *
 * @param textureId - Texture overlay ID (from theme.assets.textureOverlay)
 * @returns Texture source or null
 */
export function getTextureOverlay(textureId: string | undefined): any | null {
  if (!textureId) return null;
  return textureAssets[textureId] || null;
}

/**
 * Check if theme has illustrations available
 *
 * @param themeSet - Theme's illustration set ID
 * @returns true if at least one illustration is available
 */
export function hasThemeIllustrations(themeSet: string): boolean {
  const themeIllustrations = illustrationAssets[themeSet];
  if (!themeIllustrations) return false;

  return Object.values(themeIllustrations).some(asset => asset !== null);
}

// ============================================================================
// Asset Directory Structure Reference
// ============================================================================

/**
 * Expected asset directory structure:
 *
 * assets/
 * └── themes/
 *     ├── iron-forge/
 *     │   ├── illustrations/
 *     │   │   ├── pr-weight.png      (200x200)
 *     │   │   ├── pr-rep.png         (200x200)
 *     │   │   ├── pr-e1rm.png        (200x200)
 *     │   │   ├── pr-legendary.png   (300x300)
 *     │   │   └── rank-up.png        (200x200)
 *     │   ├── textures/
 *     │   │   └── metal.png          (512x512, tileable)
 *     │   └── frames/
 *     │       └── badge-frame.svg
 *     ├── toxic-energy/
 *     │   └── ... (same structure)
 *     └── neon-glow/
 *         └── ... (same structure)
 */
