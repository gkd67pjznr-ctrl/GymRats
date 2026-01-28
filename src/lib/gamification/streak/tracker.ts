/**
 * Streak tracking logic with calendar support.
 */

import type {
  GamificationProfile,
  StreakResult,
  WorkoutCalendarEntry,
} from '../types';

/** Maximum gap between workouts before streak breaks (days) */
const STREAK_BREAK_THRESHOLD = 5;

/**
 * Get today's date as ISO string (YYYY-MM-DD).
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate days between two ISO date strings.
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is within the streak threshold of today.
 */
export function isWithinStreakThreshold(date: string, today: string = getTodayISO()): boolean {
  return daysBetween(date, today) <= STREAK_BREAK_THRESHOLD;
}

/**
 * Update streak based on a completed workout.
 *
 * Rules:
 * - If last workout was within 5 days: streak continues (+1 if new day, same if same day)
 * - If last workout was 5+ days ago: streak resets to 1
 * - Same-day workouts don't increment streak but maintain it
 *
 * @param profile - Current gamification profile
 * @param workoutDate - ISO date of workout (defaults to today)
 * @returns Updated streak result
 */
export function updateStreak(
  profile: Pick<GamificationProfile, 'currentStreak' | 'longestStreak' | 'lastWorkoutDate'>,
  workoutDate: string = getTodayISO()
): StreakResult {
  const { currentStreak, longestStreak, lastWorkoutDate } = profile;
  const today = getTodayISO();

  // First workout ever
  if (!lastWorkoutDate) {
    return {
      streak: 1,
      wasReset: false,
      isNewRecord: true,
      previousStreak: 0,
    };
  }

  const daysSinceLastWorkout = daysBetween(lastWorkoutDate, workoutDate);
  const daysSinceToday = daysBetween(workoutDate, today);

  // Check if streak is broken (5+ days gap)
  if (daysSinceLastWorkout > STREAK_BREAK_THRESHOLD) {
    // Streak broken, start fresh
    return {
      streak: 1,
      wasReset: true,
      isNewRecord: false,
      previousStreak: currentStreak,
    };
  }

  // Same-day workout (or within today - don't increment)
  if (daysSinceLastWorkout === 0 || (daysSinceToday === 0 && daysSinceLastWorkout <= 1)) {
    return {
      streak: currentStreak,
      wasReset: false,
      isNewRecord: false,
      previousStreak: currentStreak,
    };
  }

  // New day, increment streak
  const newStreak = currentStreak + 1;
  const isNewRecord = newStreak > longestStreak;

  return {
    streak: newStreak,
    wasReset: false,
    isNewRecord,
    previousStreak: currentStreak,
  };
}

/**
 * Update the workout calendar with a new entry.
 * Adds to existing day if workout already recorded, creates new entry otherwise.
 *
 * @param calendar - Current workout calendar
 * @param workoutDate - ISO date of workout
 * @param xp - XP earned from this workout
 * @returns Updated calendar
 */
export function updateWorkoutCalendar(
  calendar: WorkoutCalendarEntry[],
  workoutDate: string = getTodayISO(),
  xp: number = 0
): WorkoutCalendarEntry[] {
  // Remove entries older than 365 days
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 365);
  const cutoffISO = cutoffDate.toISOString().split('T')[0];

  const filtered = calendar.filter((entry) => entry.date >= cutoffISO);

  // Check if date already exists
  const existingIndex = filtered.findIndex((entry) => entry.date === workoutDate);

  if (existingIndex >= 0) {
    // Update existing entry
    const updated = [...filtered];
    updated[existingIndex] = {
      ...updated[existingIndex],
      count: updated[existingIndex].count + 1,
      xp: updated[existingIndex].xp + xp,
    };
    return updated;
  }

  // Add new entry
  return [
    ...filtered,
    {
      date: workoutDate,
      count: 1,
      xp,
    },
  ];
}

/**
 * Get workout intensity level for calendar cell coloring.
 *
 * @param count - Number of workouts on this day
 * @param xp - Total XP earned on this day
 * @returns Intensity level (0-4)
 */
export function getWorkoutIntensity(count: number, xp: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;

  // High intensity: multiple workouts OR high XP single workout
  if (count >= 2 || xp >= 200) return 4;
  if (count === 1 && xp >= 150) return 3;
  if (count === 1 && xp >= 100) return 2;
  if (count === 1 && xp >= 50) return 1;

  return 1;
}

/**
 * Check if a streak milestone is reached.
 *
 * @param streak - Current streak count
 * @returns Milestone info if reached, null otherwise
 */
export function checkStreakMilestone(streak: number): { days: number; tokens: number } | null {
  const milestones: Record<number, number> = {
    7: 25,
    14: 40,
    21: 60,
    30: 100,
    60: 200,
    90: 300,
    100: 500,
    180: 750,
    365: 1500,
  };

  if (milestones[streak]) {
    return { days: streak, tokens: milestones[streak] };
  }

  return null;
}

/**
 * Get all streak milestone definitions for display.
 */
export function getAllStreakMilestones(): Array<{ days: number; tokens: number }> {
  return [
    { days: 7, tokens: 25 },
    { days: 14, tokens: 40 },
    { days: 21, tokens: 60 },
    { days: 30, tokens: 100 },
    { days: 60, tokens: 200 },
    { days: 90, tokens: 300 },
    { days: 100, tokens: 500 },
    { days: 180, tokens: 750 },
    { days: 365, tokens: 1500 },
  ];
}

/**
 * Calculate the current streak status from calendar data.
 * Useful for recalculating streak from calendar if it gets out of sync.
 *
 * @param calendar - Workout calendar entries
 * @param today - Today's ISO date
 * @returns Current streak count
 */
export function recalculateStreakFromCalendar(
  calendar: WorkoutCalendarEntry[],
  today: string = getTodayISO()
): number {
  // Sort by date descending
  const sorted = [...calendar].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) return 0;

  // Find the most recent workout
  const mostRecent = sorted[0];
  const daysSinceMostRecent = daysBetween(mostRecent.date, today);

  // If most recent workout is outside threshold, streak is 0
  if (daysSinceMostRecent > STREAK_BREAK_THRESHOLD) return 0;

  // Count consecutive days within threshold
  let streak = 1;
  let currentDate = mostRecent.date;

  for (let i = 1; i < sorted.length; i++) {
    const daysDiff = daysBetween(currentDate, sorted[i].date);

    if (daysDiff <= STREAK_BREAK_THRESHOLD) {
      streak++;
      currentDate = sorted[i].date;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get the date when streak will break.
 *
 * @param lastWorkoutDate - ISO date of last workout
 * @returns ISO date when streak breaks, or null if already broken
 */
export function getStreakBreakDate(lastWorkoutDate: string): string | null {
  const breakDate = new Date(lastWorkoutDate);
  breakDate.setDate(breakDate.getDate() + STREAK_BREAK_THRESHOLD + 1);
  return breakDate.toISOString().split('T')[0];
}

/**
 * Get days remaining before streak breaks.
 *
 * @param lastWorkoutDate - ISO date of last workout
 * @returns Days remaining (0 = breaks today), or -1 if already broken
 */
export function getDaysRemainingInStreak(lastWorkoutDate: string): number {
  const today = getTodayISO();
  const daysSince = daysBetween(lastWorkoutDate, today);

  if (daysSince > STREAK_BREAK_THRESHOLD) return -1;
  return STREAK_BREAK_THRESHOLD - daysSince;
}
