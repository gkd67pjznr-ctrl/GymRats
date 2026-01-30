// src/lib/themeDatabase.ts
/**
 * Forgerank Theme Database
 *
 * Manages the storage and retrieval of UI themes with emotional meaning.
 * Implements the layered approach: PURE's emotional personality over LIFTOFF's functional efficiency.
 *
 * For complete visual style documentation, see docs/visual-style/
 */

export type AccentTheme = 'toxic-energy' | 'iron-forge' | 'neon-glow' | 'cosmic-strength' | 'legendary-mystery';

export interface ThemePalette {
  id: AccentTheme;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  soft: string;
  emotionalMeaning: string;
  isPremium: boolean;
  isLegendary: boolean;
}

export interface ThemeTypography {
  id: string;
  name: string;
  primaryFont: string;
  headingWeight: '700' | '800' | '900';
  bodyWeight: '600' | '700';
  personalityTreatment: 'none' | 'bold' | 'irregular' | 'hand-drawn';
  isPremium: boolean;
}

export interface ThemeIllustration {
  id: string;
  name: string;
  style: 'hand-drawn' | 'surreal' | 'psychedelic' | 'minimal';
  themes: string[];
  isPremium: boolean;
  isLegendary: boolean;
}

export interface ThemeConfiguration {
  id: string;
  name: string;
  paletteId: string;
  typographyId: string;
  illustrationId: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  isDefault: boolean;
}

export interface ThemeDatabase {
  palettes: ThemePalette[];
  typography: ThemeTypography[];
  illustrations: ThemeIllustration[];
  configurations: ThemeConfiguration[];
}

/**
 * Default theme palettes with emotional meaning rather than semantic state
 */
export const DEFAULT_PALETTES: ThemePalette[] = [
  {
    id: 'toxic-energy',
    name: 'Toxic Energy',
    description: 'High-intensity moments with vibrant magenta and electric blue',
    primary: '#FF00FF',
    secondary: '#00FFFF',
    accent: '#A6FF00',
    soft: '#203018',
    emotionalMeaning: 'Energy',
    isPremium: false,
    isLegendary: false,
  },
  {
    id: 'iron-forge',
    name: 'Iron Forge',
    description: 'Power and intensity with deep purple and bronze gold',
    primary: '#4B0082',
    secondary: '#CD7F32',
    accent: '#6D5BFF',
    soft: '#1C1B2C',
    emotionalMeaning: 'Strength',
    isPremium: false,
    isLegendary: false,
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    description: 'Bold and vibrant with electric lime and hot pink',
    primary: '#39FF14',
    secondary: '#FF1493',
    accent: '#B8FF5A',
    soft: '#22162B',
    emotionalMeaning: 'Growth',
    isPremium: true,
    isLegendary: false,
  },
  {
    id: 'cosmic-strength',
    name: 'Cosmic Strength',
    description: 'Deep and powerful with deep blue and silver',
    primary: '#00008B',
    secondary: '#C0C0C0',
    accent: '#00F5D4',
    soft: '#142528',
    emotionalMeaning: 'Strength',
    isPremium: true,
    isLegendary: false,
  },
  {
    id: 'legendary-mystery',
    name: 'Legendary Mystery',
    description: 'Theme-warping presence with unique personality, theme override, SFX and voice lines',
    primary: '#8A2BE2',
    secondary: '#00CED1',
    accent: '#FF4DFF',
    soft: '#2D1B3D',
    emotionalMeaning: 'Mystery',
    isPremium: false,
    isLegendary: true,
  },
];

/**
 * Typography styles balancing clarity with personality
 */
export const DEFAULT_TYPOGRAPHY: ThemeTypography[] = [
  {
    id: 'functional-base',
    name: 'Functional Base',
    primaryFont: 'System',
    headingWeight: '900',
    bodyWeight: '700',
    personalityTreatment: 'none',
    isPremium: false,
  },
  {
    id: 'personality-bold',
    name: 'Personality Bold',
    primaryFont: 'System',
    headingWeight: '900',
    bodyWeight: '700',
    personalityTreatment: 'bold',
    isPremium: false,
  },
  {
    id: 'personality-irregular',
    name: 'Personality Irregular',
    primaryFont: 'System',
    headingWeight: '900',
    bodyWeight: '700',
    personalityTreatment: 'irregular',
    isPremium: true,
  },
  {
    id: 'personality-hand-drawn',
    name: 'Personality Hand-Drawn',
    primaryFont: 'System',
    headingWeight: '900',
    bodyWeight: '700',
    personalityTreatment: 'hand-drawn',
    isPremium: true,
  },
];

/**
 * Illustration styles with fitness-specific themes
 */
export const DEFAULT_ILLUSTRATIONS: ThemeIllustration[] = [
  {
    id: 'hand-drawn-base',
    name: 'Hand-Drawn Base',
    style: 'hand-drawn',
    themes: ['strength', 'power', 'growth', 'energy', 'health'],
    isPremium: false,
    isLegendary: false,
  },
  {
    id: 'surreal-energy',
    name: 'Surreal Energy',
    style: 'surreal',
    themes: ['energy', 'power', 'abstract'],
    isPremium: true,
    isLegendary: false,
  },
  {
    id: 'psychedelic-growth',
    name: 'Psychedelic Growth',
    style: 'psychedelic',
    themes: ['growth', 'progression', 'abstract'],
    isPremium: true,
    isLegendary: false,
  },
  {
    id: 'legendary-transform',
    name: 'Legendary Transformation',
    style: 'psychedelic',
    themes: ['mystery', 'legendary', 'transformation'],
    isPremium: false,
    isLegendary: true,
  },
];

/**
 * Default theme configurations
 */
export const DEFAULT_CONFIGURATIONS: ThemeConfiguration[] = [
  {
    id: 'default-dark',
    name: 'Default Dark',
    paletteId: 'toxic-energy',
    typographyId: 'functional-base',
    illustrationId: 'hand-drawn-base',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: true,
    isDefault: true,
  },
];

/**
 * Initialize the theme database with default values
 */
export function initializeThemeDatabase(): ThemeDatabase {
  return {
    palettes: DEFAULT_PALETTES,
    typography: DEFAULT_TYPOGRAPHY,
    illustrations: DEFAULT_ILLUSTRATIONS,
    configurations: DEFAULT_CONFIGURATIONS,
  };
}

/**
 * Get a theme palette by ID
 */
export function getPaletteById(database: ThemeDatabase, id: string): ThemePalette | undefined {
  return database.palettes.find(palette => palette.id === id);
}

/**
 * Get typography by ID
 */
export function getTypographyById(database: ThemeDatabase, id: string): ThemeTypography | undefined {
  return database.typography.find(typography => typography.id === id);
}

/**
 * Get illustration by ID
 */
export function getIllustrationById(database: ThemeDatabase, id: string): ThemeIllustration | undefined {
  return database.illustrations.find(illustration => illustration.id === id);
}

/**
 * Get configuration by ID
 */
export function getConfigurationById(database: ThemeDatabase, id: string): ThemeConfiguration | undefined {
  return database.configurations.find(config => config.id === id);
}

/**
 * Get active configuration
 */
export function getActiveConfiguration(database: ThemeDatabase): ThemeConfiguration | undefined {
  return database.configurations.find(config => config.isActive);
}

/**
 * Set active configuration
 */
export function setActiveConfiguration(database: ThemeDatabase, id: string): ThemeDatabase {
  return {
    ...database,
    configurations: database.configurations.map(config => ({
      ...config,
      isActive: config.id === id,
      updatedAt: config.id === id ? Date.now() : config.updatedAt,
    })),
  };
}

/**
 * Add a new theme configuration
 */
export function addConfiguration(database: ThemeDatabase, config: Omit<ThemeConfiguration, 'createdAt' | 'updatedAt'>): ThemeDatabase {
  const newConfig: ThemeConfiguration = {
    ...config,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return {
    ...database,
    configurations: [...database.configurations, newConfig],
  };
}

/**
 * Update an existing theme configuration
 */
export function updateConfiguration(database: ThemeDatabase, id: string, updates: Partial<Omit<ThemeConfiguration, 'id' | 'createdAt' | 'updatedAt'>>): ThemeDatabase {
  return {
    ...database,
    configurations: database.configurations.map(config =>
      config.id === id
        ? { ...config, ...updates, updatedAt: Date.now() }
        : config
    ),
  };
}