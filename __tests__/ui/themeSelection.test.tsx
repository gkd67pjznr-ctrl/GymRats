// __tests__/ui/themeSelection.test.tsx
// Test for theme selection UI components

import React from 'react';
import { render } from '@testing-library/react-native';
import ThemeProvider from '../../src/ui/theme/ThemeProvider';
import { ThemeCard } from '../../src/ui/components/ThemeCard';

// Mock theme data
const mockTheme = {
  id: 'test-theme',
  name: 'Test Theme',
  description: 'A test theme for testing',
  colors: {
    background: '#000000',
    card: '#111111',
    border: '#222222',
    text: '#FFFFFF',
    muted: '#AAAAAA',
    success: '#00FF00',
    danger: '#FF0000',
    warning: '#FFFF00',
    info: '#0000FF',
    primary: '#FF00FF',
    secondary: '#00FFFF',
    accent: '#FFFF00',
    accent2: '#00FF00',
    soft: '#333333',
    iron: '#777777',
    bronze: '#CC9966',
    silver: '#CCCCCC',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
    mythic: '#FF00FF',
  },
  emotionalMeaning: 'Test',
  isPremium: false,
  isLegendary: false,
  tags: ['test'],
};

describe('Theme Selection UI', () => {
  it('renders theme card correctly', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ThemeCard
          theme={mockTheme}
          isActive={false}
          onPress={() => {}}
        />
      </ThemeProvider>
    );

    expect(getByText('Test Theme')).toBeTruthy();
    expect(getByText('A test theme for testing')).toBeTruthy();
  });

  it('shows active indicator for active theme', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ThemeCard
          theme={mockTheme}
          isActive={true}
          onPress={() => {}}
        />
      </ThemeProvider>
    );

    expect(getByText('Active')).toBeTruthy();
  });
});