// src/lib/stores/__tests__/socialStore.test.ts
// Unit tests for socialStore with Zustand

import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EmoteId } from '../../socialModel';
import {
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
  type CreatePostInput,
  type AddCommentInput,
} from '../socialStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('socialStore', () => {
  const MY_USER_ID = 'u_test_me';
  const MY_DISPLAY_NAME = 'Test User';

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state between tests
    useSocialStore.setState({
      posts: [],
      reactions: [],
      comments: [],
      notifications: [],
      hydrated: false,
    });
  });

  describe('initial state', () => {
    it('should start with empty arrays and false hydrated', () => {
      const { result } = renderHook(() => ({
        posts: useSocialStore((s) => s.posts),
        reactions: useSocialStore((s) => s.reactions),
        comments: useSocialStore((s) => s.comments),
        hydrated: useSocialStore((s) => s.hydrated),
      }));

      expect(result.current.posts).toEqual([]);
      expect(result.current.reactions).toEqual([]);
      expect(result.current.comments).toEqual([]);
      expect(result.current.hydrated).toBe(false);
    });
  });

  describe('createPost', () => {
    it('should create a new post with generated id', () => {
      const input: CreatePostInput = {
        authorUserId: 'u_author1',
        authorDisplayName: 'Author',
        privacy: 'public',
        createdAtMs: Date.now(),
        title: 'Test Post',
        caption: 'Test caption',
      };

      const post = createPost(input);

      expect(post.id).toBeDefined();
      expect(post.authorUserId).toBe('u_author1');
      expect(post.title).toBe('Test Post');
      expect(post.likeCount).toBe(0);
      expect(post.commentCount).toBe(0);
    });

    it('should add post to store', () => {
      const input: CreatePostInput = {
        authorUserId: MY_USER_ID,
        authorDisplayName: MY_DISPLAY_NAME,
        privacy: 'public',
        createdAtMs: Date.now(),
      };

      act(() => {
        createPost(input);
      });

      const posts = getFeedAll();
      expect(posts).toHaveLength(1);
      expect(posts[0].authorUserId).toBe(MY_USER_ID);
    });

    it('should include workout snapshot if provided', () => {
      const input: CreatePostInput = {
        authorUserId: MY_USER_ID,
        authorDisplayName: MY_DISPLAY_NAME,
        privacy: 'friends',
        createdAtMs: Date.now(),
        durationSec: 3600,
        completionPct: 1,
        exerciseCount: 5,
        setCount: 20,
        workoutSnapshot: {
          routineName: 'Push Day',
          topLines: [
            {
              exerciseName: 'Bench Press',
              bestSet: { weightLabel: '225 lb', reps: 5, e1rmLabel: '257 lb' },
            },
          ],
        },
      };

      const post = createPost(input);

      expect(post.workoutSnapshot).toBeDefined();
      expect(post.workoutSnapshot?.routineName).toBe('Push Day');
      expect(post.workoutSnapshot?.topLines).toHaveLength(1);
    });
  });

  describe('toggleReaction', () => {
    const POST_ID = 'post_test_1';

    beforeEach(() => {
      // Create a test post
      act(() => {
        const input: CreatePostInput = {
          authorUserId: 'u_author',
          authorDisplayName: 'Author',
          privacy: 'public',
          createdAtMs: Date.now(),
        };
        const post = createPost(input);
        // Manually set the post ID for testing
        useSocialStore.setState({
          posts: [{ ...post, id: POST_ID }],
        });
      });
    });

    it('should add reaction on first toggle', () => {
      act(() => {
        toggleReaction(POST_ID, MY_USER_ID, 'like');
      });

      const reactions = getReactionsForPost(POST_ID);
      expect(reactions).toHaveLength(1);
      expect(reactions[0].userId).toBe(MY_USER_ID);
      expect(reactions[0].emote).toBe('like');

      const myReaction = getMyReactionForPost(POST_ID, MY_USER_ID);
      expect(myReaction).toBeDefined();
      expect(myReaction?.emote).toBe('like');

      // Post like count should increment
      const post = getPostById(POST_ID);
      expect(post?.likeCount).toBe(1);
    });

    it('should remove reaction on second toggle with same emote', () => {
      act(() => {
        toggleReaction(POST_ID, MY_USER_ID, 'fire');
      });

      expect(getReactionsForPost(POST_ID)).toHaveLength(1);

      act(() => {
        toggleReaction(POST_ID, MY_USER_ID, 'fire');
      });

      expect(getReactionsForPost(POST_ID)).toHaveLength(0);
      expect(getMyReactionForPost(POST_ID, MY_USER_ID)).toBeUndefined();

      // Post like count should decrement
      const post = getPostById(POST_ID);
      expect(post?.likeCount).toBe(0);
    });

    it('should replace reaction on toggle with different emote', () => {
      act(() => {
        toggleReaction(POST_ID, MY_USER_ID, 'like');
      });

      const firstReaction = getMyReactionForPost(POST_ID, MY_USER_ID);
      expect(firstReaction?.emote).toBe('like');

      act(() => {
        toggleReaction(POST_ID, MY_USER_ID, 'fire');
      });

      const secondReaction = getMyReactionForPost(POST_ID, MY_USER_ID);
      expect(secondReaction?.emote).toBe('fire');

      // Should still have only one reaction
      expect(getReactionsForPost(POST_ID)).toHaveLength(1);
    });

    it('should handle multiple users reacting to same post', () => {
      const userId1 = 'u_user1';
      const userId2 = 'u_user2';

      act(() => {
        toggleReaction(POST_ID, userId1, 'like');
        toggleReaction(POST_ID, userId2, 'fire');
      });

      const reactions = getReactionsForPost(POST_ID);
      expect(reactions).toHaveLength(2);

      // Post like count should reflect both reactions
      const post = getPostById(POST_ID);
      expect(post?.likeCount).toBe(2);
    });

    it('should support all emote types', () => {
      const emotes: EmoteId[] = ['like', 'fire', 'skull', 'crown', 'bolt', 'clap'];
      const userId = 'u_emote_tester';

      emotes.forEach((emote, index) => {
        act(() => {
          toggleReaction(POST_ID, `${userId}_${index}`, emote);
        });
      });

      const reactions = getReactionsForPost(POST_ID);
      expect(reactions).toHaveLength(emotes.length);

      const uniqueEmotes = new Set(reactions.map((r) => r.emote));
      expect(uniqueEmotes.size).toBe(emotes.length);
    });

    it('should do nothing if post does not exist', () => {
      act(() => {
        toggleReaction('nonexistent_post', MY_USER_ID, 'like');
      });

      expect(getReactionsForPost('nonexistent_post')).toHaveLength(0);
    });
  });

  describe('addComment', () => {
    const POST_ID = 'post_comment_test';

    beforeEach(() => {
      // Create a test post
      act(() => {
        const input: CreatePostInput = {
          authorUserId: 'u_author',
          authorDisplayName: 'Author',
          privacy: 'public',
          createdAtMs: Date.now(),
        };
        const post = createPost(input);
        useSocialStore.setState({
          posts: [{ ...post, id: POST_ID }],
        });
      });
    });

    it('should add comment to post', () => {
      const input: AddCommentInput = {
        postId: POST_ID,
        myUserId: MY_USER_ID,
        myDisplayName: MY_DISPLAY_NAME,
        text: 'Great post!',
      };

      const comment = addComment(input);

      expect(comment).toBeDefined();
      expect(comment?.id).toBeDefined();
      expect(comment?.postId).toBe(POST_ID);
      expect(comment?.userId).toBe(MY_USER_ID);
      expect(comment?.text).toBe('Great post!');

      const comments = getCommentsForPost(POST_ID);
      expect(comments).toHaveLength(1);
    });

    it('should increment post comment count', () => {
      const input: AddCommentInput = {
        postId: POST_ID,
        myUserId: MY_USER_ID,
        myDisplayName: MY_DISPLAY_NAME,
        text: 'First comment',
      };

      act(() => {
        addComment(input);
      });

      const post = getPostById(POST_ID);
      expect(post?.commentCount).toBe(1);
    });

    it('should trim comment text', () => {
      const input: AddCommentInput = {
        postId: POST_ID,
        myUserId: MY_USER_ID,
        myDisplayName: MY_DISPLAY_NAME,
        text: '  Spaced comment  ',
      };

      const comment = addComment(input);

      expect(comment?.text).toBe('Spaced comment');
    });

    it('should return null for empty comment', () => {
      const input: AddCommentInput = {
        postId: POST_ID,
        myUserId: MY_USER_ID,
        myDisplayName: MY_DISPLAY_NAME,
        text: '   ',
      };

      const comment = addComment(input);

      expect(comment).toBeNull();
      expect(getCommentsForPost(POST_ID)).toHaveLength(0);
    });

    it('should return null if post does not exist', () => {
      const input: AddCommentInput = {
        postId: 'nonexistent_post',
        myUserId: MY_USER_ID,
        myDisplayName: MY_DISPLAY_NAME,
        text: 'Comment on non-existent post',
      };

      const comment = addComment(input);

      expect(comment).toBeNull();
    });

    it('should sort comments by createdAtMs ascending', () => {
      act(() => {
        addComment({
          postId: POST_ID,
          myUserId: 'u1',
          myDisplayName: 'User 1',
          text: 'First',
        });
        addComment({
          postId: POST_ID,
          myUserId: 'u2',
          myDisplayName: 'User 2',
          text: 'Second',
        });
      });

      const comments = getCommentsForPost(POST_ID);
      expect(comments).toHaveLength(2);
      expect(comments[0].createdAtMs).toBeLessThanOrEqual(comments[1].createdAtMs);
    });
  });

  describe('usePost hook', () => {
    it('should return post by id', () => {
      const input: CreatePostInput = {
        authorUserId: MY_USER_ID,
        authorDisplayName: MY_DISPLAY_NAME,
        privacy: 'public',
        createdAtMs: Date.now(),
      };

      const createdPost = createPost(input);

      const { result } = renderHook(() => usePost(createdPost.id));
      expect(result.current).toBeDefined();
      expect(result.current?.id).toBe(createdPost.id);
    });

    it('should return undefined for non-existent post', () => {
      const { result } = renderHook(() => usePost('nonexistent'));
      expect(result.current).toBeUndefined();
    });
  });

  describe('useFeedAll hook', () => {
    it('should return all posts sorted by createdAtMs descending', () => {
      act(() => {
        createPost({
          authorUserId: 'u1',
          authorDisplayName: 'User 1',
          privacy: 'public',
          createdAtMs: 1000,
        });
        createPost({
          authorUserId: 'u2',
          authorDisplayName: 'User 2',
          privacy: 'public',
          createdAtMs: 3000,
        });
        createPost({
          authorUserId: 'u3',
          authorDisplayName: 'User 3',
          privacy: 'public',
          createdAtMs: 2000,
        });
      });

      const { result } = renderHook(() => useFeedAll());

      expect(result.current).toHaveLength(3);
      // Should be sorted descending (most recent first)
      expect(result.current[0].createdAtMs).toBe(3000);
      expect(result.current[1].createdAtMs).toBe(2000);
      expect(result.current[2].createdAtMs).toBe(1000);
    });
  });

  describe('imperative getters', () => {
    it('getFeedAll should return posts without React', () => {
      act(() => {
        createPost({
          authorUserId: MY_USER_ID,
          authorDisplayName: MY_DISPLAY_NAME,
          privacy: 'public',
          createdAtMs: Date.now(),
        });
      });

      const posts = getFeedAll();
      expect(posts.length).toBeGreaterThan(0);
    });

    it('getPostById should return post without React', () => {
      const post = createPost({
        authorUserId: MY_USER_ID,
        authorDisplayName: MY_DISPLAY_NAME,
        privacy: 'public',
        createdAtMs: Date.now(),
      });

      const found = getPostById(post.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(post.id);
    });
  });

  describe('legacy API compatibility', () => {
    it('hydrateSocialStore should resolve without error', async () => {
      await expect(hydrateSocialStore()).resolves.toBeUndefined();
    });

    it('subscribeSocial should return unsubscribe function', () => {
      const unsubscribe = subscribeSocial(() => {});
      expect(typeof unsubscribe).toBe('function');
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('hydration', () => {
    it('should set hydrated flag after rehydration', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      renderHook(() => useSocialStore((s) => s.hydrated));

      await waitFor(() => {
        expect(useSocialStore.getState().hydrated).toBe(true);
      });
    });
  });

  describe('persistence', () => {
    it('should persist state to AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      act(() => {
        createPost({
          authorUserId: MY_USER_ID,
          authorDisplayName: MY_DISPLAY_NAME,
          privacy: 'public',
          createdAtMs: Date.now(),
        });
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      });

      const calls = mockAsyncStorage.setItem.mock.calls;
      const setItemCall = calls.find((call) => call[0] === 'social.v2');
      expect(setItemCall).toBeDefined();

      const persistedValue = JSON.parse(setItemCall![1]);
      expect(persistedValue.posts).toBeDefined();
    });
  });
});
