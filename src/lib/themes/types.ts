/**
 * Theme Pack Type System
 *
 * Theme packs bundle visual themes with buddy personalities for sale as IAP.
 * Each pack transforms the complete visual/audio experience.
 */

import type { BuddyTier } from '../buddyTypes';

// ============================================
// CORE TYPES
// ============================================

export type ThemePackTier = 'free' | 'premium' | 'legendary';

/**
 * Complete theme pack definition
 * Bundles visual theme + buddy + audio + motion + particles
 */
export interface ThemePack {
  id: string;
  name: string;
  description: string;
  tier: ThemePackTier;

  // Metadata
  previewImageUrl?: string;
  tags: string[];
  releaseDate?: string;
  isLimitedEdition?: boolean;
  expiresAt?: string; // For seasonal packs

  // IAP
  iapProductId?: string; // RevenueCat product ID
  priceUsd?: number; // For display before IAP loads

  // Components
  colors: ThemePackColors;
  typography?: ThemePackTypography;
  motion?: ThemePackMotion;
  audio?: ThemePackAudio;
  particles?: ThemePackParticles;
  celebrations?: ThemePackCelebrations;

  // Buddy integration (optional - some packs are visual-only)
  buddyId?: string; // Links to a specific buddy personality
  buddyOverrides?: BuddyOverrides; // Pack-specific buddy customizations
}

// ============================================
// COLOR SYSTEM
// ============================================

export interface ThemePackColors {
  // Core UI
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;

  // Semantic
  success: string;
  danger: string;
  warning: string;
  info: string;

  // Brand/Accent
  primary: string;
  primarySoft: string;
  secondary: string;
  accent: string;
  accentGlow?: string; // For glow effects

  // Rank colors (can override defaults)
  ranks?: {
    iron?: string;
    bronze?: string;
    silver?: string;
    gold?: string;
    platinum?: string;
    diamond?: string;
    mythic?: string;
  };

  // Gradients
  gradients?: {
    hero?: string[]; // [start, end] or [start, mid, end]
    card?: string[];
    celebration?: string[];
  };
}

// ============================================
// TYPOGRAPHY SYSTEM
// ============================================

export interface ThemePackTypography {
  // Font family (must be loaded in app)
  fontFamily?: string;

  // Weight overrides
  weights?: {
    hero?: '700' | '800' | '900';
    heading?: '700' | '800' | '900';
    body?: '600' | '700';
    caption?: '600' | '700';
  };

  // Size scale multiplier (1.0 = default)
  sizeScale?: number;

  // Letter spacing adjustments
  letterSpacing?: {
    hero?: number;
    heading?: number;
    body?: number;
  };

  // Special treatments
  treatment?: 'none' | 'uppercase-headings' | 'all-caps' | 'italic-accent';
}

// ============================================
// MOTION SYSTEM
// ============================================

export interface ThemePackMotion {
  // Duration multiplier (1.0 = default, 0.5 = faster, 2.0 = slower)
  durationScale?: number;

  // Easing presets
  easing?: {
    enter?: 'ease-out' | 'ease-out-back' | 'spring' | 'bounce';
    exit?: 'ease-in' | 'ease-in-back' | 'fade';
    emphasis?: 'spring' | 'bounce' | 'elastic';
  };

  // Specific animation overrides
  toastAnimation?: {
    enter?: 'slide-up' | 'slide-down' | 'fade' | 'scale' | 'glitch';
    exit?: 'slide-up' | 'slide-down' | 'fade' | 'scale';
    holdDurationMs?: number;
  };

  // Enable/disable motion features
  enableParticles?: boolean;
  enableGlow?: boolean;
  enableShake?: boolean;
}

// ============================================
// AUDIO SYSTEM
// ============================================

export interface ThemePackAudio {
  // Sound effect overrides (asset paths or URLs)
  sfx?: {
    setLogged?: string;
    prWeight?: string;
    prRep?: string;
    prE1rm?: string;
    rankUp?: string;
    levelUp?: string;
    workoutComplete?: string;
    celebration?: string;
    error?: string;
    tap?: string;
  };

  // Volume levels (0-1)
  volumes?: {
    sfx?: number;
    voice?: number;
    ambient?: number;
  };

  // Ambient/background audio (legendary packs)
  ambientTrack?: string;
}

// ============================================
// PARTICLE SYSTEM
// ============================================

export type ParticleShape = 'confetti' | 'star' | 'circle' | 'spark' | 'ember' | 'snow' | 'custom';

export interface ThemePackParticles {
  // Default particle config
  shape?: ParticleShape;
  colors?: string[];
  count?: number;
  speed?: number;
  gravity?: number;
  spread?: number;

  // Event-specific overrides
  events?: {
    pr?: ParticleConfig;
    rankUp?: ParticleConfig;
    levelUp?: ParticleConfig;
    workoutComplete?: ParticleConfig;
  };
}

export interface ParticleConfig {
  shape?: ParticleShape;
  colors?: string[];
  count?: number;
  duration?: number;
  customAsset?: string; // For custom particle shapes
}

// ============================================
// CELEBRATION SYSTEM
// ============================================

export interface ThemePackCelebrations {
  // PR celebration style
  prCelebration?: {
    style: 'confetti' | 'fireworks' | 'glow-burst' | 'particle-shower' | 'custom';
    intensity: 'subtle' | 'normal' | 'epic';
    customAnimation?: string; // Lottie or custom asset
  };

  // Rank up celebration
  rankUpCelebration?: {
    style: 'badge-reveal' | 'tier-glow' | 'particle-burst' | 'custom';
    showBadge?: boolean;
    customAnimation?: string;
  };

  // Workout complete celebration
  workoutCompleteCelebration?: {
    style: 'summary-card' | 'achievement-wall' | 'stat-explosion' | 'custom';
    showStats?: boolean;
    customAnimation?: string;
  };
}

// ============================================
// BUDDY OVERRIDES
// ============================================

export interface BuddyOverrides {
  // Override buddy name for this pack
  displayName?: string;

  // Override avatar/icon
  avatarUrl?: string;

  // Message style overrides
  messageStyle?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    accentColor?: string;
    showBadge?: boolean;
    badgeIcon?: string;
  };

  // Voice line overrides (pack-specific recordings)
  voiceLineOverrides?: Partial<Record<string, string[]>>;
}

// ============================================
// STORE TYPES
// ============================================

export interface ThemePackState {
  // Available packs (fetched from config/Supabase)
  availablePacks: ThemePack[];

  // Purchased pack IDs
  purchasedPackIds: string[];

  // Currently equipped pack ID
  equippedPackId: string | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Last sync
  lastSyncAt: number | null;
}

export interface ThemePackActions {
  // Fetch available packs
  fetchPacks: () => Promise<void>;

  // Equip a pack (must be purchased or free)
  equipPack: (packId: string) => boolean;

  // Purchase a pack via IAP
  purchasePack: (packId: string) => Promise<boolean>;

  // Restore purchases
  restorePurchases: () => Promise<void>;

  // Get the currently equipped pack
  getEquippedPack: () => ThemePack | null;

  // Check if a pack is owned
  isPackOwned: (packId: string) => boolean;

  // Reset to default theme
  resetToDefault: () => void;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Resolved theme values - what components actually use
 * Combines pack values with defaults
 */
export interface ResolvedTheme {
  colors: Required<ThemePackColors>;
  typography: Required<ThemePackTypography>;
  motion: Required<ThemePackMotion>;
  audio: Required<ThemePackAudio>;
  particles: Required<ThemePackParticles>;
  celebrations: Required<ThemePackCelebrations>;
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  pack: ThemePack | null;
  resolved: ResolvedTheme;
  equipPack: (packId: string) => void;
  isLoading: boolean;
}
