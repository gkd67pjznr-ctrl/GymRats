-- Add Forge DNA History Table
-- Stores historical snapshots of user's Forge DNA for comparison over time

CREATE TABLE IF NOT EXISTS public.forge_dna_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  dna_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forge_dna_history_user_id ON public.forge_dna_history(user_id);
CREATE INDEX IF NOT EXISTS idx_forge_dna_history_generated_at ON public.forge_dna_history(generated_at);
CREATE INDEX IF NOT EXISTS idx_forge_dna_history_user_generated ON public.forge_dna_history(user_id, generated_at);

-- Enable RLS
ALTER TABLE public.forge_dna_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own DNA history"
  ON public.forge_dna_history
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own DNA history"
  ON public.forge_dna_history
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own DNA history"
  ON public.forge_dna_history
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own DNA history"
  ON public.forge_dna_history
  FOR DELETE
  USING (user_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.forge_dna_history;

-- Grant permissions
GRANT ALL ON public.forge_dna_history TO authenticated;