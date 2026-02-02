// __tests__/ui/illustrationsGallery.test.tsx
// Test for illustrations gallery screen

import React from 'react';
import { render } from '@testing-library/react-native';
import IllustrationsGalleryScreen from '../../app/profile/illustrations';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  Stack: {
    Screen: () => null,
  },
  useSegments: () => [],
}));

// Mock auth store
jest.mock('../../src/lib/stores/authStore', () => ({
  useUser: () => ({ id: 'test-user', displayName: 'Test User' }),
}));

// Mock theme store
const mockActiveIllustration = {
  id: 'test-illustration-1',
  name: 'Test Illustration 1',
  description: 'A test illustration for testing',
  category: 'emotional',
  style: 'hand-drawn',
  assetPath: 'illustrations/emotional/test1.svg',
  variants: {
    small: 'illustrations/emotional/test1-small.svg',
    medium: 'illustrations/emotional/test1-medium.svg',
    large: 'illustrations/emotional/test1-large.svg',
  },
  themes: ['test'],
  isPremium: false,
  isLegendary: false,
  animationType: 'none',
};

const mockDatabase = {
  illustrations: [
    {
      id: 'test-illustration-1',
      name: 'Test Illustration 1',
      description: 'A test illustration for testing',
      category: 'emotional',
      style: 'hand-drawn',
      assetPath: 'illustrations/emotional/test1.svg',
      variants: {
        small: 'illustrations/emotional/test1-small.svg',
        medium: 'illustrations/emotional/test1-medium.svg',
        large: 'illustrations/emotional/test1-large.svg',
      },
      themes: ['test'],
      isPremium: false,
      isLegendary: false,
      animationType: 'none',
    },
    {
      id: 'test-illustration-2',
      name: 'Test Illustration 2',
      description: 'Another test illustration for testing',
      category: 'achievement',
      style: 'surreal',
      assetPath: 'illustrations/achievement/test2.svg',
      variants: {
        small: 'illustrations/achievement/test2-small.svg',
        medium: 'illustrations/achievement/test2-medium.svg',
        large: 'illustrations/achievement/test2-large.svg',
      },
      themes: ['test'],
      isPremium: true,
      isLegendary: false,
      animationType: 'pulse',
    },
  ],
  configurations: [
    {
      id: 'test-config-1',
      name: 'Test Config 1',
      paletteId: 'test-palette',
      typographyId: 'test-typography',
      illustrationId: 'test-illustration-1',
      audioId: 'test-audio',
      motionId: 'test-motion',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
      isDefault: true,
      isPremium: false,
      isLegendary: false,
    },
  ],
};

jest.mock('../../src/lib/stores/themeStore', () => ({
  useThemeStore: () => ({
    database: mockDatabase,
    setActiveTheme: jest.fn(),
    activeIllustration: mockActiveIllustration,
    isThemeLoaded: true,
  }),
  useActivePalette: () => null,
  useActiveTypography: () => null,
  useActiveIllustration: () => mockActiveIllustration,
  useActiveAudio: () => null,
  useActiveMotion: () => null,
  useThemeDatabase: () => mockDatabase,
  useIsThemeLoaded: () => true,
}));

// Mock theme context
jest.mock('../../src/ui/theme', () => ({
  useThemeColors: () => ({
    bg: '#000000',
    card: '#111111',
    border: '#222222',
    text: '#FFFFFF',
    muted: '#AAAAAA',
    primary: '#FF00FF',
    secondary: '#00FFFF',
    accent: '#FFFF00',
    success: '#00FF00',
    danger: '#FF0000',
    warning: '#FFFF00',
    info: '#0000FF',
  }),
}));

// Mock ProtectedRoute to render children directly
jest.mock('../../src/ui/components/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Illustrations Gallery Screen', () => {
  it('renders illustrations gallery screen correctly', () => {
    const { getByText, getAllByText } = render(<IllustrationsGalleryScreen />);

    expect(getByText('Illustrations Gallery')).toBeTruthy();
    // Should find at least one instance of each illustration name
    expect(getAllByText('Test Illustration 1').length).toBeGreaterThan(0);
    expect(getAllByText('Test Illustration 2').length).toBeGreaterThan(0);
    expect(getByText('Browse themed illustrations that enhance your app experience. Each illustration style adds unique visual flair to achievements, ranks, and other UI elements.')).toBeTruthy();
  });

  it('displays illustration categories', () => {
    const { getByText, getAllByText } = render(<IllustrationsGalleryScreen />);

    // Should find at least one instance of each category
    expect(getAllByText('emotional').length).toBeGreaterThan(0);
    expect(getAllByText('achievement').length).toBeGreaterThan(0);
  });
});