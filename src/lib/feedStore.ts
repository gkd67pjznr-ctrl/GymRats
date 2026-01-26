// src/lib/feedStore.ts
// RE-EXPORT: This file now re-exports from the new Zustand store location
// All functionality has been migrated to src/lib/stores/feedStore.ts

export {
  useFeedStore,
  useVisibleFeed,
  getAllPosts,
  getVisiblePostsForUser,
  getPost,
  hasUserLiked,
  getLikeCount,
  toggleLike,
  createPost,
  canUserViewPost,
  canUserInteractWithPost,
  areFriends,
  hydrateFeed,
  subscribeFeed,
  type PostVisibility,
  type FeedPost,
} from "./stores/feedStore";
