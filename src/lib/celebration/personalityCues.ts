// src/lib/celebration/personalityCues.ts
// Integration layer for personality-based cue generation
// Connects the personality system with existing perSetCue infrastructure

import type { Cue , PRType } from '../perSetCueTypes';
import { prTypeToContext, tierToIntensity } from './personalities';
import { getPRCue } from '../stores/personalityStore';
import { deltaToTier } from './selector';

/**
 * Get a PR cue using the current personality
 *
 * This function provides personality-aware PR cues while maintaining
 * backward compatibility with the existing Cue type.
 *
 * @param prType - Type of PR achieved
 * @param deltaLb - Delta in pounds (for tier calculation)
 * @returns Cue with personality-based message, or null if no personality cue available
 */
export function getPersonalityPRCue(prType: PRType, deltaLb: number): Cue | null {
  // Don't show personality cues for 'none' type
  if (prType === 'none') return null;

  // Calculate tier from delta
  const tier = deltaToTier(Math.abs(deltaLb));

  // Get cue from personality system
  const personalityCue = getPRCue(prType, tier);
  if (!personalityCue) return null;

  // Map intensity back to Cue type (epic -> high for backward compatibility)
  const intensity = personalityCue.intensity === 'epic' ? 'high' : personalityCue.intensity;

  return {
    message: personalityCue.message,
    intensity: intensity as 'low' | 'med' | 'high',
  };
}

/**
 * Get a fallback cue using the current personality
 *
 * Returns a random encouragement cue between PR sets.
 *
 * @returns Cue with personality-based message, or null if no personality cue available
 */
export function getPersonalityFallbackCue(): Cue | null {
  const personalityCue = getPRCue('fallback', 1);
  if (!personalityCue) return null;

  return {
    message: personalityCue.message,
    intensity: personalityCue.intensity === 'epic' ? 'high' : (personalityCue.intensity as 'low' | 'med' | 'high'),
  };
}

/**
 * Get a cue for a specific context using the current personality
 *
 * Supports: rest_timer, streak, rank_up, workout_start, workout_end, anomaly
 *
 * @param context - The cue context
 * @returns Cue with personality-based message, or null if no personality cue available
 */
export function getPersonalityContextCue(
  context: 'rest_timer' | 'streak' | 'rank_up' | 'workout_start' | 'workout_end' | 'anomaly'
): Cue | null {
  const { getCue } = require('../stores/personalityStore');
  const personalityCue = getCue(context, 1);
  if (!personalityCue) return null;

  return {
    message: personalityCue.message,
    intensity: personalityCue.intensity === 'epic' ? 'high' : (personalityCue.intensity as 'low' | 'med' | 'high'),
  };
}

/**
 * Get cardio cue using the current personality
 *
 * @returns Cue with personality-based cardio message, or null if unavailable
 */
export function getPersonalityCardioCue(): Cue | null {
  return getPersonalityContextCue('pr_cardio' as any);
}

/**
 * Enhanced version of detectCueForWorkingSet that uses personality system
 *
 * This wraps the existing detectCueForWorkingSet to add personality-based messages.
 * The PR detection logic remains unchanged - only the message text is customized.
 *
 * Usage:
 * ```typescript
 * import { detectCueWithPersonality } from './celebration/personalityCues';
 * import { detectCueForWorkingSet } from './perSetCue';
 *
 * // Instead of:
 * // const result = detectCueForWorkingSet(params);
 *
 * // Use:
 * const result = detectCueWithPersonality(params);
 * ```
 *
 * Note: This requires the personality store to be hydrated. During hydration,
 * it falls back to the default perSetCue behavior.
 */
export function detectCueWithPersonality(args: {
  weightKg: number;
  reps: number;
  unit: 'lb' | 'kg';
  exerciseName: string;
  prev: import('../perSetCueTypes').ExerciseSessionState;
}): import('../perSetCueTypes').DetectCueResult {
  // Import here to avoid circular dependency
  const { detectCueForWorkingSet } = require('../perSetCue');

  // Get original result with PR detection
  const originalResult = detectCueForWorkingSet(args);

  // If no cue or personality system not ready, return original
  if (!originalResult.cue) return originalResult;

  // Try to get personality-based cue
  const personalityCue = getPersonalityPRCue(
    originalResult.meta.type,
    originalResult.meta.type === 'weight'
      ? originalResult.meta.weightDeltaLb
      : originalResult.meta.type === 'rep'
      ? originalResult.meta.repDeltaAtWeight
      : originalResult.meta.e1rmDeltaLb
  );

  // If personality cue available, use it; otherwise keep original
  if (personalityCue) {
    return {
      ...originalResult,
      cue: personalityCue,
    };
  }

  return originalResult;
}

/**
 * Get personality cue with fallback to original message
 *
 * This is a safe wrapper that always returns a Cue, falling back to
 * the original message if personality system fails.
 *
 * @param prType - Type of PR
 * @param deltaLb - Delta in pounds
 * @param fallbackMessage - Fallback message if personality cue unavailable
 * @returns Always returns a Cue
 */
export function getPersonalityCueWithFallback(
  prType: PRType,
  deltaLb: number,
  fallbackMessage: string
): Cue {
  const personalityCue = getPersonalityPRCue(prType, deltaLb);
  return personalityCue || { message: fallbackMessage, intensity: 'med' };
}
