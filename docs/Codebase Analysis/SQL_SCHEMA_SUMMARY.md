# Live Workout Together SQL Schema

**File Creation Timestamp:** 2026-01-30 05:30:00

## Overview

This document describes the SQL schema for the Live Workout Together feature, which enables real-time shared workout experiences between users.

## Tables Created

### 1. `live_sessions`
**Purpose**: Main table storing live workout session metadata

**Columns**:
- `id` (UUID, PK): Unique session identifier
- `host_id` (UUID, FK → users): User who created the session
- `mode` (TEXT): 'shared' or 'guided' - determines session behavior
- `status` (TEXT): 'pending', 'active', or 'ended'
- `name` (TEXT, nullable): Optional session name
- `theme` (TEXT, nullable): Visual theme for the session
- `created_at` (TIMESTAMPTZ): When session was created
- `started_at` (TIMESTAMPTZ, nullable): When session started
- `ended_at` (TIMESTAMPTZ, nullable): When session ended
- `current_exercise_id` (TEXT, nullable): Current exercise in guided mode
- `planned_exercises` (JSONB): Array of planned exercises for guided mode
- `participant_count` (INTEGER): Denormalized count of participants
- `total_sets_completed` (INTEGER): Denormalized count of completed sets

**Indexes**:
- `idx_live_sessions_host`: By host_id
- `idx_live_sessions_status`: By status
- `idx_live_sessions_created`: By created_at DESC

### 2. `live_session_participants`
**Purpose**: Tracks participants in each live session

**Columns**:
- `id` (UUID, PK): Unique participant record identifier
- `session_id` (UUID, FK → live_sessions): Session this participant is in
- `user_id` (UUID, FK → users): User participating
- `display_name` (TEXT): User's display name
- `avatar_url` (TEXT, nullable): User's avatar URL
- `status` (TEXT): 'idle', 'resting', 'working_out', or 'finished'
- `joined_at` (TIMESTAMPTZ): When participant joined
- `last_active_at` (TIMESTAMPTZ): Last activity timestamp
- `current_exercise_id` (TEXT, nullable): Current exercise participant is on
- `sets_completed` (INTEGER): Number of sets completed by this participant
- `is_leader` (BOOLEAN): Whether participant is the leader (guided mode)
- `ready_for_next` (BOOLEAN): Ready status for next exercise (guided mode)
- `total_volume_kg` (NUMERIC): Total volume (weight × reps) completed
- `pr_count` (INTEGER): Number of personal records achieved

**Indexes**:
- `idx_live_session_participants_user`: By user_id
- `idx_live_session_participants_session`: By session_id

**Constraints**:
- Unique(session_id, user_id): User can only join a session once

### 3. `live_session_events`
**Purpose**: Event log for all session activities (for history and late joiners)

**Columns**:
- `id` (UUID, PK): Unique event identifier
- `session_id` (UUID, FK → live_sessions): Session this event belongs to
- `user_id` (UUID, FK → users): User who triggered the event
- `type` (TEXT): Event type (see below)
- `event_data` (JSONB): Event-specific data payload
- `created_at` (TIMESTAMPTZ): When event occurred

**Event Types**:
- `session_created`, `session_started`, `session_ended`
- `user_joined`, `user_left`
- `set_completed`
- `exercise_changed`
- `reaction`
- `status_update`
- `ready_status_changed`
- `message`

**Indexes**:
- `idx_live_session_events_session`: By session_id and created_at DESC

### 4. `live_session_sets`
**Purpose**: Individual sets logged during live sessions

**Columns**:
- `id` (UUID, PK): Unique set identifier
- `session_id` (UUID, FK → live_sessions): Session this set belongs to
- `user_id` (UUID, FK → users): User who completed the set
- `exercise_id` (TEXT): Exercise identifier
- `exercise_name` (TEXT): Exercise name
- `set_type` (TEXT): 'warmup' or 'working'
- `weight_kg` (NUMERIC): Weight lifted in kilograms
- `reps` (INTEGER): Number of repetitions
- `timestamp_ms` (BIGINT): When the set was completed (milliseconds since epoch)
- `e1rm_kg` (NUMERIC, nullable): Estimated 1-rep max
- `is_pr` (BOOLEAN): Whether this is a personal record
- `intensity_score` (NUMERIC, nullable): GymRats score (0-1000)
- `created_at` (TIMESTAMPTZ): When record was created

**Indexes**:
- `idx_live_session_sets_session_user`: By session_id, user_id, created_at DESC
- `idx_live_session_sets_session`: By session_id, created_at DESC

### 5. `live_session_reactions`
**Purpose**: Reactions/emotes sent during live sessions

**Columns**:
- `id` (UUID, PK): Unique reaction identifier
- `session_id` (UUID, FK → live_sessions): Session this reaction belongs to
- `from_user_id` (UUID, FK → users): User who sent the reaction
- `to_user_id` (UUID, FK → users): User who received the reaction
- `emote` (TEXT): Emote type ('like', 'fire', 'skull', 'crown', 'bolt', 'clap')
- `target_set_id` (UUID, FK → live_session_sets, nullable): Optional specific set being reacted to
- `created_at` (TIMESTAMPTZ): When reaction was sent

**Indexes**:
- `idx_live_session_reactions_session`: By session_id and created_at DESC

### 6. `live_session_messages`
**Purpose**: Chat messages sent during live sessions

**Columns**:
- `id` (UUID, PK): Unique message identifier
- `session_id` (UUID, FK → live_sessions): Session this message belongs to
- `user_id` (UUID, FK → users): User who sent the message
- `message` (TEXT): Message content
- `created_at` (TIMESTAMPTZ): When message was sent

**Indexes**:
- `idx_live_session_messages_session`: By session_id and created_at ASC

### 7. `live_session_invitations`
**Purpose**: Invitations to join live workout sessions

**Columns**:
- `id` (UUID, PK): Unique invitation identifier
- `session_id` (UUID, FK → live_sessions): Session being invited to
- `host_id` (UUID, FK → users): User who sent the invitation
- `recipient_id` (UUID, FK → users): User being invited
- `status` (TEXT): 'pending', 'accepted', 'declined', or 'expired'
- `created_at` (TIMESTAMPTZ): When invitation was created
- `expires_at` (TIMESTAMPTZ): When invitation expires

**Indexes**:
- `idx_live_session_invitations_recipient`: By recipient_id and status
- `idx_live_session_invitations_session`: By session_id

**Constraints**:
- Unique(session_id, recipient_id): User can only be invited once per session

### 8. `workout_presence`
**Purpose**: Real-time presence tracking for users working out (passive presence feature)

**Columns**:
- `id` (UUID, PK): Unique presence record identifier
- `user_id` (UUID, FK → users): User whose presence is being tracked
- `is_in_live_session` (BOOLEAN): Whether user is in a live session
- `live_session_id` (UUID, FK → live_sessions, nullable): Live session user is in
- `current_exercise_id` (TEXT, nullable): Current exercise
- `current_exercise_name` (TEXT, nullable): Current exercise name
- `workout_started_at` (TIMESTAMPTZ): When workout started
- `last_set_completed_at` (TIMESTAMPTZ, nullable): When last set was completed
- `status` (TEXT): 'idle', 'resting', 'working_out', or 'finished'
- `last_updated_at` (TIMESTAMPTZ): Last update timestamp

**Indexes**:
- `idx_workout_presence_user`: By user_id
- `idx_workout_presence_live_session`: By live_session_id

**Constraints**:
- Unique(user_id): User can only have one presence record

### 9. `quick_reactions`
**Purpose**: Lightweight reactions for passive presence feature

**Columns**:
- `id` (UUID, PK): Unique reaction identifier
- `from_user_id` (UUID, FK → users): User who sent the reaction
- `to_user_id` (UUID, FK → users): User who received the reaction
- `emote` (TEXT): Emote type ('like', 'fire', 'skull', 'crown', 'bolt', 'clap')
- `set_id` (UUID, nullable): Optional specific set being reacted to
- `created_at` (TIMESTAMPTZ): When reaction was sent

**Indexes**:
- `idx_quick_reactions_to_user`: By to_user_id and created_at DESC
- `idx_quick_reactions_from_user`: By from_user_id and created_at DESC

## Triggers

### 1. Participant Count Maintenance
- `increment_participant_count_on_insert`: Increments participant_count when a user joins
- `decrement_participant_count_on_delete`: Decrements participant_count when a user leaves

### 2. Sets Completed Maintenance
- `increment_sets_completed_on_insert`: Increments total_sets_completed when a set is logged

### 3. Timestamp Updates
- `update_participant_last_active_trigger`: Updates last_active_at when participant record changes
- `update_workout_presence_timestamp_trigger`: Updates last_updated_at when presence record changes

## Row Level Security (RLS) Policies

### Live Sessions
- Host can create, update, and delete their own sessions
- Participants can view active sessions they're in
- Anyone can view public active sessions for discovery

### Participants
- Users can join/leave sessions
- Session participants can view each other's participation
- Users can only manage their own participation

### Events, Sets, Reactions, Messages
- Only session participants can view and create records
- Users can only create records for themselves

### Invitations
- Host can create invitations
- Recipients can view and update their own invitations

### Workout Presence
- Users can update their own presence
- Friends can view each other's workout presence

### Quick Reactions
- Users can send reactions
- Users can view reactions to/from themselves

## Helper Functions

### 1. `create_live_session`
Creates a new live session with the specified parameters

### 2. `end_live_session`
Ends a live session and updates its status

### 3. `get_live_session_summary`
Returns a comprehensive summary of a live session including:
- Session metadata
- Participant count
- Total sets completed
- Total volume (kg)
- Duration (ms)

### 4. `get_participant_summary`
Returns detailed statistics for a specific participant:
- Participant metadata
- Sets completed
- Total volume (kg)
- PR count
- Exercises completed

## JSONB Structures

### 1. `JsonLiveSessionExercise`
Structure for planned exercises in live_sessions.planned_exercises:
```typescript
{
  exerciseId: string;
  targetSets: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
}
```

### 2. `JsonLiveSessionEventData`
Discriminated union for event_data in live_session_events:
```typescript
|
  { type: 'session_created' | 'session_started' | 'session_ended'; data?: Record<string, unknown>; }
  | { type: 'user_joined' | 'user_left'; data: { displayName: string; avatarUrl?: string }; }
  | { type: 'set_completed'; data: { setId: string; exerciseId: string; exerciseName: string; setType: 'warmup' | 'working'; weightKg: number; reps: number; e1rmKg?: number; isPR?: boolean; intensityScore?: number; }; }
  | { type: 'exercise_changed'; data: { exerciseId: string; exerciseName: string; targetSets?: number; targetRepsMin?: number; targetRepsMax?: number; }; }
  | { type: 'reaction'; data: { targetUserId: string; emote: string; targetSetId?: string; }; }
  | { type: 'status_update'; data: { status: 'idle' | 'resting' | 'working_out' | 'finished'; currentExerciseId?: string; }; }
  | { type: 'ready_status_changed'; data: { isReady: boolean }; }
  | { type: 'message'; data: { message: string }; }
```

## Integration Points

### With Existing Tables

1. **users table**: All live workout tables reference users via foreign keys
2. **friendships table**: Used for RLS policies on workout_presence

### With Application Code

1. **TypeScript Types**: The `src/lib/liveWorkoutTogether/types.ts` file defines the application-level types that map to these database structures
2. **Zustand Store**: The live workout store will use these tables for real-time state management
3. **Supabase Client**: The service layer will interact with these tables via Supabase's PostgreSQL interface

## Data Flow

### Session Creation
1. User creates session via `create_live_session` function
2. Session record created in `live_sessions` table
3. Host automatically added to `live_session_participants`
4. Invitations sent via `live_session_invitations`

### Session Participation
1. User joins session (record added to `live_session_participants`)
2. Participant count incremented via trigger
3. User's presence updated in `workout_presence`
4. Events logged to `live_session_events`

### Set Logging
1. User completes a set
2. Record created in `live_session_sets`
3. Total sets completed incremented via trigger
4. Participant's sets_completed incremented
5. Event logged to `live_session_events`
6. Reactions can be added to `live_session_reactions`

### Session Completion
1. Host ends the session
2. Session status updated to 'ended'
3. Final event logged to `live_session_events`
4. Data remains available for history/replay

## Performance Considerations

### Denormalization
- `participant_count` and `total_sets_completed` in `live_sessions` are denormalized for quick access
- These are maintained automatically via triggers

### Indexing Strategy
- All foreign keys are indexed
- Common query patterns are optimized (session + time, user + session, etc.)
- Text search not needed as data is accessed via IDs

### JSONB Usage
- `planned_exercises` and `event_data` use JSONB for flexible schemas
- Allows for evolution without schema migrations
- Enables complex queries using PostgreSQL JSON operators

## Security Considerations

### Row-Level Security
- All tables have RLS enabled
- Policies ensure users can only access data they're authorized for
- Hosts have elevated privileges for their sessions

### Data Validation
- Enums (CHECK constraints) ensure valid values
- Foreign keys ensure referential integrity
- Triggers maintain data consistency

### Privacy
- Workout presence only visible to friends
- Session data only visible to participants
- Historical data remains accessible to participants

## Migration File

The schema is defined in: `/supabase/migrations/006_live_workout_together.sql`

This migration depends on: `001_initial_schema.sql`

## TypeScript Types

Corresponding TypeScript types are defined in: `/src/lib/supabase/types.ts`

Includes:
- Database row types (snake_case)
- Insert/update types
- JSONB structure types
- Database type mapping for Supabase client