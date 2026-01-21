export type RoutineExercise = {
  id: string; // unique within routine
  exerciseId: string; // from your exercise DB
  note?: string;

  // v1 targets (optional)
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
};

export type Routine = {
  id: string;
  name: string;
  createdAtMs: number;
  updatedAtMs: number;
  exercises: RoutineExercise[];
  sourcePlanId?: string;
  sourcePlanCategory?: string;
};

export function uid(): string {
  return Math.random().toString(16).slice(2) + "-" + Math.random().toString(16).slice(2);
}
