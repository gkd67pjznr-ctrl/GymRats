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

// Mock react-native-confetti-cannon
jest.mock('react-native-confetti-cannon', () => ({
  ConfettiCannon: 'ConfettiCannon',
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
