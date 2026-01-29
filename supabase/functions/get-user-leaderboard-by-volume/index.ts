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
    const { data: workouts, error } = await supabase.from('workouts').select('user_id, sets');
    if (error) throw error;

    const userStats = new Map<string, { totalVolume: number, workoutCount: number, setCount: number }>();

    for (const workout of workouts) {
      const userId = workout.user_id;
      if (!userId) continue;

      if (!userStats.has(userId)) {
        userStats.set(userId, { totalVolume: 0, workoutCount: 0, setCount: 0 });
      }
      const stats = userStats.get(userId)!;
      stats.workoutCount += 1;

      for (const set of workout.sets) {
        stats.setCount += 1;
        stats.totalVolume += (set.weightKg || 0) * (set.reps || 0);
      }
    }

    const { data: users, error: usersError } = await supabase.from('users').select('id, display_name');
    if (usersError) throw usersError;
    const userMap = new Map(users.map(u => [u.id, u.display_name || 'Anonymous']));

    const rankings = Array.from(userStats.entries())
      .map(([userId, stats]) => ({
        userId,
        userName: userMap.get(userId) || 'Anonymous',
        value: stats.totalVolume,
        display: `${(stats.totalVolume / 1000).toFixed(1)}k kg`,
        workoutCount: stats.workoutCount,
        setCount: stats.setCount,
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

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