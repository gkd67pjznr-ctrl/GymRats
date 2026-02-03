-- Migration 012: Add INSERT policy on users table and auto-create trigger
--
-- Problem: When users sign in via OAuth, no row exists in public.users.
-- The app tries to INSERT but RLS blocks it (only SELECT/UPDATE policies exist).
--
-- Solution:
-- 1. Add INSERT policy so users can create their own profile row
-- 2. Add trigger on auth.users to auto-create public.users row on signup

-- ============================================================================
-- 1. INSERT policy for users table
-- ============================================================================
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. Auto-create trigger (standard Supabase pattern)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
