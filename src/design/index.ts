/**
 * Design System - Main Entry Point
 *
 * Modern, layered design system for Forgerank.
 * Import from here for all design-related utilities.
 *
 * Architecture:
 * 1. Tokens (primitives → semantic → components)
 * 2. Surfaces (elevation, gradients)
 * 3. Primitives (Surface, Card, GlassPanel, Text, Button)
 * 4. Themes (complete theme installations)
 * 5. Motion (animations, springs, easings)
 * 6. Art (illustrations, celebrations, particles, decorations)
 */

// =============================================================================
// TOKENS
// =============================================================================

export * from './tokens';

// =============================================================================
// SURFACES
// =============================================================================

export * from './surfaces';

// =============================================================================
// PRIMITIVES
// =============================================================================

export * from './primitives';

// =============================================================================
// THEMES
// =============================================================================

export * from './themes';

// =============================================================================
// MOTION
// =============================================================================

export * from './motion';

// =============================================================================
// ART (Illustrations, Celebrations, Particles)
// =============================================================================

export * from './art';

// =============================================================================
// CONVENIENCE RE-EXPORTS
// =============================================================================

// Most commonly used tokens
export {
  colors,
  spacing,
  radius,
  fontSizes,
  fontWeights,
} from './tokens/primitives';

export {
  surface,
  text,
  border,
  corners,
  shadow,
  typography,
} from './tokens/semantic';

// Most commonly used primitives
export { Surface } from './primitives/Surface';
export { Card } from './primitives/Card';
export { GlassPanel } from './primitives/GlassPanel';
export { Text } from './primitives/Text';
export { Button, IconButton } from './primitives/Button';

// Most commonly used theme hooks
export {
  useTheme,
  useThemeColors,
  useAccentColor,
  useRankColor,
} from './themes/useTheme';

export { ThemeProvider } from './themes/ThemeContext';
