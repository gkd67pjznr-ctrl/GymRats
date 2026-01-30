// src/lib/workoutReplay/replayTypes.ts
// Data models for Workout Replay feature

export type ReplayPR = {
  exerciseId: string;
  type: 'weight' | 'rep' | 'e1rm';
  value: number;
  previousBest: number;
  setIndex: number;
};

export type ReplayRankChange = {
  exerciseId: string;
  exerciseName: string;
  oldRank: number;
  newRank: number;
  oldTier: string;
  newTier: string;
};

export type ReplayExercise = {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  bestSet: { weight: number; reps: number };
  totalVolume: number;
};

export type WorkoutReplay = {
  sessionId: string;
  userId: string;
  startedAtMs: number;
  endedAtMs: number;
  durationMs: number;
  exercises: ReplayExercise[];
  totalVolume: number;
  setCount: number;
  prsAchieved: ReplayPR[];
  rankChanges: ReplayRankChange[];
  buddySignOff: string;
  buddyId: string;
  buddyName: string;
  buddyTier: string;
};