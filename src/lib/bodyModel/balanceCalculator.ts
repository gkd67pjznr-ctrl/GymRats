// src/lib/bodyModel/balanceCalculator.ts
// Calculate muscle balance ratios and identify imbalances

import type { MuscleGroup } from '@/src/data/exerciseTypes';
import type { VolumeResult } from '../volumeCalculator';
import {
  type BalanceAssessment,
  type MovementPattern,
  type BodySide,
  type BodyRegion,
  MUSCLE_MOVEMENT_PATTERNS,
  MUSCLE_BODY_SIDES,
  MUSCLE_BODY_REGIONS,
  OPTIMAL_PUSH_PULL_RATIO,
  OPTIMAL_FRONT_BACK_RATIO,
  OPTIMAL_UPPER_LOWER_RATIO,
} from './bodyModelTypes';

/**
 * Tolerance for balance ratios (within 20% is considered balanced)
 */
const BALANCE_TOLERANCE = 0.2;

/**
 * Calculate volume by movement pattern
 */
export function calculateVolumeByMovementPattern(
  volumeResult: VolumeResult
): Record<MovementPattern, number> {
  const patternVolumes: Record<MovementPattern, number> = {
    push: 0,
    pull: 0,
    legs: 0,
    core: 0,
  };

  for (const [muscle, volume] of Object.entries(volumeResult.volumeByMuscleGroup)) {
    const pattern = MUSCLE_MOVEMENT_PATTERNS[muscle as MuscleGroup];
    if (pattern) {
      patternVolumes[pattern] += volume;
    }
  }

  return patternVolumes;
}

/**
 * Calculate volume by body side
 */
export function calculateVolumeByBodySide(
  volumeResult: VolumeResult
): Record<BodySide, number> {
  const sideVolumes: Record<BodySide, number> = {
    front: 0,
    back: 0,
  };

  for (const [muscle, volume] of Object.entries(volumeResult.volumeByMuscleGroup)) {
    const side = MUSCLE_BODY_SIDES[muscle as MuscleGroup];
    if (side) {
      sideVolumes[side] += volume;
    }
  }

  return sideVolumes;
}

/**
 * Calculate volume by body region
 */
export function calculateVolumeByBodyRegion(
  volumeResult: VolumeResult
): Record<BodyRegion, number> {
  const regionVolumes: Record<BodyRegion, number> = {
    upper: 0,
    lower: 0,
    core: 0,
  };

  for (const [muscle, volume] of Object.entries(volumeResult.volumeByMuscleGroup)) {
    const region = MUSCLE_BODY_REGIONS[muscle as MuscleGroup];
    if (region) {
      regionVolumes[region] += volume;
    }
  }

  return regionVolumes;
}

/**
 * Calculate a ratio with protection against division by zero
 */
function safeRatio(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return numerator > 0 ? Infinity : 0;
  }
  return numerator / denominator;
}

/**
 * Determine balance status based on ratio and optimal
 */
function determineBalanceStatus(
  ratio: number,
  optimalRatio: number
): 'balanced' | 'dominant_first' | 'dominant_second' {
  const deviation = Math.abs(ratio - optimalRatio) / optimalRatio;

  if (deviation <= BALANCE_TOLERANCE) {
    return 'balanced';
  }

  return ratio > optimalRatio ? 'dominant_first' : 'dominant_second';
}

/**
 * Calculate push/pull balance assessment
 */
export function calculatePushPullBalance(volumeResult: VolumeResult): BalanceAssessment {
  const patternVolumes = calculateVolumeByMovementPattern(volumeResult);
  const ratio = safeRatio(patternVolumes.push, patternVolumes.pull);
  const status = determineBalanceStatus(ratio, OPTIMAL_PUSH_PULL_RATIO);
  const deviationPercent = Math.abs(ratio - OPTIMAL_PUSH_PULL_RATIO) / OPTIMAL_PUSH_PULL_RATIO * 100;

  let description: string;
  let recommendation: string;

  if (status === 'balanced') {
    description = 'Your push and pull training is well balanced.';
    recommendation = 'Maintain your current training balance.';
  } else if (status === 'dominant_first') {
    description = `Push volume is ${deviationPercent.toFixed(0)}% higher than pull volume.`;
    recommendation = 'Add more pulling exercises: rows, pull-ups, face pulls, reverse flyes.';
  } else {
    description = `Pull volume is ${deviationPercent.toFixed(0)}% higher than push volume.`;
    recommendation = 'Add more pushing exercises: bench press, overhead press, dips, push-ups.';
  }

  return {
    name: 'Push / Pull',
    ratio,
    optimalRatio: OPTIMAL_PUSH_PULL_RATIO,
    status,
    deviationPercent,
    description,
    recommendation,
  };
}

/**
 * Calculate front/back balance assessment
 */
export function calculateFrontBackBalance(volumeResult: VolumeResult): BalanceAssessment {
  const sideVolumes = calculateVolumeByBodySide(volumeResult);
  const ratio = safeRatio(sideVolumes.front, sideVolumes.back);
  const status = determineBalanceStatus(ratio, OPTIMAL_FRONT_BACK_RATIO);
  const deviationPercent = Math.abs(ratio - OPTIMAL_FRONT_BACK_RATIO) / OPTIMAL_FRONT_BACK_RATIO * 100;

  let description: string;
  let recommendation: string;

  if (status === 'balanced') {
    description = 'Your anterior and posterior chain training is well balanced.';
    recommendation = 'Maintain your current training balance.';
  } else if (status === 'dominant_first') {
    description = `Front (anterior) volume is ${deviationPercent.toFixed(0)}% higher than back (posterior).`;
    recommendation = 'Focus on posterior chain: deadlifts, rows, hip hinges, reverse hypers.';
  } else {
    description = `Back (posterior) volume is ${deviationPercent.toFixed(0)}% higher than front (anterior).`;
    recommendation = 'Add more anterior work: squats, leg press, ab work, chest exercises.';
  }

  return {
    name: 'Front / Back',
    ratio,
    optimalRatio: OPTIMAL_FRONT_BACK_RATIO,
    status,
    deviationPercent,
    description,
    recommendation,
  };
}

/**
 * Calculate upper/lower balance assessment
 */
export function calculateUpperLowerBalance(volumeResult: VolumeResult): BalanceAssessment {
  const regionVolumes = calculateVolumeByBodyRegion(volumeResult);
  const upperVolume = regionVolumes.upper + (regionVolumes.core * 0.5); // Core contributes to both
  const lowerVolume = regionVolumes.lower + (regionVolumes.core * 0.5);
  const ratio = safeRatio(upperVolume, lowerVolume);
  const status = determineBalanceStatus(ratio, OPTIMAL_UPPER_LOWER_RATIO);
  const deviationPercent = Math.abs(ratio - OPTIMAL_UPPER_LOWER_RATIO) / OPTIMAL_UPPER_LOWER_RATIO * 100;

  let description: string;
  let recommendation: string;

  if (status === 'balanced') {
    description = 'Your upper and lower body training is well balanced.';
    recommendation = 'Maintain your current training balance.';
  } else if (status === 'dominant_first') {
    description = `Upper body volume is ${deviationPercent.toFixed(0)}% higher than lower body.`;
    recommendation = 'Add more leg work: squats, lunges, leg press, Romanian deadlifts, calf raises.';
  } else {
    description = `Lower body volume is ${deviationPercent.toFixed(0)}% higher than upper body.`;
    recommendation = 'Add more upper body work: pressing, pulling, shoulder work.';
  }

  return {
    name: 'Upper / Lower',
    ratio,
    optimalRatio: OPTIMAL_UPPER_LOWER_RATIO,
    status,
    deviationPercent,
    description,
    recommendation,
  };
}

/**
 * Calculate all balance assessments
 */
export function calculateAllBalanceAssessments(volumeResult: VolumeResult): BalanceAssessment[] {
  return [
    calculatePushPullBalance(volumeResult),
    calculateFrontBackBalance(volumeResult),
    calculateUpperLowerBalance(volumeResult),
  ];
}

/**
 * Get specific muscle group balance for antagonist pairs
 * Example: biceps vs triceps, quads vs hamstrings
 */
export function calculateAntagonistBalance(
  volumeResult: VolumeResult,
  muscleA: MuscleGroup,
  muscleB: MuscleGroup,
  optimalRatio: number = 1.0
): BalanceAssessment {
  const volumeA = volumeResult.volumeByMuscleGroup[muscleA] || 0;
  const volumeB = volumeResult.volumeByMuscleGroup[muscleB] || 0;
  const ratio = safeRatio(volumeA, volumeB);
  const status = determineBalanceStatus(ratio, optimalRatio);
  const deviationPercent = Math.abs(ratio - optimalRatio) / optimalRatio * 100;

  const nameA = muscleA.charAt(0).toUpperCase() + muscleA.slice(1);
  const nameB = muscleB.charAt(0).toUpperCase() + muscleB.slice(1);

  let description: string;
  let recommendation: string;

  if (status === 'balanced') {
    description = `Your ${nameA.toLowerCase()} and ${nameB.toLowerCase()} training is balanced.`;
    recommendation = 'Maintain your current training balance.';
  } else if (status === 'dominant_first') {
    description = `${nameA} volume is ${deviationPercent.toFixed(0)}% higher than ${nameB.toLowerCase()}.`;
    recommendation = `Add more ${nameB.toLowerCase()} exercises to balance this ratio.`;
  } else {
    description = `${nameB} volume is ${deviationPercent.toFixed(0)}% higher than ${nameA.toLowerCase()}.`;
    recommendation = `Add more ${nameA.toLowerCase()} exercises to balance this ratio.`;
  }

  return {
    name: `${nameA} / ${nameB}`,
    ratio,
    optimalRatio,
    status,
    deviationPercent,
    description,
    recommendation,
  };
}

/**
 * Common antagonist pairs to check
 */
export const ANTAGONIST_PAIRS: Array<{
  muscleA: MuscleGroup;
  muscleB: MuscleGroup;
  optimalRatio: number;
}> = [
  { muscleA: 'biceps', muscleB: 'triceps', optimalRatio: 0.67 }, // Triceps should be slightly stronger
  { muscleA: 'chest', muscleB: 'middle back', optimalRatio: 1.0 },
  { muscleA: 'quadriceps', muscleB: 'hamstrings', optimalRatio: 1.5 }, // Quads naturally stronger
  { muscleA: 'abdominals', muscleB: 'lower back', optimalRatio: 1.0 },
  { muscleA: 'shoulders', muscleB: 'lats', optimalRatio: 0.8 }, // Lats should be slightly dominant
];

/**
 * Calculate all antagonist balance assessments
 */
export function calculateAntagonistBalances(volumeResult: VolumeResult): BalanceAssessment[] {
  return ANTAGONIST_PAIRS.map(({ muscleA, muscleB, optimalRatio }) =>
    calculateAntagonistBalance(volumeResult, muscleA, muscleB, optimalRatio)
  );
}

/**
 * Get overall balance score (0-100)
 */
export function calculateOverallBalanceScore(volumeResult: VolumeResult): number {
  const assessments = calculateAllBalanceAssessments(volumeResult);

  // Calculate average deviation from optimal
  const avgDeviation =
    assessments.reduce((sum, a) => sum + a.deviationPercent, 0) / assessments.length;

  // Convert to score (100 = perfectly balanced, 0 = severely imbalanced)
  // Deviation of 50% = score of 50, etc.
  const score = Math.max(0, 100 - avgDeviation);

  return Math.round(score);
}

/**
 * Get balance status label
 */
export function getBalanceStatusLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Work';
  return 'Imbalanced';
}

/**
 * Get balance status color
 */
export function getBalanceStatusColor(score: number): string {
  if (score >= 90) return '#4CAF50'; // Green
  if (score >= 75) return '#8BC34A'; // Light green
  if (score >= 60) return '#FFC107'; // Amber
  if (score >= 40) return '#FF9800'; // Orange
  return '#F44336'; // Red
}
