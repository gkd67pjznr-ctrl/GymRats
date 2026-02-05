-- Migration: Create Buddy Cues Tables
-- Created: 2026-02-05
-- Purpose: Store AI Buddy personality cues for dynamic loading

-- ============================================
-- BUDDY PERSONALITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS buddy_personalities (
  id TEXT PRIMARY KEY,                    -- e.g., 'gym_bro', 'anime', 'stoic'
  name TEXT NOT NULL,                     -- Display name: "Gym Bro"
  description TEXT,                       -- Short description for UI
  archetype TEXT,                         -- Personality archetype description
  tier TEXT NOT NULL DEFAULT 'free'       -- 'free', 'premium', 'legendary'
    CHECK (tier IN ('free', 'premium', 'legendary')),
  price_cents INTEGER DEFAULT 0,          -- Price in cents (199 = $1.99)
  iap_product_id TEXT,                    -- RevenueCat/App Store product ID
  theme_id TEXT,                          -- Optional theme override for legendary
  preview_lines TEXT[],                   -- Array of preview lines for unlock screen
  is_active BOOLEAN DEFAULT true,         -- Soft delete / feature flag
  sort_order INTEGER DEFAULT 0,           -- Display order in selection UI
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUDDY CUES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS buddy_cues (
  id SERIAL PRIMARY KEY,
  personality_id TEXT NOT NULL
    REFERENCES buddy_personalities(id) ON DELETE CASCADE,
  category TEXT NOT NULL                  -- SHORT, HYPE, CULTURE, START, END, REST, NUDGE, FAILURE, COMEBACK, MILESTONE
    CHECK (category IN ('SHORT', 'HYPE', 'CULTURE', 'START', 'END', 'REST', 'NUDGE', 'FAILURE', 'COMEBACK', 'MILESTONE')),
  text TEXT NOT NULL,                     -- The cue text
  voice_url TEXT,                         -- URL to voice line audio file (Supabase Storage)
  voice_duration_ms INTEGER,              -- Duration of voice clip in ms
  is_active BOOLEAN DEFAULT true,         -- Soft delete / A-B testing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER BUDDY STATE TABLE
-- ============================================
-- Tracks which buddies a user has unlocked and their current selection
CREATE TABLE IF NOT EXISTS user_buddy_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_buddy_id TEXT REFERENCES buddy_personalities(id),
  unlocked_buddies TEXT[] DEFAULT ARRAY['default']::TEXT[],  -- Array of unlocked personality IDs
  voice_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
-- Fast lookup: get all cues for a personality + category
CREATE INDEX IF NOT EXISTS idx_buddy_cues_personality_category
  ON buddy_cues(personality_id, category)
  WHERE is_active = true;

-- Fast lookup: get all active cues for a personality
CREATE INDEX IF NOT EXISTS idx_buddy_cues_personality
  ON buddy_cues(personality_id)
  WHERE is_active = true;

-- Fast lookup: active personalities by tier
CREATE INDEX IF NOT EXISTS idx_buddy_personalities_tier
  ON buddy_personalities(tier)
  WHERE is_active = true;

-- ============================================
-- TRIGGERS
-- ============================================
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_buddy_personalities_updated_at
  BEFORE UPDATE ON buddy_personalities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buddy_cues_updated_at
  BEFORE UPDATE ON buddy_cues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_buddy_state_updated_at
  BEFORE UPDATE ON user_buddy_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE buddy_personalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_buddy_state ENABLE ROW LEVEL SECURITY;

-- Personalities and cues are public read (everyone can see available buddies)
CREATE POLICY "Personalities are viewable by everyone"
  ON buddy_personalities FOR SELECT
  USING (is_active = true);

CREATE POLICY "Cues are viewable by everyone"
  ON buddy_cues FOR SELECT
  USING (is_active = true);

-- User buddy state is private to the user
CREATE POLICY "Users can view own buddy state"
  ON user_buddy_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own buddy state"
  ON user_buddy_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own buddy state"
  ON user_buddy_state FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA: PERSONALITIES
-- ============================================
INSERT INTO buddy_personalities (id, name, description, archetype, tier, price_cents, sort_order, preview_lines) VALUES
  ('default', 'Default', 'Balanced, supportive coach energy', 'Steady, encouraging mentor', 'free', 0, 1,
    ARRAY['Good set.', 'Keep pushing.', 'Solid work.']),
  ('gym_bro', 'Gym Bro', 'Classic bro energy with gains talk', 'Enthusiastic gym culture', 'free', 0, 2,
    ARRAY['Lets get it bro!', 'GAINS!', 'You''re a beast!']),
  ('fit_influencer', 'Fit Influencer', 'Wellness-focused empowerment', 'Glow-up and self-care', 'free', 0, 3,
    ARRAY['You''re glowing!', 'Self-care queen!', 'Wellness achieved!']),
  ('terminally_online', 'Terminally Online', 'Internet brain, meme culture', 'POV: main character energy', 'premium', 199, 4,
    ARRAY['POV: You chose gains.', 'That was goated.', 'W earned.']),
  ('counterculture', 'Counterculture', 'Dark, intense warrior energy', 'Embrace the darkness', 'premium', 199, 5,
    ARRAY['Face your demons.', 'War begins now.', 'You survived.']),
  ('powerlifting', 'Powerlifting', 'Competition and total focused', 'Meet day mindset', 'premium', 199, 6,
    ARRAY['Total time.', 'Good attempt.', 'Platform ready.']),
  ('bodybuilding', 'Bodybuilding', 'Pump and aesthetics focused', 'Sculpt the physique', 'premium', 199, 7,
    ARRAY['Pump achieved.', 'Growth triggered.', 'Sculpting time.']),
  ('bboy', 'B-Boy / Calisthenics', 'Street workout and movement', 'Flow and skill mastery', 'premium', 199, 8,
    ARRAY['Movement time.', 'Skill unlocked.', 'Flow state.']),
  ('anime', 'Anime / Weeb', 'Power level and training arc energy', 'Shonen protagonist vibes', 'premium', 199, 9,
    ARRAY['PLUS ULTRA!', 'Power level rising!', 'Training arc begins!']),
  ('old_school', 'Old School', 'Golden era bodybuilding wisdom', 'Iron era values', 'premium', 199, 10,
    ARRAY['Iron never lies.', 'Earn it.', 'Old school strong.']),
  ('military', 'Military / Tactical', 'Disciplined, mission focused', 'PT instructor energy', 'premium', 199, 11,
    ARRAY['Mission ready.', 'Execute.', 'Outstanding.']),
  ('stoic', 'Stoic', 'Philosophical, measured wisdom', 'Marcus Aurelius vibes', 'premium', 199, 12,
    ARRAY['Control what you can.', 'The obstacle is the way.', 'Present moment.'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  archetype = EXCLUDED.archetype,
  tier = EXCLUDED.tier,
  price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order,
  preview_lines = EXCLUDED.preview_lines,
  updated_at = NOW();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get random cue for a personality + category
CREATE OR REPLACE FUNCTION get_random_cue(
  p_personality_id TEXT,
  p_category TEXT
) RETURNS TEXT AS $$
  SELECT text
  FROM buddy_cues
  WHERE personality_id = p_personality_id
    AND category = p_category
    AND is_active = true
  ORDER BY RANDOM()
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Get multiple random cues (for batch loading)
CREATE OR REPLACE FUNCTION get_random_cues(
  p_personality_id TEXT,
  p_category TEXT,
  p_count INTEGER DEFAULT 5
) RETURNS TABLE(id INTEGER, text TEXT, voice_url TEXT) AS $$
  SELECT id, text, voice_url
  FROM buddy_cues
  WHERE personality_id = p_personality_id
    AND category = p_category
    AND is_active = true
  ORDER BY RANDOM()
  LIMIT p_count;
$$ LANGUAGE SQL STABLE;

-- Get all cues for a personality (for client-side caching)
CREATE OR REPLACE FUNCTION get_personality_cues(
  p_personality_id TEXT
) RETURNS TABLE(
  category TEXT,
  cues JSONB
) AS $$
  SELECT
    category,
    jsonb_agg(jsonb_build_object(
      'id', id,
      'text', text,
      'voice_url', voice_url
    )) as cues
  FROM buddy_cues
  WHERE personality_id = p_personality_id
    AND is_active = true
  GROUP BY category;
$$ LANGUAGE SQL STABLE;
