-- Migration: Reports table
-- Creates table for content moderation reports

-- ============================================================================
-- TABLE: reports
-- Stores user reports for posts and users
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'misinformation', 'other')),
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- At least one target must be specified
  CONSTRAINT reports_target_check CHECK (target_post_id IS NOT NULL OR target_user_id IS NOT NULL)
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_reports_reporter_user_id ON public.reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_target_post_id ON public.reports(target_post_id) WHERE target_post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_target_user_id ON public.reports(target_user_id) WHERE target_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- ============================================================================
-- Updated At Trigger
-- ============================================================================
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reports_updated_at_trigger ON public.reports;
CREATE TRIGGER reports_updated_at_trigger
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_user_id);

-- Users can read their own reports
DROP POLICY IF EXISTS "Users can read own reports" ON public.reports;
CREATE POLICY "Users can read own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_user_id);

-- Note: Admin access for moderation would be handled via a separate admin role
-- For now, only the reporter can see their own reports

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE public.reports IS 'Content moderation reports for posts and users';
COMMENT ON COLUMN public.reports.reporter_user_id IS 'User who submitted the report';
COMMENT ON COLUMN public.reports.target_post_id IS 'Post being reported (optional)';
COMMENT ON COLUMN public.reports.target_user_id IS 'User being reported (optional)';
COMMENT ON COLUMN public.reports.reason IS 'Category of the report';
COMMENT ON COLUMN public.reports.additional_info IS 'Additional context provided by reporter';
COMMENT ON COLUMN public.reports.status IS 'Current moderation status';
