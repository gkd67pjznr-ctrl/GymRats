import type { UnitSystem } from "./buckets";
import type { LoggedSet } from "./loggerTypes";
import type { WorkoutSession } from "./workoutModel";
import type { Buddy, BuddyTier, CueMessage, TriggerType, RankProgressInfo } from "./buddyTypes";
import { buddies } from "./buddyData";
import { scoreFromE1rm } from "./forgerankScoring";
import { EXERCISES_V1 } from "../data/exercises";

/**
 * Buddy Engine - Core system for AI Gym Buddy personality system
 *
 * Handles:
 * 1. Buddy selection and unlocking
 * 2. Trigger evaluation (PRs, behavior patterns, session flow)
 * 3. Message selection with personality-specific content
 * 4. Tier-based feature gating (text/voice/theme)
 */

// Import store functions to get real user data
import { useBuddyStore } from './stores/buddyStore';

/**
 * Get the currently equipped buddy
 */
export function getCurrentBuddy(): Buddy | null {
  const buddyId = useBuddyStore.getState().currentBuddyId;
  if (!buddyId) return buddies.find(b => b.id === 'coach') ?? null;
  return buddies.find(b => b.id === buddyId) ?? null;
}

/**
 * Get all unlocked buddies for the user
 */
export function getUnlockedBuddies(): Buddy[] {
  const unlocked = useBuddyStore.getState().unlockedBuddies;
  return buddies.filter(buddy => unlocked[buddy.id]);
}

/**
 * Equip a buddy (must be unlocked)
 */
export function equipBuddy(buddyId: string): boolean {
  return useBuddyStore.getState().equipBuddy(buddyId);
}

/**
 * Evaluate triggers for a working set
 */
export function evaluateSetTriggers(args: {
  weightKg: number;
  reps: number;
  unit: UnitSystem;
  exerciseName: string;
  prev: any; // TODO: proper type
  setCue: any; // Result from perSetCue
  setIndex: number;
  totalSets: number;
}): CueMessage | null {
  const { setCue, setIndex, totalSets } = args;
  const buddy = getCurrentBuddy();
  if (!buddy) return null;

  // Performance Events - PR Detection
  if (setCue && setCue.cue) {
    const triggerType: TriggerType =
      setCue.meta.type === 'weight' ? 'pr_weight' :
      setCue.meta.type === 'rep' ? 'pr_rep' :
      setCue.meta.type === 'e1rm' ? 'pr_e1rm' :
      'none';

    if (triggerType !== 'none') {
      return selectMessageForTrigger(buddy, triggerType, setCue);
    }
  }

  // Session Flow Triggers
  if (setIndex === 0) {
    return selectMessageForTrigger(buddy, 'session_start', null);
  }

  if (setIndex === totalSets - 1) {
    return selectMessageForTrigger(buddy, 'final_set', null);
  }

  // Mid-workout check-in (every 5 sets)
  if (setIndex > 0 && setIndex % 5 === 0) {
    return selectMessageForTrigger(buddy, 'session_mid', null);
  }

  return null;
}

/**
 * Evaluate behavior pattern triggers
 */
export function evaluateBehaviorTriggers(args: {
  restDurationMs: number;
  isSkipping: boolean;
  streakDays: number;
  absenceDays: number;
  workoutDurationMs: number;
}): CueMessage | null {
  const buddy = getCurrentBuddy();
  if (!buddy) return null;

  const { restDurationMs, isSkipping, streakDays, absenceDays, workoutDurationMs } = args;

  // Long rest detection (over 3 minutes)
  if (restDurationMs > 180000) {
    return selectMessageForTrigger(buddy, 'long_rest', null);
  }

  // Skipping exercise detection
  if (isSkipping) {
    return selectMessageForTrigger(buddy, 'skip', null);
  }

  // Streak milestone detection
  if (streakDays >= 7 || streakDays >= 30) {
    return selectMessageForTrigger(buddy, 'streak', { streakDays });
  }

  // Return after absence
  if (absenceDays >= 3) {
    return selectMessageForTrigger(buddy, 'return_after_absence', { absenceDays });
  }

  // Unusually short workout
  if (workoutDurationMs < 300000) { // less than 5 minutes
    return selectMessageForTrigger(buddy, 'short_workout', null);
  }

  return null;
}

/**
 * Evaluate session completion triggers
 */
export function evaluateSessionTriggers(args: {
  session: WorkoutSession;
  volumeKg: number;
  rankProgress: RankProgressInfo | null;
}): CueMessage | null {
  const buddy = getCurrentBuddy();
  if (!buddy) return null;

  const { session, volumeKg, rankProgress } = args;

  // Volume milestone
  if (volumeKg >= 10000) { // 10,000 kg
    return selectMessageForTrigger(buddy, 'volume_milestone', { volumeKg });
  }

  // Rank up
  if (rankProgress && rankProgress.rankUp) {
    return selectMessageForTrigger(buddy, 'rank_up', rankProgress);
  }

  // Session end
  return selectMessageForTrigger(buddy, 'session_end', { session, volumeKg });
}

/**
 * Select a message from a buddy's message pool for a given trigger
 */
function selectMessageForTrigger(
  buddy: Buddy,
  triggerType: TriggerType,
  context: any
): CueMessage | null {
  const messagePool = buddy.messages[triggerType];
  if (!messagePool || messagePool.length === 0) return null;

  // Select random message from pool
  const message = messagePool[Math.floor(Math.random() * messagePool.length)];

  // Determine intensity based on context
  let intensity: 'low' | 'high' | 'epic' = 'low';
  if (triggerType.startsWith('pr_') || triggerType === 'rank_up') {
    intensity = context?.meta?.weightDeltaLb > 10 || context?.meta?.e1rmDeltaLb > 10 ? 'epic' : 'high';
  } else if (['session_end', 'final_set', 'volume_milestone'].includes(triggerType)) {
    intensity = 'high';
  }

  const cueMessage: CueMessage = {
    buddyId: buddy.id,
    buddyTier: buddy.tier,
    triggerType,
    intensity,
    text: message,
  };

  // Add voice line and SFX for premium+ buddies
  if (buddy.tier !== 'basic' && buddy.voiceLines?.[triggerType]) {
    const voicePool = buddy.voiceLines[triggerType];
    if (voicePool.length > 0) {
      cueMessage.voiceLine = voicePool[Math.floor(Math.random() * voicePool.length)];
    }
  }

  if (buddy.tier !== 'basic' && buddy.sfxPack?.[triggerType]) {
    cueMessage.sfx = buddy.sfxPack[triggerType];
  }

  // Add theme override for legendary buddies
  if (buddy.tier === 'legendary' && buddy.themeId) {
    cueMessage.themeOverride = buddy.themeId;
  }

  return cueMessage;
}

/**
 * Format a cue message for display
 */
export function formatCueMessage(cue: CueMessage): { title: string; detail?: string } {
  return {
    title: cue.text,
    detail: cue.buddyId ? `— ${buddies.find(b => b.id === cue.buddyId)?.name ?? 'Buddy'}` : undefined
  };
}

/**
 * Enhanced version of rank progress detection with proper implementation
 *
 * @param session - The completed workout session
 * @param previousBests - Map of exerciseId to previous best data
 * @param bodyweightKg - User's bodyweight for normalized scoring
 * @returns Array of rank progress information for exercises with rank changes
 */
export function detectRankProgressFull(
  session: WorkoutSession,
  previousBests?: Record<string, { e1rmKg: number }>,
  bodyweightKg?: number
): RankProgressInfo[] {
  if (!previousBests || Object.keys(previousBests).length === 0) {
    // No previous data to compare against
    return [];
  }

  const rankChanges: RankProgressInfo[] = [];

  // Group sets by exercise
  const setsByExercise: Record<string, LoggedSet[]> = {};
  session.sets.forEach(set => {
    if (!setsByExercise[set.exerciseId]) {
      setsByExercise[set.exerciseId] = [];
    }
    setsByExercise[set.exerciseId].push(set);
  });

  // For each exercise with previous data, check for rank changes
  Object.keys(previousBests).forEach(exerciseId => {
    const previousBest = previousBests[exerciseId];
    const exerciseSets = setsByExercise[exerciseId];

    if (!exerciseSets || exerciseSets.length === 0) {
      // No sets logged for this exercise in current workout
      return;
    }

    // Find best e1RM in current workout for this exercise
    let currentBestE1RM = 0;
    exerciseSets.forEach(set => {
      // Using Epley formula to estimate 1RM
      const estimatedE1RM = set.weightKg * (1 + set.reps / 30);
      if (estimatedE1RM > currentBestE1RM) {
        currentBestE1RM = estimatedE1RM;
      }
    });

    // Only check for rank changes if we have a better result
    if (currentBestE1RM > previousBest.e1rmKg) {
      // Calculate scores for both previous and current bests using actual Forgerank scoring
      const previousScoreResult = scoreFromE1rm(exerciseId, previousBest.e1rmKg, bodyweightKg);
      const currentScoreResult = scoreFromE1rm(exerciseId, currentBestE1RM, bodyweightKg);

      const previousScore = previousScoreResult.total;
      const currentScore = currentScoreResult.total;
      const previousRank = getRankTierFromScore(previousScore);
      const currentRank = getRankTierFromScore(currentScore);

      // Check if rank changed using actual Forgerank tiers
      const rankUp = currentRank !== previousRank && isHigherRank(currentRank, previousRank);

      rankChanges.push({
        exerciseId,
        exerciseName: EXERCISES_V1.find(e => e.id === exerciseId)?.name || exerciseId,
        previousRank: getRankNumberFromTier(previousRank),
        newRank: getRankNumberFromTier(currentRank),
        previousScore,
        newScore: currentScore,
        rankUp,
        scoreIncrease: currentScore - previousScore
      });
    }
  });

  return rankChanges;
}

/**
 * Detect rank progress for exercises in a workout session (legacy function - now calls enhanced version)
 *
 * @param session - The completed workout session
 * @param previousBests - Map of exerciseId to previous best data
 * @param bodyweightKg - User's bodyweight for normalized scoring
 * @returns Array of rank progress information for exercises with rank changes
 */
export function detectRankProgress(
  session: WorkoutSession,
  previousBests?: Record<string, { e1rmKg: number }>,
  bodyweightKg?: number
): RankProgressInfo[] {
  return detectRankProgressFull(session, previousBests, bodyweightKg);
}

// Helper functions for rank comparison
function getRankTierFromScore(score: number): string {
  if (score >= 900) return "Mythic";
  if (score >= 770) return "Diamond";
  if (score >= 620) return "Platinum";
  if (score >= 470) return "Gold";
  if (score >= 320) return "Silver";
  if (score >= 180) return "Bronze";
  return "Iron";
}

function getRankNumberFromTier(tier: string): number {
  const tiers = ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Mythic"];
  return tiers.indexOf(tier) + 1;
}

function isHigherRank(current: string, previous: string): boolean {
  const tiers = ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Mythic"];
  return tiers.indexOf(current) > tiers.indexOf(previous);
}