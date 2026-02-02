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
  getWorkoutSyncStatus,
  getPersonalBests,
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

// Current workout plan
export {
  useWorkoutPlanStore,
  useCurrentPlan,
  useIsHydrated as usePlanHydrated,
  getCurrentPlan,
  getIsHydrated as getPlanHydrated,
  setCurrentPlan,
  updateCurrentPlan,
  clearCurrentPlan,
  hydrateWorkoutPlanStore,
  subscribeCurrentPlan,
  selectPlan,
  selectIsHydrated,
  getWorkoutPlanSyncStatus,
} from "./workoutPlanStore";

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
  getRoutinesSyncStatus,
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
  getFriendsSyncStatus,
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
  getSocialSyncStatus,
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
  getFeedSyncStatus,
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
  getChatSyncStatus,
} from "./chatStore";

// Personality
export {
  usePersonalityStore,
  usePersonality,
  useAllPersonalities,
  usePersonalityCue,
  getSelectedPersonality,
  getPersonalityCue,
  getPRCue,
  setPersonality,
  getAllPersonalitiesList,
} from "./personalityStore";

export type {
  Personality,
  CueContext,
  CueIntensity,
} from "../celebration/personalities";

// Gamification (XP, Currency, Shop)
export {
  useGamificationStore,
  useGamificationProfile,
  useIsGamificationHydrated,
  usePendingLevelUp,
  useCurrentLevel,
  useTotalXP,
  useCurrentStreak,
  useForgeTokens,
  useInventory,
  useOwnedItems,
  useShopItems,
  addGamificationXP,
  addGamificationTokens,
  updateGamificationStreak,
  processGamificationWorkout,
  dismissGamificationLevelUp,
  purchaseShopItem,
  equipShopItem,
  getUserInventory,
} from "./gamificationStore";

// Live workout session state
export {
  useLiveWorkoutStore,
  useLiveWorkoutSets,
  useLiveWorkoutWeightLb,
  useLiveWorkoutReps,
  useLiveWorkoutWeightLbText,
  useLiveWorkoutRepsText,
  useLiveWorkoutWeightStep,
  useLiveWorkoutDefaultsByExerciseId,
  useLiveWorkoutDoneBySetId,
  useLiveWorkoutFullState,
  getLiveWorkoutSets,
  getLiveWorkoutWeightLb,
  getLiveWorkoutReps,
  getLiveWorkoutSummary,
  type LiveWorkoutState,
} from "./liveWorkoutStore";

// Training journal
export {
  useJournalStore,
  useJournalEntries,
  useJournalEntry,
  useJournalEntriesForDate,
  useJournalEntryForSession,
  addJournalEntry,
  updateJournalEntry,
  removeJournalEntry,
} from "./journalStore";

export type { JournalEntry } from "../journalModel";

// Body Model (temporarily disabled due to missing module)
// export {
//   BodyModel,
//   CompactBodyModel,
//   calculateMuscleVolume,
//   type MuscleVolumeData,
// } from "../lib/bodyModel";

// Shop Items (from gamification module)
export {
  SHOP_ITEMS,
  getShopItemsByCategory,
  getShopItem,
  getRarityColor,
  type UserInventory,
  type ShopItem,
  type ShopCategory,
} from "../gamification/shop";
