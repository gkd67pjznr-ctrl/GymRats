/**
 * Milestones data repository for Supabase sync.
 *
 * Handles CRUD operations for user earned milestones.
 */

import { supabase } from '@/src/lib/supabase/client';
import type { EarnedMilestone } from './types';

// ============================================================================
// Database Types
// ============================================================================

interface DbUserMilestone {
  id: string;
  user_id: string;
  milestone_id: string;
  earned_at: number;
  created_at: string;
}

// ============================================================================
// Converters
// ============================================================================

/**
 * Convert database row to EarnedMilestone.
 */
export function dbRowToEarnedMilestone(row: DbUserMilestone): EarnedMilestone {
  return {
    userId: row.user_id,
    milestoneId: row.milestone_id,
    earnedAt: row.earned_at,
  };
}

/**
 * Convert EarnedMilestone to database insert format.
 */
export function earnedMilestoneToDbInsert(milestone: EarnedMilestone): Omit<DbUserMilestone, 'id' | 'created_at'> {
  return {
    user_id: milestone.userId,
    milestone_id: milestone.milestoneId,
    earned_at: milestone.earnedAt,
  };
}

// ============================================================================
// Fetch Operations
// ============================================================================

/**
 * Fetch all earned milestones for the current user.
 *
 * @returns Map of milestone ID to earned timestamp, or null if not authenticated
 */
export async function fetchEarnedMilestones(): Promise<Record<string, number> | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('user_milestones')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    const msg = error.message ?? '';
    const isTableMissing = msg.includes('Could not find the') || msg.includes('does not exist');
    if (isTableMissing) {
      if (__DEV__) {
        console.warn('[milestonesRepository] Backend tables not set up yet, using local data');
      }
    } else {
      if (__DEV__) {
        console.error('[milestonesRepository] Error fetching milestones:', error);
      }
    }
    return null;
  }

  if (!data || data.length === 0) {
    return {};
  }

  // Convert to map of milestone_id -> earned_at
  const milestonesMap: Record<string, number> = {};
  for (const row of data as DbUserMilestone[]) {
    milestonesMap[row.milestone_id] = row.earned_at;
  }

  return milestonesMap;
}

/**
 * Fetch earned milestones for a specific user ID.
 * Used for viewing friend milestones.
 *
 * @param userId - User ID to fetch
 * @returns Map of milestone ID to earned timestamp, or null on error
 */
export async function fetchUserEarnedMilestones(
  userId: string
): Promise<Record<string, number> | null> {
  const { data, error } = await supabase
    .from('user_milestones')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    if (__DEV__) {
      console.error('[milestonesRepository] Error fetching user milestones:', error);
    }
    return null;
  }

  if (!data || data.length === 0) {
    return {};
  }

  const milestonesMap: Record<string, number> = {};
  for (const row of data as DbUserMilestone[]) {
    milestonesMap[row.milestone_id] = row.earned_at;
  }

  return milestonesMap;
}

// ============================================================================
// Push Operations
// ============================================================================

/**
 * Push all earned milestones to Supabase.
 * Uses upsert to handle both new milestones and updates.
 *
 * @param milestones - Map of milestone ID to earned timestamp
 * @returns Success status
 */
export async function pushEarnedMilestones(
  milestones: Record<string, number>
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // Convert map to array of insert objects
  const rows = Object.entries(milestones).map(([milestoneId, earnedAt]) =>
    earnedMilestoneToDbInsert({
      userId: user.id,
      milestoneId,
      earnedAt,
    })
  );

  if (rows.length === 0) {
    return true; // Nothing to push
  }

  const { error } = await supabase
    .from('user_milestones')
    .upsert(rows, { onConflict: 'user_id,milestone_id' });

  if (error) {
    const msg = error.message ?? '';
    const isTableMissing = msg.includes('Could not find the') || msg.includes('does not exist');
    if (isTableMissing) {
      if (__DEV__) {
        console.warn('[milestonesRepository] Backend tables not set up yet, skipping push');
      }
    } else {
      if (__DEV__) {
        console.error('[milestonesRepository] Error pushing milestones:', error);
      }
    }
    return false;
  }

  return true;
}

/**
 * Push a single earned milestone to Supabase.
 *
 * @param milestoneId - Milestone ID that was earned
 * @param earnedAt - Timestamp when earned
 * @returns Success status
 */
export async function pushSingleMilestone(
  milestoneId: string,
  earnedAt: number
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const row = earnedMilestoneToDbInsert({
    userId: user.id,
    milestoneId,
    earnedAt,
  });

  const { error } = await supabase
    .from('user_milestones')
    .upsert(row, { onConflict: 'user_id,milestone_id' });

  if (error) {
    if (__DEV__) {
      console.error('[milestonesRepository] Error pushing milestone:', error);
    }
    return false;
  }

  return true;
}

// ============================================================================
// Merge Operations
// ============================================================================

/**
 * Merge local milestones with server milestones.
 * Uses union strategy: if a milestone exists in either, keep the earlier timestamp.
 *
 * @param localMilestones - Local milestones from AsyncStorage
 * @param serverMilestones - Remote milestones from Supabase
 * @returns Merged milestones map
 */
export function mergeMilestones(
  localMilestones: Record<string, number>,
  serverMilestones: Record<string, number>
): Record<string, number> {
  const merged: Record<string, number> = {};

  // Add all local milestones
  for (const [id, timestamp] of Object.entries(localMilestones)) {
    merged[id] = timestamp;
  }

  // Add server milestones, keeping earlier timestamp if exists
  for (const [id, timestamp] of Object.entries(serverMilestones)) {
    const existing = merged[id];
    if (!existing || timestamp < existing) {
      merged[id] = timestamp;
    }
  }

  return merged;
}

// ============================================================================
// Sync Operations
// ============================================================================

/**
 * Full sync: pull from server, merge with local, push back.
 *
 * @param localMilestones - Local milestones to sync
 * @returns Merged milestones or null on error
 */
export async function syncEarnedMilestones(
  localMilestones: Record<string, number>
): Promise<Record<string, number> | null> {
  const serverMilestones = await fetchEarnedMilestones();

  if (!serverMilestones) {
    // No server data yet, push local
    const success = await pushEarnedMilestones(localMilestones);
    return success ? localMilestones : null;
  }

  // Merge milestones
  const merged = mergeMilestones(localMilestones, serverMilestones);

  // Push merged milestones back
  const success = await pushEarnedMilestones(merged);
  return success ? merged : null;
}

// ============================================================================
// Realtime Subscriptions
// ============================================================================

/**
 * Subscribe to milestone changes for the current user.
 *
 * @param callback - Function to call when milestones change
 * @returns Unsubscribe function
 */
export function subscribeToMilestones(
  callback: (milestones: Record<string, number>) => void
): () => void {
  const {
    data: { user },
  } = supabase.auth.getUser();

  if (!user) {
    return () => {}; // No-op if not authenticated
  }

  const channel = supabase
    .channel('user_milestones_changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'user_milestones',
        filter: `user_id=eq.${user.id}`,
      },
      async () => {
        // Refetch all milestones on any change
        const milestones = await fetchEarnedMilestones();
        if (milestones) {
          callback(milestones);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}
