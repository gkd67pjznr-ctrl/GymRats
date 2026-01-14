export type PlannedExercise = {
  exerciseId: string;
  targetSets: number; // default 3
  targetRepsMin?: number;
  targetRepsMax?: number;
};

export type WorkoutPlan = {
  id: string;
  createdAtMs: number;

  // If started from a routine
  routineId?: string;
  routineName?: string;

  exercises: PlannedExercise[];

  // progress (live)
  currentExerciseIndex: number;
  completedSetsByExerciseId: Record<string, number>;
};

export function uid(): string {
  return Math.random().toString(16).slice(2) + "-" + Math.random().toString(16).slice(2);
}

export function makePlanFromRoutine(args: {
  routineId: string;
  routineName: string;
  exercises: PlannedExercise[];
}): WorkoutPlan {
  return {
    id: uid(),
    createdAtMs: Date.now(),
    routineId: args.routineId,
    routineName: args.routineName,
    exercises: args.exercises,
    currentExerciseIndex: 0,
    completedSetsByExerciseId: {},
  };
}

export function makeFreePlan(): WorkoutPlan {
  return {
    id: uid(),
    createdAtMs: Date.now(),
    exercises: [],
    currentExerciseIndex: 0,
    completedSetsByExerciseId: {},
  };
}
