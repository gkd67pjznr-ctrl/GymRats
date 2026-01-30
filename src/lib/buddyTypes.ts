/**
 * Types for the AI Gym Buddy System
 */

export type BuddyTier = 'basic' | 'premium' | 'legendary';

export type TriggerType =
  // Performance Events
  | 'pr_weight'
  | 'pr_rep'
  | 'pr_e1rm'
  | 'rank_up'
  | 'volume_milestone'
  // Behavior Patterns
  | 'long_rest'
  | 'skip'
  | 'streak'
  | 'return_after_absence'
  | 'short_workout'
  // Session Flow
  | 'session_start'
  | 'session_mid'
  | 'final_set'
  | 'session_end'
  // Special
  | 'none';

export interface RankProgressInfo {
  exerciseId: string;
  exerciseName: string;
  previousRank: number;
  newRank: number;
  previousScore: number;
  newScore: number;
  rankUp: boolean;
  scoreIncrease: number;
}

export interface CueMessage {
  buddyId: string;
  buddyTier: BuddyTier;
  triggerType: TriggerType;
  intensity: 'low' | 'high' | 'epic';
  text: string;
  voiceLine?: string;       // audio asset ref (premium+ only)
  sfx?: string;             // buddy-specific sound effect ref
  themeOverride?: string;   // legendary buddies only -- theme ID to apply
}

export interface Buddy {
  id: string;
  name: string;
  archetype: string;
  tier: BuddyTier;
  description: string;
  previewLines: string[];                        // sample text lines for preview
  previewVoice?: string;                         // audio asset ref for voice preview
  themeId?: string;                              // legendary only -- theme to apply
  unlockMethod: 'free' | 'forge_tokens' | 'iap';
  unlockCost?: number;                           // forge token cost (basic tier)
  iapProductId?: string;                         // IAP product ID (premium/legendary)
  messages: Record<TriggerType, string[]>;       // triggerType -> message pool
  voiceLines?: Record<TriggerType, string[]>;    // triggerType -> voice asset refs
  sfxPack?: Record<TriggerType, string>;         // event -> sfx asset ref
}