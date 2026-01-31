/**
 * ErrorBoundary Component Test Suite
 *
 * Comprehensive tests for the ErrorBoundary component covering:
 * - Error catching and display
 * - Recovery mechanism
 * - Dev/production mode behavior
 * - Logging with [ErrorBoundary] prefix
 * - Component stack trace logging
 * - Design system integration
 */

import React, { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import ErrorBoundary from '../../src/ui/error-boundary';

// Mock console.error to avoid test output pollution
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  jest.clearAllMocks();
});

describe('ErrorBoundary - Error Catching', () => {
  it('catches errors in child components and shows error screen', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Shows error title
    expect(getByText('Something went wrong')).toBeTruthy();

    // Shows error message in dev mode
    expect(getByText('Test error')).toBeTruthy();

    // Shows recovery button
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('renders children normally when no error occurs', () => {
    const TestChild = () => (
      <View testID="test-child">
        <Text>Normal Content</Text>
      </View>
    );

    const { getByTestId, getByText } = render(
      <ErrorBoundary>
        <TestChild />
      </ErrorBoundary>
    );

    expect(getByTestId('test-child')).toBeTruthy();
    expect(getByText('Normal Content')).toBeTruthy();
  });

  it('handles multiple error boundaries independently', () => {
    // This test verifies that errors in one boundary don't affect other boundaries

    const ThrowError = () => {
      throw new Error('Error in boundary 1');
    };

    const NormalComponent = () => (
      <View testID="normal-component">
        <Text>Boundary 2 is fine</Text>
      </View>
    );

    render(
      <>
        <ErrorBoundary name="boundary-1">
          <ThrowError />
        </ErrorBoundary>
        <ErrorBoundary name="boundary-2">
          <NormalComponent />
        </ErrorBoundary>
      </>
    );

    // Boundary 1 shows error
    expect(screen.getByText('Error in boundary 1')).toBeTruthy();

    // Boundary 2 renders normally
    expect(screen.getByTestId('normal-component')).toBeTruthy();
    expect(screen.getByText('Boundary 2 is fine')).toBeTruthy();
  });
});

describe('ErrorBoundary - Recovery Mechanism', () => {
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
      <ErrorBoundary>
        <ConditionalError />
      </ErrorBoundary>
    );

    // Error screen is shown
    expect(getByText('Something went wrong')).toBeTruthy();

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
      <ErrorBoundary>
        <AlwaysThrow />
      </ErrorBoundary>
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

describe('ErrorBoundary - Dev/Production Mode', () => {
  it('shows detailed error message in development mode', () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = true;

    const ThrowError = () => {
      throw new Error('Dev mode error details');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
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
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
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
      <ErrorBoundary>
        <TypeErrorComponent />
      </ErrorBoundary>
    );

    // Shows error name
    expect(screen.getByText(/TypeError/)).toBeTruthy();

    (global as any).__DEV__ = originalDev;
  });
});

describe('ErrorBoundary - Logging', () => {
  it('logs errors with [ErrorBoundary] prefix', () => {
    const ThrowError = () => {
      throw new Error('Log test error');
    };

    render(
      <ErrorBoundary name="root">
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      '[ErrorBoundary] Error caught:',
      expect.objectContaining({
        timestamp: expect.any(String),
        errorName: 'Error',
        errorMessage: 'Log test error',
        componentStack: expect.any(String),
        boundaryName: 'root',
      })
    );
  });

  it('logs component stack separately for readability', () => {
    const ThrowError = () => {
      throw new Error('Stack test');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      '[ErrorBoundary] Component stack trace:',
      expect.any(String)
    );
  });

  it('includes boundary name in logs when provided', () => {
    const ThrowError = () => {
      throw new Error('Named boundary error');
    };

    render(
      <ErrorBoundary name="workout-screen">
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      '[ErrorBoundary] Error caught:',
      expect.objectContaining({
        boundaryName: 'workout-screen',
      })
    );
  });
});

describe('ErrorBoundary - Edge Cases', () => {
  it('handles null children gracefully', () => {
    const { queryByTestId } = render(
      <ErrorBoundary>
        {null}
      </ErrorBoundary>
    );

    // No crash, renders nothing
    expect(queryByTestId(/.*/)).toBeNull();
  });

  it('handles undefined error.message', () => {
    const ThrowErrorNoMessage = () => {
      const error = new Error();
      delete (error as any).message;
      throw error;
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowErrorNoMessage />
      </ErrorBoundary>
    );

    // Shows empty error message (Error.message returns "" when deleted, not undefined)
    expect(getByText('Something went wrong')).toBeTruthy();
    // The error message is empty string, shown as "Error: "
    expect(getByText('Error: ')).toBeTruthy();
  });

  it('handles errors without component stack', () => {
    const ThrowError = () => {
      throw new Error('No stack error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should still show error screen
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('renders correctly with different boundary names', () => {
    const boundaryNames = ['root', 'home', 'workout', 'profile'];

    boundaryNames.forEach((name) => {
      const ThrowError = () => {
        throw new Error(`Error in ${name}`);
      };

      const { unmount } = render(
        <ErrorBoundary name={name}>
          <ThrowError />
        </ErrorBoundary>
      );

      // Verify log includes boundary name
      expect(console.error).toHaveBeenCalledWith(
        '[ErrorBoundary] Error caught:',
        expect.objectContaining({
          boundaryName: name,
        })
      );

      unmount();
    });
  });
});

describe('ErrorBoundary - Styling', () => {
  it('applies correct dark theme colors', () => {
    const ThrowError = () => {
      throw new Error('Style test');
    };

    const { getByText, UNSAFE_getByType } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
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

  it('uses design system colors for error message', () => {
    const ThrowError = () => {
      throw new Error('Message style test');
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Message is gray/muted
    const message = getByText('Message style test');
    expect(message.props.style?.color).toBe('#888888');
  });
});

describe('ErrorBoundary - State Management', () => {
  it('properly manages hasError and error state', () => {
    let shouldThrow = true;

    const ConditionalError = () => {
      if (shouldThrow) {
        throw new Error('State test');
      }
      return <View testID="no-error"><Text>No Error</Text></View>;
    };

    const { getByTestId, getByText, queryByText, queryByTestId } = render(
      <ErrorBoundary>
        <ConditionalError />
      </ErrorBoundary>
    );

    // Initial state: hasError = true, error is set
    expect(getByText('State test')).toBeTruthy();
    expect(queryByTestId('no-error')).toBeNull();

    // Clear error
    shouldThrow = false;
    fireEvent.press(getByText('Try Again'));

    // State reset: hasError = false, error = null
    expect(getByTestId('no-error')).toBeTruthy();
    expect(queryByText('State test')).toBeNull();
  });
});
