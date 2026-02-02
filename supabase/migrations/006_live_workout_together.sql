-- Migration: 006_live_workout_together.sql
-- Description: Add tables for Live Workout Together feature
-- Created: 2026-01-30
-- Dependencies: 001_initial_schema.sql

-- ============================================================================
-- TABLE: live_sessions
-- Main table for live workout sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('shared', 'guided')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended')),
  name TEXT,
  theme TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  current_exercise_id TEXT,
  planned_exercises JSONB DEFAULT '[]',
  -- Denormalized data for quick access
  participant_count INTEGER NOT NULL DEFAULT 0,
  total_sets_completed INTEGER NOT NULL DEFAULT 0
);

-- ============================================================================
-- TABLE: live_session_participants
-- Participants in live workout sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.live_session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'resting', 'working_out', 'finished')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_exercise_id TEXT,
  sets_completed INTEGER NOT NULL DEFAULT 0,
  -- For guided mode
  is_leader BOOLEAN NOT NULL DEFAULT false,
  ready_for_next BOOLEAN NOT NULL DEFAULT false,
  -- Denormalized stats
  total_volume_kg NUMERIC NOT NULL DEFAULT 0,
  pr_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(session_id, user_id)
);

-- ============================================================================
-- TABLE: live_session_events
-- Event log for live workout sessions (for history and late joiners)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.live_session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (
    type IN (
      'session_created', 'session_started', 'session_ended',
      'user_joined', 'user_left',
      'set_completed', 'exercise_changed',
      'reaction', 'status_update',
      'ready_status_changed', 'message'
    )
  ),
  event_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: live_session_sets
-- Individual sets logged during live sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.live_session_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  set_type TEXT NOT NULL CHECK (set_type IN ('warmup', 'working')),
  weight_kg NUMERIC NOT NULL,
  reps INTEGER NOT NULL,
  timestamp_ms BIGINT NOT NULL,
  e1rm_kg NUMERIC,
  is_pr BOOLEAN NOT NULL DEFAULT false,
  intensity_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: live_session_reactions
-- Reactions/emotes sent during live sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.live_session_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  emote TEXT NOT NULL CHECK (emote IN ('like', 'fire', 'skull', 'crown', 'bolt', 'clap')),
  target_set_id UUID REFERENCES public.live_session_sets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: live_session_messages
-- Chat messages sent during live sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.live_session_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: live_session_invitations
-- Invitations to join live workout sessions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.live_session_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(session_id, recipient_id)
);

-- ============================================================================
-- TABLE: workout_presence
-- Real-time presence tracking for users working out
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workout_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_in_live_session BOOLEAN NOT NULL DEFAULT false,
  live_session_id UUID REFERENCES public.live_sessions(id) ON DELETE SET NULL,
  current_exercise_id TEXT,
  current_exercise_name TEXT,
  workout_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_set_completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'resting', 'working_out', 'finished')),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- TABLE: quick_reactions
-- Lightweight reactions for passive presence feature
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quick_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  emote TEXT NOT NULL CHECK (emote IN ('like', 'fire', 'skull', 'crown', 'bolt', 'clap')),
  set_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- Optimizations for common query patterns
-- ============================================================================

-- Live sessions by host
CREATE INDEX IF NOT EXISTS idx_live_sessions_host ON public.live_sessions(host_id);

-- Live sessions by status (for discovering active sessions)
CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON public.live_sessions(status);

-- Live sessions by creation time
CREATE INDEX IF NOT EXISTS idx_live_sessions_created ON public.live_sessions(created_at DESC);

-- Participants by user (find sessions a user is in)
CREATE INDEX IF NOT EXISTS idx_live_session_participants_user ON public.live_session_participants(user_id);

-- Participants by session
CREATE INDEX IF NOT EXISTS idx_live_session_participants_session ON public.live_session_participants(session_id);

-- Events by session (for fetching session history)
CREATE INDEX IF NOT EXISTS idx_live_session_events_session ON public.live_session_events(session_id, created_at DESC);

-- Sets by session and user
CREATE INDEX IF NOT EXISTS idx_live_session_sets_session_user ON public.live_session_sets(session_id, user_id, created_at DESC);

-- Sets by session (for session feed)
CREATE INDEX IF NOT EXISTS idx_live_session_sets_session ON public.live_session_sets(session_id, created_at DESC);

-- Reactions by session
CREATE INDEX IF NOT EXISTS idx_live_session_reactions_session ON public.live_session_reactions(session_id, created_at DESC);

-- Messages by session
CREATE INDEX IF NOT EXISTS idx_live_session_messages_session ON public.live_session_messages(session_id, created_at ASC);

-- Invitations by recipient
CREATE INDEX IF NOT EXISTS idx_live_session_invitations_recipient ON public.live_session_invitations(recipient_id, status);

-- Invitations by session
CREATE INDEX IF NOT EXISTS idx_live_session_invitations_session ON public.live_session_invitations(session_id);

-- Workout presence by user
CREATE INDEX IF NOT EXISTS idx_workout_presence_user ON public.workout_presence(user_id);

-- Workout presence by live session
CREATE INDEX IF NOT EXISTS idx_workout_presence_live_session ON public.workout_presence(live_session_id);

-- Quick reactions by recipient
CREATE INDEX IF NOT EXISTS idx_quick_reactions_to_user ON public.quick_reactions(to_user_id, created_at DESC);

-- Quick reactions by sender
CREATE INDEX IF NOT EXISTS idx_quick_reactions_from_user ON public.quick_reactions(from_user_id, created_at DESC);

-- ============================================================================
-- TRIGGERS
-- Automatically update denormalized fields and timestamps
-- ============================================================================

-- Function to update last_active_at on participant changes
CREATE OR REPLACE FUNCTION public.update_participant_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating last_active_at on participant updates
CREATE TRIGGER update_participant_last_active_trigger
  BEFORE UPDATE ON public.live_session_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_participant_last_active();

-- Function to update workout_presence last_updated_at
CREATE OR REPLACE FUNCTION public.update_workout_presence_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating workout_presence timestamp
CREATE TRIGGER update_workout_presence_timestamp_trigger
  BEFORE UPDATE ON public.workout_presence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workout_presence_timestamp();

-- Function to update participant_count when participant joins
CREATE OR REPLACE FUNCTION public.increment_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.live_sessions
  SET participant_count = participant_count + 1
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement participant_count when participant leaves
CREATE OR REPLACE FUNCTION public.decrement_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.live_sessions
  SET participant_count = GREATEST(participant_count - 1, 0)
  WHERE id = OLD.session_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for participant_count maintenance
CREATE TRIGGER increment_participant_count_on_insert
  AFTER INSERT ON public.live_session_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_participant_count();

CREATE TRIGGER decrement_participant_count_on_delete
  AFTER DELETE ON public.live_session_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_participant_count();

-- Function to update total_sets_completed when set is logged
CREATE OR REPLACE FUNCTION public.increment_sets_completed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.live_sessions
  SET total_sets_completed = total_sets_completed + 1
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sets_completed maintenance
CREATE TRIGGER increment_sets_completed_on_insert
  AFTER INSERT ON public.live_session_sets
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_sets_completed();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Security policies for live workout together feature
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_session_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_session_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_session_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_session_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_reactions ENABLE ROW LEVEL SECURITY;

-- Live sessions: Host can manage their sessions, participants can view
CREATE POLICY "Host can create live sessions"
  ON public.live_sessions FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update own sessions"
  ON public.live_sessions FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Host can delete own sessions"
  ON public.live_sessions FOR DELETE
  USING (auth.uid() = host_id);

CREATE POLICY "Anyone can view public active sessions for discovery"
  ON public.live_sessions FOR SELECT
  USING (status = 'active');

-- Host can view their own sessions (including inactive ones)
CREATE POLICY "Host can view own sessions"
  ON public.live_sessions FOR SELECT
  USING (auth.uid() = host_id);

-- Participants: Users can manage their own participation
CREATE POLICY "Users can join sessions"
  ON public.live_session_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON public.live_session_participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave sessions"
  ON public.live_session_participants FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Session participants can view each other"
  ON public.live_session_participants FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.live_sessions ls
      WHERE ls.id = live_session_participants.session_id
        AND ls.host_id = auth.uid()
    )
  );

-- Events: Participants can view session events
CREATE POLICY "Participants can view session events"
  ON public.live_session_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.live_session_participants p
      WHERE p.session_id = session_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can create events in their session"
  ON public.live_session_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.live_session_participants p
      WHERE p.session_id = session_id AND p.user_id = auth.uid()
    )
  );

-- Sets: Participants can view and create sets
CREATE POLICY "Participants can view session sets"
  ON public.live_session_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.live_session_participants p
      WHERE p.session_id = session_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can log their own sets"
  ON public.live_session_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.live_session_participants p
      WHERE p.session_id = session_id AND p.user_id = auth.uid()
    )
  );

-- Reactions: Participants can send and view reactions
CREATE POLICY "Participants can view session reactions"
  ON public.live_session_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.live_session_participants p
      WHERE p.session_id = session_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send reactions"
  ON public.live_session_reactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.live_session_participants p
      WHERE p.session_id = session_id AND p.user_id = auth.uid()
    )
  );

-- Messages: Participants can send and view messages
CREATE POLICY "Participants can view session messages"
  ON public.live_session_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.live_session_participants p
      WHERE p.session_id = session_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.live_session_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.live_session_participants p
      WHERE p.session_id = session_id AND p.user_id = auth.uid()
    )
  );

-- Invitations: Users can manage their own invitations
CREATE POLICY "Users can view their invitations"
  ON public.live_session_invitations FOR SELECT
  USING (auth.uid() = recipient_id OR auth.uid() = host_id);

CREATE POLICY "Host can create invitations"
  ON public.live_session_invitations FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Recipients can update their invitations"
  ON public.live_session_invitations FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Workout presence: Users can update their own presence
CREATE POLICY "Users can insert own workout presence"
  ON public.workout_presence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout presence"
  ON public.workout_presence FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Friends can view each other's workout presence"
  ON public.workout_presence FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE f.user_id = auth.uid() AND f.friend_id = user_id AND f.status = 'friends'
    ) OR
    EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE f.user_id = user_id AND f.friend_id = auth.uid() AND f.status = 'friends'
    )
  );

-- Quick reactions: Users can send and view reactions
CREATE POLICY "Users can send quick reactions"
  ON public.quick_reactions FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view reactions to themselves"
  ON public.quick_reactions FOR SELECT
  USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to create a new live session
CREATE OR REPLACE FUNCTION public.create_live_session(
  host_id_param UUID,
  mode_param TEXT,
  name_param TEXT,
  theme_param TEXT,
  planned_exercises_param JSONB
)
RETURNS public.live_sessions AS $$
DECLARE
  new_session public.live_sessions;
BEGIN
  INSERT INTO public.live_sessions (
    host_id, mode, name, theme, status, planned_exercises
  ) VALUES (
    host_id_param, mode_param, name_param, theme_param, 'pending', planned_exercises_param
  ) RETURNING * INTO new_session;

  RETURN new_session;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end a live session and archive data
CREATE OR REPLACE FUNCTION public.end_live_session(
  session_id_param UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.live_sessions
  SET status = 'ended', ended_at = NOW()
  WHERE id = session_id_param;

  -- Archive logic could be added here if needed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get session summary
CREATE OR REPLACE FUNCTION public.get_live_session_summary(
  session_id_param UUID
)
RETURNS JSONB AS $$
DECLARE
  session_data public.live_sessions;
  participant_count INTEGER;
  total_sets INTEGER;
  total_volume NUMERIC;
  duration_interval INTERVAL;
  duration_ms BIGINT;
BEGIN
  SELECT * INTO session_data FROM public.live_sessions WHERE id = session_id_param;

  SELECT COUNT(*) INTO participant_count FROM public.live_session_participants
  WHERE session_id = session_id_param;

  SELECT COUNT(*) INTO total_sets FROM public.live_session_sets
  WHERE session_id = session_id_param;

  SELECT SUM(weight_kg * reps) INTO total_volume FROM public.live_session_sets
  WHERE session_id = session_id_param;

  IF session_data.ended_at IS NOT NULL THEN
    duration_interval := session_data.ended_at - session_data.created_at;
    duration_ms := EXTRACT(EPOCH FROM duration_interval) * 1000;
  ELSE
    duration_ms := 0;
  END IF;

  RETURN jsonb_build_object(
    'session', to_jsonb(session_data),
    'participantCount', participant_count,
    'totalSets', total_sets,
    'totalVolumeKg', COALESCE(total_volume, 0),
    'durationMs', duration_ms
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get participant summary
CREATE OR REPLACE FUNCTION public.get_participant_summary(
  session_id_param UUID,
  user_id_param UUID
)
RETURNS JSONB AS $$
DECLARE
  participant_data public.live_session_participants;
  sets_completed INTEGER;
  total_volume NUMERIC;
  pr_count INTEGER;
  exercises_completed INTEGER;
BEGIN
  SELECT * INTO participant_data FROM public.live_session_participants
  WHERE session_id = session_id_param AND user_id = user_id_param;

  SELECT COUNT(*) INTO sets_completed FROM public.live_session_sets
  WHERE session_id = session_id_param AND user_id = user_id_param;

  SELECT SUM(weight_kg * reps) INTO total_volume FROM public.live_session_sets
  WHERE session_id = session_id_param AND user_id = user_id_param;

  SELECT COUNT(*) FILTER (WHERE is_pr = TRUE) INTO pr_count FROM public.live_session_sets
  WHERE session_id = session_id_param AND user_id = user_id_param;

  SELECT COUNT(DISTINCT exercise_id) INTO exercises_completed FROM public.live_session_sets
  WHERE session_id = session_id_param AND user_id = user_id_param;

  RETURN jsonb_build_object(
    'participant', to_jsonb(participant_data),
    'setsCompleted', sets_completed,
    'totalVolumeKg', COALESCE(total_volume, 0),
    'prCount', pr_count,
    'exercisesCompleted', exercises_completed
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
