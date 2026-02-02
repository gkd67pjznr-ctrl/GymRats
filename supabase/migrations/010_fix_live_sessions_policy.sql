-- Migration: 010_fix_live_sessions_policy.sql
-- Description: Fix infinite recursion in live_session_participants policy
-- Created: 2026-02-02

-- Drop the problematic policy
DROP POLICY IF EXISTS "Session participants can view each other" ON public.live_session_participants;

-- Create fixed policy without recursion
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
