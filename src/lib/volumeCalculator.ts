import { WorkoutSet, WorkoutSession } from '@/src/lib/workoutModel';
import { EXERCISE_MUSCLE_MAPPING } from '@/src/data/exerciseMuscleMapping';

// A simple volume calculation: weight * reps
// Primary muscles get 100% of the volume from a set
// Secondary muscles get 50% of the volume
export function calculateMuscleVolumes(
  sessions: WorkoutSession[]
): Record<string, number> {

  const muscleVolumes: Record<string, number> = {};

  const allSets = sessions.flatMap((s) => s.sets);

  for (const set of allSets) {
    const mapping = EXERCISE_MUSCLE_MAPPING.find(
      (m) => m.exerciseId === set.exerciseId
    );

    if (!mapping) {
      continue;
    }

    const volume = (set.weightKg || 0) * (set.reps || 0);

    for (const muscleId of mapping.primary) {
      muscleVolumes[muscleId] = (muscleVolumes[muscleId] || 0) + volume;
    }

    for (const muscleId of mapping.secondary) {
      muscleVolumes[muscleId] = (muscleVolumes[muscleId] || 0) + volume * 0.5;
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
