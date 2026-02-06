// src/lib/dayLog/types.ts
// Type definitions for the Day Log system - captures pre-workout physical/mental state

/**
 * Hydration level (1-5 scale)
 * 1 = Very dehydrated, 5 = Well hydrated
 */
export type HydrationLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Energy level (1-5 scale)
 * 1 = Very low energy, 5 = High energy
 */
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Sleep quality (1-5 scale)
 * 1 = Very poor sleep, 5 = Excellent sleep
 */
export type SleepQuality = 1 | 2 | 3 | 4 | 5;

/**
 * Nutrition status - how much you've eaten before the workout
 */
export type NutritionStatus = 'none' | 'light' | 'moderate' | 'full';

/**
 * Carbs level - carbohydrate intake before workout
 */
export type CarbsLevel = 'low' | 'moderate' | 'high';

/**
 * Mood state - mental/emotional state before workout
 */
export type MoodState = 'stressed' | 'neutral' | 'focused' | 'motivated';

/**
 * Pain locations for tracking discomfort/injuries
 * Expanded to include more body areas
 */
export type PainLocation =
  | 'shoulders'     // Combined (most common reporting)
  | 'elbows'        // Combined
  | 'wrists'        // Combined
  | 'knees'         // Combined
  | 'lower_back'
  | 'upper_back'
  | 'neck'
  | 'hips';

/**
 * Human-readable labels for pain locations
 */
export const PAIN_LOCATION_LABELS: Record<PainLocation, string> = {
  shoulders: 'Shoulders',
  elbows: 'Elbows',
  wrists: 'Wrists',
  knees: 'Knees',
  lower_back: 'Lower Back',
  upper_back: 'Upper Back',
  neck: 'Neck',
  hips: 'Hips',
};

/**
 * All available pain locations (ordered by frequency of common gym injuries)
 */
export const ALL_PAIN_LOCATIONS: PainLocation[] = [
  'shoulders',
  'lower_back',
  'knees',
  'elbows',
  'wrists',
  'upper_back',
  'neck',
  'hips',
];

/**
 * Full Day Log entry - captures pre-workout state
 */
export type DayLog = {
  id: string;
  sessionId: string;
  userId: string;
  createdAt: number; // timestamp in ms
  hydration: HydrationLevel;
  nutrition: NutritionStatus;
  carbsLevel: CarbsLevel;
  hasPain: boolean;
  painLocations?: PainLocation[];
  energyLevel: EnergyLevel;
  sleepQuality: SleepQuality;
  mood?: MoodState; // Mental/emotional state
  notes?: string;
};

/**
 * Draft Day Log - partial data before saving
 * Used for the input form state
 */
export type DayLogDraft = Partial<
  Omit<DayLog, 'id' | 'sessionId' | 'userId' | 'createdAt'>
>;

/**
 * Default values for a new Day Log draft
 */
export const DEFAULT_DAY_LOG_DRAFT: DayLogDraft = {
  hydration: 3,
  nutrition: 'moderate',
  carbsLevel: 'moderate',
  hasPain: false,
  painLocations: [],
  energyLevel: 3,
  sleepQuality: 3,
  mood: 'neutral',
  notes: '',
};

/**
 * Check if a DayLogDraft has required fields filled
 */
export function isDayLogDraftValid(draft: DayLogDraft): boolean {
  return (
    draft.hydration !== undefined &&
    draft.nutrition !== undefined &&
    draft.carbsLevel !== undefined &&
    draft.hasPain !== undefined &&
    draft.energyLevel !== undefined &&
    draft.sleepQuality !== undefined
  );
}
