-- Migration: 011_fix_live_sessions_policies.sql
-- Description: Fix infinite recursion in live_sessions policies
-- Created: 2026-02-02

-- Drop problematic policies
DROP POLICY IF EXISTS "Participants can view active sessions they're in" ON public.live_sessions;
DROP POLICY IF EXISTS "Host can create live sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Host can update own sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Host can delete own sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Anyone can view public active sessions for discovery" ON public.live_sessions;

-- Create new simplified policies without recursion

-- Anyone can view active sessions for discovery (simplified)
CREATE POLICY "Anyone can view active sessions for discovery"
  ON public.live_sessions FOR SELECT
  USING (status = 'active');

-- Hosts can manage their own sessions
CREATE POLICY "Host can manage own sessions"
  ON public.live_sessions FOR ALL
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- Ensure the policy exists on participants table too
DROP POLICY IF EXISTS "Session participants can view each other" ON public.live_session_participants;

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
