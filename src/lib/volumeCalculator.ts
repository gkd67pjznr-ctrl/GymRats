import { WorkoutSet, WorkoutSession } from '@/src/lib/workoutModel';
import { getExerciseMuscleMaps } from '@/src/data/muscleGroupsManager';

// A simple volume calculation: weight * reps
// Uses the muscle group manager for exercise mappings
function calculateMuscleContribution(
  exerciseId: string,
  weightKg: number,
  reps: number
): Record<string, number> {
  const contributions: Record<string, number> = {};
  const volume = weightKg * reps;
  const EXERCISE_MUSCLE_MAPS = getExerciseMuscleMaps();
  const map = EXERCISE_MUSCLE_MAPS[exerciseId];

  if (!map) return contributions;

  // Primary muscles: 100% contribution
  for (const muscleId of map.primary) {
    contributions[muscleId] = (contributions[muscleId] || 0) + volume * 1.0;
  }

  // Secondary muscles: 50% contribution
  for (const muscleId of map.secondary) {
    contributions[muscleId] = (contributions[muscleId] || 0) + volume * 0.5;
  }

  // Tertiary muscles: 25% contribution
  for (const muscleId of map.tertiary) {
    contributions[muscleId] = (contributions[muscleId] || 0) + volume * 0.25;
  }

  return contributions;
}

export function calculateMuscleVolumes(
  sessions: WorkoutSession[]
): Record<string, number> {

  const muscleVolumes: Record<string, number> = {};

  const allSets = sessions.flatMap((s) => s.sets);

  for (const set of allSets) {
    const contributions = calculateMuscleContribution(
      set.exerciseId,
      set.weightKg || 0,
      set.reps || 0
    );

    for (const [muscleId, volume] of Object.entries(contributions)) {
      muscleVolumes[muscleId] = (muscleVolumes[muscleId] || 0) + volume;
    }
  }

  // Normalize volumes from 0 to 1
  const maxVolume = Math.max(...Object.values(muscleVolumes));

  if (maxVolume === 0) {
    return {};
  }

  const normalizedVolumes: Record<string, number> = {};
  for (const muscleId in muscleVolumes) {
    normalizedVolumes[muscleId] = muscleVolumes[muscleId] / maxVolume;
  }

  return normalizedVolumes;
}
