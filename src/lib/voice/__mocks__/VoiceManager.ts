// Mock for VoiceManager
export const VoiceManager = {
  initialize: jest.fn(() => Promise.resolve()),
  play: jest.fn(() => Promise.resolve()),
  stopAll: jest.fn(() => Promise.resolve()),
  preload: jest.fn(() => Promise.resolve()),
  unloadAll: jest.fn(() => Promise.resolve()),
  setEnabled: jest.fn(),
  shouldPlayVoice: jest.fn(() => true),
};

export const initializeVoiceManager = jest.fn(() => Promise.resolve());
export const playVoiceLine = jest.fn(() => Promise.resolve());
export const stopAllVoiceLines = jest.fn(() => Promise.resolve());
export const preloadBuddyVoiceLines = jest.fn(() => Promise.resolve());