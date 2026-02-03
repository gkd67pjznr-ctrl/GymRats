import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Request body type for regional filtering
type RequestBody = {
  country?: string;
  region?: string;
};

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
    // Parse optional regional filter from POST body
    let regionFilter: RequestBody = {};
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.country) regionFilter.country = body.country;
        if (body.region) regionFilter.region = body.region;
      } catch {
        // No body or invalid JSON - continue without filter
      }
    }

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

    // Fetch users with location data for regional filtering
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, display_name, location_country, location_region');
    if (usersError) throw usersError;

    // Build user map with location data
    const userMap = new Map(users.map(u => [u.id, {
      displayName: u.display_name || 'Anonymous',
      country: u.location_country,
      region: u.location_region,
    }]));

    // Build set of eligible user IDs if regional filtering is active
    let eligibleUserIds: Set<string> | null = null;
    if (regionFilter.country) {
      eligibleUserIds = new Set();
      for (const user of users) {
        // Match by country (required)
        if (user.location_country?.toLowerCase() === regionFilter.country.toLowerCase()) {
          // If region filter is specified, also match by region
          if (regionFilter.region) {
            if (user.location_region?.toLowerCase() === regionFilter.region.toLowerCase()) {
              eligibleUserIds.add(user.id);
            }
          } else {
            // Country match only
            eligibleUserIds.add(user.id);
          }
        }
      }
    }

    let allRankings: any[] = [];
    userExerciseStats.forEach((userStats, userId) => {
      // Skip users not in eligible set (if regional filtering is active)
      if (eligibleUserIds && !eligibleUserIds.has(userId)) return;

      const userData = userMap.get(userId);
      userStats.forEach((stats, exerciseId) => {
        allRankings.push({
          userId,
          exerciseId,
          userName: userData?.displayName || 'Anonymous',
          value: stats.bestE1RM,
          display: `${stats.bestE1RM.toFixed(1)} kg`,
          // Include location data in response for transparency
          country: userData?.country || null,
          region: userData?.region || null,
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