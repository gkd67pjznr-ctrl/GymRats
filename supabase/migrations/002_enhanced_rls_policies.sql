-- Migration: 002_enhanced_rls_policies.sql
-- Description: Enhanced Row Level Security policies with friend-based social access
-- Created: 2026-01-25
-- Dependencies: 001_initial_schema.sql
--
-- Changes:
--   - Added friend visibility helper function
--   - Added DELETE policy for friendships
--   - Enhanced posts SELECT policy for friend-based access
--   - Enhanced reactions SELECT to respect post visibility
--   - Enhanced comments SELECT to respect post visibility
--   - Added DELETE policy for notifications

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: is_friend_or_public
-- Purpose: Determines if a viewing user can access content based on:
--           1. They are the content author
--           2. The content is public
--           3. The content is friends-only and they are friends with author
-- Returns: BOOLEAN (true if accessible, false otherwise)
CREATE OR REPLACE FUNCTION public.is_friend_or_public(
  viewing_user_id UUID,
  content_author_id UUID,
  privacy_level TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- User can always see their own content
  IF viewing_user_id = content_author_id THEN
    RETURN true;
  END IF;

  -- Public content is visible to everyone
  IF privacy_level = 'public' THEN
    RETURN true;
  END IF;

  -- Friends-only content: check if friendship exists
  IF privacy_level = 'friends' THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.friendships
      WHERE (
        -- Friend relationship in either direction
        (user_id = viewing_user_id AND friend_id = content_author_id)
        OR
        (user_id = content_author_id AND friend_id = viewing_user_id)
      )
      AND status = 'friends'
    );
  END IF;

  -- Default: not accessible
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION public.is_friend_or_public IS 'Determines if a viewing user can access content based on authorship, privacy level, and friendship status';

-- ============================================================================
-- DROP EXISTING POLICIES (for replacement)
-- ============================================================================

-- Friendships: No existing DELETE policy to drop, new policy will be added

-- Posts: Drop the public-only SELECT policy
DROP POLICY IF EXISTS "Anyone can view public posts" ON public.posts;

-- Reactions: Drop the open SELECT policy
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.reactions;

-- Comments: Drop the open SELECT policy
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;

-- Notifications: No existing DELETE policy to drop, new policy will be added

-- ============================================================================
-- ENHANCED RLS POLICIES
-- ============================================================================

-- ============================================================================
-- Table: friendships
-- ============================================================================

-- Policy: Users can delete friendships involving themselves
-- This allows either party to remove a friendship
CREATE POLICY "Users can delete friendships involving themselves"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ============================================================================
-- Table: posts
-- ============================================================================

-- Policy: Users can view accessible posts
-- Replaces: "Anyone can view public posts"
-- Enhancement: Now includes friend-based access for friends-only posts
CREATE POLICY "Users can view accessible posts"
  ON public.posts FOR SELECT
  USING (public.is_friend_or_public(auth.uid(), author_id, privacy));

-- Note: The existing INSERT, UPDATE, DELETE policies remain unchanged
-- - "Users can create own posts"
-- - "Users can update own posts"
-- - "Users can delete own posts"

-- ============================================================================
-- Table: reactions
-- ============================================================================

-- Policy: Users can view reactions on accessible posts
-- Replaces: "Anyone can view reactions"
-- Enhancement: Now respects post visibility (user can only see reactions on posts they can access)
CREATE POLICY "Users can view reactions on accessible posts"
  ON public.reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts
      WHERE posts.id = reactions.post_id
      AND public.is_friend_or_public(auth.uid(), posts.author_id, posts.privacy)
    )
  );

-- Note: The existing INSERT, DELETE policies remain unchanged
-- - "Users can create own reactions"
-- - "Users can delete own reactions"

-- ============================================================================
-- Table: comments
-- ============================================================================

-- Policy: Users can view comments on accessible posts
-- Replaces: "Anyone can view comments"
-- Enhancement: Now respects post visibility (user can only see comments on posts they can access)
CREATE POLICY "Users can view comments on accessible posts"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts
      WHERE posts.id = comments.post_id
      AND public.is_friend_or_public(auth.uid(), posts.author_id, posts.privacy)
    )
  );

-- Note: The existing INSERT, DELETE policies remain unchanged
-- - "Users can create own comments"
-- - "Users can delete own comments"

-- ============================================================================
-- Table: notifications
-- ============================================================================

-- Policy: Users can delete own notifications
-- Allows users to dismiss/remove notifications they received
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Note: The existing SELECT, UPDATE policies remain unchanged
-- - "Users can view own notifications"
-- - "Users can update own notifications"

-- ============================================================================
-- POLICY SUMMARY
-- ============================================================================
--
-- AFTER this migration, the RLS policies are:
--
-- users:
--   SELECT: own profile only
--   UPDATE: own profile only
--
-- routines:
--   SELECT: own routines only
--   INSERT: own routines only
--   UPDATE: own routines only
--   DELETE: own routines only
--
-- workouts:
--   SELECT: own workouts only
--   INSERT: own workouts only
--   UPDATE: own workouts only
--   DELETE: own workouts only
--
-- friendships:
--   SELECT: involving themselves (user_id OR friend_id)
--   INSERT: as user_id (requester)
--   UPDATE: involving themselves
--   DELETE: involving themselves (NEW in this migration)
--
-- posts:
--   SELECT: based on is_friend_or_public (ENHANCED in this migration)
--   INSERT: own posts only
--   UPDATE: own posts only
--   DELETE: own posts only
--
-- reactions:
--   SELECT: on accessible posts only (ENHANCED in this migration)
--   INSERT: own reactions only
--   DELETE: own reactions only
--
-- comments:
--   SELECT: on accessible posts only (ENHANCED in this migration)
--   INSERT: own comments only
--   DELETE: own comments only
--
-- notifications:
--   SELECT: own notifications only
--   UPDATE: own notifications only
--   DELETE: own notifications only (NEW in this migration)
--
-- ============================================================================
-- BEHAVIOR PRESERVATION NOTES
-- ============================================================================
--
-- All existing valid access patterns are preserved:
--
-- 1. Users can still see all public posts (privacy='public')
-- 2. Users can still see all their own content regardless of privacy
-- 3. Users can still create/delete their own reactions and comments
-- 4. Friend relationships remain bidirectionally accessible
--
-- New capabilities:
-- 1. Users can now see friends-only posts from their friends
-- 2. Reactions and comments now respect post privacy settings
-- 3. Users can delete friendships they're part of
-- 4. Users can delete their own notifications
--
-- Breaking changes: NONE
-- This migration is additive and enhances without removing existing valid access.
