// Jest setup file for mocking native modules

// Mock AsyncStorage manually
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-safe-area-context (needed by ScreenHeader)
jest.mock('react-native-safe-area-context', () => {
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
    SafeAreaInsetsContext: {
      Consumer: ({ children }) => children(insets),
    },
  };
});

// Mock react-native-confetti-cannon
jest.mock('react-native-confetti-cannon', () => ({
  ConfettiCannon: 'ConfettiCannon',
}));

// Mock expo-file-system/legacy (SDK 54 migration)
jest.mock('expo-file-system/legacy', () => ({
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, size: 1024 })),
  readAsStringAsync: jest.fn(() => Promise.resolve('base64data')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  documentDirectory: '/mock/documents/',
  cacheDirectory: '/mock/cache/',
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
}));

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

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
    duration: 1,
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
    createAudioPlayer: jest.fn(() => mockPlayer),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    setIsAudioActiveAsync: jest.fn(() => Promise.resolve()),
    useAudioPlayer: jest.fn(() => mockPlayer),
    useAudioPlayerStatus: jest.fn(() => ({ playing: false })),
  };
});

// Mock expo-iap
jest.mock('expo-iap', () => ({
  connectAsync: jest.fn(() => Promise.resolve()),
  disconnectAsync: jest.fn(() => Promise.resolve()),
  setPurchaseListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  getProductsAsync: jest.fn(() => Promise.resolve([])),
  requestPurchaseAsync: jest.fn(() => Promise.resolve()),
  getPurchaseHistoryAsync: jest.fn(() => Promise.resolve([])),
  finishTransactionAsync: jest.fn(() => Promise.resolve()),
}), { virtual: true });

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'https://placeholder.supabase.co',
      supabaseAnonKey: 'placeholder-key',
    },
    EXDevLauncher: undefined,
  },
  manifest: null,
}));

// Mock VoiceManager
jest.mock('./src/lib/voice/VoiceManager');
// Mock SoundManager
jest.mock('./src/lib/sound/SoundManager');

// Ignore React Native warning about act()
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: Not wrapped in act')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Suppress Text component NaN warning
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Text children must not be mutated')
  ) {
    return;
  }
  originalWarn(...args);
};
