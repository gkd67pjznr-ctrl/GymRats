/**
 * Characterization tests for workout validators
 * These tests capture the EXISTING behavior of validation functions
 *
 * DDD PRESERVE Phase: Creating safety net before refactoring
 */

import { validateWeight, validateReps, validateBodyweight, validateDuration } from '../workout';

describe('validateWeight - Characterization Tests', () => {
  test('should accept empty string as valid with value 0', () => {
    const result = validateWeight('');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(0);
  });

  test('should accept whitespace-only string as valid with value 0', () => {
    const result = validateWeight('  ');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(0);
  });

  test('should accept valid positive numbers', () => {
    expect(validateWeight('135').valid).toBe(true);
    expect(validateWeight('135').value).toBe(135);
    expect(validateWeight('135.5').valid).toBe(true);
    expect(validateWeight('135.567').value).toBe(135.57); // Rounded to 2 decimals
  });

  test('should accept zero as valid', () => {
    const result = validateWeight('0');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(0);
  });

  test('should reject negative numbers', () => {
    const result = validateWeight('-10');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Weight cannot be negative');
  });

  test('should reject numbers above 2000', () => {
    const result = validateWeight('2001');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Weight cannot exceed 2000 lbs');
  });

  test('should accept exactly 2000 as valid', () => {
    const result = validateWeight('2000');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(2000);
  });

  test('should reject non-numeric input', () => {
    const result = validateWeight('abc');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Weight must be a number');
  });

  test('should reject special characters', () => {
    expect(validateWeight('!@#').valid).toBe(false);
    expect(validateWeight('10!').valid).toBe(false);
  });

  test('should reject Infinity', () => {
    const result = validateWeight('Infinity');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Weight must be a number');
  });
});

describe('validateReps - Characterization Tests', () => {
  test('should accept empty string as valid with value 0', () => {
    const result = validateReps('');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(0);
  });

  test('should accept valid positive integers', () => {
    const result = validateReps('10');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(10);
  });

  test('should floor decimal values to integers', () => {
    const result = validateReps('8.9');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(8); // Floored
  });

  test('should reject zero', () => {
    const result = validateReps('0');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Reps must be at least 1');
  });

  test('should reject negative numbers', () => {
    const result = validateReps('-5');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Reps must be at least 1');
  });

  test('should reject numbers above 100', () => {
    const result = validateReps('101');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Reps cannot exceed 100');
  });

  test('should accept exactly 100 as valid', () => {
    const result = validateReps('100');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(100);
  });

  test('should accept exactly 1 as valid', () => {
    const result = validateReps('1');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(1);
  });

  test('should reject non-numeric input', () => {
    const result = validateReps('abc');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Reps must be a number');
  });
});

describe('validateBodyweight - Characterization Tests', () => {
  test('should reject empty string', () => {
    const result = validateBodyweight('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Bodyweight required');
  });

  test('should accept valid bodyweight in range', () => {
    const result = validateBodyweight('180');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(180);
  });

  test('should round to 1 decimal place', () => {
    const result = validateBodyweight('180.56');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(180.6); // Rounded to 1 decimal
  });

  test('should reject values below 50', () => {
    const result = validateBodyweight('49');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Bodyweight must be at least 50 lbs');
  });

  test('should accept exactly 50 as valid', () => {
    const result = validateBodyweight('50');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(50);
  });

  test('should reject values above 500', () => {
    const result = validateBodyweight('501');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Bodyweight cannot exceed 500 lbs');
  });

  test('should accept exactly 500 as valid', () => {
    const result = validateBodyweight('500');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(500);
  });
});

describe('validateDuration - Characterization Tests', () => {
  test('should accept empty string as valid with value 0', () => {
    const result = validateDuration('');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(0);
  });

  test('should accept valid positive duration', () => {
    const result = validateDuration('90');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(90);
  });

  test('should floor decimal values to integers', () => {
    const result = validateDuration('90.9');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(90);
  });

  test('should reject zero', () => {
    const result = validateDuration('0');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Duration must be at least 1 second');
  });

  test('should accept exactly 1 as valid', () => {
    const result = validateDuration('1');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(1);
  });

  test('should reject values above 86400 (24 hours)', () => {
    const result = validateDuration('86401');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Duration cannot exceed 24 hours');
  });

  test('should accept exactly 86400 as valid', () => {
    const result = validateDuration('86400');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(86400);
  });
});
