// src/lib/voice/VoiceManager.ts
// Audio playback manager for buddy voice lines
//
// Uses expo-av for sound playback
// Maps voiceLine IDs to audio assets (URLs or local files)

import { Audio } from 'expo-av';
import { getSettings } from '../stores/settingsStore';
import { useBuddyStore } from '../stores/buddyStore';

/**
 * Voice line asset mapping
 *
 * Maps voiceLine IDs (e.g., 'trash-heavy-1') to audio URLs.
 * In production, these would be AI-generated voice audio files
 * hosted on a CDN or bundled as local assets.
 *
 * For now, we use placeholder sounds from Mixkit.
 */
const VOICE_LINE_ASSETS: Record<string, string> = {
  // Placeholder mappings - in real app, these would be actual voice files
  'trash-heavy-1': 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  'trash-heavy-2': 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  'trash-rep-1': 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  'trash-rep-2': 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  'trash-start-1': 'https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3',
  'trash-start-2': 'https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3',
  'trash-end-1': 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3',
  'trash-end-2': 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3',
  // Savage buddy voice lines
  'savage-heavy-1': 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  'savage-heavy-2': 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  'savage-rep-1': 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  'savage-rep-2': 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  'savage-start-1': 'https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3',
  'savage-start-2': 'https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3',
  'savage-end-1': 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3',
  'savage-end-2': 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3',
  // Anime buddy voice lines
  'anime-power-1': 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  'anime-power-2': 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  'anime-start-1': 'https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3',
  'anime-start-2': 'https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3',
  'anime-end-1': 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3',
  'anime-end-2': 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3',
  // Add more mappings as needed
};

/**
 * Voice playback status
 */
type VoiceStatus = 'idle' | 'loading' | 'playing' | 'error';

/**
 * Cached voice object
 */
interface CachedVoice {
  sound: Audio.Sound;
  status: VoiceStatus;
  durationMs: number;
}

/**
 * Voice Manager Singleton
 *
 * Manages audio playback for buddy voice lines.
 * Preloads sounds and caches them for performance.
 */
class VoiceManagerClass {
  private cache: Map<string, CachedVoice> = new Map();
  private enabled: boolean = true;
  private initialized: boolean = false;

  /**
   * Initialize the voice manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Set up audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      this.initialized = true;
    } catch (error) {
      console.warn('[VoiceManager] Failed to initialize:', error);
    }
  }

  /**
   * Enable or disable voice playback
   *
   * Checks global sounds setting and user's buddy tier.
   * Voice lines are only played for premium+ tiers when sounds are enabled.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if voice playback should be enabled
   *
   * Returns true if:
   * 1. Global sounds are enabled in settings
   * 2. Buddy voice is enabled in settings
   * 3. User's buddy tier is 'premium' or 'legendary'
   * 4. Voice manager is explicitly enabled
   */
  shouldPlayVoice(): boolean {
    if (!this.enabled) return false;

    const settings = getSettings();
    if (!settings.soundsEnabled) return false;
    if (!settings.buddyVoiceEnabled) return false;

    const userTier = useBuddyStore.getState().tier;
    // Voice lines are only for premium+ tiers
    return userTier === 'premium' || userTier === 'legendary';
  }

  /**
   * Preload a voice line
   */
  async preload(voiceLineId: string): Promise<void> {
    if (this.cache.has(voiceLineId)) return;

    const audioUrl = VOICE_LINE_ASSETS[voiceLineId];
    if (!audioUrl) {
      console.warn(`[VoiceManager] No audio asset mapped for voice line ID: ${voiceLineId}`);
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false }
      );

      const status = await sound.getStatusAsync();
      const durationMs = ((status as any).durationMillis ?? 500);

      this.cache.set(voiceLineId, {
        sound,
        status: 'idle',
        durationMs,
      });

      // Handle unload on finish
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          const cached = this.cache.get(voiceLineId);
          if (cached) {
            cached.status = 'idle';
          }
        }
      });
    } catch (error) {
      console.warn(`[VoiceManager] Failed to preload voice line "${voiceLineId}":`, error);
    }
  }

  /**
   * Play a voice line
   *
   * Plays the specified voice line.
   * If not preloaded, will load first then play.
   *
   * @param voiceLineId - Voice line ID to play
   * @param volume - Volume multiplier (0-1, default 0.8)
   */
  async play(voiceLineId: string, volume: number = 0.8): Promise<void> {
    if (!this.shouldPlayVoice()) return;

    try {
      // Ensure voice line is loaded
      if (!this.cache.has(voiceLineId)) {
        await this.preload(voiceLineId);
      }

      const cached = this.cache.get(voiceLineId);
      if (!cached) return;

      // Replay from beginning if already playing
      if (cached.status === 'playing') {
        await cached.sound.stopAsync();
      }

      await cached.sound.setPositionAsync(0);
      await cached.sound.setVolumeAsync(volume);
      await cached.sound.playAsync();

      cached.status = 'playing';
    } catch (error) {
      console.warn(`[VoiceManager] Failed to play voice line "${voiceLineId}":`, error);
    }
  }

  /**
   * Stop all playing voice lines
   */
  async stopAll(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [voiceLineId, cached] of this.cache.entries()) {
      if (cached.status === 'playing') {
        promises.push(
          cached.sound.stopAsync().then(() => {
            cached.status = 'idle';
          })
        );
      }
    }

    await Promise.allSettled(promises);
  }

  /**
   * Unload a voice line from cache
   */
  async unload(voiceLineId: string): Promise<void> {
    const cached = this.cache.get(voiceLineId);
    if (!cached) return;

    try {
      await cached.sound.unloadAsync();
      this.cache.delete(voiceLineId);
    } catch (error) {
      console.warn(`[VoiceManager] Failed to unload voice line "${voiceLineId}":`, error);
    }
  }

  /**
   * Unload all voice lines
   */
  async unloadAll(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const voiceLineId of this.cache.keys()) {
      promises.push(this.unload(voiceLineId));
    }

    await Promise.allSettled(promises);
    this.cache.clear();
  }

  /**
   * Get voice line duration in milliseconds
   */
  getDuration(voiceLineId: string): number {
    const cached = this.cache.get(voiceLineId);
    return cached?.durationMs ?? 500;
  }
}

/**
 * Singleton instance
 */
export const VoiceManager = new VoiceManagerClass();

/**
 * Initialize voice manager
 *
 * Call this during app startup.
 */
export async function initializeVoiceManager(): Promise<void> {
  await VoiceManager.initialize();
}

/**
 * Play voice line by ID
 *
 * Convenience function that checks if voice should be played
 * and calls VoiceManager.play()
 */
export async function playVoiceLine(
  voiceLineId: string,
  volume: number = 0.8
): Promise<void> {
  await VoiceManager.play(voiceLineId, volume);
}

/**
 * Stop all voice lines
 */
export async function stopAllVoiceLines(): Promise<void> {
  await VoiceManager.stopAll();
}

/**
 * Preload voice lines for a buddy
 *
 * Preloads all voice lines for a given buddy to reduce latency.
 */
export async function preloadBuddyVoiceLines(buddyId: string): Promise<void> {
  // In a real implementation, we would look up the buddy's voice lines
  // from buddyData and preload them all
  console.log(`[VoiceManager] Preloading voice lines for buddy ${buddyId} would be implemented here`);
}