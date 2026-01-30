-- Supabase database migration script
-- Add avatar and hangout room columns to users table

-- Add avatar columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_art_style TEXT,
ADD COLUMN IF NOT EXISTS avatar_growth_stage INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS avatar_height_scale REAL DEFAULT 0.3,
ADD COLUMN IF NOT EXISTS avatar_cosmetics JSONB DEFAULT '{"top": null, "bottom": null, "shoes": null, "accessory": null}'::jsonb,
ADD COLUMN IF NOT EXISTS total_volume_kg REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sets INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hangout_room_id TEXT,
ADD COLUMN IF NOT EXISTS hangout_room_role TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_avatar_growth_stage ON public.users (avatar_growth_stage);
CREATE INDEX IF NOT EXISTS idx_users_hangout_room_id ON public.users (hangout_room_id);

-- Create hangout_rooms table
CREATE TABLE IF NOT EXISTS public.hangout_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    theme TEXT DEFAULT 'default',
    members UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_decorations table
CREATE TABLE IF NOT EXISTS public.room_decorations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES hangout_rooms(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    position_x REAL NOT NULL,
    position_y REAL NOT NULL,
    contributed_by UUID REFERENCES auth.users(id),
    approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_presence table
CREATE TABLE IF NOT EXISTS public.user_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    room_id UUID REFERENCES hangout_rooms(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'online',
    activity TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_hangout_rooms_owner_id ON public.hangout_rooms (owner_id);
CREATE INDEX IF NOT EXISTS idx_room_decorations_room_id ON public.room_decorations (room_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_room_id ON public.user_presence (room_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON public.user_presence (user_id);

-- Enable Row Level Security
ALTER TABLE public.hangout_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_decorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hangout_rooms
CREATE POLICY "Users can view their own rooms and rooms they are members of"
    ON public.hangout_rooms FOR SELECT
    USING (
        owner_id = auth.uid() OR
        auth.uid() = ANY(members)
    );

CREATE POLICY "Users can create their own rooms"
    ON public.hangout_rooms FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Room owners can update their rooms"
    ON public.hangout_rooms FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Room owners can delete their rooms"
    ON public.hangout_rooms FOR DELETE
    USING (owner_id = auth.uid());

-- Create RLS policies for room_decorations
CREATE POLICY "Users can view decorations in rooms they have access to"
    ON public.room_decorations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM hangout_rooms
            WHERE hangout_rooms.id = room_decorations.room_id
            AND (hangout_rooms.owner_id = auth.uid() OR auth.uid() = ANY(hangout_rooms.members))
        )
    );

CREATE POLICY "Users can add decorations to rooms they have access to"
    ON public.room_decorations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hangout_rooms
            WHERE hangout_rooms.id = room_decorations.room_id
            AND (hangout_rooms.owner_id = auth.uid() OR auth.uid() = ANY(hangout_rooms.members))
        )
    );

CREATE POLICY "Users can update decorations they contributed"
    ON public.room_decorations FOR UPDATE
    USING (contributed_by = auth.uid());

CREATE POLICY "Users can delete decorations they contributed"
    ON public.room_decorations FOR DELETE
    USING (contributed_by = auth.uid());

-- Create RLS policies for user_presence
CREATE POLICY "Users can view presence in rooms they have access to"
    ON public.user_presence FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM hangout_rooms
            WHERE hangout_rooms.id = user_presence.room_id
            AND (hangout_rooms.owner_id = auth.uid() OR auth.uid() = ANY(hangout_rooms.members))
        )
    );

CREATE POLICY "Users can update their own presence"
    ON public.user_presence FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own presence"
    ON public.user_presence FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own presence"
    ON public.user_presence FOR DELETE
    USING (user_id = auth.uid());