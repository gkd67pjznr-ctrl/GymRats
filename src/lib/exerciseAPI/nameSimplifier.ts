/**
 * Exercise Name Simplifier
 * Removes verbose descriptors from exercise names for cleaner display
 *
 * Examples:
 * - "Barbell Bench Press - Medium Grip" → "Barbell Bench Press"
 * - "Dumbbell Shoulder Press - Neutral Grip" → "Dumbbell Shoulder Press"
 * - "Barbell Squat - Narrow Stance" → "Barbell Squat"
 */

/**
 * Grip variants to remove from exercise names
 */
const GRIP_VARIANTS = [
  'medium grip',
  'narrow grip',
  'wide grip',
  'neutral grip',
  'supinated grip',
  'pronated grip',
  'mixed grip',
  'reverse grip',
  'close grip',
  'shoulder width grip',
  'underhand grip',
  'overhand grip',
  'alternating grip',
  'parallel grip',
  'v bar grip',
];

/**
 * Stance variants to remove from exercise names
 */
const STANCE_VARIANTS = [
  'narrow stance',
  'wide stance',
  'shoulder width stance',
  'sumo stance',
  'conventional stance',
  'split stance',
  'single leg',
  'one leg',
  ' unilateral',
];

/**
 * Position variants to remove from exercise names
 */
const POSITION_VARIANTS = [
  'seated',
  'standing',
  'lying',
  'incline',
  'decline',
  'flat',
  'bent over',
  'upright',
  'leaning',
  'on knees',
];

/**
 * Other verbose descriptors to remove
 */
const OTHER_VARIANTS = [
  'with bands',
  'with chains',
  'with dumbbells',
  'with barbell',
  'with cable',
  'with ez bar',
  'with machine',
  'behind neck',
  'behind head',
  'to chest',
  'to chin',
  'to floor',
  'to hip',
  'to knees',
  'underhand',
  'overhand',
  'supinated',
  'pronated',
];

/**
 * All variants combined (ordered by specificity)
 */
const ALL_VARIANTS = [
  ...POSITION_VARIANTS,
  ...STANCE_VARIANTS,
  ...GRIP_VARIANTS,
  ...OTHER_VARIANTS,
];

/**
 * Main function: Simplify an exercise name by removing verbose descriptors
 */
export function simplifyExerciseName(originalName: string): {
  simplified: string;
  removed: string[];
} {
  let name = originalName.trim();
  const removed: string[] = [];

  // Check each variant
  for (const variant of ALL_VARIANTS) {
    // Case-insensitive check
    const regex = new RegExp(`\\s*[-–—]?\\s*${variant}\\s*`, 'gi');
    const match = name.match(regex);

    if (match) {
      removed.push(variant);
      name = name.replace(regex, match[0].includes(' - ') || match[0].includes(' -')
        ? ''  // Remove the separator too if present
        : ' '
      );
    }
  }

  // Clean up multiple spaces and trim
  name = name.replace(/\s+/g, ' ').trim();

  // Remove trailing separators
  name = name.replace(/[-–—]\s*$/, '').trim();

  return {
    simplified: name,
    removed,
  };
}

/**
 * Simplify exercise name to just the core name (string version)
 */
export function simplifyName(originalName: string): string {
  return simplifyExerciseName(originalName).simplified;
}

/**
 * Check if two exercise names are the same after simplification
 * Useful for detecting duplicates
 */
export function areSameExercise(name1: string, name2: string): boolean {
  const simplified1 = simplifyName(name1).toLowerCase();
  const simplified2 = simplifyName(name2).toLowerCase();
  return simplified1 === simplified2;
}

/**
 * Extract the core exercise pattern (for grouping similar exercises)
 * Examples: "Barbell Bench Press", "Dumbbell Shoulder Press"
 */
export function getExercisePattern(name: string): string {
  const { simplified } = simplifyExerciseName(name);

  // Remove equipment prefix to get the movement pattern
  const equipmentPrefixes = [
    'barbell',
    'dumbbell',
    'cable',
    'machine',
    'smith machine',
    'kettlebell',
    'ez barbell',
    'trap bar',
    'resistance band',
    'bodyweight',
  ];

  let pattern = simplified.toLowerCase();

  for (const prefix of equipmentPrefixes) {
    const regex = new RegExp(`^${prefix}\\s+`, 'i');
    pattern = pattern.replace(regex, '');
  }

  return pattern.trim();
}

/**
 * Categorize exercise by primary movement
 */
export function getMovementCategory(name: string): string {
  const simplified = simplifyName(name).toLowerCase();

  // Order matters! More specific keywords should come first
  const categories: Record<string, string[]> = {
    'squat': ['split squat', 'leg press', 'squat', 'lunge'],
    'hinge': ['good morning', 'hyperextension', 'romanian deadlift', 'rdl', 'deadlift'],
    'press': ['overhead press', 'overhead', 'shoulder press', 'extension', 'press'],
    'pull': ['lat pulldown', 'pulldown', 'bicep curl', 'tricep extension', 'row', 'curl', 'fly'],
    'carry': ['farmer carry', 'walk'],
    'core': ['abdominal', 'russian twist', 'rotation', 'twist', 'situp', 'plank', 'crunch'],
    'cardio': ['jump rope', 'jumprope', 'rope', 'row machine', 'running', 'cycling', 'sprint', 'ski', 'jump', 'run', 'bike', 'cycle'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    // Check both if simplified includes keyword OR if keyword includes simplified
    if (keywords.some(keyword =>
      simplified.includes(keyword) || keyword.includes(simplified)
    )) {
      return category;
    }
  }

  return 'other';
}
