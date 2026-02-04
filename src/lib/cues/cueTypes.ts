// src/lib/cues/cueTypes.ts
// Enhanced cue system types for rich PR celebrations

/**
 * Type of personal record achieved
 */
export type PRType = 'weight' | 'rep' | 'e1rm' | 'cardio' | 'volume' | 'streak' | 'rank_up' | 'none';

/**
 * Animation entry direction
 */
export type AnimationDirection =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'center-zoom'
  | 'center-burst'
  | 'random';

/**
 * Animation style/effect
 */
export type AnimationStyle =
  | 'slide'      // Simple slide in
  | 'bounce'     // Bouncy spring
  | 'explosion'  // Burst from center with particles
  | 'shake'      // Enter then shake for emphasis
  | 'glow'       // Fade in with glow effect
  | 'cinematic'; // Dramatic slow reveal

/**
 * Intensity level for scaling celebration magnitude
 */
export type CueIntensity = 'subtle' | 'normal' | 'hype' | 'legendary';

/**
 * Rich cue data for full celebration system
 */
export interface RichCue {
  // === Core Content ===
  /** Unique ID for this cue instance */
  id: string;

  /** Primary message to display */
  message: string;

  /** Secondary detail line (e.g., "+15 lb", "+3 reps at 185 lb") */
  detail?: string;

  /** Tertiary context (e.g., "New Diamond Rank!") */
  subtext?: string;

  // === PR Context ===
  /** Type of achievement */
  prType: PRType;

  /** Exercise ID for exercise-specific theming */
  exerciseId?: string;

  /** Exercise name for display */
  exerciseName?: string;

  /** Numerical delta for display (e.g., 15 for "+15 lb") */
  delta?: number;

  /** Unit for delta (lb, kg, reps, etc.) */
  deltaUnit?: string;

  // === Presentation ===
  /** Intensity affects size, duration, effects */
  intensity: CueIntensity;

  /** Preferred animation direction (can be overridden by theme) */
  animationDirection?: AnimationDirection;

  /** Preferred animation style (can be overridden by theme) */
  animationStyle?: AnimationStyle;

  /** How long to display in ms (0 = auto based on intensity) */
  durationMs?: number;

  // === Theme/Personality Integration ===
  /**
   * Illustration ID to display (resolved by theme system)
   * e.g., "pr_weight_fire", "pr_rep_explosion", "rank_up_diamond"
   */
  illustrationId?: string;

  /**
   * Audio cue ID to play (resolved by audio theme)
   * e.g., "pr_ding", "pr_explosion", "rank_up_fanfare"
   */
  audioId?: string;

  /**
   * Buddy voice line ID (if buddy voice enabled)
   * e.g., "coach_weight_pr", "hype_big_pr"
   */
  voiceLineId?: string;

  /**
   * Override personality for this cue (uses user's default if not set)
   */
  personalityOverride?: string;

  // === Metadata ===
  /** Timestamp when cue was generated */
  createdAt: number;

  /** Set ID that triggered this cue (for linking) */
  triggeredBySetId?: string;

  /** Session ID for context */
  sessionId?: string;
}

/**
 * Simplified cue for quick feedback (backwards compatible)
 */
export interface QuickCue {
  message: string;
  detail?: string;
  intensity: 'low' | 'high';
  prType?: PRType;
}

/**
 * Cue theme configuration - how cues render for a given theme
 */
export interface CueThemeConfig {
  /** Theme ID this config applies to */
  themeId: string;

  /** Default animation direction for this theme */
  defaultDirection: AnimationDirection;

  /** Default animation style for this theme */
  defaultStyle: AnimationStyle;

  /** Map PR types to illustration IDs */
  illustrations: Partial<Record<PRType, string>>;

  /** Map PR types to audio IDs */
  audioEffects: Partial<Record<PRType, string>>;

  /** Map intensity to duration multipliers */
  durationMultipliers: Record<CueIntensity, number>;

  /** Color overrides for this theme */
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
    glow?: string;
  };
}

/**
 * Cue personality config - how buddies react to cues
 */
export interface CuePersonalityConfig {
  /** Personality ID */
  personalityId: string;

  /** Message pools by PR type and intensity */
  messagePools: Partial<Record<PRType, Partial<Record<CueIntensity, string[]>>>>;

  /** Voice line IDs by PR type */
  voiceLines?: Partial<Record<PRType, string[]>>;

  /** Emoji/reaction preferences */
  reactions?: Partial<Record<PRType, string[]>>;
}

/**
 * Convert a QuickCue to a RichCue with defaults
 */
export function enrichCue(quick: QuickCue, context?: {
  exerciseId?: string;
  exerciseName?: string;
  setId?: string;
  sessionId?: string;
}): RichCue {
  return {
    id: `cue_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    message: quick.message,
    detail: quick.detail,
    prType: quick.prType ?? 'none',
    intensity: quick.intensity === 'high' ? 'hype' : 'normal',
    exerciseId: context?.exerciseId,
    exerciseName: context?.exerciseName,
    triggeredBySetId: context?.setId,
    sessionId: context?.sessionId,
    createdAt: Date.now(),
  };
}

/**
 * Determine intensity from PR metadata
 */
export function computeIntensity(prType: PRType, delta?: number): CueIntensity {
  if (prType === 'none' || prType === 'cardio') return 'subtle';

  // Legendary: huge jumps
  if (prType === 'weight' && delta && delta >= 20) return 'legendary';
  if (prType === 'rep' && delta && delta >= 5) return 'legendary';
  if (prType === 'e1rm' && delta && delta >= 25) return 'legendary';
  if (prType === 'rank_up') return 'legendary';

  // Hype: solid PRs
  if (prType === 'weight' && delta && delta >= 5) return 'hype';
  if (prType === 'rep' && delta && delta >= 2) return 'hype';
  if (prType === 'e1rm' && delta && delta >= 10) return 'hype';

  return 'normal';
}
