// src/lib/sound/SoundManager.ts
// Audio playback manager for celebration sounds
//
// Uses expo-av for sound playback
// Sounds are preloaded and cached for performance

import { Audio } from 'expo-av';
import { Platform } from 'react-native';

/**
 * Sound effect keys matching designSystem.sounds
 */
export type SoundKey = 'spark' | 'stamp' | 'thud' | 'cheer' | 'triumph' | 'powerup';

/**
 * Sound file mapping
 *
 * In v1: Uses placeholder sound URLs or bundled assets
 * Future: Can swap in custom sound packs
 */
const SOUND_FILES: Record<SoundKey, string> = {
  // Using free sound effects from a CDN
  // In production, these would be bundled assets
  spark: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Sparkle
  stamp: 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3', // Stamp
  thud: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',   // Thud
  cheer: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Cheer
  triumph: 'https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3', // Triumph
  powerup: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3', // Powerup
};

/**
 * Sound playback status
 */
type SoundStatus = 'idle' | 'loading' | 'playing' | 'error';

/**
 * Cached sound object
 */
interface CachedSound {
  sound: Audio.Sound;
  status: SoundStatus;
  durationMs: number;
}

/**
 * Sound Manager Singleton
 *
 * Manages audio playback for celebration sounds.
 * Preloads sounds and caches them for performance.
 */
class SoundManagerClass {
  private cache: Map<SoundKey, CachedSound> = new Map();
  private enabled: boolean = true;
  private initialized: boolean = false;

  /**
   * Initialize the sound manager
   *
   * Sets up audio mode and preloads sounds.
   * Should be called during app startup.
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
      if (__DEV__) {
        console.warn('[SoundManager] Failed to initialize:', error);
      }
    }
  }

  /**
   * Enable or disable sound playback
   *
   * When disabled, play() calls are ignored.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if sound is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Preload a sound
   *
   * Loads the sound into memory for instant playback.
   * Called automatically by play(), but can be called ahead of time.
   */
  async preload(key: SoundKey): Promise<void> {
    if (this.cache.has(key)) return;

    try {
      const filename = SOUND_FILES[key];
      const { sound } = await Audio.Sound.createAsync(
        { uri: filename },
        { shouldPlay: false }
      );

      const status = await sound.getStatusAsync();
      const durationMs = (status.durationMillis ?? 500);

      this.cache.set(key, {
        sound,
        status: 'idle',
        durationMs,
      });

      // Handle unload on finish
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          const cached = this.cache.get(key);
          if (cached) {
            cached.status = 'idle';
          }
        }
      });
    } catch (error) {
      if (__DEV__) {
        console.warn(`[SoundManager] Failed to preload sound "${key}":`, error);
      }
    }
  }

  /**
   * Play a sound
   *
   * Plays the specified sound effect.
   * If not preloaded, will load first then play.
   *
   * @param key - Sound key to play
   * @param volume - Volume multiplier (0-1, default 1)
   */
  async play(key: SoundKey, volume: number = 1): Promise<void> {
    if (!this.enabled) return;

    try {
      // Ensure sound is loaded
      if (!this.cache.has(key)) {
        await this.preload(key);
      }

      const cached = this.cache.get(key);
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
      if (__DEV__) {
        console.warn(`[SoundManager] Failed to play sound "${key}":`, error);
      }
    }
  }

  /**
   * Stop all playing sounds
   */
  async stopAll(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [key, cached] of this.cache.entries()) {
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
   * Unload a sound from cache
   */
  async unload(key: SoundKey): Promise<void> {
    const cached = this.cache.get(key);
    if (!cached) return;

    try {
      await cached.sound.unloadAsync();
      this.cache.delete(key);
    } catch (error) {
      if (__DEV__) {
        console.warn(`[SoundManager] Failed to unload sound "${key}":`, error);
      }
    }
  }

  /**
   * Unload all sounds
   *
   * Call this when the app is shutting down or going to background.
   */
  async unloadAll(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const key of this.cache.keys()) {
      promises.push(this.unload(key));
    }

    await Promise.allSettled(promises);
    this.cache.clear();
  }

  /**
   * Get sound duration in milliseconds
   */
  getDuration(key: SoundKey): number {
    const cached = this.cache.get(key);
    return cached?.durationMs ?? 500;
  }
}

/**
 * Singleton instance
 */
export const SoundManager = new SoundManagerClass();

/**
 * Initialize sound manager
 *
 * Call this during app startup.
 */
export async function initializeSoundManager(): Promise<void> {
  await SoundManager.initialize();
}

/**
 * Play sound by key
 *
 * Convenience function that calls SoundManager.play()
 */
export async function playSound(
  key: SoundKey,
  volume: number = 1
): Promise<void> {
  await SoundManager.play(key, volume);
}
