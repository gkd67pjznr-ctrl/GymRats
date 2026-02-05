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

/**
 * JsonLiveSessionExercise - stored in live_sessions.planned_exercises jsonb column
 * Matches LiveSession planned exercises structure
 */
export type JsonLiveSessionExercise = {
  exerciseId: string;
  targetSets: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
};

/**
 * JsonLiveSessionEventData - stored in live_session_events.event_data jsonb column
 * Generic event data structure that can contain different event types
 */
export type JsonLiveSessionEventData =
  | {
      type: 'session_created' | 'session_started' | 'session_ended';
      data?: Record<string, unknown>;
    }
  | {
      type: 'user_joined' | 'user_left';
      data: { displayName: string; avatarUrl?: string };
    }
  | {
      type: 'set_completed';
      data: {
        setId: string;
        exerciseId: string;
        exerciseName: string;
        setType: 'warmup' | 'working';
        weightKg: number;
        reps: number;
        e1rmKg?: number;
        isPR?: boolean;
        intensityScore?: number;
      };
    }
  | {
      type: 'exercise_changed';
      data: {
        exerciseId: string;
        exerciseName: string;
        targetSets?: number;
        targetRepsMin?: number;
        targetRepsMax?: number;
      };
    }
  | {
      type: 'reaction';
      data: {
        targetUserId: string;
        emote: string;
        targetSetId?: string;
      };
    }
  | {
      type: 'status_update';
      data: {
        status: 'idle' | 'resting' | 'working_out' | 'finished';
        currentExerciseId?: string;
      };
    }
  | {
      type: 'ready_status_changed';
      data: { isReady: boolean };
    }
  | {
      type: 'message';
      data: { message: string };
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
  subscription_tier: 'basic' | 'premium' | 'legendary';
  // Avatar columns
  avatar_art_style: string | null;
  avatar_growth_stage: number | null;
  avatar_height_scale: number | null;
  avatar_cosmetics: {
    top: string | null;
    bottom: string | null;
    shoes: string | null;
    accessory: string | null;
  } | null;
  // Growth metrics
  total_volume_kg: number | null;
  total_sets: number | null;
  // Hangout room columns
  hangout_room_id: string | null;
  hangout_room_role: "owner" | "member" | null;
  // Location columns for regional leaderboards
  location_country: string | null;
  location_region: string | null;
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
 * EmoteId enum for reactions, live_session_reactions and quick_reactions tables
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
 * ReportReason enum for reports table
 */
export type DatabaseReportReason =
  | "spam"
  | "harassment"
  | "inappropriate"
  | "misinformation"
  | "other";

/**
 * ReportStatus enum for reports table
 */
export type DatabaseReportStatus = "pending" | "reviewed" | "resolved";

/**
 * reports table - content moderation reports
 */
export type DatabaseReport = {
  id: string;
  reporter_user_id: string;
  target_post_id: string | null;
  target_user_id: string | null;
  reason: DatabaseReportReason;
  additional_info: string | null;
  status: DatabaseReportStatus;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
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

/**
 * LiveSessionMode enum for live_sessions table
 */
export type DatabaseLiveSessionMode = 'shared' | 'guided';

/**
 * LiveSessionStatus enum for live_sessions table
 */
export type DatabaseLiveSessionStatus = 'pending' | 'active' | 'ended';

/**
 * ParticipantStatus enum for live_session_participants table
 */
export type DatabaseParticipantStatus = 'idle' | 'resting' | 'working_out' | 'finished';

/**
 * LiveSessionEventType enum for live_session_events table
 */
export type DatabaseLiveSessionEventType =
  | 'session_created'
  | 'session_started'
  | 'session_ended'
  | 'user_joined'
  | 'user_left'
  | 'set_completed'
  | 'exercise_changed'
  | 'reaction'
  | 'status_update'
  | 'ready_status_changed'
  | 'message';

/**
 * SetType enum for live_session_sets table
 */
export type DatabaseSetType = 'warmup' | 'working';

/**
 * InvitationStatus enum for live_session_invitations table
 */
export type DatabaseInvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

/**
 * live_sessions table - live workout sessions
 */
export type DatabaseLiveSession = {
  id: string;
  host_id: string;
  mode: DatabaseLiveSessionMode;
  status: DatabaseLiveSessionStatus;
  name: string | null;
  theme: string | null;
  created_at: string; // ISO 8601 datetime
  started_at: string | null; // ISO 8601 datetime
  ended_at: string | null; // ISO 8601 datetime
  current_exercise_id: string | null;
  planned_exercises: JsonLiveSessionExercise[];
  participant_count: number;
  total_sets_completed: number;
};

/**
 * live_session_participants table - participants in live workout sessions
 */
export type DatabaseLiveSessionParticipant = {
  id: string;
  session_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  status: DatabaseParticipantStatus;
  joined_at: string; // ISO 8601 datetime
  last_active_at: string; // ISO 8601 datetime
  current_exercise_id: string | null;
  sets_completed: number;
  is_leader: boolean;
  ready_for_next: boolean;
  total_volume_kg: number;
  pr_count: number;
};

/**
 * live_session_events table - event log for live workout sessions
 */
export type DatabaseLiveSessionEvent = {
  id: string;
  session_id: string;
  user_id: string;
  type: DatabaseLiveSessionEventType;
  event_data: JsonLiveSessionEventData;
  created_at: string; // ISO 8601 datetime
};

/**
 * live_session_sets table - individual sets logged during live sessions
 */
export type DatabaseLiveSessionSet = {
  id: string;
  session_id: string;
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  set_type: DatabaseSetType;
  weight_kg: number;
  reps: number;
  timestamp_ms: number; // milliseconds since epoch
  e1rm_kg: number | null;
  is_pr: boolean;
  intensity_score: number | null;
  created_at: string; // ISO 8601 datetime
};

/**
 * live_session_reactions table - reactions/emotes sent during live sessions
 */
export type DatabaseLiveSessionReaction = {
  id: string;
  session_id: string;
  from_user_id: string;
  to_user_id: string;
  emote: DatabaseEmoteId;
  target_set_id: string | null;
  created_at: string; // ISO 8601 datetime
};

/**
 * live_session_messages table - chat messages sent during live sessions
 */
export type DatabaseLiveSessionMessage = {
  id: string;
  session_id: string;
  user_id: string;
  message: string;
  created_at: string; // ISO 8601 datetime
};

/**
 * live_session_invitations table - invitations to join live workout sessions
 */
export type DatabaseLiveSessionInvitation = {
  id: string;
  session_id: string;
  host_id: string;
  recipient_id: string;
  status: DatabaseInvitationStatus;
  created_at: string; // ISO 8601 datetime
  expires_at: string; // ISO 8601 datetime
};

/**
 * workout_presence table - real-time presence tracking for users working out
 */
export type DatabaseWorkoutPresence = {
  id: string;
  user_id: string;
  is_in_live_session: boolean;
  live_session_id: string | null;
  current_exercise_id: string | null;
  current_exercise_name: string | null;
  workout_started_at: string; // ISO 8601 datetime
  last_set_completed_at: string | null; // ISO 8601 datetime
  status: DatabaseParticipantStatus;
  last_updated_at: string; // ISO 8601 datetime
};

/**
 * quick_reactions table - lightweight reactions for passive presence feature
 */
export type DatabaseQuickReaction = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  emote: DatabaseEmoteId;
  set_id: string | null;
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
  subscription_tier?: 'basic' | 'premium' | 'legendary';
  // Avatar fields
  avatar_art_style?: string | null;
  avatar_growth_stage?: number | null;
  avatar_height_scale?: number | null;
  avatar_cosmetics?: {
    top: string | null;
    bottom: string | null;
    shoes: string | null;
    accessory: string | null;
  } | null;
  // Growth metrics
  total_volume_kg?: number | null;
  total_sets?: number | null;
  // Hangout room fields
  hangout_room_id?: string | null;
  hangout_room_role?: "owner" | "member" | null;
  // Location fields
  location_country?: string | null;
  location_region?: string | null;
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

export type DatabaseReportInsert = Pick<DatabaseReport, "reason" | "additional_info" | "target_post_id" | "target_user_id"> & { reporter_user_id: string };

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
    | "subscription_tier"
    // Avatar fields
    | "avatar_art_style"
    | "avatar_growth_stage"
    | "avatar_height_scale"
    | "avatar_cosmetics"
    // Growth metrics
    | "total_volume_kg"
    | "total_sets"
    // Hangout room fields
    | "hangout_room_id"
    | "hangout_room_role"
    // Location fields
    | "location_country"
    | "location_region"
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

export type DatabaseLiveSessionInsert = Pick<
  DatabaseLiveSession,
  | "mode"
  | "name"
  | "theme"
  | "planned_exercises"
> & { host_id: string };

export type DatabaseLiveSessionUpdate = Partial<
  Pick<
    DatabaseLiveSession,
    | "mode"
    | "name"
    | "theme"
    | "status"
    | "started_at"
    | "ended_at"
    | "current_exercise_id"
    | "planned_exercises"
    | "participant_count"
    | "total_sets_completed"
  >
>;

export type DatabaseLiveSessionParticipantInsert = Pick<
  DatabaseLiveSessionParticipant,
  | "session_id"
  | "user_id"
  | "display_name"
  | "avatar_url"
  | "status"
  | "current_exercise_id"
  | "is_leader"
  | "ready_for_next"
>;

export type DatabaseLiveSessionParticipantUpdate = Partial<
  Pick<
    DatabaseLiveSessionParticipant,
    | "display_name"
    | "avatar_url"
    | "status"
    | "current_exercise_id"
    | "sets_completed"
    | "is_leader"
    | "ready_for_next"
    | "total_volume_kg"
    | "pr_count"
  >
>;

export type DatabaseLiveSessionEventInsert = Pick<
  DatabaseLiveSessionEvent,
  | "session_id"
  | "user_id"
  | "type"
  | "event_data"
>;

export type DatabaseLiveSessionSetInsert = Pick<
  DatabaseLiveSessionSet,
  | "session_id"
  | "user_id"
  | "exercise_id"
  | "exercise_name"
  | "set_type"
  | "weight_kg"
  | "reps"
  | "timestamp_ms"
  | "e1rm_kg"
  | "is_pr"
  | "intensity_score"
>;

export type DatabaseLiveSessionReactionInsert = Pick<
  DatabaseLiveSessionReaction,
  | "session_id"
  | "from_user_id"
  | "to_user_id"
  | "emote"
  | "target_set_id"
>;

export type DatabaseLiveSessionMessageInsert = Pick<
  DatabaseLiveSessionMessage,
  | "session_id"
  | "user_id"
  | "message"
>;

export type DatabaseLiveSessionInvitationInsert = Pick<
  DatabaseLiveSessionInvitation,
  | "session_id"
  | "host_id"
  | "recipient_id"
  | "status"
  | "expires_at"
>;

export type DatabaseLiveSessionInvitationUpdate = Partial<
  Pick<DatabaseLiveSessionInvitation, "status">
>;

export type DatabaseWorkoutPresenceInsert = Pick<
  DatabaseWorkoutPresence,
  | "user_id"
  | "is_in_live_session"
  | "live_session_id"
  | "current_exercise_id"
  | "current_exercise_name"
  | "status"
>;

export type DatabaseWorkoutPresenceUpdate = Partial<
  Pick<
    DatabaseWorkoutPresence,
    | "is_in_live_session"
    | "live_session_id"
    | "current_exercise_id"
    | "current_exercise_name"
    | "workout_started_at"
    | "last_set_completed_at"
    | "status"
  >
>;

export type DatabaseQuickReactionInsert = Pick<
  DatabaseQuickReaction,
  | "from_user_id"
  | "to_user_id"
  | "emote"
  | "set_id"
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
  subscriptionTier: 'basic' | 'premium' | 'legendary';
  avatarArtStyle: string | null;
  avatarGrowthStage: number | null;
  avatarHeightScale: number | null;
  avatarCosmetics: {
    top: string | null;
    bottom: string | null;
    shoes: string | null;
    accessory: string | null;
  } | null;
  totalVolumeKg: number | null;
  totalSets: number | null;
  hangoutRoomId: string | null;
  hangoutRoomRole: 'owner' | 'member' | null;
  locationCountry: string | null;
  locationRegion: string | null;
} {
  return {
    id: dbUser.id,
    email: dbUser.email,
    displayName: dbUser.display_name,
    avatarUrl: dbUser.avatar_url,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    subscriptionTier: dbUser.subscription_tier ?? 'basic',
    avatarArtStyle: dbUser.avatar_art_style ?? null,
    avatarGrowthStage: dbUser.avatar_growth_stage ?? null,
    avatarHeightScale: dbUser.avatar_height_scale ?? null,
    avatarCosmetics: dbUser.avatar_cosmetics ?? null,
    totalVolumeKg: dbUser.total_volume_kg ?? null,
    totalSets: dbUser.total_sets ?? null,
    hangoutRoomId: dbUser.hangout_room_id ?? null,
    hangoutRoomRole: dbUser.hangout_room_role ?? null,
    locationCountry: dbUser.location_country ?? null,
    locationRegion: dbUser.location_region ?? null,
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
      live_sessions: {
        Row: DatabaseLiveSession;
        Insert: DatabaseLiveSessionInsert;
        Update: DatabaseLiveSessionUpdate;
      };
      live_session_participants: {
        Row: DatabaseLiveSessionParticipant;
        Insert: DatabaseLiveSessionParticipantInsert;
        Update: DatabaseLiveSessionParticipantUpdate;
      };
      live_session_events: {
        Row: DatabaseLiveSessionEvent;
        Insert: DatabaseLiveSessionEventInsert;
        Update: never; // Events are immutable
      };
      live_session_sets: {
        Row: DatabaseLiveSessionSet;
        Insert: DatabaseLiveSessionSetInsert;
        Update: never; // Sets are immutable
      };
      live_session_reactions: {
        Row: DatabaseLiveSessionReaction;
        Insert: DatabaseLiveSessionReactionInsert;
        Update: never; // Reactions are immutable
      };
      live_session_messages: {
        Row: DatabaseLiveSessionMessage;
        Insert: DatabaseLiveSessionMessageInsert;
        Update: never; // Messages are immutable
      };
      live_session_invitations: {
        Row: DatabaseLiveSessionInvitation;
        Insert: DatabaseLiveSessionInvitationInsert;
        Update: DatabaseLiveSessionInvitationUpdate;
      };
      workout_presence: {
        Row: DatabaseWorkoutPresence;
        Insert: DatabaseWorkoutPresenceInsert;
        Update: DatabaseWorkoutPresenceUpdate;
      };
      quick_reactions: {
        Row: DatabaseQuickReaction;
        Insert: DatabaseQuickReactionInsert;
        Update: never; // Quick reactions are immutable
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
