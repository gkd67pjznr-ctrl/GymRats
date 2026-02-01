// src/lib/sync/index.ts
// Main export file for sync system

// Core types
export * from './syncTypes';

// Network monitoring
export { networkMonitor, useNetworkState, useIsOnline } from './NetworkMonitor';

// Sync orchestrator
export {
  syncOrchestrator,
  initializeSync,
  useSyncStatus,
  useIsSyncing,
  useSyncStats,
} from './SyncOrchestrator';

// Pending operations queue
export {
  pendingOperationsQueue,
  getPendingCounts,
} from './PendingOperationsQueue';

// Conflict resolution
export {
  resolveByTimestamp,
  resolveWorkoutConflict,
  resolveRoutineConflict,
  resolveFriendConflict,
  resolvePostConflict,
  mergeArrayById,
} from './ConflictResolver';

// Realtime manager
export {
  realtimeManager,
  subscribeToUserPosts,
  subscribeToUserFriendships,
  subscribeToPostReactions,
  subscribeToPostComments,
  subscribeToUserNotifications,
} from './RealtimeManager';

// Repositories
export { workoutRepository } from './repositories/workoutRepository';
export { routineRepository } from './repositories/routineRepository';
export { friendRepository } from './repositories/friendRepository';
export { postRepository } from './repositories/postRepository';
export { reactionRepository } from './repositories/reactionRepository';
export { commentRepository } from './repositories/commentRepository';
export { notificationRepository } from './repositories/notificationRepository';
export { userProfileRepository } from './repositories/userProfileRepository';

// Repository types
export type { WorkoutRepository } from './repositories/workoutRepository';
export type { RoutineRepository } from './repositories/routineRepository';
export type { FriendRepository } from './repositories/friendRepository';
export type { PostRepository } from './repositories/postRepository';
export type { ReactionRepository } from './repositories/reactionRepository';
export type { CommentRepository } from './repositories/commentRepository';
export type { NotificationRepository } from './repositories/notificationRepository';
export type { UserProfile } from './repositories/userProfileRepository';

// Re-export sync status getters from stores
export { getWorkoutSyncStatus } from '../stores/workoutStore';
export { getRoutinesSyncStatus } from '../stores/routinesStore';
export { getWorkoutPlanSyncStatus } from '../stores/workoutPlanStore';
export { getFriendsSyncStatus, setupFriendsRealtime } from '../stores/friendsStore';
export { getSocialSyncStatus, setupPostsRealtime, setupReactionsRealtime, setupCommentsRealtime } from '../stores/socialStore';
export { getFeedSyncStatus } from '../stores/feedStore';
export { getChatSyncStatus, setupChatRealtime, setupTypingRealtime, broadcastTyping } from '../stores/chatStore';
export { registerSyncStores } from './registerStores';
