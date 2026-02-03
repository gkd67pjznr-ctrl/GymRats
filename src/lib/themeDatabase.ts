// src/lib/themeDatabase.ts
/**
 * GymRats Theme Database
 *
 * Manages the storage and retrieval of UI themes with emotional meaning.
 * Implements the layered approach: PURE's emotional personality over LIFTOFF's functional efficiency.
 *
 * For complete visual style documentation, see docs/visual-style/
 */

export type AccentTheme = 'toxic-energy' | 'iron-forge' | 'neon-glow' | 'cosmic-strength' | 'legendary-mystery';

export interface ThemePalette {
  id: string;
  name: string;
  description: string;
  // Extended color system
  colors: {
    // Core UI colors
    background: string;
    card: string;
    border: string;
    text: string;
    muted: string;

    // Semantic colors
    success: string;
    danger: string;
    warning: string;
    info: string;

    // Accent system
    primary: string;
    secondary: string;
    accent: string;
    accent2: string;
    soft: string;

    // Rank colors
    iron: string;
    bronze: string;
    silver: string;
    gold: string;
    platinum: string;
    diamond: string;
    mythic: string;
  };
  emotionalMeaning: string;
  isPremium: boolean;
  isLegendary: boolean;
  tags: string[];
}

export interface ThemeTypography {
  id: string;
  name: string;
  primaryFont: string;
  weights: {
    hero: '700' | '800' | '900';
    h1: '700' | '800' | '900';
    h2: '700' | '800' | '900';
    h3: '700' | '800' | '900';
    body: '600' | '700';
    caption: '600' | '700' | '800';
  };
  sizes: {
    hero: number;
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
  };
  lineHeights: {
    hero: number;
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
  };
  personalityTreatment: 'none' | 'bold' | 'irregular' | 'hand-drawn';
  letterSpacing: {
    hero: number;
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
  };
  isPremium: boolean;
}

export interface ThemeIllustration {
  id: string;
  name: string;
  description: string;
  category: 'achievement' | 'rank' | 'pr' | 'emotional' | 'loading' | 'empty-state';
  style: 'hand-drawn' | 'surreal' | 'psychedelic' | 'minimal';
  assetPath: string;
  variants: {
    small: string;
    medium: string;
    large: string;
  };
  themes: string[];
  isPremium: boolean;
  isLegendary: boolean;
  animationType?: 'none' | 'pulse' | 'bounce' | 'float' | 'custom';
}

export interface ThemeAudio {
  id: string;
  name: string;
  category: 'pr' | 'rank-up' | 'workout-start' | 'workout-end' | 'set-logged' | 'error';
  assetPath: string;
  volume: number;
  isPremium: boolean;
  isLegendary: boolean;
}

export interface ThemeMotion {
  id: string;
  name: string;
  duration: {
    fast: number;
    medium: number;
    slow: number;
  };
  easing: {
    easeOut: [number, number, number, number];
  };
  spring: {
    tension: number;
    friction: number;
  };
  haptics: {
    light: string;
    medium: string;
    heavy: string;
  };
  isPremium: boolean;
}

export interface ThemeConfiguration {
  id: string;
  name: string;
  paletteId: string;
  typographyId: string;
  illustrationId: string;
  audioId: string;
  motionId: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  isDefault: boolean;
  isPremium: boolean;
  isLegendary: boolean;
}

export interface ThemeDatabase {
  palettes: ThemePalette[];
  typography: ThemeTypography[];
  illustrations: ThemeIllustration[];
  audio: ThemeAudio[];
  motion: ThemeMotion[];
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
    colors: {
      background: '#0A0A0D',
      card: '#111118',
      border: '#26263A',
      text: '#F2F4FF',
      muted: '#A9AEC7',
      success: '#20FF9A',
      danger: '#FF2D55',
      warning: '#FFB020',
      info: '#3A8DFF',
      primary: '#FF00FF',
      secondary: '#00FFFF',
      accent: '#A6FF00',
      accent2: '#00FFB3',
      soft: '#203018',
      iron: '#7B7E8A',
      bronze: '#B07A4A',
      silver: '#BFC7D5',
      gold: '#FFCC4A',
      platinum: '#64E6C2',
      diamond: '#53A8FF',
      mythic: '#FF4DFF',
    },
    emotionalMeaning: 'Energy',
    isPremium: false,
    isLegendary: false,
    tags: ['energy', 'intense', 'vibrant']
  },
  {
    id: 'iron-forge',
    name: 'Iron Forge',
    description: 'Power and intensity with deep purple and bronze gold',
    colors: {
      background: '#0A0A0D',
      card: '#111118',
      border: '#26263A',
      text: '#F2F4FF',
      muted: '#A9AEC7',
      success: '#20FF9A',
      danger: '#FF2D55',
      warning: '#FFB020',
      info: '#3A8DFF',
      primary: '#4B0082',
      secondary: '#CD7F32',
      accent: '#6D5BFF',
      accent2: '#00D5FF',
      soft: '#1C1B2C',
      iron: '#7B7E8A',
      bronze: '#B07A4A',
      silver: '#BFC7D5',
      gold: '#FFCC4A',
      platinum: '#64E6C2',
      diamond: '#53A8FF',
      mythic: '#FF4DFF',
    },
    emotionalMeaning: 'Strength',
    isPremium: false,
    isLegendary: false,
    tags: ['strength', 'power', 'intense']
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    description: 'Bold and vibrant with electric lime and hot pink',
    colors: {
      background: '#0A0A0D',
      card: '#111118',
      border: '#26263A',
      text: '#F2F4FF',
      muted: '#A9AEC7',
      success: '#20FF9A',
      danger: '#FF2D55',
      warning: '#FFB020',
      info: '#3A8DFF',
      primary: '#39FF14',
      secondary: '#FF1493',
      accent: '#B8FF5A',
      accent2: '#FF4DFF',
      soft: '#22162B',
      iron: '#7B7E8A',
      bronze: '#B07A4A',
      silver: '#BFC7D5',
      gold: '#FFCC4A',
      platinum: '#64E6C2',
      diamond: '#53A8FF',
      mythic: '#FF4DFF',
    },
    emotionalMeaning: 'Growth',
    isPremium: true,
    isLegendary: false,
    tags: ['growth', 'vibrant', 'energy']
  },
  {
    id: 'cosmic-strength',
    name: 'Cosmic Strength',
    description: 'Deep and powerful with deep blue and silver',
    colors: {
      background: '#0A0A0D',
      card: '#111118',
      border: '#26263A',
      text: '#F2F4FF',
      muted: '#A9AEC7',
      success: '#20FF9A',
      danger: '#FF2D55',
      warning: '#FFB020',
      info: '#3A8DFF',
      primary: '#00008B',
      secondary: '#C0C0C0',
      accent: '#00F5D4',
      accent2: '#7DF9FF',
      soft: '#142528',
      iron: '#7B7E8A',
      bronze: '#B07A4A',
      silver: '#BFC7D5',
      gold: '#FFCC4A',
      platinum: '#64E6C2',
      diamond: '#53A8FF',
      mythic: '#FF4DFF',
    },
    emotionalMeaning: 'Strength',
    isPremium: true,
    isLegendary: false,
    tags: ['strength', 'power', 'deep']
  },
  {
    id: 'legendary-mystery',
    name: 'Legendary Mystery',
    description: 'Theme-warping presence with unique personality, theme override, SFX and voice lines',
    colors: {
      background: '#0A0A0D',
      card: '#111118',
      border: '#26263A',
      text: '#F2F4FF',
      muted: '#A9AEC7',
      success: '#20FF9A',
      danger: '#FF2D55',
      warning: '#FFB020',
      info: '#3A8DFF',
      primary: '#8A2BE2',
      secondary: '#00CED1',
      accent: '#FF4DFF',
      accent2: '#00FFFF',
      soft: '#2D1B3D',
      iron: '#7B7E8A',
      bronze: '#B07A4A',
      silver: '#BFC7D5',
      gold: '#FFCC4A',
      platinum: '#64E6C2',
      diamond: '#53A8FF',
      mythic: '#FF4DFF',
    },
    emotionalMeaning: 'Mystery',
    isPremium: false,
    isLegendary: true,
    tags: ['mystery', 'legendary', 'transformation']
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
    weights: {
      hero: '900',
      h1: '900',
      h2: '900',
      h3: '800',
      body: '700',
      caption: '800'
    },
    sizes: {
      hero: 34,
      h1: 26,
      h2: 20,
      h3: 16,
      body: 15,
      caption: 12
    },
    lineHeights: {
      hero: 38,
      h1: 30,
      h2: 24,
      h3: 20,
      body: 20,
      caption: 16
    },
    personalityTreatment: 'none',
    letterSpacing: {
      hero: -0.6,
      h1: -0.4,
      h2: -0.2,
      h3: -0.1,
      body: 0,
      caption: 0.2
    },
    isPremium: false,
  },
  {
    id: 'personality-bold',
    name: 'Personality Bold',
    primaryFont: 'System',
    weights: {
      hero: '900',
      h1: '900',
      h2: '900',
      h3: '800',
      body: '700',
      caption: '800'
    },
    sizes: {
      hero: 34,
      h1: 26,
      h2: 20,
      h3: 16,
      body: 15,
      caption: 12
    },
    lineHeights: {
      hero: 38,
      h1: 30,
      h2: 24,
      h3: 20,
      body: 20,
      caption: 16
    },
    personalityTreatment: 'bold',
    letterSpacing: {
      hero: -0.6,
      h1: -0.4,
      h2: -0.2,
      h3: -0.1,
      body: 0,
      caption: 0.2
    },
    isPremium: false,
  },
  {
    id: 'personality-irregular',
    name: 'Personality Irregular',
    primaryFont: 'System',
    weights: {
      hero: '900',
      h1: '900',
      h2: '900',
      h3: '800',
      body: '700',
      caption: '800'
    },
    sizes: {
      hero: 34,
      h1: 26,
      h2: 20,
      h3: 16,
      body: 15,
      caption: 12
    },
    lineHeights: {
      hero: 38,
      h1: 30,
      h2: 24,
      h3: 20,
      body: 20,
      caption: 16
    },
    personalityTreatment: 'irregular',
    letterSpacing: {
      hero: -0.6,
      h1: -0.4,
      h2: -0.2,
      h3: -0.1,
      body: 0,
      caption: 0.2
    },
    isPremium: true,
  },
  {
    id: 'personality-hand-drawn',
    name: 'Personality Hand-Drawn',
    primaryFont: 'System',
    weights: {
      hero: '900',
      h1: '900',
      h2: '900',
      h3: '800',
      body: '700',
      caption: '800'
    },
    sizes: {
      hero: 34,
      h1: 26,
      h2: 20,
      h3: 16,
      body: 15,
      caption: 12
    },
    lineHeights: {
      hero: 38,
      h1: 30,
      h2: 24,
      h3: 20,
      body: 20,
      caption: 16
    },
    personalityTreatment: 'hand-drawn',
    letterSpacing: {
      hero: -0.6,
      h1: -0.4,
      h2: -0.2,
      h3: -0.1,
      body: 0,
      caption: 0.2
    },
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
    description: 'Personal and approachable illustrations with a hand-crafted feel',
    category: 'emotional',
    style: 'hand-drawn',
    assetPath: 'illustrations/emotional/hand-drawn-base.svg',
    variants: {
      small: 'illustrations/emotional/hand-drawn-base-small.svg',
      medium: 'illustrations/emotional/hand-drawn-base-medium.svg',
      large: 'illustrations/emotional/hand-drawn-base-large.svg'
    },
    themes: ['strength', 'power', 'growth', 'energy', 'health'],
    isPremium: false,
    isLegendary: false,
    animationType: 'none'
  },
  {
    id: 'surreal-energy',
    name: 'Surreal Energy',
    description: 'Dynamic and energizing visuals with abstract, flowing forms',
    category: 'emotional',
    style: 'surreal',
    assetPath: 'illustrations/emotional/surreal-energy.svg',
    variants: {
      small: 'illustrations/emotional/surreal-energy-small.svg',
      medium: 'illustrations/emotional/surreal-energy-medium.svg',
      large: 'illustrations/emotional/surreal-energy-large.svg'
    },
    themes: ['energy', 'power', 'abstract'],
    isPremium: true,
    isLegendary: false,
    animationType: 'pulse'
  },
  {
    id: 'psychedelic-growth',
    name: 'Psychedelic Growth',
    description: 'Vibrant and evolving visuals that represent progress and transformation',
    category: 'emotional',
    style: 'psychedelic',
    assetPath: 'illustrations/emotional/psychedelic-growth.svg',
    variants: {
      small: 'illustrations/emotional/psychedelic-growth-small.svg',
      medium: 'illustrations/emotional/psychedelic-growth-medium.svg',
      large: 'illustrations/emotional/psychedelic-growth-large.svg'
    },
    themes: ['growth', 'progression', 'abstract'],
    isPremium: true,
    isLegendary: false,
    animationType: 'float'
  },
  {
    id: 'legendary-transform',
    name: 'Legendary Transformation',
    description: 'Theme-warping visuals with unique personality and special effects',
    category: 'emotional',
    style: 'psychedelic',
    assetPath: 'illustrations/emotional/legendary-transform.svg',
    variants: {
      small: 'illustrations/emotional/legendary-transform-small.svg',
      medium: 'illustrations/emotional/legendary-transform-medium.svg',
      large: 'illustrations/emotional/legendary-transform-large.svg'
    },
    themes: ['mystery', 'legendary', 'transformation'],
    isPremium: false,
    isLegendary: true,
    animationType: 'custom'
  },
];

/**
 * Audio themes for themed sound experiences
 */
export const DEFAULT_AUDIO: ThemeAudio[] = [
  {
    id: 'spark-pr',
    name: 'Spark PR Sound',
    category: 'pr',
    assetPath: 'audio/pr/spark.mp3',
    volume: 0.8,
    isPremium: false,
    isLegendary: false
  },
  {
    id: 'stamp-completion',
    name: 'Stamp Completion Sound',
    category: 'workout-end',
    assetPath: 'audio/workout/stamp.mp3',
    volume: 0.7,
    isPremium: false,
    isLegendary: false
  },
  {
    id: 'thud-error',
    name: 'Thud Error Sound',
    category: 'error',
    assetPath: 'audio/ui/thud.mp3',
    volume: 0.6,
    isPremium: false,
    isLegendary: false
  },
  {
    id: 'legendary-fanfare',
    name: 'Legendary Fanfare',
    category: 'rank-up',
    assetPath: 'audio/rank-up/legendary-fanfare.mp3',
    volume: 0.9,
    isPremium: false,
    isLegendary: true
  }
];

/**
 * Motion and haptic profiles for themed interactions
 */
export const DEFAULT_MOTION: ThemeMotion[] = [
  {
    id: 'snappy-base',
    name: 'Snappy Base Motion',
    duration: {
      fast: 120,
      medium: 180,
      slow: 260
    },
    easing: {
      easeOut: [0.16, 1, 0.3, 1]
    },
    spring: {
      tension: 280,
      friction: 22
    },
    haptics: {
      light: 'light',
      medium: 'medium',
      heavy: 'heavy'
    },
    isPremium: false
  },
  {
    id: 'smooth-premium',
    name: 'Smooth Premium Motion',
    duration: {
      fast: 150,
      medium: 220,
      slow: 300
    },
    easing: {
      easeOut: [0.25, 0.8, 0.25, 1]
    },
    spring: {
      tension: 250,
      friction: 25
    },
    haptics: {
      light: 'light',
      medium: 'medium',
      heavy: 'heavy'
    },
    isPremium: true
  },
  {
    id: 'dramatic-legendary',
    name: 'Dramatic Legendary Motion',
    duration: {
      fast: 200,
      medium: 300,
      slow: 400
    },
    easing: {
      easeOut: [0.1, 0.9, 0.2, 1]
    },
    spring: {
      tension: 300,
      friction: 20
    },
    haptics: {
      light: 'light',
      medium: 'medium',
      heavy: 'heavy'
    },
    isPremium: false
  }
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
    audioId: 'spark-pr',
    motionId: 'snappy-base',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: true,
    isDefault: true,
    isPremium: false,
    isLegendary: false,
  },
  {
    id: 'premium-energy',
    name: 'Premium Energy',
    paletteId: 'neon-glow',
    typographyId: 'personality-bold',
    illustrationId: 'surreal-energy',
    audioId: 'spark-pr',
    motionId: 'smooth-premium',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: false,
    isDefault: false,
    isPremium: true,
    isLegendary: false,
  },
  {
    id: 'premium-growth',
    name: 'Premium Growth',
    paletteId: 'cosmic-strength',
    typographyId: 'personality-irregular',
    illustrationId: 'psychedelic-growth',
    audioId: 'stamp-completion',
    motionId: 'smooth-premium',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: false,
    isDefault: false,
    isPremium: true,
    isLegendary: false,
  },
  {
    id: 'legendary-transform',
    name: 'Legendary Transformation',
    paletteId: 'legendary-mystery',
    typographyId: 'personality-hand-drawn',
    illustrationId: 'legendary-transform',
    audioId: 'legendary-fanfare',
    motionId: 'dramatic-legendary',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: false,
    isDefault: false,
    isPremium: false,
    isLegendary: true,
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
    audio: DEFAULT_AUDIO,
    motion: DEFAULT_MOTION,
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
 * Get audio by ID
 */
export function getAudioById(database: ThemeDatabase, id: string): ThemeAudio | undefined {
  return database.audio.find(audio => audio.id === id);
}

/**
 * Get motion by ID
 */
export function getMotionById(database: ThemeDatabase, id: string): ThemeMotion | undefined {
  return database.motion.find(motion => motion.id === id);
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