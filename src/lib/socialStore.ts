// src/lib/socialStore.ts
// RE-EXPORT: This file now re-exports from the new Zustand store location
// All functionality has been migrated to src/lib/stores/socialStore.ts

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
  createPost,
  toggleReaction,
  addComment,
  hydrateSocialStore,
  subscribeSocial,
} from "./stores/socialStore";
