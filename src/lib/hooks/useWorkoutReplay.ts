// src/lib/hooks/useWorkoutReplay.ts
// Hook for workout replay functionality

import { useCallback } from 'react';
import type { WorkoutSession } from '../workoutModel';
import { prepareWorkoutReplay, formatDuration } from '../workoutReplay/replayService';
import type { WorkoutReplay } from '../workoutReplay/replayTypes';

export function useWorkoutReplay() {
  const prepareReplay = useCallback((session: WorkoutSession): WorkoutReplay => {
    return prepareWorkoutReplay(session);
  }, []);

  const formatReplayDuration = useCallback((ms: number): string => {
    return formatDuration(ms);
  }, []);

  return {
    prepareReplay,
    formatReplayDuration
  };
}