-- Migration: Add location columns to users table for regional leaderboards
-- Date: 2026-02-03

-- Add location columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS location_country TEXT,
ADD COLUMN IF NOT EXISTS location_region TEXT;

-- Create partial index for efficient regional queries
-- Only indexes rows where location_country is set
CREATE INDEX IF NOT EXISTS idx_users_location
ON public.users(location_country, location_region)
WHERE location_country IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.users.location_country IS 'User country for regional leaderboards (e.g., "United States", "Canada")';
COMMENT ON COLUMN public.users.location_region IS 'User region/state/province for regional leaderboards (e.g., "California", "Ontario")';
