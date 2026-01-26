// src/lib/stores/index.ts
// Central export for all Zustand stores

// Workout history
export {
  useWorkoutStore,
  useWorkoutSessions,
  getWorkoutSessions,
  getWorkoutSessionById,
  addWorkoutSession,
  clearWorkoutSessions,
} from "./workoutStore";

// Current active session
export {
  useCurrentSessionStore,
  useCurrentSession,
  useIsHydrated,
  getCurrentSession,
  getIsHydrated,
  hasCurrentSession,
  ensureCurrentSession,
  updateCurrentSession,
  setCurrentSession,
  clearCurrentSession,
  getCurrentSessionSummary,
  setupAppStatePersistenceListener,
  flushPendingWrites,
  type CurrentSession,
} from "./currentSessionStore";

// User routines
export {
  useRoutinesStore,
  useRoutines,
  useRoutine,
  getRoutines,
  getRoutineById,
  upsertRoutine,
  deleteRoutine,
  clearRoutines,
} from "./routinesStore";

// App settings
export {
  useSettingsStore,
  useSettings,
  getSettings,
  updateSettings,
  type Settings,
} from "./settingsStore";

// Authentication
export {
  useAuthStore,
  useAuth,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  getUser,
  getSession,
  isAuthenticated,
  setupAuthListener,
  type UserProfile,
} from "./authStore";

// Friends
export {
  useFriendsStore,
  useFriendEdges,
  useFriendStatus,
  getFriendEdges,
  getFriendStatus,
  areFriends,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  blockUser,
  hydrateFriends,
  subscribeFriends,
} from "./friendsStore";

// Social (posts, reactions, comments)
export {
  useSocialStore,
  useFeedAll,
  usePost,
  usePostComments,
  usePostReactions,
  useMyReaction,
  getFeedAll,
  getPostById,
  getCommentsForPost,
  getReactionsForPost,
  getMyReactionForPost,
  createPost as createSocialPost,
  toggleReaction,
  addComment,
  hydrateSocialStore,
  subscribeSocial,
} from "./socialStore";

// Feed
export {
  useFeedStore,
  useVisibleFeed,
  getAllPosts,
  getVisiblePostsForUser,
  getPost as getFeedPost,
  hasUserLiked,
  getLikeCount,
  toggleLike,
  createPost as createFeedPost,
  canUserViewPost,
  canUserInteractWithPost,
  areFriends as feedAreFriends,
  hydrateFeed,
  subscribeFeed,
  type PostVisibility,
  type FeedPost,
} from "./feedStore";

// Chat
export {
  useChatStore,
  useThreads,
  useThread,
  useThreadMessages,
  useUnreadCount,
  useThreadOtherUserId,
  useOtherUserTyping,
  getThreadsForUser,
  getThread as getChatThread,
  getMessagesForThread,
  getLastReadAt,
  getUnreadCount as getChatUnreadCount,
  ensureThread,
  sendMessage,
  markThreadRead,
  setTyping,
  getIsUserTyping,
  getOtherUserId,
  canUserMessageThread,
  hydrateChat,
  subscribeChat,
} from "./chatStore";
