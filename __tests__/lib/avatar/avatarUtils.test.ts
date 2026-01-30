// __tests__/lib/avatar/avatarUtils.test.ts
// Tests for avatar utilities

import {
  AVATAR_ART_STYLES,
  getArtStyleMetadata,
  getDefaultArtStyle,
  isValidArtStyle,
  getAvatarImageUrl,
  getDefaultAvatarCosmetics,
  isValidAvatarCosmetics
} from '../../../src/lib/avatar/avatarUtils';

describe('avatarUtils', () => {
  describe('AVATAR_ART_STYLES', () => {
    it('should contain all expected art styles', () => {
      expect(AVATAR_ART_STYLES).toHaveLength(4);
      expect(AVATAR_ART_STYLES.map(s => s.id)).toEqual(['bitmoji', 'pixel', 'retro', '3d']);
    });

    it('should have required properties for each style', () => {
      AVATAR_ART_STYLES.forEach(style => {
        expect(style).toHaveProperty('id');
        expect(style).toHaveProperty('name');
        expect(style).toHaveProperty('description');
        expect(style).toHaveProperty('previewLines');
        expect(style.previewLines).toBeInstanceOf(Array);
        expect(style.previewLines.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getArtStyleMetadata', () => {
    it('should return metadata for valid art style', () => {
      const metadata = getArtStyleMetadata('bitmoji');
      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe('bitmoji');
      expect(metadata?.name).toBe('Bitmoji Style');
    });

    it('should return undefined for invalid art style', () => {
      const metadata = getArtStyleMetadata('invalid' as any);
      expect(metadata).toBeUndefined();
    });
  });

  describe('getDefaultArtStyle', () => {
    it('should return default art style', () => {
      const defaultStyle = getDefaultArtStyle();
      expect(defaultStyle).toBe('bitmoji');
    });
  });

  describe('isValidArtStyle', () => {
    it('should validate correct art styles', () => {
      expect(isValidArtStyle('bitmoji')).toBe(true);
      expect(isValidArtStyle('pixel')).toBe(true);
      expect(isValidArtStyle('retro')).toBe(true);
      expect(isValidArtStyle('3d')).toBe(true);
    });

    it('should reject invalid art styles', () => {
      expect(isValidArtStyle('invalid')).toBe(false);
      expect(isValidArtStyle('')).toBe(false);
      expect(isValidArtStyle('bitmoj' as any)).toBe(false);
    });
  });

  describe('getAvatarImageUrl', () => {
    it('should generate avatar URL correctly', () => {
      const url = getAvatarImageUrl('user123', 'bitmoji', 1, 'Test User');
      expect(url).toContain('api.dicebear.com');
      expect(url).toContain('Test%20User'); // URL encoded
    });

    it('should handle missing display name', () => {
      const url = getAvatarImageUrl('user123', 'bitmoji', 1, null);
      expect(url).toContain('api.dicebear.com');
      expect(url).toContain('user123');
    });
  });

  describe('getDefaultAvatarCosmetics', () => {
    it('should return default cosmetics object', () => {
      const cosmetics = getDefaultAvatarCosmetics();
      expect(cosmetics).toEqual({
        top: null,
        bottom: null,
        shoes: null,
        accessory: null,
      });
    });
  });

  describe('isValidAvatarCosmetics', () => {
    it('should validate correct cosmetics object', () => {
      const validCosmetics = {
        top: 'shirt1',
        bottom: 'pants1',
        shoes: 'shoes1',
        accessory: 'hat1',
      };
      expect(isValidAvatarCosmetics(validCosmetics)).toBe(true);
    });

    it('should validate cosmetics with null values', () => {
      const validCosmetics = {
        top: null,
        bottom: null,
        shoes: null,
        accessory: null,
      };
      expect(isValidAvatarCosmetics(validCosmetics)).toBe(true);
    });

    it('should reject invalid cosmetics object', () => {
      expect(isValidAvatarCosmetics(null)).toBe(false);
      expect(isValidAvatarCosmetics(undefined)).toBe(false);
      expect(isValidAvatarCosmetics({})).toBe(false);
      expect(isValidAvatarCosmetics({ top: 'shirt' })).toBe(false); // Missing other properties
    });
  });
});