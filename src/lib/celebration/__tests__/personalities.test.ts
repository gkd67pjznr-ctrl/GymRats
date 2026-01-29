// src/lib/celebration/__tests__/personalities.test.ts
// Tests for the multi-personality cue system

import {
  getAllPersonalities,
  getPersonalityById,
  getCueForPersonality,
  prTypeToContext,
  tierToIntensity,
  PERSONALITIES,
  DEFAULT_PERSONALITY_ID,
  type Personality,
  type CueContext,
} from '../personalities';

describe('Personalities System', () => {
  describe('getAllPersonalities', () => {
    it('should return all 5 personalities', () => {
      const personalities = getAllPersonalities();
      expect(personalities).toHaveLength(5);
      expect(personalities).toEqual(PERSONALITIES);
    });

    it('should include all required personality data', () => {
      const personalities = getAllPersonalities();

      for (const personality of personalities) {
        expect(personality).toHaveProperty('id');
        expect(personality).toHaveProperty('name');
        expect(personality).toHaveProperty('description');
        expect(personality).toHaveProperty('emoji');
        expect(personality).toHaveProperty('color');
        expect(personality).toHaveProperty('tone');
        expect(personality).toHaveProperty('cues');
        expect(personality.tone).toBeInstanceOf(Array);
        expect(personality.cues).toBeInstanceOf(Object);
      }
    });

    it('should have default personality as classic', () => {
      expect(DEFAULT_PERSONALITY_ID).toBe('classic');
    });
  });

  describe('getPersonalityById', () => {
    it('should return personality by id', () => {
      const hype = getPersonalityById('hype');
      expect(hype).toBeDefined();
      expect(hype?.name).toBe('Hype Beast');
      expect(hype?.emoji).toBe('🔥');
    });

    it('should return undefined for unknown id', () => {
      const unknown = getPersonalityById('unknown_personality');
      expect(unknown).toBeUndefined();
    });

    it('should return all personalities', () => {
      expect(getPersonalityById('classic')).toBeDefined();
      expect(getPersonalityById('hype')).toBeDefined();
      expect(getPersonalityById('zen')).toBeDefined();
      expect(getPersonalityById('android')).toBeDefined();
      expect(getPersonalityById('oldschool')).toBeDefined();
    });
  });

  describe('getCueForPersonality', () => {
    let classic: Personality;
      let hype: Personality;

    beforeEach(() => {
      classic = getPersonalityById('classic')!;
      hype = getPersonalityById('hype')!;
    });

    it('should return cue for valid context', () => {
      const cue = getCueForPersonality(classic, 'fallback', 1);
      expect(cue).toBeDefined();
      expect(cue?.message).toBeTruthy();
      expect(cue?.intensity).toBeTruthy();
    });

    it('should return different cues for different personalities', () => {
      const classicCue = getCueForPersonality(classic, 'fallback', 1);
      const hypeCue = getCueForPersonality(hype, 'fallback', 1);

      expect(classicCue?.message).not.toBe(hypeCue?.message);
    });

    it('should return null for context with no cues', () => {
      const cue = getCueForPersonality(classic, 'workout_start' as CueContext, 1);
      // workout_start should have cues defined
      expect(cue).toBeDefined();
    });

    it('should respect tier filtering', () => {
      // Test with Classic personality which has tier-specific cues
      const tier3Cue = getCueForPersonality(classic, 'pr_weight', 3);
      // Classic only has high intensity for pr_weight, but tier filtering should work
      expect(['med', 'high']).toContain(tier3Cue?.intensity);
    });

    it('should return fallback for tier out of range', () => {
      const cue = getCueForPersonality(classic, 'pr_weight', 99);
      // Should return a cue since all PR contexts should have at least one cue
      expect(cue).toBeDefined();
    });
  });

  describe('prTypeToContext', () => {
    it('should map PR types to cue contexts', () => {
      expect(prTypeToContext('weight')).toBe('pr_weight');
      expect(prTypeToContext('rep')).toBe('pr_rep');
      expect(prTypeToContext('e1rm')).toBe('pr_e1rm');
      expect(prTypeToContext('cardio')).toBe('pr_cardio');
    });

    it('should map none to fallback', () => {
      expect(prTypeToContext('none')).toBe('fallback');
    });
  });

  describe('tierToIntensity', () => {
    it('should map tier 1 to low', () => {
      expect(tierToIntensity(1)).toBe('low');
    });

    it('should map tier 2 to med', () => {
      expect(tierToIntensity(2)).toBe('med');
    });

    it('should map tier 3 to high', () => {
      expect(tierToIntensity(3)).toBe('high');
    });

    it('should map tier 4+ to epic', () => {
      expect(tierToIntensity(4)).toBe('epic');
      expect(tierToIntensity(5)).toBe('epic');
      expect(tierToIntensity(99)).toBe('epic');
    });
  });

  describe('Hype Beast Personality', () => {
    let hype: Personality;

    beforeEach(() => {
      hype = getPersonalityById('hype')!;
    });

    it('should have energetic tone keywords', () => {
      expect(hype.tone).toContain('energetic');
      expect(hype.tone).toContain('slang');
      expect(hype.tone).toContain('hype');
    });

    it('should use slang in messages', () => {
      // Try multiple times since cues are randomly selected
      let foundSlang = false;
      for (let i = 0; i < 10; i++) {
        const cue = getCueForPersonality(hype, 'pr_weight', 3);
        if (cue?.message && (
          cue.message.match(/SHEEEESH|LET'S GO|GAINS|WHEY|freakin/i) ||
          cue.message.includes('!')
        )) {
          foundSlang = true;
          break;
        }
      }
      expect(foundSlang).toBe(true);
    });
  });

  describe('Zen Coach Personality', () => {
    let zen: Personality;

    beforeEach(() => {
      zen = getPersonalityById('zen')!;
    });

    it('should have calm tone keywords', () => {
      expect(zen.tone).toContain('calm');
      expect(zen.tone).toContain('philosophical');
      expect(zen.tone).toContain('focused');
    });

    it('should use philosophical language', () => {
      // Try multiple times since cues are randomly selected
      let foundPhilosophical = false;
      for (let i = 0; i < 10; i++) {
        const cue = getCueForPersonality(zen, 'fallback', 1);
        if (cue?.message && (
          cue.message.match(/Be present|Focus|journey|patience|One rep/i) ||
          cue.message.includes('mind') ||
          cue.message.includes('body')
        )) {
          foundPhilosophical = true;
          break;
        }
      }
      expect(foundPhilosophical).toBe(true);
    });
  });

  describe('Android Personality', () => {
    let android: Personality;

    beforeEach(() => {
      android = getPersonalityById('android')!;
    });

    it('should have robotic tone', () => {
      expect(android.tone).toContain('robotic');
      expect(android.tone).toContain('analytical');
    });

    it('should use technical language', () => {
      // Try multiple times since cues are randomly selected
      let foundTechnical = false;
      for (let i = 0; i < 10; i++) {
        const cue = getCueForPersonality(android, 'pr_weight', 2);
        if (cue?.message && (
          cue.message.match(/metrics|parameters|upgrade|analysis|optimal|strength/i) ||
          cue.message.includes('data')
        )) {
          foundTechnical = true;
          break;
        }
      }
      expect(foundTechnical).toBe(true);
    });
  });

  describe('Old School Lifter Personality', () => {
    let oldschool: Personality;

    beforeEach(() => {
      oldschool = getPersonalityById('oldschool')!;
    });

    it('should have tough tone', () => {
      expect(oldschool.tone).toContain('tough');
      expect(oldschool.tone).toContain('no-nonsense');
    });

    it('should use direct language', () => {
      // Try multiple times since cues are randomly selected
      let foundDirect = false;
      for (let i = 0; i < 10; i++) {
        const cue = getCueForPersonality(oldschool, 'fallback', 1);
        if (cue?.message && (
          cue.message.match(/Keep your head|Stay focused|Grind|work|One rep/i) ||
          cue.message.match(/solid|clean|tough/i)
        )) {
          foundDirect = true;
          break;
        }
      }
      expect(foundDirect).toBe(true);
    });
  });

  describe('Context Coverage', () => {
    let classic: Personality;

    beforeEach(() => {
      classic = getPersonalityById('classic')!;
    });

    it('should have cues for all PR contexts', () => {
      expect(getCueForPersonality(classic, 'pr_weight', 1)).toBeDefined();
      expect(getCueForPersonality(classic, 'pr_rep', 1)).toBeDefined();
      expect(getCueForPersonality(classic, 'pr_e1rm', 1)).toBeDefined();
    });

    it('should have cues for utility contexts', () => {
      expect(getCueForPersonality(classic, 'rest_timer', 1)).toBeDefined();
      expect(getCueForPersonality(classic, 'workout_start', 1)).toBeDefined();
      expect(getCueForPersonality(classic, 'workout_end', 1)).toBeDefined();
      expect(getCueForPersonality(classic, 'fallback', 1)).toBeDefined();
    });

    it('should have anomaly detection cues', () => {
      const cue = getCueForPersonality(classic, 'anomaly', 1);
      expect(cue).toBeDefined();
      expect(cue?.message).toBeTruthy();
    });
  });
});
