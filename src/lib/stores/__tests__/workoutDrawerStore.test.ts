// src/lib/stores/__tests__/workoutDrawerStore.test.ts
import { useWorkoutDrawerStore, workoutDrawerActions } from '../workoutDrawerStore';

describe('workoutDrawerStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useWorkoutDrawerStore.setState({
      position: 'closed',
      hasActiveWorkout: false,
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
});
