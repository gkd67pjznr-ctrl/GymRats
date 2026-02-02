// src/lib/sync/repositories/postRepository.ts
// Repository for social posts CRUD operations with Supabase

import { supabase, isSupabasePlaceholder } from '../../supabase/client';
import type { WorkoutPost } from '../../socialModel';
import type { DatabasePost, DatabasePostInsert } from '../../supabase/types';
declare const __DEV__: boolean | undefined;

/**
 * Repository interface for social posts
 */
export interface PostRepository {
  // Pull from server
  fetchFeed(options: {
    userId?: string;
    limit?: number;
    before?: string; // ISO date cursor
  }): Promise<WorkoutPost[]>;
  fetchById(id: string): Promise<WorkoutPost | null>;
  fetchUserPosts(userId: string, limit?: number): Promise<WorkoutPost[]>;

  // Push to server
  create(post: Omit<WorkoutPost, 'id' | 'likeCount' | 'commentCount'>): Promise<WorkoutPost>;
  update(id: string, updates: Partial<WorkoutPost>): Promise<void>;
  delete(id: string, authorId: string): Promise<void>;

  // Realtime
  subscribeToFeed(
    onInsert: (post: WorkoutPost) => void,
    filter?: 'public' | 'friends' | string
  ): () => void;

  subscribeToPost(
    postId: string,
    onUpdate: (post: WorkoutPost) => void,
    onDelete: (postId: string) => void
  ): () => void;
}

/**
 * Convert WorkoutPost to database insert format
 */
function toDatabaseInsert(post: Omit<WorkoutPost, 'id' | 'likeCount' | 'commentCount'>): DatabasePostInsert {
  return {
    author_id: post.authorUserId,
    title: post.title ?? null,
    caption: post.caption ?? null,
    privacy: post.privacy ?? 'public',
    duration_sec: post.durationSec ?? null,
    completion_pct: post.completionPct ?? null,
    exercise_count: post.exerciseCount ?? null,
    set_count: post.setCount ?? null,
    workout_snapshot: post.workoutSnapshot ?? null,
  };
}

/**
 * Convert database row to WorkoutPost
 */
function fromDatabase(db: DatabasePost): WorkoutPost {
  return {
    id: db.id,
    authorUserId: db.author_id,
    title: db.title,
    caption: db.caption,
    privacy: db.privacy,
    durationSec: db.duration_sec,
    completionPct: db.completion_pct,
    exerciseCount: db.exercise_count,
    setCount: db.set_count,
    workoutSnapshot: db.workoutSnapshot,
    createdAtMs: new Date(db.created_at).getTime(),
    likeCount: db.like_count,
    commentCount: db.comment_count,
  };
}

/**
 * Post repository implementation
 */
export const postRepository: PostRepository = {
  /**
   * Fetch feed posts (public + friends' posts)
   */
  async fetchFeed(options: {
    userId?: string;
    limit?: number;
    before?: string;
  }): Promise<WorkoutPost[]> {
    // If Supabase is not configured, return empty array
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[postRepository] Supabase placeholder detected, returning empty array');
      }
      return [];
    }

    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(options.limit ?? 50);

    // Apply cursor pagination if provided
    if (options.before) {
      query = query.lt('created_at', options.before);
    }

    // Filter by visibility (public posts always shown)
    // If userId provided, also show friends-only posts from friends
    if (options.userId) {
      // For now, fetch all public posts
      // TODO: Add friends filter after implementing friend relationship queries
      query = query.eq('privacy', 'public');
    } else {
      query = query.eq('privacy', 'public');
    }

    const { data, error } = await query;

    if (error) {
      const msg = error.message ?? '';
      const isTableMissing = msg.includes('Could not find the') || msg.includes('does not exist');
      if (isTableMissing) {
        console.warn('[postRepository] Backend tables not set up yet');
        return [];
      }
      console.error('[postRepository] fetchFeed error:', error);
      throw new Error(`Failed to fetch feed: ${error.message}`);
    }

    return (data ?? []).map(fromDatabase);
  },

  /**
   * Fetch a single post by ID
   */
  async fetchById(id: string): Promise<WorkoutPost | null> {
    // If Supabase is not configured, return null
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[postRepository] Supabase placeholder detected, returning null');
      }
      return null;
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[postRepository] fetchById error:', error);
      throw new Error(`Failed to fetch post ${id}: ${error.message}`);
    }

    return data ? fromDatabase(data) : null;
  },

  /**
   * Fetch all posts by a specific user
   */
  async fetchUserPosts(userId: string, limit = 50): Promise<WorkoutPost[]> {
    // If Supabase is not configured, return empty array
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[postRepository] Supabase placeholder detected, returning empty array');
      }
      return [];
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[postRepository] fetchUserPosts error:', error);
      throw new Error(`Failed to fetch user posts: ${error.message}`);
    }

    return (data ?? []).map(fromDatabase);
  },

  /**
   * Create a new post
   */
  async create(post: Omit<WorkoutPost, 'id' | 'likeCount' | 'commentCount'>): Promise<WorkoutPost> {
    // If Supabase is not configured, simulate success with a mock ID
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[postRepository] Supabase placeholder detected, simulating post creation');
      }
      // Generate a mock ID
      const mockId = `mock_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`;
      return {
        ...post,
        id: mockId,
        likeCount: 0,
        commentCount: 0,
        createdAtMs: Date.now(),
      };
    }

    const insertData = toDatabaseInsert(post);

    const { data, error } = await supabase
      .from('posts')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('[postRepository] create error:', error);
      throw new Error(`Failed to create post: ${error.message}`);
    }

    return fromDatabase(data);
  },

  /**
   * Update an existing post
   */
  async update(id: string, updates: Partial<WorkoutPost>): Promise<void> {
    // If Supabase is not configured, do nothing
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[postRepository] Supabase placeholder detected, skipping update');
      }
      return;
    }

    const updateData: Partial<DatabasePostInsert> = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.caption !== undefined) updateData.caption = updates.caption;
    if (updates.privacy !== undefined) updateData.privacy = updates.privacy;
    if (updates.workoutSnapshot !== undefined) updateData.workout_snapshot = updates.workoutSnapshot;

    // Don't update counters directly - they're managed by database triggers

    const { error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('[postRepository] update error:', error);
      throw new Error(`Failed to update post ${id}: ${error.message}`);
    }
  },

  /**
   * Delete a post
   */
  async delete(id: string, authorId: string): Promise<void> {
    // If Supabase is not configured, do nothing
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[postRepository] Supabase placeholder detected, skipping delete');
      }
      return;
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('author_id', authorId);

    if (error) {
      console.error('[postRepository] delete error:', error);
      throw new Error(`Failed to delete post ${id}: ${error.message}`);
    }
  },

  /**
   * Subscribe to realtime feed updates
   */
  subscribeToFeed(
    onInsert: (post: WorkoutPost) => void,
    filter: 'public' | 'friends' | string = 'public'
  ): () => void {
    // If Supabase is not configured, return no-op subscription
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[postRepository] Supabase placeholder detected, returning no-op subscription');
      }
      return () => {};
    }

    const channel = supabase
      .channel(`posts:${filter}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `privacy=eq.${filter}`,
        },
        (payload) => {
          if (payload.new) {
            onInsert(fromDatabase(payload.new as DatabasePost));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Subscribe to realtime updates for a specific post
   */
  subscribeToPost(
    postId: string,
    onUpdate: (post: WorkoutPost) => void,
    onDelete: (postId: string) => void
  ): () => void {
    // If Supabase is not configured, return no-op subscription
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[postRepository] Supabase placeholder detected, returning no-op subscription');
      }
      return () => {};
    }

    const channel = supabase
      .channel(`post:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`,
        },
        (payload) => {
          if (payload.new) {
            onUpdate(fromDatabase(payload.new as DatabasePost));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`,
        },
        () => {
          onDelete(postId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
