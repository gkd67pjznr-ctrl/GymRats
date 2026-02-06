// src/lib/dayLogAnalytics.ts
// Analytics utilities for Day Log - correlates pre-workout state with performance

import type { DayLog, HydrationLevel, EnergyLevel, SleepQuality, NutritionStatus, MoodState } from './dayLog/types';
import type { WorkoutSession } from './workoutModel';
import { estimate1RM_Epley as calculateE1RM } from './e1rm';

// ============================================================================
// Types
// ============================================================================

export type InsightType =
  | 'hydration_pr'
  | 'sleep_pr'
  | 'energy_pr'
  | 'nutrition_volume'
  | 'pain_warning'
  | 'mood_performance'
  | 'general';

export type InsightSeverity = 'positive' | 'neutral' | 'warning';

/**
 * Generated insight from Day Log analysis
 */
export interface DayLogInsight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  message: string;
  stat?: string; // e.g., "+35%", "3 workouts"
  sampleSize: number;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Aggregated stats for a specific factor level
 */
export interface FactorStats {
  level: string | number;
  count: number;
  avgPRs: number;
  avgVolume: number;
  avgSets: number;
}

/**
 * Complete analytics result
 */
export interface DayLogAnalyticsResult {
  totalLogs: number;
  insights: DayLogInsight[];
  hydrationStats: FactorStats[];
  sleepStats: FactorStats[];
  energyStats: FactorStats[];
  nutritionStats: FactorStats[];
  moodStats: FactorStats[];
  painImpact: {
    withPain: { avgPRs: number; avgVolume: number; count: number };
    withoutPain: { avgPRs: number; avgVolume: number; count: number };
  } | null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate total volume for a session
 */
function calculateSessionVolume(session: WorkoutSession): number {
  return session.sets.reduce((sum, set) => sum + set.weightKg * set.reps, 0);
}

/**
 * Calculate average e1RM for a session
 * @internal Currently unused but available for future analytics
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateAvgE1RM(session: WorkoutSession): number {
  if (session.sets.length === 0) return 0;
  const totalE1RM = session.sets.reduce((sum, set) => {
    return sum + calculateE1RM(set.weightKg, set.reps);
  }, 0);
  return totalE1RM / session.sets.length;
}

/**
 * Get paired day logs and sessions
 */
function getPairedData(
  logs: DayLog[],
  sessions: WorkoutSession[]
): { log: DayLog; session: WorkoutSession }[] {
  const sessionMap = new Map<string, WorkoutSession>();
  sessions.forEach(s => sessionMap.set(s.id, s));

  return logs
    .map(log => ({
      log,
      session: sessionMap.get(log.sessionId),
    }))
    .filter((pair): pair is { log: DayLog; session: WorkoutSession } =>
      pair.session !== undefined
    );
}

/**
 * Calculate correlation coefficient between two arrays
 * @internal Currently unused but available for future analytics
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 3) return 0;

  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * Generate unique insight ID
 */
function generateInsightId(): string {
  return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Determine confidence level based on sample size
 */
function getConfidence(sampleSize: number): 'high' | 'medium' | 'low' {
  if (sampleSize >= 10) return 'high';
  if (sampleSize >= 5) return 'medium';
  return 'low';
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Analyze factor impact on a metric
 */
function analyzeFactorImpact<T extends string | number>(
  pairs: { log: DayLog; session: WorkoutSession }[],
  getFactor: (log: DayLog) => T | undefined,
  getMetric: (session: WorkoutSession) => number
): Map<T, { sum: number; count: number }> {
  const stats = new Map<T, { sum: number; count: number }>();

  pairs.forEach(({ log, session }) => {
    const factor = getFactor(log);
    if (factor === undefined) return;

    const metric = getMetric(session);
    const current = stats.get(factor) || { sum: 0, count: 0 };
    stats.set(factor, {
      sum: current.sum + metric,
      count: current.count + 1,
    });
  });

  return stats;
}

/**
 * Generate hydration-related insights
 */
function generateHydrationInsights(
  pairs: { log: DayLog; session: WorkoutSession }[]
): DayLogInsight[] {
  const insights: DayLogInsight[] = [];

  // Group by hydration level
  const highHydration = pairs.filter(p => (p.log.hydration ?? 3) >= 4);
  const lowHydration = pairs.filter(p => (p.log.hydration ?? 3) <= 2);

  if (highHydration.length >= 2 && lowHydration.length >= 2) {
    const highPRRate = highHydration.reduce((sum, p) => sum + (p.session.prCount ?? 0), 0) / highHydration.length;
    const lowPRRate = lowHydration.reduce((sum, p) => sum + (p.session.prCount ?? 0), 0) / lowHydration.length;

    if (highPRRate > lowPRRate && lowPRRate > 0) {
      const improvement = Math.round(((highPRRate - lowPRRate) / lowPRRate) * 100);
      if (improvement >= 10) {
        insights.push({
          id: generateInsightId(),
          type: 'hydration_pr',
          severity: 'positive',
          title: 'Hydration Boosts PRs',
          message: `You hit ${improvement}% more PRs when well-hydrated (4-5) vs dehydrated (1-2)`,
          stat: `+${improvement}%`,
          sampleSize: highHydration.length + lowHydration.length,
          confidence: getConfidence(highHydration.length + lowHydration.length),
        });
      }
    }
  }

  return insights;
}

/**
 * Generate sleep-related insights
 */
function generateSleepInsights(
  pairs: { log: DayLog; session: WorkoutSession }[]
): DayLogInsight[] {
  const insights: DayLogInsight[] = [];

  const goodSleep = pairs.filter(p => (p.log.sleepQuality ?? 3) >= 4);
  const poorSleep = pairs.filter(p => (p.log.sleepQuality ?? 3) <= 2);

  if (goodSleep.length >= 2 && poorSleep.length >= 2) {
    const goodPRRate = goodSleep.reduce((sum, p) => sum + (p.session.prCount ?? 0), 0) / goodSleep.length;
    const poorPRRate = poorSleep.reduce((sum, p) => sum + (p.session.prCount ?? 0), 0) / poorSleep.length;

    if (goodPRRate > poorPRRate && poorPRRate > 0) {
      const improvement = Math.round(((goodPRRate - poorPRRate) / poorPRRate) * 100);
      if (improvement >= 10) {
        insights.push({
          id: generateInsightId(),
          type: 'sleep_pr',
          severity: 'positive',
          title: 'Sleep Impacts Strength',
          message: `Your PR rate is ${improvement}% higher after good sleep (4-5) vs poor sleep (1-2)`,
          stat: `+${improvement}%`,
          sampleSize: goodSleep.length + poorSleep.length,
          confidence: getConfidence(goodSleep.length + poorSleep.length),
        });
      }
    }
  }

  return insights;
}

/**
 * Generate nutrition-related insights
 */
function generateNutritionInsights(
  pairs: { log: DayLog; session: WorkoutSession }[]
): DayLogInsight[] {
  const insights: DayLogInsight[] = [];

  const wellFed = pairs.filter(p => p.log.nutrition === 'full' || p.log.nutrition === 'moderate');
  const underfed = pairs.filter(p => p.log.nutrition === 'none' || p.log.nutrition === 'light');

  if (wellFed.length >= 2 && underfed.length >= 2) {
    const wellFedVolume = wellFed.reduce((sum, p) => sum + calculateSessionVolume(p.session), 0) / wellFed.length;
    const underfedVolume = underfed.reduce((sum, p) => sum + calculateSessionVolume(p.session), 0) / underfed.length;

    if (wellFedVolume > underfedVolume && underfedVolume > 0) {
      const improvement = Math.round(((wellFedVolume - underfedVolume) / underfedVolume) * 100);
      if (improvement >= 10) {
        insights.push({
          id: generateInsightId(),
          type: 'nutrition_volume',
          severity: 'positive',
          title: 'Fuel Your Workouts',
          message: `You complete ${improvement}% more volume when well-fed vs training fasted/light`,
          stat: `+${improvement}%`,
          sampleSize: wellFed.length + underfed.length,
          confidence: getConfidence(wellFed.length + underfed.length),
        });
      }
    }
  }

  return insights;
}

/**
 * Generate pain-related warnings
 */
function generatePainInsights(
  pairs: { log: DayLog; session: WorkoutSession }[]
): DayLogInsight[] {
  const insights: DayLogInsight[] = [];

  // Check for consecutive pain reports
  const recentPairs = pairs.slice(-5);
  const painCount = recentPairs.filter(p => p.log.hasPain).length;

  if (painCount >= 3) {
    insights.push({
      id: generateInsightId(),
      type: 'pain_warning',
      severity: 'warning',
      title: 'Recovery Check',
      message: `You've reported aches/pain in ${painCount} of your last ${recentPairs.length} workouts. Consider extra rest or mobility work.`,
      stat: `${painCount} workouts`,
      sampleSize: recentPairs.length,
      confidence: 'high',
    });
  }

  return insights;
}

/**
 * Generate mood-related insights
 */
function generateMoodInsights(
  pairs: { log: DayLog; session: WorkoutSession }[]
): DayLogInsight[] {
  const insights: DayLogInsight[] = [];

  const motivated = pairs.filter(p => p.log.mood === 'motivated' || p.log.mood === 'focused');
  const stressed = pairs.filter(p => p.log.mood === 'stressed');

  if (motivated.length >= 2 && stressed.length >= 2) {
    const motivatedPRs = motivated.reduce((sum, p) => sum + (p.session.prCount ?? 0), 0) / motivated.length;
    const stressedPRs = stressed.reduce((sum, p) => sum + (p.session.prCount ?? 0), 0) / stressed.length;

    if (motivatedPRs > stressedPRs && stressedPRs >= 0) {
      const diff = (motivatedPRs - stressedPRs).toFixed(1);
      insights.push({
        id: generateInsightId(),
        type: 'mood_performance',
        severity: 'positive',
        title: 'Mindset Matters',
        message: `You average ${diff} more PRs per workout when feeling motivated vs stressed`,
        stat: `+${diff} PRs`,
        sampleSize: motivated.length + stressed.length,
        confidence: getConfidence(motivated.length + stressed.length),
      });
    }
  }

  return insights;
}

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Calculate comprehensive Day Log analytics
 *
 * @param logs - Array of Day Log entries
 * @param sessions - Array of workout sessions
 * @returns Analytics result with insights and stats
 */
export function calculateDayLogAnalytics(
  logs: DayLog[],
  sessions: WorkoutSession[]
): DayLogAnalyticsResult {
  const pairs = getPairedData(logs, sessions);

  // Need at least 3 paired entries for meaningful analysis
  if (pairs.length < 3) {
    return {
      totalLogs: logs.length,
      insights: [],
      hydrationStats: [],
      sleepStats: [],
      energyStats: [],
      nutritionStats: [],
      moodStats: [],
      painImpact: null,
    };
  }

  // Generate insights
  const insights: DayLogInsight[] = [
    ...generateHydrationInsights(pairs),
    ...generateSleepInsights(pairs),
    ...generateNutritionInsights(pairs),
    ...generatePainInsights(pairs),
    ...generateMoodInsights(pairs),
  ];

  // Calculate factor stats
  const hydrationStats: FactorStats[] = [];
  const hydrationMap = analyzeFactorImpact(
    pairs,
    log => log.hydration,
    session => session.prCount ?? 0
  );
  const hydrationVolumeMap = analyzeFactorImpact(
    pairs,
    log => log.hydration,
    calculateSessionVolume
  );
  const hydrationSetsMap = analyzeFactorImpact(
    pairs,
    log => log.hydration,
    session => session.sets.length
  );

  for (let level = 1; level <= 5; level++) {
    const prData = hydrationMap.get(level as HydrationLevel);
    const volData = hydrationVolumeMap.get(level as HydrationLevel);
    const setData = hydrationSetsMap.get(level as HydrationLevel);
    if (prData) {
      hydrationStats.push({
        level,
        count: prData.count,
        avgPRs: prData.sum / prData.count,
        avgVolume: volData ? volData.sum / volData.count : 0,
        avgSets: setData ? setData.sum / setData.count : 0,
      });
    }
  }

  // Sleep stats
  const sleepStats: FactorStats[] = [];
  const sleepMap = analyzeFactorImpact(
    pairs,
    log => log.sleepQuality,
    session => session.prCount ?? 0
  );
  const sleepVolumeMap = analyzeFactorImpact(
    pairs,
    log => log.sleepQuality,
    calculateSessionVolume
  );

  for (let level = 1; level <= 5; level++) {
    const prData = sleepMap.get(level as SleepQuality);
    const volData = sleepVolumeMap.get(level as SleepQuality);
    if (prData) {
      sleepStats.push({
        level,
        count: prData.count,
        avgPRs: prData.sum / prData.count,
        avgVolume: volData ? volData.sum / volData.count : 0,
        avgSets: 0,
      });
    }
  }

  // Energy stats
  const energyStats: FactorStats[] = [];
  const energyMap = analyzeFactorImpact(
    pairs,
    log => log.energyLevel,
    session => session.prCount ?? 0
  );
  const energyVolumeMap = analyzeFactorImpact(
    pairs,
    log => log.energyLevel,
    calculateSessionVolume
  );

  for (let level = 1; level <= 5; level++) {
    const prData = energyMap.get(level as EnergyLevel);
    const volData = energyVolumeMap.get(level as EnergyLevel);
    if (prData) {
      energyStats.push({
        level,
        count: prData.count,
        avgPRs: prData.sum / prData.count,
        avgVolume: volData ? volData.sum / volData.count : 0,
        avgSets: 0,
      });
    }
  }

  // Nutrition stats
  const nutritionStats: FactorStats[] = [];
  const nutritionLevels: NutritionStatus[] = ['none', 'light', 'moderate', 'full'];
  const nutritionMap = analyzeFactorImpact(
    pairs,
    log => log.nutrition,
    session => session.prCount ?? 0
  );
  const nutritionVolumeMap = analyzeFactorImpact(
    pairs,
    log => log.nutrition,
    calculateSessionVolume
  );

  nutritionLevels.forEach(level => {
    const prData = nutritionMap.get(level);
    const volData = nutritionVolumeMap.get(level);
    if (prData) {
      nutritionStats.push({
        level,
        count: prData.count,
        avgPRs: prData.sum / prData.count,
        avgVolume: volData ? volData.sum / volData.count : 0,
        avgSets: 0,
      });
    }
  });

  // Mood stats
  const moodStats: FactorStats[] = [];
  const moodLevels: MoodState[] = ['stressed', 'neutral', 'focused', 'motivated'];
  const moodMap = analyzeFactorImpact(
    pairs,
    log => log.mood,
    session => session.prCount ?? 0
  );
  const moodVolumeMap = analyzeFactorImpact(
    pairs,
    log => log.mood,
    calculateSessionVolume
  );

  moodLevels.forEach(level => {
    const prData = moodMap.get(level);
    const volData = moodVolumeMap.get(level);
    if (prData) {
      moodStats.push({
        level,
        count: prData.count,
        avgPRs: prData.sum / prData.count,
        avgVolume: volData ? volData.sum / volData.count : 0,
        avgSets: 0,
      });
    }
  });

  // Pain impact
  const withPain = pairs.filter(p => p.log.hasPain);
  const withoutPain = pairs.filter(p => !p.log.hasPain);

  const painImpact = (withPain.length > 0 && withoutPain.length > 0) ? {
    withPain: {
      avgPRs: withPain.reduce((sum, p) => sum + (p.session.prCount ?? 0), 0) / withPain.length,
      avgVolume: withPain.reduce((sum, p) => sum + calculateSessionVolume(p.session), 0) / withPain.length,
      count: withPain.length,
    },
    withoutPain: {
      avgPRs: withoutPain.reduce((sum, p) => sum + (p.session.prCount ?? 0), 0) / withoutPain.length,
      avgVolume: withoutPain.reduce((sum, p) => sum + calculateSessionVolume(p.session), 0) / withoutPain.length,
      count: withoutPain.length,
    },
  } : null;

  return {
    totalLogs: logs.length,
    insights,
    hydrationStats,
    sleepStats,
    energyStats,
    nutritionStats,
    moodStats,
    painImpact,
  };
}

/**
 * Get top N insights sorted by confidence and impact
 */
export function getTopInsights(
  logs: DayLog[],
  sessions: WorkoutSession[],
  limit: number = 3
): DayLogInsight[] {
  const result = calculateDayLogAnalytics(logs, sessions);

  // Sort by confidence (high > medium > low), then by severity (warning > positive > neutral)
  const sorted = result.insights.sort((a, b) => {
    const confidenceOrder = { high: 0, medium: 1, low: 2 };
    const severityOrder = { warning: 0, positive: 1, neutral: 2 };

    const confDiff = confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
    if (confDiff !== 0) return confDiff;

    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return sorted.slice(0, limit);
}

/**
 * Generate a simple summary string for display
 */
export function getDayLogSummary(
  logs: DayLog[],
  sessions: WorkoutSession[]
): string {
  if (logs.length < 3) {
    return `Log ${3 - logs.length} more workouts to see insights`;
  }

  const insights = getTopInsights(logs, sessions, 1);
  if (insights.length === 0) {
    return 'Keep logging to discover patterns';
  }

  return insights[0].message;
}
