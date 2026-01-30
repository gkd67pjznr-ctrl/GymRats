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
};