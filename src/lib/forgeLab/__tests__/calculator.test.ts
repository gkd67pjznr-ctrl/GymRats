/**
 * Tests for Forge Lab Calculator
 */
import { calculateE1RMHistory, calculateVolumeHistory, calculateRankHistory, calculateMuscleGroupVolume } from '../calculator';
import { WorkoutSession, WorkoutSet } from '@/src/lib/workoutModel';

describe('Forge Lab Calculator', () => {
  // Mock workout data
  const mockSessions: WorkoutSession[] = [
    {
      id: 'session1',
      startedAtMs: new Date('2026-01-15').getTime(),
      endedAtMs: new Date('2026-01-15').getTime() + 3600000,
      sets: [
        {
          id: 'set1',
          exerciseId: 'bench',
          weightKg: 80,
          reps: 5,
          timestampMs: new Date('2026-01-15').getTime()
        },
        {
          id: 'set2',
          exerciseId: 'bench',
          weightKg: 85,
          reps: 3,
          timestampMs: new Date('2026-01-15').getTime() + 300000
        }
      ]
    },
    {
      id: 'session2',
      startedAtMs: new Date('2026-01-22').getTime(),
      endedAtMs: new Date('2026-01-22').getTime() + 3600000,
      sets: [
        {
          id: 'set3',
          exerciseId: 'bench',
          weightKg: 90,
          reps: 2,
          timestampMs: new Date('2026-01-22').getTime()
        }
      ]
    }
  ];

  describe('calculateE1RMHistory', () => {
    it('should calculate e1RM history for an exercise', () => {
      const result = calculateE1RMHistory(mockSessions, 'bench');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: '2026-01-15',
        e1rm: 93.5 // 85 * (1 + 3/30) = 85 * 1.1 = 93.5
      });
      expect(result[1]).toEqual({
        date: '2026-01-22',
        e1rm: 96 // 90 * (1 + 2/30) = 90 * 1.067 = 96
      });
    });

    it('should return empty array for exercise with no sets', () => {
      const result = calculateE1RMHistory(mockSessions, 'squat');
      expect(result).toHaveLength(0);
    });
  });

  describe('calculateVolumeHistory', () => {
    it('should calculate volume history for an exercise', () => {
      const result = calculateVolumeHistory(mockSessions, 'bench');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        week: '2026-W03', // 2026-01-15 is in week 3 of 2026
        volume: 655 // 80*5 + 85*3 = 400 + 255 = 655
      });
      expect(result[1]).toEqual({
        week: '2026-W04', // 2026-01-22 is in week 4 of 2026
        volume: 180 // 90*2 = 180
      });
    });
  });

  describe('calculateRankHistory', () => {
    it('should calculate rank history for an exercise', () => {
      const result = calculateRankHistory(mockSessions, 'bench', 70); // 70kg bodyweight

      // We can't test exact values without the full ranking system,
      // but we can test that it returns the right structure
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('rank');
      expect(result[0]).toHaveProperty('score');
    });
  });

  describe('calculateMuscleGroupVolume', () => {
    it('should calculate muscle group volume distribution', () => {
      const result = calculateMuscleGroupVolume(mockSessions, '3M');

      expect(result).toHaveLength(2); // Two weeks of data
      expect(result[0]).toHaveProperty('period');
      expect(result[0]).toHaveProperty('groups');
    });
  });
});