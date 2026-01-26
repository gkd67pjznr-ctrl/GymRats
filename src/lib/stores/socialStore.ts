// src/lib/stores/socialStore.ts
// Zustand store for social posts, reactions, comments with AsyncStorage persistence
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppNotification, Comment, EmoteId, Reaction, WorkoutPost } from "../socialModel";
import { uid } from "../uid";

const STORAGE_KEY = "social.v2";

interface SocialState {
  posts: WorkoutPost[];
  reactions: Reaction[];
  comments: Comment[];
  notifications: AppNotification[];
  hydrated: boolean;

  // Actions
  createPost: (input: Omit<WorkoutPost, "id" | "likeCount" | "commentCount">) => WorkoutPost;
  toggleReaction: (postId: string, myUserId: string, emote: EmoteId) => void;
  addComment: (postId: string, myUserId: string, myDisplayName: string, text: string) => Comment | null;
  setHydrated: (value: boolean) => void;
}

// Mock seed data for fresh installs
function seedMockData(): {
  posts: WorkoutPost[];
  reactions: Reaction[];
  comments: Comment[];
  notifications: AppNotification[];
} {
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

  const comments: Comment[] = [
    {
      id: uid(),
      postId: posts[0].id,
      userId: "u_demo_3",
      userDisplayName: "Mark",
      text: "Absolute savage 😂",
      createdAtMs: now - 1000 * 60 * 10,
    },
  ];

  return {
    posts,
    reactions: [],
    comments,
    notifications: [],
  };
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      posts: [],
      reactions: [],
      comments: [],
      notifications: [],
      hydrated: false,

      createPost: (input) => {
        const post: WorkoutPost = {
          ...input,
          id: uid(),
          likeCount: 0,
          commentCount: 0,
        };

        set((state) => ({
          posts: [post, ...state.posts],
        }));

        return post;
      },

      toggleReaction: (postId, myUserId, emote) => {
        const post = get().posts.find((p) => p.id === postId);
        if (!post) return;

        const existing = get().reactions.find((r) => r.postId === postId && r.userId === myUserId);

        // Remove reaction if same emote tapped again
        if (existing && existing.emote === emote) {
          set((state) => ({
            reactions: state.reactions.filter((r) => r.id !== existing.id),
            posts: state.posts.map((p) =>
              p.id === postId ? { ...p, likeCount: Math.max(0, p.likeCount - 1) } : p
            ),
          }));
          return;
        }

        // If different emote: replace
        if (existing) {
          set((state) => ({
            reactions: state.reactions.map((r) => (r.id === existing.id ? { ...r, emote } : r)),
          }));
          return;
        }

        // New reaction
        const r: Reaction = {
          id: uid(),
          postId,
          userId: myUserId,
          emote,
          createdAtMs: Date.now(),
        };

        set((state) => ({
          reactions: [r, ...state.reactions],
          posts: state.posts.map((p) => (p.id === postId ? { ...p, likeCount: p.likeCount + 1 } : p)),
        }));
      },

      addComment: (postId, myUserId, myDisplayName, text) => {
        const post = get().posts.find((p) => p.id === postId);
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

        set((state) => ({
          comments: [...state.comments, c],
          posts: state.posts.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)),
        }));

        return c;
      },

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        posts: state.posts,
        reactions: state.reactions,
        comments: state.comments,
        notifications: state.notifications,
      }),
      onRehydrateStorage: () => (state) => {
        // V1 to V2 migration
        AsyncStorage.getItem("social.v1").then((v1Data) => {
          if (v1Data && state) {
            try {
              const parsed = JSON.parse(v1Data) as SocialState;
              if (parsed.posts && parsed.posts.length > 0 && state.posts.length === 0) {
                state.posts = parsed.posts;
                state.reactions = parsed.reactions ?? [];
                state.comments = parsed.comments ?? [];
                state.notifications = parsed.notifications ?? [];
                AsyncStorage.removeItem("social.v1");
              }
            } catch (e) {
              console.error("[socialStore] Migration failed:", e);
            }
          }

          // Seed mock data if empty
          if (state && state.posts.length === 0) {
            const mockData = seedMockData();
            state.posts = mockData.posts;
            state.reactions = mockData.reactions;
            state.comments = mockData.comments;
            state.notifications = mockData.notifications;
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

export const selectFeedAll = (state: SocialState) =>
  state.posts.slice().sort((a, b) => b.createdAtMs - a.createdAtMs);

export const selectPostById = (id: string) => (state: SocialState) =>
  state.posts.find((p) => p.id === id);

export const selectCommentsForPost = (postId: string) => (state: SocialState) =>
  state.comments
    .filter((c) => c.postId === postId)
    .slice()
    .sort((a, b) => a.createdAtMs - b.createdAtMs);

export const selectReactionsForPost = (postId: string) => (state: SocialState) =>
  state.reactions
    .filter((r) => r.postId === postId)
    .slice()
    .sort((a, b) => b.createdAtMs - a.createdAtMs);

export const selectMyReactionForPost = (postId: string, myUserId: string) => (state: SocialState) =>
  state.reactions.find((r) => r.postId === postId && r.userId === myUserId);

// ============================================================================
// Hooks (match old API)
// ============================================================================

export function useFeedAll(): WorkoutPost[] {
  return useSocialStore(selectFeedAll);
}

export function usePost(postId: string): WorkoutPost | undefined {
  return useSocialStore(selectPostById(postId));
}

export function usePostComments(postId: string): Comment[] {
  return useSocialStore(selectCommentsForPost(postId));
}

export function usePostReactions(postId: string): Reaction[] {
  return useSocialStore(selectReactionsForPost(postId));
}

export function useMyReaction(postId: string, myUserId: string): Reaction | undefined {
  return useSocialStore(selectMyReactionForPost(postId, myUserId));
}

// ============================================================================
// Imperative getters for non-React code
// ============================================================================

export function getFeedAll(): WorkoutPost[] {
  return selectFeedAll(useSocialStore.getState());
}

export function getPostById(id: string): WorkoutPost | undefined {
  return selectPostById(id)(useSocialStore.getState());
}

export function getCommentsForPost(postId: string): Comment[] {
  return selectCommentsForPost(postId)(useSocialStore.getState());
}

export function getReactionsForPost(postId: string): Reaction[] {
  return selectReactionsForPost(postId)(useSocialStore.getState());
}

export function getMyReactionForPost(postId: string, myUserId: string): Reaction | undefined {
  return selectMyReactionForPost(postId, myUserId)(useSocialStore.getState());
}

// Legacy hydrate function (no-op with Zustand)
export async function hydrateSocialStore(): Promise<void> {
  // Zustand handles hydration automatically
}

// Legacy subscribe function (no-op with Zustand)
export function subscribeSocial(listener: () => void): () => void {
  return () => {};
}

// ============================================================================
// Imperative action wrappers for non-React code
// ============================================================================

export type CreatePostInput = Omit<WorkoutPost, "id" | "likeCount" | "commentCount">;

export function createPost(input: CreatePostInput): WorkoutPost {
  return useSocialStore.getState().createPost(input);
}

export function toggleReaction(postId: string, myUserId: string, emote: EmoteId): void {
  useSocialStore.getState().toggleReaction(postId, myUserId, emote);
}

export type AddCommentInput = {
  postId: string;
  myUserId: string;
  myDisplayName: string;
  text: string;
};

export function addComment(input: AddCommentInput): Comment | null {
  return useSocialStore.getState().addComment(
    input.postId,
    input.myUserId,
    input.myDisplayName,
    input.text
  );
}
