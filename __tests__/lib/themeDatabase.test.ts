// __tests__/lib/themeDatabase.test.ts
/**
 * Tests for the Forgerank Theme Database
 *
 * Tests the theme database functionality including palette, typography,
 * and illustration management.
 */

import {
  initializeThemeDatabase,
  getPaletteById,
  getTypographyById,
  getIllustrationById,
  getAudioById,
  getMotionById,
  getActiveConfiguration,
  setActiveConfiguration,
  addConfiguration,
  updateConfiguration,
  DEFAULT_PALETTES,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_ILLUSTRATIONS,
  DEFAULT_AUDIO,
  DEFAULT_MOTION,
  DEFAULT_CONFIGURATIONS,
} from '../../src/lib/themeDatabase';

describe('Theme Database', () => {
  describe('initializeThemeDatabase', () => {
    it('should initialize with default palettes', () => {
      const database = initializeThemeDatabase();
      expect(database.palettes).toEqual(DEFAULT_PALETTES);
    });

    it('should initialize with default typography', () => {
      const database = initializeThemeDatabase();
      expect(database.typography).toEqual(DEFAULT_TYPOGRAPHY);
    });

    it('should initialize with default illustrations', () => {
      const database = initializeThemeDatabase();
      expect(database.illustrations).toEqual(DEFAULT_ILLUSTRATIONS);
    });

    it('should initialize with default audio', () => {
      const database = initializeThemeDatabase();
      expect(database.audio).toEqual(DEFAULT_AUDIO);
    });

    it('should initialize with default motion', () => {
      const database = initializeThemeDatabase();
      expect(database.motion).toEqual(DEFAULT_MOTION);
    });

    it('should initialize with default configurations', () => {
      const database = initializeThemeDatabase();
      expect(database.configurations).toEqual(DEFAULT_CONFIGURATIONS);
    });
  });

  describe('getPaletteById', () => {
    it('should return a palette by ID', () => {
      const database = initializeThemeDatabase();
      const palette = getPaletteById(database, 'toxic-energy');
      expect(palette).toBeDefined();
      expect(palette?.id).toBe('toxic-energy');
    });

    it('should return undefined for non-existent palette', () => {
      const database = initializeThemeDatabase();
      const palette = getPaletteById(database, 'non-existent');
      expect(palette).toBeUndefined();
    });
  });

  describe('getTypographyById', () => {
    it('should return typography by ID', () => {
      const database = initializeThemeDatabase();
      const typography = getTypographyById(database, 'functional-base');
      expect(typography).toBeDefined();
      expect(typography?.id).toBe('functional-base');
    });

    it('should return undefined for non-existent typography', () => {
      const database = initializeThemeDatabase();
      const typography = getTypographyById(database, 'non-existent');
      expect(typography).toBeUndefined();
    });
  });

  describe('getIllustrationById', () => {
    it('should return illustration by ID', () => {
      const database = initializeThemeDatabase();
      const illustration = getIllustrationById(database, 'hand-drawn-base');
      expect(illustration).toBeDefined();
      expect(illustration?.id).toBe('hand-drawn-base');
    });

    it('should return undefined for non-existent illustration', () => {
      const database = initializeThemeDatabase();
      const illustration = getIllustrationById(database, 'non-existent');
      expect(illustration).toBeUndefined();
    });
  });

  describe('getAudioById', () => {
    it('should return audio by ID', () => {
      const database = initializeThemeDatabase();
      const audio = getAudioById(database, 'spark-pr');
      expect(audio).toBeDefined();
      expect(audio?.id).toBe('spark-pr');
    });

    it('should return undefined for non-existent audio', () => {
      const database = initializeThemeDatabase();
      const audio = getAudioById(database, 'non-existent');
      expect(audio).toBeUndefined();
    });
  });

  describe('getMotionById', () => {
    it('should return motion by ID', () => {
      const database = initializeThemeDatabase();
      const motion = getMotionById(database, 'snappy-base');
      expect(motion).toBeDefined();
      expect(motion?.id).toBe('snappy-base');
    });

    it('should return undefined for non-existent motion', () => {
      const database = initializeThemeDatabase();
      const motion = getMotionById(database, 'non-existent');
      expect(motion).toBeUndefined();
    });
  });

  describe('getActiveConfiguration', () => {
    it('should return the active configuration', () => {
      const database = initializeThemeDatabase();
      const activeConfig = getActiveConfiguration(database);
      expect(activeConfig).toBeDefined();
      expect(activeConfig?.isActive).toBe(true);
    });
  });

  describe('setActiveConfiguration', () => {
    it('should set a configuration as active', () => {
      const database = initializeThemeDatabase();
      const updatedDatabase = setActiveConfiguration(database, 'default-dark');
      const activeConfig = getActiveConfiguration(updatedDatabase);
      expect(activeConfig?.id).toBe('default-dark');
      expect(activeConfig?.isActive).toBe(true);
    });
  });

  describe('addConfiguration', () => {
    it('should add a new configuration', () => {
      const database = initializeThemeDatabase();
      const newConfig = {
        id: 'new-config',
        name: 'New Config',
        paletteId: 'toxic-energy',
        typographyId: 'functional-base',
        illustrationId: 'hand-drawn-base',
        audioId: 'spark-pr',
        motionId: 'snappy-base',
      };
      const updatedDatabase = addConfiguration(database, newConfig);
      expect(updatedDatabase.configurations).toHaveLength(database.configurations.length + 1);
      const addedConfig = updatedDatabase.configurations.find(c => c.id === 'new-config');
      expect(addedConfig).toBeDefined();
    });
  });

  describe('updateConfiguration', () => {
    it('should update an existing configuration', () => {
      const database = initializeThemeDatabase();
      const updatedDatabase = updateConfiguration(database, 'default-dark', { name: 'Updated Name' });
      const updatedConfig = updatedDatabase.configurations.find(c => c.id === 'default-dark');
      expect(updatedConfig?.name).toBe('Updated Name');
    });
  });
});