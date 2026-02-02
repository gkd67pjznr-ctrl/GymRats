// src/lib/sync/ConflictResolver.ts
// Conflict resolution strategies for sync

import type { ConflictResult, ConflictStrategy } from './syncTypes';
import type { WorkoutSession } from '../workoutModel';
import type { Routine } from '../routinesModel';
import type { FriendEdge , WorkoutPost } from '../socialModel';

/**
 * Generic conflict resolver with timestamp comparison
 */
export function resolveByTimestamp<T extends { updatedAtMs?: number }>(
  local: T,
  remote: T,
  strategy: ConflictStrategy = 'last-write-wins'
): ConflictResult<T> {
  const localTime = local.updatedAtMs ?? 0;
  const remoteTime = remote.updatedAtMs ?? 0;

  // Check if there's actually a conflict (same timestamp = no conflict)
  if (localTime === remoteTime) {
    return {
      hasConflict: false,
      strategy: 'last-write-wins',
      local,
      remote,
      merged: local,
    };
  }

  // Detect concurrent edits (within 1 second)
  const isConcurrent = Math.abs(localTime - remoteTime) < 1000;

  if (isConcurrent && strategy === 'prompt') {
    return {
      hasConflict: true,
      strategy: 'prompt',
      local,
      remote,
    };
  }

  switch (strategy) {
    case 'server-wins':
      return {
        hasConflict: true,
        strategy: 'server-wins',
        local,
        remote,
        merged: remote,
      };

    case 'client-wins':
      return {
        hasConflict: true,
        strategy: 'client-wins',
        local,
        remote,
        merged: local,
      };

    case 'last-write-wins':
    default:
      return {
        hasConflict: true,
        strategy: 'last-write-wins',
        local,
        remote,
        merged: remoteTime > localTime ? remote : local,
      };
  }
}

/**
 * Resolve workout session conflicts with smart merge
 */
export function resolveWorkoutConflict(
  local: WorkoutSession,
  remote: WorkoutSession
): ConflictResult<WorkoutSession> {
  // Check if they're actually the same workout
  if (local.id !== remote.id) {
    return {
      hasConflict: false,
      strategy: 'last-write-wins',
      local,
      remote,
      merged: remote,
    };
  }

  // Smart merge for workouts
  const merged: WorkoutSession = {
    id: remote.id,
    startedAtMs: Math.max(local.startedAtMs, remote.startedAtMs),
    endedAtMs: Math.max(local.endedAtMs, remote.endedAtMs),

    // Merge sets: combine unique set IDs
    sets: mergeSets(local.sets, remote.sets),

    // Use latest metadata
    routineId: remote.updatedAtMs > (local.updatedAtMs ?? 0) ? remote.routineId : local.routineId,
    routineName: remote.updatedAtMs > (local.updatedAtMs ?? 0) ? remote.routineName : local.routineName,
    planId: remote.updatedAtMs > (local.updatedAtMs ?? 0) ? remote.planId : local.planId,
    completionPct: remote.updatedAtMs > (local.updatedAtMs ?? 0) ? remote.completionPct : local.completionPct,
  };

  // Check if there was an actual conflict
  const hasConflict =
    JSON.stringify(local.sets) !== JSON.stringify(remote.sets) ||
    local.startedAtMs !== remote.startedAtMs ||
    local.endedAtMs !== remote.endedAtMs;

  return {
    hasConflict,
    strategy: 'merge',
    local,
    remote,
    merged,
  };
}

/**
 * Merge workout sets by unique ID
 */
function mergeSets(local: WorkoutSession['sets'], remote: WorkoutSession['sets']): WorkoutSession['sets'] {
  const setMap = new Map<string, WorkoutSession['sets'][0]>();

  // Add all local sets
  for (const set of local) {
    setMap.set(set.id, set);
  }

  // Override/add remote sets (later timestamp wins)
  for (const set of remote) {
    setMap.set(set.id, set);
  }

  return Array.from(setMap.values());
}

/**
 * Resolve routine conflicts with smart merge
 */
export function resolveRoutineConflict(
  local: Routine,
  remote: Routine
): ConflictResult<Routine> {
  // Check if they're the same routine
  if (local.id !== remote.id) {
    return {
      hasConflict: false,
      strategy: 'last-write-wins',
      local,
      remote,
      merged: remote,
    };
  }

  // Check if there's a conflict in content
  const nameConflict = local.name !== remote.name;
  const exerciseConflict = JSON.stringify(local.exercises) !== JSON.stringify(remote.exercises);

  if (!nameConflict && !exerciseConflict) {
    return {
      hasConflict: false,
      strategy: 'last-write-wins',
      local,
      remote,
      merged: remote,
    };
  }

  // For routines, use last-write-wins on most fields
  // But attempt to merge exercises if no ID conflicts
  const merged: Routine = {
    id: remote.id,
    userId: remote.userId,
    name: remote.updatedAtMs > local.updatedAtMs ? remote.name : local.name,
    exercises: remote.updatedAtMs > local.updatedAtMs ? remote.exercises : local.exercises,
    sourcePlanId: remote.sourcePlanId,
    sourcePlanCategory: remote.sourcePlanCategory,
    updatedAtMs: Math.max(remote.updatedAtMs, local.updatedAtMs),
  };

  return {
    hasConflict: nameConflict || exerciseConflict,
    strategy: nameConflict ? 'last-write-wins' : 'merge',
    local,
    remote,
    merged,
  };
}

/**
 * Resolve friend relationship conflicts with state machine
 */
export function resolveFriendConflict(
  local: FriendEdge,
  remote: FriendEdge
): ConflictResult<FriendEdge> {
  // Friend status state machine for merge
  const statusPriority: Record<string, number> = {
    'blocked': 5,
    'friends': 4,
    'requested': 3,
    'pending': 2,
    'none': 1,
  };

  const localPriority = statusPriority[local.status] ?? 0;
  const remotePriority = statusPriority[remote.status] ?? 0;

  // Use higher priority status
  const mergedStatus = remotePriority >= localPriority ? remote.status : local.status;
  const mergedTime = Math.max(local.updatedAtMs, remote.updatedAtMs);

  const merged: FriendEdge = {
    userId: local.userId,
    otherUserId: local.otherUserId,
    status: mergedStatus as FriendEdge['status'],
    updatedAtMs: mergedTime,
  };

  return {
    hasConflict: local.status !== remote.status,
    strategy: 'merge',
    local,
    remote,
    merged,
  };
}

/**
 * Resolve post conflicts
 */
export function resolvePostConflict(
  local: WorkoutPost,
  remote: WorkoutPost
): ConflictResult<WorkoutPost> {
  // For posts, always use server values for counters
  const merged: WorkoutPost = {
    id: remote.id,
    authorUserId: remote.authorUserId,
    title: remote.updatedAtMs > (local.updatedAtMs ?? 0) ? remote.title : local.title,
    caption: remote.updatedAtMs > (local.updatedAtMs ?? 0) ? remote.caption : local.caption,
    privacy: remote.privacy,
    durationSec: remote.durationSec,
    completionPct: remote.completionPct,
    exerciseCount: remote.exerciseCount,
    setCount: remote.setCount,
    workoutSnapshot: remote.workoutSnapshot,
    createdAtMs: remote.createdAtMs,
    // Always use server counters
    likeCount: remote.likeCount,
    commentCount: remote.commentCount,
  };

  const hasConflict =
    (local.title !== remote.title && local.updatedAtMs && local.updatedAtMs > remote.updatedAtMs) ||
    (local.caption !== remote.caption && local.updatedAtMs && local.updatedAtMs > remote.updatedAtMs);

  return {
    hasConflict,
    strategy: hasConflict ? 'last-write-wins' : 'server-wins',
    local,
    remote,
    merged,
  };
}

/**
 * Generic merge helper for arrays by ID
 */
export function mergeArrayById<T extends { id: string }>(
  local: T[],
  remote: T[],
  compareTimestamp?: (item: T) => number
): T[] {
  const map = new Map<string, T>();

  // Add local items
  for (const item of local) {
    map.set(item.id, item);
  }

  // Add/override with remote items
  for (const item of remote) {
    const existing = map.get(item.id);

    if (!existing) {
      map.set(item.id, item);
    } else if (compareTimestamp) {
      // Use item with later timestamp
      const localTime = compareTimestamp(existing);
      const remoteTime = compareTimestamp(item);
      if (remoteTime > localTime) {
        map.set(item.id, item);
      }
    } else {
      // Remote wins
      map.set(item.id, item);
    }
  }

  return Array.from(map.values());
}
