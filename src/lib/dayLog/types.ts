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
 * Pain locations for tracking discomfort/injuries
 */
export type PainLocation =
  | 'shoulder_l'
  | 'shoulder_r'
  | 'elbow_l'
  | 'elbow_r'
  | 'wrist_l'
  | 'wrist_r'
  | 'lower_back'
  | 'knee_l'
  | 'knee_r';

/**
 * Human-readable labels for pain locations
 */
export const PAIN_LOCATION_LABELS: Record<PainLocation, string> = {
  shoulder_l: 'Left Shoulder',
  shoulder_r: 'Right Shoulder',
  elbow_l: 'Left Elbow',
  elbow_r: 'Right Elbow',
  wrist_l: 'Left Wrist',
  wrist_r: 'Right Wrist',
  lower_back: 'Lower Back',
  knee_l: 'Left Knee',
  knee_r: 'Right Knee',
};

/**
 * All available pain locations
 */
export const ALL_PAIN_LOCATIONS: PainLocation[] = [
  'shoulder_l',
  'shoulder_r',
  'elbow_l',
  'elbow_r',
  'wrist_l',
  'wrist_r',
  'lower_back',
  'knee_l',
  'knee_r',
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
