// src/lib/sharing/workoutCardGenerator.ts
// Generate shareable workout cards using react-native-view-shot

import { Share, Alert, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { getSettings } from '../stores/settingsStore';
import type { WorkoutSession } from '../workoutModel';
import type { Tier } from '../GrScoring';
import type { WorkoutMilestone } from '../workoutPostGenerator';
import { EXERCISES_V1 } from '@/src/data/exercises';

// Tier emojis for text sharing
const TIER_EMOJIS: Record<Tier, string> = {
  Iron: '',
  Bronze: '',
  Silver: '',
  Gold: '',
  Platinum: '',
  Diamond: '',
  Mythic: '',
};

// Milestone emojis
const MILESTONE_EMOJIS: Record<string, string> = {
  weight_pr: '🏋️',
  rep_pr: '💪',
  e1rm_pr: '⚡',
  streak: '🔥',
  volume: '💎',
  rank_up: '⭐',
};

/**
 * Format weight for sharing
 */
function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'lb') {
    return `${Math.round(kg * 2.20462)} lb`;
  }
  return `${Math.round(kg)} kg`;
}

/**
 * Format duration for sharing
 */
function formatDuration(startMs: number, endMs: number): string {
  const durationMin = Math.round((endMs - startMs) / 60000);
  if (durationMin < 60) return `${durationMin} minutes`;
  const hours = Math.floor(durationMin / 60);
  const mins = durationMin % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Get top exercises from a session
 */
function getTopExercises(session: WorkoutSession, limit = 3) {
  const exerciseMap = new Map<string, { weightKg: number; reps: number; e1rm: number }>();

  for (const set of session.sets) {
    const e1rm = set.weightKg * (1 + set.reps / 30);
    const current = exerciseMap.get(set.exerciseId);
    if (!current || e1rm > current.e1rm) {
      exerciseMap.set(set.exerciseId, {
        weightKg: set.weightKg,
        reps: set.reps,
        e1rm,
      });
    }
  }

  return Array.from(exerciseMap.entries())
    .sort((a, b) => b[1].e1rm - a[1].e1rm)
    .slice(0, limit)
    .map(([exerciseId, data]) => {
      const exercise = EXERCISES_V1.find((e) => e.id === exerciseId);
      return {
        name: exercise?.name ?? exerciseId,
        weightKg: data.weightKg,
        reps: data.reps,
      };
    });
}

export interface WorkoutCardData {
  session: WorkoutSession;
  userName?: string;
  bestTier?: Tier;
  milestones?: WorkoutMilestone[];
  totalVolume?: number;
}

/**
 * Generate shareable text for a workout
 * Used as fallback when image sharing isn't available
 */
export function generateWorkoutShareText(data: WorkoutCardData): string {
  const { session, milestones = [], bestTier = 'Iron' } = data;
  const settings = getSettings();

  const exerciseCount = new Set(session.sets.map((s) => s.exerciseId)).size;
  const setCount = session.sets.length;
  const duration = formatDuration(session.startedAtMs, session.endedAtMs);
  const volume = data.totalVolume ?? session.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
  const topExercises = getTopExercises(session, 3);

  const prMilestones = milestones.filter((m) =>
    ['weight_pr', 'rep_pr', 'e1rm_pr'].includes(m.type)
  );

  const lines: string[] = [];

  // Title
  const title = session.routineName || `${exerciseCount} Exercise Workout`;
  lines.push(`${TIER_EMOJIS[bestTier]} ${title}`);
  lines.push('');

  // Stats
  lines.push(`${exerciseCount} exercises • ${setCount} sets • ${duration}`);
  lines.push(`Volume: ${formatWeight(volume, settings.unitSystem)}`);
  lines.push('');

  // Top lifts
  if (topExercises.length > 0) {
    lines.push('Top Lifts:');
    for (const ex of topExercises) {
      lines.push(`  ${ex.name}: ${formatWeight(ex.weightKg, settings.unitSystem)} × ${ex.reps}`);
    }
    lines.push('');
  }

  // PRs
  if (prMilestones.length > 0) {
    const prIcons = prMilestones.map((m) => MILESTONE_EMOJIS[m.type]).join(' ');
    lines.push(`${prIcons} PRs achieved!`);
    lines.push('');
  }

  lines.push('#GymRats #FitnessGoals');

  return lines.join('\n');
}

/**
 * Share workout as text (works without additional dependencies)
 */
export async function shareWorkoutAsText(data: WorkoutCardData): Promise<void> {
  const shareText = generateWorkoutShareText(data);
  const title = data.session.routineName || 'My Workout';

  try {
    const result = await Share.share({
      message: shareText,
      title,
    });

    if (result.action === Share.sharedAction) {
      console.log('[workoutCardGenerator] Workout shared successfully');
    }
  } catch (error) {
    console.error('[workoutCardGenerator] Share failed:', error);
    Alert.alert('Share Failed', 'Unable to share your workout. Please try again.');
  }
}

/**
 * Capture a view as an image and return the URI
 */
export async function captureWorkoutCardAsImage(
  viewRef: RefObject<View>
): Promise<string | null> {
  if (!viewRef.current) {
    console.warn('[workoutCardGenerator] No view ref provided');
    return null;
  }

  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    return uri;
  } catch (error) {
    console.error('[workoutCardGenerator] Failed to capture view:', error);
    return null;
  }
}

/**
 * Share workout card as image
 * Requires a ref to the rendered card view
 */
export async function shareWorkoutAsImage(
  data: WorkoutCardData,
  viewRef: RefObject<View>
): Promise<boolean> {
  // Capture the view as an image
  const imageUri = await captureWorkoutCardAsImage(viewRef);

  if (!imageUri) {
    // Fall back to text sharing
    console.warn('[workoutCardGenerator] Image capture failed, falling back to text');
    await shareWorkoutAsText(data);
    return false;
  }

  const shareText = generateWorkoutShareText(data);
  const title = data.session.routineName || 'My Workout';

  try {
    // Share with image
    if (Platform.OS === 'ios') {
      await Share.share({
        url: imageUri,
        message: shareText,
        title,
      });
    } else {
      // Android needs file:// prefix
      const androidUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
      await Share.share({
        message: `${shareText}\n\n${androidUri}`,
        title,
      });
    }

    console.log('[workoutCardGenerator] Workout image shared successfully');
    return true;
  } catch (error) {
    console.error('[workoutCardGenerator] Image share failed:', error);
    // Fall back to text sharing
    await shareWorkoutAsText(data);
    return false;
  }
}

/**
 * Quick share function - uses text sharing
 * For image sharing, use shareWorkoutAsImage with a view ref
 */
export async function shareWorkout(data: WorkoutCardData): Promise<void> {
  await shareWorkoutAsText(data);
}

/**
 * Generate card data structure for potential web sharing or API
 */
export function generateWorkoutCardData(data: WorkoutCardData) {
  const { session, bestTier = 'Iron', milestones = [] } = data;
  const settings = getSettings();

  const exerciseCount = new Set(session.sets.map((s) => s.exerciseId)).size;
  const setCount = session.sets.length;
  const durationMs = session.endedAtMs - session.startedAtMs;
  const volume = data.totalVolume ?? session.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
  const topExercises = getTopExercises(session, 3);

  return {
    sessionId: session.id,
    routineName: session.routineName,
    userName: data.userName || settings.displayName,
    exerciseCount,
    setCount,
    durationMs,
    volumeKg: volume,
    bestTier,
    topExercises,
    prCount: milestones.filter((m) => ['weight_pr', 'rep_pr', 'e1rm_pr'].includes(m.type)).length,
    unitSystem: settings.unitSystem,
    generatedAt: Date.now(),
  };
}

export { TIER_EMOJIS, MILESTONE_EMOJIS };
