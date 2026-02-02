// src/lib/sync/repositories/friendRepository.ts
// Repository for friend relationships CRUD operations with Supabase

import { supabase, isSupabasePlaceholder } from '../../supabase/client';
import type { FriendEdge } from '../../socialModel';
import type { DatabaseFriendship, DatabaseFriendshipInsert } from '../../supabase/types';
declare const __DEV__: boolean | undefined;

/**
 * Repository interface for friend relationships
 */
export interface FriendRepository {
  // Pull from server
  fetchAll(userId: string): Promise<FriendEdge[]>;
  fetchSince(userId: string, timestamp: number): Promise<FriendEdge[]>;

  // Push to server
  upsert(edge: FriendEdge): Promise<void>;
  delete(userId: string, otherUserId: string): Promise<void>;

  // Batch operations
  syncUp(edges: FriendEdge[]): Promise<void>;

  // Realtime
  subscribeToUser(
    userId: string,
    onInsert: (edge: FriendEdge) => void,
    onUpdate: (edge: FriendEdge) => void,
    onDelete: (userId: string, otherUserId: string) => void
  ): () => void;
}

/**
 * Convert FriendEdge to database insert format
 */
function toDatabaseInsert(edge: FriendEdge): DatabaseFriendshipInsert {
  return {
    user_id: edge.userId,
    friend_id: edge.otherUserId,
    status: edge.status,
  };
}

/**
 * Convert database row to FriendEdge
 */
function fromDatabase(db: DatabaseFriendship): FriendEdge {
  return {
    userId: db.user_id,
    otherUserId: db.friend_id,
    status: db.status,
    updatedAtMs: new Date(db.updated_at).getTime(),
  };
}

/**
 * Friend repository implementation
 */
export const friendRepository: FriendRepository = {
  /**
   * Fetch all friend edges for a user
   */
  async fetchAll(userId: string): Promise<FriendEdge[]> {
    // If Supabase is not configured, return empty array
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[friendRepository] Supabase placeholder detected, returning empty array');
      }
      return [];
    }

    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${userId},and.friend_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[friendRepository] fetchAll error:', error);
      throw new Error(`Failed to fetch friendships: ${error.message}`);
    }

    return (data ?? []).map(fromDatabase);
  },

  /**
   * Fetch friendships since a given timestamp
   */
  async fetchSince(userId: string, timestamp: number): Promise<FriendEdge[]> {
    // If Supabase is not configured, return empty array
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[friendRepository] Supabase placeholder detected, returning empty array');
      }
      return [];
    }

    const sinceDate = new Date(timestamp).toISOString();

    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${userId},and.friend_id.eq.${userId}`)
      .gt('updated_at', sinceDate)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[friendRepository] fetchSince error:', error);
      throw new Error(`Failed to fetch friendships since ${timestamp}: ${error.message}`);
    }

    return (data ?? []).map(fromDatabase);
  },

  /**
   * Upsert a friend edge
   */
  async upsert(edge: FriendEdge): Promise<void> {
    // If Supabase is not configured, do nothing
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[friendRepository] Supabase placeholder detected, skipping upsert');
      }
      return;
    }

    const insertData = toDatabaseInsert(edge);

    const { error } = await supabase
      .from('friendships')
      .upsert(insertData, { onConflict: 'user_id,friend_id' });

    if (error) {
      console.error('[friendRepository] upsert error:', error);
      throw new Error(`Failed to upsert friendship: ${error.message}`);
    }
  },

  /**
   * Delete friendship(s) between two users
   */
  async delete(userId: string, otherUserId: string): Promise<void> {
    // If Supabase is not configured, do nothing
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[friendRepository] Supabase placeholder detected, skipping delete');
      }
      return;
    }

    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${userId})`);

    if (error) {
      console.error('[friendRepository] delete error:', error);
      throw new Error(`Failed to delete friendship: ${error.message}`);
    }
  },

  /**
   * Batch sync up multiple friend edges
   */
  async syncUp(edges: FriendEdge[]): Promise<void> {
    if (edges.length === 0) return;

    // If Supabase is not configured, do nothing
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[friendRepository] Supabase placeholder detected, skipping syncUp');
      }
      return;
    }

    const insertData = edges.map(e => toDatabaseInsert(e));

    const { error } = await supabase
      .from('friendships')
      .upsert(insertData, { onConflict: 'user_id,friend_id' });

    if (error) {
      console.error('[friendRepository] syncUp error:', error);
      throw new Error(`Failed to sync up friendships: ${error.message}`);
    }
  },

  /**
   * Subscribe to realtime changes for a user's friendships
   */
  subscribeToUser(
    userId: string,
    onInsert: (edge: FriendEdge) => void,
    onUpdate: (edge: FriendEdge) => void,
    onDelete: (userId: string, otherUserId: string) => void
  ): () => void {
    // If Supabase is not configured, return no-op subscription
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[friendRepository] Supabase placeholder detected, returning no-op subscription');
      }
      return () => {};
    }

    // Subscribe to edges where user is either user_id or friend_id
    const filter1 = `user_id=eq.${userId}`;
    const filter2 = `friend_id=eq.${userId}`;

    const channel = supabase
      .channel(`friendships:user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: filter1,
        },
        (payload) => {
          if (payload.new) {
            onInsert(fromDatabase(payload.new as DatabaseFriendship));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships',
          filter: filter2,
        },
        (payload) => {
          if (payload.new) {
            onInsert(fromDatabase(payload.new as DatabaseFriendship));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friendships',
          filter: filter1,
        },
        (payload) => {
          if (payload.new) {
            onUpdate(fromDatabase(payload.new as DatabaseFriendship));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'friendships',
          filter: filter2,
        },
        (payload) => {
          if (payload.new) {
            onUpdate(fromDatabase(payload.new as DatabaseFriendship));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'friendships',
          filter: filter1,
        },
        (payload) => {
          if (payload.old) {
            const db = payload.old as DatabaseFriendship;
            onDelete(db.user_id, db.friend_id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'friendships',
          filter: filter2,
        },
        (payload) => {
          if (payload.old) {
            const db = payload.old as DatabaseFriendship;
            onDelete(db.user_id, db.friend_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
