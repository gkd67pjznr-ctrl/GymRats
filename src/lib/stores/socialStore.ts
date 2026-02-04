// src/lib/stores/socialStore.ts
// Zustand store for social posts, reactions, comments with AsyncStorage persistence and Supabase sync/realtime
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createQueuedJSONStorage } from "./storage/createQueuedAsyncStorage";
import type { AppNotification, Comment, EmoteId, Reaction, WorkoutPost } from "../socialModel";
import { uid } from "../uid";
import { logError } from "../errorHandler";
import { safeJSONParse } from "../storage/safeJSONParse";
import type { SyncMetadata } from "../sync/syncTypes";
import { getUser } from "./authStore";
import { postRepository } from "../sync/repositories/postRepository";
import { reactionRepository } from "../sync/repositories/reactionRepository";
import { commentRepository } from "../sync/repositories/commentRepository";
import { notificationRepository } from "../sync/repositories/notificationRepository";
import { networkMonitor } from "../sync/NetworkMonitor";
import { subscribeToUserPosts, subscribeToPostReactions, subscribeToPostComments } from "../sync/RealtimeManager";
import { useMemo } from "react";
import { shallow } from "zustand/shallow";
import type { WorkoutSession } from "../workoutModel";
import { createWorkoutPostFromSession, detectWorkoutMilestones, type WorkoutMilestone } from "../workoutPostGenerator";
import type { ReportReason } from "../socialModel";

const STORAGE_KEY = "social.v2";

interface SocialState {
  posts: WorkoutPost[];
  reactions: Reaction[];
  comments: Comment[];
  notifications: AppNotification[];
  hydrated: boolean;
  _sync: SyncMetadata;

  // Actions
  createPost: (input: Omit<WorkoutPost, "id" | "likeCount" | "commentCount">) => WorkoutPost;
  updatePost: (id: string, updates: Partial<WorkoutPost>) => void;
  createPostFromWorkout: (args: {
    session: WorkoutSession;
    authorUserId: string;
    authorDisplayName: string;
    authorAvatarUrl?: string;
    privacy?: 'public' | 'friends';
    caption?: string;
    bodyweightKg?: number;
  }) => WorkoutPost;
  detectAndCreateMilestonePosts: (args: {
    session: WorkoutSession;
    authorUserId: string;
    authorDisplayName: string;
    authorAvatarUrl?: string;
    previousBests?: Record<string, { weightKg: number; reps: number; e1rmKg: number }>;
    currentStreak?: number;
  }) => WorkoutMilestone[];
  toggleReaction: (postId: string, myUserId: string, emote: EmoteId) => void;
  addComment: (postId: string, myUserId: string, myDisplayName: string, text: string) => Comment | null;
  reportPost: (args: { postId: string; reason: ReportReason; additionalInfo?: string }) => Promise<void>;
  reportUser: (args: { reportedUserId: string; reason: ReportReason; additionalInfo?: string }) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  setHydrated: (value: boolean) => void;

  // Sync actions
  pullFromServer: () => Promise<void>;
  pushToServer: () => Promise<void>;
  sync: () => Promise<void>;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      posts: [],
      reactions: [],
      comments: [],
      notifications: [],
      hydrated: false,
      _sync: {
        lastSyncAt: null,
        lastSyncHash: null,
        syncStatus: 'idle',
        syncError: null,
        pendingMutations: 0,
      },

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

        // Sync to server if online
        if (networkMonitor.isOnline()) {
          const user = getUser();
          if (user) {
            postRepository.create(post).catch(err => {
              console.error('[socialStore] Failed to sync post:', err);
            });
          }
        }

        return post;
      },

      updatePost: (id, updates) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));

        // Sync to server if online
        if (networkMonitor.isOnline()) {
          postRepository.update(id, updates).catch(err => {
            console.error('[socialStore] Failed to update post:', err);
          });
        }
      },

      createPostFromWorkout: (args) => {
        const { session, authorUserId, authorDisplayName, authorAvatarUrl, privacy = 'public', caption, bodyweightKg } = args;

        const postData = createWorkoutPostFromSession({
          session,
          authorUserId,
          authorDisplayName,
          authorAvatarUrl,
          privacy,
          caption,
          bodyweightKg,
        });

        return get().createPost(postData);
      },

      detectAndCreateMilestonePosts: (args) => {
        const { session, authorUserId, authorDisplayName, authorAvatarUrl, previousBests, currentStreak } = args;

        const milestones = detectWorkoutMilestones({
          session,
          previousBests,
          currentStreak,
        });

        // Auto-post milestones
        for (const milestone of milestones) {
          const postData = createWorkoutPostFromSession({
            session,
            authorUserId,
            authorDisplayName,
            authorAvatarUrl,
            privacy: 'public',
            caption: milestone.message,
          });

          // Only create significant milestones automatically
          if (milestone.type === 'e1rm_pr' || milestone.type === 'rank_up' || milestone.type === 'streak') {
            get().createPost(postData);
          }
        }

        return milestones;
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

          // Sync to server if online
          if (networkMonitor.isOnline()) {
            reactionRepository.delete(existing.id, myUserId, postId).catch(err => {
              console.error('[socialStore] Failed to delete reaction:', err);
            });
          }
          return;
        }

        // If different emote: replace
        if (existing) {
          set((state) => ({
            reactions: state.reactions.map((r) => (r.id === existing.id ? { ...r, emote } : r)),
          }));

          // Sync to server if online
          if (networkMonitor.isOnline()) {
            reactionRepository.create({ ...existing, emote }).catch(err => {
              console.error('[socialStore] Failed to update reaction:', err);
            });
          }
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

        // Sync to server if online
        if (networkMonitor.isOnline()) {
          reactionRepository.create(r).catch(err => {
            console.error('[socialStore] Failed to create reaction:', err);
          });
        }
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

        // Sync to server if online
        if (networkMonitor.isOnline()) {
          commentRepository.create(c).catch(err => {
            console.error('[socialStore] Failed to create comment:', err);
          });
        }

        return c;
      },

      setHydrated: (value) => set({ hydrated: value }),

      reportPost: async (args) => {
        const user = getUser();
        if (!user) {
          console.warn('[socialStore] Cannot report post: no user signed in');
          return;
        }

        try {
          // Create report locally and sync to server
          const report = {
            id: uid(),
            reporterUserId: user.id,
            targetPostId: args.postId,
            reason: args.reason,
            additionalInfo: args.additionalInfo,
            createdAtMs: Date.now(),
            status: 'pending' as const,
          };

          // Sync to server
          if (networkMonitor.isOnline()) {
            // TODO: Create reportRepository when backend is ready
            console.log('[socialStore] Report submitted:', report);
          }
        } catch (error) {
          console.error('[socialStore] Failed to report post:', error);
          throw error;
        }
      },

      reportUser: async (args) => {
        const user = getUser();
        if (!user) {
          console.warn('[socialStore] Cannot report user: no user signed in');
          return;
        }

        try {
          // Create report locally and sync to server
          const report = {
            id: uid(),
            reporterUserId: user.id,
            targetUserId: args.reportedUserId,
            reason: args.reason,
            additionalInfo: args.additionalInfo,
            createdAtMs: Date.now(),
            status: 'pending' as const,
          };

          // Sync to server
          if (networkMonitor.isOnline()) {
            // TODO: Create reportRepository when backend is ready
            console.log('[socialStore] User report submitted:', report);
          }
        } catch (error) {
          console.error('[socialStore] Failed to report user:', error);
          throw error;
        }
      },

      blockUser: async (userId) => {
        const user = getUser();
        if (!user) {
          console.warn('[socialStore] Cannot block user: no user signed in');
          return;
        }

        try {
          // Import friendsStore actions
          const { blockUser: blockUserAction } = await import('./friendsStore');

          // Use the friendsStore blockUser action (pass current user and target user)
          blockUserAction(user.id, userId);

          // Filter out posts from blocked user
          set((state) => ({
            posts: state.posts.filter(p => p.authorUserId !== userId),
          }));
        } catch (error) {
          console.error('[socialStore] Failed to block user:', error);
          throw error;
        }
      },

      // Sync actions
      pullFromServer: async () => {
        const user = getUser();
        if (!user) {
          console.warn('[socialStore] Cannot pull: no user signed in');
          return;
        }

        set({ _sync: { ...get()._sync, syncStatus: 'syncing', syncError: null } });

        try {
          // Fetch feed from server
          const remotePosts = await postRepository.fetchFeed({ userId: user.id });

          // Merge with local posts (server wins for counters)
          set((state) => ({
            posts: mergePosts(state.posts, remotePosts),
            _sync: {
              ...state._sync,
              syncStatus: 'success',
              lastSyncAt: Date.now(),
            },
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          // Don't throw for table-not-found errors - just log and continue with local data
          const isTableMissing = errorMessage.includes('Could not find the') ||
                                  errorMessage.includes('relation') ||
                                  errorMessage.includes('does not exist');

          if (isTableMissing) {
            console.warn('[socialStore] Backend tables not set up yet, using local data only');
            set((state) => ({
              _sync: {
                ...state._sync,
                syncStatus: 'idle',
                syncError: null,
              },
            }));
            return;
          }

          set((state) => ({
            _sync: {
              ...state._sync,
              syncStatus: 'error',
              syncError: errorMessage,
            },
          }));
          // Only throw for unexpected errors
          throw error;
        }
      },

      pushToServer: async () => {
        const user = getUser();
        if (!user) {
          console.warn('[socialStore] Cannot push: no user signed in');
          return;
        }

        if (!networkMonitor.isOnline()) {
          console.warn('[socialStore] Cannot push: offline');
          return;
        }

        try {
          // Reactions and comments are synced immediately on action
          // This is mainly for any pending posts
          set((state) => ({
            _sync: {
              ...state._sync,
              pendingMutations: 0,
            },
          }));
        } catch (error) {
          console.error('[socialStore] Push failed:', error);
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
        reactions: state.reactions,
        comments: state.comments,
        notifications: state.notifications,
      }),
      onRehydrateStorage: (state) => {
        // Set hydrated immediately when storage is rehydrated
        if (state) {
          state.setHydrated(true);
        }

        // Handle V1 to V2 migration asynchronously
        if (state) {
          AsyncStorage.getItem("social.v1").then((v1Data) => {
            if (v1Data) {
              const parsed = safeJSONParse<{ posts: WorkoutPost[]; reactions: Reaction[]; comments: Comment[]; notifications: AppNotification[] }>(v1Data, null);
              if (parsed && parsed.posts && parsed.posts.length > 0 && state.posts.length === 0) {
                // Update state with migrated data
                useSocialStore.setState({
                  posts: parsed.posts,
                  reactions: parsed.reactions ?? [],
                  comments: parsed.comments ?? [],
                  notifications: parsed.notifications ?? [],
                });
                AsyncStorage.removeItem("social.v1").catch((err) => {
                  logError({ context: 'SocialStore', error: err, userMessage: 'Failed to remove old social data' });
                });
              }
            }
          }).catch((err) => {
            logError({ context: 'SocialStore', error: err, userMessage: 'Failed to load social data' });
          });
        }
      },
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

// Memoized selector to avoid creating new array on each call
let cachedPosts: WorkoutPost[] = [];
let cachedSortedPosts: WorkoutPost[] = [];

export const selectFeedAll = (state: SocialState): WorkoutPost[] => {
  // Only re-sort if posts array reference changed
  if (state.posts !== cachedPosts) {
    cachedPosts = state.posts;
    cachedSortedPosts = state.posts.slice().sort((a, b) => b.createdAtMs - a.createdAtMs);
  }
  return cachedSortedPosts;
};

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
  return useSocialStore(selectFeedAll, shallow);
}

export function usePost(postId: string): WorkoutPost | undefined {
  const selector = useMemo(() => selectPostById(postId), [postId]);
  return useSocialStore(selector);
}

export function usePostComments(postId: string): Comment[] {
  const selector = useMemo(() => selectCommentsForPost(postId), [postId]);
  return useSocialStore(selector);
}

export function usePostReactions(postId: string): Reaction[] {
  const selector = useMemo(() => selectReactionsForPost(postId), [postId]);
  return useSocialStore(selector);
}

export function useMyReaction(postId: string, myUserId: string): Reaction | undefined {
  const selector = useMemo(() => selectMyReactionForPost(postId, myUserId), [postId, myUserId]);
  return useSocialStore(selector);
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

// ============================================================================
// Sync Helpers
// ============================================================================

/**
 * Merge local and remote posts (server wins for counters)
 */
function mergePosts(local: WorkoutPost[], remote: WorkoutPost[]): WorkoutPost[] {
  const postMap = new Map<string, WorkoutPost>();

  // Add all local posts
  for (const post of local) {
    postMap.set(post.id, post);
  }

  // Override with remote posts (server has accurate counters)
  for (const remotePost of remote) {
    const existing = postMap.get(remotePost.id);

    if (!existing) {
      // New remote post
      postMap.set(remotePost.id, remotePost);
    } else {
      // Merge - use server counters but keep local content if newer
      const localTime = existing.createdAtMs ?? 0;
      const remoteTime = remotePost.createdAtMs ?? 0;

      postMap.set(remotePost.id, {
        ...remotePost,
        // Keep local content if it's newer
        ...(localTime > remoteTime ? {
          title: existing.title,
          caption: existing.caption,
        } : {}),
      });
    }
  }

  // Return sorted by createdAtMs descending
  return Array.from(postMap.values()).sort(
    (a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0)
  );
}

/**
 * Get sync status for social store
 */
export function getSocialSyncStatus(): SyncMetadata {
  return useSocialStore.getState()._sync;
}

/**
 * Setup realtime subscription for user's posts
 */
export function setupPostsRealtime(userId: string): () => void {
  return subscribeToUserPosts(userId, {
    onInsert: (post) => {
      useSocialStore.setState((state) => ({
        posts: [post, ...state.posts],
      }));
    },
    onUpdate: (post) => {
      useSocialStore.setState((state) => ({
        posts: state.posts.map(p =>
          p.id === post.id ? post : p
        ),
      }));
    },
    onDelete: (postId) => {
      useSocialStore.setState((state) => ({
        posts: state.posts.filter(p => p.id !== postId),
      }));
    },
  });
}

/**
 * Setup realtime subscription for post reactions
 */
export function setupReactionsRealtime(postId: string): () => void {
  return subscribeToPostReactions(postId, {
    onInsert: (reaction) => {
      useSocialStore.setState((state) => {
        // Check if reaction already exists locally
        const existing = state.reactions.find(
          r => r.postId === reaction.postId && r.userId === reaction.userId
        );

        if (existing) {
          // Update existing
          return {
            reactions: state.reactions.map(r =>
              r.id === existing.id ? reaction : r
            ),
          };
        }

        // Add new
        return {
          reactions: [reaction, ...state.reactions],
        };
      });
    },
    onDelete: (reactionId) => {
      useSocialStore.setState((state) => ({
        reactions: state.reactions.filter(r => r.id !== reactionId),
      }));
    },
  });
}

/**
 * Setup realtime subscription for post comments
 */
export function setupCommentsRealtime(postId: string): () => void {
  return subscribeToPostComments(postId, {
    onInsert: (comment) => {
      useSocialStore.setState((state) => ({
        comments: [...state.comments, comment],
      }));
    },
  });
}
