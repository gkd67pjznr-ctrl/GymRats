// src/lib/bodyModel/undertrainedDetector.ts
// Detect undertrained muscles and provide recommendations

import type { MuscleGroup } from '@/src/data/exerciseTypes';
import type { WorkoutSession } from '../workoutModel';
import { calculateVolumeForSessions } from '../volumeCalculator';
import {
  type UndertrainedAssessment,
  type BodyAnalysis,
  type TimePeriod,
} from './bodyModelTypes';
import {
  calculateAllBalanceAssessments,
  calculateOverallBalanceScore,
} from './balanceCalculator';
import {
  getAllMuscleDetails,
  filterSessionsByPeriod,
  getExercisesForMuscle,
  getDaysSinceLastTrained,
} from './muscleDetailService';

/**
 * Thresholds for undertraining detection
 */
const UNDERTRAINED_THRESHOLDS = {
  /** Days without training to be flagged */
  daysSinceTrained: {
    mild: 7,
    moderate: 14,
    severe: 21,
  },
  /** Volume relative to average (0-1) */
  relativeVolume: {
    mild: 0.3,    // Below 30% of average
    moderate: 0.15, // Below 15% of average
    severe: 0.05,   // Below 5% of average (basically not trained)
  },
};

/**
 * Detect undertrained muscles
 */
export function detectUndertrainedMuscles(
  sessions: WorkoutSession[],
  period: TimePeriod = 'month'
): UndertrainedAssessment[] {
  const filteredSessions = filterSessionsByPeriod(sessions, period);
  const volumeResult = calculateVolumeForSessions(filteredSessions);

  // Calculate average volume
  const volumes = Object.values(volumeResult.volumeByMuscleGroup);
  const avgVolume = volumes.length > 0
    ? volumes.reduce((sum, v) => sum + v, 0) / volumes.length
    : 0;

  const undertrainedMuscles: UndertrainedAssessment[] = [];

  const allMuscles: MuscleGroup[] = [
    'chest', 'shoulders', 'triceps', 'biceps', 'forearms',
    'lats', 'middle back', 'lower back', 'traps',
    'abdominals', 'quadriceps', 'hamstrings', 'glutes',
    'calves', 'adductors', 'abductors',
  ];

  for (const muscle of allMuscles) {
    const volume = volumeResult.volumeByMuscleGroup[muscle] || 0;
    const relativeVolume = avgVolume > 0 ? volume / avgVolume : 0;
    const daysSince = getDaysSinceLastTrained(sessions, muscle);

    // Determine severity
    let severity: 'mild' | 'moderate' | 'severe' | null = null;
    let reason = '';

    // Check by days since last trained
    if (daysSince !== null) {
      if (daysSince >= UNDERTRAINED_THRESHOLDS.daysSinceTrained.severe) {
        severity = 'severe';
        reason = `Not trained in ${daysSince} days`;
      } else if (daysSince >= UNDERTRAINED_THRESHOLDS.daysSinceTrained.moderate) {
        severity = severity === null ? 'moderate' : severity;
        reason = reason || `Not trained in ${daysSince} days`;
      } else if (daysSince >= UNDERTRAINED_THRESHOLDS.daysSinceTrained.mild) {
        severity = severity === null ? 'mild' : severity;
        reason = reason || `Not trained in ${daysSince} days`;
      }
    } else if (sessions.length > 0) {
      // Never trained but there are workout sessions
      severity = 'severe';
      reason = 'Never trained';
    }

    // Check by relative volume
    if (avgVolume > 0) {
      if (relativeVolume <= UNDERTRAINED_THRESHOLDS.relativeVolume.severe) {
        severity = 'severe';
        reason = reason || 'Significantly below average volume';
      } else if (relativeVolume <= UNDERTRAINED_THRESHOLDS.relativeVolume.moderate) {
        severity = severity === null || severity === 'mild' ? 'moderate' : severity;
        reason = reason || 'Below average volume';
      } else if (relativeVolume <= UNDERTRAINED_THRESHOLDS.relativeVolume.mild) {
        severity = severity === null ? 'mild' : severity;
        reason = reason || 'Slightly below average volume';
      }
    }

    // If flagged, add to list
    if (severity !== null) {
      undertrainedMuscles.push({
        muscleGroup: muscle,
        severity,
        daysSinceLastTrained: daysSince,
        relativeVolume,
        reason,
        recommendedExercises: getExercisesForMuscle(muscle).slice(0, 5),
      });
    }
  }

  // Sort by severity (severe first)
  const severityOrder = { severe: 0, moderate: 1, mild: 2 };
  return undertrainedMuscles.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

/**
 * Get overall undertrained count by severity
 */
export function getUndertrainedCounts(
  assessments: UndertrainedAssessment[]
): { severe: number; moderate: number; mild: number; total: number } {
  const counts = {
    severe: 0,
    moderate: 0,
    mild: 0,
    total: assessments.length,
  };

  for (const assessment of assessments) {
    counts[assessment.severity]++;
  }

  return counts;
}

/**
 * Generate full body analysis report
 */
export function generateBodyAnalysis(
  sessions: WorkoutSession[],
  period: TimePeriod = 'month'
): BodyAnalysis {
  const filteredSessions = filterSessionsByPeriod(sessions, period);
  const volumeResult = calculateVolumeForSessions(filteredSessions);
  const balanceAssessments = calculateAllBalanceAssessments(volumeResult);
  const undertrainedMuscles = detectUndertrainedMuscles(sessions, period);

  // Get time range
  const now = Date.now();
  const periodMs = period === 'week' ? 7 * 24 * 60 * 60 * 1000
    : period === 'month' ? 30 * 24 * 60 * 60 * 1000
    : period === '3months' ? 90 * 24 * 60 * 60 * 1000
    : period === 'year' ? 365 * 24 * 60 * 60 * 1000
    : null;

  const startDateMs = periodMs ? now - periodMs : (
    filteredSessions.length > 0
      ? Math.min(...filteredSessions.map(s => s.startedAtMs))
      : now
  );

  // Calculate total sets
  let totalSets = 0;
  for (const session of filteredSessions) {
    totalSets += session.sets.length;
  }

  // Get top and bottom trained muscles
  const muscleEntries = Object.entries(volumeResult.volumeByMuscleGroup)
    .map(([muscle, volume]) => ({ muscle: muscle as MuscleGroup, volume }))
    .sort((a, b) => b.volume - a.volume);

  const topTrainedMuscles = muscleEntries.slice(0, 5);
  const leastTrainedMuscles = muscleEntries.slice(-5).reverse();

  return {
    timePeriod: period,
    startDateMs,
    endDateMs: now,
    totalVolumeKg: volumeResult.totalVolumeKg,
    totalSets,
    sessionCount: filteredSessions.length,
    muscleVolumes: volumeResult.volumeByMuscleGroup as Record<MuscleGroup, number>,
    balanceAssessments,
    undertrainedMuscles,
    topTrainedMuscles,
    leastTrainedMuscles,
  };
}

/**
 * Get training recommendations based on analysis
 */
export function getTrainingRecommendations(
  analysis: BodyAnalysis
): string[] {
  const recommendations: string[] = [];

  // Add balance recommendations
  for (const assessment of analysis.balanceAssessments) {
    if (assessment.status !== 'balanced') {
      recommendations.push(assessment.recommendation);
    }
  }

  // Add undertrained muscle recommendations
  const severeMuscles = analysis.undertrainedMuscles.filter(m => m.severity === 'severe');
  if (severeMuscles.length > 0) {
    const muscleNames = severeMuscles.slice(0, 3).map(m => m.muscleGroup);
    recommendations.push(
      `Priority: Train ${muscleNames.join(', ')} - these muscles are significantly undertrained.`
    );
  }

  // Add general volume recommendations
  const avgDailyVolume = analysis.totalVolumeKg / (analysis.sessionCount || 1);
  if (avgDailyVolume < 5000) {
    recommendations.push('Consider increasing overall training volume for better results.');
  }

  // Add frequency recommendations
  const daysInPeriod = (analysis.endDateMs - analysis.startDateMs) / (24 * 60 * 60 * 1000);
  const frequency = analysis.sessionCount / Math.max(daysInPeriod / 7, 1);
  if (frequency < 3) {
    recommendations.push('Training 3-5 times per week is recommended for optimal progress.');
  }

  return recommendations;
}

/**
 * Get a summary score for training quality (0-100)
 */
export function calculateTrainingQualityScore(analysis: BodyAnalysis): number {
  // Components:
  // - Balance score (40% weight)
  // - Undertrained penalty (30% weight)
  // - Frequency score (30% weight)

  // Balance score
  const balanceScore = calculateOverallBalanceScore({
    totalVolumeKg: analysis.totalVolumeKg,
    volumeByMuscleGroup: analysis.muscleVolumes,
    volumeByExercise: {},
    sessionCount: analysis.sessionCount,
  });

  // Undertrained penalty
  const counts = getUndertrainedCounts(analysis.undertrainedMuscles);
  const totalMuscles = 16; // Total muscle groups tracked
  const undertrainedPenalty = (
    (counts.severe * 10) +
    (counts.moderate * 5) +
    (counts.mild * 2)
  );
  const undertrainedScore = Math.max(0, 100 - undertrainedPenalty);

  // Frequency score
  const daysInPeriod = (analysis.endDateMs - analysis.startDateMs) / (24 * 60 * 60 * 1000);
  const weeksInPeriod = Math.max(1, daysInPeriod / 7);
  const weeklyFrequency = analysis.sessionCount / weeksInPeriod;
  const frequencyScore = Math.min(100, (weeklyFrequency / 5) * 100); // 5 sessions/week = 100%

  // Weighted average
  const totalScore = (
    (balanceScore * 0.4) +
    (undertrainedScore * 0.3) +
    (frequencyScore * 0.3)
  );

  return Math.round(totalScore);
}

/**
 * Get quality score label
 */
export function getQualityScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Great';
  if (score >= 60) return 'Good';
  if (score >= 45) return 'Fair';
  if (score >= 30) return 'Needs Work';
  return 'Poor';
}

/**
 * Check if a muscle needs immediate attention
 */
export function muscleNeedsAttention(
  sessions: WorkoutSession[],
  muscle: MuscleGroup
): { needsAttention: boolean; reason: string | null } {
  const daysSince = getDaysSinceLastTrained(sessions, muscle);

  if (daysSince === null) {
    return { needsAttention: true, reason: 'Never trained' };
  }

  if (daysSince >= 14) {
    return { needsAttention: true, reason: `${daysSince} days since last trained` };
  }

  return { needsAttention: false, reason: null };
}
