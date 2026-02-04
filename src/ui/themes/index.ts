// src/ui/themes/index.ts
// Theme system barrel exports

// Types
export type { ThemeTokens, ThemeId } from './themeTokens';
export { DEFAULT_THEME_ID } from './themeTokens';

// Theme definitions
export { ironForgeTheme } from './ironForge';
export { toxicEnergyTheme } from './toxicEnergy';
export { neonGlowTheme } from './neonGlow';

// Provider and hooks
export {
  ThemeProvider,
  useTheme,
  useThemeTokenColors,
  useThemeMotion,
  useThemeSurfaces,
  themes,
  getTheme,
  getAvailableThemeIds,
} from './ThemeProvider';

// Asset utilities
export {
  getThemeIllustration,
  getLegendaryIllustration,
  getTextureOverlay,
  hasThemeIllustrations,
} from './themeAssets';
