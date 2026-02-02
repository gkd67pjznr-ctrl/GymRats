// src/lib/stores/__tests__/feedStore.test.ts
// Unit tests for feedStore with Zustand

import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ID } from '../../socialModel';
import type { PostVisibility, FeedPost } from '../feedStore';
import {
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
  hydrateFeed,
  subscribeFeed,
} from '../feedStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('feedStore', () => {
  const MY_USER_ID: ID = 'u_feed_me';
  const OTHER_USER_ID: ID = 'u_feed_other';
  const BLOCKED_USER_ID: ID = 'u_feed_blocked';

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state between tests
    useFeedStore.setState({
      posts: [],
      likesByPostId: {},
      hydrated: false,
    });
  });

  describe('initial state', () => {
    it('should start with empty posts and likes and false hydrated', () => {
      const { result } = renderHook(() => ({
        posts: useFeedStore((s) => s.posts),
        likesByPostId: useFeedStore((s) => s.likesByPostId),
        hydrated: useFeedStore((s) => s.hydrated),
      }));

      expect(result.current.posts).toEqual([]);
      expect(result.current.likesByPostId).toEqual({});
      expect(result.current.hydrated).toBe(false);
    });
  });

  describe('createPost', () => {
    it('should create a new post with generated id', () => {
      const post = createPost({
        authorUserId: MY_USER_ID,
        text: 'Test post',
      });

      expect(post.id).toBeDefined();
      expect(post.authorUserId).toBe(MY_USER_ID);
      expect(post.text).toBe('Test post');
      expect(post.visibility).toBe('public'); // default
      expect(post.baseLikeCount).toBe(0);
      expect(post.baseCommentCount).toBe(0);
    });

    it('should create post with friends visibility', () => {
      const post = createPost({
        authorUserId: MY_USER_ID,
        text: 'Friends only post',
        visibility: 'friends',
      });

      expect(post.visibility).toBe('friends');
    });

    it('should trim post text', () => {
      const post = createPost({
        authorUserId: MY_USER_ID,
        text: '  Spaced post  ',
      });

      expect(post.text).toBe('Spaced post');
    });

    it('should add post to store', () => {
      act(() => {
        createPost({
          authorUserId: MY_USER_ID,
          text: 'New post',
        });
      });

      const posts = getAllPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].authorUserId).toBe(MY_USER_ID);
    });
  });

  describe('toggleLike', () => {
    let testPost: FeedPost;

    beforeEach(() => {
      testPost = createPost({
        authorUserId: OTHER_USER_ID,
        text: 'Likeable post',
        visibility: 'public',
      });
    });

    it('should add like on first toggle', () => {
      const result = toggleLike(testPost.id, MY_USER_ID);

      expect(result.ok).toBe(true);
      expect(hasUserLiked(testPost.id, MY_USER_ID)).toBe(true);
    });

    it('should remove like on second toggle', () => {
      toggleLike(testPost.id, MY_USER_ID);
      expect(hasUserLiked(testPost.id, MY_USER_ID)).toBe(true);

      toggleLike(testPost.id, MY_USER_ID);
      expect(hasUserLiked(testPost.id, MY_USER_ID)).toBe(false);
    });

    it('should return error for non-existent post', () => {
      const result = toggleLike('nonexistent_post', MY_USER_ID);

      expect(result.ok).toBe(false);
      expect(result.reason).toBe('post_not_found');
    });

    it('should handle multiple users liking same post', () => {
      toggleLike(testPost.id, 'u_user1');
      toggleLike(testPost.id, 'u_user2');
      toggleLike(testPost.id, 'u_user3');

      expect(getLikeCount(testPost.id)).toBe(3);
    });

    it('should count likes correctly with baseLikeCount', () => {
      // Create post with existing base likes
      const postWithLikes = createPost({
        authorUserId: OTHER_USER_ID,
        text: 'Popular post',
        visibility: 'public',
      });
      useFeedStore.setState({
        posts: useFeedStore.getState().posts.map((p) =>
          p.id === postWithLikes.id
            ? { ...p, baseLikeCount: 10 }
            : p
        ),
      });

      toggleLike(postWithLikes.id, MY_USER_ID);
      toggleLike(postWithLikes.id, 'u_other');

      expect(getLikeCount(postWithLikes.id)).toBe(12); // 10 base + 2 new
    });
  });

  describe('visibility policy', () => {
    const createTestPost = (
      authorId: ID,
      visibility: PostVisibility
    ): FeedPost => {
      return createPost({
        authorUserId: authorId,
        text: 'Test post',
        visibility,
      });
    };

    describe('canUserViewPost', () => {
      it('should allow author to view own post', () => {
        const post = createTestPost(MY_USER_ID, 'friends');
        expect(canUserViewPost(post, MY_USER_ID)).toBe(true);
      });

      it('should allow anyone to view public post', () => {
        const post = createTestPost(OTHER_USER_ID, 'public');
        expect(canUserViewPost(post, MY_USER_ID)).toBe(true);
      });

      it('should not allow non-friends to view friends-only post', () => {
        const post = createTestPost(OTHER_USER_ID, 'friends');
        // Without friendship, should not be able to view
        expect(canUserViewPost(post, MY_USER_ID)).toBe(false);
      });
    });

    describe('canUserInteractWithPost', () => {
      it('should allow author to interact with own post', () => {
        const post = createTestPost(MY_USER_ID, 'friends');
        expect(canUserInteractWithPost(post, MY_USER_ID)).toBe(true);
      });

      it('should allow anyone to interact with public post', () => {
        const post = createTestPost(OTHER_USER_ID, 'public');
        expect(canUserInteractWithPost(post, MY_USER_ID)).toBe(true);
      });

      it('should not allow non-friends to interact with friends-only post', () => {
        const post = createTestPost(OTHER_USER_ID, 'friends');
        expect(canUserInteractWithPost(post, MY_USER_ID)).toBe(false);
      });
    });

    describe('toggleLike respects policy', () => {
      it('should prevent liking friends-only post when not friends', () => {
        const post = createTestPost(OTHER_USER_ID, 'friends');
        const result = toggleLike(post.id, MY_USER_ID);

        expect(result.ok).toBe(false);
        expect(result.reason).toBe('not_allowed');
      });
    });
  });

  describe('useVisibleFeed hook', () => {
    it('should return public posts to any user', () => {
      act(() => {
        createPost({
          authorUserId: OTHER_USER_ID,
          text: 'Public post',
          visibility: 'public',
        });
      });

      const { result } = renderHook(() => useVisibleFeed(MY_USER_ID));

      expect(result.current.posts).toHaveLength(1);
      expect(result.current.posts[0].visibility).toBe('public');
    });

    it('should include likeCount and liked helpers', () => {
      const post = createPost({
        authorUserId: OTHER_USER_ID,
        text: 'Test post',
        visibility: 'public',
      });

      const { result } = renderHook(() => useVisibleFeed(MY_USER_ID));

      expect(result.current.likeCount(post.id)).toBe(0);
      expect(result.current.liked(post.id)).toBe(false);

      act(() => {
        toggleLike(post.id, MY_USER_ID);
      });

      expect(result.current.likeCount(post.id)).toBe(1);
      expect(result.current.liked(post.id)).toBe(true);
    });
  });

  describe('imperative getters', () => {
    it('getAllPosts should return all posts sorted descending', () => {
      act(() => {
        createPost({ authorUserId: 'u1', text: 'P1', visibility: 'public' });
        createPost({ authorUserId: 'u2', text: 'P2', visibility: 'public' });
      });

      const posts = getAllPosts();
      expect(posts.length).toBeGreaterThanOrEqual(2);
      // Verify sorted descending by createdAtMs
      for (let i = 1; i < posts.length; i++) {
        expect(posts[i - 1].createdAtMs).toBeGreaterThanOrEqual(posts[i].createdAtMs);
      }
    });

    it('getVisiblePostsForUser should filter by visibility', () => {
      const myPost = createPost({
        authorUserId: MY_USER_ID,
        text: 'My post',
        visibility: 'friends',
      });

      const publicPost = createPost({
        authorUserId: OTHER_USER_ID,
        text: 'Public post',
        visibility: 'public',
      });

      const friendsPost = createPost({
        authorUserId: OTHER_USER_ID,
        text: 'Friends post',
        visibility: 'friends',
      });

      const visiblePosts = getVisiblePostsForUser(MY_USER_ID);

      // Should see own friends-only post
      expect(visiblePosts.some((p) => p.id === myPost.id)).toBe(true);
      // Should see public posts
      expect(visiblePosts.some((p) => p.id === publicPost.id)).toBe(true);
      // Should NOT see others' friends-only posts (not friends)
      expect(visiblePosts.some((p) => p.id === friendsPost.id)).toBe(false);
    });

    it('getPost should return post by id', () => {
      const post = createPost({
        authorUserId: MY_USER_ID,
        text: 'Findable post',
        visibility: 'public',
      });

      const found = getPost(post.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(post.id);
    });

    it('getPost should return null for non-existent post', () => {
      const found = getPost('nonexistent' as ID);
      expect(found).toBeNull();
    });
  });

  describe('legacy API compatibility', () => {
    it('hydrateFeed should resolve without error', async () => {
      await expect(hydrateFeed()).resolves.toBeUndefined();
    });

    it('subscribeFeed should return unsubscribe function', () => {
      const unsubscribe = subscribeFeed(() => {});
      expect(typeof unsubscribe).toBe('function');
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('hydration', () => {
    it('should set hydrated flag after rehydration', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      renderHook(() => useFeedStore((s) => s.hydrated));

      await waitFor(() => {
        expect(useFeedStore.getState().hydrated).toBe(true);
      });
    });
  });

  describe('persistence', () => {
    it('should persist state to AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      act(() => {
        createPost({
          authorUserId: MY_USER_ID,
          text: 'Persisted post',
        });
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      });

      const calls = mockAsyncStorage.setItem.mock.calls;
      const setItemCall = calls.find((call) => call[0] === 'feed.v2');
      expect(setItemCall).toBeDefined();

      const persistedValue = JSON.parse(setItemCall![1]);
      expect(persistedValue.posts).toBeDefined();
    });
  });

  describe('hasUserLiked', () => {
    it('should return false when user has not liked', () => {
      const post = createPost({
        authorUserId: OTHER_USER_ID,
        text: 'Test',
        visibility: 'public',
      });

      expect(hasUserLiked(post.id, MY_USER_ID)).toBe(false);
    });

    it('should return true when user has liked', () => {
      const post = createPost({
        authorUserId: OTHER_USER_ID,
        text: 'Test',
        visibility: 'public',
      });

      toggleLike(post.id, MY_USER_ID);

      expect(hasUserLiked(post.id, MY_USER_ID)).toBe(true);
    });
  });

  describe('getLikeCount', () => {
    it('should return 0 for post with no likes', () => {
      const post = createPost({
        authorUserId: OTHER_USER_ID,
        text: 'Test',
        visibility: 'public',
      });

      expect(getLikeCount(post.id)).toBe(0);
    });

    it('should return count including base likes', () => {
      const post = createPost({
        authorUserId: OTHER_USER_ID,
        text: 'Test',
        visibility: 'public',
      });

      // Manually set base like count
      useFeedStore.setState({
        posts: useFeedStore.getState().posts.map((p) =>
          p.id === post.id ? { ...p, baseLikeCount: 5 } : p
        ),
      });

      toggleLike(post.id, 'u1');
      toggleLike(post.id, 'u2');

      expect(getLikeCount(post.id)).toBe(7); // 5 base + 2 likes
    });
  });
});
