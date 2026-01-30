import type { ForgeDNA, ForgeDNAMetrics } from "./types";
import type { MuscleGroup } from "../../data/exerciseTypes";
import { supabase } from "../supabase/client";

/**
 * Service for calculating average/user comparison data for Forge DNA
 */

export interface UserComparisonData {
  averageUser: ForgeDNA;
  differences: string[];
  insights: string[];
}

/**
 * Calculate average user DNA data from database
 */
export async function calculateAverageUserDNA(currentUserId: string): Promise<{ data: ForgeDNA | null; error?: string }> {
  try {
    // This would typically fetch anonymized aggregate data from the database
    // For now, we'll simulate this with a placeholder implementation
    // In a real implementation, this would query historical DNA data from other users

    // Get a sample of other users' DNA data (in a real implementation)
    const { data, error } = await supabase
      .from('forge_dna_history')
      .select('dna_data')
      .neq('user_id', currentUserId) // Exclude current user
      .limit(100); // Limit to a reasonable sample size

    if (error) {
      console.error('Error fetching average user DNA data:', error);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      // Return a default average if no data available
      return { data: createDefaultAverageDNA() };
    }

    // Calculate averages from the sample data
    const averageDNA = calculateAveragesFromSample(data.map(item => item.dna_data as ForgeDNA));

    return { data: averageDNA };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error calculating average user DNA:', errorMessage);
    return { data: null, error: errorMessage };
  }
}

/**
 * Calculate averages from a sample of DNA data
 */
function calculateAveragesFromSample(dnaSamples: ForgeDNA[]): ForgeDNA {
  if (dnaSamples.length === 0) {
    return createDefaultAverageDNA();
  }

  // Initialize accumulators
  const muscleBalanceSums: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;
  let strengthSum = 0;
  let volumeSum = 0;
  let enduranceSum = 0;
  let totalDataPointsSum = 0;
  let trainingDaysSum = 0;

  // Initialize muscle groups
  const muscleGroups: MuscleGroup[] = [
    'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest',
    'forearms', 'glutes', 'hamstrings', 'lats', 'lower back', 'middle back',
    'neck', 'quadriceps', 'shoulders', 'traps', 'triceps'
  ];

  muscleGroups.forEach(muscle => {
    muscleBalanceSums[muscle] = 0;
  });

  // Sum all values
  dnaSamples.forEach(dna => {
    // Muscle balance
    muscleGroups.forEach(muscle => {
      muscleBalanceSums[muscle] += dna.muscleBalance[muscle] || 0;
    });

    // Training style
    strengthSum += dna.trainingStyle.strength;
    volumeSum += dna.trainingStyle.volume;
    enduranceSum += dna.trainingStyle.endurance;

    // Other metrics
    totalDataPointsSum += dna.totalDataPoints;
    trainingDaysSum += dna.trainingDays;
  });

  // Calculate averages
  const sampleCount = dnaSamples.length;
  const averageMuscleBalance: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;

  muscleGroups.forEach(muscle => {
    averageMuscleBalance[muscle] = Math.round(muscleBalanceSums[muscle] / sampleCount);
  });

  const averageTrainingStyle = {
    strength: Math.round(strengthSum / sampleCount),
    volume: Math.round(volumeSum / sampleCount),
    endurance: Math.round(enduranceSum / sampleCount),
  };

  // Normalize training style to sum to 100
  const totalStyle = averageTrainingStyle.strength + averageTrainingStyle.volume + averageTrainingStyle.endurance;
  if (totalStyle > 0) {
    averageTrainingStyle.strength = Math.round((averageTrainingStyle.strength / totalStyle) * 100);
    averageTrainingStyle.volume = Math.round((averageTrainingStyle.volume / totalStyle) * 100);
    averageTrainingStyle.endurance = 100 - averageTrainingStyle.strength - averageTrainingStyle.volume;
  }

  // For top exercises, we'll use a generic approach
  const commonExercises = ['bench', 'squat', 'deadlift', 'ohp', 'row'];

  return {
    userId: 'average',
    generatedAt: Date.now(),
    muscleBalance: averageMuscleBalance,
    trainingStyle: averageTrainingStyle,
    topExercises: commonExercises,
    liftPreferences: ['compound-heavy', 'balanced-upper-lower', 'balanced-push-pull'],
    totalDataPoints: Math.round(totalDataPointsSum / sampleCount),
    trainingDays: Math.round(trainingDaysSum / sampleCount),
  };
}

/**
 * Create a default average DNA for cases where no comparison data is available
 */
function createDefaultAverageDNA(): ForgeDNA {
  // Default "average" muscle balance (relatively balanced)
  const defaultMuscleBalance: Record<MuscleGroup, number> = {
    'abdominals': 50,
    'abductors': 40,
    'adductors': 40,
    'biceps': 45,
    'calves': 45,
    'chest': 60,
    'forearms': 50,
    'glutes': 55,
    'hamstrings': 55,
    'lats': 55,
    'lower back': 50,
    'middle back': 50,
    'neck': 40,
    'quadriceps': 60,
    'shoulders': 55,
    'traps': 50,
    'triceps': 50,
  };

  return {
    userId: 'average',
    generatedAt: Date.now(),
    muscleBalance: defaultMuscleBalance,
    trainingStyle: {
      strength: 35,
      volume: 45,
      endurance: 20,
    },
    topExercises: ['bench', 'squat', 'deadlift', 'ohp', 'row'],
    liftPreferences: ['compound-heavy', 'balanced-upper-lower', 'balanced-push-pull'],
    totalDataPoints: 50,
    trainingDays: 30,
  };
}

/**
 * Generate comparison insights between user DNA and average user DNA
 */
export function generateComparisonInsights(userDNA: ForgeDNA, averageDNA: ForgeDNA): { differences: string[]; insights: string[] } {
  const differences: string[] = [];
  const insights: string[] = [];

  // Compare muscle balance
  const muscleGroups: MuscleGroup[] = [
    'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest',
    'forearms', 'glutes', 'hamstrings', 'lats', 'lower back', 'middle back',
    'neck', 'quadriceps', 'shoulders', 'traps', 'triceps'
  ];

  const significantDifferences: Array<{ muscle: MuscleGroup; user: number; average: number; difference: number }> = [];

  muscleGroups.forEach(muscle => {
    const userValue = userDNA.muscleBalance[muscle] || 0;
    const averageValue = averageDNA.muscleBalance[muscle] || 0;
    const difference = Math.abs(userValue - averageValue);

    if (difference > 15) { // Significant difference threshold
      significantDifferences.push({
        muscle,
        user: userValue,
        average: averageValue,
        difference
      });
    }
  });

  // Sort by difference magnitude
  significantDifferences.sort((a, b) => b.difference - a.difference);

  // Generate difference statements
  significantDifferences.slice(0, 5).forEach(diff => {
    if (diff.user > diff.average) {
      differences.push(`Your ${diff.muscle} development is ${diff.difference}% higher than average`);
    } else {
      differences.push(`Your ${diff.muscle} development is ${diff.difference}% lower than average`);
    }
  });

  // Compare training style
  const styleDifferences = [
    {
      style: 'strength',
      user: userDNA.trainingStyle.strength,
      average: averageDNA.trainingStyle.strength,
      difference: Math.abs(userDNA.trainingStyle.strength - averageDNA.trainingStyle.strength)
    },
    {
      style: 'volume',
      user: userDNA.trainingStyle.volume,
      average: averageDNA.trainingStyle.volume,
      difference: Math.abs(userDNA.trainingStyle.volume - averageDNA.trainingStyle.volume)
    },
    {
      style: 'endurance',
      user: userDNA.trainingStyle.endurance,
      average: averageDNA.trainingStyle.endurance,
      difference: Math.abs(userDNA.trainingStyle.endurance - averageDNA.trainingStyle.endurance)
    }
  ];

  // Find the most different style
  styleDifferences.sort((a, b) => b.difference - a.difference);
  const dominantStyleDiff = styleDifferences[0];

  if (dominantStyleDiff.difference > 20) {
    if (dominantStyleDiff.user > dominantStyleDiff.average) {
      differences.push(`You focus ${dominantStyleDiff.difference}% more on ${dominantStyleDiff.style} training than average`);
    } else {
      differences.push(`You focus ${dominantStyleDiff.difference}% less on ${dominantStyleDiff.style} training than average`);
    }
  }

  // Generate insights based on comparisons
  const userDominantStyle = Object.entries(userDNA.trainingStyle)
    .sort(([, a], [, b]) => b - a)[0][0];

  const averageDominantStyle = Object.entries(averageDNA.trainingStyle)
    .sort(([, a], [, b]) => b - a)[0][0];

  if (userDominantStyle !== averageDominantStyle) {
    insights.push(`Your training style is more ${userDominantStyle}-focused compared to the average user who is more ${averageDominantStyle}-focused`);
  }

  // Check for extremely imbalanced muscles
  const userHighest = Math.max(...Object.values(userDNA.muscleBalance));
  const userLowest = Math.min(...Object.values(userDNA.muscleBalance));
  const userBalanceRange = userHighest - userLowest;

  if (userBalanceRange > 50) {
    insights.push("Your muscle development shows more variation than average - this could indicate specific strengths or potential imbalances to address");
  } else if (userBalanceRange < 20) {
    insights.push("Your muscle development is more balanced than average - this provides a solid foundation for overall fitness");
  }

  // If no significant differences, mention that
  if (differences.length === 0) {
    differences.push("Your training identity is very similar to the average user");
  }

  // If no insights, provide a default one
  if (insights.length === 0) {
    insights.push("Your training patterns align well with typical user behavior");
  }

  return { differences, insights };
}