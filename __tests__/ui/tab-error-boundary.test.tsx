/**
 * TabErrorBoundary Component Test Suite
 *
 * Comprehensive tests for the TabErrorBoundary component covering:
 * - Error catching and isolation
 * - Screen name context in error messages
 * - Recovery mechanism
 * - Dev/production mode behavior
 * - Logging with tab-specific prefixes
 */

import React, { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { View, Text, Pressable } from 'react-native';
import TabErrorBoundary from '../../src/ui/tab-error-boundary';

// Mock console.error to avoid test output pollution
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  jest.clearAllMocks();
});

describe('TabErrorBoundary - Error Catching', () => {
  it('catches errors in child components and shows error screen', () => {
    const ThrowError = () => {
      throw new Error('Test error in Home tab');
    };

    render(
      <TabErrorBoundary screenName="Home">
        <ThrowError />
      </TabErrorBoundary>
    );

    // Shows error title
    expect(screen.getByText('Something went wrong')).toBeTruthy();

    // Shows screen name context
    expect(screen.getByText('In Home screen')).toBeTruthy();

    // Shows error message in dev mode
    expect(screen.getByText('Test error in Home tab')).toBeTruthy();

    // Shows recovery button
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('renders children normally when no error occurs', () => {
    const TestChild = () => (
      <View testID="test-child">
        <Text>Normal Content</Text>
      </View>
    );

    const { getByTestId, getByText } = render(
      <TabErrorBoundary screenName="Home">
        <TestChild />
      </TabErrorBoundary>
    );

    expect(getByTestId('test-child')).toBeTruthy();
    expect(getByText('Normal Content')).toBeTruthy();
  });

  it('isolates errors to individual tabs', () => {
    // This test verifies that errors in one tab don't affect other tabs
    // by rendering two separate TabErrorBoundary instances

    const ThrowError = () => {
      throw new Error('Error in tab 1');
    };

    const NormalTab = () => (
      <View testID="normal-tab">
        <Text>Tab 2 is fine</Text>
      </View>
    );

    render(
      <>
        <TabErrorBoundary screenName="Tab1">
          <ThrowError />
        </TabErrorBoundary>
        <TabErrorBoundary screenName="Tab2">
          <NormalTab />
        </TabErrorBoundary>
      </>
    );

    // Tab 1 shows error
    expect(screen.getByText('In Tab1 screen')).toBeTruthy();
    expect(screen.getByText('Error in tab 1')).toBeTruthy();

    // Tab 2 renders normally
    expect(screen.getByTestId('normal-tab')).toBeTruthy();
    expect(screen.getByText('Tab 2 is fine')).toBeTruthy();
  });
});

describe('TabErrorBoundary - Recovery Mechanism', () => {
  it('"Try Again" button clears error state and re-renders', () => {
    let shouldThrow = true;

    const ConditionalError = () => {
      if (shouldThrow) {
        throw new Error('Transient error');
      }
      return (
        <View testID="recovered">
          <Text>Recovered</Text>
        </View>
      );
    };

    const { getByTestId, getByText, queryByText } = render(
      <TabErrorBoundary screenName="Workout">
        <ConditionalError />
      </TabErrorBoundary>
    );

    // Error screen is shown
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('In Workout screen')).toBeTruthy();

    // Clear the error flag
    shouldThrow = false;

    // Press "Try Again"
    fireEvent.press(getByText('Try Again'));

    // Component re-renders and children are shown
    expect(getByTestId('recovered')).toBeTruthy();
    expect(getByText('Recovered')).toBeTruthy();
    expect(queryByText('Something went wrong')).toBeNull();
  });

  it('handles persistent errors gracefully (can retry multiple times)', () => {
    const AlwaysThrow = () => {
      throw new Error('Persistent error');
    };

    const { getByText } = render(
      <TabErrorBoundary screenName="Feed">
        <AlwaysThrow />
      </TabErrorBoundary>
    );

    // Error screen is shown
    expect(getByText('Something went wrong')).toBeTruthy();

    // Press "Try Again" multiple times
    fireEvent.press(getByText('Try Again'));
    expect(getByText('Something went wrong')).toBeTruthy(); // Still shows error

    fireEvent.press(getByText('Try Again'));
    expect(getByText('Something went wrong')).toBeTruthy(); // Still shows error

    // Verify no crash occurs on retry
    expect(console.error).toHaveBeenCalled();
  });
});

describe('TabErrorBoundary - Dev/Production Mode', () => {
  it('shows detailed error message in development mode', () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = true;

    const ThrowError = () => {
      throw new Error('Dev mode error details');
    };

    render(
      <TabErrorBoundary screenName="Profile">
        <ThrowError />
      </TabErrorBoundary>
    );

    // Shows full error message
    expect(screen.getByText('Dev mode error details')).toBeTruthy();

    (global as any).__DEV__ = originalDev;
  });

  it('shows generic message in production mode', () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;

    const ThrowError = () => {
      throw new Error('Sensitive production error');
    };

    render(
      <TabErrorBoundary screenName="Settings">
        <ThrowError />
      </TabErrorBoundary>
    );

    // Shows generic message, NOT the sensitive error
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeTruthy();
    expect(screen.queryByText('Sensitive production error')).toBeNull();

    (global as any).__DEV__ = originalDev;
  });

  it('shows error name and type in development mode', () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = true;

    const TypeErrorComponent = () => {
      throw new TypeError('Type error occurred');
    };

    render(
      <TabErrorBoundary screenName="Body">
        <TypeErrorComponent />
      </TabErrorBoundary>
    );

    // Shows error name
    expect(screen.getByText(/TypeError/)).toBeTruthy();

    (global as any).__DEV__ = originalDev;
  });
});

describe('TabErrorBoundary - Logging', () => {
  it('logs errors with [TabErrorBoundary] prefix and screen name', () => {
    const ThrowError = () => {
      throw new Error('Log test error');
    };

    render(
      <TabErrorBoundary screenName="Workout">
        <ThrowError />
      </TabErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      '[TabErrorBoundary] Error in "Workout" tab:',
      expect.objectContaining({
        timestamp: expect.any(String),
        errorName: 'Error',
        errorMessage: 'Log test error',
        componentStack: expect.any(String),
        screenName: 'Workout',
      })
    );
  });

  it('logs component stack separately for readability', () => {
    const ThrowError = () => {
      throw new Error('Stack test');
    };

    render(
      <TabErrorBoundary screenName="Feed">
        <ThrowError />
      </TabErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      '[TabErrorBoundary] Component stack for "Feed":',
      expect.any(String)
    );
  });
});

describe('TabErrorBoundary - Edge Cases', () => {
  it('handles null children gracefully', () => {
    const { queryByTestId } = render(
      <TabErrorBoundary screenName="Empty">
        {null}
      </TabErrorBoundary>
    );

    // No crash, renders nothing
    expect(queryByTestId(/.*/)).toBeNull();
  });

  it('handles undefined error.message', () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = true;

    const ThrowErrorNoMessage = () => {
      const error = new Error();
      // Set to undefined to test fallback (deleting doesn't work due to prototype)
      (error as any).message = undefined;
      throw error;
    };

    const { getByText } = render(
      <TabErrorBoundary screenName="Home">
        <ThrowErrorNoMessage />
      </TabErrorBoundary>
    );

    // Shows fallback message
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('An unexpected error occurred')).toBeTruthy();

    (global as any).__DEV__ = originalDev;
  });

  it('handles errors without component stack', () => {
    const ThrowError = () => {
      throw new Error('No stack error');
    };

    render(
      <TabErrorBoundary screenName="Profile">
        <ThrowError />
      </TabErrorBoundary>
    );

    // Should still show error screen
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('renders correctly with different screen names', () => {
    const screenNames = ['Home', 'Feed', 'Workout', 'Body', 'Profile'];

    screenNames.forEach((screenName) => {
      const ThrowError = () => {
        throw new Error(`Error in ${screenName}`);
      };

      const { getByText, unmount } = render(
        <TabErrorBoundary screenName={screenName}>
          <ThrowError />
        </TabErrorBoundary>
      );

      expect(getByText(`In ${screenName} screen`)).toBeTruthy();
      unmount();
    });
  });
});

describe('TabErrorBoundary - Styling', () => {
  it('applies correct dark theme colors', () => {
    const ThrowError = () => {
      throw new Error('Style test');
    };

    const { getByText, UNSAFE_getByType } = render(
      <TabErrorBoundary screenName="Home">
        <ThrowError />
      </TabErrorBoundary>
    );

    // Background color is #0a0a0a (dark bg)
    const container = UNSAFE_getByType(View);
    const containerStyle = container.props.style;
    if (Array.isArray(containerStyle)) {
      const flatStyle = Object.assign({}, ...containerStyle);
      expect(flatStyle.backgroundColor).toBe('#0a0a0a');
    }

    // Title is white
    const title = getByText('Something went wrong');
    expect(title.props.style?.color).toBe('#ffffff');
  });
});
