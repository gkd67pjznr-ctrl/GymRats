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

    const volumeByExercise = new Map<string, Map<string, number>>();

    for (const workout of workouts) {
      const userId = workout.user_id;
      if (!userId) continue;

      for (const set of workout.sets) {
        const exerciseId = set.exerciseId;
        if (!exerciseId) continue;

        if (!volumeByExercise.has(exerciseId)) {
          volumeByExercise.set(exerciseId, new Map());
        }
        const exerciseVolumes = volumeByExercise.get(exerciseId)!;

        const currentVolume = exerciseVolumes.get(userId) || 0;
        const setVolume = (set.weightKg || 0) * (set.reps || 0);
        exerciseVolumes.set(userId, currentVolume + setVolume);
      }
    }

    const { data: users, error: usersError } = await supabase.from('users').select('id, display_name');
    if (usersError) throw usersError;
    const userMap = new Map(users.map(u => [u.id, u.display_name || 'Anonymous']));

    const result = new Map<string, any[]>();

    volumeByExercise.forEach((userVolumes, exerciseId) => {
      const rankings = Array.from(userVolumes.entries())
        .map(([userId, volume]) => ({
          userId,
          userName: userMap.get(userId) || 'Anonymous',
          value: volume,
          display: `${(volume / 1000).toFixed(1)}k kg`,
          exerciseId: exerciseId,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      if(rankings.length > 0) {
        result.set(exerciseId, rankings);
      }
    });

    return new Response(JSON.stringify(Object.fromEntries(result)), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(String(err?.message ?? err), {
      status: 500,
      headers: corsHeaders,
    });
  }
});