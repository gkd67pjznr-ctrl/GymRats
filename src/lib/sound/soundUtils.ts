// src/lib/sound/soundUtils.ts
// Utilities for checking audio cue preferences before playing sounds

import { getSettings } from '../stores/settingsStore';
import { playSound as playSoundInternal, SoundKey } from './SoundManager';

/**
 * Check if global sounds are enabled
 */
export function areSoundsEnabled(): boolean {
  return getSettings().soundsEnabled;
}

/**
 * Check if a specific audio cue is enabled
 * Returns false if global sounds are disabled
 */
export function isAudioCueEnabled(cueType: keyof AudioCuePreferences): boolean {
  const settings = getSettings();
  return settings.soundsEnabled && settings.audioCues[cueType];
}

/**
 * Check if rest timer feedback audio is enabled
 * Returns false if global sounds are disabled
 */
export function isRestTimerAudioEnabled(): boolean {
  const settings = getSettings();
  return settings.soundsEnabled && settings.restTimerFeedback.audio;
}

/**
 * Check if rest timer haptic feedback is enabled
 * Returns false if global haptics are disabled
 */
export function isRestTimerHapticEnabled(): boolean {
  const settings = getSettings();
  return settings.hapticsEnabled && settings.restTimerFeedback.haptic;
}

/**
 * Check if global haptics are enabled
 */
export function areHapticsEnabled(): boolean {
  return getSettings().hapticsEnabled;
}

/**
 * Play sound if global sounds are enabled
 */
export async function playSoundIfEnabled(
  key: SoundKey,
  volume?: number
): Promise<void> {
  if (!areSoundsEnabled()) return;
  await playSoundInternal(key, volume);
}

/**
 * Play sound for a specific audio cue type
 * Returns false if the cue was not played (disabled)
 */
export async function playSoundForCue(
  cueType: keyof AudioCuePreferences,
  soundKey: SoundKey,
  volume?: number
): Promise<boolean> {
  if (!isAudioCueEnabled(cueType)) return false;
  await playSoundInternal(soundKey, volume);
  return true;
}

// Re-export AudioCuePreferences type from settings store
import type { AudioCuePreferences } from '../stores/settingsStore';