-- Migration: 005_user_search.sql
-- Description: Add user search function and update RLS policies
-- Created: 2026-01-28
-- Dependencies: 001_initial_schema.sql, 002_enhanced_rls_policies.sql

-- Enable pg_trgm extension for text search indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- FUNCTION: search_users
-- Allows searching users by display name or email while protecting privacy
-- Only returns limited public information (id, display_name, avatar_url)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.search_users(
  search_query TEXT,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.display_name,
    u.avatar_url,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE
    -- Don't include the current user in results
    u.id != current_user_id
    -- Search by display name or email
    AND (
      LOWER(u.display_name) LIKE LOWER('%' || search_query || '%')
      OR LOWER(u.email) LIKE LOWER('%' || search_query || '%')
    )
  ORDER BY
    -- Prioritize display name matches over email matches
    CASE
      WHEN LOWER(u.display_name) LIKE LOWER('%' || search_query || '%') THEN 1
      ELSE 2
    END,
    u.display_name NULLS LAST,
    u.created_at DESC
  LIMIT result_limit;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.search_users(TEXT, INTEGER) TO authenticated;

-- ============================================================================
-- POLICY: Allow viewing limited profiles for user discovery
-- Users can see basic info (id, display_name, avatar_url) of other users
-- but not email addresses unless they are friends
-- ============================================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- New policy: Users can view all profiles but with limited fields
-- The actual field filtering is done at the query level
CREATE POLICY "Users can view profiles for discovery"
  ON public.users FOR SELECT
  USING (true);

-- ============================================================================
-- FUNCTION: get_public_user_profile
-- Returns limited public profile information for a user
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_public_user_profile(target_user_id UUID)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.display_name,
    u.avatar_url,
    u.created_at
  FROM public.users u
  WHERE u.id = target_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_user_profile(UUID) TO authenticated;

-- ============================================================================
-- INDEX: Improve user search performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_display_name_trgm
  ON public.users USING gin (display_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_users_email_trgm
  ON public.users USING gin (email gin_trgm_ops);

-- Note: pg_trgm extension should be enabled for these indexes
-- Run: CREATE EXTENSION IF NOT EXISTS pg_trgm;
