// __tests__/lib/avatar/avatarStore.test.ts
// Tests for avatar store

import { useAvatarStore } from '../../../src/lib/avatar/avatarStore';

// Mock the avatar repository
jest.mock('../../../src/lib/avatar/avatarRepository', () => ({
  updateAvatarStyle: jest.fn(),
  updateAvatarCosmetics: jest.fn(),
  updateAvatarGrowth: jest.fn(),
  getUserAvatarData: jest.fn(),
}));

// Mock auth store
jest.mock('../../../src/lib/stores/authStore', () => ({
  getUser: jest.fn(),
}));

describe('avatarStore', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset store state
    useAvatarStore.setState({
      artStyle: null,
      growthStage: 1,
      heightScale: 0.3,
      cosmetics: {
        top: null,
        bottom: null,
        shoes: null,
        accessory: null,
      },
      volumeTotal: 0,
      setsTotal: 0,
      avgRank: 0,
      hydrated: false,
      loading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAvatarStore.getState();

      expect(state.artStyle).toBeNull();
      expect(state.growthStage).toBe(1);
      expect(state.heightScale).toBe(0.3);
      expect(state.cosmetics).toEqual({
        top: null,
        bottom: null,
        shoes: null,
        accessory: null,
      });
      expect(state.volumeTotal).toBe(0);
      expect(state.setsTotal).toBe(0);
      expect(state.avgRank).toBe(0);
      expect(state.hydrated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setArtStyle', () => {
    it('should update art style successfully', async () => {
      const { updateAvatarStyle } = require('../../../src/lib/avatar/avatarRepository');
      updateAvatarStyle.mockResolvedValue({ success: true });

      const { getUser } = require('../../../src/lib/stores/authStore');
      getUser.mockReturnValue({ id: 'user123' });

      const result = await useAvatarStore.getState().setArtStyle('pixel');

      expect(result).toBe(true);
      expect(useAvatarStore.getState().artStyle).toBe('pixel');
      expect(updateAvatarStyle).toHaveBeenCalledWith('user123', 'pixel');
    });

    it('should handle error when updating art style', async () => {
      const { updateAvatarStyle } = require('../../../src/lib/avatar/avatarRepository');
      updateAvatarStyle.mockResolvedValue({ success: false, error: 'Failed to update' });

      const { getUser } = require('../../../src/lib/stores/authStore');
      getUser.mockReturnValue({ id: 'user123' });

      const result = await useAvatarStore.getState().setArtStyle('pixel');

      expect(result).toBe(false);
      expect(useAvatarStore.getState().error).toBe('Failed to update');
    });
  });

  describe('calculateGrowth', () => {
    it('should calculate growth correctly', async () => {
      const { updateAvatarGrowth } = require('../../../src/lib/avatar/avatarRepository');
      updateAvatarGrowth.mockResolvedValue({ success: true });

      const { getUser } = require('../../../src/lib/stores/authStore');
      getUser.mockReturnValue({ id: 'user123' });

      const result = await useAvatarStore.getState().calculateGrowth(10000, 100, 5);

      expect(result).toBe(true);
      // Growth should have increased from stage 1
      expect(useAvatarStore.getState().growthStage).toBeGreaterThan(1);
    });
  });
});