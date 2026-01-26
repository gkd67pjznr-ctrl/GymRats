// src/lib/feedStore.ts
// ORIGINAL VERSION - Migrated to Zustand
// See src/lib/stores/feedStore.ts for new implementation
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { areFriends, getFriendStatus, hydrateFriends } from "./friendsStore";
import type { ID } from "./socialModel";
import { uid } from "./uid"; // [CHANGED 2026-01-23] Centralized uid

export type PostVisibility = "public" | "friends";

export type FeedPost = {
  id: ID;
  authorUserId: ID;
  createdAtMs: number;
  text: string;
  visibility: PostVisibility;

  // Base "server" counts (mock). Per-user likes are tracked separately.
  baseLikeCount: number;
  baseCommentCount: number;
};

type FeedState = {
  posts: FeedPost[];
  // likesByPostId[postId][userId] = true
  likesByPostId: Record<string, Record<string, boolean>>;
};

const KEY = "feed.v1";

let state: FeedState = {
  posts: [],
  likesByPostId: {},
};

let hydrated = false;
const listeners = new Set<() => void>();

// [FIX 2026-01-23] Queue for sequential persistence (consistent with other stores)
let persistQueue: Promise<void> = Promise.resolve();

function notify() {
  for (const fn of listeners) fn();
}

async function persist() {
  persistQueue = persistQueue.then(async () => {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to persist feed state:', err);
    }
  });
  return persistQueue;
}

async function load(): Promise<FeedState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FeedState;
  } catch (err) {
    console.error('Failed to load feed state:', err);
    return null;
  }
}

// [REMOVED 2026-01-23] uid() now imported from ./uid

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
export function canUserViewPost(post: FeedPost, viewerUserId: ID): boolean {
  if (viewerUserId === post.authorUserId) return true;

  // Block either way => deny viewing (keeps it simple)
  if (getFriendStatus(viewerUserId, post.authorUserId) === "blocked") return false;
  if (getFriendStatus(post.authorUserId, viewerUserId) === "blocked") return false;

  if (post.visibility === "public") return true;

  // friends visibility
  return areFriends(viewerUserId, post.authorUserId);
}

export function canUserInteractWithPost(post: FeedPost, actorUserId: ID): boolean {
  if (actorUserId === post.authorUserId) return true;

  // Block either way => deny interaction
  if (getFriendStatus(actorUserId, post.authorUserId) === "blocked") return false;
  if (getFriendStatus(post.authorUserId, actorUserId) === "blocked") return false;

  if (post.visibility === "public") return true;

  // friends-only interaction
  return areFriends(actorUserId, post.authorUserId);
}

// ---------- Hydration / subscription ----------
export async function hydrateFeed(): Promise<void> {
  if (hydrated) return;
  hydrated = true;

  // friends store powers gating
  hydrateFriends().catch(() => {});

  const loaded = await load();
  if (loaded) state = loaded;
  else seedMockFeed();

  notify();
}

export function subscribeFeed(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---------- Selectors ----------
export function getAllPosts(): FeedPost[] {
  return state.posts.slice().sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export function getVisiblePostsForUser(viewerUserId: ID): FeedPost[] {
  return getAllPosts().filter((p) => canUserViewPost(p, viewerUserId));
}

export function getPost(postId: ID): FeedPost | null {
  return state.posts.find((p) => p.id === postId) ?? null;
}

export function hasUserLiked(postId: ID, userId: ID): boolean {
  return !!state.likesByPostId[String(postId)]?.[String(userId)];
}

export function getLikeCount(postId: ID): number {
  const post = getPost(postId);
  if (!post) return 0;
  const likes = state.likesByPostId[String(postId)];
  const n = likes ? Object.values(likes).filter(Boolean).length : 0;
  return post.baseLikeCount + n;
}

// ---------- Mutations ----------
export function toggleLike(postId: ID, userId: ID): { ok: boolean; reason?: string } {
  const post = getPost(postId);
  if (!post) return { ok: false, reason: "post_not_found" };

  if (!canUserInteractWithPost(post, userId)) {
    return { ok: false, reason: "not_allowed" };
  }

  const pid = String(postId);
  const uidStr = String(userId);

  const current = !!state.likesByPostId[pid]?.[uidStr];

  const nextLikesForPost = {
    ...(state.likesByPostId[pid] ?? {}),
    [uidStr]: !current,
  };

  const nextLikesByPostId = {
    ...state.likesByPostId,
    [pid]: nextLikesForPost,
  };

  state = { ...state, likesByPostId: nextLikesByPostId };
  persist().catch(() => {});
  notify();

  return { ok: true };
}

export function createPost(opts: {
  authorUserId: ID;
  text: string;
  visibility?: PostVisibility;
}): FeedPost {
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

  state = { ...state, posts: [post, ...state.posts] };
  persist().catch(() => {});
  notify();

  return post;
}

// ---------- Hooks ----------
export function useVisibleFeed(viewerUserId: ID): {
  posts: FeedPost[];
  likeCount: (postId: ID) => number;
  liked: (postId: ID) => boolean;
} {
  const [posts, setPosts] = useState<FeedPost[]>(getVisiblePostsForUser(viewerUserId));

  useEffect(() => {
    hydrateFeed().catch(() => {});
    return subscribeFeed(() => setPosts(getVisiblePostsForUser(viewerUserId)));
  }, [viewerUserId]);

  const likeCount = useMemo(() => (postId: ID) => getLikeCount(postId), []);
  const liked = useMemo(() => (postId: ID) => hasUserLiked(postId, viewerUserId), [viewerUserId]);

  return { posts, likeCount, liked };
}

// ---------- Mock seed ----------
function seedMockFeed() {
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

  state = {
    posts,
    likesByPostId: {},
  };

  persist().catch(() => {});
}
