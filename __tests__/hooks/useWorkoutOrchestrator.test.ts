/**
 * Tests for useWorkoutOrchestrator.ts
 *
 * Tests cover:
 * - addSetForExercise() adds set correctly
 * - addSetForExercise() triggers PR detection (verify detectCueForWorkingSet called)
 * - finishWorkout() creates WorkoutSession with routine linkage
 * - finishWorkout() populates routineId and routineName from plan
 * - finishWorkout() calculates completionPct correctly
 * - saveAsRoutine() creates new routine from session sets
 * - saveAsRoutine() saves to routinesStore
 *
 * Target: 80%+ coverage
 */

import { renderHook, act } from '@testing-library/react-native';
import { useWorkoutOrchestrator } from '../../src/lib/hooks/useWorkoutOrchestrator';
import { detectCueForWorkingSet, makeEmptyExerciseState } from '../../src/lib/perSetCue';
import type { LoggedSet } from '../../src/lib/loggerTypes';
import type { WorkoutPlan } from '../../src/lib/workoutPlanModel';
import { useCurrentSessionStore, useRoutinesStore } from '../../src/lib/stores';

// Mock the perSetCue module
jest.mock('../../src/lib/perSetCue', () => ({
  detectCueForWorkingSet: jest.fn(),
  makeEmptyExerciseState: jest.fn(() => ({
    bestWeightKg: 0,
    bestE1RMKg: 0,
    bestRepsAtWeight: {},
  })),
  pickPunchyVariant: jest.fn((type) => `${type.toUpperCase()} PR!`),
  randomFallbackCue: jest.fn(() => ({ message: 'Keep pushing!', intensity: 'low' })),
  randomFallbackEveryN: jest.fn(() => 3),
}));

// Mock the simpleSession module
jest.mock('../../src/lib/simpleSession', () => ({
  groupSetsByExercise: jest.fn((sets) => {
    const grouped: Record<string, LoggedSet[]> = {};
    for (const s of sets) {
      (grouped[s.exerciseId] ||= []).push(s);
    }
    return grouped;
  }),
  generateCuesForExerciseSession: jest.fn(() => []),
}));

// Mock the workoutModel module
jest.mock('../../src/lib/workoutModel', () => ({
  uid: jest.fn(() => 'test-uid-' + Math.random().toString(36).substr(2, 9)),
  formatDuration: jest.fn((ms) => `${Math.floor(ms / 60000)}m`),
}));

// Mock the workoutPlanStore
jest.mock('../../src/lib/workoutPlanStore', () => ({
  setCurrentPlan: jest.fn(),
}));

// Mock EXERCISES_V1
jest.mock('../../src/data/exercises', () => ({
  EXERCISES_V1: [
    { id: 'bench', name: 'Bench Press' },
    { id: 'squat', name: 'Squat' },
    { id: 'deadlift', name: 'Deadlift' },
    { id: 'ohp', name: 'Overhead Press' },
  ],
}));

// Mock stores
const mockAddWorkoutSession = jest.fn();
const mockClearCurrentSession = jest.fn();
const mockEnsureCurrentSession = jest.fn();
const mockUpsertRoutine = jest.fn();

jest.mock('../../src/lib/stores', () => ({
  useCurrentSessionStore: jest.fn(),
  useIsHydrated: jest.fn(() => true),
  upsertRoutine: jest.fn(() => mockUpsertRoutine()),
  addWorkoutSession: jest.fn(() => mockAddWorkoutSession()),
  clearCurrentSession: jest.fn(() => mockClearCurrentSession()),
  ensureCurrentSession: jest.fn(() => mockEnsureCurrentSession()),
}));

describe('useWorkoutOrchestrator', () => {
  const mockOnHaptic = jest.fn();
  const mockOnSound = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useCurrentSessionStore to return a default state
    (useCurrentSessionStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        id: 'session-1',
        startedAtMs: 1000000,
        selectedExerciseId: 'bench',
        exerciseBlocks: ['bench'],
        sets: [] as LoggedSet[],
      };
      return selector ? selector(state) : state;
    });

    // Mock useRoutinesStore to return a default state
    (useRoutinesStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        routines: [],
        hydrated: true,
        upsertRoutine: mockUpsertRoutine,
        deleteRoutine: jest.fn(),
        clearRoutines: jest.fn(),
        setHydrated: jest.fn(),
      };
      return selector ? selector(state) : state;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should return initial state when not hydrated', () => {
      // Mock not hydrated
      (require('../../src/lib/stores').useIsHydrated as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
          onHaptic: mockOnHaptic,
          onSound: mockOnSound,
        })
      );

      expect(result.current.instantCue).toBeNull();
      expect(result.current.recapCues).toEqual([]);
      expect(result.current.sessionStateByExercise).toEqual({});
    });

    it('should return initial state when hydrated', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      expect(result.current.instantCue).toBeNull();
      expect(result.current.recapCues).toEqual([]);
      expect(result.current.sessionStateByExercise).toEqual({});
      expect(typeof result.current.addSetForExercise).toBe('function');
      expect(typeof result.current.finishWorkout).toBe('function');
      expect(typeof result.current.saveAsRoutine).toBe('function');
    });
  });

  describe('addSetForExercise', () => {
    it('should be no-op when not hydrated', () => {
      (require('../../src/lib/stores').useIsHydrated as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.addSetForExercise('bench', 135, 5);
      });

      expect(detectCueForWorkingSet).not.toHaveBeenCalled();
    });

    it('should call detectCueForWorkingSet with correct parameters', () => {
      const mockNextState = {
        bestWeightKg: 61.2, // ~135 lb
        bestE1RMKg: 73.5,
        bestRepsAtWeight: { '135': 5 },
      };

      (detectCueForWorkingSet as jest.Mock).mockReturnValue({
        cue: {
          message: 'Weight PR!',
          intensity: 'high' as const,
          detail: '135 lb',
        },
        next: mockNextState,
        meta: {
          type: 'weight',
          weightLabel: '135 lb',
          isCardio: false,
        },
      });

      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
          onHaptic: mockOnHaptic,
          onSound: mockOnSound,
        })
      );

      act(() => {
        result.current.addSetForExercise('bench', 135, 5);
      });

      expect(detectCueForWorkingSet).toHaveBeenCalledWith({
        weightKg: expect.any(Number), // Converted from lb to kg
        reps: 5,
        unit: 'lb',
        exerciseName: 'Bench Press',
        prev: expect.any(Object),
      });
    });

    it('should trigger haptic and sound on PR detection', () => {
      (detectCueForWorkingSet as jest.Mock).mockReturnValue({
        cue: {
          message: 'Weight PR!',
          intensity: 'high' as const,
          detail: '135 lb',
        },
        next: {
          bestWeightKg: 61.2,
          bestE1RMKg: 73.5,
          bestRepsAtWeight: {},
        },
        meta: {
          type: 'weight',
          weightLabel: '135 lb',
          isCardio: false,
        },
      });

      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
          onHaptic: mockOnHaptic,
          onSound: mockOnSound,
        })
      );

      act(() => {
        result.current.addSetForExercise('bench', 135, 5);
      });

      expect(mockOnHaptic).toHaveBeenCalledWith('pr');
      expect(mockOnSound).toHaveBeenCalledWith('pr');
    });

    it('should set instantCue with PR details', () => {
      (detectCueForWorkingSet as jest.Mock).mockReturnValue({
        cue: {
          message: 'Rep PR!',
          intensity: 'high' as const,
          detail: '135 lb x 8 reps',
        },
        next: {
          bestWeightKg: 61.2,
          bestE1RMKg: 73.5,
          bestRepsAtWeight: { '135': 8 },
        },
        meta: {
          type: 'rep',
          weightLabel: '135 lb x 8 reps',
          isCardio: false,
        },
      });

      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.addSetForExercise('bench', 135, 8);
      });

      expect(result.current.instantCue).toEqual({
        message: 'REP PR!',
        detail: '135 lb x 8 reps',
        intensity: 'high',
      });
    });

    it('should trigger fallback cue when no PR detected', () => {
      (detectCueForWorkingSet as jest.Mock).mockReturnValue({
        cue: null,
        next: {
          bestWeightKg: 61.2,
          bestE1RMKg: 73.5,
          bestRepsAtWeight: {},
        },
        meta: {
          type: 'none',
          weightLabel: '135 lb',
          isCardio: false,
        },
      });

      const { require } = require('../../src/lib/perSetCue');
      const randomFallbackEveryNMock = require('../../src/lib/perSetCue').randomFallbackEveryN;
      randomFallbackEveryNMock.mockReturnValue(1); // Trigger on first set

      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
          onHaptic: mockOnHaptic,
          onSound: mockOnSound,
        })
      );

      act(() => {
        result.current.addSetForExercise('bench', 135, 5);
      });

      expect(mockOnHaptic).toHaveBeenCalledWith('light');
      expect(mockOnSound).toHaveBeenCalledWith('light');
    });

    it('should update sessionStateByExercise after PR', () => {
      const mockNextState = {
        bestWeightKg: 61.2,
        bestE1RMKg: 73.5,
        bestRepsAtWeight: { '135': 5 },
      };

      (detectCueForWorkingSet as jest.Mock).mockReturnValue({
        cue: {
          message: 'Weight PR!',
          intensity: 'high' as const,
          detail: '135 lb',
        },
        next: mockNextState,
        meta: {
          type: 'weight',
          weightLabel: '135 lb',
          isCardio: false,
        },
      });

      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.addSetForExercise('bench', 135, 5);
      });

      expect(result.current.sessionStateByExercise['bench']).toEqual(mockNextState);
    });
  });

  describe('finishWorkout', () => {
    const mockPlan: WorkoutPlan = {
      id: 'plan-1',
      createdAtMs: 1000000,
      routineId: 'routine-1',
      routineName: 'Push Day',
      exercises: [
        {
          exerciseId: 'bench',
          targetSets: 3,
          targetRepsMin: 6,
          targetRepsMax: 10,
        },
        {
          exerciseId: 'ohp',
          targetSets: 3,
          targetRepsMin: 8,
          targetRepsMax: 12,
        },
      ],
      currentExerciseIndex: 0,
      completedSetsByExerciseId: {},
    };

    const mockLoggedSets: LoggedSet[] = [
      {
        id: 'set-1',
        exerciseId: 'bench',
        setType: 'working',
        weightKg: 60,
        reps: 5,
        timestampMs: 1100000,
      },
      {
        id: 'set-2',
        exerciseId: 'bench',
        setType: 'working',
        weightKg: 60,
        reps: 5,
        timestampMs: 1200000,
      },
    ];

    beforeEach(() => {
      // Mock current session with sets
      (useCurrentSessionStore as jest.Mock).mockImplementation((selector) => {
        const state = {
          id: 'session-1',
          startedAtMs: 1000000,
          selectedExerciseId: 'bench',
          exerciseBlocks: ['bench'],
          sets: mockLoggedSets,
        };
        return selector ? selector(state) : state;
      });
    });

    it('should be no-op when not hydrated', () => {
      (require('../../src/lib/stores').useIsHydrated as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: mockPlan,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.finishWorkout();
      });

      expect(mockAddWorkoutSession).not.toHaveBeenCalled();
      expect(mockClearCurrentSession).not.toHaveBeenCalled();
    });

    it('should create WorkoutSession with routine linkage from plan', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: mockPlan,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.finishWorkout();
      });

      expect(mockAddWorkoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          routineId: 'routine-1',
          routineName: 'Push Day',
          planId: 'plan-1',
        })
      );
    });

    it('should create WorkoutSession without routine linkage when plan has no routine', () => {
      const planWithoutRoutine: WorkoutPlan = {
        id: 'plan-2',
        createdAtMs: 1000000,
        exercises: [
          {
            exerciseId: 'squat',
            targetSets: 3,
          },
        ],
        currentExerciseIndex: 0,
        completedSetsByExerciseId: {},
      };

      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: planWithoutRoutine,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.finishWorkout();
      });

      expect(mockAddWorkoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          routineId: undefined,
          routineName: undefined,
          planId: 'plan-2',
        })
      );
    });

    it('should convert LoggedSet to WorkoutSet correctly', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: mockPlan,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.finishWorkout();
      });

      const sessionArg = mockAddWorkoutSession.mock.calls[0][0];
      expect(sessionArg.sets).toHaveLength(2);
      expect(sessionArg.sets[0]).toMatchObject({
        exerciseId: 'bench',
        reps: 5,
        weightKg: 60,
        timestampMs: 1100000,
      });
    });

    it('should include plannedExercises from plan', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: mockPlan,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.finishWorkout();
      });

      const sessionArg = mockAddWorkoutSession.mock.calls[0][0];
      expect(sessionArg.plannedExercises).toEqual([
        {
          exerciseId: 'bench',
          targetSets: 3,
          targetRepsMin: 6,
          targetRepsMax: 10,
        },
        {
          exerciseId: 'ohp',
          targetSets: 3,
          targetRepsMin: 8,
          targetRepsMax: 12,
        },
      ]);
    });

    it('should set completionPct to undefined initially', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: mockPlan,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.finishWorkout();
      });

      const sessionArg = mockAddWorkoutSession.mock.calls[0][0];
      expect(sessionArg.completionPct).toBeUndefined();
    });

    it('should clear current session after saving', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: mockPlan,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.finishWorkout();
      });

      expect(mockClearCurrentSession).toHaveBeenCalled();
    });

    it('should set instantCue with workout saved message', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: mockPlan,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.finishWorkout();
      });

      expect(result.current.instantCue).toMatchObject({
        message: 'Workout saved.',
        intensity: 'low',
      });
      expect(result.current.instantCue?.detail).toContain('Duration:');
    });

    it('should trigger haptic and sound on finish', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: mockPlan,
          unit: 'lb',
          onHaptic: mockOnHaptic,
          onSound: mockOnSound,
        })
      );

      act(() => {
        result.current.finishWorkout();
      });

      expect(mockOnHaptic).toHaveBeenCalledWith('light');
      expect(mockOnSound).toHaveBeenCalledWith('light');
    });

    it('should generate recap cues', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: mockPlan,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.finishWorkout();
      });

      expect(result.current.recapCues).toBeDefined();
      expect(Array.isArray(result.current.recapCues)).toBe(true);
    });
  });

  describe('saveAsRoutine', () => {
    const mockPlan: WorkoutPlan = {
      id: 'plan-1',
      createdAtMs: 1000000,
      routineId: 'routine-1',
      routineName: 'Original Push Day',
      exercises: [
        {
          exerciseId: 'bench',
          targetSets: 3,
          targetRepsMin: 6,
          targetRepsMax: 10,
        },
      ],
      currentExerciseIndex: 0,
      completedSetsByExerciseId: {},
    };

    const mockLoggedSets: LoggedSet[] = [
      {
        id: 'set-1',
        exerciseId: 'bench',
        setType: 'working',
        weightKg: 60,
        reps: 5,
        timestampMs: 1100000,
      },
      {
        id: 'set-2',
        exerciseId: 'ohp',
        setType: 'working',
        weightKg: 40,
        reps: 8,
        timestampMs: 1200000,
      },
    ];

    beforeEach(() => {
      (useCurrentSessionStore as jest.Mock).mockImplementation((selector) => {
        const state = {
          id: 'session-1',
          startedAtMs: 1000000,
          selectedExerciseId: 'bench',
          exerciseBlocks: ['bench', 'ohp'],
          sets: mockLoggedSets,
        };
        return selector ? selector(state) : state;
      });
    });

    it('should be no-op when not hydrated', () => {
      (require('../../src/lib/stores').useIsHydrated as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: mockPlan,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.saveAsRoutine(['bench', 'ohp'], mockLoggedSets);
      });

      expect(mockUpsertRoutine).not.toHaveBeenCalled();
    });

    it('should show error cue when no sets logged', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.saveAsRoutine(['bench'], []);
      });

      expect(result.current.instantCue).toMatchObject({
        message: 'No sets yet.',
        detail: 'Log at least one set first.',
        intensity: 'low',
      });
    });

    it('should create routine with exerciseBlocks order when provided', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.saveAsRoutine(['bench', 'ohp'], mockLoggedSets);
      });

      expect(mockUpsertRoutine).toHaveBeenCalledWith(
        expect.objectContaining({
          exercises: expect.arrayContaining([
            expect.objectContaining({ exerciseId: 'bench' }),
            expect.objectContaining({ exerciseId: 'ohp' }),
          ]),
        })
      );

      const savedRoutine = mockUpsertRoutine.mock.calls[0][0];
      expect(savedRoutine.exercises[0].exerciseId).toBe('bench');
      expect(savedRoutine.exercises[1].exerciseId).toBe('ohp');
    });

    it('should infer exercise order from sets when exerciseBlocks is empty', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.saveAsRoutine([], mockLoggedSets);
      });

      expect(mockUpsertRoutine).toHaveBeenCalled();

      const savedRoutine = mockUpsertRoutine.mock.calls[0][0];
      expect(savedRoutine.exercises).toHaveLength(2);
      expect(savedRoutine.exercises[0].exerciseId).toBe('bench');
      expect(savedRoutine.exercises[1].exerciseId).toBe('ohp');
    });

    it('should append "(Saved Copy)" to routine name when plan has routineName', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: mockPlan,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.saveAsRoutine(['bench'], mockLoggedSets);
      });

      expect(mockUpsertRoutine).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Original Push Day (Saved Copy)',
        })
      );
    });

    it('should generate auto name when plan has no routineName', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.saveAsRoutine(['bench'], mockLoggedSets);
      });

      expect(mockUpsertRoutine).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringMatching(/^Workout • /),
        })
      );
    });

    it('should set default target values for exercises', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.saveAsRoutine(['bench', 'ohp'], mockLoggedSets);
      });

      expect(mockUpsertRoutine).toHaveBeenCalled();

      const savedRoutine = mockUpsertRoutine.mock.calls[0][0];
      savedRoutine.exercises.forEach((ex: any) => {
        expect(ex.targetSets).toBe(3);
        expect(ex.targetRepsMin).toBe(6);
        expect(ex.targetRepsMax).toBe(12);
      });
    });

    it('should save to routinesStore', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.saveAsRoutine(['bench'], mockLoggedSets);
      });

      expect(mockUpsertRoutine).toHaveBeenCalled();
      expect(mockUpsertRoutine).toHaveBeenCalledTimes(1);
    });

    it('should show success cue after saving', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.saveAsRoutine(['bench', 'ohp'], mockLoggedSets);
      });

      expect(result.current.instantCue).toMatchObject({
        message: 'Routine saved.',
        detail: '2 exercises',
        intensity: 'low',
      });
    });

    it('should trigger haptic and sound on save', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
          onHaptic: mockOnHaptic,
          onSound: mockOnSound,
        })
      );

      act(() => {
        result.current.saveAsRoutine(['bench'], mockLoggedSets);
      });

      expect(mockOnHaptic).toHaveBeenCalledWith('light');
      expect(mockOnSound).toHaveBeenCalledWith('light');
    });
  });

  describe('reset', () => {
    it('should be no-op when not hydrated', () => {
      (require('../../src/lib/stores').useIsHydrated as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.reset(['bench', 'squat']);
      });

      expect(mockClearCurrentSession).not.toHaveBeenCalled();
    });

    it('should clear current session', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.reset(['bench', 'squat']);
      });

      expect(mockClearCurrentSession).toHaveBeenCalled();
    });

    it('should ensure current session with first exercise', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.reset(['bench', 'squat']);
      });

      expect(mockEnsureCurrentSession).toHaveBeenCalledWith({
        selectedExerciseId: 'bench',
        exerciseBlocks: ['bench'],
      });
    });

    it('should reset recapCues', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      // First set some recap cues (via finishWorkout)
      act(() => {
        result.current.finishWorkout();
      });
      expect(result.current.recapCues.length).toBeGreaterThan(0);

      // Then reset
      act(() => {
        result.current.reset(['bench']);
      });

      expect(result.current.recapCues).toEqual([]);
    });

    it('should reset instantCue to null', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      // First trigger a cue
      (detectCueForWorkingSet as jest.Mock).mockReturnValue({
        cue: {
          message: 'Weight PR!',
          intensity: 'high' as const,
          detail: '135 lb',
        },
        next: {
          bestWeightKg: 61.2,
          bestE1RMKg: 73.5,
          bestRepsAtWeight: {},
        },
        meta: {
          type: 'weight',
          weightLabel: '135 lb',
          isCardio: false,
        },
      });

      act(() => {
        result.current.addSetForExercise('bench', 135, 5);
      });
      expect(result.current.instantCue).not.toBeNull();

      // Then reset
      act(() => {
        result.current.reset(['bench']);
      });

      expect(result.current.instantCue).toBeNull();
    });

    it('should reset sessionStateByExercise', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      // First create some state
      (detectCueForWorkingSet as jest.Mock).mockReturnValue({
        cue: {
          message: 'Weight PR!',
          intensity: 'high' as const,
          detail: '135 lb',
        },
        next: {
          bestWeightKg: 61.2,
          bestE1RMKg: 73.5,
          bestRepsAtWeight: {},
        },
        meta: {
          type: 'weight',
          weightLabel: '135 lb',
          isCardio: false,
        },
      });

      act(() => {
        result.current.addSetForExercise('bench', 135, 5);
      });
      expect(result.current.sessionStateByExercise['bench']).toBeDefined();

      // Then reset
      act(() => {
        result.current.reset(['bench']);
      });

      expect(result.current.sessionStateByExercise).toEqual({});
    });

    it('should use first exercise from plannedExerciseIds', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.reset(['squat', 'bench', 'ohp']);
      });

      expect(mockEnsureCurrentSession).toHaveBeenCalledWith({
        selectedExerciseId: 'squat',
        exerciseBlocks: ['squat'],
      });
    });
  });

  describe('clearInstantCue', () => {
    it('should clear instantCue', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      // First set a cue
      (detectCueForWorkingSet as jest.Mock).mockReturnValue({
        cue: {
          message: 'Weight PR!',
          intensity: 'high' as const,
          detail: '135 lb',
        },
        next: {
          bestWeightKg: 61.2,
          bestE1RMKg: 73.5,
          bestRepsAtWeight: {},
        },
        meta: {
          type: 'weight',
          weightLabel: '135 lb',
          isCardio: false,
        },
      });

      act(() => {
        result.current.addSetForExercise('bench', 135, 5);
      });

      expect(result.current.instantCue).not.toBeNull();

      // Then clear it
      act(() => {
        result.current.clearInstantCue();
      });

      expect(result.current.instantCue).toBeNull();
    });

    it('should be safe to call when instantCue is already null', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      expect(result.current.instantCue).toBeNull();

      act(() => {
        result.current.clearInstantCue();
      });

      expect(result.current.instantCue).toBeNull();
    });
  });

  describe('ensureExerciseState', () => {
    it('should return existing state for exercise', () => {
      const existingState = {
        bestWeightKg: 60,
        bestE1RMKg: 75,
        bestRepsAtWeight: { '135': 5 },
      };

      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      act(() => {
        result.current.sessionStateByExercise['bench'] = existingState;
      });

      const state = result.current.ensureExerciseState('bench');
      expect(state).toBe(existingState);
    });

    it('should create new state for exercise that does not exist', () => {
      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan: null,
          unit: 'lb',
        })
      );

      const emptyState = {
        bestWeightKg: 0,
        bestE1RMKg: 0,
        bestRepsAtWeight: {},
      };

      (makeEmptyExerciseState as jest.Mock).mockReturnValue(emptyState);

      const state = result.current.ensureExerciseState('squat');

      expect(state).toEqual(emptyState);
      expect(result.current.sessionStateByExercise['squat']).toEqual(emptyState);
    });
  });

  describe('Integration: Complete workout flow', () => {
    it('should handle full workout session from start to finish', () => {
      const plan: WorkoutPlan = {
        id: 'plan-1',
        createdAtMs: 1000000,
        routineId: 'routine-1',
        routineName: 'Push Day',
        exercises: [
          {
            exerciseId: 'bench',
            targetSets: 3,
            targetRepsMin: 6,
            targetRepsMax: 10,
          },
        ],
        currentExerciseIndex: 0,
        completedSetsByExerciseId: {},
      };

      const { result } = renderHook(() =>
        useWorkoutOrchestrator({
          plan,
          unit: 'lb',
          onHaptic: mockOnHaptic,
          onSound: mockOnSound,
        })
      );

      // Add some sets with PR
      (detectCueForWorkingSet as jest.Mock).mockReturnValue({
        cue: {
          message: 'Weight PR!',
          intensity: 'high' as const,
          detail: '135 lb',
        },
        next: {
          bestWeightKg: 61.2,
          bestE1RMKg: 73.5,
          bestRepsAtWeight: {},
        },
        meta: {
          type: 'weight',
          weightLabel: '135 lb',
          isCardio: false,
        },
      });

      act(() => {
        result.current.addSetForExercise('bench', 135, 5);
      });

      expect(result.current.instantCue).not.toBeNull();
      expect(mockOnHaptic).toHaveBeenCalledWith('pr');

      // Clear cue
      act(() => {
        result.current.clearInstantCue();
      });

      expect(result.current.instantCue).toBeNull();

      // Finish workout
      act(() => {
        result.current.finishWorkout();
      });

      expect(mockAddWorkoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          routineId: 'routine-1',
          routineName: 'Push Day',
          planId: 'plan-1',
        })
      );

      expect(result.current.instantCue?.message).toBe('Workout saved.');
    });
  });
});
