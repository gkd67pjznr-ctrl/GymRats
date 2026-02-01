// src/lib/sync/repositories/routineRepository.ts
// Repository for user routines CRUD operations with Supabase

import { supabase, isSupabasePlaceholder } from '../../supabase/client';
import type { Routine } from '../../routinesModel';
import type { DatabaseRoutine, DatabaseRoutineInsert, DatabaseRoutineUpdate } from '../../supabase/types';
declare const __DEV__: boolean | undefined;

/**
 * Repository interface for user routines
 */
export interface RoutineRepository {
  // Pull from server
  fetchAll(userId: string): Promise<Routine[]>;
  fetchSince(userId: string, timestamp: number): Promise<Routine[]>;
  fetchById(userId: string, id: string): Promise<Routine | null>;

  // Push to server
  create(routine: Routine, userId: string): Promise<string>;
  update(id: string, routine: Partial<Routine>, userId: string): Promise<void>;
  delete(id: string, userId: string): Promise<void>;

  // Batch operations
  syncUp(routines: Routine[], userId: string): Promise<void>;

  // Realtime
  subscribeToUser(
    userId: string,
    onInsert: (routine: Routine) => void,
    onUpdate: (routine: Routine) => void,
    onDelete: (routineId: string) => void
  ): () => void;
}

/**
 * Convert Routine to database insert format
 */
function toDatabaseInsert(routine: Routine, userId: string): DatabaseRoutineInsert {
  return {
    user_id: userId,
    name: routine.name,
    exercises: routine.exercises,
    source_plan_id: routine.sourcePlanId ?? null,
    source_plan_category: routine.sourcePlanCategory ?? null,
  };
}

/**
 * Convert partial Routine to database update format
 */
function toDatabaseUpdate(routine: Partial<Routine>): DatabaseRoutineUpdate {
  const update: DatabaseRoutineUpdate = {};

  if (routine.name !== undefined) update.name = routine.name;
  if (routine.exercises !== undefined) update.exercises = routine.exercises;
  if (routine.sourcePlanId !== undefined) update.source_plan_id = routine.sourcePlanId;
  if (routine.sourcePlanCategory !== undefined) update.source_plan_category = routine.sourcePlanCategory;

  return update;
}

/**
 * Convert database row to Routine
 */
function fromDatabase(db: DatabaseRoutine): Routine {
  return {
    id: db.id,
    userId: db.user_id,
    name: db.name,
    exercises: db.exercises,
    sourcePlanId: db.source_plan_id ?? undefined,
    sourcePlanCategory: db.source_plan_category ?? undefined,
    updatedAtMs: new Date(db.updated_at).getTime(),
  };
}

/**
 * Routine repository implementation
 */
export const routineRepository: RoutineRepository = {
  /**
   * Fetch all routines for a user
   */
  async fetchAll(userId: string): Promise<Routine[]> {
    // If Supabase is not configured, return empty array
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[routineRepository] Supabase placeholder detected, returning empty array');
      }
      return [];
    }

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[routineRepository] fetchAll error:', error);
      throw new Error(`Failed to fetch routines: ${error.message}`);
    }

    return (data ?? []).map(fromDatabase);
  },

  /**
   * Fetch routines since a given timestamp (incremental sync)
   */
  async fetchSince(userId: string, timestamp: number): Promise<Routine[]> {
    // If Supabase is not configured, return empty array
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[routineRepository] Supabase placeholder detected, returning empty array');
      }
      return [];
    }

    const sinceDate = new Date(timestamp).toISOString();

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId)
      .gt('updated_at', sinceDate)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[routineRepository] fetchSince error:', error);
      throw new Error(`Failed to fetch routines since ${timestamp}: ${error.message}`);
    }

    return (data ?? []).map(fromDatabase);
  },

  /**
   * Fetch a single routine by ID
   */
  async fetchById(userId: string, id: string): Promise<Routine | null> {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[routineRepository] fetchById error:', error);
      throw new Error(`Failed to fetch routine ${id}: ${error.message}`);
    }

    return data ? fromDatabase(data) : null;
  },

  /**
   * Create a new routine
   */
  async create(routine: Routine, userId: string): Promise<string> {
    const insertData = toDatabaseInsert(routine, userId);

    const { data, error } = await supabase
      .from('routines')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('[routineRepository] create error:', error);
      throw new Error(`Failed to create routine: ${error.message}`);
    }

    return data.id;
  },

  /**
   * Update an existing routine
   */
  async update(id: string, routine: Partial<Routine>, userId: string): Promise<void> {
    const updateData = toDatabaseUpdate(routine);

    const { error } = await supabase
      .from('routines')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[routineRepository] update error:', error);
      throw new Error(`Failed to update routine ${id}: ${error.message}`);
    }
  },

  /**
   * Delete a routine
   */
  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[routineRepository] delete error:', error);
      throw new Error(`Failed to delete routine ${id}: ${error.message}`);
    }
  },

  /**
   * Batch sync up multiple routines
   */
  async syncUp(routines: Routine[], userId: string): Promise<void> {
    if (routines.length === 0) return;

    // If Supabase is not configured, do nothing
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[routineRepository] Supabase placeholder detected, skipping syncUp');
      }
      return;
    }

    const insertData = routines.map(r => toDatabaseInsert(r, userId));

    const { error } = await supabase
      .from('routines')
      .upsert(insertData, { onConflict: 'id' });

    if (error) {
      console.error('[routineRepository] syncUp error:', error);
      throw new Error(`Failed to sync up routines: ${error.message}`);
    }
  },

  /**
   * Subscribe to realtime changes for a user's routines
   */
  subscribeToUser(
    userId: string,
    onInsert: (routine: Routine) => void,
    onUpdate: (routine: Routine) => void,
    onDelete: (routineId: string) => void
  ): () => void {
    const channel = supabase
      .channel(`routines:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'routines',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            onInsert(fromDatabase(payload.new as DatabaseRoutine));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'routines',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            onUpdate(fromDatabase(payload.new as DatabaseRoutine));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'routines',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.old) {
            onDelete((payload.old as DatabaseRoutine).id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
