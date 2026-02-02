// src/lib/validators/journal.ts
// Input validation for journal data

import { MuscleId, CORE_MUSCLE_IDS } from "@/src/data/consolidatedMuscleGroups";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  value?: string | number | string[];
}

/**
 * Validate journal text
 * Max length: 5000 characters
 */
export function validateJournalText(input: string): ValidationResult {
  const trimmed = input.trim();

  // Allow empty for clearing
  if (trimmed === "") {
    return { valid: true, value: "" };
  }

  if (trimmed.length > 5000) {
    return {
      valid: false,
      error: "Journal entry cannot exceed 5000 characters",
    };
  }

  return { valid: true, value: trimmed };
}

/**
 * Validate mood rating (1-5)
 */
export function validateMoodRating(input: string): ValidationResult {
  const trimmed = input.trim();

  // Allow empty for optional field
  if (trimmed === "") {
    return { valid: true };
  }

  const num = Number(trimmed);

  if (!Number.isFinite(num)) {
    return { valid: false, error: "Mood rating must be a number" };
  }

  // Convert to integer
  const intValue = Math.floor(num);

  if (intValue < 1) {
    return { valid: false, error: "Mood rating must be at least 1" };
  }

  if (intValue > 5) {
    return { valid: false, error: "Mood rating cannot exceed 5" };
  }

  return { valid: true, value: intValue };
}

/**
 * Validate energy level (1-5)
 */
export function validateEnergyLevel(input: string): ValidationResult {
  const trimmed = input.trim();

  // Allow empty for optional field
  if (trimmed === "") {
    return { valid: true };
  }

  const num = Number(trimmed);

  if (!Number.isFinite(num)) {
    return { valid: false, error: "Energy level must be a number" };
  }

  // Convert to integer
  const intValue = Math.floor(num);

  if (intValue < 1) {
    return { valid: false, error: "Energy level must be at least 1" };
  }

  if (intValue > 5) {
    return { valid: false, error: "Energy level cannot exceed 5" };
  }

  return { valid: true, value: intValue };
}

/**
 * Validate soreness muscle groups
 */
export function validateSoreness(input: string[]): ValidationResult {
  // Allow empty array
  if (input.length === 0) {
    return { valid: true, value: [] };
  }

  // Check each muscle group ID is valid
  const invalidIds: string[] = [];
  const validIds: MuscleId[] = [];

  for (const id of input) {
    if (CORE_MUSCLE_IDS.includes(id as MuscleId)) {
      validIds.push(id as MuscleId);
    } else {
      invalidIds.push(id);
    }
  }

  if (invalidIds.length > 0) {
    return {
      valid: false,
      error: `Invalid muscle group IDs: ${invalidIds.join(", ")}`,
    };
  }

  // Remove duplicates
  const uniqueIds = Array.from(new Set(validIds));

  return { valid: true, value: uniqueIds };
}

/**
 * Validate date in ISO format (YYYY-MM-DD)
 */
export function validateJournalDate(input: string): ValidationResult {
  const trimmed = input.trim();

  if (trimmed === "") {
    return { valid: false, error: "Date is required" };
  }

  // Check format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(trimmed)) {
    return { valid: false, error: "Date must be in YYYY-MM-DD format" };
  }

  // Check if valid date
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) {
    return { valid: false, error: "Invalid date" };
  }

  // Check not in future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) {
    return { valid: false, error: "Date cannot be in the future" };
  }

  return { valid: true, value: trimmed };
}

/**
 * Validate journal entry data object
 */
export interface JournalEntryValidation {
  text: ValidationResult;
  mood?: ValidationResult;
  energy?: ValidationResult;
  soreness?: ValidationResult;
  date?: ValidationResult;
}

export function validateJournalEntry(data: {
  text: string;
  mood?: string | number;
  energy?: string | number;
  soreness?: string[];
  date?: string;
}): JournalEntryValidation {
  const validation: JournalEntryValidation = {
    text: validateJournalText(data.text),
  };

  if (data.mood !== undefined) {
    validation.mood = validateMoodRating(
      typeof data.mood === "number" ? data.mood.toString() : data.mood
    );
  }

  if (data.energy !== undefined) {
    validation.energy = validateEnergyLevel(
      typeof data.energy === "number" ? data.energy.toString() : data.energy
    );
  }

  if (data.soreness !== undefined) {
    validation.soreness = validateSoreness(data.soreness);
  }

  if (data.date !== undefined) {
    validation.date = validateJournalDate(data.date);
  }

  return validation;
}

/**
 * Check if journal entry validation is completely valid
 */
export function isJournalEntryValid(validation: JournalEntryValidation): boolean {
  const results = Object.values(validation);
  return results.every(result => result.valid);
}

/**
 * Get first validation error from journal entry validation
 */
export function getFirstJournalValidationError(
  validation: JournalEntryValidation
): string | undefined {
  for (const result of Object.values(validation)) {
    if (!result.valid && result.error) {
      return result.error;
    }
  }
  return undefined;
}