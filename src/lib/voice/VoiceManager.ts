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
/**
 * Placeholder audio URLs by trigger type
 * In production, these would be distinct AI-generated voice files
 */
const PLACEHOLDER_AUDIO = {
  pr: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',       // Heavy/impactful sound
  rep: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',      // Rep achievement
  e1rm: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',     // Max strength
  rank: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',     // Level up
  volume: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',   // Volume milestone
  start: 'https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3',    // Session start
  mid: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',      // Mid-session
  final: 'https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3',    // Final set
  end: 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3',      // Session end
  streak: 'https://assets.mixkit.co/active_storage/sfx/2016/2016-preview.mp3',   // Streak
  return: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3',   // Return/welcome back
  rest: 'https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3',     // Long rest
};

const VOICE_LINE_ASSETS: Record<string, string> = {
  // =================================================================
  // TRASH TALKER (Legendary) - Roasts with love
  // =================================================================
  'trash-heavy-1': PLACEHOLDER_AUDIO.pr,
  'trash-heavy-2': PLACEHOLDER_AUDIO.pr,
  'trash-rep-1': PLACEHOLDER_AUDIO.rep,
  'trash-rep-2': PLACEHOLDER_AUDIO.rep,
  'trash-e1rm-1': PLACEHOLDER_AUDIO.e1rm,
  'trash-e1rm-2': PLACEHOLDER_AUDIO.e1rm,
  'trash-rank-1': PLACEHOLDER_AUDIO.rank,
  'trash-rank-2': PLACEHOLDER_AUDIO.rank,
  'trash-volume-1': PLACEHOLDER_AUDIO.volume,
  'trash-volume-2': PLACEHOLDER_AUDIO.volume,
  'trash-start-1': PLACEHOLDER_AUDIO.start,
  'trash-start-2': PLACEHOLDER_AUDIO.start,
  'trash-mid-1': PLACEHOLDER_AUDIO.mid,
  'trash-mid-2': PLACEHOLDER_AUDIO.mid,
  'trash-final-1': PLACEHOLDER_AUDIO.final,
  'trash-final-2': PLACEHOLDER_AUDIO.final,
  'trash-end-1': PLACEHOLDER_AUDIO.end,
  'trash-end-2': PLACEHOLDER_AUDIO.end,
  'trash-streak-1': PLACEHOLDER_AUDIO.streak,
  'trash-streak-2': PLACEHOLDER_AUDIO.streak,
  'trash-return-1': PLACEHOLDER_AUDIO.return,
  'trash-return-2': PLACEHOLDER_AUDIO.return,
  'trash-rest-1': PLACEHOLDER_AUDIO.rest,
  'trash-rest-2': PLACEHOLDER_AUDIO.rest,

  // =================================================================
  // SAVAGE (Premium) - Brutally honest, dark humor
  // =================================================================
  'savage-heavy-1': PLACEHOLDER_AUDIO.pr,
  'savage-heavy-2': PLACEHOLDER_AUDIO.pr,
  'savage-rep-1': PLACEHOLDER_AUDIO.rep,
  'savage-rep-2': PLACEHOLDER_AUDIO.rep,
  'savage-e1rm-1': PLACEHOLDER_AUDIO.e1rm,
  'savage-e1rm-2': PLACEHOLDER_AUDIO.e1rm,
  'savage-rank-1': PLACEHOLDER_AUDIO.rank,
  'savage-rank-2': PLACEHOLDER_AUDIO.rank,
  'savage-volume-1': PLACEHOLDER_AUDIO.volume,
  'savage-volume-2': PLACEHOLDER_AUDIO.volume,
  'savage-start-1': PLACEHOLDER_AUDIO.start,
  'savage-start-2': PLACEHOLDER_AUDIO.start,
  'savage-mid-1': PLACEHOLDER_AUDIO.mid,
  'savage-mid-2': PLACEHOLDER_AUDIO.mid,
  'savage-final-1': PLACEHOLDER_AUDIO.final,
  'savage-final-2': PLACEHOLDER_AUDIO.final,
  'savage-end-1': PLACEHOLDER_AUDIO.end,
  'savage-end-2': PLACEHOLDER_AUDIO.end,
  'savage-streak-1': PLACEHOLDER_AUDIO.streak,
  'savage-streak-2': PLACEHOLDER_AUDIO.streak,
  'savage-return-1': PLACEHOLDER_AUDIO.return,
  'savage-return-2': PLACEHOLDER_AUDIO.return,

  // =================================================================
  // ANIME SENSEI (Premium) - Dramatic power-up energy
  // =================================================================
  'anime-power-1': PLACEHOLDER_AUDIO.pr,
  'anime-power-2': PLACEHOLDER_AUDIO.pr,
  'anime-rep-1': PLACEHOLDER_AUDIO.rep,
  'anime-rep-2': PLACEHOLDER_AUDIO.rep,
  'anime-e1rm-1': PLACEHOLDER_AUDIO.e1rm,
  'anime-e1rm-2': PLACEHOLDER_AUDIO.e1rm,
  'anime-rank-1': PLACEHOLDER_AUDIO.rank,
  'anime-rank-2': PLACEHOLDER_AUDIO.rank,
  'anime-volume-1': PLACEHOLDER_AUDIO.volume,
  'anime-volume-2': PLACEHOLDER_AUDIO.volume,
  'anime-start-1': PLACEHOLDER_AUDIO.start,
  'anime-start-2': PLACEHOLDER_AUDIO.start,
  'anime-mid-1': PLACEHOLDER_AUDIO.mid,
  'anime-mid-2': PLACEHOLDER_AUDIO.mid,
  'anime-final-1': PLACEHOLDER_AUDIO.final,
  'anime-final-2': PLACEHOLDER_AUDIO.final,
  'anime-end-1': PLACEHOLDER_AUDIO.end,
  'anime-end-2': PLACEHOLDER_AUDIO.end,
  'anime-streak-1': PLACEHOLDER_AUDIO.streak,
  'anime-streak-2': PLACEHOLDER_AUDIO.streak,
  'anime-return-1': PLACEHOLDER_AUDIO.return,
  'anime-return-2': PLACEHOLDER_AUDIO.return,

  // =================================================================
  // ACTION HERO (Premium) - One-liners, machismo
  // =================================================================
  'action-heavy-1': PLACEHOLDER_AUDIO.pr,
  'action-heavy-2': PLACEHOLDER_AUDIO.pr,
  'action-rep-1': PLACEHOLDER_AUDIO.rep,
  'action-rep-2': PLACEHOLDER_AUDIO.rep,
  'action-e1rm-1': PLACEHOLDER_AUDIO.e1rm,
  'action-e1rm-2': PLACEHOLDER_AUDIO.e1rm,
  'action-rank-1': PLACEHOLDER_AUDIO.rank,
  'action-rank-2': PLACEHOLDER_AUDIO.rank,
  'action-volume-1': PLACEHOLDER_AUDIO.volume,
  'action-volume-2': PLACEHOLDER_AUDIO.volume,
  'action-start-1': PLACEHOLDER_AUDIO.start,
  'action-start-2': PLACEHOLDER_AUDIO.start,
  'action-mid-1': PLACEHOLDER_AUDIO.mid,
  'action-mid-2': PLACEHOLDER_AUDIO.mid,
  'action-final-1': PLACEHOLDER_AUDIO.final,
  'action-final-2': PLACEHOLDER_AUDIO.final,
  'action-end-1': PLACEHOLDER_AUDIO.end,
  'action-end-2': PLACEHOLDER_AUDIO.end,
  'action-streak-1': PLACEHOLDER_AUDIO.streak,
  'action-streak-2': PLACEHOLDER_AUDIO.streak,
  'action-return-1': PLACEHOLDER_AUDIO.return,
  'action-return-2': PLACEHOLDER_AUDIO.return,

  // =================================================================
  // DRILL SERGEANT (Premium) - Barking orders, no-nonsense
  // =================================================================
  'sergeant-heavy-1': PLACEHOLDER_AUDIO.pr,
  'sergeant-heavy-2': PLACEHOLDER_AUDIO.pr,
  'sergeant-rep-1': PLACEHOLDER_AUDIO.rep,
  'sergeant-rep-2': PLACEHOLDER_AUDIO.rep,
  'sergeant-e1rm-1': PLACEHOLDER_AUDIO.e1rm,
  'sergeant-e1rm-2': PLACEHOLDER_AUDIO.e1rm,
  'sergeant-rank-1': PLACEHOLDER_AUDIO.rank,
  'sergeant-rank-2': PLACEHOLDER_AUDIO.rank,
  'sergeant-volume-1': PLACEHOLDER_AUDIO.volume,
  'sergeant-volume-2': PLACEHOLDER_AUDIO.volume,
  'sergeant-start-1': PLACEHOLDER_AUDIO.start,
  'sergeant-start-2': PLACEHOLDER_AUDIO.start,
  'sergeant-mid-1': PLACEHOLDER_AUDIO.mid,
  'sergeant-mid-2': PLACEHOLDER_AUDIO.mid,
  'sergeant-final-1': PLACEHOLDER_AUDIO.final,
  'sergeant-final-2': PLACEHOLDER_AUDIO.final,
  'sergeant-end-1': PLACEHOLDER_AUDIO.end,
  'sergeant-end-2': PLACEHOLDER_AUDIO.end,
  'sergeant-streak-1': PLACEHOLDER_AUDIO.streak,
  'sergeant-streak-2': PLACEHOLDER_AUDIO.streak,
  'sergeant-return-1': PLACEHOLDER_AUDIO.return,
  'sergeant-return-2': PLACEHOLDER_AUDIO.return,

  // =================================================================
  // ZEN MASTER (Premium) - Calm, philosophical
  // =================================================================
  'zen-heavy-1': PLACEHOLDER_AUDIO.pr,
  'zen-heavy-2': PLACEHOLDER_AUDIO.pr,
  'zen-rep-1': PLACEHOLDER_AUDIO.rep,
  'zen-rep-2': PLACEHOLDER_AUDIO.rep,
  'zen-e1rm-1': PLACEHOLDER_AUDIO.e1rm,
  'zen-e1rm-2': PLACEHOLDER_AUDIO.e1rm,
  'zen-rank-1': PLACEHOLDER_AUDIO.rank,
  'zen-rank-2': PLACEHOLDER_AUDIO.rank,
  'zen-volume-1': PLACEHOLDER_AUDIO.volume,
  'zen-volume-2': PLACEHOLDER_AUDIO.volume,
  'zen-start-1': PLACEHOLDER_AUDIO.start,
  'zen-start-2': PLACEHOLDER_AUDIO.start,
  'zen-mid-1': PLACEHOLDER_AUDIO.mid,
  'zen-mid-2': PLACEHOLDER_AUDIO.mid,
  'zen-final-1': PLACEHOLDER_AUDIO.final,
  'zen-final-2': PLACEHOLDER_AUDIO.final,
  'zen-end-1': PLACEHOLDER_AUDIO.end,
  'zen-end-2': PLACEHOLDER_AUDIO.end,
  'zen-streak-1': PLACEHOLDER_AUDIO.streak,
  'zen-streak-2': PLACEHOLDER_AUDIO.streak,
  'zen-return-1': PLACEHOLDER_AUDIO.return,
  'zen-return-2': PLACEHOLDER_AUDIO.return,

  // =================================================================
  // GOTH GYM RAT (Premium) - Dark, brain-rot aesthetic
  // =================================================================
  'goth-heavy-1': PLACEHOLDER_AUDIO.pr,
  'goth-heavy-2': PLACEHOLDER_AUDIO.pr,
  'goth-rep-1': PLACEHOLDER_AUDIO.rep,
  'goth-rep-2': PLACEHOLDER_AUDIO.rep,
  'goth-e1rm-1': PLACEHOLDER_AUDIO.e1rm,
  'goth-e1rm-2': PLACEHOLDER_AUDIO.e1rm,
  'goth-rank-1': PLACEHOLDER_AUDIO.rank,
  'goth-rank-2': PLACEHOLDER_AUDIO.rank,
  'goth-volume-1': PLACEHOLDER_AUDIO.volume,
  'goth-volume-2': PLACEHOLDER_AUDIO.volume,
  'goth-start-1': PLACEHOLDER_AUDIO.start,
  'goth-start-2': PLACEHOLDER_AUDIO.start,
  'goth-mid-1': PLACEHOLDER_AUDIO.mid,
  'goth-mid-2': PLACEHOLDER_AUDIO.mid,
  'goth-final-1': PLACEHOLDER_AUDIO.final,
  'goth-final-2': PLACEHOLDER_AUDIO.final,
  'goth-end-1': PLACEHOLDER_AUDIO.end,
  'goth-end-2': PLACEHOLDER_AUDIO.end,
  'goth-streak-1': PLACEHOLDER_AUDIO.streak,
  'goth-streak-2': PLACEHOLDER_AUDIO.streak,
  'goth-return-1': PLACEHOLDER_AUDIO.return,
  'goth-return-2': PLACEHOLDER_AUDIO.return,

  // =================================================================
  // LEGENDARY MYSTERY (Legendary) - Theme-warping presence
  // =================================================================
  'mystery-heavy-1': PLACEHOLDER_AUDIO.pr,
  'mystery-heavy-2': PLACEHOLDER_AUDIO.pr,
  'mystery-rep-1': PLACEHOLDER_AUDIO.rep,
  'mystery-rep-2': PLACEHOLDER_AUDIO.rep,
  'mystery-e1rm-1': PLACEHOLDER_AUDIO.e1rm,
  'mystery-e1rm-2': PLACEHOLDER_AUDIO.e1rm,
  'mystery-rank-1': PLACEHOLDER_AUDIO.rank,
  'mystery-rank-2': PLACEHOLDER_AUDIO.rank,
  'mystery-volume-1': PLACEHOLDER_AUDIO.volume,
  'mystery-volume-2': PLACEHOLDER_AUDIO.volume,
  'mystery-start-1': PLACEHOLDER_AUDIO.start,
  'mystery-start-2': PLACEHOLDER_AUDIO.start,
  'mystery-mid-1': PLACEHOLDER_AUDIO.mid,
  'mystery-mid-2': PLACEHOLDER_AUDIO.mid,
  'mystery-final-1': PLACEHOLDER_AUDIO.final,
  'mystery-final-2': PLACEHOLDER_AUDIO.final,
  'mystery-end-1': PLACEHOLDER_AUDIO.end,
  'mystery-end-2': PLACEHOLDER_AUDIO.end,
  'mystery-streak-1': PLACEHOLDER_AUDIO.streak,
  'mystery-streak-2': PLACEHOLDER_AUDIO.streak,
  'mystery-return-1': PLACEHOLDER_AUDIO.return,
  'mystery-return-2': PLACEHOLDER_AUDIO.return,
  'mystery-rest-1': PLACEHOLDER_AUDIO.rest,
  'mystery-rest-2': PLACEHOLDER_AUDIO.rest,
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
  // Import buddies dynamically to avoid circular dependencies
  const { buddies } = await import('../buddyData');

  const buddy = buddies.find(b => b.id === buddyId);
  if (!buddy || !buddy.voiceLines) {
    console.log(`[VoiceManager] No voice lines found for buddy ${buddyId}`);
    return;
  }

  // Collect all voice line IDs from the buddy
  const voiceLineIds: string[] = [];
  for (const triggerVoiceLines of Object.values(buddy.voiceLines)) {
    if (triggerVoiceLines) {
      voiceLineIds.push(...triggerVoiceLines);
    }
  }

  // Preload all voice lines in parallel
  console.log(`[VoiceManager] Preloading ${voiceLineIds.length} voice lines for buddy ${buddyId}`);
  await Promise.allSettled(voiceLineIds.map(id => VoiceManager.preload(id)));
}

/**
 * Get a random voice line ID for a buddy and trigger type
 *
 * @param buddyId - Buddy ID
 * @param triggerType - Trigger type (e.g., 'pr_weight', 'session_start')
 * @returns Voice line ID or undefined if not found
 */
export async function getVoiceLineForTrigger(
  buddyId: string,
  triggerType: string
): Promise<string | undefined> {
  const { buddies } = await import('../buddyData');

  const buddy = buddies.find(b => b.id === buddyId);
  if (!buddy?.voiceLines) return undefined;

  const voiceLines = buddy.voiceLines[triggerType as keyof typeof buddy.voiceLines];
  if (!voiceLines || voiceLines.length === 0) return undefined;

  // Pick a random voice line from the pool
  const randomIndex = Math.floor(Math.random() * voiceLines.length);
  return voiceLines[randomIndex];
}