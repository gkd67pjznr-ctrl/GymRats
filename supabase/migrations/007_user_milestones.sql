-- Migration 007: User Milestones
-- Creates dedicated table for tracking earned milestones with timestamps

-- ============================================================================
-- TABLE: user_milestones
-- Tracks earned milestones with timestamps for each user
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL,
  earned_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON public.user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_milestone_id ON public.user_milestones(milestone_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_earned_at ON public.user_milestones(earned_at DESC);

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;

-- Users can read their own milestones
CREATE POLICY IF NOT EXISTS "Users can read own milestones"
  ON public.user_milestones FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own milestones
CREATE POLICY IF NOT EXISTS "Users can insert own milestones"
  ON public.user_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own milestones (for timestamp corrections)
CREATE POLICY IF NOT EXISTS "Users can update own milestones"
  ON public.user_milestones FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own milestones
CREATE POLICY IF NOT EXISTS "Users can delete own milestones"
  ON public.user_milestones FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE public.user_milestones IS 'Tracks earned Forge Milestones with timestamps';
COMMENT ON COLUMN public.user_milestones.milestone_id IS 'ID of the milestone definition (from milestone definitions)';
COMMENT ON COLUMN public.user_milestones.earned_at IS 'Timestamp when milestone was earned (milliseconds since epoch)';
