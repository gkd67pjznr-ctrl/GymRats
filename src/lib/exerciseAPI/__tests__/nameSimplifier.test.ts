/**
 * Unit tests for exercise name simplifier
 */

import {
  simplifyExerciseName,
  simplifyName,
  areSameExercise,
  getExercisePattern,
  getMovementCategory,
} from '../nameSimplifier';

describe('simplifyExerciseName', () => {
  it('should remove medium grip', () => {
    const result = simplifyExerciseName('Barbell Bench Press - Medium Grip');
    expect(result.simplified).toBe('Barbell Bench Press');
    expect(result.removed).toContain('medium grip');
  });

  it('should remove narrow grip', () => {
    const result = simplifyExerciseName('Barbell Curl - Narrow Grip');
    expect(result.simplified).toBe('Barbell Curl');
    expect(result.removed).toContain('narrow grip');
  });

  it('should remove wide grip', () => {
    const result = simplifyExerciseName('Lat Pulldown - Wide Grip');
    expect(result.simplified).toBe('Lat Pulldown');
    expect(result.removed).toContain('wide grip');
  });

  it('should remove neutral grip', () => {
    const result = simplifyExerciseName('Dumbbell Shoulder Press - Neutral Grip');
    expect(result.simplified).toBe('Dumbbell Shoulder Press');
    expect(result.removed).toContain('neutral grip');
  });

  it('should remove narrow stance', () => {
    const result = simplifyExerciseName('Barbell Squat - Narrow Stance');
    expect(result.simplified).toBe('Barbell Squat');
    expect(result.removed).toContain('narrow stance');
  });

  it('should remove wide stance', () => {
    const result = simplifyExerciseName('Barbell Squat - Wide Stance');
    expect(result.simplified).toBe('Barbell Squat');
    expect(result.removed).toContain('wide stance');
  });

  it('should remove seated', () => {
    const result = simplifyExerciseName('Seated Dumbbell Press');
    expect(result.simplified).toBe('Dumbbell Press');
    expect(result.removed).toContain('seated');
  });

  it('should remove standing', () => {
    const result = simplifyExerciseName('Standing Barbell Curl');
    expect(result.simplified).toBe('Barbell Curl');
    expect(result.removed).toContain('standing');
  });

  it('should remove incline', () => {
    const result = simplifyExerciseName('Incline Dumbbell Press');
    expect(result.simplified).toBe('Dumbbell Press');
    expect(result.removed).toContain('incline');
  });

  it('should remove decline', () => {
    const result = simplifyExerciseName('Decline Bench Press');
    expect(result.simplified).toBe('Bench Press');
    expect(result.removed).toContain('decline');
  });

  it('should handle multiple descriptors', () => {
    const result = simplifyExerciseName('Seated Barbell Overhead Press - Medium Grip');
    expect(result.simplified).toBe('Barbell Overhead Press');
    expect(result.removed).toContain('seated');
    expect(result.removed).toContain('medium grip');
  });

  it('should handle names with no descriptors', () => {
    const result = simplifyExerciseName('Barbell Squat');
    expect(result.simplified).toBe('Barbell Squat');
    expect(result.removed).toEqual([]);
  });

  it('should clean up extra spaces', () => {
    const result = simplifyExerciseName('Barbell  Bench  Press');
    expect(result.simplified).toBe('Barbell Bench Press');
  });

  it('should remove trailing separators', () => {
    const result = simplifyExerciseName('Barbell Bench Press -');
    expect(result.simplified).toBe('Barbell Bench Press');
  });
});

describe('simplifyName', () => {
  it('should return simplified name string', () => {
    expect(simplifyName('Barbell Bench Press - Medium Grip')).toBe('Barbell Bench Press');
    expect(simplifyName('Dumbbell Curl - Neutral Grip')).toBe('Dumbbell Curl');
  });
});

describe('areSameExercise', () => {
  it('should identify same exercises with different descriptors', () => {
    expect(areSameExercise('Barbell Bench Press - Medium Grip', 'Barbell Bench Press - Narrow Grip')).toBe(true);
    expect(areSameExercise('Dumbbell Shoulder Press - Seated', 'Seated Dumbbell Shoulder Press')).toBe(true);
  });

  it('should identify different exercises', () => {
    expect(areSameExercise('Barbell Bench Press', 'Barbell Squat')).toBe(false);
    expect(areSameExercise('Dumbbell Curl', 'Barbell Curl')).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(areSameExercise('Barbell Bench Press', 'barbell bench press')).toBe(true);
  });
});

describe('getExercisePattern', () => {
  it('should extract movement pattern', () => {
    expect(getExercisePattern('Barbell Bench Press')).toBe('bench press');
    expect(getExercisePattern('Dumbbell Bench Press')).toBe('bench press');
    expect(getExercisePattern('Cable Fly')).toBe('fly');
    expect(getExercisePattern('Machine Chest Press')).toBe('chest press');
  });

  it('should remove equipment prefix', () => {
    expect(getExercisePattern('Barbell Squat')).toBe('squat');
    expect(getExercisePattern('Dumbbell Squat')).toBe('squat');
    expect(getExercisePattern('Cable Curl')).toBe('curl');
  });
});

describe('getMovementCategory', () => {
  it('should categorize pressing movements', () => {
    expect(getMovementCategory('Barbell Bench Press')).toBe('press');
    expect(getMovementCategory('Dumbbell Shoulder Press')).toBe('press');
    expect(getMovementCategory('Tricep Extension')).toBe('press');
  });

  it('should categorize pulling movements', () => {
    expect(getMovementCategory('Barbell Row')).toBe('pull');
    expect(getMovementCategory('Lat Pulldown')).toBe('pull');
    expect(getMovementCategory('Bicep Curl')).toBe('pull');
  });

  it('should categorize squat movements', () => {
    expect(getMovementCategory('Barbell Squat')).toBe('squat');
    expect(getMovementCategory('Leg Press')).toBe('squat');
    expect(getMovementCategory('Lunge')).toBe('squat');
  });

  it('should categorize hinge movements', () => {
    expect(getMovementCategory('Deadlift')).toBe('hinge');
    expect(getMovementCategory('Romanian Deadlift')).toBe('hinge');
    expect(getMovementCategory('Good Morning')).toBe('hinge');
  });

  it('should categorize core movements', () => {
    expect(getMovementCategory('Plank')).toBe('core');
    expect(getMovementCategory('Crunch')).toBe('core');
    expect(getMovementCategory('Russian Twist')).toBe('core');
  });

  it('should categorize cardio movements', () => {
    expect(getMovementCategory('Running')).toBe('cardio');
    expect(getMovementCategory('Cycling')).toBe('cardio');
    expect(getMovementCategory('Jump Rope')).toBe('cardio');
  });

  it('should default to other for unknown movements', () => {
    expect(getMovementCategory('Some Unknown Exercise')).toBe('other');
  });
});
