// __tests__/lib/avatar/avatarStore.test.ts
// Tests for avatar store (customization only - growth is in userStatsStore)

import { useAvatarStore } from '../../../src/lib/avatar/avatarStore';

// Mock the avatar repository
jest.mock('../../../src/lib/avatar/avatarRepository', () => ({
  updateAvatarStyle: jest.fn(),
  updateAvatarCosmetics: jest.fn(),
  getUserAvatarData: jest.fn(),
}));

// Mock auth store
jest.mock('../../../src/lib/stores/authStore', () => ({
  getUser: jest.fn(),
}));

// Mock userStatsStore for getGrowthFromStats
jest.mock('../../../src/lib/stores/userStatsStore', () => ({
  getAvatarGrowth: jest.fn().mockReturnValue({
    stage: 1,
    heightScale: 0.3,
    volumeTotal: 0,
    setsTotal: 0,
    avgRank: 0,
    milestoneReached: false,
  }),
}));

describe('avatarStore', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset store state
    useAvatarStore.setState({
      artStyle: null,
      cosmetics: {
        top: null,
        bottom: null,
        shoes: null,
        accessory: null,
      },
      hydrated: false,
      loading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAvatarStore.getState();

      expect(state.artStyle).toBeNull();
      expect(state.cosmetics).toEqual({
        top: null,
        bottom: null,
        shoes: null,
        accessory: null,
      });
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

    it('should update locally without backend when user is not authenticated', async () => {
      const { getUser } = require('../../../src/lib/stores/authStore');
      getUser.mockReturnValue(null);

      const { updateAvatarStyle } = require('../../../src/lib/avatar/avatarRepository');

      const result = await useAvatarStore.getState().setArtStyle('pixel');

      expect(result).toBe(true);
      expect(useAvatarStore.getState().artStyle).toBe('pixel');
      expect(updateAvatarStyle).not.toHaveBeenCalled();
    });
  });

  describe('setCosmetics', () => {
    it('should update cosmetics successfully', async () => {
      const { updateAvatarCosmetics } = require('../../../src/lib/avatar/avatarRepository');
      updateAvatarCosmetics.mockResolvedValue({ success: true });

      const { getUser } = require('../../../src/lib/stores/authStore');
      getUser.mockReturnValue({ id: 'user123' });

      const cosmetics = { top: 'shirt1', bottom: 'pants1', shoes: null, accessory: null };
      const result = await useAvatarStore.getState().setCosmetics(cosmetics);

      expect(result).toBe(true);
      expect(useAvatarStore.getState().cosmetics).toEqual(cosmetics);
      expect(updateAvatarCosmetics).toHaveBeenCalledWith('user123', cosmetics);
    });
  });

  describe('useAvatarGrowth (backward compatibility)', () => {
    it('should return growth data from userStatsStore', () => {
      const { getAvatarGrowth } = require('../../../src/lib/stores/userStatsStore');
      getAvatarGrowth.mockReturnValue({
        stage: 5,
        heightScale: 0.5,
        volumeTotal: 10000,
        setsTotal: 100,
        avgRank: 8,
        milestoneReached: false,
      });

      const { useAvatarGrowth } = require('../../../src/lib/avatar/avatarStore');
      const growth = useAvatarGrowth();

      expect(growth.stage).toBe(5);
      expect(growth.heightScale).toBe(0.5);
      expect(growth.volumeTotal).toBe(10000);
      expect(growth.setsTotal).toBe(100);
      expect(growth.avgRank).toBe(8);
    });
  });
});
