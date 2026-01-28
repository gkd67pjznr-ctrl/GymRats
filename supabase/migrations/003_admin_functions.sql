-- Migration: 003_admin_functions.sql
-- Description: Admin functions for user management (account deletion)
-- Created: 2026-01-28
-- Dependencies: 001_initial_schema.sql, 002_enhanced_rls_policies.sql

-- ============================================================================
-- FUNCTION: admin_delete_user
-- Purpose: Delete a user from auth.users and cascade to all user data
-- Security: SECURITY DEFINER - runs with elevated privileges
-- Notes: This function allows authenticated users to delete their own account
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_delete_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is attempting to delete their own account
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'You can only delete your own account';
  END IF;

  -- Delete from auth.users (this will cascade to all tables via foreign keys)
  DELETE FROM auth.users WHERE id = user_id;

  -- Return success
  RETURN TRUE;
END;
$$;

-- Grant execute on function to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;

-- ============================================================================
-- SECURITY NOTES:
--
-- This function is marked SECURITY DEFINER which means it runs with the
-- privileges of the function owner (typically the postgres superuser).
--
-- The function includes a security check to ensure users can only delete
-- their own account by comparing auth.uid() with the user_id parameter.
--
-- When a user is deleted from auth.users, the ON DELETE CASCADE foreign
-- key constraints will automatically delete all related data:
-- - public.users (cascade)
-- - public.workouts (cascade via users)
-- - public.routines (cascade via users)
-- - public.friendships (both sides handled by triggers)
-- - public.posts (cascade via users)
-- - public.reactions (cascade via users)
-- - public.comments (cascade via users)
-- - public.notifications (cascade via users)
--
-- ============================================================================

-- Add comment for documentation
COMMENT ON FUNCTION public.admin_delete_user IS 'Delete a user account and all associated data. Users can only delete their own account.';
