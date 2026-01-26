// src/lib/stores/feedStore.ts
// Zustand store for feed posts with AsyncStorage persistence
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ID } from "../socialModel";
import { uid } from "../uid";

// Import from new Zustand friendsStore location
import {
  areFriends as checkAreFriends,
  getFriendStatus,
} from "./friendsStore";

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
};

interface FeedState {
  posts: FeedPost[];
  likesByPostId: Record<string, Record<string, boolean>>;
  hydrated: boolean;

  // Actions
  toggleLike: (postId: ID, userId: ID) => { ok: boolean; reason?: string };
  createPost: (opts: { authorUserId: ID; text: string; visibility?: PostVisibility }) => FeedPost;
  setHydrated: (value: boolean) => void;
}

// Mock seed data for fresh installs
function seedMockFeed(): { posts: FeedPost[]; likesByPostId: Record<string, Record<string, boolean>> } {
  const now = Date.now();
  const ME: ID = "u_demo_me";

  const posts: FeedPost[] = [
    {
      id: "p_1" as ID,
      authorUserId: "u_demo_4" as ID,
      createdAtMs: now - 1000 * 60 * 12,
      text: "Zone 2 + mobility. I'm trying to become unbreakable 😤",
      visibility: "public",
      baseLikeCount: 14,
      baseCommentCount: 2,
    },
    {
      id: "p_2" as ID,
      authorUserId: "u_demo_1" as ID,
      createdAtMs: now - 1000 * 60 * 42,
      text: "Leg day. Again. Someone stop me.",
      visibility: "public",
      baseLikeCount: 28,
      baseCommentCount: 6,
    },
    {
      id: "p_3" as ID,
      authorUserId: "u_demo_3" as ID,
      createdAtMs: now - 1000 * 60 * 90,
      text: "Bench felt light today. The arc is real.",
      visibility: "friends",
      baseLikeCount: 9,
      baseCommentCount: 1,
    },
    {
      id: "p_4" as ID,
      authorUserId: "u_demo_2" as ID,
      createdAtMs: now - 1000 * 60 * 180,
      text: "Caffeine + heavy singles = spiritual experience.",
      visibility: "public",
      baseLikeCount: 21,
      baseCommentCount: 3,
    },
    {
      id: "p_5" as ID,
      authorUserId: ME,
      createdAtMs: now - 1000 * 60 * 260,
      text: "Ship it. Small wins stack.",
      visibility: "friends",
      baseLikeCount: 3,
      baseCommentCount: 0,
    },
  ];

  return { posts, likesByPostId: {} };
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
        };

        set((state) => ({
          posts: [post, ...state.posts],
        }));

        return post;
      },

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        posts: state.posts,
        likesByPostId: state.likesByPostId,
      }),
      onRehydrateStorage: () => (state) => {
        // V1 to V2 migration
        AsyncStorage.getItem("feed.v1").then((v1Data) => {
          if (v1Data && state) {
            try {
              const parsed = JSON.parse(v1Data) as { posts: FeedPost[]; likesByPostId: Record<string, Record<string, boolean>> };
              if (parsed.posts && parsed.posts.length > 0 && state.posts.length === 0) {
                state.posts = parsed.posts;
                state.likesByPostId = parsed.likesByPostId ?? {};
                AsyncStorage.removeItem("feed.v1");
              }
            } catch (e) {
              console.error("[feedStore] Migration failed:", e);
            }
          }

          // Seed mock data if empty
          if (state && state.posts.length === 0) {
            const mockData = seedMockFeed();
            state.posts = mockData.posts;
            state.likesByPostId = mockData.likesByPostId;
          }

          state?.setHydrated(true);
        });
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
  const posts = useFeedStore(selectVisiblePostsForUser(viewerUserId));
  const likeCount = useFeedStore((state) => (postId: ID) => selectLikeCount(postId)(state));
  const liked = useFeedStore((state) => (postId: ID) => selectHasUserLiked(postId, viewerUserId)(state));

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

export function toggleLike(postId: string, userId: string): { ok: boolean; reason?: string } {
  return useFeedStore.getState().toggleLike(postId, userId);
}
