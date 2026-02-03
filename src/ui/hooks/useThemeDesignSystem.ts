// src/ui/hooks/useThemeDesignSystem.ts
/**
 * GymRats Theme Design System Hook
 *
 * Combines theme store data with the design system to create a complete theme.
 * Implements the layered approach: PURE's emotional personality over LIFTOFF's functional efficiency.
 *
 * For complete visual style documentation, see docs/visual-style/
 */

import { useMemo } from 'react';
import { useTheme } from '../../ui/theme';
import { makeDesignSystem, makeDesignSystemFromPalette } from '../designSystem';
import type { DesignSystem } from '../designSystem';

export const useThemeDesignSystem = (): DesignSystem | null => {
  const { palette, typography, isLoaded } = useTheme();

  return useMemo(() => {
    if (!isLoaded || !palette) {
      return null;
    }

    // If the palette has the new extended structure with colors, use it
    if (palette.colors) {
      return makeDesignSystemFromPalette('dark', palette);
    }

    // Otherwise, fall back to the old mapping approach
    let accent: "toxic" | "electric" | "ember" | "ice" | "ultra" = "toxic";

    // Map our new palette IDs to the existing design system accents
    switch (palette.id) {
      case 'toxic-energy':
        accent = 'toxic';
        break;
      case 'iron-forge':
        accent = 'electric';
        break;
      case 'neon-glow':
        accent = 'ember';
        break;
      case 'cosmic-strength':
        accent = 'ice';
        break;
      case 'legendary-mystery':
        accent = 'ultra';
        break;
      default:
        accent = 'toxic';
    }

    // Create the design system with the selected accent
    return makeDesignSystem('dark', accent);
  }, [palette, isLoaded]);
};