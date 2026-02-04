// src/lib/hooks/useBodyModelAnalytics.ts
// React hook for body model analytics

import { useMemo } from 'react';
import type { MuscleGroup } from '@/src/data/exerciseTypes';
import { useWorkoutSessions } from '../stores/workoutStore';
import { calculateVolumeForSessions, calculateNormalizedVolumes } from '../volumeCalculator';
import {
  type TimePeriod,
  type MuscleDetail,
  type BalanceAssessment,
  type UndertrainedAssessment,
  type BodyAnalysis,
} from '../bodyModel/bodyModelTypes';
import {
  calculateAllBalanceAssessments,
  calculateOverallBalanceScore,
  getBalanceStatusLabel,
  getBalanceStatusColor,
} from '../bodyModel/balanceCalculator';
import {
  filterSessionsByPeriod,
  getMuscleDetail,
  getAllMuscleDetails,
  getMusclesByTrainingPriority,
} from '../bodyModel/muscleDetailService';
import {
  detectUndertrainedMuscles,
  generateBodyAnalysis,
  calculateTrainingQualityScore,
  getQualityScoreLabel,
  getTrainingRecommendations,
} from '../bodyModel/undertrainedDetector';

/**
 * Hook result interface
 */
export interface BodyModelAnalyticsResult {
  // Volume data
  muscleVolumes: Record<MuscleGroup, number>;
  normalizedVolumes: Record<MuscleGroup, number>;
  totalVolumeKg: number;

  // Balance data
  balanceAssessments: BalanceAssessment[];
  overallBalanceScore: number;
  balanceStatusLabel: string;
  balanceStatusColor: string;

  // Undertrained data
  undertrainedMuscles: UndertrainedAssessment[];

  // Training priority
  musclesByPriority: Array<{
    muscle: MuscleGroup;
    priority: 'high' | 'medium' | 'low';
    daysSinceLastTrained: number | null;
  }>;

  // Quality metrics
  trainingQualityScore: number;
  qualityScoreLabel: string;
  recommendations: string[];

  // Helpers
  getMuscleDetail: (muscle: MuscleGroup) => MuscleDetail;
  getFullAnalysis: () => BodyAnalysis;
}

/**
 * Hook for accessing body model analytics
 */
export function useBodyModelAnalytics(
  timePeriod: TimePeriod = 'month'
): BodyModelAnalyticsResult {
  const sessions = useWorkoutSessions();

  return useMemo(() => {
    const filteredSessions = filterSessionsByPeriod(sessions, timePeriod);
    const volumeResult = calculateVolumeForSessions(filteredSessions);

    // Volume data
    const muscleVolumes = volumeResult.volumeByMuscleGroup as Record<MuscleGroup, number>;
    const normalizedVolumes = calculateNormalizedVolumes(volumeResult);
    const totalVolumeKg = volumeResult.totalVolumeKg;

    // Balance data
    const balanceAssessments = calculateAllBalanceAssessments(volumeResult);
    const overallBalanceScore = calculateOverallBalanceScore(volumeResult);
    const balanceStatusLabel = getBalanceStatusLabel(overallBalanceScore);
    const balanceStatusColor = getBalanceStatusColor(overallBalanceScore);

    // Undertrained data
    const undertrainedMuscles = detectUndertrainedMuscles(sessions, timePeriod);

    // Training priority
    const musclesByPriority = getMusclesByTrainingPriority(sessions, timePeriod);

    // Quality metrics
    const analysis = generateBodyAnalysis(sessions, timePeriod);
    const trainingQualityScore = calculateTrainingQualityScore(analysis);
    const qualityScoreLabel = getQualityScoreLabel(trainingQualityScore);
    const recommendations = getTrainingRecommendations(analysis);

    // Helpers
    const getMuscleDetailFn = (muscle: MuscleGroup): MuscleDetail => {
      return getMuscleDetail(sessions, muscle, timePeriod);
    };

    const getFullAnalysis = (): BodyAnalysis => {
      return generateBodyAnalysis(sessions, timePeriod);
    };

    return {
      muscleVolumes,
      normalizedVolumes,
      totalVolumeKg,
      balanceAssessments,
      overallBalanceScore,
      balanceStatusLabel,
      balanceStatusColor,
      undertrainedMuscles,
      musclesByPriority,
      trainingQualityScore,
      qualityScoreLabel,
      recommendations,
      getMuscleDetail: getMuscleDetailFn,
      getFullAnalysis,
    };
  }, [sessions, timePeriod]);
}

/**
 * Simplified hook for just muscle volumes (for body model visualization)
 */
export function useMuscleVolumes(timePeriod: TimePeriod = 'month'): Record<string, number> {
  const sessions = useWorkoutSessions();

  return useMemo(() => {
    const filteredSessions = filterSessionsByPeriod(sessions, timePeriod);
    const volumeResult = calculateVolumeForSessions(filteredSessions);
    return calculateNormalizedVolumes(volumeResult);
  }, [sessions, timePeriod]);
}

/**
 * Hook for balance score only
 */
export function useBalanceScore(timePeriod: TimePeriod = 'month'): {
  score: number;
  label: string;
  color: string;
} {
  const sessions = useWorkoutSessions();

  return useMemo(() => {
    const filteredSessions = filterSessionsByPeriod(sessions, timePeriod);
    const volumeResult = calculateVolumeForSessions(filteredSessions);
    const score = calculateOverallBalanceScore(volumeResult);

    return {
      score,
      label: getBalanceStatusLabel(score),
      color: getBalanceStatusColor(score),
    };
  }, [sessions, timePeriod]);
}

/**
 * Hook for undertrained muscles only
 */
export function useUndertrainedMuscles(
  timePeriod: TimePeriod = 'month'
): UndertrainedAssessment[] {
  const sessions = useWorkoutSessions();

  return useMemo(() => {
    return detectUndertrainedMuscles(sessions, timePeriod);
  }, [sessions, timePeriod]);
}

/**
 * Hook for training quality score
 */
export function useTrainingQuality(timePeriod: TimePeriod = 'month'): {
  score: number;
  label: string;
  recommendations: string[];
} {
  const sessions = useWorkoutSessions();

  return useMemo(() => {
    const analysis = generateBodyAnalysis(sessions, timePeriod);
    const score = calculateTrainingQualityScore(analysis);

    return {
      score,
      label: getQualityScoreLabel(score),
      recommendations: getTrainingRecommendations(analysis),
    };
  }, [sessions, timePeriod]);
}
