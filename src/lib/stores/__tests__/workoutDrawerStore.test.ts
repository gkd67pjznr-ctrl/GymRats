// src/lib/stores/__tests__/workoutDrawerStore.test.ts
import { useWorkoutDrawerStore, workoutDrawerActions } from '../workoutDrawerStore';

describe('workoutDrawerStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useWorkoutDrawerStore.setState({
      position: 'closed',
      hasActiveWorkout: false,
      restTimer: {
        isActive: false,
        totalSeconds: 0,
        startedAtMs: null,
      },
      pendingCue: null,
      hasPendingCue: false,
    });
  });

  describe('initial state', () => {
    it('starts with closed position', () => {
      expect(useWorkoutDrawerStore.getState().position).toBe('closed');
    });

    it('starts with no active workout', () => {
      expect(useWorkoutDrawerStore.getState().hasActiveWorkout).toBe(false);
    });
  });

  describe('startWorkout', () => {
    it('sets hasActiveWorkout to true', () => {
      useWorkoutDrawerStore.getState().startWorkout();
      expect(useWorkoutDrawerStore.getState().hasActiveWorkout).toBe(true);
    });

    it('sets position to expanded', () => {
      useWorkoutDrawerStore.getState().startWorkout();
      expect(useWorkoutDrawerStore.getState().position).toBe('expanded');
    });
  });

  describe('endWorkout', () => {
    it('sets hasActiveWorkout to false', () => {
      useWorkoutDrawerStore.getState().startWorkout();
      useWorkoutDrawerStore.getState().endWorkout();
      expect(useWorkoutDrawerStore.getState().hasActiveWorkout).toBe(false);
    });

    it('sets position to closed', () => {
      useWorkoutDrawerStore.getState().startWorkout();
      useWorkoutDrawerStore.getState().endWorkout();
      expect(useWorkoutDrawerStore.getState().position).toBe('closed');
    });
  });

  describe('collapseDrawer', () => {
    it('collapses drawer when workout is active', () => {
      useWorkoutDrawerStore.getState().startWorkout();
      useWorkoutDrawerStore.getState().collapseDrawer();
      expect(useWorkoutDrawerStore.getState().position).toBe('collapsed');
    });

    it('does nothing when workout is not active', () => {
      useWorkoutDrawerStore.getState().collapseDrawer();
      expect(useWorkoutDrawerStore.getState().position).toBe('closed');
    });
  });

  describe('openDrawer', () => {
    it('opens drawer to expanded state', () => {
      useWorkoutDrawerStore.getState().startWorkout();
      useWorkoutDrawerStore.getState().collapseDrawer();
      useWorkoutDrawerStore.getState().openDrawer();
      expect(useWorkoutDrawerStore.getState().position).toBe('expanded');
    });
  });

  describe('closeDrawer', () => {
    it('closes drawer when no active workout', () => {
      useWorkoutDrawerStore.setState({ position: 'collapsed', hasActiveWorkout: false });
      useWorkoutDrawerStore.getState().closeDrawer();
      expect(useWorkoutDrawerStore.getState().position).toBe('closed');
    });

    it('does nothing when workout is active', () => {
      useWorkoutDrawerStore.getState().startWorkout();
      useWorkoutDrawerStore.getState().collapseDrawer();
      useWorkoutDrawerStore.getState().closeDrawer();
      expect(useWorkoutDrawerStore.getState().position).toBe('collapsed');
    });
  });

  describe('setPosition', () => {
    it('sets position when workout is active', () => {
      useWorkoutDrawerStore.getState().startWorkout();
      useWorkoutDrawerStore.getState().setPosition('collapsed');
      expect(useWorkoutDrawerStore.getState().position).toBe('collapsed');
    });

    it('ignores non-closed position when workout is not active', () => {
      useWorkoutDrawerStore.getState().setPosition('expanded');
      expect(useWorkoutDrawerStore.getState().position).toBe('closed');
    });

    it('allows setting closed when workout is not active', () => {
      useWorkoutDrawerStore.getState().setPosition('closed');
      expect(useWorkoutDrawerStore.getState().position).toBe('closed');
    });
  });

  describe('workoutDrawerActions (imperative API)', () => {
    it('provides imperative access to store actions', () => {
      workoutDrawerActions.startWorkout();
      expect(workoutDrawerActions.getPosition()).toBe('expanded');
      expect(workoutDrawerActions.hasActiveWorkout()).toBe(true);

      workoutDrawerActions.collapseDrawer();
      expect(workoutDrawerActions.getPosition()).toBe('collapsed');

      workoutDrawerActions.openDrawer();
      expect(workoutDrawerActions.getPosition()).toBe('expanded');

      workoutDrawerActions.endWorkout();
      expect(workoutDrawerActions.getPosition()).toBe('closed');
      expect(workoutDrawerActions.hasActiveWorkout()).toBe(false);
    });
  });

  describe('rest timer', () => {
    it('starts with inactive rest timer', () => {
      const { restTimer } = useWorkoutDrawerStore.getState();
      expect(restTimer.isActive).toBe(false);
      expect(restTimer.totalSeconds).toBe(0);
      expect(restTimer.startedAtMs).toBeNull();
    });

    it('starts rest timer with given seconds', () => {
      const beforeMs = Date.now();
      useWorkoutDrawerStore.getState().startRestTimer(90);
      const afterMs = Date.now();

      const { restTimer } = useWorkoutDrawerStore.getState();
      expect(restTimer.isActive).toBe(true);
      expect(restTimer.totalSeconds).toBe(90);
      expect(restTimer.startedAtMs).toBeGreaterThanOrEqual(beforeMs);
      expect(restTimer.startedAtMs).toBeLessThanOrEqual(afterMs);
    });

    it('stops rest timer', () => {
      useWorkoutDrawerStore.getState().startRestTimer(90);
      useWorkoutDrawerStore.getState().stopRestTimer();

      const { restTimer } = useWorkoutDrawerStore.getState();
      expect(restTimer.isActive).toBe(false);
      // Should preserve totalSeconds and startedAtMs when stopped
      expect(restTimer.totalSeconds).toBe(90);
      expect(restTimer.startedAtMs).not.toBeNull();
    });

    it('clears rest timer completely', () => {
      useWorkoutDrawerStore.getState().startRestTimer(90);
      useWorkoutDrawerStore.getState().clearRestTimer();

      const { restTimer } = useWorkoutDrawerStore.getState();
      expect(restTimer.isActive).toBe(false);
      expect(restTimer.totalSeconds).toBe(0);
      expect(restTimer.startedAtMs).toBeNull();
    });

    it('clears rest timer when workout ends', () => {
      useWorkoutDrawerStore.getState().startWorkout();
      useWorkoutDrawerStore.getState().startRestTimer(90);
      useWorkoutDrawerStore.getState().endWorkout();

      const { restTimer } = useWorkoutDrawerStore.getState();
      expect(restTimer.isActive).toBe(false);
      expect(restTimer.totalSeconds).toBe(0);
      expect(restTimer.startedAtMs).toBeNull();
    });

    it('provides imperative access to rest timer', () => {
      workoutDrawerActions.startRestTimer(120);
      const timer = workoutDrawerActions.getRestTimer();
      expect(timer.isActive).toBe(true);
      expect(timer.totalSeconds).toBe(120);

      workoutDrawerActions.clearRestTimer();
      expect(workoutDrawerActions.getRestTimer().isActive).toBe(false);
    });
  });

  describe('PR cue', () => {
    // QuickCue format (will be normalized to RichCue)
    const mockQuickCue = {
      message: 'New Weight PR!',
      detail: '+5 lb',
      intensity: 'high' as const,
      prType: 'weight' as const,
    };

    it('starts with no pending cue', () => {
      expect(useWorkoutDrawerStore.getState().pendingCue).toBeNull();
      expect(useWorkoutDrawerStore.getState().hasPendingCue).toBe(false);
    });

    it('sets pending cue and normalizes to RichCue', () => {
      useWorkoutDrawerStore.getState().setPendingCue(mockQuickCue);

      const pendingCue = useWorkoutDrawerStore.getState().pendingCue;
      expect(pendingCue).not.toBeNull();
      expect(pendingCue?.message).toBe('New Weight PR!');
      expect(pendingCue?.detail).toBe('+5 lb');
      expect(pendingCue?.prType).toBe('weight');
      expect(pendingCue?.id).toBeDefined(); // RichCue has id
      expect(useWorkoutDrawerStore.getState().hasPendingCue).toBe(true);
    });

    it('clears pending cue', () => {
      useWorkoutDrawerStore.getState().setPendingCue(mockQuickCue);
      useWorkoutDrawerStore.getState().clearPendingCue();

      expect(useWorkoutDrawerStore.getState().pendingCue).toBeNull();
      expect(useWorkoutDrawerStore.getState().hasPendingCue).toBe(false);
    });

    it('clears pending cue when workout ends', () => {
      useWorkoutDrawerStore.getState().startWorkout();
      useWorkoutDrawerStore.getState().setPendingCue(mockQuickCue);
      useWorkoutDrawerStore.getState().endWorkout();

      expect(useWorkoutDrawerStore.getState().pendingCue).toBeNull();
      expect(useWorkoutDrawerStore.getState().hasPendingCue).toBe(false);
    });

    it('provides imperative access to PR cue', () => {
      workoutDrawerActions.setPendingCue(mockQuickCue);
      const cue = workoutDrawerActions.getPendingCue();
      expect(cue?.message).toBe('New Weight PR!');

      workoutDrawerActions.clearPendingCue();
      expect(workoutDrawerActions.getPendingCue()).toBeNull();
    });
  });
});
