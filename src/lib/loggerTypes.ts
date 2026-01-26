export type SetType = "warmup" | "working";

export type LoggedSet = {
  id: string;
  exerciseId: string;
  setType: SetType;
  weightKg: number;
  reps: number;
  timestampMs: number;
};