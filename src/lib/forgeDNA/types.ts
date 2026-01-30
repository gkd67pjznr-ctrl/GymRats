import type { MuscleGroup } from "../../data/exerciseTypes";
import type { WorkoutSession } from "../workoutModel";

/**
 * Types for Forge DNA - Visual fingerprint of training identity
 */

export type ForgeDNAInput = {
  workoutHistory: WorkoutSession[];  // All workout data
  exerciseStats: {
    exerciseId: string;
    totalVolume: number;      // weight * reps * sets
    totalSets: number;
    bestE1RM: number;         // in kg
    avgReps: number;
    frequency: number;        // sessions per week
  }[];
  muscleGroupVolume: Record<MuscleGroup, number>;
  trainingDays: number;       // Total unique workout days
};

export type ForgeDNA = {
  userId: string;
  generatedAt: number;
  muscleBalance: Record<MuscleGroup, number>;  // 0-100 per group
  trainingStyle: {
    strength: number;     // 0-100 - heavy weight, low reps
    volume: number;       // 0-100 - moderate weight, high reps
    endurance: number;    // 0-100 - light weight, very high reps
  };
  topExercises: string[];     // Top 5 most-trained exercises (IDs)
  liftPreferences: string[];  // "compound-heavy" | "isolation-focused" etc.
  totalDataPoints: number;    // Workouts used to generate
  trainingDays: number;       // Unique training days
};

export type TrainingStyle = 'strength-focused' | 'volume-focused' | 'endurance-focused' | 'balanced';

export type LiftPreference =
  | 'compound-heavy'
  | 'isolation-focused'
  | 'upper-body-dominant'
  | 'lower-body-dominant'
  | 'push-focused'
  | 'pull-focused'
  | 'balanced';

export type ForgeDNAMetrics = {
  // Muscle group balance metrics
  muscleImbalances: Array<{
    muscleGroup: MuscleGroup;
    volumePercentage: number;
    imbalanceScore: number; // 0-100, higher = more imbalanced
  }>;

  // Training style metrics
  avgWeightPerRep: number;    // Average weight lifted per rep
  avgRepsPerSet: number;      // Average reps per set
  totalVolume: number;        // Total volume (kg * reps * sets)

  // Frequency metrics
  workoutsPerWeek: number;
  restDaysPerWeek: number;

  // Exercise variety
  uniqueExercises: number;
  exerciseVarietyScore: number; // 0-100, higher = more variety

  // Consistency metrics
  streakLength: number;
  consistencyScore: number;   // 0-100, higher = more consistent
};

export type ForgeDNAVisualization = {
  // SVG path data for the DNA visualization
  muscleBalanceShape: {
    path: string;           // SVG path data
    fillColor: string;      // Hex color based on balance
    strokeColor: string;    // Outline color
  };

  // Training style visualization
  trainingStyleBars: Array<{
    style: 'strength' | 'volume' | 'endurance';
    percentage: number;     // 0-100
    color: string;          // Style-specific color
  }>;

  // Top exercises visualization
  topExercisesChart: Array<{
    exerciseId: string;
    volume: number;
    color: string;
  }>;
};

// Premium vs Free data
export type ForgeDNAForDisplay = {
  basic: ForgeDNA;
  premium?: {
    historicalComparison: Array<{
      date: number;
      muscleBalance: Record<MuscleGroup, number>;
      trainingStyle: ForgeDNA['trainingStyle'];
    }>;
    userComparison: {
      averageUser: ForgeDNA;
      differences: string[];
    };
    detailedAnalysis: {
      imbalanceRecommendations: string[];
      trainingStyleInsights: string[];
      progressionSuggestions: string[];
    };
  };
};