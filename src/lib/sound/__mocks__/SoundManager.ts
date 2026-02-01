// Mock for SoundManager
let enabled = true;

export const SoundManager = {
  initialize: jest.fn(() => Promise.resolve()),
  play: jest.fn(() => Promise.resolve()),
  stopAll: jest.fn(() => Promise.resolve()),
  preload: jest.fn(() => Promise.resolve()),
  unloadAll: jest.fn(() => Promise.resolve()),
  unload: jest.fn(() => Promise.resolve()),
  setEnabled: jest.fn((value: boolean) => {
    enabled = value;
  }),
  isEnabled: jest.fn(() => enabled),
  getDuration: jest.fn(() => 500),
};

export const initializeSoundManager = jest.fn(() => Promise.resolve());
export const playSound = jest.fn(() => Promise.resolve());