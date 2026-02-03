// src/lib/sync/repositories/notificationRepository.ts
// Repository for user notifications CRUD operations with Supabase

import { supabase, isSupabasePlaceholder } from '../../supabase/client';
import type { AppNotification } from '../../socialModel';
import type { DatabaseNotification, DatabaseNotificationInsert } from '../../supabase/types';
declare const __DEV__: boolean | undefined;

/**
 * Repository interface for notifications
 */
export interface NotificationRepository {
  // Pull from server
  fetchUserNotifications(userId: string, limit?: number): Promise<AppNotification[]>;
  fetchUnreadCount(userId: string): Promise<number>;

  // Push to server
  create(notification: Omit<DatabaseNotificationInsert, 'user_id'>, userId: string): Promise<string>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;

  // Realtime
  subscribeToUser(
    userId: string,
    onInsert: (notification: AppNotification) => void
  ): () => void;
}

/**
 * Convert database row to AppNotification
 */
function fromDatabase(db: DatabaseNotification): AppNotification {
  return {
    id: db.id,
    userId: db.user_id,
    type: db.type,
    title: db.title,
    body: db.body,
    postId: db.post_id ?? undefined,
    commentId: db.comment_id ?? undefined,
    readAtMs: db.read_at ? new Date(db.read_at).getTime() : undefined,
    createdAtMs: new Date(db.created_at).getTime(),
  };
}

/**
 * Notification repository implementation
 */
export const notificationRepository: NotificationRepository = {
  /**
   * Fetch notifications for a user
   */
  async fetchUserNotifications(userId: string, limit = 50): Promise<AppNotification[]> {
    // If Supabase is not configured, return empty array
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[notificationRepository] Supabase placeholder detected, returning empty array');
      }
      return [];
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[notificationRepository] fetchUserNotifications error:', error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return (data ?? []).map(fromDatabase);
  },

  /**
   * Fetch unread notification count for a user
   */
  async fetchUnreadCount(userId: string): Promise<number> {
    // If Supabase is not configured, return 0
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[notificationRepository] Supabase placeholder detected, returning 0');
      }
      return 0;
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) {
      console.error('[notificationRepository] fetchUnreadCount error:', error);
      return 0;
    }

    return count ?? 0;
  },

  /**
   * Create a new notification
   */
  async create(notification: Omit<DatabaseNotificationInsert, 'user_id'>, userId: string): Promise<string> {
    // If Supabase is not configured, simulate success with a mock ID
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[notificationRepository] Supabase placeholder detected, simulating notification creation');
      }
      // Generate a mock ID
      return `mock_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`;
    }

    const insertData: DatabaseNotificationInsert = {
      ...notification,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('[notificationRepository] create error:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return data.id;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, userId: string): Promise<void> {
    // If Supabase is not configured, do nothing
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[notificationRepository] Supabase placeholder detected, skipping markAsRead');
      }
      return;
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[notificationRepository] markAsRead error:', error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    // If Supabase is not configured, do nothing
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[notificationRepository] Supabase placeholder detected, skipping markAllAsRead');
      }
      return;
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) {
      console.error('[notificationRepository] markAllAsRead error:', error);
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  },

  /**
   * Subscribe to realtime notification updates for a user
   */
  subscribeToUser(
    userId: string,
    onInsert: (notification: AppNotification) => void
  ): () => void {
    // If Supabase is not configured, return no-op subscription
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[notificationRepository] Supabase placeholder detected, returning no-op subscription');
      }
      return () => {};
    }

    const channel = supabase
      .channel(`notifications:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            onInsert(fromDatabase(payload.new as DatabaseNotification));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
