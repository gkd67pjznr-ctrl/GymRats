import { calculateForgeDNA, processWorkoutHistory } from '../../../src/lib/forgeDNA/calculator';
import type { WorkoutSession, WorkoutSet } from '../../../src/lib/workoutModel';
import type { ForgeDNAInput } from '../../../src/lib/forgeDNA/types';

// Mock the exercise database
jest.mock('../../../src/data/exerciseDatabase', () => ({
  getExerciseById: (id: string) => {
    const exercises: Record<string, any> = {
      'Barbell_Bench_Press_-_Medium_Grip': {
        id: 'Barbell_Bench_Press_-_Medium_Grip',
        name: 'Bench Press',
        primaryMuscles: ['chest', 'shoulders', 'triceps'],
        secondaryMuscles: ['forearms'],
        mechanic: 'compound'
      },
      'Barbell_Full_Squat': {
        id: 'Barbell_Full_Squat',
        name: 'Squat',
        primaryMuscles: ['quadriceps', 'glutes'],
        secondaryMuscles: ['hamstrings', 'calves'],
        mechanic: 'compound'
      },
      'Barbell_Deadlift': {
        id: 'Barbell_Deadlift',
        name: 'Deadlift',
        primaryMuscles: ['glutes', 'hamstrings'],
        secondaryMuscles: ['quadriceps', 'lower back'],
        mechanic: 'compound'
      }
    };
    return exercises[id];
  }
}));

describe('ForgeDNA Calculator', () => {
  describe('calculateForgeDNA', () => {
    it('should return null when there are fewer than 5 workouts', () => {
      const input: ForgeDNAInput = {
        workoutHistory: [], // Empty workout history
        exerciseStats: [],
        muscleGroupVolume: {} as any,
        trainingDays: 0
      };

      const result = calculateForgeDNA(input, 'user123');
      expect(result).toBeNull();
    });

    it('should generate DNA when there are sufficient workouts', () => {
      const mockWorkouts: WorkoutSession[] = [];
      for (let i = 0; i < 5; i++) {
        mockWorkouts.push({
          id: `workout${i}`,
          userId: 'user123',
          startedAtMs: Date.now() - (i * 86400000), // 1 day apart
          endedAtMs: Date.now() - (i * 86400000) + 3600000, // 1 hour duration
          sets: [
            {
              id: `set${i}a`,
              exerciseId: 'Barbell_Bench_Press_-_Medium_Grip',
              weightKg: 80,
              reps: 5,
              timestampMs: Date.now() - (i * 86400000) + 1000
            },
            {
              id: `set${i}b`,
              exerciseId: 'Barbell_Full_Squat',
              weightKg: 100,
              reps: 8,
              timestampMs: Date.now() - (i * 86400000) + 2000
            }
          ]
        });
      }

      const input = processWorkoutHistory(mockWorkouts);
      const result = calculateForgeDNA(input, 'user123');

      expect(result).not.toBeNull();
      expect(result?.userId).toBe('user123');
      expect(result?.generatedAt).toBeDefined();
      expect(result?.muscleBalance).toBeDefined();
      expect(result?.trainingStyle).toBeDefined();
      expect(result?.topExercises).toBeDefined();
      expect(result?.liftPreferences).toBeDefined();
      expect(result?.totalDataPoints).toBe(5);
    });

    it('should calculate muscle balance correctly', () => {
      // Create 5 workouts to meet minimum requirement
      const mockWorkouts: WorkoutSession[] = [];
      for (let i = 0; i < 5; i++) {
        mockWorkouts.push({
          id: `workout${i}`,
          userId: 'user123',
          startedAtMs: Date.now() - (i * 86400000),
          endedAtMs: Date.now() - (i * 86400000) + 3600000,
          sets: [
            {
              id: `set${i}`,
              exerciseId: 'Barbell_Bench_Press_-_Medium_Grip',
              weightKg: 80,
              reps: 5,
              timestampMs: Date.now() - (i * 86400000) + 1000
            }
          ]
        });
      }

      const input = processWorkoutHistory(mockWorkouts);
      const result = calculateForgeDNA(input, 'user123');

      expect(result).not.toBeNull();
      // Chest should have high volume due to bench press
      expect(result?.muscleBalance['chest']).toBeGreaterThan(0);
      // Should have balanced distribution for other muscles
      expect(Object.keys(result?.muscleBalance || {})).toHaveLength(17); // All muscle groups
    });
  });

  describe('processWorkoutHistory', () => {
    it('should process workout history into ForgeDNAInput format', () => {
      const mockWorkouts: WorkoutSession[] = [
        {
          id: 'workout1',
          userId: 'user123',
          startedAtMs: Date.now(),
          endedAtMs: Date.now() + 3600000,
          sets: [
            {
              id: 'set1',
              exerciseId: 'Barbell_Bench_Press_-_Medium_Grip',
              weightKg: 80,
              reps: 5,
              timestampMs: Date.now() + 1000
            },
            {
              id: 'set2',
              exerciseId: 'Barbell_Full_Squat',
              weightKg: 100,
              reps: 8,
              timestampMs: Date.now() + 2000
            }
          ]
        }
      ];

      const result = processWorkoutHistory(mockWorkouts);

      expect(result.workoutHistory).toHaveLength(1);
      expect(result.exerciseStats).toHaveLength(2);
      expect(result.trainingDays).toBe(1);
      expect(Object.keys(result.muscleGroupVolume)).toHaveLength(17); // All muscle groups
    });

    it('should handle empty workout history', () => {
      const result = processWorkoutHistory([]);

      expect(result.workoutHistory).toHaveLength(0);
      expect(result.exerciseStats).toHaveLength(0);
      expect(result.trainingDays).toBe(0);
      expect(Object.keys(result.muscleGroupVolume)).toHaveLength(17); // All muscle groups initialized to 0
    });
  });
});