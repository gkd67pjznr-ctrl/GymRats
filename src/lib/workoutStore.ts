import { useEffect, useState } from "react";
import type { WorkoutSession } from "./workoutModel";

let sessions: WorkoutSession[] = [];
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

export function addWorkoutSession(session: WorkoutSession) {
  sessions = [session, ...sessions];
  notify();
}

export function getWorkoutSessions(): WorkoutSession[] {
  return sessions;
}

export function clearWorkoutSessions() {
  sessions = [];
  notify();
}

export function subscribeWorkoutSessions(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useWorkoutSessions(): WorkoutSession[] {
  const [data, setData] = useState(getWorkoutSessions());

  useEffect(() => {
    return subscribeWorkoutSessions(() => setData(getWorkoutSessions()));
  }, []);

  return data;
}
