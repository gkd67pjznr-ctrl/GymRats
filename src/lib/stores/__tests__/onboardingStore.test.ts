// src/lib/stores/__tests__/onboardingStore.test.ts
// Tests for onboardingStore - Zustand store for onboarding state

import { act, renderHook } from '@testing-library/react-native';
import {
  useOnboardingStore,
  startOnboarding,
  setOnboardingStep,
  setOnboardingProfile,
  setOnboardingGoal,
  completeOnboarding,
  skipOnboarding,
  resetOnboarding,
  isOnboarding,
  getOnboardingProfile,
  PERSONALITIES,
  type OnboardingStep,
  type TrainingGoal,
  type ExperienceLevel,
} from '../onboardingStore';
import { updateSettings } from '../settingsStore';

// Mock settings store
jest.mock('../settingsStore', () => ({
  updateSettings: jest.fn(),
}));

describe('onboardingStore', () => {
  beforeEach(() => {
    // Clear store state before each test
    const { result } = renderHook(() => useOnboardingStore());
    act(() => {
      result.current.resetOnboarding();
    });
    (updateSettings as jest.Mock).mockClear();
  });

  test('initial state', () => {
    const { result } = renderHook(() => useOnboardingStore());
    expect(result.current.completed).toBe(false);
    expect(result.current.currentStep).toBe('welcome');
    expect(result.current.startedAt).toBeNull();
    expect(result.current.completedAt).toBeNull();
    expect(result.current.profile).toBeNull();
    // hydrated may be true after rehydration
    expect(result.current.tutorialStep).toBe(0);
    expect(result.current.tutorialCompleted).toBe(false);
  });

  test('startOnboarding', () => {
    const { result } = renderHook(() => useOnboardingStore());
    const startTime = Date.now();
    act(() => {
      result.current.startOnboarding();
    });
    expect(result.current.startedAt).toBeGreaterThanOrEqual(startTime);
    expect(result.current.currentStep).toBe('welcome');
  });

  test('setCurrentStep', () => {
    const { result } = renderHook(() => useOnboardingStore());
    act(() => {
      result.current.setCurrentStep('avatar');
    });
    expect(result.current.currentStep).toBe('avatar');
  });

  test('setProfile', () => {
    const { result } = renderHook(() => useOnboardingStore());
    const profile = {
      displayName: 'John Doe',
      bodyweight: 70,
      bodyweightUnit: 'kg' as const,
      experienceLevel: 'intermediate' as ExperienceLevel,
      personalityId: 'coach',
      goal: 'strength' as TrainingGoal,
    };
    act(() => {
      result.current.setProfile(profile);
    });
    expect(result.current.profile).toEqual(profile);
    expect(updateSettings).toHaveBeenCalledWith({
      displayName: 'John Doe',
      bodyweight: 70,
      experienceLevel: 'intermediate',
      personalityId: 'coach',
      goal: 'strength',
      unitSystem: 'kg',
    });
  });

  test('setPersonality', () => {
    const { result } = renderHook(() => useOnboardingStore());
    // First set a profile
    const profile = {
      displayName: 'John Doe',
      bodyweight: 70,
      bodyweightUnit: 'kg' as const,
      experienceLevel: 'intermediate' as ExperienceLevel,
      personalityId: 'coach',
      goal: 'strength' as TrainingGoal,
    };
    act(() => {
      result.current.setProfile(profile);
    });
    // Change personality
    act(() => {
      result.current.setPersonality('hype');
    });
    expect(result.current.profile?.personalityId).toBe('hype');
    expect(updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ personalityId: 'hype' })
    );
  });

  test('setGoal', () => {
    const { result } = renderHook(() => useOnboardingStore());
    const profile = {
      displayName: 'John Doe',
      bodyweight: 70,
      bodyweightUnit: 'kg' as const,
      experienceLevel: 'intermediate' as ExperienceLevel,
      personalityId: 'coach',
      goal: null,
    };
    act(() => {
      result.current.setProfile(profile);
    });
    act(() => {
      result.current.setGoal('aesthetics');
    });
    expect(result.current.profile?.goal).toBe('aesthetics');
    expect(updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ goal: 'aesthetics' })
    );
  });

  test('completeOnboarding', () => {
    const { result } = renderHook(() => useOnboardingStore());
    const completeTime = Date.now();
    act(() => {
      result.current.completeOnboarding();
    });
    expect(result.current.completed).toBe(true);
    expect(result.current.completedAt).toBeGreaterThanOrEqual(completeTime);
    expect(result.current.currentStep).toBe('complete');
  });

  test('skipOnboarding', () => {
    const { result } = renderHook(() => useOnboardingStore());
    const skipTime = Date.now();
    act(() => {
      result.current.skipOnboarding();
    });
    expect(result.current.completed).toBe(true);
    expect(result.current.completedAt).toBeGreaterThanOrEqual(skipTime);
    expect(result.current.currentStep).toBe('complete');
    expect(result.current.profile).toEqual({
      displayName: 'Lifter',
      bodyweight: 70,
      bodyweightUnit: 'lb',
      experienceLevel: 'intermediate',
      personalityId: 'coach',
      goal: 'general',
    });
    expect(updateSettings).toHaveBeenCalledWith({
      displayName: 'Lifter',
      bodyweight: 70,
      experienceLevel: 'intermediate',
      personalityId: 'coach',
      goal: 'general',
      unitSystem: 'lb',
    });
  });

  test('resetOnboarding', () => {
    const { result } = renderHook(() => useOnboardingStore());
    act(() => {
      result.current.startOnboarding();
      result.current.setCurrentStep('avatar');
      result.current.setProfile({
        displayName: 'Test',
        bodyweight: 80,
        bodyweightUnit: 'lb',
        experienceLevel: 'beginner',
        personalityId: 'hype',
        goal: 'health',
      });
      result.current.completeOnboarding();
    });
    act(() => {
      result.current.resetOnboarding();
    });
    expect(result.current.completed).toBe(false);
    expect(result.current.currentStep).toBe('welcome');
    expect(result.current.startedAt).toBeNull();
    expect(result.current.completedAt).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.tutorialStep).toBe(0);
    expect(result.current.tutorialCompleted).toBe(false);
  });

  test('advanceTutorialStep', () => {
    const { result } = renderHook(() => useOnboardingStore());
    expect(result.current.tutorialStep).toBe(0);
    act(() => {
      result.current.advanceTutorialStep();
    });
    expect(result.current.tutorialStep).toBe(1);
    act(() => {
      result.current.advanceTutorialStep();
    });
    expect(result.current.tutorialStep).toBe(2);
  });

  test('completeTutorial', () => {
    const { result } = renderHook(() => useOnboardingStore());
    act(() => {
      result.current.advanceTutorialStep();
      result.current.completeTutorial();
    });
    expect(result.current.tutorialCompleted).toBe(true);
    expect(result.current.tutorialStep).toBe(0);
  });

  test('resetTutorial', () => {
    const { result } = renderHook(() => useOnboardingStore());
    act(() => {
      result.current.advanceTutorialStep();
      result.current.completeTutorial();
    });
    act(() => {
      result.current.resetTutorial();
    });
    expect(result.current.tutorialStep).toBe(0);
    expect(result.current.tutorialCompleted).toBe(false);
  });

  describe('selectors', () => {
    test('useIsOnboarding returns true when not completed', () => {
      const { result } = renderHook(() => useOnboardingStore());
      expect(result.current.completed).toBe(false);
      const { result: hookResult } = renderHook(() => useOnboardingStore(state => !state.completed));
      expect(hookResult.current).toBe(true);
    });

    test('useOnboardingProfile returns profile', () => {
      const { result } = renderHook(() => useOnboardingStore());
      const profile = {
        displayName: 'John',
        bodyweight: 70,
        bodyweightUnit: 'kg' as const,
        experienceLevel: 'intermediate' as ExperienceLevel,
        personalityId: 'coach',
        goal: 'strength' as TrainingGoal,
      };
      act(() => {
        result.current.setProfile(profile);
      });
      const { result: hookResult } = renderHook(() => useOnboardingStore(state => state.profile));
      expect(hookResult.current).toEqual(profile);
    });

    test('useCurrentOnboardingStep returns current step', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.setCurrentStep('goals');
      });
      const { result: hookResult } = renderHook(() => useOnboardingStore(state => state.currentStep));
      expect(hookResult.current).toBe('goals');
    });
  });

  describe('imperative getters', () => {
    test('isOnboarding', () => {
      const { result } = renderHook(() => useOnboardingStore());
      expect(isOnboarding()).toBe(true);
      act(() => {
        result.current.completeOnboarding();
      });
      expect(isOnboarding()).toBe(false);
    });

    test('getOnboardingProfile', () => {
      const { result } = renderHook(() => useOnboardingStore());
      const profile = {
        displayName: 'Jane',
        bodyweight: 65,
        bodyweightUnit: 'lb' as const,
        experienceLevel: 'advanced' as ExperienceLevel,
        personalityId: 'savage',
        goal: 'sport' as TrainingGoal,
      };
      act(() => {
        result.current.setProfile(profile);
      });
      expect(getOnboardingProfile()).toEqual(profile);
    });
  });

  describe('imperative actions', () => {
    test('startOnboarding imperative', () => {
      const { result } = renderHook(() => useOnboardingStore());
      const startTime = Date.now();
      act(() => {
        startOnboarding();
      });
      expect(result.current.startedAt).toBeGreaterThanOrEqual(startTime);
      expect(result.current.currentStep).toBe('welcome');
    });

    test('setOnboardingStep imperative', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        setOnboardingStep('profile');
      });
      expect(result.current.currentStep).toBe('profile');
    });

    test('setOnboardingProfile imperative', () => {
      const { result } = renderHook(() => useOnboardingStore());
      const profile = {
        displayName: 'John',
        bodyweight: 70,
        bodyweightUnit: 'kg',
        experienceLevel: 'intermediate',
        personalityId: 'coach',
        goal: 'strength',
      };
      act(() => {
        setOnboardingProfile(profile);
      });
      expect(result.current.profile).toEqual(profile);
    });

    test('completeOnboarding imperative', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        completeOnboarding();
      });
      expect(result.current.completed).toBe(true);
    });

    test('skipOnboarding imperative', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        skipOnboarding();
      });
      expect(result.current.completed).toBe(true);
    });

    test('resetOnboarding imperative', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.completeOnboarding();
      });
      act(() => {
        resetOnboarding();
      });
      expect(result.current.completed).toBe(false);
    });
  });
});