// src/lib/sync/repositories/reactionRepository.ts
// Repository for post reactions CRUD operations with Supabase

import { supabase, isSupabasePlaceholder } from '../../supabase/client';
import type { Reaction } from '../../socialModel';
import type { DatabaseReaction, DatabaseReactionInsert } from '../../supabase/types';
declare const __DEV__: boolean | undefined;

/**
 * Repository interface for post reactions
 */
export interface ReactionRepository {
  // Pull from server
  fetchByPost(postId: string): Promise<Reaction[]>;
  fetchUserReaction(postId: string, userId: string): Promise<Reaction | null>;

  // Push to server
  create(reaction: Omit<Reaction, 'id'>): Promise<Reaction>;
  delete(id: string, userId: string, postId: string): Promise<void>;

  // Batch operations
  syncUp(reactions: Reaction[]): Promise<void>;

  // Realtime
  subscribeToPost(
    postId: string,
    onInsert: (reaction: Reaction) => void,
    onDelete: (reactionId: string) => void
  ): () => void;
}

/**
 * Convert Reaction to database insert format
 */
function toDatabaseInsert(reaction: Omit<Reaction, 'id'>): DatabaseReactionInsert {
  return {
    post_id: reaction.postId,
    user_id: reaction.userId,
    emote: reaction.emote,
  };
}

/**
 * Convert database row to Reaction
 */
function fromDatabase(db: DatabaseReaction): Reaction {
  return {
    id: db.id,
    postId: db.post_id,
    userId: db.user_id,
    emote: db.emote,
    createdAtMs: new Date(db.created_at).getTime(),
  };
}

/**
 * Reaction repository implementation
 */
export const reactionRepository: ReactionRepository = {
  /**
   * Fetch all reactions for a post
   */
  async fetchByPost(postId: string): Promise<Reaction[]> {
    // If Supabase is not configured, return empty array
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[reactionRepository] Supabase placeholder detected, returning empty array');
      }
      return [];
    }

    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[reactionRepository] fetchByPost error:', error);
      throw new Error(`Failed to fetch reactions: ${error.message}`);
    }

    return (data ?? []).map(fromDatabase);
  },

  /**
   * Fetch a user's reaction on a post
   */
  async fetchUserReaction(postId: string, userId: string): Promise<Reaction | null> {
    // If Supabase is not configured, return null
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[reactionRepository] Supabase placeholder detected, returning null');
      }
      return null;
    }

    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[reactionRepository] fetchUserReaction error:', error);
      throw new Error(`Failed to fetch user reaction: ${error.message}`);
    }

    return data ? fromDatabase(data) : null;
  },

  /**
   * Create a new reaction (or update existing)
   */
  async create(reaction: Omit<Reaction, 'id'>): Promise<Reaction> {
    // If Supabase is not configured, simulate success with a mock ID
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[reactionRepository] Supabase placeholder detected, simulating reaction creation');
      }
      // Generate a mock ID
      const mockId = `mock_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`;
      return {
        ...reaction,
        id: mockId,
      };
    }

    // First check if user already has a reaction on this post
    const existing = await this.fetchUserReaction(reaction.postId, reaction.userId);

    if (existing) {
      // Delete existing reaction first
      await this.delete(existing.id, reaction.userId, reaction.postId);
    }

    const insertData = toDatabaseInsert(reaction);

    const { data, error } = await supabase
      .from('reactions')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('[reactionRepository] create error:', error);
      throw new Error(`Failed to create reaction: ${error.message}`);
    }

    return fromDatabase(data);
  },

  /**
   * Delete a reaction
   */
  async delete(id: string, userId: string, postId: string): Promise<void> {
    // If Supabase is not configured, do nothing
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[reactionRepository] Supabase placeholder detected, skipping delete');
      }
      return;
    }

    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      console.error('[reactionRepository] delete error:', error);
      throw new Error(`Failed to delete reaction: ${error.message}`);
    }
  },

  /**
   * Batch sync up reactions
   */
  async syncUp(reactions: Reaction[]): Promise<void> {
    if (reactions.length === 0) return;

    const insertData = reactions.map(r => ({
      post_id: r.postId,
      user_id: r.userId,
      emote: r.emote,
    }));

    // Use upsert with conflict on post_id + user_id
    const { error } = await supabase
      .from('reactions')
      .upsert(insertData, { onConflict: 'post_id,user_id' });

    if (error) {
      console.error('[reactionRepository] syncUp error:', error);
      throw new Error(`Failed to sync up reactions: ${error.message}`);
    }
  },

  /**
   * Subscribe to realtime reaction updates for a post
   */
  subscribeToPost(
    postId: string,
    onInsert: (reaction: Reaction) => void,
    onDelete: (reactionId: string) => void
  ): () => void {
    const channel = supabase
      .channel(`reactions:post_id=eq.${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reactions',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          if (payload.new) {
            onInsert(fromDatabase(payload.new as DatabaseReaction));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'reactions',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          if (payload.old) {
            onDelete((payload.old as DatabaseReaction).id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
