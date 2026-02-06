-- Migration: Create Exercise Notes Table
-- Created: 2026-02-05
-- Purpose: Store per-exercise user notes (form cues, equipment preferences, etc.)
--
-- IMPORTANT: This migration prepares the schema for future Supabase sync.
-- Currently, exercise notes are stored locally in AsyncStorage.
-- When ready to enable sync, run this migration and implement the sync service.

-- ============================================
-- EXERCISE NOTES TABLE
-- ============================================
-- Stores persistent notes attached to specific exercises for each user.
-- Notes are tied to exerciseId (not workout session) and persist across workouts.
--
-- Use cases:
-- - Machine weight calibration ("This brand runs heavy")
-- - Form cues ("Keep elbows tucked on descent")
-- - Equipment preferences ("Use second bench from wall")
-- - Personal modifications ("Skip last set due to shoulder")

CREATE TABLE IF NOT EXISTS exercise_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,              -- e.g., "bench", "squat", "deadlift"
  note TEXT NOT NULL,                     -- The note content (max 200 chars enforced in app)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one note per exercise per user
  CONSTRAINT unique_user_exercise UNIQUE (user_id, exercise_id),

  -- Enforce max note length at DB level as safety net
  CONSTRAINT note_max_length CHECK (char_length(note) <= 200)
);

-- Add comment for documentation
COMMENT ON TABLE exercise_notes IS 'Per-exercise user notes for form cues, equipment preferences, etc.';
COMMENT ON COLUMN exercise_notes.exercise_id IS 'Exercise identifier (e.g., "bench", "squat") from app exercise database';
COMMENT ON COLUMN exercise_notes.note IS 'User note content, max 200 characters';

-- ============================================
-- INDEXES
-- ============================================

-- Fast lookup: get all notes for a user
CREATE INDEX IF NOT EXISTS idx_exercise_notes_user_id
  ON exercise_notes(user_id);

-- Fast lookup: get note for specific user + exercise
CREATE INDEX IF NOT EXISTS idx_exercise_notes_user_exercise
  ON exercise_notes(user_id, exercise_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
-- Note: update_updated_at_column() function may already exist from other migrations
-- Using CREATE OR REPLACE to be safe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_exercise_notes_updated_at
  BEFORE UPDATE ON exercise_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE exercise_notes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notes
CREATE POLICY "Users can view own exercise notes"
  ON exercise_notes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own notes
CREATE POLICY "Users can insert own exercise notes"
  ON exercise_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update own exercise notes"
  ON exercise_notes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete own exercise notes"
  ON exercise_notes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get all notes for a user (for initial sync/hydration)
CREATE OR REPLACE FUNCTION get_user_exercise_notes(p_user_id UUID)
RETURNS TABLE(
  exercise_id TEXT,
  note TEXT,
  updated_at TIMESTAMPTZ
) AS $$
  SELECT exercise_id, note, updated_at
  FROM exercise_notes
  WHERE user_id = p_user_id
  ORDER BY updated_at DESC;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Upsert a note (insert or update)
-- Returns the upserted note
CREATE OR REPLACE FUNCTION upsert_exercise_note(
  p_user_id UUID,
  p_exercise_id TEXT,
  p_note TEXT
) RETURNS exercise_notes AS $$
DECLARE
  result exercise_notes;
BEGIN
  -- Validate note length
  IF char_length(p_note) > 200 THEN
    RAISE EXCEPTION 'Note exceeds maximum length of 200 characters';
  END IF;

  -- Handle empty notes by deleting
  IF p_note IS NULL OR trim(p_note) = '' THEN
    DELETE FROM exercise_notes
    WHERE user_id = p_user_id AND exercise_id = p_exercise_id;
    RETURN NULL;
  END IF;

  -- Upsert the note
  INSERT INTO exercise_notes (user_id, exercise_id, note)
  VALUES (p_user_id, p_exercise_id, trim(p_note))
  ON CONFLICT (user_id, exercise_id)
  DO UPDATE SET
    note = trim(EXCLUDED.note),
    updated_at = NOW()
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bulk sync notes from client
-- Accepts an array of {exercise_id, note, updated_at} objects
-- Uses updated_at for conflict resolution (last-write-wins)
CREATE OR REPLACE FUNCTION sync_exercise_notes(
  p_user_id UUID,
  p_notes JSONB
) RETURNS SETOF exercise_notes AS $$
DECLARE
  note_record JSONB;
  result exercise_notes;
BEGIN
  FOR note_record IN SELECT * FROM jsonb_array_elements(p_notes)
  LOOP
    -- Extract values
    DECLARE
      v_exercise_id TEXT := note_record->>'exercise_id';
      v_note TEXT := note_record->>'note';
      v_client_updated_at TIMESTAMPTZ := (note_record->>'updated_at')::TIMESTAMPTZ;
      v_server_updated_at TIMESTAMPTZ;
    BEGIN
      -- Get server's updated_at for this note
      SELECT updated_at INTO v_server_updated_at
      FROM exercise_notes
      WHERE user_id = p_user_id AND exercise_id = v_exercise_id;

      -- Only update if client is newer or note doesn't exist
      IF v_server_updated_at IS NULL OR v_client_updated_at > v_server_updated_at THEN
        -- Handle empty/null notes by deleting
        IF v_note IS NULL OR trim(v_note) = '' THEN
          DELETE FROM exercise_notes
          WHERE user_id = p_user_id AND exercise_id = v_exercise_id;
        ELSE
          -- Upsert the note
          INSERT INTO exercise_notes (user_id, exercise_id, note, updated_at)
          VALUES (p_user_id, v_exercise_id, trim(v_note), COALESCE(v_client_updated_at, NOW()))
          ON CONFLICT (user_id, exercise_id)
          DO UPDATE SET
            note = trim(EXCLUDED.note),
            updated_at = COALESCE(v_client_updated_at, NOW())
          RETURNING * INTO result;

          RETURN NEXT result;
        END IF;
      END IF;
    END;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_exercise_notes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_exercise_note(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_exercise_notes(UUID, JSONB) TO authenticated;
