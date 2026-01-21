import { useState, useEffect, useCallback, useRef } from "react";
import type { PlanExercise } from "../premadePlans/types";
import type { LoggedSet } from "../loggerTypes";
import {
  calculateWorkoutEstimate,
  estimateFromLoggedSets,
  calculatePaceStatus,
  getEstimatedFinishTime,
  formatFinishTime,
  formatMinutes,
  getPaceMessage,
  getPaceColor,
  type TimeEstimate,
} from "../workoutTimer/estimator";

export interface UseWorkoutTimerOptions {
  exercises?: PlanExercise[];
  loggedSets?: LoggedSet[];
  startedAtMs?: number;
}

export interface WorkoutTimerResult {
  // Time tracking
  elapsedSeconds: number;
  elapsedDisplay: string;
  
  // Estimation
  estimatedTotalMinutes: number;
  estimatedTotalDisplay: string;
  estimatedFinishTime: string;
  
  // Pace tracking
  paceStatus: 'ahead' | 'on-pace' | 'behind' | 'way-behind';
  paceMessage: string;
  paceColor: string;
  paceDeltaSeconds: number;
  
  // Breakdown
  breakdown: TimeEstimate['breakdown'];
  
  // Control
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

/**
 * Hook for workout timer with smart estimation
 */
export function useWorkoutTimer(options: UseWorkoutTimerOptions = {}): WorkoutTimerResult {
  const { exercises = [], loggedSets = [], startedAtMs } = options;
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(startedAtMs || Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate initial estimate
  const estimate = exercises.length > 0
    ? calculateWorkoutEstimate(exercises)
    : estimateFromLoggedSets(loggedSets);
  
  const totalEstimatedSeconds = estimate.totalMinutes * 60;
  
  // Calculate total sets for pace tracking
  const totalEstimatedSets = exercises.length > 0
    ? exercises.reduce((sum, ex) => sum + ex.targetSets, 0)
    : loggedSets.length;
  
  const completedSets = loggedSets.length;
  
  // Calculate pace
  const pace = calculatePaceStatus(
    elapsedSeconds,
    completedSets,
    totalEstimatedSets,
    totalEstimatedSeconds
  );
  
  // Auto-start if startedAtMs provided
  useEffect(() => {
    if (startedAtMs && !isRunning) {
      start();
    }
  }, [startedAtMs]);
  
  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);
  
  const start = useCallback(() => {
    startTimeRef.current = Date.now() - (elapsedSeconds * 1000);
    setIsRunning(true);
  }, [elapsedSeconds]);
  
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);
  
  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();
  }, []);
  
  // Format displays
  const elapsedMins = Math.floor(elapsedSeconds / 60);
  const elapsedSecs = elapsedSeconds % 60;
  const elapsedDisplay = `${elapsedMins}:${String(elapsedSecs).padStart(2, '0')}`;
  
  const estimatedTotalDisplay = formatMinutes(estimate.totalMinutes);
  
  const finishTime = getEstimatedFinishTime(
    startTimeRef.current,
    totalEstimatedSeconds,
    elapsedSeconds,
    -pace.deltaSeconds // Adjust for current pace
  );
  const estimatedFinishTime = formatFinishTime(finishTime);
  
  return {
    elapsedSeconds,
    elapsedDisplay,
    estimatedTotalMinutes: estimate.totalMinutes,
    estimatedTotalDisplay,
    estimatedFinishTime,
    paceStatus: pace.status,
    paceMessage: getPaceMessage(pace.status, pace.deltaSeconds),
    paceColor: getPaceColor(pace.status),
    paceDeltaSeconds: pace.deltaSeconds,
    breakdown: estimate.breakdown,
    isRunning,
    start,
    pause,
    reset,
  };
}
