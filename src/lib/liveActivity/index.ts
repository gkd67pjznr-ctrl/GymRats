// src/lib/liveActivity/index.ts
// Public exports for iOS Live Activity module

// Types
export type {
  WorkoutActivityState,
  StartActivityConfig,
  LiveActivityManagerState,
  LiveActivityResult,
} from './liveActivityTypes';

// Service functions
export {
  isLiveActivityAvailable,
  startWorkoutActivity,
  updateWorkoutActivity,
  endWorkoutActivity,
  getManagerState,
  hasActiveActivity,
} from './liveActivityService';

// Subscription initialization
export { initializeLiveActivitySubscriptions } from './liveActivitySubscriber';
