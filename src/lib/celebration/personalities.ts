// src/lib/celebration/personalities.ts
// Multi-personality cue system for Forgerank
// Users can select their "gym buddy" personality

import type { PRType } from '../perSetCueTypes';

/**
 * Cue context types
 *
 * Different situations where cues are shown
 */
export type CueContext =
  | 'pr_weight'        // Weight PR achieved
  | 'pr_rep'           // Rep PR achieved
  | 'pr_e1rm'          // e1RM PR achieved
  | 'pr_cardio'        // Cardio set detected
  | 'rest_timer'       // Rest timer finished
  | 'streak'           // Workout streak milestone
  | 'rank_up'          // Forgerank rank increased
  | 'fallback'         // General encouragement between sets
  | 'workout_start'    // Starting a workout
  | 'workout_end'      // Finishing a workout
  | 'anomaly'          // Anti-cheat anomaly detection;

/**
 * Cue intensity level
 */
export type CueIntensity = 'low' | 'med' | 'high' | 'epic';

/**
 * Single cue definition
 */
export interface PersonalityCue {
  /** The message text */
  message: string;
  /** Intensity level */
  intensity: CueIntensity;
  /** Minimum tier for this cue (1-4) */
  minTier?: number;
  /** Maximum tier for this cue (1-4) */
  maxTier?: number;
}

/**
 * Personality definition
 *
 * Defines a complete "gym buddy" personality with unique voice
 */
export interface Personality {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Emoji/icon representation */
  emoji: string;
  /** Primary accent color (for UI theming) */
  color: string;
  /** Tone keywords */
  tone: string[];
  /** Cues organized by context and tier */
  cues: Record<CueContext, PersonalityCue[]>;
  /** Whether this is a premium personality */
  isPremium?: boolean;
  /** Currency cost (if premium) */
  cost?: number;
}

/**
 * Get all available personalities
 */
export function getAllPersonalities(): Personality[] {
  return PERSONALITIES;
}

/**
 * Get personality by ID
 */
export function getPersonalityById(id: string): Personality | undefined {
  return PERSONALITIES.find(p => p.id === id);
}

/**
 * Get random cue for a personality and context
 *
 * @param personality - The personality to get cue from
 * @param context - The cue context
 * @param tier - PR tier (1-4), used for filtering
 * @returns Random cue matching context and tier, or null if none found
 */
export function getCueForPersonality(
  personality: Personality,
  context: CueContext,
  tier: number = 1
): PersonalityCue | null {
  const cues = personality.cues[context];
  if (!cues || cues.length === 0) return null;

  // Filter by tier
  const matching = cues.filter(cue => {
    if (cue.minTier !== undefined && tier < cue.minTier) return false;
    if (cue.maxTier !== undefined && tier > cue.maxTier) return false;
    return true;
  });

  if (matching.length === 0) return null;

  // Return random matching cue
  return matching[Math.floor(Math.random() * matching.length)];
}

// ============================================================================
// PERSONALITY DEFINITIONS
// ============================================================================

/**
 * Classic Motivator Personality
 *
 * Traditional, encouraging gym buddy. Positive, straightforward motivation.
 */
const CLASSIC_MOTIVATOR: Personality = {
  id: 'classic',
  name: 'Classic Motivator',
  description: 'Your reliable gym buddy. Straightforward encouragement when you need it most.',
  emoji: '💪',
  color: '#3b82f6',
  tone: ['encouraging', 'positive', 'straightforward'],
  cues: {
    pr_weight: [
      { message: 'New weight PR! You did it!', intensity: 'high', minTier: 1, maxTier: 2 },
      { message: 'Big PR today! Great work!', intensity: 'high', minTier: 3, maxTier: 4 },
      { message: 'Heavier than ever! Keep climbing!', intensity: 'med' },
      { message: 'That\'s what I\'m talking about!', intensity: 'high' },
      { message: 'New bracket unlocked. Nice!', intensity: 'med' },
    ],
    pr_rep: [
      { message: 'Rep PR! More reps!', intensity: 'high' },
      { message: 'Volume PR! Building that engine!', intensity: 'med' },
      { message: 'More reps at this weight. Solid work!', intensity: 'low' },
      { message: 'Endurance is looking good!', intensity: 'med' },
    ],
    pr_e1rm: [
      { message: 'Strength is going up!', intensity: 'med' },
      { message: 'New e1RM! Progress!', intensity: 'high' },
      { message: 'Getting stronger every session.', intensity: 'low' },
      { message: 'Your ceiling just raised!', intensity: 'high' },
    ],
    pr_cardio: [
      { message: 'Did you just do cardio?', intensity: 'low' },
      { message: 'That\'s a lot of reps!', intensity: 'low' },
    ],
    rest_timer: [
      { message: 'Rest is done. Let\'s go!', intensity: 'low' },
      { message: 'Ready for the next set?', intensity: 'low' },
      { message: 'Back to work!', intensity: 'low' },
    ],
    streak: [
      { message: 'Streak is alive! Keep it going!', intensity: 'med' },
      { message: 'Consistency is key. Great work!', intensity: 'med' },
    ],
    rank_up: [
      { message: 'Ranked up! New level unlocked!', intensity: 'high' },
      { message: 'You\'re climbing the ladder!', intensity: 'high' },
    ],
    fallback: [
      { message: 'Strong set!', intensity: 'low' },
      { message: 'Keep it up!', intensity: 'low' },
      { message: 'Nice work!', intensity: 'low' },
      { message: 'You\'ve got this!', intensity: 'low' },
      { message: 'Stay focused!', intensity: 'low' },
    ],
    workout_start: [
      { message: 'Let\'s get to work!', intensity: 'low' },
      { message: 'Time to lift!', intensity: 'low' },
    ],
    workout_end: [
      { message: 'Great workout today!', intensity: 'med' },
      { message: 'Session complete. Good work!', intensity: 'med' },
    ],
    anomaly: [
      { message: 'That\'s... a huge jump. Did you record that?', intensity: 'med' },
      { message: 'Impressive if true. Make sure it\'s accurate!', intensity: 'med' },
    ],
  },
};

/**
 * Hype Beast Personality
 *
 * High energy, slang-heavy, very enthusiastic. Gen Z fitness culture vibes.
 */
const HYPE_BEAST: Personality = {
  id: 'hype',
  name: 'Hype Beast',
  description: 'Maximum energy, zero chill. Let\'s freakin\' GOOOO!',
  emoji: '🔥',
  color: '#ef4444',
  tone: ['energetic', 'slang', 'hype'],
  cues: {
    pr_weight: [
      { message: 'SHEEEESH! New weight PR!', intensity: 'epic' },
      { message: 'LET\'S GOOOO! Heavy day!', intensity: 'epic' },
      { message: 'That\'s WHEY light now! 💪', intensity: 'high' },
      { message: 'New bracket unlocked! We eating good!', intensity: 'high' },
      { message: 'ABSOLUTELY GEARED!', intensity: 'epic', minTier: 3 },
    ],
    pr_rep: [
      { message: 'REP CITY! Let\'s gooo!', intensity: 'high' },
      { message: 'Volume KING right here!', intensity: 'high' },
      { message: 'Those reps? Clean. 💯', intensity: 'med' },
      { message: 'Endurance beast mode unlocked!', intensity: 'high' },
    ],
    pr_e1rm: [
      { message: 'GAINS TRAIN HAS NO BRAKES!', intensity: 'high' },
      { message: 'Strength go brrrr! 📈', intensity: 'high' },
      { message: 'New ceiling! We UP there!', intensity: 'high' },
    ],
    pr_cardio: [
      { message: 'Bro really did cardio 💀', intensity: 'low' },
      { message: 'That\'s... a lot of reps. Cardio king?', intensity: 'low' },
    ],
    rest_timer: [
      { message: 'Rest over. Back to the GRIND!', intensity: 'low' },
      { message: 'Let\'s get back after it!', intensity: 'low' },
    ],
    streak: [
      { message: 'STREAK IS ALIVE! No days off! 🔥', intensity: 'high' },
      { message: 'Consistency GAINS! Keep it going!', intensity: 'high' },
    ],
    rank_up: [
      { message: 'RANKED TF UP! New level baby!', intensity: 'epic' },
      { message: 'CLIMBING THE LADDER! We moving up!', intensity: 'epic' },
    ],
    fallback: [
      { message: 'Let\'s freakin\' go!', intensity: 'low' },
      { message: 'Keep that energy UP!', intensity: 'low' },
      { message: 'You\'re cooking! 🍳', intensity: 'low' },
      { message: 'Grind don\'t stop!', intensity: 'low' },
      { message: 'Built different!', intensity: 'low' },
    ],
    workout_start: [
      { message: 'TIME TO PUT IN WORK! Let\'s goooo!', intensity: 'med' },
      { message: 'GAINS MODE ACTIVATED! 💪', intensity: 'med' },
    ],
    workout_end: [
      { message: 'MISSION ACCOMPLISHED! Killed it today!', intensity: 'high' },
      { message: 'Another one in the books! 💯', intensity: 'high' },
    ],
    anomaly: [
      { message: 'Ayo... that\'s suspicious 🤨 You good?', intensity: 'med' },
      { message: 'DAAAAMN! That jump is INSANE (if true lol)', intensity: 'med' },
    ],
  },
};

/**
 * Zen Coach Personality
 *
 * Calm, focused, philosophical. Martial arts instructor vibes.
 */
const ZEN_COACH: Personality = {
  id: 'zen',
  name: 'Zen Coach',
  description: 'Calm, focused guidance. Strength through stillness.',
  emoji: '🧘',
  color: '#10b981',
  tone: ['calm', 'philosophical', 'focused'],
  cues: {
    pr_weight: [
      { message: 'Strength flows through you.', intensity: 'med' },
      { message: 'You have unlocked a new level.', intensity: 'high' },
      { message: 'The path to strength continues upward.', intensity: 'med' },
      { message: 'Progress, not perfection.', intensity: 'low' },
    ],
    pr_rep: [
      { message: 'Endurance is the foundation.', intensity: 'med' },
      { message: 'You are building capacity.', intensity: 'med' },
      { message: 'Consistency breeds growth.', intensity: 'low' },
    ],
    pr_e1rm: [
      { message: 'Your potential expands.', intensity: 'med' },
      { message: 'The ceiling rises with you.', intensity: 'high' },
      { message: 'Growth is a journey.', intensity: 'low' },
    ],
    pr_cardio: [
      { message: 'Even the mountain breeze must pause.', intensity: 'low' },
      { message: 'Balance in all things.', intensity: 'low' },
    ],
    rest_timer: [
      { message: 'Return to the present moment.', intensity: 'low' },
      { message: 'Breathe. Focus. Begin.', intensity: 'low' },
    ],
    streak: [
      { message: 'The path continues. Stay steady.', intensity: 'med' },
      { message: 'Consistency is the way.', intensity: 'med' },
    ],
    rank_up: [
      { message: 'You ascend to new heights.', intensity: 'high' },
      { message: 'The mountain reveals new peaks.', intensity: 'high' },
    ],
    fallback: [
      { message: 'Be present.', intensity: 'low' },
      { message: 'Focus your energy.', intensity: 'low' },
      { message: 'Strong form.', intensity: 'low' },
      { message: 'The body follows the mind.', intensity: 'low' },
      { message: 'One rep at a time.', intensity: 'low' },
    ],
    workout_start: [
      { message: 'Begin with intention.', intensity: 'low' },
      { message: 'The journey starts now.', intensity: 'low' },
    ],
    workout_end: [
      { message: 'Honor the work you have done.', intensity: 'med' },
      { message: 'Rest well. Tomorrow is another day.', intensity: 'med' },
    ],
    anomaly: [
      { message: 'The river does not jump. Stay truthful.', intensity: 'med' },
      { message: 'Sudden growth is rare. Verify your path.', intensity: 'med' },
    ],
  },
};

/**
 * Sci-Fi Android Personality
 *
 * Robotic, analytical, slightly ominous. Like a training AI from the future.
 */
const SCI_FI_ANDROID: Personality = {
  id: 'android',
  name: 'Training Android',
  description: 'Analytical, precise, slightly ominous. Your strength metrics are improving.',
  emoji: '🤖',
  color: '#8b5cf6',
  tone: ['robotic', 'analytical', 'precise'],
  cues: {
    pr_weight: [
      { message: 'Strength metrics updated. New ceiling detected.', intensity: 'high' },
      { message: 'Weight threshold exceeded. Upgrading parameters.', intensity: 'high' },
      { message: 'Analysis: Significant force increase detected.', intensity: 'med' },
      { message: 'Power output optimal. Recommend continuation.', intensity: 'med' },
    ],
    pr_rep: [
      { message: 'Volume capacity expanded.', intensity: 'med' },
      { message: 'Endurance metrics improving.', intensity: 'med' },
      { message: 'Rep count exceeded. Analysis: favorable.', intensity: 'low' },
    ],
    pr_e1rm: [
      { message: 'Estimated maximum recalculated. Upgrade complete.', intensity: 'high' },
      { message: 'Strength projection updated. Trajectory: optimal.', intensity: 'high' },
      { message: 'Force generation efficiency increased.', intensity: 'med' },
    ],
    pr_cardio: [
      { message: 'Cardiovascular episode detected. Unusual for this unit.', intensity: 'low' },
      { message: 'High-rep threshold exceeded. Analysis: cardio detected.', intensity: 'low' },
    ],
    rest_timer: [
      { message: 'Recovery cycle complete. Resume training protocol.', intensity: 'low' },
      { message: 'Optimal rest period concluded.', intensity: 'low' },
    ],
    streak: [
      { message: 'Consistency algorithm: optimal.', intensity: 'med' },
      { message: 'Training streak maintained. Efficiency: high.', intensity: 'med' },
    ],
    rank_up: [
      { message: 'Rank status elevated. Access to new tier granted.', intensity: 'high' },
      { message: 'Level up sequence initiated.', intensity: 'high' },
    ],
    fallback: [
      { message: 'Form analysis: acceptable.', intensity: 'low' },
      { message: 'Rep execution: satisfactory.', intensity: 'low' },
      { message: 'Force output: within parameters.', intensity: 'low' },
      { message: 'Training continues.', intensity: 'low' },
      { message: 'Protocol active.', intensity: 'low' },
    ],
    workout_start: [
      { message: 'Training sequence initiated.', intensity: 'low' },
      { message: 'Workout protocol loading...', intensity: 'low' },
    ],
    workout_end: [
      { message: 'Training cycle complete. Data logged.', intensity: 'med' },
      { message: 'Session concluded. Recovery recommended.', intensity: 'med' },
    ],
    anomaly: [
      { message: 'Warning: Statistical anomaly detected. Verification required.', intensity: 'med' },
      { message: 'Analysis: Probability of this jump is low. Please confirm.', intensity: 'med' },
    ],
  },
};

/**
 * Old School Lifter Personality
 *
 * No-nonsense, old-school gym veteran. Tough love, raw motivation.
 */
const OLD_SCHOOL: Personality = {
  id: 'oldschool',
  name: 'Old School Lifter',
  description: 'No-nonsense motivation from a gym veteran. Put some weight on the bar.',
  emoji: '🏋️',
  color: '#f59e0b',
  tone: ['tough', 'no-nonsense', 'experienced'],
  cues: {
    pr_weight: [
      { message: 'Now THAT\'S lifting. Good work.', intensity: 'high' },
      { message: 'Finally. Real weight on the bar.', intensity: 'high' },
      { message: 'You earned that one. Keep it up.', intensity: 'med' },
      { message: 'About time you hit that number.', intensity: 'med' },
    ],
    pr_rep: [
      { message: 'More reps. That\'s how you build.', intensity: 'med' },
      { message: 'Volume PR. Now don\'t get cocky.', intensity: 'med' },
      { message: 'Good reps. Keep grinding.', intensity: 'low' },
    ],
    pr_e1rm: [
      { message: 'Strength is building. Finally.', intensity: 'med' },
      { message: 'Your ceiling went up. Keep climbing.', intensity: 'high' },
      { message: 'Real progress. No shortcuts.', intensity: 'med' },
    ],
    pr_cardio: [
      { message: 'Did you just do cardio? In my gym?', intensity: 'low' },
      { message: 'That\'s too many reps. Lift heavier.', intensity: 'low' },
    ],
    rest_timer: [
      { message: 'Rest\'s over. Get back under the bar.', intensity: 'low' },
      { message: 'Quit yapping. Time for your next set.', intensity: 'low' },
    ],
    streak: [
      { message: 'Showing up is half the battle. Keep it up.', intensity: 'med' },
      { message: 'Consistency. That\'s how champions are made.', intensity: 'med' },
    ],
    rank_up: [
      { message: 'Ranked up. You earned it.', intensity: 'high' },
      { message: 'Another rung on the ladder. Keep climbing.', intensity: 'high' },
    ],
    fallback: [
      { message: 'Grind through it.', intensity: 'low' },
      { message: 'Keep your head down.', intensity: 'low' },
      { message: 'Put in the work.', intensity: 'low' },
      { message: 'Stay focused.', intensity: 'low' },
      { message: 'One rep at a time.', intensity: 'low' },
    ],
    workout_start: [
      { message: 'Time to earn it. Let\'s go.', intensity: 'low' },
      { message: 'Get your head right. Work starts now.', intensity: 'low' },
    ],
    workout_end: [
      { message: 'Work done. Now recover.', intensity: 'med' },
      { message: 'Decent session. See you tomorrow.', intensity: 'med' },
    ],
    anomaly: [
      { message: 'That jump... you sure about that numbers?', intensity: 'med' },
      { message: 'Don\'t fool yourself. Accuracy matters.', intensity: 'med' },
    ],
  },
};

// All personalities (in order of display)
export const PERSONALITIES: Personality[] = [
  CLASSIC_MOTIVATOR,
  HYPE_BEAST,
  ZEN_COACH,
  SCI_FI_ANDROID,
  OLD_SCHOOL,
];

// Default personality
export const DEFAULT_PERSONALITY_ID = 'classic';

/**
 * Map PR type to cue context
 */
export function prTypeToContext(prType: PRType): CueContext {
  switch (prType) {
    case 'weight':
      return 'pr_weight';
    case 'rep':
      return 'pr_rep';
    case 'e1rm':
      return 'pr_e1rm';
    case 'cardio':
      return 'pr_cardio';
    default:
      return 'fallback';
  }
}

/**
 * Map tier to intensity level
 */
export function tierToIntensity(tier: number): CueIntensity {
  if (tier >= 4) return 'epic';
  if (tier >= 3) return 'high';
  if (tier >= 2) return 'med';
  return 'low';
}
