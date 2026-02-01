// app/__tests__/onboarding.test.tsx
// Tests for onboarding screen

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import OnboardingScreen from '../onboarding';
import { useOnboardingStore, useCurrentOnboardingStep } from '../../src/lib/stores/onboardingStore';
import { useAvatarStore } from '../../src/lib/avatar/avatarStore';

// Mock stores
jest.mock('../../src/lib/stores/onboardingStore', () => {
  const actual = jest.requireActual('../../src/lib/stores/onboardingStore');
  return {
    ...actual,
    useOnboardingStore: jest.fn(),
    useCurrentOnboardingStep: jest.fn(),
    useOnboardingProfile: jest.fn(),
    useIsOnboarding: jest.fn(),
  };
});
jest.mock('../../src/lib/avatar/avatarStore');
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  Stack: {
    Screen: ({ children }: { children: any }) => children,
  },
}));

// Mock design system hooks
jest.mock('../../src/ui/theme', () => ({
  useThemeColors: () => ({
    bg: '#000',
    text: '#fff',
    muted: '#888',
    card: '#111',
    border: '#222',
  }),
}));

// Mock forgerankStyle
jest.mock('../../src/ui/forgerankStyle', () => ({
  FR: {
    type: {
      h1: { fontSize: 32, fontWeight: '900' },
      h2: { fontSize: 24, fontWeight: '900' },
      h3: { fontSize: 20, fontWeight: '900' },
      body: { fontSize: 16, fontWeight: '400' },
      sub: { fontSize: 14, fontWeight: '400' },
    },
    space: {
      x1: 4,
      x2: 8,
      x3: 12,
      x4: 16,
      x5: 20,
      x6: 24,
      x8: 32,
    },
    radii: {
      sm: 8,
      md: 12,
      lg: 16,
      pill: 9999,
    },
    pillButton: ({ card, border }: { card: string; border: string }) => ({
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: border,
      backgroundColor: card,
      paddingHorizontal: 24,
      alignItems: 'center',
    }),
    card: ({ card, border }: { card: string; border: string }) => ({
      borderRadius: 16,
      borderWidth: 2,
      borderColor: border,
      backgroundColor: card,
      padding: 16,
    }),
  },
}));

// Mock designSystem
jest.mock('../../src/ui/designSystem', () => ({
  makeDesignSystem: () => ({
    tone: {
      bg: '#000',
      text: '#fff',
      muted: '#888',
      card: '#111',
      border: '#222',
      accent: '#0f0',
    },
  }),
}));

describe('OnboardingScreen', () => {
  const mockUseOnboardingStore = useOnboardingStore as jest.MockedFunction<typeof useOnboardingStore>;
  const mockUseCurrentOnboardingStep = useCurrentOnboardingStep as jest.MockedFunction<typeof useCurrentOnboardingStep>;
  const mockUseAvatarStore = useAvatarStore as jest.MockedFunction<typeof useAvatarStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCurrentOnboardingStep.mockReturnValue('welcome');
    mockUseAvatarStore.mockReturnValue({
      setArtStyle: jest.fn(),
      setCosmetics: jest.fn(),
      updateGrowth: jest.fn(),
      calculateGrowth: jest.fn(),
      hydrate: jest.fn(),
      setHydrated: jest.fn(),
      setError: jest.fn(),
      artStyle: null,
      growthStage: null,
      heightScale: null,
      cosmetics: null,
      volumeTotal: null,
      setsTotal: null,
      avgRank: null,
      hydrated: false,
      loading: false,
      error: null,
    });
  });

  test('renders welcome step by default', () => {
    mockUseCurrentOnboardingStep.mockReturnValue('welcome');
    mockUseOnboardingStore.mockReturnValue({
      completed: false,
      currentStep: 'welcome',
      startedAt: null,
      completedAt: null,
      profile: null,
      hydrated: false,
      tutorialStep: 0,
      tutorialCompleted: false,
      startOnboarding: jest.fn(),
      setCurrentStep: jest.fn(),
      setProfile: jest.fn(),
      setPersonality: jest.fn(),
      setGoal: jest.fn(),
      completeOnboarding: jest.fn(),
      resetOnboarding: jest.fn(),
      skipOnboarding: jest.fn(),
      advanceTutorialStep: jest.fn(),
      completeTutorial: jest.fn(),
      resetTutorial: jest.fn(),
      setHydrated: jest.fn(),
    });

    render(<OnboardingScreen />);
    expect(screen.getByText('Welcome to Forgerank')).toBeTruthy();
    expect(screen.getByText('Let\'s Get Started')).toBeTruthy();
  });

  test('renders avatar step when currentStep is avatar', () => {
    mockUseCurrentOnboardingStep.mockReturnValue('avatar');
    mockUseOnboardingStore.mockReturnValue({
      completed: false,
      currentStep: 'avatar',
      startedAt: null,
      completedAt: null,
      profile: null,
      hydrated: false,
      tutorialStep: 0,
      tutorialCompleted: false,
      startOnboarding: jest.fn(),
      setCurrentStep: jest.fn(),
      setProfile: jest.fn(),
      setPersonality: jest.fn(),
      setGoal: jest.fn(),
      completeOnboarding: jest.fn(),
      resetOnboarding: jest.fn(),
      skipOnboarding: jest.fn(),
      advanceTutorialStep: jest.fn(),
      completeTutorial: jest.fn(),
      resetTutorial: jest.fn(),
      setHydrated: jest.fn(),
    });

    render(<OnboardingScreen />);
    expect(screen.getByText('Create your avatar')).toBeTruthy();
    expect(screen.getByText('Bitmoji')).toBeTruthy();
    expect(screen.getByText('Pixel')).toBeTruthy();
  });
});