// src/lib/socialStore.ts
// ORIGINAL VERSION - Migrated to Zustand
// See src/lib/stores/socialStore.ts for new implementation
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import type { AppNotification, Comment, EmoteId, Reaction, WorkoutPost } from "./socialModel";
import { uid } from "./uid"; // [CHANGED 2026-01-23] Centralized uid

const KEY = "social.v1";

/**
 * Local-first store shape.
 * Later we can add pagination cursors and remote sync.
 */
type SocialState = {
  posts: WorkoutPost[];
  reactions: Reaction[]; // per-post reactions
  comments: Comment[];
  notifications: AppNotification[];
};

let state: SocialState = {
  posts: [],
  reactions: [],
  comments: [],
  notifications: [],
};

let hydrated = false;
const listeners = new Set<() => void>();

// [FIX 2026-01-23] Queue for sequential persistence (fixes race condition BUG-005)
let persistQueue: Promise<void> = Promise.resolve();

function notify() {
  for (const fn of listeners) fn();
}

// [REMOVED 2026-01-23] uid() now imported from ./uid

/**
 * Persist to AsyncStorage with sequential queuing.
 * Prevents race conditions when reacting/commenting rapidly.
 */
async function persist() {
  // Chain this write after the previous one completes
  persistQueue = persistQueue.then(async () => {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to persist social state:', err);
      // Don't throw - app still works in-memory
    }
  });

  return persistQueue;
}

async function load(): Promise<SocialState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SocialState;
  } catch {
    return null;
  }
}

export async function hydrateSocialStore(): Promise<void> {
  if (hydrated) return;
  hydrated = true;

  const loaded = await load();
  if (loaded) state = loaded;
  else seedMockData();

  notify();
}

export function subscribeSocial(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---------- Selectors ----------
export function getFeedAll(): WorkoutPost[] {
  return state.posts.slice().sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export function getPostById(id: string): WorkoutPost | undefined {
  return state.posts.find((p) => p.id === id);
}

export function getCommentsForPost(postId: string): Comment[] {
  return state.comments
    .filter((c) => c.postId === postId)
    .slice()
    .sort((a, b) => a.createdAtMs - b.createdAtMs);
}

export function getReactionsForPost(postId: string): Reaction[] {
  return state.reactions
    .filter((r) => r.postId === postId)
    .slice()
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export function getMyReactionForPost(postId: string, myUserId: string): Reaction | undefined {
  return state.reactions.find((r) => r.postId === postId && r.userId === myUserId);
}

// ---------- Mutations (local-only for now) ----------
export function createPost(input: Omit<WorkoutPost, "id" | "likeCount" | "commentCount">): WorkoutPost {
  const post: WorkoutPost = {
    ...input,
    id: uid(),
    likeCount: 0,
    commentCount: 0,
  };

  state = {
    ...state,
    posts: [post, ...state.posts],
  };

  persist();
  notify();
  return post;
}

export function toggleReaction(postId: string, myUserId: string, emote: EmoteId): void {
  const post = getPostById(postId);
  if (!post) return;

  const existing = getMyReactionForPost(postId, myUserId);

  // remove reaction if same emote tapped again
  if (existing && existing.emote === emote) {
    state = {
      ...state,
      reactions: state.reactions.filter((r) => r.id !== existing.id),
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, likeCount: Math.max(0, p.likeCount - 1) } : p
      ),
    };
    persist();
    notify();
    return;
  }

  // if different emote: replace
  if (existing) {
    state = {
      ...state,
      reactions: state.reactions.map((r) => (r.id === existing.id ? { ...r, emote } : r)),
    };
    persist();
    notify();
    return;
  }

  // new reaction
  const r: Reaction = {
    id: uid(),
    postId,
    userId: myUserId,
    emote,
    createdAtMs: Date.now(),
  };

  state = {
    ...state,
    reactions: [r, ...state.reactions],
    posts: state.posts.map((p) => (p.id === postId ? { ...p, likeCount: p.likeCount + 1 } : p)),
  };

  persist();
  notify();
}

export function addComment(postId: string, myUserId: string, myDisplayName: string, text: string): Comment | null {
  const post = getPostById(postId);
  if (!post) return null;

  const trimmed = text.trim();
  if (!trimmed) return null;

  const c: Comment = {
    id: uid(),
    postId,
    userId: myUserId,
    userDisplayName: myDisplayName,
    text: trimmed,
    createdAtMs: Date.now(),
  };

  state = {
    ...state,
    comments: [...state.comments, c],
    posts: state.posts.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)),
  };

  persist();
  notify();
  return c;
}

// ---------- Hooks ----------
export function useFeedAll(): WorkoutPost[] {
  const [data, setData] = useState(getFeedAll());

  useEffect(() => {
    hydrateSocialStore().catch(() => {});
    return subscribeSocial(() => setData(getFeedAll()));
  }, []);

  return data;
}

export function usePost(postId: string): WorkoutPost | undefined {
  const [p, setP] = useState(getPostById(postId));

  useEffect(() => {
    hydrateSocialStore().catch(() => {});
    return subscribeSocial(() => setP(getPostById(postId)));
  }, [postId]);

  return p;
}

export function usePostComments(postId: string): Comment[] {
  const [cs, setCs] = useState(getCommentsForPost(postId));

  useEffect(() => {
    hydrateSocialStore().catch(() => {});
    return subscribeSocial(() => setCs(getCommentsForPost(postId)));
  }, [postId]);

  return cs;
}

export function usePostReactions(postId: string): Reaction[] {
  const [rs, setRs] = useState(getReactionsForPost(postId));

  useEffect(() => {
    hydrateSocialStore().catch(() => {});
    return subscribeSocial(() => setRs(getReactionsForPost(postId)));
  }, [postId]);

  return rs;
}

export function useMyReaction(postId: string, myUserId: string): Reaction | undefined {
  const [r, setR] = useState(getMyReactionForPost(postId, myUserId));

  useEffect(() => {
    hydrateSocialStore().catch(() => {});
    return subscribeSocial(() => setR(getMyReactionForPost(postId, myUserId)));
  }, [postId, myUserId]);

  return useMemo(() => r, [r]);
}

// ---------- Mock data ----------
function seedMockData() {
  const now = Date.now();

  const posts: WorkoutPost[] = [
    {
      id: uid(),
      authorUserId: "u_demo_1",
      authorDisplayName: "Sarah",
      privacy: "public",
      createdAtMs: now - 1000 * 60 * 30,
      title: "Leg day",
      caption: "Quads were NOT happy.",
      durationSec: 52 * 60,
      completionPct: 0.9,
      exerciseCount: 5,
      setCount: 18,
      likeCount: 3,
      commentCount: 1,
      workoutSnapshot: {
        routineName: "Legs",
        topLines: [
          { exerciseName: "Squat", bestSet: { weightLabel: "185 lb", reps: 5, e1rmLabel: "216 lb" } },
          { exerciseName: "RDL", bestSet: { weightLabel: "165 lb", reps: 8, e1rmLabel: "209 lb" } },
        ],
      },
    },
    {
      id: uid(),
      authorUserId: "u_demo_2",
      authorDisplayName: "TJ",
      privacy: "public",
      createdAtMs: now - 1000 * 60 * 90,
      title: "Bench PR",
      caption: "Hit a clean rep PR today.",
      durationSec: 44 * 60,
      completionPct: 1,
      exerciseCount: 4,
      setCount: 14,
      likeCount: 7,
      commentCount: 2,
      workoutSnapshot: {
        routineName: "Push",
        topLines: [{ exerciseName: "Bench Press", bestSet: { weightLabel: "205 lb", reps: 6, e1rmLabel: "246 lb" } }],
      },
    },
  ];

  state = {
    posts,
    reactions: [],
    comments: [
      {
        id: uid(),
        postId: posts[0].id,
        userId: "u_demo_3",
        userDisplayName: "Mark",
        text: "Absolute savage 😂",
        createdAtMs: now - 1000 * 60 * 10,
      },
    ],
    notifications: [],
  };

  persist();
}
