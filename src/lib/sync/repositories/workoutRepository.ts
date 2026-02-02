// src/lib/sync/repositories/workoutRepository.ts
// Repository for workout sessions CRUD operations with Supabase

import { supabase, isSupabasePlaceholder } from '../../supabase/client';
import type { WorkoutSession } from '../../workoutModel';
import type { DatabaseWorkout, DatabaseWorkoutInsert, DatabaseWorkoutUpdate } from '../../supabase/types';
import { RealtimeChannel } from '@supabase/supabase-js';
declare const __DEV__: boolean | undefined;

/**
 * Repository interface for workout sessions
 */
export interface WorkoutRepository {
  // Pull from server
  fetchAll(userId: string): Promise<WorkoutSession[]>;
  fetchSince(userId: string, timestamp: number): Promise<WorkoutSession[]>;
  fetchById(userId: string, id: string): Promise<WorkoutSession | null>;

  // Push to server
  create(workout: WorkoutSession, userId: string): Promise<string>;
  update(id: string, workout: Partial<WorkoutSession>, userId: string): Promise<void>;
  delete(id: string, userId: string): Promise<void>;

  // Batch operations
  syncUp(workouts: WorkoutSession[], userId: string): Promise<void>;

  // Realtime
  subscribeToUser(
    userId: string,
    onInsert: (workout: WorkoutSession) => void,
    onUpdate: (workout: WorkoutSession) => void,
    onDelete: (workoutId: string) => void
  ): () => void;
}

/**
 * Convert WorkoutSession to database insert format
 */
function toDatabaseInsert(workout: WorkoutSession, userId: string): DatabaseWorkoutInsert {
  return {
    user_id: userId,
    started_at: workout.startedAtMs,
    ended_at: workout.endedAtMs,
    sets: workout.sets,
    routine_id: workout.routineId ?? null,
    routine_name: workout.routineName ?? null,
    plan_id: workout.planId ?? null,
    completion_pct: workout.completionPct ?? null,
  };
}

/**
 * Convert partial WorkoutSession to database update format
 */
function toDatabaseUpdate(workout: Partial<WorkoutSession>): DatabaseWorkoutUpdate {
  const update: DatabaseWorkoutUpdate = {};

  if (workout.startedAtMs !== undefined) update.started_at = workout.startedAtMs;
  if (workout.endedAtMs !== undefined) update.ended_at = workout.endedAtMs;
  if (workout.sets !== undefined) update.sets = workout.sets;
  if (workout.routineId !== undefined) update.routine_id = workout.routineId;
  if (workout.routineName !== undefined) update.routine_name = workout.routineName;
  if (workout.planId !== undefined) update.plan_id = workout.planId;
  if (workout.completionPct !== undefined) update.completion_pct = workout.completionPct;

  return update;
}

/**
 * Convert database row to WorkoutSession
 */
function fromDatabase(db: DatabaseWorkout): WorkoutSession {
  return {
    id: db.id,
    startedAtMs: db.started_at,
    endedAtMs: db.ended_at,
    sets: db.sets,
    routineId: db.routine_id ?? undefined,
    routineName: db.routine_name ?? undefined,
    planId: db.plan_id ?? undefined,
    completionPct: db.completion_pct ?? undefined,
  };
}

/**
 * Workout repository implementation
 */
export const workoutRepository: WorkoutRepository = {
  /**
   * Fetch all workouts for a user
   */
  async fetchAll(userId: string): Promise<WorkoutSession[]> {
    // If Supabase is not configured, return empty array
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[workoutRepository] Supabase placeholder detected, returning empty array');
      }
      return [];
    }

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[workoutRepository] fetchAll error:', error);
      throw new Error(`Failed to fetch workouts: ${error.message}`);
    }

    return (data ?? []).map(fromDatabase);
  },

  /**
   * Fetch workouts since a given timestamp (incremental sync)
   */
  async fetchSince(userId: string, timestamp: number): Promise<WorkoutSession[]> {
    // Convert milliseconds to ISO timestamp for comparison
    const sinceDate = new Date(timestamp).toISOString();

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .gt('created_at', sinceDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[workoutRepository] fetchSince error:', error);
      throw new Error(`Failed to fetch workouts since ${timestamp}: ${error.message}`);
    }

    return (data ?? []).map(fromDatabase);
  },

  /**
   * Fetch a single workout by ID
   */
  async fetchById(userId: string, id: string): Promise<WorkoutSession | null> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('[workoutRepository] fetchById error:', error);
      throw new Error(`Failed to fetch workout ${id}: ${error.message}`);
    }

    return data ? fromDatabase(data) : null;
  },

  /**
   * Create a new workout
   */
  async create(workout: WorkoutSession, userId: string): Promise<string> {
    const insertData = toDatabaseInsert(workout, userId);

    const { data, error } = await supabase
      .from('workouts')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('[workoutRepository] create error:', error);
      throw new Error(`Failed to create workout: ${error.message}`);
    }

    return data.id;
  },

  /**
   * Update an existing workout
   */
  async update(id: string, workout: Partial<WorkoutSession>, userId: string): Promise<void> {
    const updateData = toDatabaseUpdate(workout);

    const { error } = await supabase
      .from('workouts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[workoutRepository] update error:', error);
      throw new Error(`Failed to update workout ${id}: ${error.message}`);
    }
  },

  /**
   * Delete a workout
   */
  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[workoutRepository] delete error:', error);
      throw new Error(`Failed to delete workout ${id}: ${error.message}`);
    }
  },

  /**
   * Batch sync up multiple workouts
   */
  async syncUp(workouts: WorkoutSession[], userId: string): Promise<void> {
    if (workouts.length === 0) return;

    // If Supabase is not configured, do nothing
    if (isSupabasePlaceholder) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('[workoutRepository] Supabase placeholder detected, skipping syncUp');
      }
      return;
    }

    const insertData = workouts.map(w => toDatabaseInsert(w, userId));

    const { error } = await supabase
      .from('workouts')
      .upsert(insertData, { onConflict: 'id' });

    if (error) {
      console.error('[workoutRepository] syncUp error:', error);
      throw new Error(`Failed to sync up workouts: ${error.message}`);
    }
  },

  /**
   * Subscribe to realtime changes for a user's workouts
   */
  subscribeToUser(
    userId: string,
    onInsert: (workout: WorkoutSession) => void,
    onUpdate: (workout: WorkoutSession) => void,
    onDelete: (workoutId: string) => void
  ): () => void {
    const channel = supabase
      .channel(`workouts:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workouts',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            onInsert(fromDatabase(payload.new as DatabaseWorkout));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workouts',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            onUpdate(fromDatabase(payload.new as DatabaseWorkout));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'workouts',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.old) {
            onDelete((payload.old as DatabaseWorkout).id);
          }
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  },
};
