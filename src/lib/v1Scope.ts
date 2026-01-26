// src/lib/v1Scope.ts

export type V1Scope = {
  // Core loop
  enableLiveWorkout: boolean;
  enableWorkoutFinishAndSave: boolean;
  enablePlanMode: boolean;

  // Ranks / scoring
  enableRanks: boolean;
  enablePRCues: boolean;

  // Social
  enableFeed: boolean;
  enablePostWorkoutToFeed: boolean;
  enableLikes: boolean;
  enableFriendsFeed: boolean;

  // Explicitly not-v1
  enableComments: boolean;
  enableChat: boolean;
  enableStore: boolean;
  enableEmoteBundles: boolean;
  enableHealthIntegration: boolean;
  enableMusicIntegration: boolean;
};

export const V1: V1Scope = {
  enableLiveWorkout: true,
  enableWorkoutFinishAndSave: true,
  enablePlanMode: true,

  enableRanks: true,
  enablePRCues: true,

  enableFeed: true,
  enablePostWorkoutToFeed: true,
  enableLikes: true,
  enableFriendsFeed: true,

  enableComments: false,
  enableChat: false,
  enableStore: false,
  enableEmoteBundles: false,
  enableHealthIntegration: false,
  enableMusicIntegration: false,
};

export function isV1Enabled<K extends keyof V1Scope>(key: K): boolean {
  return !!V1[key];
}
