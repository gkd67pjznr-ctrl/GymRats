// src/lib/prPrediction.ts
// Utilities for predicting if a set will be a PR

import { estimate1RM_Epley } from "./e1rm";
import { bucketKeyForUser } from "./buckets";
import type { UnitSystem } from "./buckets";
import type { ExerciseSessionState } from "./perSetCueTypes";

/**
 * PR Prediction result
 */
export interface PRPrediction {
  /** Will this set be a weight PR? */
  willBeWeightPR: boolean;
  /** Will this set be a rep PR at this weight? */
  willBeRepPR: boolean;
  /** Will this set be an e1RM PR? */
  willBeE1RMPR: boolean;
  /** How close to e1RM PR (0-1, 1 = at or above PR threshold) */
  e1rmProximity: number;
  /** Reps needed at this weight to hit e1RM PR */
  repsNeededForE1RMPR: number | null;
  /** Weight needed at these reps to hit e1RM PR (in user units) */
  weightNeededForE1RMPR: number | null;
  /** Predicted e1RM for this set */
  predictedE1RM: number;
  /** Current best e1RM */
  currentBestE1RM: number;
}

/**
 * Predict if a set will result in a PR
 *
 * @param weightKg - Weight in kilograms
 * @param reps - Number of reps
 * @param unit - User's unit system
 * @param exerciseState - Current exercise session state (best weights, reps, e1RM)
 * @returns Prediction with proximity indicators
 */
export function predictPR(
  weightKg: number,
  reps: number,
  unit: UnitSystem,
  exerciseState: ExerciseSessionState
): PRPrediction {
  const { bestWeightKg, bestE1RMKg, bestRepsAtWeight } = exerciseState;

  // Calculate predicted e1RM
  const predictedE1RM = estimate1RM_Epley(weightKg, reps);

  // Check weight PR
  const willBeWeightPR = weightKg > bestWeightKg;

  // Check rep PR at this weight bucket
  const bucketKey = bucketKeyForUser(weightKg, unit);
  const prevRepsAtBucket = bestRepsAtWeight[bucketKey] ?? 0;
  const willBeRepPR = reps > prevRepsAtBucket;

  // Check e1RM PR
  const willBeE1RMPR = predictedE1RM > bestE1RMKg;

  // Calculate proximity to e1RM PR (0 = far, 1 = at/above)
  let e1rmProximity = 0;
  if (bestE1RMKg > 0) {
    e1rmProximity = Math.min(1, predictedE1RM / bestE1RMKg);
  } else if (predictedE1RM > 0) {
    // No previous e1RM, so any set is a PR
    e1rmProximity = 1;
  }

  // Calculate reps needed to hit e1RM PR at current weight
  let repsNeededForE1RMPR: number | null = null;
  if (weightKg > 0 && bestE1RMKg > 0) {
    // e1RM = weight * (1 + reps/30)
    // reps = 30 * (e1RM/weight - 1)
    const targetE1RM = bestE1RMKg * 1.001; // Slightly above to ensure PR
    const repsNeeded = Math.ceil(30 * (targetE1RM / weightKg - 1));
    if (repsNeeded > 0 && repsNeeded <= 30) {
      repsNeededForE1RMPR = repsNeeded;
    }
  }

  // Calculate weight needed to hit e1RM PR at current reps
  let weightNeededForE1RMPR: number | null = null;
  if (reps > 0 && bestE1RMKg > 0) {
    // e1RM = weight * (1 + reps/30)
    // weight = e1RM / (1 + reps/30)
    const targetE1RM = bestE1RMKg * 1.001;
    const weightNeeded = targetE1RM / (1 + reps / 30);
    if (weightNeeded > 0) {
      weightNeededForE1RMPR = weightNeeded;
    }
  }

  return {
    willBeWeightPR,
    willBeRepPR,
    willBeE1RMPR,
    e1rmProximity,
    repsNeededForE1RMPR,
    weightNeededForE1RMPR,
    predictedE1RM,
    currentBestE1RM: bestE1RMKg,
  };
}

/**
 * Get a human-readable prediction message
 */
export function getPredictionMessage(prediction: PRPrediction): string | null {
  if (prediction.willBeWeightPR) {
    return "New weight PR!";
  }
  if (prediction.willBeRepPR) {
    return "Rep PR at this weight!";
  }
  if (prediction.willBeE1RMPR) {
    return "New e1RM PR!";
  }

  // Close to PR
  if (prediction.e1rmProximity >= 0.95) {
    return "Almost a PR! Push for 1 more rep";
  }
  if (prediction.e1rmProximity >= 0.90) {
    return "Getting close to PR territory";
  }

  return null;
}

/**
 * Get prediction intensity level for styling
 */
export function getPredictionIntensity(
  prediction: PRPrediction
): "none" | "close" | "very-close" | "pr" {
  if (prediction.willBeWeightPR || prediction.willBeRepPR || prediction.willBeE1RMPR) {
    return "pr";
  }
  if (prediction.e1rmProximity >= 0.95) {
    return "very-close";
  }
  if (prediction.e1rmProximity >= 0.90) {
    return "close";
  }
  return "none";
}
