-- ============================================================================
-- Migration: 014_push_notification_trigger.sql
-- Description: Add database trigger to automatically send push notifications
--              when a notification is inserted into the notifications table
-- Created: 2026-02-03
-- ============================================================================

-- Enable the pg_net extension for HTTP requests from Postgres
-- This is already enabled in Supabase by default
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================================
-- FUNCTION: send_push_notification_on_insert()
-- Trigger function that calls the send-push-notification edge function
-- when a new notification is inserted
-- ============================================================================
CREATE OR REPLACE FUNCTION public.send_push_notification_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_supabase_url TEXT;
  v_service_role_key TEXT;
  v_request_id BIGINT;
BEGIN
  -- Get Supabase URL and service role key from app settings
  -- These should be set via: SELECT set_config('app.settings.supabase_url', 'https://xxx.supabase.co', false);
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);

  -- If settings are not configured, try environment approach (vault secrets)
  IF v_supabase_url IS NULL THEN
    -- Fallback: Use the Supabase project URL pattern
    -- In production, this should be configured via vault or app settings
    SELECT decrypted_secret INTO v_supabase_url
    FROM vault.decrypted_secrets
    WHERE name = 'supabase_url'
    LIMIT 1;
  END IF;

  IF v_service_role_key IS NULL THEN
    SELECT decrypted_secret INTO v_service_role_key
    FROM vault.decrypted_secrets
    WHERE name = 'service_role_key'
    LIMIT 1;
  END IF;

  -- If we still don't have the URL, log and skip (don't fail the insert)
  IF v_supabase_url IS NULL THEN
    RAISE WARNING 'send_push_notification_on_insert: supabase_url not configured, skipping push notification';
    RETURN NEW;
  END IF;

  -- Make async HTTP request to the edge function
  -- Using pg_net for non-blocking HTTP calls
  SELECT net.http_post(
    url := v_supabase_url || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(v_service_role_key, '')
    ),
    body := jsonb_build_object(
      'userId', NEW.user_id,
      'payload', jsonb_build_object(
        'type', NEW.type,
        'title', NEW.title,
        'body', NEW.body,
        'data', COALESCE(NEW.data, '{}'::jsonb)
      )
    )
  ) INTO v_request_id;

  -- Log the request ID for debugging (optional)
  IF current_setting('log_min_messages', true) = 'debug1' THEN
    RAISE NOTICE 'Push notification request queued with ID: %', v_request_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the notification insert if push fails
    RAISE WARNING 'send_push_notification_on_insert failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- TRIGGER: trigger_send_push_notification
-- Fires after a notification is inserted to send push notification
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_send_push_notification ON public.notifications;
CREATE TRIGGER trigger_send_push_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_notification_on_insert();

-- ============================================================================
-- FUNCTION: create_notification_for_reaction()
-- Trigger function to create notification when someone reacts to a post
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_notification_for_reaction()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
  v_reactor_name TEXT;
  v_emote_label TEXT;
BEGIN
  -- Don't notify if reacting to own post
  SELECT author_id INTO v_post_author_id
  FROM public.posts
  WHERE id = NEW.post_id;

  IF v_post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get reactor's display name
  SELECT display_name INTO v_reactor_name
  FROM public.users
  WHERE id = NEW.user_id;

  -- Map emote to friendly label
  v_emote_label := CASE NEW.emote
    WHEN 'like' THEN 'liked'
    WHEN 'fire' THEN 'loved'
    WHEN 'skull' THEN 'found hilarious'
    WHEN 'crown' THEN 'crowned'
    WHEN 'bolt' THEN 'was energized by'
    WHEN 'clap' THEN 'applauded'
    ELSE 'reacted to'
  END;

  -- Create notification for post author
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    data,
    created_at
  ) VALUES (
    v_post_author_id,
    'reaction',
    'New Reaction',
    v_reactor_name || ' ' || v_emote_label || ' your post',
    jsonb_build_object(
      'type', 'reaction',
      'screen', 'post',
      'postId', NEW.post_id,
      'reactorId', NEW.user_id,
      'reactorName', v_reactor_name,
      'emote', NEW.emote
    ),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: trigger_create_notification_for_reaction
-- Automatically creates notification when someone reacts to a post
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_create_notification_for_reaction ON public.reactions;
CREATE TRIGGER trigger_create_notification_for_reaction
  AFTER INSERT ON public.reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notification_for_reaction();

-- ============================================================================
-- FUNCTION: create_notification_for_comment()
-- Trigger function to create notification when someone comments on a post
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_notification_for_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
  v_commenter_name TEXT;
  v_comment_preview TEXT;
BEGIN
  -- Don't notify if commenting on own post
  SELECT author_id INTO v_post_author_id
  FROM public.posts
  WHERE id = NEW.post_id;

  IF v_post_author_id = NEW.author_id THEN
    RETURN NEW;
  END IF;

  -- Get commenter's display name
  SELECT display_name INTO v_commenter_name
  FROM public.users
  WHERE id = NEW.author_id;

  -- Create comment preview (truncate to 50 chars)
  v_comment_preview :=
    CASE
      WHEN length(NEW.body) > 50 THEN substring(NEW.body from 1 for 50) || '...'
      ELSE NEW.body
    END;

  -- Create notification for post author
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    data,
    created_at
  ) VALUES (
    v_post_author_id,
    'comment',
    'New Comment',
    v_commenter_name || ' commented: ' || v_comment_preview,
    jsonb_build_object(
      'type', 'comment',
      'screen', 'post',
      'postId', NEW.post_id,
      'commentId', NEW.id,
      'commenterId', NEW.author_id,
      'commenterName', v_commenter_name
    ),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: trigger_create_notification_for_comment
-- Automatically creates notification when someone comments on a post
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_create_notification_for_comment ON public.comments;
CREATE TRIGGER trigger_create_notification_for_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notification_for_comment();

-- ============================================================================
-- COMMENT: Setup instructions
-- ============================================================================
-- To enable push notifications, you need to configure the Supabase URL and
-- service role key. This can be done via:
--
-- 1. Vault secrets (recommended for production):
--    INSERT INTO vault.secrets (name, secret)
--    VALUES ('supabase_url', 'https://your-project.supabase.co');
--    INSERT INTO vault.secrets (name, secret)
--    VALUES ('service_role_key', 'your-service-role-key');
--
-- 2. App settings (for testing):
--    SELECT set_config('app.settings.supabase_url', 'https://your-project.supabase.co', false);
--    SELECT set_config('app.settings.service_role_key', 'your-service-role-key', false);
--
-- Note: The pg_net extension makes async HTTP requests, so the trigger
-- won't block the original INSERT operation.
