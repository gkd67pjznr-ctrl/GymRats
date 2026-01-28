/**
 * Unit tests for XP calculator
 */

import { calculateWorkoutXP, calculateSetXP, calculateProjectedXP } from '../calculator';

describe('calculateWorkoutXP', () => {
  it('should calculate base XP correctly', () => {
    const workout = {
      sets: [
        { exerciseId: 'bench', weightKg: 60, reps: 10 },
        { exerciseId: 'squat', weightKg: 80, reps: 8 },
      ],
      currentStreak: 0,
    };

    const result = calculateWorkoutXP(workout);

    // Base XP: 2 sets × 10 = 20
    expect(result.base).toBe(20);
  });

  it('should calculate volume bonus', () => {
    const workout = {
      sets: [
        { exerciseId: 'bench', weightKg: 100, reps: 5 }, // 500 volume
        { exerciseId: 'squat', weightKg: 120, reps: 5 }, // 600 volume
      ],
      currentStreak: 0,
    };

    const result = calculateWorkoutXP(workout);

    // Volume bonus: sqrt(1100) × 2 ≈ 66
    expect(result.volume).toBeGreaterThan(60);
    expect(result.volume).toBeLessThan(75);
  });

  it('should calculate exercise variety bonus', () => {
    const workout = {
      sets: [
        { exerciseId: 'bench', weightKg: 60, reps: 10 },
        { exerciseId: 'squat', weightKg: 80, reps: 8 },
        { exerciseId: 'deadlift', weightKg: 100, reps: 5 },
      ],
      currentStreak: 0,
    };

    const result = calculateWorkoutXP(workout);

    // 3 unique exercises × 15 = 45
    expect(result.exercise).toBe(45);
  });

  it('should calculate streak bonus', () => {
    const workout = {
      sets: [{ exerciseId: 'bench', weightKg: 60, reps: 10 }],
      currentStreak: 7,
    };

    const result = calculateWorkoutXP(workout);

    // 7 streak × 5 = 35
    expect(result.streak).toBe(35);
  });

  it('should add completion bonus for fully completed workouts', () => {
    const workout = {
      sets: [{ exerciseId: 'bench', weightKg: 60, reps: 10 }],
      currentStreak: 0,
      fullyCompleted: true,
    };

    const result = calculateWorkoutXP(workout);

    expect(result.completion).toBe(50);
  });

  it('should not add completion bonus for incomplete workouts', () => {
    const workout = {
      sets: [{ exerciseId: 'bench', weightKg: 60, reps: 10 }],
      currentStreak: 0,
      fullyCompleted: false,
    };

    const result = calculateWorkoutXP(workout);

    expect(result.completion).toBe(0);
  });

  it('should calculate total XP correctly', () => {
    const workout = {
      sets: [
        { exerciseId: 'bench', weightKg: 60, reps: 10 },
        { exerciseId: 'squat', weightKg: 80, reps: 8 },
      ],
      currentStreak: 5,
      fullyCompleted: true,
    };

    const result = calculateWorkoutXP(workout);

    // Base: 20 + Volume (~45) + Exercise: 30 + Streak: 25 + Completion: 50 ≈ 170
    expect(result.total).toBeGreaterThan(150);
    expect(result.total).toBeLessThan(200);
  });

  it('should handle empty workout', () => {
    const workout = {
      sets: [],
      currentStreak: 0,
    };

    const result = calculateWorkoutXP(workout);

    expect(result.total).toBe(0);
    expect(result.base).toBe(0);
  });
});

describe('calculateSetXP', () => {
  it('should calculate XP for a single set', () => {
    const xp = calculateSetXP(100, 10);

    // Base: 10 + volume contribution
    expect(xp).toBeGreaterThan(10);
    expect(xp).toBeLessThan(20);
  });

  it('should reward heavier sets', () => {
    const lightXP = calculateSetXP(50, 10);
    const heavyXP = calculateSetXP(150, 10);

    expect(heavyXP).toBeGreaterThan(lightXP);
  });

  it('should reward higher rep sets', () => {
    const lowRepXP = calculateSetXP(100, 5);
    const highRepXP = calculateSetXP(100, 15);

    expect(highRepXP).toBeGreaterThan(lowRepXP);
  });
});

describe('calculateProjectedXP', () => {
  it('should calculate XP without completion bonus', () => {
    const sets = [
      { exerciseId: 'bench', weightKg: 60, reps: 10 },
    ];
    const streak = 3;

    const result = calculateProjectedXP(sets, streak);

    expect(result.completion).toBeUndefined();
    expect('completion' in result).toBe(false);
  });

  it('should match calculateWorkoutXP for in-progress workouts', () => {
    const sets = [
      { exerciseId: 'bench', weightKg: 60, reps: 10 },
      { exerciseId: 'squat', weightKg: 80, reps: 8 },
    ];
    const streak = 5;

    const projected = calculateProjectedXP(sets, streak);
    const workout = { sets, currentStreak: 5, fullyCompleted: false };
    const full = calculateWorkoutXP(workout);

    expect(projected.total).toBe(full.total);
    expect(projected.base).toBe(full.base);
    expect(projected.volume).toBe(full.volume);
  });
});
