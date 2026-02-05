/**
 * Types for the Forge Lab analytics system
 */

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core'
  | 'upper_chest' | 'lower_chest' | 'front_delt' | 'side_delt' | 'rear_delt'
  | 'lats' | 'mid_back' | 'traps' | 'biceps' | 'triceps' | 'forearms'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'abs' | 'obliques';

export type ForgeLabData = {
  weightHistory: { date: string; weightKg: number }[];
  exerciseStats: {
    exerciseId: string;
    e1rmHistory: { date: string; e1rm: number }[];
    volumeHistory: { week: string; volume: number }[];
    rankHistory: { date: string; rank: number; score: number }[];
  }[];
  muscleGroupVolume: {
    period: string;   // "2026-W04"
    groups: Record<MuscleGroup, number>;
  }[];
  integrationData?: {
    appleHealth?: { weight: number[]; sleep: number[] };
    whoop?: { recovery: number[]; strain: number[] };
    mfp?: { calories: number[]; protein: number[] };
  };
};

export type ChartDataPoint = {
  date: string;
  value: number;
  isPR?: boolean;
  prType?: 'weight' | 'rep' | 'e1rm';
};

export type TrendLineData = {
  date: string;
  value: number;
};

export type PeriodComparison = {
  currentPeriod: { label: string; value: number; change?: number };
  previousPeriod: { label: string; value: number };
  percentChange: number;
};

export type CorrelationResult = {
  metric1: string;
  metric2: string;
  correlation: number; // -1 to 1
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  description: string;
};

export type RankProjection = {
  currentRank: number;
  currentScore: number;
  projectedRank: number;
  projectedScore: number;
  daysToNextRank: number | null;
  nextRankName: string;
  confidence: 'high' | 'medium' | 'low';
};

export type ExerciseStat = {
  exerciseId: string;
  name: string;
  e1rmHistory: ChartDataPoint[];
  volumeHistory: { week: string; volume: number }[];
  rankHistory: { date: string; rank: number; score: number }[];
};

export type MuscleGroupVolumeData = {
  period: string;
  groups: Record<MuscleGroup, number>;
};

export type IntegrationData = {
  appleHealth?: { weight: number[]; sleep: number[] };
  whoop?: { recovery: number[]; strain: number[] };
  mfp?: { calories: number[]; protein: number[] };
};

export type ForgeLabState = {
  data: ForgeLabData | null;
  loading: boolean;
  error: string | null;
  dateRange: '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
  lastHash?: string; // Hash of input data (sessions + bodyweight) used to compute current data
  // Actions
  loadData: () => Promise<void>;
  setDateRange: (dateRange: '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL') => void;
  refreshData: () => void;
  clearData: () => void;
};

/**
 * Day Log correlation result for analytics
 * Correlates pre-workout state factors with workout performance
 */
export type DayLogCorrelation = {
  factor: string; // e.g., 'hydration', 'sleep', 'energy'
  metric: string; // e.g., 'prCount', 'volume', 'avgScore'
  correlation: number; // -1 to 1 (Pearson r)
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  description: string; // Human-readable insight
  sampleSize: number; // Number of data points used
  isPositive: boolean; // Whether correlation is positive
};

/**
 * Day Log factor names for correlation analysis
 */
export type DayLogFactor =
  | 'hydration'
  | 'nutrition'
  | 'carbsLevel'
  | 'energyLevel'
  | 'sleepQuality'
  | 'hasPain';

/**
 * Workout performance metric names for correlation analysis
 */
export type WorkoutMetric =
  | 'prCount'
  | 'totalVolume'
  | 'setCount'
  | 'avgScore';
