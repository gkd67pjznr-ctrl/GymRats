// src/lib/bodyModel/bodyModelTypes.ts
// Type definitions for the body model analytics system

import type { MuscleGroup } from '@/src/data/exerciseTypes';

/**
 * Time period for filtering workout data
 */
export type TimePeriod = 'week' | 'month' | '3months' | 'year' | 'all';

/**
 * Movement pattern categories
 */
export type MovementPattern = 'push' | 'pull' | 'legs' | 'core';

/**
 * Body side categories
 */
export type BodySide = 'front' | 'back';

/**
 * Body region categories
 */
export type BodyRegion = 'upper' | 'lower' | 'core';

/**
 * Muscle group classification by movement pattern
 */
export const MUSCLE_MOVEMENT_PATTERNS: Record<MuscleGroup, MovementPattern> = {
  // Push muscles
  'chest': 'push',
  'shoulders': 'push',
  'triceps': 'push',

  // Pull muscles
  'lats': 'pull',
  'middle back': 'pull',
  'biceps': 'pull',
  'forearms': 'pull',
  'traps': 'pull',

  // Leg muscles
  'quadriceps': 'legs',
  'hamstrings': 'legs',
  'glutes': 'legs',
  'calves': 'legs',
  'adductors': 'legs',
  'abductors': 'legs',

  // Core muscles
  'abdominals': 'core',
  'lower back': 'core',
  'neck': 'core',
};

/**
 * Muscle group classification by body side
 */
export const MUSCLE_BODY_SIDES: Record<MuscleGroup, BodySide> = {
  // Front muscles
  'chest': 'front',
  'shoulders': 'front', // Mixed, but primarily front-visible
  'biceps': 'front',
  'forearms': 'front',
  'abdominals': 'front',
  'quadriceps': 'front',
  'adductors': 'front',

  // Back muscles
  'lats': 'back',
  'middle back': 'back',
  'lower back': 'back',
  'traps': 'back',
  'triceps': 'back',
  'hamstrings': 'back',
  'glutes': 'back',
  'calves': 'back',
  'abductors': 'back',
  'neck': 'back',
};

/**
 * Muscle group classification by body region
 */
export const MUSCLE_BODY_REGIONS: Record<MuscleGroup, BodyRegion> = {
  // Upper body
  'chest': 'upper',
  'shoulders': 'upper',
  'biceps': 'upper',
  'triceps': 'upper',
  'forearms': 'upper',
  'lats': 'upper',
  'middle back': 'upper',
  'traps': 'upper',
  'neck': 'upper',

  // Core
  'abdominals': 'core',
  'lower back': 'core',

  // Lower body
  'quadriceps': 'lower',
  'hamstrings': 'lower',
  'glutes': 'lower',
  'calves': 'lower',
  'adductors': 'lower',
  'abductors': 'lower',
};

/**
 * Optimal push/pull volume ratio (1:1 is ideal)
 */
export const OPTIMAL_PUSH_PULL_RATIO = 1.0;

/**
 * Optimal front/back volume ratio (slightly back-dominant is healthy)
 */
export const OPTIMAL_FRONT_BACK_RATIO = 0.9;

/**
 * Optimal upper/lower volume ratio (depends on goals, default balanced)
 */
export const OPTIMAL_UPPER_LOWER_RATIO = 1.0;

/**
 * Balance assessment result
 */
export interface BalanceAssessment {
  /** The ratio being assessed (e.g., push:pull) */
  name: string;
  /** Current ratio value */
  ratio: number;
  /** Optimal ratio for comparison */
  optimalRatio: number;
  /** Status: 'balanced' | 'dominant_first' | 'dominant_second' */
  status: 'balanced' | 'dominant_first' | 'dominant_second';
  /** Percentage deviation from optimal */
  deviationPercent: number;
  /** Description of the imbalance */
  description: string;
  /** Recommendation to fix imbalance */
  recommendation: string;
}

/**
 * Volume data point for trends
 */
export interface VolumeDataPoint {
  /** Timestamp in ms */
  dateMs: number;
  /** Volume in kg */
  volumeKg: number;
  /** Number of sets */
  sets: number;
}

/**
 * Muscle detail data
 */
export interface MuscleDetail {
  /** Muscle group ID */
  muscleGroup: MuscleGroup;
  /** Display name */
  name: string;
  /** Total volume in the time period */
  totalVolumeKg: number;
  /** Total sets in the time period */
  totalSets: number;
  /** Number of workout sessions targeting this muscle */
  sessionCount: number;
  /** Volume trend data points */
  volumeTrend: VolumeDataPoint[];
  /** Top exercises by volume */
  topExercises: Array<{
    exerciseId: string;
    exerciseName: string;
    volumeKg: number;
    sets: number;
  }>;
  /** Percentage of total training volume */
  volumePercentage: number;
  /** Normalized intensity (0-1 scale) */
  normalizedIntensity: number;
  /** Days since last trained */
  daysSinceLastTrained: number | null;
  /** Movement pattern */
  movementPattern: MovementPattern;
  /** Body side */
  bodySide: BodySide;
  /** Body region */
  bodyRegion: BodyRegion;
}

/**
 * Undertrained muscle assessment
 */
export interface UndertrainedAssessment {
  /** Muscle group */
  muscleGroup: MuscleGroup;
  /** Severity: 'mild' | 'moderate' | 'severe' */
  severity: 'mild' | 'moderate' | 'severe';
  /** Days since last trained */
  daysSinceLastTrained: number | null;
  /** Volume relative to average (0-1) */
  relativeVolume: number;
  /** Reason for flagging */
  reason: string;
  /** Recommended exercises to target this muscle */
  recommendedExercises: Array<{
    exerciseId: string;
    exerciseName: string;
    isPrimary: boolean;
  }>;
}

/**
 * Full body analysis result
 */
export interface BodyAnalysis {
  /** Time period analyzed */
  timePeriod: TimePeriod;
  /** Start date of analysis */
  startDateMs: number;
  /** End date of analysis */
  endDateMs: number;
  /** Total volume across all muscles */
  totalVolumeKg: number;
  /** Total sets across all muscles */
  totalSets: number;
  /** Total workout sessions */
  sessionCount: number;
  /** Volume by muscle group */
  muscleVolumes: Record<MuscleGroup, number>;
  /** Balance assessments */
  balanceAssessments: BalanceAssessment[];
  /** Undertrained muscles */
  undertrainedMuscles: UndertrainedAssessment[];
  /** Top 5 most trained muscles */
  topTrainedMuscles: Array<{ muscle: MuscleGroup; volume: number }>;
  /** Bottom 5 least trained muscles */
  leastTrainedMuscles: Array<{ muscle: MuscleGroup; volume: number }>;
}

/**
 * Compact body model data for social posts
 */
export interface CompactBodyData {
  /** Normalized volumes (0-1) for visualization */
  muscleIntensities: Record<string, number>;
  /** Total volume formatted */
  totalVolumeFormatted: string;
  /** Primary muscles worked (top 3) */
  primaryMuscles: string[];
  /** Session duration */
  durationMin: number;
  /** Number of exercises */
  exerciseCount: number;
}
