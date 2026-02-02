// src/lib/stores/feedStore.ts
// Zustand store for feed posts with AsyncStorage persistence and Supabase sync
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import type { ID, WorkoutPost } from "../socialModel";
import { uid } from "../uid";
import { logError } from "../errorHandler";
import { safeJSONParse } from "../storage/safeJSONParse";
import type { SyncMetadata } from "../sync/syncTypes";
import { getUser } from "./authStore";
import { postRepository } from "../sync/repositories/postRepository";
import { networkMonitor } from "../sync/NetworkMonitor";

// Import from new Zustand friendsStore location
import {
  areFriends as checkAreFriends,
  getFriendStatus,
} from "./friendsStore";
import { useCallback, useMemo } from "react";
import { shallow } from "zustand/shallow";

const STORAGE_KEY = "feed.v2";

export type PostVisibility = "public" | "friends";

export type FeedPost = {
  id: ID;
  authorUserId: ID;
  createdAtMs: number;
  text: string;
  visibility: PostVisibility;
  baseLikeCount: number;
  baseCommentCount: number;
  photoUrl?: string;
};

interface FeedState {
  posts: FeedPost[];
  likesByPostId: Record<string, Record<string, boolean>>;
  hydrated: boolean;
  _sync: SyncMetadata;

  // Actions
  toggleLike: (postId: ID, userId: ID) => { ok: boolean; reason?: string };
  createPost: (opts: { authorUserId: ID; text: string; visibility?: PostVisibility; photoUrl?: string }) => FeedPost;
  setHydrated: (value: boolean) => void;

  // Sync actions
  pullFromServer: () => Promise<void>;
  pushToServer: () => Promise<void>;
  sync: () => Promise<void>;
}

/**
 * Visibility rules (viewing):
 * - public: anyone can view
 * - friends: author + friends can view
 *
 * Interaction rules (like/comment):
 * - public: anyone can interact (unless blocked)
 * - friends: only friends can interact (unless blocked)
 *
 * Block rules:
 * - if either side has blocked the other, deny interaction/view as appropriate.
 */
function canUserViewPost(post: FeedPost, viewerUserId: ID): boolean {
  if (viewerUserId === post.authorUserId) return true;

  // Block either way => deny viewing (keeps it simple)
  if (getFriendStatus(viewerUserId, post.authorUserId) === "blocked") return false;
  if (getFriendStatus(post.authorUserId, viewerUserId) === "blocked") return false;

  if (post.visibility === "public") return true;

  // friends visibility
  return checkAreFriends(viewerUserId, post.authorUserId);
}

function canUserInteractWithPost(post: FeedPost, actorUserId: ID): boolean {
  if (actorUserId === post.authorUserId) return true;

  // Block either way => deny interaction
  if (getFriendStatus(actorUserId, post.authorUserId) === "blocked") return false;
  if (getFriendStatus(post.authorUserId, actorUserId) === "blocked") return false;

  if (post.visibility === "public") return true;

  // friends-only interaction
  return checkAreFriends(actorUserId, post.authorUserId);
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      posts: [],
      likesByPostId: {},
      hydrated: false,
      _sync: {
        lastSyncAt: null,
        lastSyncHash: null,
        syncStatus: 'idle',
        syncError: null,
        pendingMutations: 0,
      },

      toggleLike: (postId, userId) => {
        const post = get().posts.find((p) => p.id === postId);
        if (!post) return { ok: false, reason: "post_not_found" };

        if (!canUserInteractWithPost(post, userId)) {
          return { ok: false, reason: "not_allowed" };
        }

        const pid = String(postId);
        const uidStr = String(userId);
        const current = !!get().likesByPostId[pid]?.[uidStr];

        set((state) => ({
          likesByPostId: {
            ...state.likesByPostId,
            [pid]: {
              ...(state.likesByPostId[pid] ?? {}),
              [uidStr]: !current,
            },
          },
        }));

        return { ok: true };
      },

      createPost: (opts) => {
        const now = Date.now();
        const post: FeedPost = {
          id: uid() as unknown as ID,
          authorUserId: opts.authorUserId,
          createdAtMs: now,
          text: opts.text.trim(),
          visibility: opts.visibility ?? "public",
          baseLikeCount: 0,
          baseCommentCount: 0,
          photoUrl: opts.photoUrl,
        };

        set((state) => ({
          posts: [post, ...state.posts],
        }));

        return post;
      },

      setHydrated: (value) => set({ hydrated: value }),

      // Sync actions
      pullFromServer: async () => {
        const user = getUser();
        if (!user) {
          console.warn('[feedStore] Cannot pull: no user signed in');
          return;
        }

        set({ _sync: { ...get()._sync, syncStatus: 'syncing', syncError: null } });

        try {
          // Fetch feed from server
          const remoteWorkoutPosts = await postRepository.fetchFeed({ userId: user.id });
          const remotePosts = remoteWorkoutPosts.map(workoutPostToFeedPost);

          set((state) => ({
            posts: mergeFeedPosts(state.posts, remotePosts),
            _sync: {
              ...state._sync,
              syncStatus: 'success',
              lastSyncAt: Date.now(),
            },
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          set((state) => ({
            _sync: {
              ...state._sync,
              syncStatus: 'error',
              syncError: errorMessage,
            },
          }));
          throw error;
        }
      },

      pushToServer: async () => {
        const user = getUser();
        if (!user) {
          console.warn('[feedStore] Cannot push: no user signed in');
          return;
        }

        if (!networkMonitor.isOnline()) {
          console.warn('[feedStore] Cannot push: offline');
          return;
        }

        try {
          // Feed posts are synced immediately on create
          set((state) => ({
            _sync: {
              ...state._sync,
              pendingMutations: 0,
            },
          }));
        } catch (error) {
          console.error('[feedStore] Push failed:', error);
          throw error;
        }
      },

      sync: async () => {
        await get().pullFromServer();
        await get().pushToServer();
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createQueuedJSONStorage(),
      partialize: (state) => ({
        posts: state.posts,
        likesByPostId: state.likesByPostId,
      }),
      onRehydrateStorage: (state) => {
        // Set hydrated immediately when storage is rehydrated
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectAllPosts = (state: FeedState) =>
  state.posts.slice().sort((a, b) => b.createdAtMs - a.createdAtMs);

export const selectPost = (postId: ID) => (state: FeedState) =>
  state.posts.find((p) => p.id === postId) ?? null;

export const selectHasUserLiked = (postId: ID, userId: ID) => (state: FeedState) =>
  !!state.likesByPostId[String(postId)]?.[String(userId)];

export const selectLikeCount = (postId: ID) => (state: FeedState) => {
  const post = state.posts.find((p) => p.id === postId);
  if (!post) return 0;
  const likes = state.likesByPostId[String(postId)];
  const n = likes ? Object.values(likes).filter(Boolean).length : 0;
  return post.baseLikeCount + n;
};

export const selectVisiblePostsForUser = (viewerUserId: ID) => (state: FeedState) =>
  selectAllPosts(state).filter((p) => canUserViewPost(p, viewerUserId));

// ============================================================================
// Hooks (match old API)
// ============================================================================

export function useVisibleFeed(viewerUserId: ID): {
  posts: FeedPost[];
  likeCount: (postId: ID) => number;
  liked: (postId: ID) => boolean;
} {
  const postsSelector = useMemo(() => selectVisiblePostsForUser(viewerUserId), [viewerUserId]);
  const posts = useFeedStore(postsSelector, shallow);

  // Use stable callbacks that read from the store imperatively.
  // Returning new function references from zustand selectors causes
  // infinite re-renders with shallow comparison.
  const likeCount = useCallback(
    (postId: ID) => getLikeCount(postId),
    []
  );

  const liked = useCallback(
    (postId: ID) => hasUserLiked(postId, viewerUserId),
    [viewerUserId]
  );

  return { posts, likeCount, liked };
}

// ============================================================================
// Imperative getters for non-React code
// ============================================================================

export function getAllPosts(): FeedPost[] {
  return selectAllPosts(useFeedStore.getState());
}

export function getVisiblePostsForUser(viewerUserId: ID): FeedPost[] {
  return selectVisiblePostsForUser(viewerUserId)(useFeedStore.getState());
}

export function getPost(postId: ID): FeedPost | null {
  return selectPost(postId)(useFeedStore.getState());
}

export function hasUserLiked(postId: ID, userId: ID): boolean {
  return selectHasUserLiked(postId, userId)(useFeedStore.getState());
}

export function getLikeCount(postId: ID): number {
  return selectLikeCount(postId)(useFeedStore.getState());
}

// Export policy functions for external use
export { canUserViewPost, canUserInteractWithPost };

// Legacy hydrate function (no-op with Zustand)
export async function hydrateFeed(): Promise<void> {
  // Zustand handles hydration automatically
}

// Legacy subscribe function (no-op with Zustand)
export function subscribeFeed(listener: () => void): () => void {
  return () => {};
}

// Re-export areFriends with local name for backwards compatibility
export const areFriends = checkAreFriends;

// ============================================================================
// Imperative action wrappers for non-React code
// ============================================================================

export function createPost(opts: { authorUserId: ID; text: string; visibility?: PostVisibility; photoUrl?: string }): FeedPost {
  return useFeedStore.getState().createPost(opts);
}

export function toggleLike(postId: string, userId: string): { ok: boolean; reason?: string } {
  return useFeedStore.getState().toggleLike(postId, userId);
}

// ============================================================================
// Sync Helpers
// ============================================================================

/**
 * Convert WorkoutPost from cloud to FeedPost for local storage
 */
function workoutPostToFeedPost(wp: WorkoutPost): FeedPost {
  return {
    id: wp.id,
    authorUserId: wp.authorUserId,
    createdAtMs: wp.createdAtMs,
    text: wp.caption ?? wp.title ?? "",
    visibility: wp.privacy === "public" ? "public" : "friends",
    baseLikeCount: wp.likeCount,
    baseCommentCount: wp.commentCount,
    photoUrl: wp.photoUrls?.[0], // Take first photo if available
  };
}

/**
 * Merge local and remote feed posts
 */
function mergeFeedPosts(local: FeedPost[], remote: FeedPost[]): FeedPost[] {
  const postMap = new Map<string, FeedPost>();

  // Add all local posts
  for (const post of local) {
    postMap.set(String(post.id), post);
  }

  // Add/override with remote posts
  for (const remotePost of remote) {
    postMap.set(String(remotePost.id), remotePost);
  }

  // Return sorted by createdAtMs descending
  return Array.from(postMap.values()).sort(
    (a, b) => b.createdAtMs - a.createdAtMs
  );
}

/**
 * Get sync status for feed store
 */
export function getFeedSyncStatus(): SyncMetadata {
  return useFeedStore.getState()._sync;
}
