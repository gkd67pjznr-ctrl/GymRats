// src/lib/sync/repositories/commentRepository.ts
// Repository for post comments CRUD operations with Supabase

import { supabase, isSupabasePlaceholder } from '../../supabase/client';
import type { Comment } from '../../socialModel';
import type { DatabaseComment, DatabaseCommentInsert } from '../../supabase/types';
declare const __DEV__: boolean | undefined;

/**
 * Repository interface for post comments
 */
export interface CommentRepository {
  // Pull from server
  fetchByPost(postId: string): Promise<Comment[]>;
  fetchById(id: string): Promise<Comment | null>;

  // Push to server
  create(comment: Omit<Comment, 'id'>): Promise<Comment>;
  update(id: string, text: string, userId: string): Promise<void>;
  delete(id: string, userId: string): Promise<void>;

  // Realtime
  subscribeToPost(
    postId: string,
    onInsert: (comment: Comment) => void
  ): () => void;
}

/**
 * Convert Comment to database insert format
 */
function toDatabaseInsert(comment: Omit<Comment, 'id'>): DatabaseCommentInsert {
  return {
    post_id: comment.postId,
    user_id: comment.userId,
    text: comment.text,
    parent_comment_id: comment.parentCommentId ?? null,
  };
}

/**
 * Convert database row to Comment
 */
function fromDatabase(db: DatabaseComment): Comment {
  return {
    id: db.id,
    postId: db.post_id,
    userId: db.user_id,
    userDisplayName: '', // Will be populated by join or separate query
    text: db.text,
    parentCommentId: db.parent_comment_id ?? undefined,
    createdAtMs: new Date(db.created_at).getTime(),
  };
}

/**
 * Comment repository implementation
 */
export const commentRepository: CommentRepository = {
  /**
   * Fetch all comments for a post
   */
  async fetchByPost(postId: string): Promise<Comment[]> {
    // If Supabase is not configured, return empty array
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[commentRepository] Supabase placeholder detected, returning empty array');
      }
      return [];
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[commentRepository] fetchByPost error:', error);
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }

    const comments = (data ?? []).map(fromDatabase);

    // Fetch user display names for all comments
    const userIds = [...new Set(comments.map(c => c.userId))];
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, display_name')
        .in('id', userIds);

      const userMap = new Map(
        (users ?? []).map(u => [u.id, u.display_name])
      );

      comments.forEach(c => {
        c.userDisplayName = userMap.get(c.userId) ?? 'Unknown';
      });
    }

    return comments;
  },

  /**
   * Fetch a single comment by ID
   */
  async fetchById(id: string): Promise<Comment | null> {
    // If Supabase is not configured, return null
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[commentRepository] Supabase placeholder detected, returning null');
      }
      return null;
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[commentRepository] fetchById error:', error);
      throw new Error(`Failed to fetch comment ${id}: ${error.message}`);
    }

    if (!data) return null;

    const comment = fromDatabase(data);

    // Fetch user display name
    const { data: user } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', comment.userId)
      .single();

    comment.userDisplayName = user?.display_name ?? 'Unknown';

    return comment;
  },

  /**
   * Create a new comment
   */
  async create(comment: Omit<Comment, 'id'>): Promise<Comment> {
    // If Supabase is not configured, simulate success with a mock ID
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[commentRepository] Supabase placeholder detected, simulating comment creation');
      }
      // Generate a mock ID
      const mockId = `mock_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`;
      return {
        ...comment,
        id: mockId,
        userDisplayName: 'Unknown',
      };
    }

    const insertData = toDatabaseInsert(comment);

    const { data, error } = await supabase
      .from('comments')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('[commentRepository] create error:', error);
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    const newComment = fromDatabase(data);

    // Fetch user display name
    const { data: user } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', newComment.userId)
      .single();

    newComment.userDisplayName = user?.display_name ?? 'Unknown';

    return newComment;
  },

  /**
   * Update an existing comment
   */
  async update(id: string, text: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .update({ text })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[commentRepository] update error:', error);
      throw new Error(`Failed to update comment ${id}: ${error.message}`);
    }
  },

  /**
   * Delete a comment
   */
  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[commentRepository] delete error:', error);
      throw new Error(`Failed to delete comment ${id}: ${error.message}`);
    }
  },

  /**
   * Subscribe to realtime comment updates for a post
   */
  subscribeToPost(
    postId: string,
    onInsert: (comment: Comment) => void
  ): () => void {
    const channel = supabase
      .channel(`comments:post_id=eq.${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          if (payload.new) {
            let comment = fromDatabase(payload.new as DatabaseComment);

            // Fetch user display name
            const { data: user } = await supabase
              .from('users')
              .select('display_name')
              .eq('id', comment.userId)
              .single();

            comment.userDisplayName = user?.display_name ?? 'Unknown';

            onInsert(comment);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
