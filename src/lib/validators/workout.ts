/**
 * Input validation for workout data
 * Prevents invalid data from entering the system
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  value?: number;
}

// TAG-SPEC-003-IMPROVE-weight-validation
/**
 * Validate weight input (in lbs)
 * Range: 0-2000 lbs (reasonable max for any lift)
 */
export function validateWeight(input: string): ValidationResult {
  const trimmed = input.trim();
  
  // Allow empty for clearing
  if (trimmed === '') {
    return { valid: true, value: 0 };
  }
  
  const num = Number(trimmed);
  
  if (!Number.isFinite(num)) {
    return { valid: false, error: 'Weight must be a number' };
  }
  
  if (num < 0) {
    return { valid: false, error: 'Weight cannot be negative' };
  }
  
  if (num > 2000) {
    return { valid: false, error: 'Weight cannot exceed 2000 lbs' };
  }
  
  // Round to 2 decimal places
  const rounded = Math.round(num * 100) / 100;
  
  return { valid: true, value: rounded };
}

// TAG-SPEC-003-IMPROVE-reps-validation
/**
 * Validate reps input
 * Range: 1-100 (reasonable max for any set)
 */
export function validateReps(input: string): ValidationResult {
  const trimmed = input.trim();
  
  // Allow empty for clearing
  if (trimmed === '') {
    return { valid: true, value: 0 };
  }
  
  const num = Number(trimmed);
  
  if (!Number.isFinite(num)) {
    return { valid: false, error: 'Reps must be a number' };
  }
  
  // Convert to integer
  const intValue = Math.floor(num);
  
  if (intValue < 1) {
    return { valid: false, error: 'Reps must be at least 1' };
  }
  
  if (intValue > 100) {
    return { valid: false, error: 'Reps cannot exceed 100' };
  }
  
  return { valid: true, value: intValue };
}

// TAG-SPEC-003-IMPROVE-bodyweight-validation
/**
 * Validate bodyweight input (in lbs)
 * Range: 50-500 lbs (reasonable human range)
 */
export function validateBodyweight(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (trimmed === '') {
    return { valid: false, error: 'Bodyweight required' };
  }
  
  const num = Number(trimmed);
  
  if (!Number.isFinite(num)) {
    return { valid: false, error: 'Bodyweight must be a number' };
  }
  
  if (num < 50) {
    return { valid: false, error: 'Bodyweight must be at least 50 lbs' };
  }
  
  if (num > 500) {
    return { valid: false, error: 'Bodyweight cannot exceed 500 lbs' };
  }
  
  const rounded = Math.round(num * 10) / 10;
  
  return { valid: true, value: rounded };
}

// TAG-SPEC-003-IMPROVE-duration-validation
/**
 * Validate duration input (in seconds)
 * Range: 1-86400 (1 second to 24 hours)
 */
export function validateDuration(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (trimmed === '') {
    return { valid: true, value: 0 };
  }
  
  const num = Number(trimmed);
  
  if (!Number.isFinite(num)) {
    return { valid: false, error: 'Duration must be a number' };
  }
  
  const intValue = Math.floor(num);
  
  if (intValue < 1) {
    return { valid: false, error: 'Duration must be at least 1 second' };
  }
  
  if (intValue > 86400) {
    return { valid: false, error: 'Duration cannot exceed 24 hours' };
  }
  
  return { valid: true, value: intValue };
}
