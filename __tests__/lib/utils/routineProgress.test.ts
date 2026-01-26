/**
 * Tests for routineProgress.ts
 *
 * Tests cover:
 * - calculateRoutineProgress() with 0 sets (returns 0/0, 0%)
 * - calculateRoutineProgress() with partial completion (correct ratio)
 * - calculateRoutineProgress() with 100% completion (1.0 percent)
 * - calculateRoutineProgress() with empty routine (handles gracefully)
 * - calculateExerciseProgress() edge cases (0 target, completed > target)
 * - calculatePlanProgress() with empty plan (returns 0/0, 0%)
 * - calculatePlanProgress() with multiple exercises (sums correctly)
 * - formatProgressPercent() formats correctly (e.g., "67%", "0%")
 *
 * Target: 90%+ coverage
 */

import {
  calculateRoutineProgress,
  calculateExerciseProgress,
  calculatePlanProgress,
  formatProgressPercent,
} from '../../../src/lib/utils/routineProgress';
import type { Routine } from '../../../src/lib/routinesModel';
import type { LoggedSet } from '../../../src/lib/loggerTypes';
import type { WorkoutPlan } from '../../../src/lib/workoutPlanModel';

describe('routineProgress', () => {
  describe('calculateRoutineProgress', () => {
    it('should return 0/0/0% for routine with no target sets', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Empty Routine',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'bench',
            // No target sets
          },
        ],
      };

      const loggedSets: LoggedSet[] = [];

      const result = calculateRoutineProgress(routine, loggedSets);

      expect(result.completed).toBe(0);
      expect(result.total).toBe(0);
      expect(result.percent).toBe(0);
    });

    it('should return 0/0/0% for empty routine', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Empty Routine',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [],
      };

      const loggedSets: LoggedSet[] = [];

      const result = calculateRoutineProgress(routine, loggedSets);

      expect(result.completed).toBe(0);
      expect(result.total).toBe(0);
      expect(result.percent).toBe(0);
    });

    it('should return 0/3/0% for routine with targets but no logged sets', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'bench',
            targetSets: 3,
          },
        ],
      };

      const loggedSets: LoggedSet[] = [];

      const result = calculateRoutineProgress(routine, loggedSets);

      expect(result.completed).toBe(0);
      expect(result.total).toBe(3);
      expect(result.percent).toBe(0);
    });

    it('should count completed sets for matching exercise IDs', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'bench',
            targetSets: 3,
          },
        ],
      };

      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
      ];

      const result = calculateRoutineProgress(routine, loggedSets);

      expect(result.completed).toBe(2);
      expect(result.total).toBe(3);
      expect(result.percent).toBeCloseTo(2 / 3, 5);
    });

    it('should only count sets for exercises in the routine', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'bench',
            targetSets: 3,
          },
          {
            id: 'ex-2',
            exerciseId: 'ohp',
            targetSets: 3,
          },
        ],
      };

      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'squat', // Not in routine
          setType: 'working',
          weightKg: 140,
          reps: 5,
          timestampMs: 1500,
        },
        {
          id: 'set-3',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
        {
          id: 'set-4',
          exerciseId: 'ohp',
          setType: 'working',
          weightKg: 60,
          reps: 8,
          timestampMs: 2500,
        },
      ];

      const result = calculateRoutineProgress(routine, loggedSets);

      expect(result.completed).toBe(3); // bench x2 + ohp x1 (squat not counted)
      expect(result.total).toBe(6); // 3 bench + 3 ohp
      expect(result.percent).toBe(0.5);
    });

    it('should return 100% when all target sets completed', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'bench',
            targetSets: 3,
          },
        ],
      };

      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
        {
          id: 'set-3',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 3000,
        },
      ];

      const result = calculateRoutineProgress(routine, loggedSets);

      expect(result.completed).toBe(3);
      expect(result.total).toBe(3);
      expect(result.percent).toBe(1);
    });

    it('should handle partial completion across multiple exercises', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Push Day',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'bench',
            targetSets: 3,
          },
          {
            id: 'ex-2',
            exerciseId: 'ohp',
            targetSets: 3,
          },
          {
            id: 'ex-3',
            exerciseId: 'row',
            targetSets: 3,
          },
        ],
      };

      // Bench: 2/3, OHP: 3/3, Row: 1/3 = 6/9 = 2/3
      const loggedSets: LoggedSet[] = [
        // Bench sets
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
        // OHP sets
        {
          id: 'set-3',
          exerciseId: 'ohp',
          setType: 'working',
          weightKg: 60,
          reps: 8,
          timestampMs: 3000,
        },
        {
          id: 'set-4',
          exerciseId: 'ohp',
          setType: 'working',
          weightKg: 60,
          reps: 8,
          timestampMs: 4000,
        },
        {
          id: 'set-5',
          exerciseId: 'ohp',
          setType: 'working',
          weightKg: 60,
          reps: 8,
          timestampMs: 5000,
        },
        // Row set
        {
          id: 'set-6',
          exerciseId: 'row',
          setType: 'working',
          weightKg: 80,
          reps: 10,
          timestampMs: 6000,
        },
      ];

      const result = calculateRoutineProgress(routine, loggedSets);

      expect(result.completed).toBe(6);
      expect(result.total).toBe(9);
      expect(result.percent).toBeCloseTo(2 / 3, 5);
    });

    it('should sum target sets correctly when exercises have different targets', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Mixed Volume',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'squat',
            targetSets: 5,
          },
          {
            id: 'ex-2',
            exerciseId: 'bench',
            targetSets: 3,
          },
          {
            id: 'ex-3',
            exerciseId: 'curl',
            targetSets: 2,
          },
        ],
      };

      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'squat',
          setType: 'working',
          weightKg: 140,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
      ];

      const result = calculateRoutineProgress(routine, loggedSets);

      expect(result.total).toBe(10); // 5 + 3 + 2
      expect(result.completed).toBe(2);
      expect(result.percent).toBe(0.2);
    });

    it('should handle routine with exercises that have undefined targetSets', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Partial Targets',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'bench',
            targetSets: 3,
          },
          {
            id: 'ex-2',
            exerciseId: 'ohp',
            // targetSets undefined - should be treated as 0
          },
        ],
      };

      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
      ];

      const result = calculateRoutineProgress(routine, loggedSets);

      expect(result.total).toBe(3); // Only bench has target
      expect(result.completed).toBe(2);
      expect(result.percent).toBeCloseTo(2 / 3, 5);
    });

    it('should allow percent to exceed 1 when more sets logged than targeted', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Overachiever',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'bench',
            targetSets: 3,
          },
        ],
      };

      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
        {
          id: 'set-3',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 3000,
        },
        {
          id: 'set-4',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 4000,
        },
      ];

      const result = calculateRoutineProgress(routine, loggedSets);

      expect(result.completed).toBe(4);
      expect(result.total).toBe(3);
      expect(result.percent).toBeCloseTo(4 / 3, 5); // > 100%
    });
  });

  describe('calculateExerciseProgress', () => {
    it('should return 0/0/0% when targetSets is 0', () => {
      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
      ];

      const result = calculateExerciseProgress('bench', 0, loggedSets);

      expect(result.completed).toBe(1); // Still counts sets
      expect(result.total).toBe(0);
      expect(result.percent).toBe(0); // 0/0 = 0%
    });

    it('should count only sets for the specified exercise', () => {
      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'squat',
          setType: 'working',
          weightKg: 140,
          reps: 5,
          timestampMs: 1500,
        },
        {
          id: 'set-3',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
        {
          id: 'set-4',
          exerciseId: 'ohp',
          setType: 'working',
          weightKg: 60,
          reps: 8,
          timestampMs: 2500,
        },
      ];

      const result = calculateExerciseProgress('bench', 3, loggedSets);

      expect(result.completed).toBe(2);
      expect(result.total).toBe(3);
      expect(result.percent).toBeCloseTo(2 / 3, 5);
    });

    it('should cap percent at 1.0 when completed exceeds target', () => {
      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
        {
          id: 'set-3',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 3000,
        },
        {
          id: 'set-4',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 4000,
        },
        {
          id: 'set-5',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 5000,
        },
      ];

      const result = calculateExerciseProgress('bench', 3, loggedSets);

      expect(result.completed).toBe(5);
      expect(result.total).toBe(3);
      expect(result.percent).toBe(1); // Capped at 100%
    });

    it('should return 0/0/0% for empty logged sets', () => {
      const loggedSets: LoggedSet[] = [];

      const result = calculateExerciseProgress('bench', 3, loggedSets);

      expect(result.completed).toBe(0);
      expect(result.total).toBe(3);
      expect(result.percent).toBe(0);
    });

    it('should handle partial completion', () => {
      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
      ];

      const result = calculateExerciseProgress('bench', 4, loggedSets);

      expect(result.completed).toBe(1);
      expect(result.total).toBe(4);
      expect(result.percent).toBe(0.25);
    });

    it('should return 100% for exact completion', () => {
      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
        {
          id: 'set-3',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 3000,
        },
      ];

      const result = calculateExerciseProgress('bench', 3, loggedSets);

      expect(result.completed).toBe(3);
      expect(result.total).toBe(3);
      expect(result.percent).toBe(1);
    });

    it('should count warmup sets along with working sets', () => {
      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'warmup',
          weightKg: 60,
          reps: 10,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
        {
          id: 'set-3',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 3000,
        },
      ];

      const result = calculateExerciseProgress('bench', 3, loggedSets);

      expect(result.completed).toBe(3); // All sets counted
      expect(result.total).toBe(3);
      expect(result.percent).toBe(1);
    });
  });

  describe('calculatePlanProgress', () => {
    it('should return 0/0/0% for null plan', () => {
      const loggedSets: LoggedSet[] = [];

      const result = calculatePlanProgress(null, loggedSets);

      expect(result.completed).toBe(0);
      expect(result.total).toBe(0);
      expect(result.percent).toBe(0);
    });

    it('should return 0/0/0% for plan with empty exercises', () => {
      const plan: WorkoutPlan = {
        id: 'plan-1',
        createdAtMs: 1000,
        exercises: [],
        currentExerciseIndex: 0,
        completedSetsByExerciseId: {},
      };

      const loggedSets: LoggedSet[] = [];

      const result = calculatePlanProgress(plan, loggedSets);

      expect(result.completed).toBe(0);
      expect(result.total).toBe(0);
      expect(result.percent).toBe(0);
    });

    it('should calculate progress for plan with one exercise', () => {
      const plan: WorkoutPlan = {
        id: 'plan-1',
        createdAtMs: 1000,
        exercises: [
          {
            exerciseId: 'bench',
            targetSets: 3,
          },
        ],
        currentExerciseIndex: 0,
        completedSetsByExerciseId: {},
      };

      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
      ];

      const result = calculatePlanProgress(plan, loggedSets);

      expect(result.completed).toBe(2);
      expect(result.total).toBe(3);
      expect(result.percent).toBeCloseTo(2 / 3, 5);
    });

    it('should calculate progress for plan with multiple exercises', () => {
      const plan: WorkoutPlan = {
        id: 'plan-1',
        createdAtMs: 1000,
        exercises: [
          {
            exerciseId: 'bench',
            targetSets: 3,
          },
          {
            exerciseId: 'squat',
            targetSets: 4,
          },
          {
            exerciseId: 'ohp',
            targetSets: 2,
          },
        ],
        currentExerciseIndex: 0,
        completedSetsByExerciseId: {},
      };

      const loggedSets: LoggedSet[] = [
        // Bench: 2 sets
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
        // Squat: 3 sets
        {
          id: 'set-3',
          exerciseId: 'squat',
          setType: 'working',
          weightKg: 140,
          reps: 5,
          timestampMs: 3000,
        },
        {
          id: 'set-4',
          exerciseId: 'squat',
          setType: 'working',
          weightKg: 140,
          reps: 5,
          timestampMs: 4000,
        },
        {
          id: 'set-5',
          exerciseId: 'squat',
          setType: 'working',
          weightKg: 140,
          reps: 5,
          timestampMs: 5000,
        },
        // OHP: 0 sets
      ];

      const result = calculatePlanProgress(plan, loggedSets);

      expect(result.completed).toBe(5);
      expect(result.total).toBe(9); // 3 + 4 + 2
      expect(result.percent).toBeCloseTo(5 / 9, 5);
    });

    it('should only count sets for exercises in the plan', () => {
      const plan: WorkoutPlan = {
        id: 'plan-1',
        createdAtMs: 1000,
        exercises: [
          {
            exerciseId: 'bench',
            targetSets: 3,
          },
        ],
        currentExerciseIndex: 0,
        completedSetsByExerciseId: {},
      };

      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'squat', // Not in plan
          setType: 'working',
          weightKg: 140,
          reps: 5,
          timestampMs: 1500,
        },
        {
          id: 'set-3',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
      ];

      const result = calculatePlanProgress(plan, loggedSets);

      expect(result.completed).toBe(2); // Only bench sets counted
      expect(result.total).toBe(3);
      expect(result.percent).toBeCloseTo(2 / 3, 5);
    });

    it('should return 100% when all plan exercises completed', () => {
      const plan: WorkoutPlan = {
        id: 'plan-1',
        createdAtMs: 1000,
        exercises: [
          {
            exerciseId: 'bench',
            targetSets: 3,
          },
          {
            exerciseId: 'ohp',
            targetSets: 2,
          },
        ],
        currentExerciseIndex: 0,
        completedSetsByExerciseId: {},
      };

      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
        {
          id: 'set-3',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 3000,
        },
        {
          id: 'set-4',
          exerciseId: 'ohp',
          setType: 'working',
          weightKg: 60,
          reps: 8,
          timestampMs: 4000,
        },
        {
          id: 'set-5',
          exerciseId: 'ohp',
          setType: 'working',
          weightKg: 60,
          reps: 8,
          timestampMs: 5000,
        },
      ];

      const result = calculatePlanProgress(plan, loggedSets);

      expect(result.completed).toBe(5);
      expect(result.total).toBe(5);
      expect(result.percent).toBe(1);
    });

    it('should allow percent to exceed 1 when more sets logged than targeted', () => {
      const plan: WorkoutPlan = {
        id: 'plan-1',
        createdAtMs: 1000,
        exercises: [
          {
            exerciseId: 'bench',
            targetSets: 3,
          },
        ],
        currentExerciseIndex: 0,
        completedSetsByExerciseId: {},
      };

      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 2000,
        },
        {
          id: 'set-3',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 3000,
        },
        {
          id: 'set-4',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 4000,
        },
      ];

      const result = calculatePlanProgress(plan, loggedSets);

      expect(result.completed).toBe(4);
      expect(result.total).toBe(3);
      expect(result.percent).toBeCloseTo(4 / 3, 5); // > 100%
    });

    it('should handle plan with exercises that have targetSets of 0', () => {
      const plan: WorkoutPlan = {
        id: 'plan-1',
        createdAtMs: 1000,
        exercises: [
          {
            exerciseId: 'bench',
            targetSets: 0,
          },
        ],
        currentExerciseIndex: 0,
        completedSetsByExerciseId: {},
      };

      const loggedSets: LoggedSet[] = [
        {
          id: 'set-1',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 1000,
        },
      ];

      const result = calculatePlanProgress(plan, loggedSets);

      expect(result.completed).toBe(1);
      expect(result.total).toBe(0);
      expect(result.percent).toBe(0); // 0 total = 0%
    });
  });

  describe('formatProgressPercent', () => {
    it('should format 0 as "0%"', () => {
      expect(formatProgressPercent(0)).toBe('0%');
    });

    it('should format 0.5 as "50%"', () => {
      expect(formatProgressPercent(0.5)).toBe('50%');
    });

    it('should format 1 as "100%"', () => {
      expect(formatProgressPercent(1)).toBe('100%');
    });

    it('should format 0.666... as "67%" (rounded)', () => {
      expect(formatProgressPercent(2 / 3)).toBe('67%');
    });

    it('should format 0.333... as "33%" (rounded)', () => {
      expect(formatProgressPercent(1 / 3)).toBe('33%');
    });

    it('should format small percentages', () => {
      expect(formatProgressPercent(0.01)).toBe('1%');
      expect(formatProgressPercent(0.001)).toBe('0%');
    });

    it('should format values above 100%', () => {
      expect(formatProgressPercent(1.5)).toBe('150%');
      expect(formatProgressPercent(2)).toBe('200%');
    });

    it('should round correctly at threshold values', () => {
      expect(formatProgressPercent(0.0049)).toBe('0%'); // Rounds down
      expect(formatProgressPercent(0.005)).toBe('1%'); // Rounds up
      expect(formatProgressPercent(0.9949)).toBe('99%'); // Rounds down
      expect(formatProgressPercent(0.995)).toBe('100%'); // Rounds up
    });

    it('should handle negative values by returning them (no clamping)', () => {
      // The function uses Math.round() which preserves sign
      expect(formatProgressPercent(-0.1)).toBe('-10%');
      expect(formatProgressPercent(-1)).toBe('-100%');
    });

    it('should format common workout progress values', () => {
      expect(formatProgressPercent(0.25)).toBe('25%');
      expect(formatProgressPercent(0.75)).toBe('75%');
      expect(formatProgressPercent(0.8)).toBe('80%');
      expect(formatProgressPercent(0.85)).toBe('85%');
    });
  });

  describe('Integration: Complete workflow', () => {
    it('should calculate routine progress correctly through a workout', () => {
      const routine: Routine = {
        id: 'routine-1',
        name: 'Full Body',
        createdAtMs: 1000,
        updatedAtMs: 1000,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'squat',
            targetSets: 3,
          },
          {
            id: 'ex-2',
            exerciseId: 'bench',
            targetSets: 3,
          },
          {
            id: 'ex-3',
            exerciseId: 'row',
            targetSets: 3,
          },
        ],
      };

      const loggedSets: LoggedSet[] = [];

      // Start: 0/9, 0%
      let progress = calculateRoutineProgress(routine, loggedSets);
      expect(progress.completed).toBe(0);
      expect(progress.total).toBe(9);
      expect(formatProgressPercent(progress.percent)).toBe('0%');

      // After squat: 3/9, 33%
      loggedSets.push(
        {
          id: 'set-1',
          exerciseId: 'squat',
          setType: 'working',
          weightKg: 140,
          reps: 5,
          timestampMs: 1000,
        },
        {
          id: 'set-2',
          exerciseId: 'squat',
          setType: 'working',
          weightKg: 140,
          reps: 5,
          timestampMs: 2000,
        },
        {
          id: 'set-3',
          exerciseId: 'squat',
          setType: 'working',
          weightKg: 140,
          reps: 5,
          timestampMs: 3000,
        }
      );

      progress = calculateRoutineProgress(routine, loggedSets);
      expect(progress.completed).toBe(3);
      expect(formatProgressPercent(progress.percent)).toBe('33%');

      // After bench: 6/9, 67%
      loggedSets.push(
        {
          id: 'set-4',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 4000,
        },
        {
          id: 'set-5',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 5000,
        },
        {
          id: 'set-6',
          exerciseId: 'bench',
          setType: 'working',
          weightKg: 100,
          reps: 5,
          timestampMs: 6000,
        }
      );

      progress = calculateRoutineProgress(routine, loggedSets);
      expect(progress.completed).toBe(6);
      expect(formatProgressPercent(progress.percent)).toBe('67%');

      // After row: 9/9, 100%
      loggedSets.push(
        {
          id: 'set-7',
          exerciseId: 'row',
          setType: 'working',
          weightKg: 80,
          reps: 10,
          timestampMs: 7000,
        },
        {
          id: 'set-8',
          exerciseId: 'row',
          setType: 'working',
          weightKg: 80,
          reps: 10,
          timestampMs: 8000,
        },
        {
          id: 'set-9',
          exerciseId: 'row',
          setType: 'working',
          weightKg: 80,
          reps: 10,
          timestampMs: 9000,
        }
      );

      progress = calculateRoutineProgress(routine, loggedSets);
      expect(progress.completed).toBe(9);
      expect(formatProgressPercent(progress.percent)).toBe('100%');
    });
  });
});
