// src/lib/supabase/types.ts
// Database types for Supabase schema (SPEC-005)
//
// This file defines TypeScript types matching the database schema.
// When the Supabase CLI is available, these can be regenerated with:
//   npx supabase gen types typescript --local > src/lib/supabase/types.ts

/**
 * Database schema types matching Supabase tables
 */

// ============================================================================
// JSONB Types (nested structures stored in JSON columns)
// ============================================================================

/**
 * WorkoutSet - stored in workouts.sets jsonb column
 * Matches src/lib/workoutModel.ts WorkoutSet type
 */
export type JsonWorkoutSet = {
  id: string;
  exerciseId: string;
  weightKg: number;
  reps: number;
  timestampMs: number;
};

/**
 * RoutineExercise - stored in routines.exercises jsonb column
 * Matches src/lib/routinesModel.ts RoutineExercise type
 */
export type JsonRoutineExercise = {
  id: string;
  exerciseId: string;
  note?: string;
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
};

/**
 * TopLine in workout snapshot - best set for an exercise
 */
export type JsonTopLine = {
  exerciseName: string;
  bestSet?: {
    weightLabel: string;
    reps: number;
    e1rmLabel?: string;
  };
};

/**
 * WorkoutSnapshot - stored in posts.workout_snapshot jsonb column
 * Matches src/lib/socialModel.ts WorkoutSnapshot type
 */
export type JsonWorkoutSnapshot = {
  routineName?: string;
  topLines: JsonTopLine[];
};

// ============================================================================
// Database Table Types (snake_case from database)
// ============================================================================

/**
 * WorkoutCalendarEntry - stored in users.workout_calendar jsonb column
 */
export type JsonWorkoutCalendarEntry = {
  date: string; // YYYY-MM-DD
  count: number;
  xp: number;
};

/**
 * users table - extends auth.users with profile data
 */
export type DatabaseUser = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
  // Gamification columns
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  level_up_celebration_shown: string | null; // ISO 8601 datetime
  current_streak: number;
  longest_streak: number;
  last_workout_date: string | null; // YYYY-MM-DD
  workout_calendar: JsonWorkoutCalendarEntry[];
  forge_tokens: number;
  tokens_earned_total: number;
  tokens_spent_total: number;
  milestones_completed: string[];
};

/**
 * routines table - user workout routines
 */
export type DatabaseRoutine = {
  id: string;
  user_id: string;
  name: string;
  exercises: JsonRoutineExercise[];
  source_plan_id: string | null;
  source_plan_category: string | null;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
};

/**
 * workouts table - workout sessions
 */
export type DatabaseWorkout = {
  id: string;
  user_id: string;
  started_at: number; // milliseconds since epoch (bigint)
  ended_at: number; // milliseconds since epoch (bigint)
  sets: JsonWorkoutSet[];
  routine_id: string | null;
  routine_name: string | null;
  plan_id: string | null;
  completion_pct: number | null;
  created_at: string; // ISO 8601 datetime
};

/**
 * FriendStatus enum for friendships table
 */
export type DatabaseFriendStatus =
  | "none"
  | "requested"
  | "pending"
  | "friends"
  | "blocked";

/**
 * friendships table - friend relationships
 */
export type DatabaseFriendship = {
  id: string;
  user_id: string;
  friend_id: string;
  status: DatabaseFriendStatus;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
};

/**
 * PrivacyLevel enum for posts table
 */
export type DatabasePrivacyLevel = "public" | "friends";

/**
 * posts table - social workout posts
 */
export type DatabasePost = {
  id: string;
  author_id: string;
  title: string | null;
  caption: string | null;
  privacy: DatabasePrivacyLevel;
  duration_sec: number | null;
  completion_pct: number | null;
  exercise_count: number | null;
  set_count: number | null;
  workout_snapshot: JsonWorkoutSnapshot | null;
  like_count: number;
  comment_count: number;
  created_at: string; // ISO 8601 datetime
};

/**
 * EmoteId enum for reactions table
 */
export type DatabaseEmoteId =
  | "like"
  | "fire"
  | "skull"
  | "crown"
  | "bolt"
  | "clap";

/**
 * reactions table - user reactions on posts
 */
export type DatabaseReaction = {
  id: string;
  post_id: string;
  user_id: string;
  emote: DatabaseEmoteId;
  created_at: string; // ISO 8601 datetime
};

/**
 * comments table - comments on posts
 */
export type DatabaseComment = {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  parent_comment_id: string | null;
  created_at: string; // ISO 8601 datetime
};

/**
 * NotificationType enum for notifications table
 */
export type DatabaseNotificationType =
  | "reaction"
  | "comment"
  | "friend_request"
  | "friend_accept"
  | "message";

/**
 * notifications table - user notifications
 */
export type DatabaseNotification = {
  id: string;
  user_id: string;
  type: DatabaseNotificationType;
  title: string;
  body: string;
  post_id: string | null;
  comment_id: string | null;
  read_at: string | null;
  created_at: string; // ISO 8601 datetime
};

// ============================================================================
// Insert Types (for creating new records)
// All fields are optional except required ones, id/db-generated fields omitted
// ============================================================================

export type DatabaseUserInsert = Omit<
  DatabaseUser,
  "id" | "created_at" | "updated_at"
> & {
  // Gamification fields have defaults in the database
  total_xp?: number;
  current_level?: number;
  xp_to_next_level?: number;
  level_up_celebration_shown?: string | null;
  current_streak?: number;
  longest_streak?: number;
  last_workout_date?: string | null;
  workout_calendar?: JsonWorkoutCalendarEntry[];
  forge_tokens?: number;
  tokens_earned_total?: number;
  tokens_spent_total?: number;
  milestones_completed?: string[];
};

export type DatabaseRoutineInsert = Pick<
  DatabaseRoutine,
  "name" | "exercises" | "source_plan_id" | "source_plan_category"
> & { user_id: string };

export type DatabaseWorkoutInsert = Pick<
  DatabaseWorkout,
  | "started_at"
  | "ended_at"
  | "sets"
  | "routine_id"
  | "routine_name"
  | "plan_id"
  | "completion_pct"
> & { user_id: string };

export type DatabaseFriendshipInsert = Pick<DatabaseFriendship, "status"> & { user_id: string; friend_id: string };

export type DatabasePostInsert = Pick<
  DatabasePost,
  | "title"
  | "caption"
  | "privacy"
  | "duration_sec"
  | "completion_pct"
  | "exercise_count"
  | "set_count"
  | "workout_snapshot"
> & { author_id: string };

export type DatabaseReactionInsert = Pick<DatabaseReaction, "emote"> & { post_id: string; user_id: string };

export type DatabaseCommentInsert = Pick<DatabaseComment, "text" | "parent_comment_id"> & { post_id: string; user_id: string };

export type DatabaseNotificationInsert = Pick<
  DatabaseNotification,
  "type" | "title" | "body" | "post_id" | "comment_id" | "read_at"
> & { user_id: string };

// ============================================================================
// Update Types (for updating existing records)
// All fields are optional
// ============================================================================

export type DatabaseUserUpdate = Partial<
  Pick<
    DatabaseUserInsert,
    | "email"
    | "display_name"
    | "avatar_url"
    // Gamification fields
    | "total_xp"
    | "current_level"
    | "xp_to_next_level"
    | "level_up_celebration_shown"
    | "current_streak"
    | "longest_streak"
    | "last_workout_date"
    | "workout_calendar"
    | "forge_tokens"
    | "tokens_earned_total"
    | "tokens_spent_total"
    | "milestones_completed"
  >
>;

export type DatabaseRoutineUpdate = Partial<
  Pick<DatabaseRoutineInsert, "name" | "exercises" | "source_plan_id" | "source_plan_category">
>;

export type DatabaseWorkoutUpdate = Partial<
  Pick<
    DatabaseWorkoutInsert,
    | "started_at"
    | "ended_at"
    | "sets"
    | "routine_id"
    | "routine_name"
    | "plan_id"
    | "completion_pct"
  >
>;

export type DatabaseFriendshipUpdate = Partial<Pick<DatabaseFriendshipInsert, "status">>;

export type DatabasePostUpdate = Partial<
  Pick<
    DatabasePostInsert,
    | "title"
    | "caption"
    | "privacy"
    | "duration_sec"
    | "completion_pct"
    | "exercise_count"
    | "set_count"
    | "workout_snapshot"
  >
>;

export type DatabaseCommentUpdate = Partial<Pick<DatabaseCommentInsert, "text">>;

export type DatabaseNotificationUpdate = Partial<
  Pick<DatabaseNotificationInsert, "read_at">
>;

// ============================================================================
// Mapping Utilities: camelCase/snake_case conversion
// ============================================================================

/**
 * Convert snake_case database keys to camelCase TypeScript keys
 * Use this to transform database rows to match model types
 */
export function snakeToCamel<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

/**
 * Convert camelCase TypeScript keys to snake_case database keys
 * Use this to transform model types for database insertion
 */
export function camelToSnake<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

/**
 * Convert DatabaseUser to camelCase format matching app usage
 */
export function mapDatabaseUser(dbUser: DatabaseUser): {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: dbUser.id,
    email: dbUser.email,
    displayName: dbUser.display_name,
    avatarUrl: dbUser.avatar_url,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
  };
}

/**
 * Convert DatabaseRoutine to camelCase format matching Routine type
 */
export function mapDatabaseRoutine(dbRoutine: DatabaseRoutine): {
  id: string;
  userId: string;
  name: string;
  exercises: JsonRoutineExercise[];
  sourcePlanId: string | null;
  sourcePlanCategory: string | null;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: dbRoutine.id,
    userId: dbRoutine.user_id,
    name: dbRoutine.name,
    exercises: dbRoutine.exercises,
    sourcePlanId: dbRoutine.source_plan_id,
    sourcePlanCategory: dbRoutine.source_plan_category,
    createdAt: dbRoutine.created_at,
    updatedAt: dbRoutine.updated_at,
  };
}

/**
 * Convert DatabaseWorkout to camelCase format matching WorkoutSession type
 */
export function mapDatabaseWorkout(dbWorkout: DatabaseWorkout): {
  id: string;
  userId: string;
  startedAt: number;
  endedAt: number;
  sets: JsonWorkoutSet[];
  routineId: string | null;
  routineName: string | null;
  planId: string | null;
  completionPct: number | null;
  createdAt: string;
} {
  return {
    id: dbWorkout.id,
    userId: dbWorkout.user_id,
    startedAt: dbWorkout.started_at,
    endedAt: dbWorkout.ended_at,
    sets: dbWorkout.sets,
    routineId: dbWorkout.routine_id,
    routineName: dbWorkout.routine_name,
    planId: dbWorkout.plan_id,
    completionPct: dbWorkout.completion_pct,
    createdAt: dbWorkout.created_at,
  };
}

/**
 * Convert DatabaseFriendship to camelCase format
 */
export function mapDatabaseFriendship(dbFriendship: DatabaseFriendship): {
  id: string;
  userId: string;
  friendId: string;
  status: DatabaseFriendStatus;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: dbFriendship.id,
    userId: dbFriendship.user_id,
    friendId: dbFriendship.friend_id,
    status: dbFriendship.status,
    createdAt: dbFriendship.created_at,
    updatedAt: dbFriendship.updated_at,
  };
}

/**
 * Convert DatabasePost to camelCase format matching WorkoutPost type
 */
export function mapDatabasePost(dbPost: DatabasePost): {
  id: string;
  authorId: string;
  title: string | null;
  caption: string | null;
  privacy: DatabasePrivacyLevel;
  durationSec: number | null;
  completionPct: number | null;
  exerciseCount: number | null;
  setCount: number | null;
  workoutSnapshot: JsonWorkoutSnapshot | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
} {
  return {
    id: dbPost.id,
    authorId: dbPost.author_id,
    title: dbPost.title,
    caption: dbPost.caption,
    privacy: dbPost.privacy,
    durationSec: dbPost.duration_sec,
    completionPct: dbPost.completion_pct,
    exerciseCount: dbPost.exercise_count,
    setCount: dbPost.set_count,
    workoutSnapshot: dbPost.workout_snapshot,
    likeCount: dbPost.like_count,
    commentCount: dbPost.comment_count,
    createdAt: dbPost.created_at,
  };
}

/**
 * Convert DatabaseReaction to camelCase format
 */
export function mapDatabaseReaction(dbReaction: DatabaseReaction): {
  id: string;
  postId: string;
  userId: string;
  emote: DatabaseEmoteId;
  createdAt: string;
} {
  return {
    id: dbReaction.id,
    postId: dbReaction.post_id,
    userId: dbReaction.user_id,
    emote: dbReaction.emote,
    createdAt: dbReaction.created_at,
  };
}

/**
 * Convert DatabaseComment to camelCase format
 */
export function mapDatabaseComment(dbComment: DatabaseComment): {
  id: string;
  postId: string;
  userId: string;
  text: string;
  parentCommentId: string | null;
  createdAt: string;
} {
  return {
    id: dbComment.id,
    postId: dbComment.post_id,
    userId: dbComment.user_id,
    text: dbComment.text,
    parentCommentId: dbComment.parent_comment_id,
    createdAt: dbComment.created_at,
  };
}

/**
 * Convert DatabaseNotification to camelCase format
 */
export function mapDatabaseNotification(dbNotification: DatabaseNotification): {
  id: string;
  userId: string;
  type: DatabaseNotificationType;
  title: string;
  body: string;
  postId: string | null;
  commentId: string | null;
  readAt: string | null;
  createdAt: string;
} {
  return {
    id: dbNotification.id,
    userId: dbNotification.user_id,
    type: dbNotification.type,
    title: dbNotification.title,
    body: dbNotification.body,
    postId: dbNotification.post_id,
    commentId: dbNotification.comment_id,
    readAt: dbNotification.read_at,
    createdAt: dbNotification.created_at,
  };
}

// ============================================================================
// Tables Type (for Supabase client typing)
// ============================================================================

export type Database = {
  public: {
    Tables: {
      users: {
        Row: DatabaseUser;
        Insert: DatabaseUserInsert;
        Update: DatabaseUserUpdate;
      };
      routines: {
        Row: DatabaseRoutine;
        Insert: DatabaseRoutineInsert;
        Update: DatabaseRoutineUpdate;
      };
      workouts: {
        Row: DatabaseWorkout;
        Insert: DatabaseWorkoutInsert;
        Update: DatabaseWorkoutUpdate;
      };
      friendships: {
        Row: DatabaseFriendship;
        Insert: DatabaseFriendshipInsert;
        Update: DatabaseFriendshipUpdate;
      };
      posts: {
        Row: DatabasePost;
        Insert: DatabasePostInsert;
        Update: DatabasePostUpdate;
      };
      reactions: {
        Row: DatabaseReaction;
        Insert: DatabaseReactionInsert;
        Update: never; // Reactions are immutable except delete
      };
      comments: {
        Row: DatabaseComment;
        Insert: DatabaseCommentInsert;
        Update: DatabaseCommentUpdate;
      };
      notifications: {
        Row: DatabaseNotification;
        Insert: DatabaseNotificationInsert;
        Update: DatabaseNotificationUpdate;
      };
    };
  };
};

// Re-export for convenience
export type {
  JsonWorkoutSet as WorkoutSet,
  JsonRoutineExercise as RoutineExercise,
  JsonWorkoutSnapshot as WorkoutSnapshot,
  JsonTopLine as TopLine,
};
