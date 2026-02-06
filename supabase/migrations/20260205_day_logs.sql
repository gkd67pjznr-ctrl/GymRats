-- Migration: Create day_logs table for pre-workout state tracking
-- Created: 2026-02-05
-- Purpose: Store physical/mental state logs linked to workout sessions
--          for correlation analysis and personalized insights

-- ============================================================================
-- Table: day_logs
-- ============================================================================
-- Stores pre-workout check-in data for each workout session
-- Links to workout_sessions via session_id for correlation queries

CREATE TABLE IF NOT EXISTS day_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Hydration (1-5 scale)
  hydration SMALLINT NOT NULL CHECK (hydration >= 1 AND hydration <= 5),

  -- Nutrition status
  nutrition VARCHAR(20) NOT NULL CHECK (nutrition IN ('none', 'light', 'moderate', 'full')),

  -- Carbs level
  carbs_level VARCHAR(20) NOT NULL CHECK (carbs_level IN ('low', 'moderate', 'high')),

  -- Physical state - pain tracking
  has_pain BOOLEAN NOT NULL DEFAULT FALSE,
  pain_locations TEXT[] DEFAULT '{}',

  -- Energy level (1-5 scale)
  energy_level SMALLINT NOT NULL CHECK (energy_level >= 1 AND energy_level <= 5),

  -- Sleep quality (1-5 scale)
  sleep_quality SMALLINT NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),

  -- Mood state
  mood VARCHAR(20) CHECK (mood IN ('stressed', 'neutral', 'focused', 'motivated')),

  -- Optional notes
  notes TEXT,

  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Index for looking up day log by session
CREATE INDEX IF NOT EXISTS idx_day_logs_session_id ON day_logs(session_id);

-- Index for user's day logs (for analytics queries)
CREATE INDEX IF NOT EXISTS idx_day_logs_user_id ON day_logs(user_id);

-- Index for time-range queries
CREATE INDEX IF NOT EXISTS idx_day_logs_created_at ON day_logs(created_at);

-- Composite index for correlation queries (user + time range)
CREATE INDEX IF NOT EXISTS idx_day_logs_user_created ON day_logs(user_id, created_at DESC);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE day_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own day logs
CREATE POLICY "Users can view own day logs"
  ON day_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own day logs
CREATE POLICY "Users can insert own day logs"
  ON day_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own day logs
CREATE POLICY "Users can update own day logs"
  ON day_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own day logs
CREATE POLICY "Users can delete own day logs"
  ON day_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Updated_at Trigger
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_day_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on update
CREATE TRIGGER trigger_day_logs_updated_at
  BEFORE UPDATE ON day_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_day_logs_updated_at();

-- ============================================================================
-- Correlation View (for analytics queries)
-- ============================================================================

-- View joining day_logs with workout session stats
-- Note: This assumes workout_sessions table exists
-- If not, this view creation will fail gracefully

DO $$
BEGIN
  CREATE OR REPLACE VIEW day_log_correlations AS
  SELECT
    dl.id AS log_id,
    dl.user_id,
    dl.session_id,
    dl.created_at,
    dl.hydration,
    dl.nutrition,
    dl.carbs_level,
    dl.has_pain,
    dl.pain_locations,
    dl.energy_level,
    dl.sleep_quality,
    dl.mood,
    ws.pr_count,
    ws.duration_seconds,
    ws.total_sets,
    ws.total_volume_kg
  FROM day_logs dl
  LEFT JOIN workout_sessions ws ON dl.session_id = ws.id
  WHERE dl.user_id = auth.uid();
EXCEPTION
  WHEN undefined_table THEN
    -- workout_sessions table doesn't exist yet, skip view creation
    RAISE NOTICE 'workout_sessions table not found, skipping correlation view';
END;
$$;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE day_logs IS 'Pre-workout physical/mental state logs for correlation analysis';
COMMENT ON COLUMN day_logs.session_id IS 'Links to the workout session this log is for';
COMMENT ON COLUMN day_logs.hydration IS '1-5 scale: 1=very dehydrated, 5=well hydrated';
COMMENT ON COLUMN day_logs.nutrition IS 'Food intake before workout: none (fasted), light, moderate, full';
COMMENT ON COLUMN day_logs.carbs_level IS 'Carbohydrate intake: low, moderate, high';
COMMENT ON COLUMN day_logs.has_pain IS 'Whether user is experiencing any pain/discomfort';
COMMENT ON COLUMN day_logs.pain_locations IS 'Array of body areas with pain: shoulders, elbows, wrists, knees, lower_back, upper_back, neck, hips';
COMMENT ON COLUMN day_logs.energy_level IS '1-5 scale: 1=exhausted, 5=energized';
COMMENT ON COLUMN day_logs.sleep_quality IS '1-5 scale: 1=terrible, 5=excellent';
COMMENT ON COLUMN day_logs.mood IS 'Mental state: stressed, neutral, focused, motivated';
