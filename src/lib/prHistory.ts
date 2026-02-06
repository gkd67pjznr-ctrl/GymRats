// src/lib/prHistory.ts
// Utilities for extracting and displaying PR history

import { useWorkoutStore } from "./stores/workoutStore";
import { EXERCISES_V1 } from "../data/exercises";
import type { WorkoutSession } from "./workoutModel";

export interface PREvent {
  id: string;
  exerciseId: string;
  exerciseName: string;
  type: "weight" | "rep" | "e1rm";
  value: number;
  sessionId: string;
  timestamp: number;
  workoutName?: string;
}

/**
 * Extract all PR events from workout history
 */
export function extractPRHistory(sessions: WorkoutSession[]): PREvent[] {
  const events: PREvent[] = [];

  for (const session of sessions) {
    const prCount = session.prCount ?? 0;
    if (prCount === 0) continue;

    const weightPRs = session.weightPRs ?? 0;
    const repPRs = session.repPRs ?? 0;
    const e1rmPRs = session.e1rmPRs ?? 0;

    // Get exercises from this session
    const exerciseIds = [...new Set(session.sets.map((s) => s.exerciseId))];

    // Distribute PRs across exercises (simplified - in reality we'd track per-set)
    // For now, attribute PRs to exercises proportionally
    let prIndex = 0;

    // Add weight PRs
    for (let i = 0; i < weightPRs && i < exerciseIds.length; i++) {
      const exerciseId = exerciseIds[i % exerciseIds.length];
      const bestSet = session.sets
        .filter((s) => s.exerciseId === exerciseId)
        .sort((a, b) => b.weightKg - a.weightKg)[0];

      events.push({
        id: `${session.id}-weight-${prIndex++}`,
        exerciseId,
        exerciseName: getExerciseName(exerciseId),
        type: "weight",
        value: bestSet?.weightKg ?? 0,
        sessionId: session.id,
        timestamp: session.endedAtMs,
        workoutName: session.routineName,
      });
    }

    // Add rep PRs
    for (let i = 0; i < repPRs && i < exerciseIds.length; i++) {
      const exerciseId = exerciseIds[i % exerciseIds.length];
      const bestSet = session.sets
        .filter((s) => s.exerciseId === exerciseId)
        .sort((a, b) => b.reps - a.reps)[0];

      events.push({
        id: `${session.id}-rep-${prIndex++}`,
        exerciseId,
        exerciseName: getExerciseName(exerciseId),
        type: "rep",
        value: bestSet?.reps ?? 0,
        sessionId: session.id,
        timestamp: session.endedAtMs,
        workoutName: session.routineName,
      });
    }

    // Add e1RM PRs
    for (let i = 0; i < e1rmPRs && i < exerciseIds.length; i++) {
      const exerciseId = exerciseIds[i % exerciseIds.length];
      const bestSet = session.sets
        .filter((s) => s.exerciseId === exerciseId)
        .sort((a, b) => {
          const e1rmA = a.weightKg * (1 + a.reps / 30);
          const e1rmB = b.weightKg * (1 + b.reps / 30);
          return e1rmB - e1rmA;
        })[0];

      const e1rm = bestSet ? bestSet.weightKg * (1 + bestSet.reps / 30) : 0;

      events.push({
        id: `${session.id}-e1rm-${prIndex++}`,
        exerciseId,
        exerciseName: getExerciseName(exerciseId),
        type: "e1rm",
        value: Math.round(e1rm * 10) / 10,
        sessionId: session.id,
        timestamp: session.endedAtMs,
        workoutName: session.routineName,
      });
    }
  }

  // Sort by timestamp descending (most recent first)
  return events.sort((a, b) => b.timestamp - a.timestamp);
}

function getExerciseName(exerciseId: string): string {
  return EXERCISES_V1.find((e) => e.id === exerciseId)?.name ?? exerciseId;
}

/**
 * Group PRs by date
 */
export function groupPRsByDate(events: PREvent[]): Record<string, PREvent[]> {
  const grouped: Record<string, PREvent[]> = {};

  for (const event of events) {
    const date = new Date(event.timestamp).toISOString().split("T")[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  }

  return grouped;
}

/**
 * Filter PRs by type
 */
export function filterPRsByType(
  events: PREvent[],
  type: "all" | "weight" | "rep" | "e1rm"
): PREvent[] {
  if (type === "all") return events;
  return events.filter((e) => e.type === type);
}

/**
 * Filter PRs by exercise
 */
export function filterPRsByExercise(
  events: PREvent[],
  exerciseId: string | null
): PREvent[] {
  if (!exerciseId) return events;
  return events.filter((e) => e.exerciseId === exerciseId);
}

/**
 * Get PR stats summary
 */
export function getPRStats(events: PREvent[]): {
  total: number;
  weight: number;
  rep: number;
  e1rm: number;
  exerciseCount: number;
} {
  const exerciseIds = new Set(events.map((e) => e.exerciseId));
  return {
    total: events.length,
    weight: events.filter((e) => e.type === "weight").length,
    rep: events.filter((e) => e.type === "rep").length,
    e1rm: events.filter((e) => e.type === "e1rm").length,
    exerciseCount: exerciseIds.size,
  };
}
