import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, display_name, longest_streak, current_streak')
      .order('longest_streak', { ascending: false })
      .limit(100);

    if (error) throw error;

    const rankings = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      userName: user.display_name || 'Anonymous',
      value: user.longest_streak || 0,
      display: `${user.longest_streak || 0} days`,
      currentStreak: user.current_streak || 0,
    }));

    return new Response(JSON.stringify(rankings), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(String(err?.message ?? err), {
      status: 500,
      headers: corsHeaders,
    });
  }
});