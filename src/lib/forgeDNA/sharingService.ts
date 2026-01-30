import { supabase } from "../supabase/client";
import type { ForgeDNA } from "./types";

/**
 * Service for sharing Forge DNA to the social feed
 */

export interface ShareDNAToFeedParams {
  userId: string;
  dna: ForgeDNA;
  caption?: string;
  privacy?: 'public' | 'friends';
}

/**
 * Share Forge DNA visualization to the social feed
 */
export async function shareDNAToFeed(params: ShareDNAToFeedParams): Promise<{ success: boolean; error?: string; postId?: string }> {
  try {
    const { userId, dna, caption = "Check out my Forge DNA! 🧬", privacy = 'public' } = params;

    // Create a workout snapshot for the DNA post
    const workoutSnapshot = {
      routineName: "Forge DNA Analysis",
      topLines: createTopLinesFromDNA(dna)
    };

    // Create the post in the database
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        title: "My Forge DNA",
        caption: caption,
        privacy: privacy,
        duration_sec: 0,
        completion_pct: 100,
        exercise_count: Object.keys(dna.muscleBalance).length,
        set_count: dna.totalDataPoints,
        workout_snapshot: workoutSnapshot,
        like_count: 0,
        comment_count: 0,
      })
      .select()
      .single();

    if (error) {
      if (__DEV__) {
        console.error('Error sharing DNA to feed:', error);
      }
      return { success: false, error: error.message };
    }

    return { success: true, postId: data.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    if (__DEV__) {
      console.error('Error sharing DNA to feed:', errorMessage);
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Create top lines for the workout snapshot from DNA data
 */
function createTopLinesFromDNA(dna: ForgeDNA): any[] {
  // Get top 3 muscle groups by volume
  const topMuscles = Object.entries(dna.muscleBalance)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([muscle, percentage]) => ({
      exerciseName: muscle,
      bestSet: {
        weightLabel: `${percentage}%`,
        reps: 0,
        e1rmLabel: undefined
      }
    }));

  // Get dominant training style
  const dominantStyle = Object.entries(dna.trainingStyle)
    .sort(([, a], [, b]) => b - a)[0];

  if (dominantStyle) {
    topMuscles.unshift({
      exerciseName: `Training Style: ${dominantStyle[0]}`,
      bestSet: {
        weightLabel: `${dominantStyle[1]}%`,
        reps: 0,
        e1rmLabel: undefined
      }
    });
  }

  return topMuscles;
}

/**
 * Generate a shareable image/blob of the DNA visualization
 * In a real implementation, this would use react-native-view-shot or similar
 */
export async function generateDNAImage(dna: ForgeDNA): Promise<{ data: string | null; error?: string }> {
  try {
    // In a real implementation, this would capture the DNA visualization as an image
    // For now, we'll return a placeholder data URL
    const placeholderImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`;

    return { data: placeholderImage };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    if (__DEV__) {
      console.error('Error generating DNA image:', errorMessage);
    }
    return { data: null, error: errorMessage };
  }
}

/**
 * Share DNA directly with friends (DM/notifications)
 */
export async function shareDNAToFriends(userId: string, dna: ForgeDNA, friendIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    // Create notifications for each friend
    const notifications = friendIds.map(friendId => ({
      user_id: friendId,
      type: 'message',
      title: 'Forge DNA Shared',
      body: 'A friend shared their Forge DNA with you!',
      post_id: null,
      comment_id: null,
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      if (__DEV__) {
        console.error('Error sharing DNA to friends:', error);
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    if (__DEV__) {
      console.error('Error sharing DNA to friends:', errorMessage);
    }
    return { success: false, error: errorMessage };
  }
}