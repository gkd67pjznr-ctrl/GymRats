import { calculateMuscleVolumes } from '../volumeCalculator';
import { WorkoutSession } from '../workoutModel';

describe('calculateMuscleVolumes', () => {
  it('should return empty object for no sessions', () => {
    expect(calculateMuscleVolumes([])).toEqual({});
  });

  it('should calculate volumes for a single session', () => {
    const sessions: WorkoutSession[] = [
      {
        id: 's1',
        userId: 'u1',
        startedAtMs: 0,
        endedAtMs: 0,
        sets: [
          { id: 'set1', exerciseId: 'bench', weightKg: 100, reps: 10, timestampMs: 0 },
          { id: 'set2', exerciseId: 'squat', weightKg: 150, reps: 8, timestampMs: 0 },
        ],
      },
    ];

    const volumes = calculateMuscleVolumes(sessions);

    // bench: 1000 volume -> chest (1000), shoulders_front (500), triceps (500)
    // squat: 1200 volume -> quads (1200), glutes (1200), hamstrings (600), lower_back (600), adductors (600)

    // Total volumes:
    // chest: 1000
    // shoulders_front: 500
    // triceps: 500
    // quads: 1200
    // glutes: 1200
    // hamstrings: 600
    // lower_back: 600
    // adductors: 600

    // Max volume is 1200 (quads, glutes)
    expect(volumes.chest).toBeCloseTo(1000 / 1200);
    expect(volumes.shoulders_front).toBeCloseTo(500 / 1200);
    expect(volumes.triceps).toBeCloseTo(500 / 1200);
    expect(volumes.quads).toBe(1);
    expect(volumes.glutes).toBe(1);
    expect(volumes.hamstrings).toBeCloseTo(600 / 1200);
    expect(volumes.lower_back).toBeCloseTo(600 / 1200);
    expect(volumes.adductors).toBeCloseTo(600 / 1200);
  });
});
