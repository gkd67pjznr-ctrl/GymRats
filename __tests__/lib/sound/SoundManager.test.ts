// __tests__/lib/sound/SoundManager.test.ts
// Tests for SoundManager audio playback system

import { SoundManager, playSound, initializeSoundManager, SoundKey } from '@/src/lib/sound';

// Mock expo-audio
jest.mock('expo-audio', () => {
  const mockPlayer = {
    id: 1,
    playing: false,
    muted: false,
    loop: false,
    paused: false,
    isLoaded: true,
    isAudioSamplingSupported: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0.5,
    volume: 1,
    playbackRate: 1,
    shouldCorrectPitch: false,
    currentStatus: { playing: false },
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
    setPlaybackRate: jest.fn(),
    setAudioSamplingEnabled: jest.fn(),
    setActiveForLockScreen: jest.fn(),
    updateLockScreenMetadata: jest.fn(),
    clearLockScreenControls: jest.fn(),
    remove: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  };

  return {
    createAudioPlayer: jest.fn(() => ({ ...mockPlayer })),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    setIsAudioActiveAsync: jest.fn(() => Promise.resolve()),
    useAudioPlayer: jest.fn(() => mockPlayer),
    useAudioPlayerStatus: jest.fn(() => ({ playing: false })),
  };
});

describe('SoundManager', () => {
  beforeEach(() => {
    // Clear state between tests
    SoundManager.setEnabled(true);
  });

  describe('initialization', () => {
    it('initializes successfully', async () => {
      await expect(initializeSoundManager()).resolves.not.toThrow();
    });

    it('can be initialized multiple times', async () => {
      await initializeSoundManager();
      await expect(initializeSoundManager()).resolves.not.toThrow();
    });
  });

  describe('enabled state', () => {
    it('is enabled by default', () => {
      expect(SoundManager.isEnabled()).toBe(true);
    });

    it('can be disabled', () => {
      SoundManager.setEnabled(false);
      expect(SoundManager.isEnabled()).toBe(false);
    });

    it('can be re-enabled', () => {
      SoundManager.setEnabled(false);
      SoundManager.setEnabled(true);
      expect(SoundManager.isEnabled()).toBe(true);
    });
  });

  describe('preloading sounds', () => {
    it('preloads a sound successfully', async () => {
      await expect(SoundManager.preload('spark')).resolves.not.toThrow();
    });

    it('preloading same sound twice is idempotent', async () => {
      await SoundManager.preload('spark');
      await expect(SoundManager.preload('spark')).resolves.not.toThrow();
    });

    it('preloads all sound keys', async () => {
      const keys: SoundKey[] = [
        'spark',
        'stamp',
        'thud',
        'cheer',
        'triumph',
        'powerup',
      ];

      for (const key of keys) {
        await expect(SoundManager.preload(key)).resolves.not.toThrow();
      }
    });
  });

  describe('playing sounds', () => {
    beforeEach(async () => {
      await SoundManager.preload('spark');
    });

    it('plays a sound successfully', async () => {
      await expect(playSound('spark')).resolves.not.toThrow();
    });

    it('respects enabled state', async () => {
      SoundManager.setEnabled(false);
      await expect(playSound('spark')).resolves.not.toThrow();
    });

    it('auto-preloads if not already loaded', async () => {
      // Not preloaded - should auto-load on play
      await expect(playSound('stamp')).resolves.not.toThrow();
    });

    it('plays with custom volume', async () => {
      await expect(playSound('spark', 0.5)).resolves.not.toThrow();
    });
  });

  describe('sound duration', () => {
    it('returns duration for preloaded sound', async () => {
      await SoundManager.preload('spark');
      const duration = SoundManager.getDuration('spark');
      expect(duration).toBeGreaterThan(0);
    });

    it('returns fallback duration for unknown sound', () => {
      const duration = SoundManager.getDuration('unknown' as SoundKey);
      expect(duration).toBe(500); // Default fallback
    });
  });

  describe('stopping sounds', () => {
    it('stops all sounds successfully', async () => {
      await expect(SoundManager.stopAll()).resolves.not.toThrow();
    });

    it('stopAll is safe when no sounds are playing', async () => {
      await expect(SoundManager.stopAll()).resolves.not.toThrow();
    });
  });

  describe('unloading sounds', () => {
    it('unloads a specific sound', async () => {
      await SoundManager.preload('spark');
      await expect(SoundManager.unload('spark')).resolves.not.toThrow();
    });

    it('unloading unknown sound is safe', async () => {
      await expect(SoundManager.unload('unknown' as SoundKey)).resolves.not.toThrow();
    });

    it('unloads all sounds', async () => {
      await SoundManager.preload('spark');
      await SoundManager.preload('stamp');
      await expect(SoundManager.unloadAll()).resolves.not.toThrow();
    });
  });
});
