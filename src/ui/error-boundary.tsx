/**
 * ErrorBoundary Component
 *
 * A reusable error boundary component that catches JavaScript errors anywhere in the
 * child component tree, logs those errors, and displays a fallback UI.
 *
 * Features:
 * - Catches errors in child components via static getDerivedStateFromError
 * - Enhanced logging with component stack trace
 * - Structured error logging with [ErrorBoundary] prefix
 * - Graceful fallback UI with dark theme styling
 * - Recovery mechanism via "Try Again" button
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * TODO: Integrate with error tracking service (Sentry, Bugsnag, etc.)
 * Example:
 * ```tsx
 * import * as Sentry from '@sentry/react';
 *
 * componentDidCatch(error: Error, errorInfo: ErrorInfo) {
 *   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
 * }
 * ```
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export interface ErrorBoundaryProps {
  /** Child components to be wrapped by error boundary */
  children: ReactNode;
  /** Optional name for this error boundary instance for better logging */
  name?: string;
  /** Optional component stack from parent error boundary */
  componentStack?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorLogData {
  timestamp: string;
  errorName: string;
  errorMessage: string;
  componentStack?: string;
  boundaryName?: string;
}

/**
 * Enhanced ErrorBoundary class component with structured logging
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { name, componentStack } = this.props;

    // Build structured error data for logging
    const errorLogData: ErrorLogData = {
      timestamp: new Date().toISOString(),
      errorName: error.name,
      errorMessage: error.message,
      componentStack: errorInfo.componentStack,
      boundaryName: name,
    };

    // Enhanced logging with [ErrorBoundary] prefix
    console.error('[ErrorBoundary] Error caught:', {
      ...errorLogData,
      originalError: error,
      errorInfo,
    });

    // Log component stack separately for better readability
    if (errorInfo.componentStack) {
      console.error('[ErrorBoundary] Component stack trace:', errorInfo.componentStack);
    }

    // TODO: Send to error tracking service (Sentry, etc.)
    // Example integration:
    //
    // Step 1: Install Sentry
    // npm install @sentry/react
    //
    // Step 2: Initialize Sentry in app entry point
    // import * as Sentry from '@sentry/react';
    // Sentry.init({
    //   dsn: 'YOUR_SENTRY_DSN',
    //   environment: __DEV__ ? 'development' : 'production',
    // });
    //
    // Step 3: Uncomment and modify the code below:
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //       boundaryName: name,
    //     },
    //   },
    //   tags: {
    //     error_boundary: name || 'root',
    //     react_component: 'ErrorBoundary',
    //   },
    //   level: 'error',
    //   extra: {
    //     timestamp: errorLogData.timestamp,
    //   },
    // });
    //
    // Alternative: Bugsnag integration
    // Bugsnag.notify(error, (event) => {
    //   event.addMetadata('react', {
    //     componentStack: errorInfo.componentStack,
    //     boundaryName: name,
    //   });
    // });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return <ErrorFallback error={error} onReset={this.handleReset} />;
    }

    return children;
  }
}

/**
 * ErrorFallback Component
 *
 * Displays the error screen with:
 * - Dark theme styling matching app design system
 * - Error message (in development) or generic message (in production)
 * - Recovery button
 */
interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  // In development, show full error details
  // In production, show generic error message
  const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development';

  const errorMessage = isDev
    ? (error?.message ?? 'An unexpected error occurred')
    : 'An unexpected error occurred. Please try again.';

  const errorDetails = isDev && error ? (
    <Text style={styles.errorDetails}>
      {error.name}: {errorMessage}
    </Text>
  ) : null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Something went wrong</Text>

        <Text style={styles.message}>{errorMessage}</Text>

        {errorDetails}

        <Pressable style={styles.button} onPress={onReset}>
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    </View>
  );
};

/**
 * Styles matching the app design system
 * Colors from src/ui/theme.ts dark theme
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a', // dark bg
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    color: '#ffffff', // dark text
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: '#888888', // muted
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorDetails: {
    color: '#a1a1aa', // muted (from theme)
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'left',
    fontFamily: 'monospace',
    padding: 12,
    backgroundColor: '#18181b', // card
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a', // border
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1a1a1a', // card (from inline styles)
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333', // border (from inline styles)
  },
  buttonText: {
    color: '#ffffff', // text
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ErrorBoundary;
