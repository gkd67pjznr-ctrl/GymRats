-- ============================================================================
-- Migration: 007_push_notification_infrastructure.sql
-- Description: Push notification infrastructure for Forgerank
-- Created: 2026-02-01
-- ============================================================================

-- ============================================================================
-- TABLE: user_push_tokens
-- Stores Expo push tokens for users' devices
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- ============================================================================
-- INDEXES for user_push_tokens
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON public.user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_token ON public.user_push_tokens(token);

-- ============================================================================
-- FUNCTION: update_user_push_tokens_updated_at()
-- Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_user_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_push_tokens_updated_at
  BEFORE UPDATE ON public.user_push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_push_tokens_updated_at();

-- ============================================================================
-- ALTER TABLE: notifications
-- Add data column for notification payload and expand notification types
-- ============================================================================
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS data JSONB;

-- We need to drop and recreate the check constraint to add new types
-- First drop the existing constraint
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Recreate with expanded notification types
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'reaction',
    'comment',
    'friend_request',
    'friend_accept',
    'message',
    'dm_received',
    'competition_result',
    'rest_timer'
  ));

-- ============================================================================
-- FUNCTION: create_notification_for_friend_request()
-- Trigger function to create notification when friend request is sent
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_notification_for_friend_request()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  -- Get sender's display name
  SELECT display_name INTO sender_name
  FROM public.users
  WHERE id = NEW.user_id;

  -- Create notification for receiver
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    data,
    created_at
  ) VALUES (
    NEW.friend_id,
    'friend_request',
    'New Friend Request',
    sender_name || ' wants to be your friend!',
    jsonb_build_object(
      'type', 'friend_request',
      'screen', 'friends',
      'senderId', NEW.user_id,
      'senderName', sender_name
    ),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: trigger_create_notification_for_friend_request
-- Automatically creates notification when friend request is sent
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_create_notification_for_friend_request ON public.friendships;
CREATE TRIGGER trigger_create_notification_for_friend_request
  AFTER INSERT ON public.friendships
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.create_notification_for_friend_request();

-- ============================================================================
-- FUNCTION: create_notification_for_direct_message()
-- Trigger function to create notification when direct message is sent
-- Note: DISABLED - chat_threads and chat_messages tables don't exist yet
-- This will be implemented when the chat system is added
-- ============================================================================
-- The function and trigger below are commented out until chat tables are created
/*
CREATE OR REPLACE FUNCTION public.create_notification_for_direct_message()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
  thread_other_user_id UUID;
  message_preview TEXT;
BEGIN
  -- Get sender's display name
  SELECT display_name INTO sender_name
  FROM public.users
  WHERE id = NEW.user_id;

  -- Get the other user in the thread (not the sender)
  SELECT
    CASE
      WHEN user1_id = NEW.user_id THEN user2_id
      ELSE user1_id
    END INTO thread_other_user_id
  FROM public.chat_threads
  WHERE id = NEW.thread_id;

  -- Create message preview (truncate to 50 chars)
  message_preview :=
    CASE
      WHEN length(NEW.message) > 50 THEN substring(NEW.message from 1 for 50) || '...'
      ELSE NEW.message
    END;

  -- Create notification for receiver (only if not blocked)
  IF thread_other_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      data,
      created_at
    ) VALUES (
      thread_other_user_id,
      'dm_received',
      'New Message from ' || sender_name,
      message_preview,
      jsonb_build_object(
        'type', 'dm_received',
        'screen', 'dm',
        'threadId', NEW.thread_id,
        'senderId', NEW.user_id,
        'senderName', sender_name
      ),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: trigger_create_notification_for_direct_message
-- Automatically creates notification when direct message is sent
-- ============================================================================
-- Note: This references chat_messages table
DROP TRIGGER IF EXISTS trigger_create_notification_for_direct_message ON public.chat_messages;
CREATE TRIGGER trigger_create_notification_for_direct_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notification_for_direct_message();
*/

-- ============================================================================
-- ROW LEVEL SECURITY for user_push_tokens
-- ============================================================================
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own push tokens
CREATE POLICY "Users can manage own push tokens"
  ON public.user_push_tokens
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTION: register_push_token(user_id, token, device_info)
-- Registers or updates a push token for a user
-- ============================================================================
CREATE OR REPLACE FUNCTION public.register_push_token(
  p_user_id UUID,
  p_token TEXT,
  p_device_info JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token_id UUID;
BEGIN
  -- Insert or update the token
  INSERT INTO public.user_push_tokens (user_id, token, device_info, updated_at)
  VALUES (p_user_id, p_token, p_device_info, NOW())
  ON CONFLICT (user_id, token)
  DO UPDATE SET
    device_info = COALESCE(p_device_info, user_push_tokens.device_info),
    updated_at = NOW()
  RETURNING id INTO v_token_id;

  RETURN v_token_id;
END;
$$;

-- ============================================================================
-- FUNCTION: get_user_push_tokens(user_id)
-- Returns all active push tokens for a user
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_push_tokens(p_user_id UUID)
RETURNS TABLE (
  token TEXT,
  device_info JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    upt.token,
    upt.device_info,
    upt.created_at,
    upt.updated_at
  FROM public.user_push_tokens upt
  WHERE upt.user_id = p_user_id
  ORDER BY upt.updated_at DESC;
END;
$$;

-- ============================================================================
-- FUNCTION: delete_push_token(user_id, token)
-- Deletes a specific push token for a user
-- ============================================================================
CREATE OR REPLACE FUNCTION public.delete_push_token(
  p_user_id UUID,
  p_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_push_tokens
  WHERE user_id = p_user_id AND token = p_token;

  RETURN FOUND;
END;
$$;