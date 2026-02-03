// src/lib/celebration/content.ts
// Celebration content registry
// Designed to support future AI-generated images and animations

import type {
  Celebration,
  CelebrationContentKey,
  CelebrationVariant,
} from './types';

/**
 * Generate content key for a celebration
 *
 * Key format: "{prType}_tier_{tier}_{variant}"
 * This will be used to look up AI-generated content in the future.
 */
export function contentKey(
  prType: string,
  tier: number,
  variant: CelebrationVariant
): CelebrationContentKey {
  return `${prType}_tier_${tier}_${variant}`;
}

/**
 * Asset lookup table
 *
 * Maps content keys to visual assets.
 * In v1: Uses emoji/icons as placeholders
 * Future: Will reference AI-generated images/animations
 *
 * @example
 * // Future AI content:
 * 'weight_tier_1_a': {
 *   type: 'image',
 *   uri: 'https://cdn.gymrats.app/celebrations/weight_tier_1_a.png',
 *   aspectRatio: 1,
 * }
 */
const ASSET_REGISTRY: Record<string, { emoji: string; aspectRatio: number }> = {
  // Tier 1 - Small PRs (1-5 lb)
  'weight_tier_1_a': { emoji: '💪', aspectRatio: 1 },
  'weight_tier_1_b': { emoji: '🔥', aspectRatio: 1 },
  'weight_tier_1_c': { emoji: '⚡', aspectRatio: 1 },
  'weight_tier_1_d': { emoji: '📈', aspectRatio: 1 },
  'weight_tier_1_e': { emoji: '✨', aspectRatio: 1 },

  'rep_tier_1_a': { emoji: '💪', aspectRatio: 1 },
  'rep_tier_1_b': { emoji: '🔥', aspectRatio: 1 },
  'rep_tier_1_c': { emoji: '⚡', aspectRatio: 1 },
  'rep_tier_1_d': { emoji: '📈', aspectRatio: 1 },
  'rep_tier_1_e': { emoji: '✨', aspectRatio: 1 },

  'e1rm_tier_1_a': { emoji: '💪', aspectRatio: 1 },
  'e1rm_tier_1_b': { emoji: '🔥', aspectRatio: 1 },
  'e1rm_tier_1_c': { emoji: '⚡', aspectRatio: 1 },
  'e1rm_tier_1_d': { emoji: '📈', aspectRatio: 1 },
  'e1rm_tier_1_e': { emoji: '✨', aspectRatio: 1 },

  // Tier 2 - Medium PRs (5-10 lb)
  'weight_tier_2_a': { emoji: '🏋️', aspectRatio: 1 },
  'weight_tier_2_b': { emoji: '💥', aspectRatio: 1 },
  'weight_tier_2_c': { emoji: '🚀', aspectRatio: 1 },
  'weight_tier_2_d': { emoji: '⭐', aspectRatio: 1 },
  'weight_tier_2_e': { emoji: '🎯', aspectRatio: 1 },

  'rep_tier_2_a': { emoji: '🏋️', aspectRatio: 1 },
  'rep_tier_2_b': { emoji: '💥', aspectRatio: 1 },
  'rep_tier_2_c': { emoji: '🚀', aspectRatio: 1 },
  'rep_tier_2_d': { emoji: '⭐', aspectRatio: 1 },
  'rep_tier_2_e': { emoji: '🎯', aspectRatio: 1 },

  'e1rm_tier_2_a': { emoji: '🏋️', aspectRatio: 1 },
  'e1rm_tier_2_b': { emoji: '💥', aspectRatio: 1 },
  'e1rm_tier_2_c': { emoji: '🚀', aspectRatio: 1 },
  'e1rm_tier_2_d': { emoji: '⭐', aspectRatio: 1 },
  'e1rm_tier_2_e': { emoji: '🎯', aspectRatio: 1 },

  // Tier 3 - Big PRs (10-20 lb)
  'weight_tier_3_a': { emoji: '🏆', aspectRatio: 1 },
  'weight_tier_3_b': { emoji: '👑', aspectRatio: 1 },
  'weight_tier_3_c': { emoji: '🌟', aspectRatio: 1 },
  'weight_tier_3_d': { emoji: '💎', aspectRatio: 1 },
  'weight_tier_3_e': { emoji: '🔥', aspectRatio: 1 },

  'rep_tier_3_a': { emoji: '🏆', aspectRatio: 1 },
  'rep_tier_3_b': { emoji: '👑', aspectRatio: 1 },
  'rep_tier_3_c': { emoji: '🌟', aspectRatio: 1 },
  'rep_tier_3_d': { emoji: '💎', aspectRatio: 1 },
  'rep_tier_3_e': { emoji: '🔥', aspectRatio: 1 },

  'e1rm_tier_3_a': { emoji: '🏆', aspectRatio: 1 },
  'e1rm_tier_3_b': { emoji: '👑', aspectRatio: 1 },
  'e1rm_tier_3_c': { emoji: '🌟', aspectRatio: 1 },
  'e1rm_tier_3_d': { emoji: '💎', aspectRatio: 1 },
  'e1rm_tier_3_e': { emoji: '🔥', aspectRatio: 1 },

  // Tier 4 - MASSIVE PRs (20+ lb)
  'weight_tier_4_a': { emoji: '🏆', aspectRatio: 1 },
  'weight_tier_4_b': { emoji: '👑', aspectRatio: 1 },
  'weight_tier_4_c': { emoji: '🌟', aspectRatio: 1 },
  'weight_tier_4_d': { emoji: '💎', aspectRatio: 1 },
  'weight_tier_4_e': { emoji: '🔥', aspectRatio: 1 },

  'rep_tier_4_a': { emoji: '🏆', aspectRatio: 1 },
  'rep_tier_4_b': { emoji: '👑', aspectRatio: 1 },
  'rep_tier_4_c': { emoji: '🌟', aspectRatio: 1 },
  'rep_tier_4_d': { emoji: '💎', aspectRatio: 1 },
  'rep_tier_4_e': { emoji: '🔥', aspectRatio: 1 },

  'e1rm_tier_4_a': { emoji: '🏆', aspectRatio: 1 },
  'e1rm_tier_4_b': { emoji: '👑', aspectRatio: 1 },
  'e1rm_tier_4_c': { emoji: '🌟', aspectRatio: 1 },
  'e1rm_tier_4_d': { emoji: '💎', aspectRatio: 1 },
  'e1rm_tier_4_e': { emoji: '🔥', aspectRatio: 1 },
};

/**
 * Get asset for content key
 *
 * In v1: Returns emoji asset
 * Future: Will return AI-generated image/animation
 */
export function getAssetForKey(contentKey: CelebrationContentKey) {
  const asset = ASSET_REGISTRY[contentKey];
  if (!asset) {
    // Fallback to tier 1 variant a if key not found
    return ASSET_REGISTRY['weight_tier_1_a'] || { emoji: '💪', aspectRatio: 1 };
  }
  return asset;
}

/**
 * Text templates for celebrations
 *
 * Placeholders: {exercise}, {weight}, {reps}, {delta}
 */
const TEXT_TEMPLATES = {
  weight: {
    tier_1: {
      headlines: [
        'New Weight PR!',
        'Heavier Than Ever!',
        'Leveling Up!',
        'Getting Stronger!',
        'New Ceiling!',
      ],
      details: [
        '{delta} lb heavier on {exercise}',
        'Crushed {weight} on {exercise}',
        'That\'s {delta} lb more than before',
        'Moving up at {exercise}',
      ],
    },
    tier_2: {
      headlines: [
        'BIG Weight PR!',
        'Strong Work!',
        'New Bracket!',
        'That\'s Heavy!',
        'Level Up!',
      ],
      details: [
        '{delta} lb jump on {exercise}!',
        'Crushed {weight} on {exercise}',
        'That\'s a {delta} lb PR',
        'Serious strength on {exercise}',
      ],
    },
    tier_3: {
      headlines: [
        'MASSIVE PR!',
        'HEAVY DAY!',
        'BEAST MODE!',
        'UNLOCKED!',
        'INSANE!',
      ],
      details: [
        '{delta} lb PR on {exercise}!',
        'New level: {weight}',
        'That\'s not luck—that\'s work',
        'Strength is showing',
      ],
    },
    tier_4: {
      headlines: [
        'MYTHIC PR!',
        'LEGENDARY!',
        'GOD TIER!',
        'UNSTOPPABLE!',
        'GOAT STATUS!',
      ],
      details: [
        '{delta} lb PR. You\'re dangerous now.',
        'That\'s a statement set',
        'New bracket unlocked',
        'You just leveled up big time',
      ],
    },
  },
  rep: {
    tier_1: {
      headlines: [
        'Rep PR!',
        'More Reps!',
        'Volume Up!',
        'Endurance!',
        'Building Up!',
      ],
      details: [
        '{delta} more reps at {weight}',
        '{reps} reps at {weight}!',
        'Volume PR on {exercise}',
        'Getting those reps in',
      ],
    },
    tier_2: {
      headlines: [
        'BIG Rep PR!',
        'Volume Jump!',
        'That\'s Growth!',
        'Endurance King!',
        'Rep Machine!',
      ],
      details: [
        '{delta} more reps at {weight}!',
        '{reps} reps—let\'s go!',
        'That\'s a leap in volume',
        'Work capacity up',
      ],
    },
    tier_3: {
      headlines: [
        'HUGE Rep PR!',
        'VOLUME BEAST!',
        'ENDURANCE GOD!',
        'UNREAL!',
        'MONSTER SET!',
      ],
      details: [
        '{delta} rep jump at {weight}!',
        '{reps} reps—that\'s huge',
        'You\'re dangerous now',
        'Big jump. Respect.',
      ],
    },
    tier_4: {
      headlines: [
        'GODLIKE REPS!',
        'MYTHIC VOLUME!',
        'UNSTOPPABLE!',
        'FREAKISH!',
        'INSANE ENDURANCE!',
      ],
      details: [
        '{delta} more reps?! You\'re built different.',
        '{reps} reps. Just wow.',
        'That\'s not human',
        'What are you?',
      ],
    },
  },
  e1rm: {
    tier_1: {
      headlines: [
        'e1RM PR!',
        'Strength Up!',
        'Getting Stronger!',
        'New Ceiling!',
        'Progress!',
      ],
      details: [
        '{delta} lb e1RM gain!',
        'Estimated max is up',
        'Strength building on {exercise}',
        'That\'s real progress',
      ],
    },
    tier_2: {
      headlines: [
        'BIG e1RM PR!',
        'Strength Jump!',
        'Engine Upgrade!',
        'Power Up!',
        'Gaining!',
      ],
      details: [
        '{delta} lb e1RM jump!',
        'Your ceiling just raised',
        'Strength is showing',
        'That\'s real progress',
      ],
    },
    tier_3: {
      headlines: [
        'HUGE e1RM PR!',
        'ENGINE UPGRADE!',
        'NEW CEILING!',
        'POWER SURGE!',
        'BEAST MODE!',
      ],
      details: [
        '{delta} lb e1RM PR!',
        'New ceiling unlocked',
        'You\'re building something serious',
        'Engine upgrade complete',
      ],
    },
    tier_4: {
      headlines: [
        'MYTHIC e1RM!',
        'ELITE STRENGTH!',
        'CHAMPION!',
        'GOAT STATUS!',
        'UNREAL!',
      ],
      details: [
        '{delta} lb e1RM gain. Elite territory.',
        'That\'s champion level',
        'You\'re in a league of your own',
        'Respect earned.',
      ],
    },
  },
} as const;

/**
 * Get random text template for PR type and tier
 */
export function getTextTemplate(
  prType: 'weight' | 'rep' | 'e1rm',
  tier: 1 | 2 | 3 | 4
): { headline: string; detail: string } {
  const templates = TEXT_TEMPLATES[prType][`tier_${tier}` as const];
  const headline = templates.headlines[Math.floor(Math.random() * templates.headlines.length)];
  const detail = templates.details[Math.floor(Math.random() * templates.details.length)];
  return { headline, detail };
}

/**
 * All celebration definitions
 *
 * This registry defines all available celebrations.
 * In the future, AI content will be swapped in by updating the content key mappings.
 */
function makeCelebrations(): Celebration[] {
  const variants: CelebrationVariant[] = ['a', 'b', 'c', 'd', 'e'];

  const result: Celebration[] = [];

  // === WEIGHT PR CELEBRATIONS ===
  for (const tier of [1, 2, 3, 4] as const) {
    for (const variant of variants) {
      const min = tier === 1 ? 0 : tier === 2 ? 5 : tier === 3 ? 10 : 20;
      const max = tier === 1 ? 5 : tier === 2 ? 10 : tier === 3 ? 20 : undefined;
      const sound = tier === 1 ? 'spark' : tier === 2 ? 'spark' : tier === 3 ? 'triumph' : 'powerup';
      const volume = tier === 1 ? 0.7 : tier === 2 ? 0.9 : 1.0;
      const repeats = tier === 3 ? 2 : tier === 4 ? 3 : 1;

      result.push({
        id: `weight_tier_${tier}_${variant}`,
        prType: 'weight',
        tier,
        variant,
        contentKey: contentKey('weight', tier, variant),
        assets: [],
        sound: { key: sound, volume },
        haptic: tier === 1 ? { type: 'success' } : { type: 'heavy', repeats: tier >= 3 ? repeats : 1, delayMs: 100 },
        text: getTextTemplate('weight', tier),
        minDeltaLb: min,
        maxDeltaLb: max,
      });
    }
  }

  // === REP PR CELEBRATIONS ===
  for (const tier of [1, 2, 3, 4] as const) {
    for (const variant of variants) {
      const min = tier === 1 ? 0 : tier === 2 ? 2 : tier === 3 ? 4 : 6;
      const max = tier === 1 ? 2 : tier === 2 ? 4 : tier === 3 ? 6 : undefined;
      const sound = tier === 1 ? 'spark' : tier === 2 ? 'spark' : tier === 3 ? 'triumph' : 'powerup';
      const volume = tier === 1 ? 0.7 : tier === 2 ? 0.9 : 1.0;
      const repeats = tier === 3 ? 2 : tier === 4 ? 3 : 1;

      result.push({
        id: `rep_tier_${tier}_${variant}`,
        prType: 'rep',
        tier,
        variant,
        contentKey: contentKey('rep', tier, variant),
        assets: [],
        sound: { key: sound, volume },
        haptic: tier === 1 ? { type: 'success' } : { type: 'heavy', repeats: tier >= 3 ? repeats : 1, delayMs: 100 },
        text: getTextTemplate('rep', tier),
        minDeltaLb: min,
        maxDeltaLb: max,
      });
    }
  }

  // === e1RM PR CELEBRATIONS ===
  for (const tier of [1, 2, 3, 4] as const) {
    for (const variant of variants) {
      const min = tier === 1 ? 0 : tier === 2 ? 5 : tier === 3 ? 10 : 20;
      const max = tier === 1 ? 5 : tier === 2 ? 10 : tier === 3 ? 20 : undefined;
      const sound = tier === 1 ? 'spark' : tier === 2 ? 'spark' : tier === 3 ? 'triumph' : 'powerup';
      const volume = tier === 1 ? 0.7 : tier === 2 ? 0.9 : 1.0;
      const repeats = tier === 3 ? 2 : tier === 4 ? 3 : 1;

      result.push({
        id: `e1rm_tier_${tier}_${variant}`,
        prType: 'e1rm',
        tier,
        variant,
        contentKey: contentKey('e1rm', tier, variant),
        assets: [],
        sound: { key: sound, volume },
        haptic: tier === 1 ? { type: 'success' } : { type: 'heavy', repeats: tier >= 3 ? repeats : 1, delayMs: 100 },
        text: getTextTemplate('e1rm', tier),
        minDeltaLb: min,
        maxDeltaLb: max,
      });
    }
  }

  return result;
}

export const CELEBRATIONS: Celebration[] = makeCelebrations();
