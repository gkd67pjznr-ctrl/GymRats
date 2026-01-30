import type { ForgeDNA, ForgeDNAMetrics } from "./types";
import type { MuscleGroup } from "../../data/exerciseTypes";

/**
 * Service for detailed imbalance analysis of Forge DNA
 */

export interface MuscleImbalance {
  muscleGroup: MuscleGroup;
  volumePercentage: number;
  imbalanceScore: number; // 0-100, higher = more imbalanced
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ImbalanceAnalysis {
  muscleImbalances: MuscleImbalance[];
  overallBalanceScore: number; // 0-100, higher = more balanced
  recommendations: string[];
  insights: string[];
}

/**
 * Analyze muscle group imbalances in detail
 */
export function analyzeMuscleImbalances(dna: ForgeDNA): ImbalanceAnalysis {
  const muscleGroups: MuscleGroup[] = [
    'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest',
    'forearms', 'glutes', 'hamstrings', 'lats', 'lower back', 'middle back',
    'neck', 'quadriceps', 'shoulders', 'traps', 'triceps'
  ];

  // Calculate statistics
  const values = muscleGroups.map(muscle => dna.muscleBalance[muscle] || 0);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

  // Identify imbalances
  const muscleImbalances: MuscleImbalance[] = muscleGroups.map(muscle => {
    const volume = dna.muscleBalance[muscle] || 0;
    const deviation = Math.abs(volume - mean);

    // Calculate imbalance score (0-100)
    let imbalanceScore = 0;
    if (stdDev > 0) {
      imbalanceScore = Math.min(100, Math.round((deviation / stdDev) * 20));
    }

    // Determine severity
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (imbalanceScore > 30) {
      severity = 'high';
    } else if (imbalanceScore > 15) {
      severity = 'medium';
    }

    // Generate recommendations
    let recommendation = '';
    if (volume > mean + stdDev * 1.5) {
      recommendation = `Consider reducing training volume for ${muscle} to prevent overdevelopment`;
    } else if (volume < mean - stdDev * 1.5) {
      recommendation = `Increase training volume for ${muscle} to address underdevelopment`;
    } else {
      recommendation = `${muscle} development is well-balanced`;
    }

    return {
      muscleGroup: muscle,
      volumePercentage: volume,
      imbalanceScore,
      recommendation,
      severity
    };
  });

  // Sort by imbalance score (most imbalanced first)
  muscleImbalances.sort((a, b) => b.imbalanceScore - a.imbalanceScore);

  // Calculate overall balance score
  const significantImbalances = muscleImbalances.filter(imbalance => imbalance.imbalanceScore > 20);
  const overallBalanceScore = Math.max(0, 100 - (significantImbalances.length * 5));

  // Generate recommendations
  const recommendations: string[] = [];
  const highSeverityImbalances = muscleImbalances.filter(imb => imb.severity === 'high');

  if (highSeverityImbalances.length > 0) {
    recommendations.push("Address significant muscle imbalances to reduce injury risk");
    highSeverityImbalances.slice(0, 3).forEach(imb => {
      recommendations.push(imb.recommendation);
    });
  } else if (muscleImbalances.filter(imb => imb.severity === 'medium').length > 3) {
    recommendations.push("Consider rebalancing your training program for more even development");
  } else {
    recommendations.push("Your muscle development is relatively well-balanced");
  }

  // Generate insights
  const insights: string[] = [];

  // Find most and least developed muscles
  const sortedByVolume = [...muscleImbalances].sort((a, b) => b.volumePercentage - a.volumePercentage);
  const mostDeveloped = sortedByVolume[0];
  const leastDeveloped = sortedByVolume[sortedByVolume.length - 1];

  if (mostDeveloped.volumePercentage - leastDeveloped.volumePercentage > 40) {
    insights.push(`There's a significant gap between your strongest (${mostDeveloped.muscleGroup}) and weakest (${leastDeveloped.muscleGroup}) muscle groups`);
  }

  // Check for overall balance
  if (stdDev > 20) {
    insights.push("Your muscle development shows high variability - this could indicate specialized training or potential imbalances");
  } else if (stdDev < 10) {
    insights.push("Your muscle development is very consistent across all groups - good foundation for balanced fitness");
  }

  // Training style insights
  const trainingStyle = dna.trainingStyle;
  const dominantStyle = Object.entries(trainingStyle)
    .sort(([, a], [, b]) => b - a)[0];

  if (dominantStyle[1] > 60) {
    insights.push(`Your training is heavily focused on ${dominantStyle[0]} - consider varying your approach for balanced development`);
  }

  return {
    muscleImbalances: muscleImbalances.slice(0, 10), // Top 10 imbalances
    overallBalanceScore,
    recommendations,
    insights
  };
}

/**
 * Generate detailed training style insights
 */
export function analyzeTrainingStyle(dna: ForgeDNA): { insights: string[]; suggestions: string[] } {
  const insights: string[] = [];
  const suggestions: string[] = [];

  const trainingStyle = dna.trainingStyle;

  // Dominant style
  const dominantStyle = Object.entries(trainingStyle)
    .sort(([, a], [, b]) => b - a)[0];

  insights.push(`Your dominant training style is ${dominantStyle[0]} (${dominantStyle[1]}%)`);

  // Style distribution
  const sortedStyles = Object.entries(trainingStyle)
    .sort(([, a], [, b]) => b - a);

  if (sortedStyles[0][1] - sortedStyles[2][1] > 40) {
    insights.push("Your training style is highly specialized");
    suggestions.push("Try incorporating different rep ranges to develop all energy systems");
  } else if (Math.abs(sortedStyles[0][1] - sortedStyles[1][1]) < 15) {
    insights.push("Your training style is well-balanced across different approaches");
  }

  // Specific suggestions based on dominant style
  switch (dominantStyle[0]) {
    case 'strength':
      suggestions.push("Consider adding higher rep sets to build work capacity");
      suggestions.push("Include some hypertrophy-focused workouts for muscle growth");
      break;
    case 'volume':
      suggestions.push("Add some low-rep, heavy compound movements for strength");
      suggestions.push("Include occasional max effort attempts to test your strength");
      break;
    case 'endurance':
      suggestions.push("Incorporate heavier, lower rep work for strength development");
      suggestions.push("Add some power movements for explosive strength");
      break;
  }

  return { insights, suggestions };
}

/**
 * Generate progression suggestions based on DNA data
 */
export function generateProgressionSuggestions(dna: ForgeDNA): string[] {
  const suggestions: string[] = [];

  // Training days insight
  if (dna.trainingDays < 30) {
    suggestions.push("Increase training frequency for faster progress - aim for 4-5 sessions per week");
  } else if (dna.trainingDays > 100) {
    suggestions.push("Consider deloading weeks to prevent overtraining - your consistency is excellent");
  }

  // Data points insight
  if (dna.totalDataPoints < 20) {
    suggestions.push("Continue logging workouts consistently to improve DNA accuracy");
  } else if (dna.totalDataPoints > 100) {
    suggestions.push("Your DNA analysis is based on extensive data - very reliable insights");
  }

  // Exercise variety
  if (dna.topExercises.length < 3) {
    suggestions.push("Increase exercise variety to develop all muscle groups more evenly");
  }

  // Lift preferences
  const compoundFocused = dna.liftPreferences.includes('compound-heavy');
  if (compoundFocused) {
    suggestions.push("Your compound-focused approach is efficient for overall strength");
  } else {
    suggestions.push("Consider adding more compound movements for efficient strength development");
  }

  return suggestions;
}