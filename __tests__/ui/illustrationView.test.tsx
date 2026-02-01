// __tests__/ui/illustrationView.test.tsx
// Test for illustration view component

import React from 'react';
import { render } from '@testing-library/react-native';
import { IllustrationView } from '../../src/ui/components/IllustrationView';

// Mock theme data
const mockIllustration = {
  id: 'test-illustration',
  name: 'Test Illustration',
  description: 'A test illustration for testing',
  category: 'emotional',
  style: 'hand-drawn',
  assetPath: 'illustrations/emotional/test.svg',
  variants: {
    small: 'illustrations/emotional/test-small.svg',
    medium: 'illustrations/emotional/test-medium.svg',
    large: 'illustrations/emotional/test-large.svg',
  },
  themes: ['test'],
  isPremium: false,
  isLegendary: false,
  animationType: 'none',
};

describe('Illustration View', () => {
  it('renders illustration view correctly', () => {
    const { getByText } = render(
      <IllustrationView
        illustration={mockIllustration}
        size="medium"
        showDetails={true}
      />
    );

    expect(getByText('Test Illustration')).toBeTruthy();
    expect(getByText('emotional')).toBeTruthy();
    expect(getByText('Style: hand-drawn')).toBeTruthy();
  });

  it('renders without details when showDetails is false', () => {
    const { getByText, queryByText } = render(
      <IllustrationView
        illustration={mockIllustration}
        size="medium"
        showDetails={false}
      />
    );

    expect(getByText('Test Illustration')).toBeTruthy();
    expect(queryByText('Style: hand-drawn')).toBeNull();
  });
});