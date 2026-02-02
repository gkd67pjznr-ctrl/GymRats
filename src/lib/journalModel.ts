// src/lib/journalModel.ts
// Training journal data model and utilities

import { uid } from "./uid";
import { MuscleId } from "@/src/data/consolidatedMuscleGroups";

/**
 * Journal entry for training journal
 * Can be linked to a workout session or standalone for rest days
 */
export type JournalEntry = {
  id: string;
  userId: string;
  date: string;           // ISO date (YYYY-MM-DD)
  sessionId?: string;     // Optional link to workout session
  text: string;
  mood?: number;          // 1-5
  energy?: number;        // 1-5
  soreness?: MuscleId[];  // muscle group IDs
  createdAt: number;      // timestamp in ms
  updatedAt?: number;     // timestamp in ms
};

/**
 * Create a new journal entry
 */
export function createJournalEntry(
  userId: string,
  date: string,
  text: string,
  sessionId?: string,
  mood?: number,
  energy?: number,
  soreness?: MuscleId[]
): JournalEntry {
  const now = Date.now();
  return {
    id: uid(),
    userId,
    date,
    sessionId,
    text,
    mood,
    energy,
    soreness,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update an existing journal entry
 */
export function updateJournalEntry(
  entry: JournalEntry,
  updates: Partial<Omit<JournalEntry, "id" | "userId" | "createdAt">>
): JournalEntry {
  return {
    ...entry,
    ...updates,
    updatedAt: Date.now(),
  };
}

/**
 * Format date for journal display
 */
export function formatJournalDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format date for journal display (short version)
 */
export function formatJournalDateShort(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get journal entry for a specific workout session
 */
export function getEntryForSession(
  entries: JournalEntry[],
  sessionId: string
): JournalEntry | undefined {
  return entries.find(entry => entry.sessionId === sessionId);
}

/**
 * Get journal entries for a specific date
 */
export function getEntriesForDate(
  entries: JournalEntry[],
  date: string
): JournalEntry[] {
  return entries.filter(entry => entry.date === date);
}

/**
 * Get journal entries for a date range
 */
export function getEntriesForDateRange(
  entries: JournalEntry[],
  startDate: string,
  endDate: string
): JournalEntry[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return entries.filter(entry => {
    const entryDate = new Date(entry.date).getTime();
    return entryDate >= start && entryDate <= end;
  });
}

/**
 * Get today's date in ISO format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get date from timestamp in ISO format
 */
export function getDateFromTimestamp(timestampMs: number): string {
  return new Date(timestampMs).toISOString().split("T")[0];
}

/**
 * Get date from workout session start time
 */
export function getDateFromWorkoutSession(session: { startedAtMs: number }): string {
  return getDateFromTimestamp(session.startedAtMs);
}

/**
 * Convert workout session to journal entry
 */
export function workoutSessionToJournalEntry(
  session: {
    id: string;
    userId: string;
    startedAtMs: number;
    notes?: string;
    mood?: number;
    energy?: number;
    soreness?: string[];
  }
): JournalEntry {
  return {
    id: uid(),
    userId: session.userId,
    date: getDateFromTimestamp(session.startedAtMs),
    sessionId: session.id,
    text: session.notes || "",
    mood: session.mood,
    energy: session.energy,
    soreness: session.soreness as MuscleId[],
    createdAt: Date.now(),
  };
}

/**
 * Search journal entries by text content
 */
export function searchJournalEntries(
  entries: JournalEntry[],
  query: string
): JournalEntry[] {
  if (!query.trim()) return entries;

  const searchTerm = query.toLowerCase();
  return entries.filter(entry =>
    entry.text.toLowerCase().includes(searchTerm)
  );
}

/**
 * Filter journal entries by mood rating
 */
export function filterEntriesByMood(
  entries: JournalEntry[],
  minMood?: number,
  maxMood?: number
): JournalEntry[] {
  return entries.filter(entry => {
    if (entry.mood === undefined) return false;

    if (minMood !== undefined && entry.mood < minMood) return false;
    if (maxMood !== undefined && entry.mood > maxMood) return false;

    return true;
  });
}

/**
 * Filter journal entries by energy rating
 */
export function filterEntriesByEnergy(
  entries: JournalEntry[],
  minEnergy?: number,
  maxEnergy?: number
): JournalEntry[] {
  return entries.filter(entry => {
    if (entry.energy === undefined) return false;

    if (minEnergy !== undefined && entry.energy < minEnergy) return false;
    if (maxEnergy !== undefined && entry.energy > maxEnergy) return false;

    return true;
  });
}

/**
 * Get mood statistics from journal entries
 */
export function getMoodStatistics(entries: JournalEntry[]): {
  average: number;
  count: number;
  distribution: Record<number, number>;
} {
  const moodEntries = entries.filter(entry => entry.mood !== undefined);
  const total = moodEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0);

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  moodEntries.forEach(entry => {
    if (entry.mood) distribution[entry.mood] = (distribution[entry.mood] || 0) + 1;
  });

  return {
    average: moodEntries.length > 0 ? total / moodEntries.length : 0,
    count: moodEntries.length,
    distribution,
  };
}

/**
 * Get energy statistics from journal entries
 */
export function getEnergyStatistics(entries: JournalEntry[]): {
  average: number;
  count: number;
  distribution: Record<number, number>;
} {
  const energyEntries = entries.filter(entry => entry.energy !== undefined);
  const total = energyEntries.reduce((sum, entry) => sum + (entry.energy || 0), 0);

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  energyEntries.forEach(entry => {
    if (entry.energy) distribution[entry.energy] = (distribution[entry.energy] || 0) + 1;
  });

  return {
    average: energyEntries.length > 0 ? total / energyEntries.length : 0,
    count: energyEntries.length,
    distribution,
  };
}