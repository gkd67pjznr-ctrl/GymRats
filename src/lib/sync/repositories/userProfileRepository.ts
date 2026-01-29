// src/lib/sync/repositories/userProfileRepository.ts
// Repository for user profile data with Supabase backend

import { supabase } from '../../supabase/client';
import { logError } from '../../errorHandler';

/**
 * User profile from database
 */
export type DbUserProfile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * User profile for app use
 */
export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: number;
  updatedAt: number;
};

/**
 * Map database user profile to app format
 */
function mapDbUserProfile(db: DbUserProfile): UserProfile {
  return {
    id: db.id,
    email: db.email,
    displayName: db.display_name ?? db.email.split('@')[0],
    avatarUrl: db.avatar_url,
    createdAt: new Date(db.created_at).getTime(),
    updatedAt: new Date(db.updated_at).getTime(),
  };
}

/**
 * Search users by display name or email prefix
 * Uses a database function that allows searching while protecting privacy
 */
export async function searchUsers(query: string, limit: number = 20): Promise<UserProfile[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('search_users', {
      search_query: query.trim(),
      result_limit: limit,
    });

    if (error) {
      // If the function doesn't exist, fall back to direct query
      if (error.code === '42883') { // function does not exist
        console.warn('[userProfileRepository] search_users function not found, using fallback');
        return searchUsersFallback(query, limit);
      }
      throw error;
    }

    return (data ?? []).map(mapDbUserProfile);
  } catch (error) {
    logError({ context: 'UserProfileRepository', error, userMessage: 'Failed to search users' });
    return [];
  }
}

/**
 * Fallback search using direct query (requires proper RLS policy)
 * This is a simplified version that only searches by display_name
 */
async function searchUsersFallback(query: string, limit: number): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, avatar_url, created_at, updated_at')
      .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;

    return (data ?? []).map(mapDbUserProfile);
  } catch (error) {
    logError({ context: 'UserProfileRepository', error, userMessage: 'Failed to search users (fallback)' });
    return [];
  }
}

/**
 * Get a user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, avatar_url, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw error;
    }

    return mapDbUserProfile(data);
  } catch (error) {
    logError({ context: 'UserProfileRepository', error, userMessage: 'Failed to get user profile' });
    return null;
  }
}

/**
 * Get multiple user profiles by IDs
 */
export async function getUserProfiles(userIds: string[]): Promise<UserProfile[]> {
  if (userIds.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, avatar_url, created_at, updated_at')
      .in('id', userIds);

    if (error) throw error;

    return (data ?? []).map(mapDbUserProfile);
  } catch (error) {
    logError({ context: 'UserProfileRepository', error, userMessage: 'Failed to get user profiles' });
    return [];
  }
}

/**
 * Update current user's profile
 */
export async function updateUserProfile(updates: {
  displayName?: string;
  avatarUrl?: string;
}): Promise<UserProfile | null> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const dbUpdates: {
      display_name?: string;
      avatar_url?: string;
    } = {};

    if (updates.displayName !== undefined) {
      dbUpdates.display_name = updates.displayName;
    }
    if (updates.avatarUrl !== undefined) {
      dbUpdates.avatar_url = updates.avatarUrl;
    }

    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', user.id)
      .select('id, email, display_name, avatar_url, created_at, updated_at')
      .single();

    if (error) throw error;

    return mapDbUserProfile(data);
  } catch (error) {
    logError({ context: 'UserProfileRepository', error, userMessage: 'Failed to update profile' });
    return null;
  }
}

/**
 * User profile repository object
 */
export const userProfileRepository = {
  searchUsers,
  getUserProfile,
  getUserProfiles,
  updateUserProfile,
};
