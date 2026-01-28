-- Migration 004: Add gamification columns to users table
-- Adds XP, leveling, streak, and currency tracking

-- =====================================================
-- XP & Leveling
-- =====================================================
ALTER TABLE public.users
  ADD COLUMN total_xp BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN current_level INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN xp_to_next_level BIGINT NOT NULL DEFAULT 100,
  ADD COLUMN level_up_celebration_shown TIMESTAMPTZ;

-- =====================================================
-- Streak data
-- =====================================================
ALTER TABLE public.users
  ADD COLUMN current_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN longest_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN last_workout_date DATE,
  ADD COLUMN workout_calendar JSONB NOT NULL DEFAULT '[]';

-- =====================================================
-- Currency (Forge Tokens)
-- =====================================================
ALTER TABLE public.users
  ADD COLUMN forge_tokens BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN tokens_earned_total BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN tokens_spent_total BIGINT NOT NULL DEFAULT 0;

-- =====================================================
-- Milestones
-- =====================================================
ALTER TABLE public.users
  ADD COLUMN milestones_completed TEXT[] NOT NULL DEFAULT '{}';

-- =====================================================
-- Indexes for leaderboards and queries
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_total_xp ON public.users(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_current_streak ON public.users(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_users_forge_tokens ON public.users(forge_tokens DESC);
CREATE INDEX IF NOT EXISTS idx_users_current_level ON public.users(current_level DESC);

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON COLUMN public.users.total_xp IS 'Total XP earned across all workouts';
COMMENT ON COLUMN public.users.current_level IS 'Current user level (1-indexed)';
COMMENT ON COLUMN public.users.xp_to_next_level IS 'XP required to reach next level';
COMMENT ON COLUMN public.users.level_up_celebration_shown IS 'Timestamp of last level-up celebration shown';
COMMENT ON COLUMN public.users.current_streak IS 'Current consecutive workout streak (days)';
COMMENT ON COLUMN public.users.longest_streak IS 'Longest streak ever achieved';
COMMENT ON COLUMN public.users.last_workout_date IS 'ISO date of last workout (YYYY-MM-DD)';
COMMENT ON COLUMN public.users.workout_calendar IS 'Last 365 days of workout activity for contribution calendar';
COMMENT ON COLUMN public.users.forge_tokens IS 'Current Forge Token balance';
COMMENT ON COLUMN public.users.tokens_earned_total IS 'Lifetime tokens earned';
COMMENT ON COLUMN public.users.tokens_spent_total IS 'Lifetime tokens spent';
COMMENT ON COLUMN public.users.milestones_completed IS 'Array of completed milestone IDs';
