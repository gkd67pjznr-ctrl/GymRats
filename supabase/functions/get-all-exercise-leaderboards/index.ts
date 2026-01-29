import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Supabase client from environment variables
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Use service role key for full access
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { data: workouts, error } = await supabase.from('workouts').select('user_id, sets');
    if (error) throw error;

    const userExerciseStats = new Map<string, Map<string, { bestE1RM: number }>>();

    for (const workout of workouts) {
      const userId = workout.user_id;
      if (!userId) continue;

      if (!userExerciseStats.has(userId)) {
        userExerciseStats.set(userId, new Map());
      }
      const userStats = userExerciseStats.get(userId)!;

      for (const set of workout.sets) {
        const exerciseId = set.exerciseId;
        if (!exerciseId) continue;

        if (!userStats.has(exerciseId)) {
          userStats.set(exerciseId, { bestE1RM: 0 });
        }
        const exerciseStats = userStats.get(exerciseId)!;

        const e1rm = set.weightKg * (1 + set.reps / 30);
        if (e1rm > exerciseStats.bestE1RM) {
          exerciseStats.bestE1RM = e1rm;
        }
      }
    }

    const { data: users, error: usersError } = await supabase.from('users').select('id, display_name');
    if (usersError) throw usersError;
    const userMap = new Map(users.map(u => [u.id, u.display_name || 'Anonymous']));

    let allRankings: any[] = [];
    userExerciseStats.forEach((userStats, userId) => {
      userStats.forEach((stats, exerciseId) => {
        allRankings.push({
          userId,
          exerciseId,
          userName: userMap.get(userId) || 'Anonymous',
          value: stats.bestE1RM,
          display: `${stats.bestE1RM.toFixed(1)} kg`,
        });
      });
    });

    // sort and rank
    allRankings = allRankings
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return new Response(JSON.stringify(allRankings), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(String(err?.message ?? err), {
      status: 500,
      headers: corsHeaders,
    });
  }
});